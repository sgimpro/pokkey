export type TimerStatus = 'green' | 'yellow' | 'red'

export function getTimerStatus(lastNudgeAt: string | null): TimerStatus {
  if (!lastNudgeAt) return 'green'
  const hours = (Date.now() - new Date(lastNudgeAt).getTime()) / (1000 * 60 * 60)
  if (hours < 72) return 'green'
  if (hours < 168) return 'yellow'
  return 'red'
}

export function getTimerLabel(lastNudgeAt: string | null): string {
  if (!lastNudgeAt) return 'New friend — say hi!'
  const ms = Date.now() - new Date(lastNudgeAt).getTime()
  const mins = Math.floor(ms / (1000 * 60))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export function getCooldownRemaining(lastNudgeAt: string | null): string | null {
  if (!lastNudgeAt) return null
  const COOLDOWN_MS = 60 * 60 * 1000 // 1 hour cooldown
  const elapsed = Date.now() - new Date(lastNudgeAt).getTime()
  const remaining = COOLDOWN_MS - elapsed
  if (remaining <= 0) return null
  const mins = Math.floor(remaining / (1000 * 60))
  if (mins >= 60) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }
  return `${mins}m`
}

export const statusColors = {
  green: { bg: 'bg-green-100', border: 'border-green-300', dot: 'bg-green-400', text: 'text-green-700' },
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', dot: 'bg-yellow-400', text: 'text-yellow-700' },
  red: { bg: 'bg-red-100', border: 'border-red-300', dot: 'bg-red-400', text: 'text-red-700' },
}
