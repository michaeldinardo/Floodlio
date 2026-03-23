export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MessagesClient from './MessagesClient'
import Navbar from '@/components/Navbar'

export default async function MessagesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: dbUser } = await supabase.from('users').select('*').eq('clerk_id', userId).single()
  if (!dbUser) redirect('/onboarding')

  const field = dbUser.user_type === 'brand' ? 'brand_id' : 'bar_id'
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, brand:users!conversations_brand_id_fkey(*), bar:users!conversations_bar_id_fkey(*)')
    .eq(field, dbUser.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 h-screen flex flex-col">
        <MessagesClient user={dbUser} initialConversations={conversations || []} />
      </div>
    </div>
  )
}
