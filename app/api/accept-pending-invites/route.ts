import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { phone, userId } = await req.json()

  const { data: invites } = await supabase
    .from('pending_invites')
    .select('inviter_id')
    .eq('phone', phone)

  if (!invites || invites.length === 0) return NextResponse.json({ success: true })

  for (const invite of invites) {
    await supabase.from('friendships').upsert({
      user_id: invite.inviter_id,
      friend_id: userId,
      status: 'accepted',
      last_nudge_at: new Date().toISOString()
    })
    await supabase.from('friendships').upsert({
      user_id: userId,
      friend_id: invite.inviter_id,
      status: 'accepted',
      last_nudge_at: new Date().toISOString()
    })
  }

  await supabase.from('pending_invites').delete().eq('phone', phone)
  return NextResponse.json({ success: true })
}
