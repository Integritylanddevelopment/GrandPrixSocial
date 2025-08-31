import RealTimeStandings from "@/components/f1/real-time-standings"

export default function StandingsPage() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">F1 Championship Standings</h1>
          <p className="text-gray-400">Live driver and constructor championship standings</p>
        </div>

        <RealTimeStandings />
      </div>
    </div>
  )
}
