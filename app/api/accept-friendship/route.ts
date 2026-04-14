import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { friendshipId } = await req.json()

  const { data: friendship } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
    .eq('friend_id', user.id)
    .select()
    .single()

  if (!friendship) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Create reverse friendship
  await supabase.from('friendships').upsert({
    user_id: user.id,
    friend_id: friendship.user_id,
    status: 'accepted',
    last_nudge_at: new Date().toISOString()
  })

  return NextResponse.json({ success: true })
}
