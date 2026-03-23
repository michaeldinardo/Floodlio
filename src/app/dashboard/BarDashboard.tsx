'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'
import { Star, MessageCircle, Package, Check, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import ProductCard from '@/components/ProductCard'

export default function BarDashboard({ user }: { user: User }) {
  const [savedProducts, setSavedProducts] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'saved' | 'requests' | 'messages'>('saved')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user.id])

  async function fetchData() {
    setLoading(true)
    const [{ data: saved }, { data: reqs }] = await Promise.all([
      supabase.from('saved_products').select('*, product:products(*, brand:users!products_brand_id_fkey(*))').eq('bar_id', user.id).order('created_at', { ascending: false }),
      supabase.from('requests').select('*, product:products(*), brand:users!requests_brand_id_fkey(*)').eq('bar_id', user.id).order('created_at', { ascending: false }),
    ])
    setSavedProducts(saved || [])
    setRequests(reqs || [])
    setLoading(false)
  }

  const unsaveProduct = async (savedId: string) => {
    await supabase.from('saved_products').delete().eq('id', savedId)
    setSavedProducts(s => s.filter(sp => sp.id !== savedId))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{user.business_name}</h1>
          <p className="text-gray-500 mt-1">{user.city}, {user.state}</p>
        </div>
        <Link href="/explore" className="btn-gold">Explore Products</Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Saved', value: savedProducts.length, icon: Star },
          { label: 'Requests Sent', value: requests.length, icon: Package },
          { label: 'Accepted', value: requests.filter(r => r.status === 'accepted').length, icon: Check },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card text-center">
            <Icon size={24} className="text-[#D4AF37] mx-auto mb-2" />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-gray-500 text-sm">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-[#111111] rounded-lg p-1 mb-6 w-fit">
        {(['saved', 'requests', 'messages'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#D4AF37]" /></div>
      ) : (
        <>
          {activeTab === 'saved' && (
            savedProducts.length === 0 ? (
              <div className="card text-center py-20">
                <Star size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-2">No saved products</h3>
                <p className="text-gray-500 mb-6">Save products you&apos;re interested in stocking.</p>
                <Link href="/explore" className="btn-gold">Explore Products</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProducts.map(sp => (
                  <div key={sp.id} className="relative">
                    <button onClick={() => unsaveProduct(sp.id)} className="absolute top-4 right-4 z-10 bg-black/60 rounded-full p-1 text-[#D4AF37] hover:text-white">
                      <Star size={16} fill="currentColor" />
                    </button>
                    <ProductCard product={sp.product} />
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'requests' && (
            requests.length === 0 ? (
              <div className="card text-center py-20">
                <Package size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-2">No requests yet</h3>
                <p className="text-gray-500">Your stocking requests will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="card">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{req.product?.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : req.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">Brand: {req.brand?.business_name}</p>
                        <p className="text-gray-300 text-sm mt-1">{req.message}</p>
                        <p className="text-gray-600 text-xs mt-2">{formatDate(req.created_at)}</p>
                      </div>
                      <Link href="/messages" className="flex items-center gap-1 text-[#D4AF37] text-sm hover:text-white self-start">
                        <MessageCircle size={16} /> Message Brand
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
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
    </div>
  )
}
