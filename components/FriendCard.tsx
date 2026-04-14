"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { getTimerStatus, getTimerLabel, getCooldownRemaining, statusColors } from "@/lib/timer";
import { POKE_TYPES, type PokeType } from "@/lib/poke-types";

interface FriendCardProps {
  friendship: {
    id: string;
    friend: { id: string; name: string };
    last_nudge_at: string | null;
    streak_count?: number;
  };
  onNudge: (friendshipId: string, friendId: string, pokeType?: string) => Promise<void>;
}

// Mini confetti particle system
function spawnConfetti(container: HTMLDivElement) {
  const colors = ["#FF6B35", "#FFB347", "#FF8C42", "#FFD700", "#FF5E1A", "#FFA07A"];
  const particles: HTMLSpanElement[] = [];

  for (let i = 0; i < 14; i++) {
    const el = document.createElement("span");
    const size = Math.random() * 6 + 4;
    const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.5;
    const velocity = 40 + Math.random() * 60;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 20;

    Object.assign(el.style, {
      position: "absolute",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      left: "50%",
      top: "50%",
      pointerEvents: "none",
      zIndex: "50",
      transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
      transition: "none",
    });

    container.appendChild(el);
    particles.push(el);

    requestAnimationFrame(() => {
      Object.assign(el.style, {
        transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 720}deg) scale(0)`,
        opacity: "0",
      });
    });
  }

  setTimeout(() => {
    particles.forEach((p) => p.remove());
  }, 700);
}

export default function FriendCard({ friendship, onNudge }: FriendCardProps) {
  const [nudging, setNudging] = useState(false);
  const [justNudged, setJustNudged] = useState(false);
  const [lastNudge, setLastNudge] = useState(friendship.last_nudge_at);
  const [cooldown, setCooldown] = useState<string | null>(
    getCooldownRemaining(friendship.last_nudge_at)
  );
  const [bouncing, setBouncing] = useState(false);
  const [showPokeTypes, setShowPokeTypes] = useState(false);
  const [sentEmoji, setSentEmoji] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const status = getTimerStatus(lastNudge);
  const colors = statusColors[status];
  const streak = friendship.streak_count || 0;

  // Update cooldown every 15s
  useEffect(() => {
    const tick = () => setCooldown(getCooldownRemaining(lastNudge));
    tick();
    const interval = setInterval(tick, 15000);
    return () => clearInterval(interval);
  }, [lastNudge]);

  // Close poke types when clicking outside
  useEffect(() => {
    if (!showPokeTypes) return;
    const close = () => setShowPokeTypes(false);
    const timer = setTimeout(() => document.addEventListener("click", close), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", close);
    };
  }, [showPokeTypes]);

  const sendPoke = useCallback(async (pokeType: PokeType) => {
    setShowPokeTypes(false);
    setNudging(true);
    setSentEmoji(pokeType.emoji);

    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 60]);
    }

    setBouncing(true);
    setTimeout(() => setBouncing(false), 500);

    if (btnRef.current) {
      spawnConfetti(btnRef.current);
    }

    await onNudge(friendship.id, friendship.friend.id, pokeType.id);
    const now = new Date().toISOString();
    setLastNudge(now);
    setJustNudged(true);
    setNudging(false);
    setTimeout(() => {
      setJustNudged(false);
      setSentEmoji("");
    }, 2000);
  }, [friendship.id, friendship.friend.id, onNudge]);

  const handleButtonClick = useCallback(() => {
    // Long press or tap opens the type picker
    setShowPokeTypes((prev) => !prev);
  }, []);

  // Quick poke (default type) on single tap of the main button
  const handleQuickPoke = useCallback(() => {
    sendPoke(POKE_TYPES[0]);
  }, [sendPoke]);

  const initials = friendship.friend.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const onCooldown = !!cooldown && !justNudged;

  return (
    <div className="relative">
      <div
        ref={cardRef}
        className={`flex items-center justify-between p-4 rounded-2xl border-2 ${colors.bg} ${colors.border} transition-all`}
        style={{
          animation: bouncing ? "pokeBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
        }}
      >
        <style jsx>{`
          @keyframes pokeBounce {
            0% { transform: scale(1); }
            25% { transform: scale(1.04); }
            50% { transform: scale(0.97); }
            75% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          @keyframes buttonPop {
            0% { transform: scale(1); }
            40% { transform: scale(1.25); }
            100% { transform: scale(1); }
          }
          @keyframes pokeTypesIn {
            from { opacity: 0; transform: translateY(8px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
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
              {getTimerLabel(lastNudge)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick poke button */}
          <button
            ref={btnRef}
            onClick={onCooldown ? undefined : handleQuickPoke}
            disabled={nudging || justNudged || onCooldown}
            className={`relative overflow-visible px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              justNudged
                ? "bg-green-500 text-white"
                : onCooldown
                ? "bg-gray-300 text-gray-500"
                : "bg-orange-500 text-white active:scale-95"
            } disabled:opacity-70`}
            style={{
              animation: justNudged ? "buttonPop 0.3s ease-out" : "none",
            }}
          >
            {nudging ? "..." : justNudged ? (
              <span>Sent! {sentEmoji || "👏"}</span>
            ) : onCooldown ? cooldown : (
              <span>Poke 👊</span>
            )}
          </button>

          {/* More poke types button */}
          {!onCooldown && !justNudged && !nudging && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
              className="w-9 h-9 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center active:scale-95 transition-all text-lg"
              aria-label="More poke types"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Poke type picker */}
      {showPokeTypes && (
        <div
          className="absolute right-0 top-full mt-2 z-40 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 w-64"
          style={{ animation: "pokeTypesIn 0.2s ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-semibold text-gray-400 mb-2 px-1">CHOOSE A POKE</p>
          <div className="grid grid-cols-2 gap-1.5">
            {POKE_TYPES.map((pt) => (
              <button
                key={pt.id}
                onClick={() => sendPoke(pt)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-left"
                style={{ border: `1.5px solid ${pt.color}20` }}
              >
                <span className="text-xl">{pt.emoji}</span>
                <span className="text-xs font-medium text-gray-700 leading-tight">{pt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
