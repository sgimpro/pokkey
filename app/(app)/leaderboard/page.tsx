import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ScoreCard from "@/components/ScoreCard";

export const dynamic = "force-dynamic";

function getMonday(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
}

function getDayOfWeekIndex(): number {
  const day = new Date().getUTCDay();
  return day === 0 ? 6 : day - 1; // Mon=0, Sun=6
}

export default async function LeaderboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get friend IDs
  const { data: friendships } = await supabase
    .from("friendships")
    .select("friend_id, streak_count")
    .eq("user_id", user.id)
    .eq("status", "accepted");

  const friendIds = (friendships || []).map((f) => f.friend_id);
  const allIds = [user.id, ...friendIds];
  const friendsCount = friendIds.length;

  // Best streak among all friendships
  const bestStreak = Math.max(0, ...(friendships || []).map((f) => f.streak_count || 0));

  // All-time scores
  const { data: scores } = await supabase
    .from("users")
    .select("id, name, score, active_title")
    .in("id", allIds)
    .order("score", { ascending: false });

  // User's rank
  const myScore = scores?.find((s) => s.id === user.id);
  const rank = (scores || []).findIndex((s) => s.id === user.id) + 1;
  const totalUsers = (scores || []).length;

  // Weekly nudges for MVP
  const mondayISO = getMonday();
  const { data: weeklyNudges } = await supabase
    .from("nudges")
    .select("sender_id, sent_at")
    .in("sender_id", allIds)
    .gte("sent_at", mondayISO);

  // Weekly activity for current user (Mon-Sun booleans)
  const weeklyActivity = [false, false, false, false, false, false, false];
  const todayIndex = getDayOfWeekIndex();
  if (weeklyNudges) {
    for (const n of weeklyNudges) {
      if (n.sender_id === user.id) {
        const d = new Date(n.sent_at);
        const dayOfWeek = d.getUTCDay();
        const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weeklyActivity[idx] = true;
      }
    }
  }

  // Tally weekly pokes per user
  const weeklyMap: Record<string, number> = {};
  if (weeklyNudges) {
    for (const n of weeklyNudges) {
      weeklyMap[n.sender_id] = (weeklyMap[n.sender_id] || 0) + 1;
    }
  }

  // Response rate: of pokes received, how many did user poke back within 24h
  const { data: receivedNudges } = await supabase
    .from("nudges")
    .select("sender_id, sent_at")
    .eq("receiver_id", user.id);

  const { data: sentNudges } = await supabase
    .from("nudges")
    .select("receiver_id, sent_at")
    .eq("sender_id", user.id);

  let responded = 0;
  let totalReceived = (receivedNudges || []).length;
  if (receivedNudges && sentNudges) {
    for (const received of receivedNudges) {
      const receivedTime = new Date(received.sent_at).getTime();
      const pokedBack = sentNudges.some((sent) => {
        if (sent.receiver_id !== received.sender_id) return false;
        const sentTime = new Date(sent.sent_at).getTime();
        return sentTime > receivedTime && sentTime - receivedTime < 24 * 60 * 60 * 1000;
      });
      if (pokedBack) responded++;
    }
  }
  const responseRate = totalReceived > 0 ? Math.round((responded / totalReceived) * 100) : 100;

  // Find MVP
  let mvpId: string | null = null;
  let mvpScore = 0;
  for (const [id, count] of Object.entries(weeklyMap)) {
    if (count > mvpScore) {
      mvpScore = count;
      mvpId = id;
    }
  }
  const mvpUser = scores?.find((s) => s.id === mvpId);

  // Weekly ranking
  const weeklyRanking = allIds
    .map((id) => ({
      id,
      name: scores?.find((s) => s.id === id)?.name || "Unknown",
      weeklyPokes: weeklyMap[id] || 0,
    }))
    .filter((u) => u.weeklyPokes > 0)
    .sort((a, b) => b.weeklyPokes - a.weeklyPokes);

  const medals = ["&#129351;", "&#129352;", "&#129353;"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 pb-24">
        <h1 className="text-xl font-bold py-4">Leaderboard</h1>

        {/* Poking Champion Score Card */}
        <ScoreCard
          name={myScore?.name || "You"}
          score={myScore?.score || 0}
          rank={rank}
          totalUsers={totalUsers}
          friendsCount={friendsCount}
          bestStreak={bestStreak}
          weeklyActivity={weeklyActivity}
          responseRate={responseRate}
          profileId={user.id}
          activeTitle={myScore?.active_title || null}
        />

        {/* Weekly MVP Section */}
        {mvpUser && mvpScore > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              THIS WEEK&apos;S MVP
            </h2>
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">&#11088;</span>
                  <div>
                    <p className="font-bold text-lg">
                      {mvpUser.name}
                      {mvpUser.id === user.id ? " (you)" : ""}
                    </p>
                    <p className="text-orange-100 text-sm">Most active this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{mvpScore}</p>
                  <p className="text-orange-100 text-xs">pokes</p>
                </div>
              </div>
            </div>

            {weeklyRanking.length > 1 && (
              <div className="mt-2 space-y-1">
                {weeklyRanking.slice(1, 4).map((u, i) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between px-4 py-2 bg-orange-50 rounded-xl"
                  >
                    <p className="text-sm text-gray-700">
                      {i + 2}. {u.name}
                      {u.id === user.id ? " (you)" : ""}
                    </p>
                    <p className="text-sm font-semibold text-orange-500">
                      {u.weeklyPokes} pokes
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All-Time Section */}
        <h2 className="text-sm font-semibold text-gray-500 mb-2">ALL TIME</h2>
        <div className="space-y-3">
          {(scores || []).map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center justify-between p-4 rounded-2xl ${
                s.id === user.id
                  ? "bg-orange-100 border-2 border-orange-300"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">
                  {i < 3 ? (
                    <span dangerouslySetInnerHTML={{ __html: medals[i] }} />
                  ) : (
                    `${i + 1}.`
                  )}
                </span>
                <p className="font-semibold">
                  {s.name}
                  {s.id === user.id ? " (you)" : ""}
                </p>
              </div>
              <p className="font-bold text-orange-500">{s.score} pts</p>
            </div>
          ))}
          {(!scores || scores.length === 0) && (
            <p className="text-center py-8 text-gray-400">
              Add friends to see the leaderboard!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
