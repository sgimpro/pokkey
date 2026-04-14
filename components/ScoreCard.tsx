"use client";
import { useRef, useState, useCallback } from "react";

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
  activeTitle?: string | null;
}

// Dynamically load html2canvas only when needed
async function captureCardImage(element: HTMLElement): Promise<Blob | null> {
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
    });
  } catch {
    return null;
  }
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
  activeTitle,
}: ScoreCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [copied, setCopied] = useState(false);

  const percentile =
    totalUsers > 1 ? Math.max(1, Math.round((rank / totalUsers) * 100)) : 1;

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const shareLink = typeof window !== "undefined"
    ? `${window.location.origin}/invite/${profileId}`
    : `/invite/${profileId}`;

  const shareText = `My Poking score is ${score.toLocaleString()}. I dare you to beat it. Think you Poke?`;

  // Share with image via Web Share API (Instagram, TikTok, etc.)
  const shareWithImage = useCallback(async () => {
    if (!cardRef.current) return;
    setGeneratingImage(true);
    try {
      const blob = await captureCardImage(cardRef.current);
      if (blob && navigator.canShare) {
        const file = new File([blob], "pokkey-score.png", { type: "image/png" });
        const shareData = {
          title: "POKKEY — Poking Champion",
          text: `${shareText}\n${shareLink}`,
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setShowShareSheet(false);
          return;
        }
      }
      // Fallback: share without image
      if (navigator.share) {
        await navigator.share({
          title: "POKKEY — Poking Champion",
          text: shareText,
          url: shareLink,
        });
        setShowShareSheet(false);
      }
    } catch {
      // User cancelled or error
    } finally {
      setGeneratingImage(false);
    }
  }, [shareText, shareLink]);

  // Platform-specific share handlers
  const shareToTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareLink)}`;
    window.open(url, "_blank", "width=600,height=400");
    setShowShareSheet(false);
  }, [shareText, shareLink]);

  const shareToFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
    setShowShareSheet(false);
  }, [shareText, shareLink]);

  const shareToWhatsApp = useCallback(() => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareLink}`)}`;
    window.open(url, "_blank");
    setShowShareSheet(false);
  }, [shareText, shareLink]);

  const shareToTelegram = useCallback(() => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
    setShowShareSheet(false);
  }, [shareText, shareLink]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = `${shareText}\n${shareLink}`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText, shareLink]);

  // Download card as image
  const downloadImage = useCallback(async () => {
    if (!cardRef.current) return;
    setGeneratingImage(true);
    try {
      const blob = await captureCardImage(cardRef.current);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pokkey-score.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Error generating image
    } finally {
      setGeneratingImage(false);
    }
  }, []);

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
            🏆 {activeTitle || "POKING CHAMPION"}
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
        onClick={() => setShowShareSheet(true)}
        className="w-full mt-3 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-center active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
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
      </button>

      {/* Share Sheet Overlay */}
      {showShareSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowShareSheet(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" style={{ animation: "sssFadeIn 0.2s ease-out" }} />

          {/* Sheet */}
          <div
            className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "sssSlideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)" }}
          >
            <style jsx>{`
              @keyframes sssFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes sssSlideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>

            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            <p className="text-center font-bold text-gray-800 text-lg mb-1">Share Your Score</p>
            <p className="text-center text-gray-400 text-sm mb-5">Challenge your friends to beat it!</p>

            {/* Social Platform Grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {/* Instagram — share as image via native share */}
              <button
                onClick={shareWithImage}
                disabled={generatingImage}
                className="flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCB045)" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <span className="text-[11px] text-gray-600 font-medium">Instagram</span>
              </button>

              {/* Facebook */}
              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#1877F2" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-[11px] text-gray-600 font-medium">Facebook</span>
              </button>

              {/* X / Twitter */}
              <button
                onClick={shareToTwitter}
                className="flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-black">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-[11px] text-gray-600 font-medium">X / Twitter</span>
              </button>

              {/* TikTok — share as image via native share */}
              <button
                onClick={shareWithImage}
                disabled={generatingImage}
                className="flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-black">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.88a8.28 8.28 0 004.86 1.56v-3.45a4.85 4.85 0 01-1.1-.3z"/>
                  </svg>
                </div>
                <span className="text-[11px] text-gray-600 font-medium">TikTok</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={shareToWhatsApp}
                className="flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#25D366" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-[11px] text-gray-600 font-medium">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                onClick={shareToTelegram}
                className="flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#0088cc" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <span className="text-[11px] text-gray-600 font-medium">Telegram</span>
              </button>

              {/* Save Image */}
              <button
                onClick={downloadImage}
                disabled={generatingImage}
                className="flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-700">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <span className="text-[11px] text-gray-600 font-medium">Save Image</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={copyLink}
                className="flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-500">
                  {copied ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] text-gray-600 font-medium">{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            {/* Loading indicator */}
            {generatingImage && (
              <p className="text-center text-gray-400 text-xs mb-3">Generating image...</p>
            )}

            {/* Cancel button */}
            <button
              onClick={() => setShowShareSheet(false)}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-semibold text-center active:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
