import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import WaitlistForm from '@/components/WaitlistForm'
import { Search, ArrowRight, Tag, Inbox, MessageSquare, Bookmark, Send } from 'lucide-react'

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
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      <Navbar theme="light" />

      {/* Hero */}
      <section className="pt-36 pb-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#D4AF3708_0%,_transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">

          <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-2 text-[#D4AF37] text-xs tracking-widest uppercase mb-10 font-medium">
            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse" />
            The beverage industry marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight tracking-tight text-[#0a0a0a]">
            Connect Brands
            <br />
            <span className="font-semibold text-[#D4AF37]">with Bars</span>
          </h1>

          <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Floodlio connects beverage brands with bars and restaurants looking for their next signature product.
          </p>

<div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link href="/explore" className="btn-gold text-base py-4 px-8 flex items-center gap-2 justify-center">
              Explore Products <ArrowRight size={18} />
            </Link>
            <Link href="/pricing" className="btn-outline-dark text-base py-4 px-8">
              List Your Brand
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <Link href="/explore" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 hover:border-[#D4AF37]/50 transition-colors group shadow-sm">
              <Search size={18} className="text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
              <span className="text-gray-400 group-hover:text-gray-500 transition-colors text-sm">Search beers, wines, spirits...</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs tracking-widest uppercase text-[#D4AF37] font-medium mb-2">Curated Selection</p>
                <h2 className="text-3xl font-light text-[#0a0a0a] tracking-tight">Featured Products</h2>
              </div>
              <Link href="/explore" className="text-gray-400 hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-sm">
                View all <ArrowRight size={15} />
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
      <section className="py-24 px-4 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-widest uppercase text-[#D4AF37] font-medium mb-2">The Process</p>
            <h2 className="text-3xl font-light text-[#0a0a0a] tracking-tight">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-20">

            {/* For Brands */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="h-px flex-1 bg-gray-200" />
                <h3 className="text-xs tracking-widest uppercase text-gray-400 font-medium">For Brands</h3>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="space-y-8">
                {[
                  { icon: Tag, step: '01', title: 'List Your Products', desc: 'Upload your portfolio with photos, details, and pricing.' },
                  { icon: Inbox, step: '02', title: 'Receive Requests', desc: 'Bars send you stocking requests with their interest details.' },
                  { icon: MessageSquare, step: '03', title: 'Connect & Close', desc: 'Message bars directly to negotiate and finalize deals.' },
                ].map(({ icon: Icon, step, title, desc }) => (
                  <div key={step} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center">
                      <Icon size={16} className="text-[#D4AF37]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#D4AF37] font-medium tracking-widest">{step}</span>
                      <h4 className="font-medium text-[#0a0a0a] mt-0.5 mb-1">{title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Bars */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="h-px flex-1 bg-gray-200" />
                <h3 className="text-xs tracking-widest uppercase text-gray-400 font-medium">For Bars</h3>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="space-y-8">
                {[
                  { icon: Search, step: '01', title: 'Discover Products', desc: 'Browse thousands of craft and commercial beverages.' },
                  { icon: Bookmark, step: '02', title: 'Save Favorites', desc: 'Bookmark products you love to revisit later.' },
                  { icon: Send, step: '03', title: 'Request to Stock', desc: 'Send stocking requests directly to brands you want.' },
                ].map(({ icon: Icon, step, title, desc }) => (
                  <div key={step} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center">
                      <Icon size={16} className="text-[#D4AF37]" />
                    </div>
                    <div>
                      <span className="text-xs text-[#D4AF37] font-medium tracking-widest">{step}</span>
                      <h4 className="font-medium text-[#0a0a0a] mt-0.5 mb-1">{title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      {/* Bar Waitlist */}
      <section className="py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs tracking-widest uppercase text-[#D4AF37] font-medium mb-3">Early Access</p>
          <h2 className="text-3xl md:text-4xl font-light text-[#0a0a0a] tracking-tight mb-4">Join the Bar Waitlist</h2>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Bar accounts are opening soon. Get early access to discover and connect with brands before anyone else.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-widest uppercase text-[#D4AF37] font-medium mb-4">Get Started</p>
          <h2 className="text-4xl font-light text-white tracking-tight mb-6">Ready to get started?</h2>
          <p className="text-gray-500 text-lg mb-12 font-light">Join hundreds of brands and bars already on Floodlio.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="btn-gold text-base py-4 px-8">
              Create Free Account
            </Link>
            <Link href="/explore" className="btn-outline-gold text-base py-4 px-8">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-[#0a0a0a]">floodlio</span>
            <span className="text-gray-300 text-sm">© 2025</span>
          </div>
          <div className="flex gap-8 text-gray-400 text-sm">
            <Link href="/explore" className="hover:text-[#0a0a0a] transition-colors">Explore</Link>
            <Link href="/pricing" className="hover:text-[#0a0a0a] transition-colors">Pricing</Link>
            <Link href="/sign-up" className="hover:text-[#0a0a0a] transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
