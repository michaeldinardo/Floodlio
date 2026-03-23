'use client'
import { useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, business_name: businessName, city }),
    })

    if (res.ok) {
      setSuccess(true)
    } else {
      const data = await res.json()
      if (data.error === 'already_on_list') {
        setError("You're already on the waitlist!")
      } else {
        setError('Something went wrong. Please try again.')
      }
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <CheckCircle size={48} className="text-[#D4AF37]" />
        <h3 className="text-xl font-bold">You&apos;re on the list!</h3>
        <p className="text-gray-400 text-sm">We&apos;ll reach out when bar accounts open up.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email address *"
        className="input-dark"
      />
      <input
        type="text"
        value={businessName}
        onChange={e => setBusinessName(e.target.value)}
        placeholder="Bar / Restaurant name (optional)"
        className="input-dark"
      />
      <input
        type="text"
        value={city}
        onChange={e => setCity(e.target.value)}
        placeholder="City (optional)"
        className="input-dark"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !email}
        className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Join the Waitlist'}
      </button>
    </form>
  )
}
