import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/push";
import { getTodaysChallenge } from "@/lib/daily-challenges";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const challenge = getTodaysChallenge();

  // Find all users with reminders enabled
  const { data: users } = await admin
    .from("users")
    .select("id, name")
    .not("reminder_hour", "is", null);

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  let sentCount = 0;

  for (const user of users) {
    // Check if user already poked someone today
    const { data: todayNudges } = await admin
      .from("nudges")
      .select("id")
      .eq("sender_id", user.id)
      .gte("sent_at", todayStart.toISOString())
      .limit(1);

    if (todayNudges && todayNudges.length > 0) {
      continue; // Already active today
    }

    // Check for fading friends
    const { data: friendships } = await admin
      .from("friendships")
      .select("friend:users!friendships_friend_id_fkey(name), last_nudge_at")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    const fadingFriends = (friendships || [])
      .filter((f: any) => {
        if (!f.last_nudge_at) return true;
        return new Date(f.last_nudge_at).getTime() < sevenDaysAgo;
      })
      .map((f: any) => f.friend?.name || "Someone");

    // Build personalized message
    let message: string;
    if (fadingFriends.length > 0) {
      const names = fadingFriends.slice(0, 2).join(" & ");
      message = `${names} ${fadingFriends.length === 1 ? "hasn't" : "haven't"} heard from you in a while. Send a poke!`;
    } else {
      message = `Today's challenge: ${challenge.icon} ${challenge.title} — ${challenge.description} (+${challenge.bonusPoints} pts)`;
    }

    // Get push subscriptions
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", user.id);

    if (!subs || subs.length === 0) continue;

    for (const sub of subs) {
      try {
        await sendPushNotification(sub.subscription as any, {
          title: "POKKEY",
          body: message,
          url: "/",
        });
        sentCount++;
      } catch (e: any) {
        if (e.statusCode === 404 || e.statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }
  }

  return NextResponse.json({ sent: sentCount, checked: users.length });
}
