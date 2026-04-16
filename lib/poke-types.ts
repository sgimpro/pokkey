export interface PokeType {
  id: string;
  emoji: string;
  label: string;
  notificationText: string; // "{name} just {text} you!"
  color: string; // accent color for UI
}

export const POKE_TYPES: PokeType[] = [
  {
    id: "poke",
    emoji: "👆",
    label: "Just poking",
    notificationText: "poked",
    color: "#FF6B35",
  },
  {
    id: "thinking",
    emoji: "😂",
    label: "Made me think of you",
    notificationText: "was thinking of",
    color: "#9B59B6",
  },
  {
    id: "fire",
    emoji: "🔥",
    label: "Don't break our streak",
    notificationText: "wants to keep the streak with",
    color: "#FF4500",
  },
  {
    id: "whereuat",
    emoji: "👀",
    label: "Where you at",
    notificationText: "is looking for",
    color: "#3498DB",
  },
  {
    id: "miss",
    emoji: "❤️",
    label: "Miss you",
    notificationText: "misses",
    color: "#E91E63",
  },
  {
    id: "celebrate",
    emoji: "🎉",
    label: "Celebrating you",
    notificationText: "is celebrating",
    color: "#2ECC71",
  },
  {
    id: "hangout",
    emoji: "🍻",
    label: "Let's hang",
    notificationText: "wants to hang with",
    color: "#FFB347",
  },
  {
    id: "hug",
    emoji: "🤗",
    label: "Sending a hug",
    notificationText: "sent a hug to",
    color: "#E67E22",
  },
];

export function getPokeType(id: string): PokeType {
  return POKE_TYPES.find((p) => p.id === id) || POKE_TYPES[0];
}
