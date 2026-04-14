"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SelectedContact {
  name: string
  phone: string
}

export default function AddFriendPage() {
  const [hasContactPicker, setHasContactPicker] = useState(false)
  const [hasShareAPI, setHasShareAPI] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<SelectedContact[]>([])
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<{ name: string; message: string }[]>([])
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Feature detection
    setHasContactPicker('contacts' in navigator && 'ContactsManager' in window)
    setHasShareAPI('share' in navigator)

    // Build invite URL with user ID
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (user) {
        setInviteUrl(`${window.location.origin}/invite/${user.id}`)
      }
    })
  }, [])

  const pickContacts = async () => {
    try {
      const contacts = await (navigator as any).contacts.select(
        ['name', 'tel'],
        { multiple: true }
      )

      const parsed: SelectedContact[] = contacts
        .filter((c: any) => c.tel && c.tel.length > 0)
        .map((c: any) => ({
          name: c.name?.[0] || 'Friend',
          phone: c.tel[0]
        }))

      setSelectedContacts(parsed)
    } catch (err) {
      console.log('Contact picker cancelled or failed:', err)
    }
  }

  const sendInvites = async () => {
    setSending(true)
    const newResults: { name: string; message: string }[] = []

    for (const contact of selectedContacts) {
      try {
        const res = await fetch('/api/add-friend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: contact.phone, name: contact.name })
        })
        const data = await res.json()
        newResults.push({
          name: contact.name,
          message: res.ok ? data.message : data.error
        })
      } catch {
        newResults.push({ name: contact.name, message: 'Failed to send' })
      }
    }

    setResults(newResults)
    setSelectedContacts([])
    setSending(false)
  }

  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on PŌKKEY',
          text: "I'm using PŌKKEY to stay connected with friends. Join me!",
          url: inviteUrl
        })
      } catch (err) {
        console.log('Share cancelled:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 pb-24">
        <div className="flex items-center gap-3 py-4">
          <button onClick={() => router.back()} className="text-gray-500 text-xl">&larr;</button>
          <h1 className="text-xl font-bold">Add Friends</h1>
        </div>

        {/* Contact Picker — shows on Android */}
        {hasContactPicker && (
          <div className="space-y-4 mb-6">
            <button
              onClick={pickContacts}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl text-lg font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <span className="text-xl">&#128100;</span>
              Choose from Contacts
            </button>

            {selectedContacts.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 font-semibold">
                  {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
                </p>
                {selectedContacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-gray-400">{c.phone}</p>
                    </div>
                    <button
                      onClick={() => setSelectedContacts(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-gray-400 text-lg"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  onClick={sendInvites}
                  disabled={sending}
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {sending ? 'Sending invites...' : `Send ${selectedContacts.length} invite${selectedContacts.length > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Share button — works on iOS and as fallback */}
        {hasShareAPI && (
          <div className="space-y-2">
            {hasContactPicker && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            <button
              onClick={shareInvite}
              className={`w-full py-4 rounded-2xl text-lg font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 ${
                hasContactPicker
                  ? 'bg-white border-2 border-gray-200 text-gray-700'
                  : 'bg-orange-500 text-white'
              }`}
            >
              <span className="text-xl">&#128279;</span>
              Share Invite Link
            </button>
            <p className="text-center text-sm text-gray-400">
              Send via iMessage, WhatsApp, or any app
            </p>
          </div>
        )}

        {/* Invite link section — always show */}
        <div className="space-y-4 mt-4">
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
            <p className="text-sm text-gray-600 mb-3">Your invite link:</p>
            <input
              id="invite-link"
              type="text"
              value={inviteUrl}
              readOnly
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-2"
            />
            <button
              onClick={() => {
                const input = document.getElementById('invite-link') as HTMLInputElement;
                input.select();
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">RESULTS</h2>
            {results.map((r, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-gray-200">
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-green-600">{r.message}</p>
              </div>
            ))}
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 mt-4 bg-orange-500 text-white rounded-xl font-semibold"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
