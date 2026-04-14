export interface Achievement {
  id: string;
  name: string;
  title: string; // cosmetic title the user can display
  description: string;
  icon: string; // emoji
  category: "milestone" | "activity";
  check: (stats: UserStats) => boolean;
}

export interface UserStats {
  score: number;
  totalNudgesSent: number;
  totalNudgesReceived: number;
  friendsCount: number;
  bestStreak: number;
  invitesSent: number;
  uniqueFriendsPokedToday: number;
  weeklyResponseRate: number;
  weeklyMvpCount: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Score milestones ──
  {
    id: "rookie_poker",
    name: "Rookie Poker",
    title: "ROOKIE POKER",
    description: "Reach 10 points",
    icon: "🐣",
    category: "milestone",
    check: (s) => s.score >= 10,
  },
  {
    id: "friendly_finger",
    name: "Friendly Finger",
    title: "FRIENDLY FINGER",
    description: "Reach 50 points",
    icon: "👆",
    category: "milestone",
    check: (s) => s.score >= 50,
  },
  {
    id: "poke_pro",
    name: "Poke Pro",
    title: "POKE PRO",
    description: "Reach 100 points",
    icon: "💪",
    category: "milestone",
    check: (s) => s.score >= 100,
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    title: "SOCIAL BUTTERFLY",
    description: "Reach 250 points",
    icon: "🦋",
    category: "milestone",
    check: (s) => s.score >= 250,
  },
  {
    id: "poke_master",
    name: "Poke Master",
    title: "POKE MASTER",
    description: "Reach 500 points",
    icon: "👑",
    category: "milestone",
    check: (s) => s.score >= 500,
  },
  {
    id: "poking_legend",
    name: "Poking Legend",
    title: "POKING LEGEND",
    description: "Reach 1,000 points",
    icon: "🏆",
    category: "milestone",
    check: (s) => s.score >= 1000,
  },

  // ── Activity badges ──
  {
    id: "ice_breaker",
    name: "Ice Breaker",
    title: "ICE BREAKER",
    description: "Send your first poke",
    icon: "🧊",
    category: "activity",
    check: (s) => s.totalNudgesSent >= 1,
  },
  {
    id: "on_fire",
    name: "On Fire",
    title: "ON FIRE",
    description: "Hit a 7-day streak with a friend",
    icon: "🔥",
    category: "activity",
    check: (s) => s.bestStreak >= 7,
  },
  {
    id: "connector",
    name: "Connector",
    title: "CONNECTOR",
    description: "Invite 3 friends to join",
    icon: "🔗",
    category: "activity",
    check: (s) => s.invitesSent >= 3,
  },
  {
    id: "lightning_reflexes",
    name: "Lightning Reflexes",
    title: "LIGHTNING REFLEXES",
    description: "100% response rate in a week",
    icon: "⚡",
    category: "activity",
    check: (s) => s.weeklyResponseRate >= 100,
  },
  {
    id: "popular",
    name: "Popular",
    title: "POPULAR",
    description: "Poke 5 different friends in one day",
    icon: "🌟",
    category: "activity",
    check: (s) => s.uniqueFriendsPokedToday >= 5,
  },
  {
    id: "weekly_champion",
    name: "Weekly Champion",
    title: "WEEKLY CHAMPION",
    description: "Become the MVP of the week",
    icon: "⭐",
    category: "activity",
    check: (s) => s.weeklyMvpCount >= 1,
  },
];

// Get all achievements a user should have based on their stats
export function getEarnedAchievements(stats: UserStats): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats));
}

// Find newly earned achievements (earned now but not previously saved)
export function getNewAchievements(
  stats: UserStats,
  existingIds: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => a.check(stats) && !existingIds.includes(a.id)
  );
}

// Get the highest milestone title earned
export function getHighestTitle(earnedIds: string[]): string | null {
  const milestones = ACHIEVEMENTS.filter(
    (a) => a.category === "milestone" && earnedIds.includes(a.id)
  );
  return milestones.length > 0 ? milestones[milestones.length - 1].title : null;
}
