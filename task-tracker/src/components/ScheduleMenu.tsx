import { todayStr } from '../lib/dates'

export function ScheduleMenu({
  currentDate,
  onSchedule,
}: {
  currentDate: string | null
  onSchedule: (date: string | null) => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 font-mono text-xs" style={{ color: 'var(--color-ink-soft)' }}>
      {!currentDate && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSchedule(todayStr())
          }}
          className="rounded-full px-2 py-0.5 transition-colors hover:bg-black/5"
        >
          → today
        </button>
      )}
      <label
        className="relative flex cursor-pointer items-center rounded-full px-1.5 py-0.5 transition-colors hover:bg-black/5"
        title="Pick a day"
        onClick={(e) => e.stopPropagation()}
      >
        📅
        <input
          type="date"
          value={currentDate ?? ''}
          onChange={(e) => onSchedule(e.target.value || null)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      {currentDate && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSchedule(null)
          }}
          className="rounded-full px-1.5 py-0.5 transition-colors hover:bg-black/5"
          title="Move back to backlog"
        >
          ✕
        </button>
      )}
    </div>
  )
}
