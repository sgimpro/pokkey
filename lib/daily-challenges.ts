export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  bonusPoints: number;
  check: (stats: DailyChallengeStats) => boolean;
}

export interface DailyChallengeStats {
  pokesToday: number;
  uniqueFriendsPokedToday: number;
  pokeBacksToday: number; // responded to received pokes today
  differentPokeTypesToday: number;
  totalFriends: number;
}

// Pool of challenges — one gets picked per day based on date
const CHALLENGE_POOL: DailyChallenge[] = [
  {
    id: "poke_3",
    title: "Triple Threat",
    description: "Send 3 pokes today",
    icon: "🎯",
    bonusPoints: 3,
    check: (s) => s.pokesToday >= 3,
  },
  {
    id: "poke_5",
    title: "High Five",
    description: "Send 5 pokes today",
    icon: "🖐️",
    bonusPoints: 5,
    check: (s) => s.pokesToday >= 5,
  },
  {
    id: "unique_3",
    title: "Spread the Love",
    description: "Poke 3 different friends today",
    icon: "💕",
    bonusPoints: 3,
    check: (s) => s.uniqueFriendsPokedToday >= 3,
  },
  {
    id: "pokeback_2",
    title: "Quick Draw",
    description: "Poke back 2 friends today",
    icon: "⚡",
    bonusPoints: 3,
    check: (s) => s.pokeBacksToday >= 2,
  },
  {
    id: "variety",
    title: "Mix It Up",
    description: "Use 3 different poke types today",
    icon: "🎨",
    bonusPoints: 3,
    check: (s) => s.differentPokeTypesToday >= 3,
  },
  {
    id: "poke_all",
    title: "No One Left Behind",
    description: "Poke every friend today",
    icon: "🌍",
    bonusPoints: 5,
    check: (s) => s.totalFriends > 0 && s.uniqueFriendsPokedToday >= s.totalFriends,
  },
  {
    id: "poke_1",
    title: "Stay Connected",
    description: "Send at least 1 poke today",
    icon: "👊",
    bonusPoints: 1,
    check: (s) => s.pokesToday >= 1,
  },
  {
    id: "3am_friend",
    title: "The 3AM Friend",
    description: "Poke the friend you'd call at 3am",
    icon: "🌙",
    bonusPoints: 2,
    check: (s) => s.pokesToday >= 1,
  },
  {
    id: "owes_meal",
    title: "Settle Up",
    description: "Poke the person who owes you a meal",
    icon: "🍔",
    bonusPoints: 2,
    check: (s) => s.pokesToday >= 1,
  },
  {
    id: "chaotic_friend",
    title: "Chaos Agent",
    description: "Poke your most chaotic friend",
    icon: "🌪️",
    bonusPoints: 2,
    check: (s) => s.pokesToday >= 1,
  },
  {
    id: "double_tap",
    title: "Double Tap",
    description: "Poke 2 friends within 5 minutes",
    icon: "⚡",
    bonusPoints: 3,
    check: (s) => s.pokesToday >= 2,
  },
  {
    id: "emotion_day",
    title: "Feelings Day",
    description: "Send a poke with every emotion type",
    icon: "🎭",
    bonusPoints: 5,
    check: (s) => s.differentPokeTypesToday >= 5,
  },
  {
    id: "comeback",
    title: "The Comeback",
    description: "Poke back every friend who poked you",
    icon: "🔄",
    bonusPoints: 3,
    check: (s) => s.pokeBacksToday >= 1 && s.pokeBacksToday >= s.pokesToday,
  },
  {
    id: "ghost_buster",
    title: "Ghost Buster",
    description: "Poke a friend you haven't poked in 3+ days",
    icon: "👻",
    bonusPoints: 3,
    check: (s) => s.pokesToday >= 1,
  },
];

// Deterministic daily challenge based on date
export function getTodaysChallenge(): DailyChallenge {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % CHALLENGE_POOL.length;
  return CHALLENGE_POOL[index];
}

export function getChallengeId(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}
