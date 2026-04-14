"use client";
import { useState, useEffect } from "react";
import type { DailyChallenge as ChallengeType } from "@/lib/daily-challenges";

interface DailyChallengeProps {
  challenge: ChallengeType;
  completed: boolean;
  userId: string;
}

export default function DailyChallenge({ challenge, completed: initialCompleted, userId }: DailyChallengeProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [checking, setChecking] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // Poll for completion every 30s if not completed
  useEffect(() => {
    if (completed) return;
    const check = async () => {
      setChecking(true);
      try {
        const res = await fetch("/api/check-daily-challenge", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data.completed && !completed) {
            setCompleted(true);
            setJustCompleted(true);
            setTimeout(() => setJustCompleted(false), 3000);
          }
        }
      } catch {} finally {
        setChecking(false);
      }
    };

    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [completed]);

  return (
    <div className="mb-4">
      <div
        className={`rounded-2xl border-2 p-4 transition-all ${
          completed
            ? "bg-green-50 border-green-200"
            : "bg-white border-orange-200"
        }`}
        style={{
          animation: justCompleted ? "challengeComplete 0.5s ease-out" : "none",
        }}
      >
        <style jsx>{`
          @keyframes challengeComplete {
            0% { transform: scale(1); }
            30% { transform: scale(1.03); }
            60% { transform: scale(0.98); }
            100% { transform: scale(1); }
          }
        `}</style>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
              completed ? "bg-green-100" : "bg-orange-100"
            }`}>
              {completed ? "✅" : challenge.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-gray-400">
                TODAY&apos;S CHALLENGE
              </p>
              <p className={`font-bold text-sm ${completed ? "text-green-700" : "text-gray-800"}`}>
                {challenge.title}
              </p>
              <p className="text-xs text-gray-500">{challenge.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-lg font-black ${completed ? "text-green-500" : "text-orange-500"}`}>
              +{challenge.bonusPoints}
            </p>
            <p className="text-[10px] text-gray-400">
              {completed ? "EARNED" : "pts"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
