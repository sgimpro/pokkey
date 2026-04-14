"use client";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useState } from "react";

interface BadgeGridProps {
  earnedIds: string[];
  activeTitle: string | null;
  onSetTitle: (title: string | null) => void;
}

export default function BadgeGrid({ earnedIds, activeTitle, onSetTitle }: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const milestones = ACHIEVEMENTS.filter((a) => a.category === "milestone");
  const activities = ACHIEVEMENTS.filter((a) => a.category === "activity");

  const handleBadgeTap = (achievementId: string) => {
    setSelectedBadge(selectedBadge === achievementId ? null : achievementId);
  };

  const handleSetTitle = async (title: string) => {
    const newTitle = activeTitle === title ? null : title;
    onSetTitle(newTitle);
    try {
      await fetch("/api/set-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Milestones */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">MILESTONES</h3>
        <div className="grid grid-cols-3 gap-2">
          {milestones.map((a) => {
            const earned = earnedIds.includes(a.id);
            const selected = selectedBadge === a.id;
            return (
              <button
                key={a.id}
                onClick={() => earned && handleBadgeTap(a.id)}
                className={`relative rounded-2xl p-3 text-center transition-all ${
                  earned
                    ? "bg-orange-50 border-2 border-orange-200 active:scale-95"
                    : "bg-gray-100 border-2 border-gray-200 opacity-40"
                }`}
              >
                <span className="text-2xl block">{a.icon}</span>
                <p className={`text-[10px] font-semibold mt-1 ${earned ? "text-gray-700" : "text-gray-400"}`}>
                  {a.name}
                </p>
                {!earned && (
                  <p className="text-[9px] text-gray-400 mt-0.5">{a.description}</p>
                )}
                {earned && selected && (
                  <div
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg"
                    style={{ animation: "badgeTipIn 0.15s ease-out" }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetTitle(a.title);
                      }}
                      className="font-semibold"
                    >
                      {activeTitle === a.title ? "Remove title" : `Use "${a.title}" title`}
                    </button>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity badges */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">ACHIEVEMENTS</h3>
        <div className="grid grid-cols-3 gap-2">
          {activities.map((a) => {
            const earned = earnedIds.includes(a.id);
            const selected = selectedBadge === a.id;
            return (
              <button
                key={a.id}
                onClick={() => earned && handleBadgeTap(a.id)}
                className={`relative rounded-2xl p-3 text-center transition-all ${
                  earned
                    ? "bg-orange-50 border-2 border-orange-200 active:scale-95"
                    : "bg-gray-100 border-2 border-gray-200 opacity-40"
                }`}
              >
                <span className="text-2xl block">{a.icon}</span>
                <p className={`text-[10px] font-semibold mt-1 ${earned ? "text-gray-700" : "text-gray-400"}`}>
                  {a.name}
                </p>
                {!earned && (
                  <p className="text-[9px] text-gray-400 mt-0.5">{a.description}</p>
                )}
                {earned && selected && (
                  <div
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg"
                    style={{ animation: "badgeTipIn 0.15s ease-out" }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetTitle(a.title);
                      }}
                      className="font-semibold"
                    >
                      {activeTitle === a.title ? "Remove title" : `Use "${a.title}" title`}
                    </button>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes badgeTipIn {
          from { opacity: 0; transform: translate(-50%, 4px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* Progress bar */}
      <div className="bg-gray-100 rounded-xl p-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{earnedIds.length} / {ACHIEVEMENTS.length} unlocked</span>
          <span>{Math.round((earnedIds.length / ACHIEVEMENTS.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${(earnedIds.length / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
