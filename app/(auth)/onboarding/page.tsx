"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleCreateProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const phone = localStorage.getItem("pokey_phone") || "";
    await supabase.from("users").insert({
      id: user.id,
      name,
      phone,
      score: 0,
    });

    // Check for pending invites by phone number
    await fetch("/api/accept-pending-invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, userId: user.id }),
    });

    // Also check if they came via an invite link
    const inviterId = localStorage.getItem("pokey_inviter");
    if (inviterId && inviterId !== user.id) {
      await fetch("/api/accept-invite-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviterId }),
      });
      localStorage.removeItem("pokey_inviter");
    }

    router.push("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <p className="text-6xl">&#128075;</p>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            What should we call you?
          </h2>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-orange-400 focus:outline-none"
          />
          <button
            onClick={handleCreateProfile}
            disabled={loading || !name.trim()}
            className="w-full py-3 bg-orange-500 text-white rounded-xl text-lg font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {loading ? "Setting up..." : "Let's go"}
          </button>
        </div>
      </div>
    </div>
  );
}
