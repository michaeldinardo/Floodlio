'use client'
import Link from 'next/link'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

export default function Navbar() {
  const { isSignedIn } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center">
              <Zap size={18} className="text-black" fill="black" />
            </div>
            <span className="text-xl font-bold text-white">floodlio</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/explore" className="text-gray-400 hover:text-white transition-colors text-sm">Explore</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</Link>
            {isSignedIn && (
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-gray-400 hover:text-white transition-colors text-sm">Sign In</button>
                </SignInButton>
                <Link href="/sign-up" className="btn-gold text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-4 space-y-4">
          <Link href="/explore" className="block text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>Explore</Link>
          <Link href="/pricing" className="block text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>Pricing</Link>
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="block text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="block text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/sign-up" className="btn-gold inline-block text-sm py-2 px-4" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
