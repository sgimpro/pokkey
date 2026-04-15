import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/push";
import { SCORE_EVENTS } from "@/lib/scoring";

export const dynamic = "force-dynamic";

/**
 * Score Decay Cron — runs daily
 *
 * Logic: Find pokes that were received 48+ hours ago but never reciprocated.
 * Dock the receiver's score by IGNORED_POKE_DECAY per ignored poke (capped at MAX_DAILY_DECAY).
 * Send a push notification warning them.
 *
 * We only process pokes from the 48h–72h window so we don't double-penalize older pokes.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Window: pokes received between 48h and 72h ago (so we process each poke exactly once)
  const now = Date.now();
  const h48ago = new Date(now - 48 * 60 * 60 * 1000).toISOString();
  const h72ago = new Date(now - 72 * 60 * 60 * 1000).toISOString();

  // Get all pokes received in the 48-72h window
  const { data: receivedPokes } = await admin
    .from("nudges")
    .select("sender_id, receiver_id")
    .gte("sent_at", h72ago)
    .lte("sent_at", h48ago);

  if (!receivedPokes || receivedPokes.length === 0) {
    return NextResponse.json({ decayed: 0, notified: 0 });
  }

  // Group by receiver — these are people who were poked
  const receiverMap = new Map<string, Set<string>>();
  for (const poke of receivedPokes) {
    if (!receiverMap.has(poke.receiver_id)) {
      receiverMap.set(poke.receiver_id, new Set());
    }
    receiverMap.get(poke.receiver_id)!.add(poke.sender_id);
  }

  let decayedCount = 0;
  let notifiedCount = 0;

  for (const [receiverId, senderIds] of receiverMap) {
    // For each sender, check if the receiver poked them back within 48h of the original poke
    let ignoredCount = 0;
    const ignoredNames: string[] = [];

    for (const senderId of senderIds) {
      // Did receiver poke sender back anytime in the last 72h?
      const { data: pokedBack } = await admin
        .from("nudges")
        .select("id")
        .eq("sender_id", receiverId)
        .eq("receiver_id", senderId)
        .gte("sent_at", h72ago)
        .limit(1);

      if (!pokedBack || pokedBack.length === 0) {
        ignoredCount++;
        // Get sender name for the notification
        const { data: sender } = await admin
          .from("users")
          .select("name")
          .eq("id", senderId)
          .single();
        if (sender?.name) ignoredNames.push(sender.name);
      }
    }

    if (ignoredCount === 0) continue;

    // Calculate decay (capped)
    const decayAmount = Math.min(
      ignoredCount * SCORE_EVENTS.IGNORED_POKE_DECAY,
      SCORE_EVENTS.MAX_DAILY_DECAY
    );

    // Apply decay
    await admin.rpc("decrement_score", {
      user_id: receiverId,
      amount: decayAmount,
    });
    decayedCount++;

    // Send push notification
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", receiverId);

    if (subs && subs.length > 0) {
      const names = ignoredNames.slice(0, 2).join(" & ");
      const extra = ignoredNames.length > 2 ? ` +${ignoredNames.length - 2} more` : "";

      let body: string;
      if (ignoredCount === 1 && ignoredNames[0]) {
        body = `${ignoredNames[0]} poked you and got nothing back. -${decayAmount} pts. 👀`;
      } else {
        body = `${names}${extra} poked you with no response. -${decayAmount} pts. Your score is slipping! 📉`;
      }

      for (const sub of subs) {
        try {
          await sendPushNotification(sub.subscription as any, {
            title: "POKKEY — Score Decay",
            body,
            url: "/",
          });
          notifiedCount++;
        } catch (e: any) {
          if (e.statusCode === 404 || e.statusCode === 410) {
            await admin.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }
    }
  }

  return NextResponse.json({ decayed: decayedCount, notified: notifiedCount });
}
