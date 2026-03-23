import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import RequestToStockButton from './RequestToStockButton'
import { MapPin, Package, Percent, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getProduct(id: string) {
  const { data } = await supabase
    .from('products')
    .select('*, brand:users!products_brand_id_fkey(*)')
    .eq('id', id)
    .single()
  return data
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-square bg-[#111111] rounded-2xl overflow-hidden border border-[#222222]">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🍾</div>
            )}
            {product.is_featured && (
              <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-sm font-bold px-3 py-1 rounded-full">
                ⭐ Featured
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#D4AF37] text-sm">{product.category}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-500 text-sm">{product.subcategory}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{product.name}</h1>
              {product.brand && (
                <Link href={`/brand/${product.brand_id}`} className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                  by {product.brand.business_name}
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Percent, label: 'ABV', value: `${product.abv}%` },
                { icon: MapPin, label: 'Availability', value: product.availability },
                ...(product.price_min ? [{ icon: DollarSign, label: 'Price Range', value: `$${product.price_min}${product.price_max ? `–$${product.price_max}` : ''}` }] : []),
                ...(product.brand ? [{ icon: Package, label: 'Location', value: `${product.brand.city}, ${product.brand.state}` }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="card p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Icon size={14} />
                    {label}
                  </div>
                  <div className="text-white font-medium">{value}</div>
                </div>
              ))}
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-400 text-sm uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{product.description}</p>
              </div>
            )}

            <RequestToStockButton product={product} />

            {product.brand && (
              <div className="card p-4">
                <h3 className="font-semibold mb-3">About the Brand</h3>
                <div className="flex items-center gap-3">
                  {product.brand.logo_url ? (
                    <Image src={product.brand.logo_url} alt={product.brand.business_name} width={48} height={48} className="rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
                      {product.brand.business_name[0]}
                    </div>
                  )}
                  <div>
                    <Link href={`/brand/${product.brand_id}`} className="font-medium hover:text-[#D4AF37] transition-colors">
                      {product.brand.business_name}
                    </Link>
                    <p className="text-gray-500 text-sm">{product.brand.city}, {product.brand.state}</p>
                  </div>
                </div>
                {product.brand.description && (
                  <p className="text-gray-400 text-sm mt-3">{product.brand.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
