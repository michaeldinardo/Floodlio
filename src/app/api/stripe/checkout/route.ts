import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect('/sign-in')

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  if (!user) return NextResponse.redirect('/onboarding')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Floodlio Brand Subscription' },
          unit_amount: 2900,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, clerkId: userId },
    success_url: `${appUrl}/dashboard?subscription=success`,
    cancel_url: `${appUrl}/pricing`,
  })

  return NextResponse.redirect(session.url!)
}
