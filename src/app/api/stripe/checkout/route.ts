import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

const PLANS = {
  monthly: {
    unit_amount: 4999,
    interval: 'month' as const,
    name: 'Floodlio Brand — Monthly',
  },
  yearly: {
    unit_amount: 44999,
    interval: 'year' as const,
    name: 'Floodlio Brand — Annual',
  },
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  if (!user) return NextResponse.redirect(new URL('/onboarding', req.url))

  const plan = req.nextUrl.searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly'
  const selectedPlan = PLANS[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: selectedPlan.name },
          unit_amount: selectedPlan.unit_amount,
          recurring: { interval: selectedPlan.interval },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, clerkId: userId, plan },
    success_url: `${appUrl}/dashboard?subscription=success`,
    cancel_url: `${appUrl}/pricing`,
  })

  return NextResponse.redirect(session.url!)
}
