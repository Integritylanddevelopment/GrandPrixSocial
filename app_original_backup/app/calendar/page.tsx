import RaceCalendar from "@/components/f1/race-calendar"
import NextRaceCountdown from "@/components/f1/next-race-countdown"

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">F1 Race Calendar</h1>
          <p className="text-gray-400">Complete 2024 Formula 1 race schedule with live updates</p>
        </div>

        {/* Next Race Countdown */}
        <NextRaceCountdown />

        {/* Full Calendar */}
        <RaceCalendar />
      </div>
    </div>
  )
}
