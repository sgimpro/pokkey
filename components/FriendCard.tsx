"use client";
import { useState } from "react";
import { getTimerStatus, getTimerLabel, statusColors } from "@/lib/timer";

interface FriendCardProps {
  friendship: {
    id: string;
    friend: { id: string; name: string };
    last_nudge_at: string | null;
    streak_count?: number;
  };
  onNudge: (friendshipId: string, friendId: string) => Promise<void>;
}

export default function FriendCard({ friendship, onNudge }: FriendCardProps) {
  const [nudging, setNudging] = useState(false);
  const [justNudged, setJustNudged] = useState(false);
  const status = getTimerStatus(friendship.last_nudge_at);
  const colors = statusColors[status];
  const streak = friendship.streak_count || 0;

  const handleNudge = async () => {
    setNudging(true);
    await onNudge(friendship.id, friendship.friend.id);
    setJustNudged(true);
    setNudging(false);
    setTimeout(() => setJustNudged(false), 2000);
  };

  const initials = friendship.friend.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-2xl border-2 ${colors.bg} ${colors.border} transition-all`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full ${colors.dot} flex items-center justify-center text-white font-bold text-sm`}
        >
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800">
              {friendship.friend.name}
            </p>
            {streak >= 2 && (
              <span className="text-sm font-semibold text-orange-500">
                &#128293; {streak}
              </span>
            )}
          </div>
          <p className={`text-xs ${colors.text}`}>
            {getTimerLabel(friendship.last_nudge_at)}
          </p>
        </div>
      </div>
      <button
        onClick={handleNudge}
        disabled={nudging || justNudged}
        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
          justNudged
            ? "bg-green-500 text-white"
            : "bg-orange-500 text-white active:scale-95"
        } disabled:opacity-70`}
      >
        {nudging ? "..." : justNudged ? "Sent!" : "Poke"}
      </button>
    </div>
  );
}
