import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getTodaysChallenge, getChallengeId, type DailyChallengeStats } from "@/lib/daily-challenges";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challenge = getTodaysChallenge();
  const challengeKey = `challenge_${getChallengeId()}`;

  // Check if already completed today (stored in user_achievements with special prefix)
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("user_id", user.id)
    .eq("achievement_id", challengeKey)
    .single();

  if (existing) {
    return NextResponse.json({ completed: true, alreadyEarned: true });
  }

  // Gather today's stats
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  // Pokes sent today
  const { data: todayNudges } = await supabase
    .from("nudges")
    .select("receiver_id, poke_type")
    .eq("sender_id", user.id)
    .gte("sent_at", todayISO);

  const pokesToday = (todayNudges || []).length;
  const uniqueFriendsPokedToday = new Set((todayNudges || []).map((n) => n.receiver_id)).size;
  const differentPokeTypesToday = new Set((todayNudges || []).map((n) => n.poke_type || "poke")).size;

  // Poke-backs today (received a poke today, then sent one back to same person today)
  const { data: receivedToday } = await supabase
    .from("nudges")
    .select("sender_id")
    .eq("receiver_id", user.id)
    .gte("sent_at", todayISO);

  const receivedFromIds = new Set((receivedToday || []).map((n) => n.sender_id));
  const pokedBackIds = new Set((todayNudges || []).map((n) => n.receiver_id));
  let pokeBacksToday = 0;
  for (const id of receivedFromIds) {
    if (pokedBackIds.has(id)) pokeBacksToday++;
  }

  // Total friends
  const { count: totalFriends } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "accepted");

  const stats: DailyChallengeStats = {
    pokesToday,
    uniqueFriendsPokedToday,
    pokeBacksToday,
    differentPokeTypesToday,
    totalFriends: totalFriends || 0,
  };

  const isCompleted = challenge.check(stats);

  if (isCompleted) {
    // Mark as completed
    await supabase.from("user_achievements").insert({
      user_id: user.id,
      achievement_id: challengeKey,
    });

    // Award bonus points
    await supabase.rpc("increment_score", {
      user_id: user.id,
      amount: challenge.bonusPoints,
    });

    return NextResponse.json({ completed: true, bonusPoints: challenge.bonusPoints });
  }

  return NextResponse.json({ completed: false, stats });
}
