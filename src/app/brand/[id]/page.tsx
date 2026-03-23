import { notFound } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { MapPin, Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getBrandAndProducts(id: string) {
  const [{ data: brand }, { data: products }] = await Promise.all([
    supabase.from('users').select('*').eq('id', id).eq('user_type', 'brand').single(),
    supabase.from('products').select('*').eq('brand_id', id).order('created_at', { ascending: false }),
  ])
  return { brand, products: products || [] }
}

export default async function BrandPage({ params }: { params: { id: string } }) {
  const { brand, products } = await getBrandAndProducts(params.id)
  if (!brand) notFound()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        {/* Brand Header */}
        <div className="card mb-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center text-4xl font-bold text-[#D4AF37] flex-shrink-0 overflow-hidden">
              {brand.logo_url ? (
                <Image src={brand.logo_url} alt={brand.business_name} width={96} height={96} className="object-cover" />
              ) : (
                brand.business_name[0]
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{brand.business_name}</h1>
              <div className="flex items-center gap-1 text-gray-500 mb-3">
                <MapPin size={16} />
                <span>{brand.city}, {brand.state}</span>
              </div>
              {brand.description && <p className="text-gray-400">{brand.description}</p>}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D4AF37]">{products.length}</div>
              <div className="text-gray-500 text-sm flex items-center gap-1"><Package size={14} /> Products</div>
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="text-2xl font-bold mb-6">Products</h2>
        {products.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="text-5xl mb-4">🍾</div>
            <p className="text-gray-500">No products listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={{ ...product, brand }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
