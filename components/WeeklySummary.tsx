"use client";

interface WeeklySummaryProps {
  uniqueFriendsPoked: number;
  totalFriends: number;
  totalPokesThisWeek: number;
  fadingFriendNames: string[];
}

export default function WeeklySummary({
  uniqueFriendsPoked,
  totalFriends,
  totalPokesThisWeek,
  fadingFriendNames,
}: WeeklySummaryProps) {
  if (totalFriends === 0) return null;

  const coverage = Math.round((uniqueFriendsPoked / totalFriends) * 100);
  const allGood = fadingFriendNames.length === 0;

  return (
    <div className="mb-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="text-[10px] font-bold tracking-wider text-gray-400 mb-2">THIS WEEK</p>

        <div className="flex gap-3 mb-3">
          <div className="flex-1 bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-xl font-black text-orange-500">{uniqueFriendsPoked}/{totalFriends}</p>
            <p className="text-[10px] text-gray-500 font-medium">Friends reached</p>
          </div>
          <div className="flex-1 bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-xl font-black text-orange-500">{totalPokesThisWeek}</p>
            <p className="text-[10px] text-gray-500 font-medium">Pokes sent</p>
          </div>
          <div className="flex-1 bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-xl font-black text-orange-500">{coverage}%</p>
            <p className="text-[10px] text-gray-500 font-medium">Coverage</p>
          </div>
        </div>

        {/* Coverage bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              coverage >= 80 ? "bg-green-400" : coverage >= 50 ? "bg-yellow-400" : "bg-red-400"
            }`}
            style={{ width: `${Math.min(coverage, 100)}%` }}
          />
        </div>

        {allGood ? (
          <p className="text-xs text-green-600 font-medium">
            You&apos;re staying connected with everyone! Keep it up.
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            Haven&apos;t heard from:{" "}
            <span className="font-semibold text-red-500">
              {fadingFriendNames.slice(0, 3).join(", ")}
              {fadingFriendNames.length > 3 ? ` +${fadingFriendNames.length - 3} more` : ""}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
