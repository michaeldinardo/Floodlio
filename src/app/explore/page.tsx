'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'
import { CATEGORIES, SUBCATEGORIES, AVAILABILITY_OPTIONS } from '@/types'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ExplorePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [availability, setAvailability] = useState('')
  const [abvMin, setAbvMin] = useState(0)
  const [abvMax, setAbvMax] = useState(100)
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(1000)
  const [sortBy, setSortBy] = useState('created_at')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, brand:users!products_brand_id_fkey(business_name, city, state)')
      .gte('abv', abvMin)
      .lte('abv', abvMax)

    if (search) query = query.ilike('name', `%${search}%`)
    if (category) query = query.eq('category', category)
    if (subcategory) query = query.eq('subcategory', subcategory)
    if (availability) query = query.eq('availability', availability)
    if (priceMin > 0) query = query.gte('price_min', priceMin)
    if (priceMax < 1000) query = query.lte('price_max', priceMax)

    if (sortBy === 'is_featured') {
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
    } else {
      query = query.order(sortBy, { ascending: false })
    }

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }, [search, category, subcategory, availability, abvMin, abvMax, priceMin, priceMax, sortBy])

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  const clearFilters = () => {
    setCategory('')
    setSubcategory('')
    setAvailability('')
    setAbvMin(0)
    setAbvMax(100)
    setPriceMin(0)
    setPriceMax(1000)
    setSearch('')
  }

  const hasFilters = category || subcategory || availability || abvMin > 0 || abvMax < 100 || priceMin > 0 || priceMax < 1000

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat === category ? '' : cat); setSubcategory('') }}
              className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', category === cat ? 'bg-[#D4AF37] text-black font-medium' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {category && SUBCATEGORIES[category] && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Subcategory</h3>
          <div className="space-y-2">
            {SUBCATEGORIES[category].map(sub => (
              <button
                key={sub}
                onClick={() => setSubcategory(sub === subcategory ? '' : sub)}
                className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', subcategory === sub ? 'bg-[#D4AF37] text-black font-medium' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]')}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Availability</h3>
        <div className="space-y-2">
          {AVAILABILITY_OPTIONS.map(avail => (
            <button
              key={avail}
              onClick={() => setAvailability(avail === availability ? '' : avail)}
              className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', availability === avail ? 'bg-[#D4AF37] text-black font-medium' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]')}
            >
              {avail}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">ABV Range: {abvMin}% – {abvMax}%</h3>
        <div className="space-y-3">
          <input type="range" min="0" max="100" value={abvMin} onChange={e => setAbvMin(Number(e.target.value))} className="w-full accent-[#D4AF37]" />
          <input type="range" min="0" max="100" value={abvMax} onChange={e => setAbvMax(Number(e.target.value))} className="w-full accent-[#D4AF37]" />
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="w-full text-center text-[#D4AF37] text-sm hover:text-white transition-colors">
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20">
        {/* Search Header */}
        <div className="border-b border-[#1a1a1a] px-4 py-4">
          <div className="max-w-7xl mx-auto flex gap-4 items-center">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="input-dark pl-11"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-dark w-auto hidden sm:block"
            >
              <option value="created_at">Newest</option>
              <option value="is_featured">Featured</option>
              <option value="view_count">Most Popular</option>
            </select>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn('md:hidden flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors', sidebarOpen ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-[#333333] text-gray-400')}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#111111] border-l border-[#222222] p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">
                {loading ? 'Loading...' : `${products.length} products found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-video bg-[#1a1a1a] rounded-lg mb-4" />
                    <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🍾</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
                <button onClick={clearFilters} className="mt-4 btn-outline-gold">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
