import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, partner, affiliateUrl, userId, timestamp } = body

    const supabase = await createClient()

    // Track the affiliate click for commission purposes
    const { data, error } = await supabase
      .from('affiliate_clicks')
      .insert({
        product_id: productId,
        partner: partner,
        affiliate_url: affiliateUrl,
        user_id: userId,
        clicked_at: timestamp,
        ip_address: request.ip || request.headers.get('x-forwarded-for'),
        user_agent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer')
      })
      .select()

    if (error) {
      console.error('Error tracking affiliate click:', error)
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
    }

    // Generate tracking pixel or redirect URL for partner attribution
    const trackingData = {
      clickId: data[0].id,
      partner: partner,
      productId: productId,
      timestamp: timestamp
    }

    return NextResponse.json({ 
      success: true, 
      clickId: data[0].id,
      trackingData 
    })

  } catch (error) {
    console.error('Error in affiliate tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to retrieve affiliate statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partner = searchParams.get('partner')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const supabase = await createClient()

    let query = supabase
      .from('affiliate_clicks')
      .select(`
        *,
        affiliate_conversions (
          id,
          order_total,
          commission_amount,
          converted_at
        )
      `)

    if (partner) {
      query = query.eq('partner', partner)
    }

    if (dateFrom) {
      query = query.gte('clicked_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('clicked_at', dateTo)
    }

    const { data, error } = await query.order('clicked_at', { ascending: false })

    if (error) {
      console.error('Error fetching affiliate stats:', error)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // Calculate statistics
    const stats = {
      totalClicks: data.length,
      totalConversions: data.filter(click => click.affiliate_conversions.length > 0).length,
      totalCommission: data.reduce((sum, click) => {
        return sum + click.affiliate_conversions.reduce((convSum: number, conv: any) => {
          return convSum + (conv.commission_amount || 0)
        }, 0)
      }, 0),
      conversionRate: data.length > 0 ? 
        (data.filter(click => click.affiliate_conversions.length > 0).length / data.length * 100).toFixed(2) : 
        0,
      partnerBreakdown: {}
    }

    return NextResponse.json({ stats, clicks: data })

  } catch (error) {
    console.error('Error fetching affiliate stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}