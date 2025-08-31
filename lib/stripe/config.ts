/**
 * Stripe Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Add your Stripe keys to .env.local:
 *    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
 *    STRIPE_SECRET_KEY=sk_test_...
 *    STRIPE_WEBHOOK_SECRET=whsec_...
 * 
 * 2. Uncomment the Stripe import below
 * 3. Set STRIPE_ENABLED to true
 */

// Uncomment when Stripe keys are available:
// import Stripe from 'stripe'

export const STRIPE_ENABLED = false

export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'usd',
  enabled: STRIPE_ENABLED && !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Stripe client (uncomment when ready)
/*
export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
})
*/

// Mock Stripe client for development
export const stripe = {
  paymentIntents: {
    create: async (params: any) => ({
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret_mock`,
      status: 'requires_payment_method',
      amount: params.amount,
      currency: params.currency || 'usd',
      created: Math.floor(Date.now() / 1000)
    }),
    confirm: async (id: string, params: any) => ({
      id,
      status: 'succeeded',
      amount_received: 2999,
      currency: 'usd',
      confirmed_at: Math.floor(Date.now() / 1000)
    }),
    retrieve: async (id: string) => ({
      id,
      status: 'succeeded',
      amount: 2999,
      currency: 'usd',
      created: Math.floor(Date.now() / 1000) - 3600
    })
  }
}

export default stripeConfig