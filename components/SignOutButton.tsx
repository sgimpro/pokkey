"use client"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold active:scale-[0.98] transition-transform"
    >
      Sign Out
    </button>
  )
}
