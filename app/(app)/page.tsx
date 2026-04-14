import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from './HomeClient'
import { getTodaysChallenge, getChallengeId } from '@/lib/daily-challenges'

export const dynamic = 'force-dynamic'

function getMonday(): string {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - diff)
  monday.setUTCHours(0, 0, 0, 0)
  return monday.toISOString()
}

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

  // Weekly summary data
  const mondayISO = getMonday()
  const { data: weekNudges } = await supabase
    .from('nudges')
    .select('receiver_id')
    .eq('sender_id', user.id)
    .gte('sent_at', mondayISO)

  const uniqueFriendsPoked = new Set((weekNudges || []).map(n => n.receiver_id)).size
  const totalPokesThisWeek = (weekNudges || []).length
  const totalFriends = (friendships || []).length

  // Fading friends (>7 days since last poke)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const fadingFriendNames = (friendships || [])
    .filter((f: any) => {
      if (!f.last_nudge_at) return true
      return new Date(f.last_nudge_at).getTime() < sevenDaysAgo
    })
    .map((f: any) => f.friend?.name || 'Someone')

  // Daily challenge
  const challenge = getTodaysChallenge()
  const challengeKey = `challenge_${getChallengeId()}`
  const { data: challengeComplete } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', user.id)
    .eq('achievement_id', challengeKey)
    .single()

  return (
    <HomeClient
      profile={profile}
      friendships={friendships || []}
      pendingFriendships={pendingFriendships || []}
      weeklySummary={{
        uniqueFriendsPoked,
        totalFriends,
        totalPokesThisWeek,
        fadingFriendNames,
      }}
      dailyChallenge={{
        challenge,
        completed: !!challengeComplete,
      }}
    />
  )
}
