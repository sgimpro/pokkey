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
    emoji: "👊",
    label: "Poke",
    notificationText: "poked",
    color: "#FF6B35",
  },
  {
    id: "wave",
    emoji: "👋",
    label: "Wave",
    notificationText: "waved at",
    color: "#FFB347",
  },
  {
    id: "thinking",
    emoji: "💭",
    label: "Thinking of you",
    notificationText: "is thinking of",
    color: "#9B59B6",
  },
  {
    id: "hangout",
    emoji: "🍻",
    label: "Let's hang",
    notificationText: "wants to hang with",
    color: "#3498DB",
  },
  {
    id: "hug",
    emoji: "🤗",
    label: "Hug",
    notificationText: "sent a hug to",
    color: "#E91E63",
  },
  {
    id: "highfive",
    emoji: "🙌",
    label: "High five",
    notificationText: "high-fived",
    color: "#2ECC71",
  },
  {
    id: "fire",
    emoji: "🔥",
    label: "You're on fire",
    notificationText: "hyped up",
    color: "#FF4500",
  },
  {
    id: "miss",
    emoji: "🥺",
    label: "Miss you",
    notificationText: "misses",
    color: "#E67E22",
  },
];

export function getPokeType(id: string): PokeType {
  return POKE_TYPES.find((p) => p.id === id) || POKE_TYPES[0];
}
