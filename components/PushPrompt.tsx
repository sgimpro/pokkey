"use client";
import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show if push is supported and permission hasn't been decided
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "default") {
      // Small delay so it doesn't feel aggressive
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
    // If already granted, silently ensure subscription is saved
    if (Notification.permission === "granted") {
      subscribeSilently();
    }
  }, []);

  async function subscribeSilently() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) return; // Already subscribed

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
    } catch (err) {
      console.log("Push subscription failed:", err);
    }
  }

  async function handleEnable() {
    setShowPrompt(false);
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await subscribeSilently();
    }
  }

  if (!showPrompt) return null;

  return (
    <div className="mb-4 p-4 bg-orange-50 rounded-2xl border border-orange-200">
      <p className="font-semibold text-gray-800 mb-1">
        Get notified when friends poke you
      </p>
      <p className="text-sm text-gray-500 mb-3">
        Turn on notifications so you never miss a poke.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleEnable}
          className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
        >
          Enable
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="px-4 py-2 text-gray-400 text-sm"
        >
          Later
        </button>
      </div>
    </div>
  );
}
