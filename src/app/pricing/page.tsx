import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Check } from 'lucide-react'

const FEATURES = [
  'Unlimited product listings',
  'Receive stocking requests from bars',
  'Real-time messaging with bars',
  'Analytics dashboard',
  'Featured listing eligibility',
  'Brand profile page',
  'Image uploads for all products',
  'Priority support',
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 text-lg">One plan for brands. Always free for bars.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Bar - Free */}
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Bar</h2>
              <div className="text-5xl font-bold mb-2">Free</div>
              <p className="text-gray-500">Forever free for bars</p>
            </div>
            <ul className="space-y-3 mb-8">
              {['Browse all products', 'Save favorite products', 'Send stocking requests', 'Message brands directly', 'Bar profile page'].map(f => (
                <li key={f} className="flex items-center gap-3 text-gray-300">
                  <Check size={18} className="text-[#D4AF37] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="btn-outline-gold w-full text-center block">
              Create Bar Account
            </Link>
          </div>

          {/* Brand - $29/mo */}
          <div className="relative card border-[#D4AF37]/50 bg-[#D4AF37]/5">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-sm font-bold px-4 py-1 rounded-full">
              Most Popular
            </div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Brand</h2>
              <div className="text-5xl font-bold mb-2">
                $29<span className="text-xl text-gray-400">/mo</span>
              </div>
              <p className="text-gray-500">Everything you need to grow</p>
            </div>
            <ul className="space-y-3 mb-8">
              {FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-gray-300">
                  <Check size={18} className="text-[#D4AF37] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="btn-gold w-full text-center block">
              Start Listing Products
            </Link>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-500">
          <p>Cancel anytime. No contracts. Billed monthly.</p>
        </div>
      </div>
    </div>
  )
}
