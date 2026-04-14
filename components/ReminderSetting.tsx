"use client";
import { useState } from "react";

export default function ReminderSetting({
  initialHour,
}: {
  initialHour: number | null;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enabled, setEnabled] = useState(initialHour !== null);

  const handleToggle = async () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    setSaving(true);
    setSaved(false);

    // Store 9 (arbitrary) when enabled, null when disabled
    const utcHour = newEnabled ? 9 : null;

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
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">Daily Reminder</p>
          <p className="text-xs text-gray-500">
            {enabled
              ? "We'll nudge you if you haven't poked anyone"
              : "Get a daily push to stay connected"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-gray-400">Saving...</span>}
          {saved && <span className="text-xs text-green-500">Saved!</span>}
          <button
            onClick={handleToggle}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              enabled ? "bg-orange-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
