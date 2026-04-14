import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: nudgesSent } = await supabase
    .from('nudges')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', user.id)

  const { count: nudgesReceived } = await supabase
    .from('nudges')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 pb-24">
        <h1 className="text-xl font-bold py-4">Your Profile</h1>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold mx-auto">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="mt-3 text-xl font-bold">{profile?.name}</h2>
            <p className="text-gray-500 text-sm">{profile?.phone}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <p className="text-2xl font-bold text-orange-500">{profile?.score}</p>
              <p className="text-xs text-gray-500">Score</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <p className="text-2xl font-bold text-orange-500">{nudgesSent || 0}</p>
              <p className="text-xs text-gray-500">Sent</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <p className="text-2xl font-bold text-orange-500">{nudgesReceived || 0}</p>
              <p className="text-xs text-gray-500">Received</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
