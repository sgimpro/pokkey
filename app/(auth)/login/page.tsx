"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const COUNTRY_CODES = [
  { code: "+65", label: "SG +65", flag: "\u{1F1F8}\u{1F1EC}" },
  { code: "+1", label: "US +1", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "+44", label: "UK +44", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "+60", label: "MY +60", flag: "\u{1F1F2}\u{1F1FE}" },
  { code: "+61", label: "AU +61", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "+91", label: "IN +91", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "+81", label: "JP +81", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "+82", label: "KR +82", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "+86", label: "CN +86", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "+63", label: "PH +63", flag: "\u{1F1F5}\u{1F1ED}" },
  { code: "+66", label: "TH +66", flag: "\u{1F1F9}\u{1F1ED}" },
  { code: "+62", label: "ID +62", flag: "\u{1F1EE}\u{1F1E9}" },
];

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+65");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/");
      } else {
        setChecking(false);
      }
    });
  }, []);

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    const digits = phone.replace(/[\s\-\(\)]/g, "");
    const formatted = digits.startsWith("+") ? digits : `${countryCode}${digits}`;
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: formatted,
    });
    if (otpError) {
      setError(otpError.message);
    } else {
      localStorage.setItem("pokey_phone", formatted);
      // Pass through inviter if present
      const inviter = new URLSearchParams(window.location.search).get("inviter");
      if (inviter) {
        localStorage.setItem("pokey_inviter", inviter);
      }
      router.push("/verify");
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <h1 className="text-5xl font-black text-orange-500">PŌKKEY</h1>
      </div>
    );
  }

  const selected = COUNTRY_CODES.find((c) => c.code === countryCode);

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-black text-orange-500">PŌKKEY</h1>
          <p className="mt-2 text-gray-600 text-lg">
            {"Don't lose your people."}
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-3 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-orange-400 focus:outline-none bg-white"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-orange-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleSendOTP}
            disabled={loading || !phone}
            className="w-full py-3 bg-orange-500 text-white rounded-xl text-lg font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {loading ? "Sending..." : "Get Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
