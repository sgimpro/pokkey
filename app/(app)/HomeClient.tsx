"use client"
import { useState, useCallback } from 'react'
import FriendCard from '@/components/FriendCard'
import PushPrompt from '@/components/PushPrompt'
import AchievementToast from '@/components/AchievementToast'
import FriendshipHealth from '@/components/FriendshipHealth'
import WeeklySummary from '@/components/WeeklySummary'
import DailyChallenge from '@/components/DailyChallenge'
import { useRouter } from 'next/navigation'
import type { Achievement } from '@/lib/achievements'
interface ChallengeData {
  id: string;
  title: string;
  description: string;
  icon: string;
  bonusPoints: number;
}

interface Props {
  profile: any;
  friendships: any[];
  pendingFriendships: any[];
  weeklySummary: {
    uniqueFriendsPoked: number;
    totalFriends: number;
    totalPokesThisWeek: number;
    fadingFriendNames: string[];
  };
  dailyChallenge: {
    challenge: ChallengeData;
    completed: boolean;
  };
}

export default function HomeClient({
  profile,
  friendships,
  pendingFriendships,
  weeklySummary,
  dailyChallenge,
}: Props) {
  const [localFriendships, setLocalFriendships] = useState(friendships)
  const [toastQueue, setToastQueue] = useState<Achievement[]>([])
  const [currentToast, setCurrentToast] = useState<Achievement | null>(null)
  const router = useRouter()

  const showNextToast = useCallback(() => {
    setToastQueue((prev) => {
      if (prev.length > 0) {
        setCurrentToast(prev[0])
        return prev.slice(1)
      }
      setCurrentToast(null)
      return prev
    })
  }, [])

  const handleNudge = async (friendshipId: string, friendId: string, pokeType?: string) => {
    const res = await fetch('/api/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendshipId, friendId, pokeType: pokeType || 'poke' })
    })
    if (res.ok) {
      setLocalFriendships((prev: any[]) =>
        prev.map(f => f.id === friendshipId
          ? { ...f, last_nudge_at: new Date().toISOString() }
          : f
        )
      )

      // Check for new achievements after each poke
      try {
        const achRes = await fetch('/api/check-achievements', { method: 'POST' })
        if (achRes.ok) {
          const { newAchievements } = await achRes.json()
          if (newAchievements && newAchievements.length > 0) {
            setToastQueue((prev) => {
              const all = [...prev, ...newAchievements]
              if (!currentToast) {
                setCurrentToast(all[0])
                return all.slice(1)
              }
              return all
            })
          }
        }
      } catch {}

      // Check daily challenge
      try {
        await fetch('/api/check-daily-challenge', { method: 'POST' })
      } catch {}
    }
  }

  const handleDelete = async (friendshipId: string) => {
    try {
      const res = await fetch('/api/delete-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId })
      })
      if (res.ok) {
        setLocalFriendships((prev: any[]) => prev.filter(f => f.id !== friendshipId))
      }
    } catch {}
  }

  const handleAccept = async (friendshipId: string) => {
    await fetch('/api/accept-friendship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendshipId })
    })
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Achievement toast */}
      <AchievementToast achievement={currentToast} onDone={showNextToast} />

      <div className="max-w-md mx-auto p-4 pb-24">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-black text-orange-500">POKKEY</h1>
            <p className="text-sm text-gray-500">Hey {profile.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-500">{profile.score}</p>
            <p className="text-xs text-gray-500">points</p>
          </div>
        </div>

        {/* Friendship Health Dashboard */}
        <FriendshipHealth friendships={localFriendships} />

        {/* Daily Challenge */}
        <DailyChallenge
          challenge={dailyChallenge.challenge}
          completed={dailyChallenge.completed}
          userId={profile.id}
        />

        {/* Weekly Summary */}
        <WeeklySummary
          uniqueFriendsPoked={weeklySummary.uniqueFriendsPoked}
          totalFriends={weeklySummary.totalFriends}
          totalPokesThisWeek={weeklySummary.totalPokesThisWeek}
          fadingFriendNames={weeklySummary.fadingFriendNames}
        />

        {pendingFriendships.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">FRIEND REQUESTS</h2>
            {pendingFriendships.map((pf: any) => (
              <div key={pf.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200 mb-2">
                <p className="font-medium">{pf.user.name} wants to connect</p>
                <button onClick={() => handleAccept(pf.id)} className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm font-semibold">Accept</button>
              </div>
            ))}
          </div>
        )}

        <PushPrompt />

        {/* Share invite link */}
        <button
          onClick={async () => {
            const link = `${window.location.origin}/invite/${profile.id}`;
            if (navigator.share) {
              try {
                await navigator.share({
                  title: "POKKEY",
                  text: `${profile.name} just poked you! 👊 Think you can keep up? Join POKKEY and find out who's the ultimate friendship champion.`,
                  url: link,
                });
              } catch {}
            } else {
              await navigator.clipboard.writeText(link);
              alert("Invite link copied!");
            }
          }}
          className="w-full mb-4 py-3 bg-orange-500 text-white rounded-2xl font-bold text-center active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <span>&#128279;</span> Invite a Friend (+10 pts)
        </button>

        <h2 className="text-sm font-semibold text-gray-500 mb-2">YOUR PEOPLE</h2>
        {localFriendships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">&#128064;</p>
            <p className="text-gray-600 mb-4">No friends yet. Add someone!</p>
            <button
              onClick={() => router.push('/add')}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold active:scale-95 transition-transform"
            >
              Add your first friend
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {localFriendships.map((f: any) => (
              <FriendCard key={f.id} friendship={f} onNudge={handleNudge} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
