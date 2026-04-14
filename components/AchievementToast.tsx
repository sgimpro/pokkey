"use client";
import { useEffect, useState } from "react";
import type { Achievement } from "@/lib/achievements";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDone: () => void;
}

export default function AchievementToast({ achievement, onDone }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!achievement) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 3500);
    return () => clearTimeout(timer);
  }, [achievement, onDone]);

  if (!achievement) return null;

  return (
    <div
      className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 transition-all duration-400"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(-50%, 0)" : "translate(-50%, -20px)",
      }}
    >
      <div
        className="flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl"
        style={{ minWidth: 260 }}
      >
        <span className="text-3xl">{achievement.icon}</span>
        <div>
          <p className="text-[10px] font-bold text-orange-400 tracking-widest">ACHIEVEMENT UNLOCKED</p>
          <p className="font-bold text-sm">{achievement.name}</p>
          <p className="text-gray-400 text-xs">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}
