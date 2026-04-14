import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: { inviterId: string } }) {
  const supabase = createClient()

  const { data: inviter } = await supabase
    .from('users')
    .select('name')
    .eq('id', params.inviterId)
    .single()

  const name = inviter?.name || 'Someone'
  const initial = name[0].toUpperCase()

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold mx-auto">
          {initial}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{name} is thinking about you.</h1>
          <p className="mt-2 text-gray-500">You have a friendship score waiting.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border-2 border-orange-200">
          <p className="text-lg font-semibold text-gray-700">Your friendship score</p>
          <p className="text-5xl font-bold text-orange-500 mt-2">&#128274;</p>
          <p className="text-sm text-gray-500 mt-2">Unlock it in 30 seconds</p>
        </div>
        <Link
          href={`/login?inviter=${params.inviterId}`}
          className="block w-full py-4 bg-orange-500 text-white rounded-2xl text-lg font-bold active:scale-[0.98] transition-transform"
        >
          Unlock My Score
        </Link>
        <p className="text-xs text-gray-400">No passwords. Just your phone number.</p>
      </div>
    </div>
  )
}
