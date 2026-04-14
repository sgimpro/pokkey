import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (!configured) {
    webpush.setVapidDetails(
      "mailto:sgimpro@gmail.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    configured = true;
  }
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string }
) {
  ensureConfigured();
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}
