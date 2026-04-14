"use client";
import { useRef, useState } from "react";

interface ScoreCardProps {
  name: string;
  score: number;
  rank: number;
  totalUsers: number;
  friendsCount: number;
  bestStreak: number;
  weeklyActivity: boolean[]; // 7 booleans, Mon-Sun
  responseRate: number; // 0-100
  profileId: string;
}

export default function ScoreCard({
  name,
  score,
  rank,
  totalUsers,
  friendsCount,
  bestStreak,
  weeklyActivity,
  responseRate,
  profileId,
}: ScoreCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shared, setShared] = useState(false);

  const percentile =
    totalUsers > 1 ? Math.max(1, Math.round((rank / totalUsers) * 100)) : 1;

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const handleShare = async () => {
    const link = `${window.location.origin}/invite/${profileId}`;
    const text = `My Poking score is ${score.toLocaleString()}. I dare you to beat it. Think you Poke? 👊`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "POKKEY — Poking Champion",
          text,
          url: link,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${link}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="mb-6">
      <div
        ref={cardRef}
        className="rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FF6B35 0%, #FF8C60 25%, #E8556D 50%, #FFB347 75%, #FFD700 100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <p
            className="font-black text-white text-sm tracking-widest"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
          >
            POKKEY
          </p>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(4px)",
              color: "#fff",
              letterSpacing: "0.05em",
            }}
          >
            🏆 POKING CHAMPION
          </div>
        </div>

        {/* Score */}
        <div className="px-5 pt-2 pb-1">
          <p
            className="text-white text-xs font-semibold tracking-wider"
            style={{ opacity: 0.85 }}
          >
            MY POKE SCORE
          </p>
          <p
            className="text-white font-black leading-none"
            style={{
              fontSize: "4rem",
              textShadow: "0 2px 10px rgba(0,0,0,0.12)",
              letterSpacing: "-2px",
            }}
          >
            {score.toLocaleString()}
          </p>
          <p className="text-white text-sm mt-1" style={{ opacity: 0.85 }}>
            Top {percentile}% in my circle
          </p>
          <div
            className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
            }}
          >
            👑 RANK #{rank}
          </div>
        </div>

        {/* Stats Row */}
        <div
          className="mx-5 mt-4 flex rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
        >
          <div className="flex-1 text-center py-3 border-r border-white/20">
            <p className="text-white font-black text-2xl">{bestStreak}</p>
            <p className="text-white text-[10px] font-semibold tracking-wide" style={{ opacity: 0.8 }}>
              DAY STREAK
            </p>
          </div>
          <div className="flex-1 text-center py-3 border-r border-white/20">
            <p className="text-white font-black text-2xl">{friendsCount}</p>
            <p className="text-white text-[10px] font-semibold tracking-wide" style={{ opacity: 0.8 }}>
              FRIENDS
            </p>
          </div>
          <div className="flex-1 text-center py-3">
            <p className="text-white font-black text-2xl">{responseRate}%</p>
            <p className="text-white text-[10px] font-semibold tracking-wide" style={{ opacity: 0.8 }}>
              RESPONSE
            </p>
          </div>
        </div>

        {/* Streak This Week */}
        <div className="px-5 mt-4">
          <p className="text-white text-xs font-semibold tracking-wider mb-2" style={{ opacity: 0.85 }}>
            🔥 STREAK THIS WEEK
          </p>
          <div className="flex gap-1.5">
            {weeklyActivity.map((active, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full h-3 rounded-full"
                  style={{
                    background: active
                      ? i < 3
                        ? "#FF4500"
                        : i < 5
                        ? "#FF6B35"
                        : "#FFD700"
                      : "rgba(255,255,255,0.2)",
                  }}
                />
                <span className="text-white text-[9px] font-medium" style={{ opacity: 0.6 }}>
                  {dayLabels[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Share Quote */}
        <div className="px-5 mt-4 pb-5">
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.92)",
              borderLeft: "3px solid #FF6B35",
            }}
          >
            <p className="text-gray-700 text-sm leading-relaxed">
              &quot;My Poking score is{" "}
              <span className="font-bold text-orange-500">{score.toLocaleString()}</span>.
              I dare you to beat it. 👊
              <br />
              Think you Poke?&quot;
            </p>
          </div>
          <p
            className="text-center text-white text-xs font-bold mt-3 tracking-widest"
            style={{ opacity: 0.5 }}
          >
            POKKEY.APP
          </p>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="w-full mt-3 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-center active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {shared ? (
          "Copied! 🎉"
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share My Score
          </>
        )}
      </button>
    </div>
  );
}
