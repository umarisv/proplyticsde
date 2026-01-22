import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27' as any,
  appInfo: {
    name: 'Proplytics',
    version: '0.1.0',
  },
})
