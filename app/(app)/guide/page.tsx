export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 pb-24">
        <h1 className="text-xl font-bold py-4">How POKKEY Works</h1>

        {/* Core concept */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
          <p className="text-2xl mb-2">&#128075;</p>
          <h2 className="font-bold text-lg text-gray-800">Poke your people</h2>
          <p className="text-gray-500 mt-1">
            Tap a friend to send them a poke. It&apos;s your way of saying
            &quot;hey, I&apos;m thinking of you.&quot; They&apos;ll get a notification instantly.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
          <p className="text-2xl mb-2">&#128260;</p>
          <h2 className="font-bold text-lg text-gray-800">Poke back</h2>
          <p className="text-gray-500 mt-1">
            When a friend pokes you, poke them back within 24 hours to earn bonus points.
            Keep the loop going!
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-4">
          <p className="text-2xl mb-2">&#128293;</p>
          <h2 className="font-bold text-lg text-gray-800">Build streaks</h2>
          <p className="text-gray-500 mt-1">
            Poke each other within 3 days to keep your streak alive.
            Hit a 7-day streak and you both earn 5 bonus points!
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-6">
          <p className="text-2xl mb-2">&#128279;</p>
          <h2 className="font-bold text-lg text-gray-800">Invite friends</h2>
          <p className="text-gray-500 mt-1">
            Share your invite link from the home screen. When someone signs up
            through your link, you&apos;re instantly connected and you earn 10 points.
          </p>
        </div>

        {/* Points breakdown */}
        <h2 className="text-sm font-semibold text-gray-500 mb-2">POINTS</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-xl">&#128073;</span>
              <span className="text-gray-700">Send a poke</span>
            </div>
            <span className="font-bold text-orange-500">+1</span>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-xl">&#128260;</span>
              <span className="text-gray-700">Poke back within 24h</span>
            </div>
            <span className="font-bold text-orange-500">+2</span>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-xl">&#128293;</span>
              <span className="text-gray-700">7-day streak bonus</span>
            </div>
            <span className="font-bold text-orange-500">+5</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">&#127881;</span>
              <span className="text-gray-700">Invite a friend</span>
            </div>
            <span className="font-bold text-orange-500">+10</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t lose your people. &#129293;
        </p>
      </div>
    </div>
  );
}
