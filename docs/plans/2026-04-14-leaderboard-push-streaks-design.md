# Design: Leaderboard Upgrade, Push Notifications, Streaks

## 1. Leaderboard — Dual View

### This Week's MVP
- Query `nudges` table for nudges sent since Monday 00:00 UTC
- Calculate points per user (1pt per nudge sent, 2pt for reciprocated)
- Show top scorer in a highlighted card at top of leaderboard
- Resets every Monday automatically (no cron needed, query-based)

### All-Time Rankings
- Existing leaderboard stays as-is below the weekly MVP section
- Medals for top 3, orange highlight for current user

## 2. Push Notifications

### Service Worker (`public/sw.js`)
- Listen for `push` events, show notification with sender name
- Handle `notificationclick` to open app

### Subscribe Flow
- After login, prompt for notification permission
- Save subscription JSON to `push_subscriptions` table
- Component: `PushPrompt.tsx` shown on home page

### Sending Push
- In `/api/nudge`, after SMS, also send web push via `web-push` library
- Try push first; SMS is fallback for users without push enabled
- VAPID keys stored in env vars

### VAPID Keys
- Generate once via `web-push generate-vapid-keys`
- Add to `.env.local` and Vercel env vars

## 3. Streaks

### Database Changes
- Add `streak_count INTEGER DEFAULT 0` to `friendships`
- Add `streak_updated_at TIMESTAMPTZ` to `friendships`

### Logic (in `/api/nudge`)
1. When user A pokes user B:
   - Check if B poked A within last 72 hours
   - If yes AND streak_updated_at is >24hrs ago (or null): increment streak_count, update streak_updated_at
   - If no recent mutual poke and gap >72hrs: reset streak_count to 0
2. At streak_count = 7: award FRIENDSHIP_STREAK_7_DAYS (5pts)

### UI
- FriendCard shows flame + streak number when streak >= 2
- e.g. "🔥 5" next to friend name

## Files to Create/Modify
- `public/sw.js` — new service worker
- `app/api/push/subscribe/route.ts` — new API
- `lib/push.ts` — web-push helper
- `components/PushPrompt.tsx` — notification permission UI
- `app/api/nudge/route.ts` — add push + streak logic
- `components/FriendCard.tsx` — add streak display
- `app/(app)/leaderboard/page.tsx` — dual view
- `app/(app)/HomeClient.tsx` — include PushPrompt
- `supabase/migrations/add-streaks.sql` — schema change
