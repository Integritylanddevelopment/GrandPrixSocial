import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

// Partner-specific configurations
const partnerConfigs = {
  gpbox: {
    name: 'TheGPBox',
    commissionRate: 0.04, // 4%
    apiEndpoint: 'https://api.thegpbox.com/affiliate',
    requiresAuth: true
  },
  f1store: {
    name: 'F1 Official Store',
    commissionRate: 0.05, // 5%
    apiEndpoint: 'https://api.f1store.formula1.com/affiliate',
    requiresAuth: true
  },
  fueller: {
    name: 'Fueller',
    commissionRate: 0.04, // TBD - estimated
    apiEndpoint: null, // Direct contact needed
    requiresAuth: false
  },
  fuelforfans: {
    name: 'Fuel For Fans',
    commissionRate: 0.04, // TBD - estimated
    apiEndpoint: null, // Direct contact needed
    requiresAuth: false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      productId, 
      quantity, 
      partner, 
      affiliateUrl, 
      totalAmount,
      customerInfo,
      paymentMethodId 
    } = body

    const supabase = await createClient()
    const config = partnerConfigs[partner as keyof typeof partnerConfigs]

    if (!config) {
      return NextResponse.json({ error: 'Invalid partner' }, { status: 400 })
    }

    // Step 1: Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
      metadata: {
        productId,
        partner,
        quantity: quantity.toString(),
        affiliateUrl
      }
    })

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ 
        error: 'Payment failed',
        paymentIntent: paymentIntent
      }, { status: 400 })
    }

    // Step 2: Record the order in our database
    const { data: order, error: orderError } = await supabase
      .from('affiliate_orders')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        product_id: productId,
        partner: partner,
        quantity: quantity,
        total_amount: totalAmount,
        commission_rate: config.commissionRate,
        commission_amount: totalAmount * config.commissionRate,
        affiliate_url: affiliateUrl,
        order_status: 'paid',
        customer_email: customerInfo?.email || paymentIntent.receipt_email
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order record:', orderError)
      // Payment succeeded but order recording failed - need to handle this
    }

    // Step 3: Notify partner (if they have API integration)
    let partnerOrderId = null
    if (config.apiEndpoint && config.requiresAuth) {
      try {
        partnerOrderId = await notifyPartner(config, {
          orderId: order?.id,
          productId,
          quantity,
          totalAmount,
          affiliateUrl,
          customerInfo
        })
      } catch (error) {
        console.error(`Failed to notify ${config.name}:`, error)
        // Continue - we can handle this asynchronously
      }
    }

    // Step 4: Update order with partner confirmation
    if (partnerOrderId && order) {
      await supabase
        .from('affiliate_orders')
        .update({ 
          partner_order_id: partnerOrderId,
          order_status: 'confirmed'
        })
        .eq('id', order.id)
    }

    // Step 5: Track conversion for affiliate reporting
    await supabase
      .from('affiliate_conversions')
      .insert({
        order_id: order?.id,
        product_id: productId,
        partner: partner,
        order_total: totalAmount,
        commission_amount: totalAmount * config.commissionRate,
        converted_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      orderId: order?.id,
      paymentIntentId: paymentIntent.id,
      partnerOrderId,
      commissionEarned: totalAmount * config.commissionRate,
      message: 'Purchase completed successfully!'
    })

  } catch (error) {
    console.error('Error processing embedded checkout:', error)
    return NextResponse.json({ 
      error: 'Checkout failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Function to notify partners about orders
async function notifyPartner(config: any, orderData: any): Promise<string | null> {
  if (!config.apiEndpoint) return null

  try {
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env[`${config.name.toUpperCase()}_API_KEY`]}`,
        'X-Affiliate-ID': process.env[`${config.name.toUpperCase()}_AFFILIATE_ID`]
      },
      body: JSON.stringify({
        orderId: orderData.orderId,
        productId: orderData.productId,
        quantity: orderData.quantity,
        totalAmount: orderData.totalAmount,
        affiliateUrl: orderData.affiliateUrl,
        customerInfo: orderData.customerInfo,
        source: 'grandprix-social'
      })
    })

    if (!response.ok) {
      throw new Error(`Partner API responded with ${response.status}`)
    }

    const result = await response.json()
    return result.partnerOrderId || result.orderId || null

  } catch (error) {
    console.error('Partner notification failed:', error)
    throw error
  }
}

// GET endpoint to check order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const paymentIntentId = searchParams.get('paymentIntentId')

    if (!orderId && !paymentIntentId) {
      return NextResponse.json({ error: 'Order ID or Payment Intent ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    let query = supabase
      .from('affiliate_orders')
      .select('*')

    if (orderId) {
      query = query.eq('id', orderId)
    } else if (paymentIntentId) {
      query = query.eq('stripe_payment_intent_id', paymentIntentId)
    }

    const { data: order, error } = await query.single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check Stripe payment status
    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id)

    return NextResponse.json({
      order: order,
      paymentStatus: paymentIntent.status,
      paymentIntent: paymentIntent
    })

  } catch (error) {
    console.error('Error checking order status:', error)
    return NextResponse.json({ error: 'Failed to check order status' }, { status: 500 })
  }
}