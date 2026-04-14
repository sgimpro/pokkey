import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from './HomeClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const { data: friendships } = await supabase
    .from('friendships')
    .select(`
      id,
      last_nudge_at,
      streak_count,
      friend:users!friendships_friend_id_fkey(id, name)
    `)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('last_nudge_at', { ascending: true, nullsFirst: true })

  const { data: pendingFriendships } = await supabase
    .from('friendships')
    .select(`
      id,
      user:users!friendships_user_id_fkey(id, name)
    `)
    .eq('friend_id', user.id)
    .eq('status', 'pending')

  return (
    <HomeClient
      profile={profile}
      friendships={friendships || []}
      pendingFriendships={pendingFriendships || []}
    />
  )
}
