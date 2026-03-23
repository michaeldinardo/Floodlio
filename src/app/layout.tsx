import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Floodlio - Connect Brands & Bars',
  description: 'The marketplace connecting beverage brands with bars and restaurants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">

      <html lang="en" className="dark">
        <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
