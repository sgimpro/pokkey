"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SelectedContact {
  name: string
  phone: string
}

const SHARE_PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366', urlFn: (url: string, text: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}` },
  { id: 'telegram', label: 'Telegram', icon: '✈️', color: '#0088cc', urlFn: (url: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  { id: 'twitter', label: 'X / Twitter', icon: '𝕏', color: '#000', urlFn: (url: string, text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  { id: 'facebook', label: 'Facebook', icon: '📘', color: '#1877F2', urlFn: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { id: 'sms', label: 'SMS', icon: '💬', color: '#34C759', urlFn: (url: string, text: string) => `sms:?&body=${encodeURIComponent(text + ' ' + url)}` },
  { id: 'email', label: 'Email', icon: '📧', color: '#FF6B35', urlFn: (url: string, text: string) => `mailto:?subject=${encodeURIComponent("Join me on POKKEY!")}&body=${encodeURIComponent(text + '\n\n' + url)}` },
]

export default function AddFriendPage() {
  const [hasContactPicker, setHasContactPicker] = useState(false)
  const [hasShareAPI, setHasShareAPI] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<SelectedContact[]>([])
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<{ name: string; message: string }[]>([])
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    setHasContactPicker('contacts' in navigator && 'ContactsManager' in window)
    setHasShareAPI('share' in navigator)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (user) {
        setInviteUrl(`${window.location.origin}/invite/${user.id}`)
        // Get name for share text
        supabase.from('users').select('name').eq('id', user.id).single().then(({ data }: any) => {
          if (data?.name) setUserName(data.name)
        })
      }
    })
  }, [])

  const shareText = userName
    ? `${userName} just poked you 👊 Find out who your real friends are — the ones who actually show up. Join POKKEY.`
    : "Find out who your real friends are — the ones who actually show up. 👆 Join POKKEY."

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
          title: 'Join me on POKKEY',
          text: shareText,
          url: inviteUrl
        })
      } catch (err) {
        console.log('Share cancelled:', err)
      }
    }
  }

  const openSharePlatform = (platformId: string) => {
    const platform = SHARE_PLATFORMS.find(p => p.id === platformId)
    if (!platform) return
    const url = platform.urlFn(inviteUrl, shareText)
    window.open(url, '_blank')
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
            <p className="text-center text-xs text-gray-400">Select multiple contacts at once</p>

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

        {/* Divider */}
        {hasContactPicker && (
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or share your invite</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* Mass invite — share to multiple platforms */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">SHARE TO APPS</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {SHARE_PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => openSharePlatform(platform.id)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-xl border border-gray-200 active:scale-95 transition-all"
              >
                <span className="text-2xl">{platform.icon}</span>
                <span className="text-xs font-medium text-gray-600">{platform.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Native share (iOS) */}
        {hasShareAPI && (
          <button
            onClick={shareInvite}
            className="w-full mb-4 py-3.5 bg-white border-2 border-orange-200 text-orange-600 rounded-2xl font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <span className="text-lg">&#128279;</span>
            Share via Other Apps
          </button>
        )}

        {/* Invite link section — always show */}
        <div className="space-y-4">
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
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(inviteUrl)
                } catch {
                  const input = document.getElementById('invite-link') as HTMLInputElement;
                  input.select();
                  document.execCommand('copy');
                }
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
