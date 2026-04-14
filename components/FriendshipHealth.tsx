"use client";
import { getTimerStatus } from "@/lib/timer";

interface FriendshipHealthProps {
  friendships: {
    id: string;
    friend: { id: string; name: string };
    last_nudge_at: string | null;
    streak_count?: number;
  }[];
}

export default function FriendshipHealth({ friendships }: FriendshipHealthProps) {
  if (friendships.length === 0) return null;

  const green = friendships.filter((f) => getTimerStatus(f.last_nudge_at) === "green");
  const yellow = friendships.filter((f) => getTimerStatus(f.last_nudge_at) === "yellow");
  const red = friendships.filter((f) => getTimerStatus(f.last_nudge_at) === "red");

  const total = friendships.length;
  const healthScore = Math.round(((green.length * 1 + yellow.length * 0.5) / total) * 100);

  // Determine overall mood
  let mood = "💚";
  let moodLabel = "All good!";
  let moodColor = "#22C55E";
  if (red.length > 0 && red.length >= total * 0.5) {
    mood = "💔";
    moodLabel = `${red.length} friend${red.length > 1 ? "s" : ""} fading`;
    moodColor = "#EF4444";
  } else if (red.length > 0) {
    mood = "💛";
    moodLabel = `${red.length} need${red.length === 1 ? "s" : ""} attention`;
    moodColor = "#F59E0B";
  } else if (yellow.length > 0) {
    mood = "💛";
    moodLabel = "Almost perfect";
    moodColor = "#F59E0B";
  }

  return (
    <div className="mb-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{mood}</span>
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-wider">FRIENDSHIP HEALTH</p>
              <p className="text-sm font-semibold" style={{ color: moodColor }}>{moodLabel}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black" style={{ color: moodColor }}>{healthScore}%</p>
          </div>
        </div>

        {/* Health bar */}
        <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-gray-100">
          {green.length > 0 && (
            <div
              className="bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${(green.length / total) * 100}%` }}
            />
          )}
          {yellow.length > 0 && (
            <div
              className="bg-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${(yellow.length / total) * 100}%` }}
            />
          )}
          {red.length > 0 && (
            <div
              className="bg-red-400 rounded-full transition-all duration-500"
              style={{ width: `${(red.length / total) * 100}%` }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            {green.length} active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            {yellow.length} cooling
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            {red.length} fading
          </span>
        </div>

        {/* Fading friends alert */}
        {red.length > 0 && (
          <div className="mt-3 bg-red-50 rounded-xl p-3 border border-red-100">
            <p className="text-xs font-semibold text-red-600 mb-1">Don&apos;t lose touch!</p>
            <p className="text-xs text-red-500">
              {red.map((f) => f.friend.name).join(", ")}
              {red.length === 1 ? " hasn't" : " haven't"} heard from you in over a week.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
