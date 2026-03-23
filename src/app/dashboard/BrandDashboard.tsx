'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { User, Product, Request } from '@/types'
import { Plus, Package, MessageCircle, TrendingUp, Check, X, Clock, Loader2, CreditCard } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { SUBCATEGORIES, CATEGORIES, AVAILABILITY_OPTIONS } from '@/types'

export default function BrandDashboard({ user }: { user: User }) {
  const [products, setProducts] = useState<Product[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'messages'>('listings')
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [user.id])

  async function fetchData() {
    setLoading(true)
    const [{ data: prods }, { data: reqs }, { data: sub }] = await Promise.all([
      supabase.from('products').select('*').eq('brand_id', user.id).order('created_at', { ascending: false }),
      supabase.from('requests').select('*, product:products(*), bar:users!requests_bar_id_fkey(*)').eq('brand_id', user.id).order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*').eq('brand_id', user.id).single(),
    ])
    setProducts(prods || [])
    setRequests(reqs || [])
    setSubscription(sub)
    setLoading(false)
  }

  const updateRequestStatus = async (reqId: string, status: 'accepted' | 'declined') => {
    await supabase.from('requests').update({ status }).eq('id', reqId)
    setRequests(r => r.map(req => req.id === reqId ? { ...req, status } : req))
  }

  const isSubscribed = subscription?.status === 'active'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{user.business_name}</h1>
          <p className="text-gray-500 mt-1">{user.city}, {user.state}</p>
        </div>
        <div className="flex gap-3">
          {isSubscribed ? (
            <button onClick={() => setShowProductForm(true)} className="btn-gold flex items-center gap-2">
              <Plus size={18} /> Add Product
            </button>
          ) : (
            <Link href="/pricing" className="btn-gold flex items-center gap-2">
              <CreditCard size={18} /> Subscribe — View Plans
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Products', value: products.length, icon: Package },
          { label: 'Total Requests', value: requests.length, icon: TrendingUp },
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, icon: Clock },
          { label: 'Accepted', value: requests.filter(r => r.status === 'accepted').length, icon: Check },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card text-center">
            <Icon size={24} className="text-[#D4AF37] mx-auto mb-2" />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-gray-500 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {!isSubscribed && (
        <div className="card border-[#D4AF37]/50 bg-[#D4AF37]/5 mb-8 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#D4AF37]">Activate Your Subscription</h3>
            <p className="text-gray-400 text-sm mt-1">Subscribe from $49.99/mo to list products and receive bar requests.</p>
          </div>
          <Link href="/pricing" className="btn-gold flex-shrink-0">View Plans</Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111111] rounded-lg p-1 mb-6 w-fit">
        {(['listings', 'requests', 'messages'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            {tab}
            {tab === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#D4AF37]" /></div>
      ) : (
        <>
          {activeTab === 'listings' && (
            <div>
              {products.length === 0 ? (
                <div className="card text-center py-20">
                  <Package size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-2">No products yet</h3>
                  <p className="text-gray-500 mb-6">{isSubscribed ? 'Add your first product to get started.' : 'Subscribe to start listing products.'}</p>
                  {isSubscribed && <button onClick={() => setShowProductForm(true)} className="btn-gold">Add Your First Product</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="card hover:border-[#D4AF37]/30 transition-colors">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.image_url ? <Image src={product.image_url} alt={product.name} width={64} height={64} className="object-cover" /> : <span className="text-2xl">🍾</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{product.name}</h4>
                          <p className="text-gray-500 text-sm">{product.category} · {product.subcategory}</p>
                          <p className="text-[#D4AF37] text-sm">{product.availability}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="card text-center py-20">
                  <MessageCircle size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-2">No requests yet</h3>
                  <p className="text-gray-500">Bars will appear here when they request your products.</p>
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="card">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{(req as any).bar?.business_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : req.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">Re: {(req as any).product?.name}</p>
                        <p className="text-gray-300 text-sm">{req.message}</p>
                        {req.quantity_interest && <p className="text-gray-500 text-sm mt-1">Quantity: {req.quantity_interest}</p>}
                        <p className="text-gray-600 text-xs mt-2">{formatDate(req.created_at)}</p>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => updateRequestStatus(req.id, 'accepted')} className="flex items-center gap-1 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-sm hover:bg-green-500/30">
                            <Check size={14} /> Accept
                          </button>
                          <button onClick={() => updateRequestStatus(req.id, 'declined')} className="flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/30">
                            <X size={14} /> Decline
                          </button>
                          <Link href="/messages" className="flex items-center gap-1 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg text-sm hover:bg-[#D4AF37]/30">
                            <MessageCircle size={14} /> Message
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="card text-center py-20">
              <MessageCircle size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">Messages</h3>
              <Link href="/messages" className="btn-gold">Open Messages</Link>
            </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      {showProductForm && <ProductFormModal userId={user.id} onClose={() => setShowProductForm(false)} onSave={() => { setShowProductForm(false); fetchData() }} />}
    </div>
  )
}

function ProductFormModal({ userId, onClose, onSave }: { userId: string, onClose: () => void, onSave: () => void }) {
  const [form, setForm] = useState({
    name: '', category: 'Beer', subcategory: 'IPA', abv: '', price_min: '', price_max: '', description: '', availability: 'Regional', is_featured: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name || !form.abv) { setError('Name and ABV are required.'); return }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from('products').insert({
        brand_id: userId,
        name: form.name,
        category: form.category,
        subcategory: form.subcategory,
        abv: parseFloat(form.abv),
        price_min: form.price_min ? parseFloat(form.price_min) : null,
        price_max: form.price_max ? parseFloat(form.price_max) : null,
        description: form.description,
        availability: form.availability,
        is_featured: form.is_featured,
      })
      if (err) throw err
      onSave()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Add Product</h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Product Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Pacific Hazy IPA" className="input-dark" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: SUBCATEGORIES[e.target.value][0] }))} className="input-dark">
                {CATEGORIES.map((c: string) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Subcategory</label>
              <select value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} className="input-dark">
                {SUBCATEGORIES[form.category]?.map((s: string) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">ABV % *</label>
              <input type="number" min="0" max="100" step="0.1" value={form.abv} onChange={e => setForm(f => ({ ...f, abv: e.target.value }))} placeholder="5.5" className="input-dark" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Price Min ($)</label>
              <input type="number" value={form.price_min} onChange={e => setForm(f => ({ ...f, price_min: e.target.value }))} placeholder="12" className="input-dark" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Price Max ($)</label>
              <input type="number" value={form.price_max} onChange={e => setForm(f => ({ ...f, price_max: e.target.value }))} placeholder="18" className="input-dark" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Availability</label>
            <select value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))} className="input-dark">
              {AVAILABILITY_OPTIONS.map((a: string) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe your product..." className="input-dark resize-none" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline-gold flex-1">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-gold flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
