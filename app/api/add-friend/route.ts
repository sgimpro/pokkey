import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendSMS } from '@/lib/twilio'
import { SCORE_EVENTS } from '@/lib/scoring'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, name: contactName } = await req.json()

  // Normalize phone number
  const normalized = phone.replace(/[\s\-\(\)]/g, '')

  const { data: sender } = await supabase
    .from('users')
    .select('name, phone')
    .eq('id', user.id)
    .single()

  // Don't add yourself
  if (normalized === sender?.phone) {
    return NextResponse.json({ error: "That's your own number!" }, { status: 400 })
  }

  // Check if friend is already on the app
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, name')
    .eq('phone', normalized)
    .single()

  if (existingUser) {
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_id', user.id)
      .eq('friend_id', existingUser.id)
      .single()

    if (existing) return NextResponse.json({ error: 'Already friends or pending' }, { status: 400 })

    await supabase.from('friendships').insert({
      user_id: user.id,
      friend_id: existingUser.id,
      status: 'pending',
      last_nudge_at: new Date().toISOString()
    })

    try {
      await sendSMS(
        normalized,
        `${sender?.name} wants to be your friend on PŌKKEY! Open the app: ${process.env.NEXT_PUBLIC_APP_URL}`
      )
    } catch (e) {
      console.error('SMS failed:', e)
    }

    return NextResponse.json({ message: `Friend request sent to ${existingUser.name}!` })
  } else {
    // User not on app — save pending invite + send viral SMS
    await supabase.from('pending_invites').upsert({
      inviter_id: user.id,
      phone: normalized
    })

    await supabase.rpc('increment_score', {
      user_id: user.id,
      amount: SCORE_EVENTS.NEW_USER_INVITED
    })

    try {
      await sendSMS(
        normalized,
        `${sender?.name} poked you on PŌKKEY! You have a friendship score waiting — unlock it: ${process.env.NEXT_PUBLIC_APP_URL}/invite/${user.id}`
      )
    } catch (e) {
      console.error('SMS failed:', e)
    }

    return NextResponse.json({ message: `Invite sent to ${contactName || 'your friend'}! We'll connect you when they join.` })
  }
}
