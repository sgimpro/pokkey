export const SCORE_EVENTS = {
  NUDGE_SENT: 1,
  NUDGE_RECIPROCATED: 2,
  FRIENDSHIP_STREAK_7_DAYS: 5,
  NEW_USER_INVITED: 10,
  JOINED_VIA_INVITE: 5,
  // Decay: points lost per ignored poke (received but not poked back within 48h)
  IGNORED_POKE_DECAY: 2,
  // Max decay per day per user (prevents massive drops)
  MAX_DAILY_DECAY: 10,
}
