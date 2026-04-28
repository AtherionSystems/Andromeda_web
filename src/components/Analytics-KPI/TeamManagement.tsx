import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── helpers ────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

// ─── MiniCalendar ───────────────────────────────────────────────────────────

interface MiniCalendarProps {
  year: number
  month: number
  selectedDay?: number
  onSelectDay?: (day: number) => void
  highlightedDays?: number[]
}

function MiniCalendar({
  year,
  month,
  selectedDay,
  onSelectDay,
  highlightedDays = [],
}: MiniCalendarProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="w-full">
      {/* Day-of-week header */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {DAYS.map((d) => (
          <span key={d} className="text-[10px] font-medium text-muted-foreground">
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {cells.map((day, idx) =>
          day === null ? (
            <span key={`empty-${idx}`} />
          ) : (
            <button
              key={day}
              onClick={() => onSelectDay?.(day)}
              className={cn(
                "mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors hover:bg-muted",
                selectedDay === day &&
                  "bg-primary text-primary-foreground font-semibold hover:bg-primary",
                highlightedDays.includes(day) &&
                  selectedDay !== day &&
                  "bg-primary/10 text-primary font-medium",
              )}
            >
              {day}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

// ─── TeamManagement ─────────────────────────────────────────────────────────

export function TeamManagement() {
  const today = new Date()
  const [baseYear, setBaseYear] = useState(today.getFullYear())
  const [baseMonth, setBaseMonth] = useState(today.getMonth()) // shows month & month+1

  const [selectedA, setSelectedA] = useState<number | undefined>(today.getDate())
  const [selectedB, setSelectedB] = useState<number | undefined>(undefined)

  const secondMonth = baseMonth === 11 ? 0 : baseMonth + 1
  const secondYear = baseMonth === 11 ? baseYear + 1 : baseYear

  const prev = () => {
    if (baseMonth === 0) { setBaseMonth(11); setBaseYear((y) => y - 1) }
    else setBaseMonth((m) => m - 1)
  }
  const next = () => {
    if (baseMonth === 11) { setBaseMonth(0); setBaseYear((y) => y + 1) }
    else setBaseMonth((m) => m + 1)
  }

  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-lg border border-[#C2D4D4] bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Team management</CardTitle>
        <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
          Notify team members about their progress and upcoming changes in work load.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" onClick={prev} className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            {MONTHS[baseMonth]} {baseYear}
          </span>
          <Button variant="ghost" size="icon" onClick={next} className="h-7 w-7">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* First month */}
          <div>
            <p className="mb-2 text-center text-xs font-semibold text-foreground">
              {MONTHS[baseMonth]} {baseYear}
            </p>
            <MiniCalendar
              year={baseYear}
              month={baseMonth}
              selectedDay={selectedA}
              onSelectDay={setSelectedA}
              highlightedDays={[3, 10, 17, 24]}
            />
          </div>

          {/* Second month */}
          <div>
            <p className="mb-2 text-center text-xs font-semibold text-foreground">
              {MONTHS[secondMonth]} {secondYear}
            </p>
            <MiniCalendar
              year={secondYear}
              month={secondMonth}
              selectedDay={selectedB}
              onSelectDay={setSelectedB}
              highlightedDays={[5, 12, 19, 26]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export default TeamManagement;