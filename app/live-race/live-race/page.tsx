import LiveRaceTracker from "@/components/racing/live-race-tracker"

export default function LiveRacePage() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Live Race Tracking</h1>
          <p className="text-gray-400">Follow the action in real-time</p>
        </div>

        <LiveRaceTracker />
      </div>
    </div>
  )
}
