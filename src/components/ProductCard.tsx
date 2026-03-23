'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import { Product } from '@/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  showSaveButton?: boolean
  isSaved?: boolean
  onSave?: (productId: string) => void
}

export default function ProductCard({ product, showSaveButton, isSaved, onSave }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="card hover:border-[#D4AF37]/50 transition-all duration-200 group cursor-pointer h-full">
        <div className="relative aspect-video bg-[#1a1a1a] rounded-lg mb-4 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">🍾</span>
            </div>
          )}
          {product.is_featured && (
            <div className="absolute top-2 left-2 bg-[#D4AF37] text-black text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {product.category}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
              {product.name}
            </h3>
            {showSaveButton && (
              <button
                onClick={(e) => { e.preventDefault(); onSave?.(product.id) }}
                className={cn('flex-shrink-0', isSaved ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-[#D4AF37]')}
              >
                <Star size={18} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          <p className="text-gray-500 text-sm">{product.subcategory} · {product.abv}% ABV</p>

          {product.brand && (
            <p className="text-gray-400 text-sm">{product.brand.business_name}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <MapPin size={12} />
              <span>{product.availability}</span>
            </div>
            {(product.price_min || product.price_max) && (
              <span className="text-[#D4AF37] text-sm font-medium">
                ${product.price_min}{product.price_max ? `–$${product.price_max}` : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
