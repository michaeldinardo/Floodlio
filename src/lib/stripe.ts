import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const BRAND_SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_placeholder'
export const SUBSCRIPTION_AMOUNT = 2900 // $29.00 in cents
