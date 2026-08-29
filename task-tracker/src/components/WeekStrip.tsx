import { useMemo, useRef, useState } from 'react'
import type { Category, Task } from '../lib/types'
import { addDays, startOfWeek, todayStr } from '../lib/dates'
import { DayCard } from './DayCard'

export function WeekStrip({ tasks, categories }: { tasks: Task[]; categories: Category[] }) {
  const [rangeStart, setRangeStart] = useState(() => startOfWeek(todayStr()))
  const [daysShown, setDaysShown] = useState(14)
  const scrollRef = useRef<HTMLDivElement>(null)

  const dates = useMemo(
    () => Array.from({ length: daysShown }, (_, i) => addDays(rangeStart, i)),
    [rangeStart, daysShown],
  )

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      if (!t.planned_date) continue
      const list = map.get(t.planned_date) ?? []
      list.push(t)
      map.set(t.planned_date, list)
    }
    return map
  }, [tasks])

  function jumpToToday() {
    setRangeStart(startOfWeek(todayStr()))
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' }))
  }

  return (
    <div>
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-[Fraunces] text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>
          Plan your week
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={jumpToToday}
            className="font-mono text-xs underline decoration-dotted underline-offset-2"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            today
          </button>
          <label className="flex cursor-pointer items-center gap-1 font-mono text-xs" style={{ color: 'var(--color-ink-soft)' }}>
            jump to
            <input
              type="date"
              onChange={(e) => {
                if (e.target.value) setRangeStart(startOfWeek(e.target.value))
              }}
              className="rounded-md border bg-transparent px-1 py-0.5"
              style={{ borderColor: 'var(--color-line)' }}
            />
          </label>
        </div>
      </div>
      <div ref={scrollRef} className="thin-scroll flex gap-3 overflow-x-auto pb-2">
        {dates.map((date) => (
          <DayCard key={date} date={date} tasks={tasksByDate.get(date) ?? []} categories={categories} />
        ))}
        <button
          type="button"
          onClick={() => setDaysShown((n) => n + 7)}
          className="flex h-full min-h-40 w-32 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed font-mono text-xs transition-colors hover:border-[var(--color-orange)] hover:text-[var(--color-orange)]"
          style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}
        >
          + more days
        </button>
      </div>
    </div>
  )
}
