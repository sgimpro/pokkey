"use client";
import { useState } from "react";

// Convert UTC hour to local hour for display
function utcToLocal(utcHour: number): number {
  const d = new Date();
  d.setUTCHours(utcHour, 0, 0, 0);
  return d.getHours();
}

// Convert local hour to UTC for storage
function localToUtc(localHour: number): number {
  const d = new Date();
  d.setHours(localHour, 0, 0, 0);
  return d.getUTCHours();
}

function formatHour(h: number): string {
  if (h === 0) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  if (h < 12) return `${h}:00 AM`;
  return `${h - 12}:00 PM`;
}

const HOUR_OPTIONS = [
  { label: "Off", value: null },
  { label: "9:00 AM", value: 9 },
  { label: "12:00 PM", value: 12 },
  { label: "6:00 PM", value: 18 },
  { label: "9:00 PM", value: 21 },
];

export default function ReminderSetting({
  initialHour,
}: {
  initialHour: number | null;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedLocal, setSelectedLocal] = useState<number | null>(
    initialHour !== null ? utcToLocal(initialHour) : null
  );

  const handleChange = async (localHour: number | null) => {
    setSelectedLocal(localHour);
    setSaving(true);
    setSaved(false);

    const utcHour = localHour !== null ? localToUtc(localHour) : null;

    await fetch("/api/set-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderHour: utcHour }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-800">Daily Reminder</p>
          <p className="text-xs text-gray-500">
            {selectedLocal !== null
              ? "We'll nudge you if you haven't poked anyone"
              : "Get a daily push to stay connected"}
          </p>
        </div>
        {saving && <span className="text-xs text-gray-400">Saving...</span>}
        {saved && <span className="text-xs text-green-500">Saved!</span>}
      </div>
      <div className="flex gap-2 flex-wrap">
        {HOUR_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleChange(opt.value)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedLocal === opt.value
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 active:scale-95"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
