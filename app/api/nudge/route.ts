import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { sendPushNotification } from "@/lib/push";
import { SCORE_EVENTS } from "@/lib/scoring";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { friendshipId, friendId } = await req.json();

  // Insert nudge record
  await supabase.from("nudges").insert({
    sender_id: user.id,
    receiver_id: friendId,
  });

  // Update friendship last_nudge_at (both directions)
  await supabase
    .from("friendships")
    .update({ last_nudge_at: new Date().toISOString() })
    .eq("id", friendshipId);

  await supabase
    .from("friendships")
    .update({ last_nudge_at: new Date().toISOString() })
    .eq("user_id", friendId)
    .eq("friend_id", user.id);

  // Add score to sender
  await supabase.rpc("increment_score", {
    user_id: user.id,
    amount: SCORE_EVENTS.NUDGE_SENT,
  });

  // Check for reciprocal bonus (friend nudged sender in last 24hrs)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentNudge } = await supabase
    .from("nudges")
    .select("id")
    .eq("sender_id", friendId)
    .eq("receiver_id", user.id)
    .gte("sent_at", yesterday)
    .limit(1);

  if (recentNudge && recentNudge.length > 0) {
    await supabase.rpc("increment_score", {
      user_id: user.id,
      amount: SCORE_EVENTS.NUDGE_RECIPROCATED,
    });
  }

  // ============ STREAK LOGIC ============
  const threedays = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
  const { data: friendRecentNudge } = await supabase
    .from("nudges")
    .select("id")
    .eq("sender_id", friendId)
    .eq("receiver_id", user.id)
    .gte("sent_at", threedays)
    .limit(1);

  if (friendRecentNudge && friendRecentNudge.length > 0) {
    const { data: ourFriendship } = await supabase
      .from("friendships")
      .select("streak_count, streak_updated_at")
      .eq("id", friendshipId)
      .single();

    const now = new Date();
    const lastStreakUpdate = ourFriendship?.streak_updated_at
      ? new Date(ourFriendship.streak_updated_at)
      : null;
    const hoursSinceUpdate = lastStreakUpdate
      ? (now.getTime() - lastStreakUpdate.getTime()) / (1000 * 60 * 60)
      : 999;

    if (hoursSinceUpdate >= 20) {
      const newStreak = (ourFriendship?.streak_count || 0) + 1;

      await supabase
        .from("friendships")
        .update({ streak_count: newStreak, streak_updated_at: now.toISOString() })
        .eq("id", friendshipId);

      await supabase
        .from("friendships")
        .update({ streak_count: newStreak, streak_updated_at: now.toISOString() })
        .eq("user_id", friendId)
        .eq("friend_id", user.id);

      if (newStreak === 7) {
        await supabase.rpc("increment_score", {
          user_id: user.id,
          amount: SCORE_EVENTS.FRIENDSHIP_STREAK_7_DAYS,
        });
        await supabase.rpc("increment_score", {
          user_id: friendId,
          amount: SCORE_EVENTS.FRIENDSHIP_STREAK_7_DAYS,
        });
      }
    }
  } else {
    await supabase
      .from("friendships")
      .update({ streak_count: 0, streak_updated_at: null })
      .eq("id", friendshipId);

    await supabase
      .from("friendships")
      .update({ streak_count: 0, streak_updated_at: null })
      .eq("user_id", friendId)
      .eq("friend_id", user.id);
  }

  // ============ NOTIFICATIONS ============
  const { data: sender } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  const { data: friend } = await supabase
    .from("users")
    .select("phone, name")
    .eq("id", friendId)
    .single();

  if (friend) {
    let pushSent = false;
    const { data: pushSubs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", friendId);

    if (pushSubs && pushSubs.length > 0) {
      for (const sub of pushSubs) {
        try {
          await sendPushNotification(sub.subscription as any, {
            title: "PŌKKEY",
            body: sender?.name + " just poked you!",
            url: "/",
          });
          pushSent = true;
        } catch (e: any) {
          if (e.statusCode === 404 || e.statusCode === 410) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
          console.error("Push failed:", e);
        }
      }
    }

    if (!pushSent) {
      try {
        await sendSMS(
          friend.phone,
          sender?.name + " just poked you on PŌKKEY! Poke back: " + process.env.NEXT_PUBLIC_APP_URL
        );
      } catch (e) {
        console.error("SMS send failed:", e);
      }
    }
  }

  return NextResponse.json({ success: true });
}
