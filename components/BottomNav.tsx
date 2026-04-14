"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Home', icon: '&#128101;' },
  { href: '/add', label: 'Add', icon: '&#10133;' },
  { href: '/leaderboard', label: 'Scores', icon: '&#127942;' },
  { href: '/guide', label: 'Guide', icon: '&#128161;' },
  { href: '/profile', label: 'Profile', icon: '&#128100;' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors ${
              path === tab.href ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <span className="text-xl" dangerouslySetInnerHTML={{ __html: tab.icon }} />
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
