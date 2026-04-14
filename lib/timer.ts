export type TimerStatus = 'green' | 'yellow' | 'red'

export function getTimerStatus(lastNudgeAt: string | null): TimerStatus {
  if (!lastNudgeAt) return 'red'
  const hours = (Date.now() - new Date(lastNudgeAt).getTime()) / (1000 * 60 * 60)
  if (hours < 72) return 'green'
  if (hours < 168) return 'yellow'
  return 'red'
}

export function getTimerLabel(lastNudgeAt: string | null): string {
  if (!lastNudgeAt) return 'Never nudged'
  const days = Math.floor((Date.now() - new Date(lastNudgeAt).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export const statusColors = {
  green: { bg: 'bg-green-100', border: 'border-green-300', dot: 'bg-green-400', text: 'text-green-700' },
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', dot: 'bg-yellow-400', text: 'text-yellow-700' },
  red: { bg: 'bg-red-100', border: 'border-red-300', dot: 'bg-red-400', text: 'text-red-700' },
}
