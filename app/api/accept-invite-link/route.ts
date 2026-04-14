import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SCORE_EVENTS } from "@/lib/scoring";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviterId } = await req.json();

  // Don't add yourself
  if (inviterId === user.id) {
    return NextResponse.json({ success: true });
  }

  // Check inviter exists
  const { data: inviter } = await supabase
    .from("users")
    .select("id")
    .eq("id", inviterId)
    .single();

  if (!inviter) {
    return NextResponse.json({ error: "Inviter not found" }, { status: 404 });
  }

  // Check if friendship already exists (either direction)
  const { data: existing } = await supabase
    .from("friendships")
    .select("id")
    .eq("user_id", inviterId)
    .eq("friend_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ success: true, message: "Already friends" });
  }

  // Create friendship in both directions, auto-accepted
  await supabase.from("friendships").upsert({
    user_id: inviterId,
    friend_id: user.id,
    status: "accepted",
    last_nudge_at: new Date().toISOString(),
  });

  await supabase.from("friendships").upsert({
    user_id: user.id,
    friend_id: inviterId,
    status: "accepted",
    last_nudge_at: new Date().toISOString(),
  });

  // Award referral points to the inviter
  await supabase.rpc("increment_score", {
    user_id: inviterId,
    amount: SCORE_EVENTS.NEW_USER_INVITED,
  });

  return NextResponse.json({ success: true, message: "Friendship created" });
}
