import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACHIEVEMENTS, getNewAchievements, type UserStats } from "@/lib/achievements";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Gather all stats needed for achievement checks
  const { data: profile } = await supabase
    .from("users")
    .select("score")
    .eq("id", user.id)
    .single();

  const { count: totalNudgesSent } = await supabase
    .from("nudges")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", user.id);

  const { count: totalNudgesReceived } = await supabase
    .from("nudges")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id);

  const { data: friendships } = await supabase
    .from("friendships")
    .select("friend_id, streak_count")
    .eq("user_id", user.id)
    .eq("status", "accepted");

  const friendsCount = (friendships || []).length;
  const bestStreak = Math.max(0, ...(friendships || []).map((f) => f.streak_count || 0));

  // Count invites sent (friendships where this user is the inviter via accept-invite-link)
  // We approximate by counting friendships the user initiated
  const { count: invitesSent } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "accepted");

  // Unique friends poked today
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const { data: todayNudges } = await supabase
    .from("nudges")
    .select("receiver_id")
    .eq("sender_id", user.id)
    .gte("sent_at", todayStart.toISOString());

  const uniqueFriendsPokedToday = new Set((todayNudges || []).map((n) => n.receiver_id)).size;

  // Weekly response rate
  const mondayDate = new Date();
  const day = mondayDate.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  mondayDate.setUTCDate(mondayDate.getUTCDate() - diff);
  mondayDate.setUTCHours(0, 0, 0, 0);
  const mondayISO = mondayDate.toISOString();

  const { data: weekReceived } = await supabase
    .from("nudges")
    .select("sender_id, sent_at")
    .eq("receiver_id", user.id)
    .gte("sent_at", mondayISO);

  const { data: weekSent } = await supabase
    .from("nudges")
    .select("receiver_id, sent_at")
    .eq("sender_id", user.id)
    .gte("sent_at", mondayISO);

  let responded = 0;
  const totalReceivedThisWeek = (weekReceived || []).length;
  if (weekReceived && weekSent) {
    for (const received of weekReceived) {
      const receivedTime = new Date(received.sent_at).getTime();
      const pokedBack = weekSent.some((sent) => {
        if (sent.receiver_id !== received.sender_id) return false;
        const sentTime = new Date(sent.sent_at).getTime();
        return sentTime > receivedTime && sentTime - receivedTime < 24 * 60 * 60 * 1000;
      });
      if (pokedBack) responded++;
    }
  }
  const weeklyResponseRate = totalReceivedThisWeek > 0
    ? Math.round((responded / totalReceivedThisWeek) * 100)
    : 0;

  // Weekly MVP: check if user has the most pokes this week among friends
  const friendIds = (friendships || []).map((f) => f.friend_id);
  const allIds = [user.id, ...friendIds];
  const { data: weeklyNudges } = await supabase
    .from("nudges")
    .select("sender_id")
    .in("sender_id", allIds)
    .gte("sent_at", mondayISO);

  const weeklyMap: Record<string, number> = {};
  if (weeklyNudges) {
    for (const n of weeklyNudges) {
      weeklyMap[n.sender_id] = (weeklyMap[n.sender_id] || 0) + 1;
    }
  }
  const myWeeklyCount = weeklyMap[user.id] || 0;
  const isMvp = myWeeklyCount > 0 && Object.values(weeklyMap).every((c) => myWeeklyCount >= c);

  const stats: UserStats = {
    score: profile?.score || 0,
    totalNudgesSent: totalNudgesSent || 0,
    totalNudgesReceived: totalNudgesReceived || 0,
    friendsCount,
    bestStreak,
    invitesSent: invitesSent || 0,
    uniqueFriendsPokedToday,
    weeklyResponseRate,
    weeklyMvpCount: isMvp ? 1 : 0,
  };

  // Get existing achievements
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", user.id);

  const existingIds = (existing || []).map((e) => e.achievement_id);
  const newAchievements = getNewAchievements(stats, existingIds);

  // Insert new achievements
  if (newAchievements.length > 0) {
    await supabase.from("user_achievements").insert(
      newAchievements.map((a) => ({
        user_id: user.id,
        achievement_id: a.id,
      }))
    );
  }

  return NextResponse.json({
    newAchievements: newAchievements.map((a) => ({
      id: a.id,
      name: a.name,
      title: a.title,
      description: a.description,
      icon: a.icon,
    })),
    allEarnedIds: [...existingIds, ...newAchievements.map((a) => a.id)],
  });
}
