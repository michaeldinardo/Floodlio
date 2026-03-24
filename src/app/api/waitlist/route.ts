import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  const { email, business_name, city } = await req.json()

  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  if (business_name && business_name.length > 200) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (city && city.length > 100) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Basic rate limit: max 3 signups from same IP in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabaseAdmin
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', oneHourAgo)

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { error: dbError } = await supabaseAdmin.from('waitlist').insert({
    email,
    business_name: business_name || null,
    city: city || null,
    ip,
  })

  if (dbError) {
    if (dbError.code === '23505') {
      return NextResponse.json({ error: 'already_on_list' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  try {
    // Send confirmation to the bar
    await resend.emails.send({
      from: 'Floodlio <waitlist@floodlio.com>',
      to: email,
      subject: "You're on the Floodlio waitlist!",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>You're on the list! 🎉</h2>
          <p>Hey${business_name ? ` ${business_name}` : ''},</p>
          <p>Thanks for joining the Floodlio waitlist. We'll reach out as soon as bar accounts open up in${city ? ` ${city}` : ' your area'}.</p>
          <p>— The Floodlio Team</p>
        </div>
      `,
    })

    // Notify the owner
    await resend.emails.send({
      from: 'Floodlio <waitlist@floodlio.com>',
      to: 'mjdautomationsolutions@gmail.com',
      subject: `New waitlist signup: ${business_name || email}`,
      html: `
        <div style="font-family: sans-serif;">
          <h3>New waitlist signup</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Business:</strong> ${business_name || '—'}</p>
          <p><strong>City:</strong> ${city || '—'}</p>
        </div>
      `,
    })
  } catch (emailError) {
    console.error('Email send failed:', emailError)
  }

  return NextResponse.json({ success: true })
}
