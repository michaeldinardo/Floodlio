import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { Search, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getFeaturedProducts() {
  const { data } = await supabase
    .from('products')
    .select('*, brand:users!products_brand_id_fkey(business_name, city, state)')
    .eq('is_featured', true)
    .limit(6)
  return data || []
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full px-4 py-2 text-[#D4AF37] text-sm mb-8">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
            The beverage industry marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Connect Brands
            <br />
            <span className="text-[#D4AF37]">with Bars</span>
          </h1>
          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
            Floodlio connects beverage brands with bars and restaurants looking for their next signature product.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/explore" className="btn-gold text-lg py-4 px-8 flex items-center gap-2 justify-center">
              Explore Products <ArrowRight size={20} />
            </Link>
            <Link href="/pricing" className="btn-outline-gold text-lg py-4 px-8">
              List Your Brand
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <Link href="/explore" className="flex items-center gap-3 bg-[#111111] border border-[#333333] rounded-xl px-5 py-4 hover:border-[#D4AF37]/50 transition-colors group">
              <Search size={20} className="text-gray-500 group-hover:text-[#D4AF37] transition-colors" />
              <span className="text-gray-500 group-hover:text-gray-400 transition-colors">Search beers, wines, spirits...</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '500+', label: 'Products Listed' },
              { value: '200+', label: 'Active Brands' },
              { value: '1,000+', label: 'Bars Connected' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37]">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <p className="text-gray-500 mt-1">Hand-picked by our team</p>
              </div>
              <Link href="/explore" className="text-[#D4AF37] hover:text-white transition-colors flex items-center gap-1 text-sm">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 px-4 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-500">Simple, powerful, effective</p>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-xl font-bold text-[#D4AF37] mb-8">For Brands</h3>
              <div className="space-y-6">
                {[
                  { icon: '🏷️', title: 'List Your Products', desc: 'Upload your portfolio with photos, details, and pricing.' },
                  { icon: '📬', title: 'Receive Requests', desc: 'Bars send you stocking requests with their interest details.' },
                  { icon: '💬', title: 'Connect & Close', desc: 'Message bars directly to negotiate and finalize deals.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 text-2xl">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                      <p className="text-gray-500 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#D4AF37] mb-8">For Bars</h3>
              <div className="space-y-6">
                {[
                  { icon: '🔍', title: 'Discover Products', desc: 'Browse thousands of craft and commercial beverages.' },
                  { icon: '⭐', title: 'Save Favorites', desc: 'Bookmark products you love to revisit later.' },
                  { icon: '🤝', title: 'Request to Stock', desc: 'Send stocking requests directly to brands you want.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 text-2xl">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                      <p className="text-gray-500 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-gray-400 text-lg mb-10">Join hundreds of brands and bars already on Floodlio.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="btn-gold text-lg py-4 px-8">
              Create Free Account
            </Link>
            <Link href="/explore" className="btn-outline-gold text-lg py-4 px-8">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">floodlio</span>
            <span className="text-gray-600 text-sm">© 2024</span>
          </div>
          <div className="flex gap-8 text-gray-500 text-sm">
            <Link href="/explore" className="hover:text-white">Explore</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/sign-up" className="hover:text-white">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
