export interface StreakMilestone {
  minDays: number;
  name: string;
  emoji: string;
  bonusPoints: number; // awarded once when first reaching this milestone
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { minDays: 3, name: "Warming Up", emoji: "\u{1F331}", bonusPoints: 2 },
  { minDays: 7, name: "Real Ones", emoji: "\u{1F91D}", bonusPoints: 5 },
  { minDays: 14, name: "Ride or Die", emoji: "\u{1F525}", bonusPoints: 10 },
  { minDays: 30, name: "Legendary", emoji: "\u{1F451}", bonusPoints: 20 },
  { minDays: 100, name: "Untouchable", emoji: "\u{1F48E}", bonusPoints: 50 },
];

// Get the current milestone for a streak count
export function getStreakMilestone(
  streakCount: number
): StreakMilestone | null {
  // Return the highest milestone the streak qualifies for
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    if (streakCount >= STREAK_MILESTONES[i].minDays) {
      return STREAK_MILESTONES[i];
    }
  }
  return null;
}

// Check if a new streak count just crossed a milestone threshold
export function getNewlyReachedMilestone(
  newStreak: number
): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m.minDays === newStreak) || null;
}
