import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/push";

export const dynamic = "force-dynamic";

const REMINDERS = [
  "Don't forget to poke your people today!",
  "Your friends are waiting for a poke!",
  "Keep your streaks alive — poke someone!",
  "A quick poke goes a long way. Say hi!",
  "Who haven't you poked in a while?",
];

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const currentHour = now.getUTCHours();

  // Find users with reminder set for this hour
  const { data: users } = await admin
    .from("users")
    .select("id, name")
    .eq("reminder_hour", currentHour);

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Check which of these users haven't poked anyone today
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);

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
      continue; // Already active today, skip
    }

    // Get their push subscriptions
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", user.id);

    if (!subs || subs.length === 0) continue;

    const message = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];

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
