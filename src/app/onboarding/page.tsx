'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { US_STATES } from '@/types'
import { Loader2, Zap } from 'lucide-react'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<'brand' | 'bar' | null>(null)
  const [form, setForm] = useState({ business_name: '', city: '', state: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  // If user already has a profile, redirect to dashboard
  useEffect(() => {
    if (!isLoaded || !user) return
    supabase.from('users').select('id').eq('clerk_id', user.id).single().then(({ data }) => {
      if (data) router.replace('/dashboard')
      else setChecking(false)
    })
  }, [isLoaded, user, router])

  const handleSubmit = async () => {
    if (!user || !userType || !form.business_name || !form.city || !form.state) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase
        .from('users')
        .upsert({
          clerk_id: user.id,
          user_type: userType,
          business_name: form.business_name,
          city: form.city,
          state: form.state,
          description: form.description || null,
        }, { onConflict: 'clerk_id' })

      if (err) throw err
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || checking) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#D4AF37]" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-black" fill="black" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to Floodlio</h1>
          <p className="text-gray-500 mt-2">Let&apos;s get your account set up</p>
        </div>

        {step === 1 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">I am a...</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { type: 'brand' as const, emoji: '🏷️', title: 'Brand', desc: 'I sell beverages and want to connect with bars' },
                { type: 'bar' as const, emoji: '🍺', title: 'Bar / Restaurant', desc: 'I want to discover and stock new beverages' },
              ].map(({ type, emoji, title, desc }) => (
                <button
                  key={type}
                  onClick={() => setUserType(type)}
                  className={`p-4 rounded-xl border-2 transition-colors text-left ${userType === type ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333333] hover:border-[#444444]'}`}
                >
                  <div className="text-3xl mb-2">{emoji}</div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-gray-500 text-xs mt-1">{desc}</div>
                </button>
              ))}
            </div>
            <button
              disabled={!userType}
              onClick={() => setStep(2)}
              className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Your Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  {userType === 'brand' ? 'Brand Name' : 'Bar / Restaurant Name'} *
                </label>
                <input
                  value={form.business_name}
                  onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                  placeholder={userType === 'brand' ? 'e.g. Pacific Coast Brewing Co.' : 'e.g. The Golden Tap'}
                  className="input-dark"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">City *</label>
                  <input
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="e.g. San Francisco"
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">State *</label>
                  <select
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    className="input-dark"
                  >
                    <option value="">Select state</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder={userType === 'brand' ? 'Tell bars about your brand...' : 'Tell brands about your bar...'}
                  rows={3}
                  className="input-dark resize-none"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline-gold flex-1">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Complete Setup'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
