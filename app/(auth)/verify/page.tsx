"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleVerify = async () => {
    setLoading(true)
    setError('')
    const phone = localStorage.getItem('pokey_phone') || ''
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    })
    if (error) {
      setError(error.message)
    } else {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user?.id)
        .single()

      if (!profile) {
        router.push('/onboarding')
      } else {
        router.push('/')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-black text-orange-500">PŌKKEY</h1>
          <p className="mt-2 text-gray-600">Enter the code we sent you.</p>
        </div>
        <div className="space-y-4">
          <input
            type="number"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg text-center tracking-widest focus:border-orange-400 focus:outline-none"
            maxLength={6}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-orange-500 text-white rounded-xl text-lg font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  )
}
