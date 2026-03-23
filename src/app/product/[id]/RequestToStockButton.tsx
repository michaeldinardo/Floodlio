'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Package, Loader2 } from 'lucide-react'

export default function RequestToStockButton({ product }: { product: any }) {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRequest = async () => {
    if (!isSignedIn) { router.push('/sign-in'); return }
    if (!message.trim()) return

    setLoading(true)
    try {
      const { data: barUser } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', user.id)
        .single()

      if (!barUser || barUser.user_type !== 'bar') {
        alert('Only bar accounts can request products.')
        setLoading(false)
        return
      }

      const { error: reqError } = await supabase
        .from('requests')
        .insert({
          bar_id: barUser.id,
          brand_id: product.brand_id,
          product_id: product.id,
          message,
          quantity_interest: quantity || null,
          status: 'pending',
        })

      if (reqError) throw reqError

      // Create or find conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('brand_id', product.brand_id)
        .eq('bar_id', barUser.id)
        .single()

      if (!existingConv) {
        await supabase
          .from('conversations')
          .insert({ brand_id: product.brand_id, bar_id: barUser.id })
      }

      setSuccess(true)
      setOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 text-center">
        <div className="text-green-400 font-semibold">✓ Request Sent!</div>
        <p className="text-gray-400 text-sm mt-1">The brand will be in touch soon.</p>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => isSignedIn ? setOpen(true) : router.push('/sign-in')}
        className="btn-gold w-full flex items-center justify-center gap-2 text-lg py-4"
      >
        <Package size={20} />
        Request to Stock
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Request to Stock</h3>
            <p className="text-gray-400 text-sm mb-4">Tell {product.brand?.business_name} why you want to carry {product.name}.</p>
            <div className="space-y-4">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us about your bar and why you're interested..."
                rows={4}
                className="input-dark resize-none"
              />
              <input
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="Estimated quantity interest (optional)"
                className="input-dark"
              />
              <div className="flex gap-3">
                <button onClick={() => setOpen(false)} className="btn-outline-gold flex-1">Cancel</button>
                <button onClick={handleRequest} disabled={loading || !message.trim()} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
