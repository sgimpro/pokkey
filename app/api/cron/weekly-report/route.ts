import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get all users
  const { data: users } = await admin.from("users").select("id, name");
  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Monday of this past week
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  const mondayISO = monday.toISOString();

  let sentCount = 0;

  for (const user of users) {
    // Count friends
    const { count: totalFriends } = await admin
      .from("friendships")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "accepted");

    if (!totalFriends || totalFriends === 0) continue;

    // Unique friends poked this week
    const { data: weekNudges } = await admin
      .from("nudges")
      .select("receiver_id")
      .eq("sender_id", user.id)
      .gte("sent_at", mondayISO);

    const uniquePoked = new Set((weekNudges || []).map((n) => n.receiver_id)).size;

    // Find friendships that are "red" (>7 days)
    const { data: friendships } = await admin
      .from("friendships")
      .select("friend:users!friendships_friend_id_fkey(name), last_nudge_at")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const fadingFriends = (friendships || [])
      .filter((f) => {
        if (!f.last_nudge_at) return true;
        return new Date(f.last_nudge_at).getTime() < sevenDaysAgo;
      })
      .map((f: any) => f.friend?.name || "Someone");

    // Build the notification message
    let body = `You stayed in touch with ${uniquePoked}/${totalFriends} friends this week.`;
    if (fadingFriends.length > 0) {
      const names = fadingFriends.slice(0, 2).join(" & ");
      const extra = fadingFriends.length > 2 ? ` +${fadingFriends.length - 2} more` : "";
      body += ` ${names}${extra} could use a poke!`;
    } else {
      body += " Amazing job keeping everyone close!";
    }

    // Send push notification
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", user.id);

    if (subs && subs.length > 0) {
      for (const sub of subs) {
        try {
          await sendPushNotification(sub.subscription as any, {
            title: "Your Weekly Friendship Report",
            body,
            url: "/leaderboard",
          });
          sentCount++;
        } catch (e: any) {
          if (e.statusCode === 404 || e.statusCode === 410) {
            await admin.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }
    }
  }

  return NextResponse.json({ sent: sentCount, checked: users.length });
}
