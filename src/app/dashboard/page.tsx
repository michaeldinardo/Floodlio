export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BrandDashboard from './BrandDashboard'
import BarDashboard from './BarDashboard'
import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  if (!dbUser) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20">
        {dbUser.user_type === 'brand' ? (
          <BrandDashboard user={dbUser} />
        ) : (
          <BarDashboard user={dbUser} />
        )}
      </div>
    </div>
  )
}
