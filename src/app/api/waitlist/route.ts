import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, business_name, city } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const { error: dbError } = await supabaseAdmin.from('waitlist').insert({
    email,
    business_name: business_name || null,
    city: city || null,
  })

  if (dbError) {
    if (dbError.code === '23505') {
      return NextResponse.json({ error: 'already_on_list' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

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

  return NextResponse.json({ success: true })
}
