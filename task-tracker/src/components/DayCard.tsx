import { useEffect, useState } from 'react'
import type { Category, Task } from '../lib/types'
import { dayLabel, dateLabel, isToday } from '../lib/dates'
import { TaskList } from './TaskList'
import { ScheduleMenu } from './ScheduleMenu'
import { useStore } from '../lib/store'

export function DayCard({ date, tasks, categories }: { date: string; tasks: Task[]; categories: Category[] }) {
  const { toggleTask, renameTask, scheduleTask, addTask } = useStore()
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [value, setValue] = useState('')

  // categories can still be empty/different on first mount (e.g. before the
  // cache loads, or after the previously-selected category is deleted) — keep
  // the selection valid instead of silently locking onto a stale id forever
  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.id === categoryId)) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])
  const today = isToday(date)
  const colorOf = (id: string) => categories.find((c) => c.id === id)?.color ?? 'var(--color-ink-soft)'

  const done = tasks.filter((t) => t.done).length

  function submit() {
    if (!value.trim() || !categoryId) return
    addTask(categoryId, value, date)
    setValue('')
  }

  return (
    <div
      className="flex h-full w-64 shrink-0 flex-col rounded-2xl border p-3 shadow-sm"
      style={{
        borderColor: today ? 'var(--color-orange)' : 'var(--color-line)',
        background: 'var(--color-card)',
        borderWidth: today ? 2 : 1,
      }}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-[Fraunces] text-base font-semibold" style={{ color: 'var(--color-ink)' }}>
          {dayLabel(date)}
        </span>
        <span className="font-mono text-xs" style={{ color: today ? 'var(--color-orange)' : 'var(--color-ink-soft)' }}>
          {dateLabel(date)}
        </span>
      </div>
      {tasks.length > 0 && (
        <span className="mb-1 font-mono text-[10px]" style={{ color: 'var(--color-ink-soft)' }}>
          {done}/{tasks.length} done
        </span>
      )}

      <div className="thin-scroll mb-2 max-h-72 flex-1 overflow-y-auto pr-1">
        <TaskList
          tasks={tasks}
          onToggle={toggleTask}
          onRename={renameTask}
          emptyMessage="Nothing planned"
          renderLeading={(t) => (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colorOf(t.category_id) }} />
          )}
          renderRightAction={(t) => (
            <ScheduleMenu currentDate={t.planned_date} onSchedule={(d) => scheduleTask(t.id, d)} />
          )}
        />
      </div>

      {categories.length > 0 && (
        <div className="border-t pt-2" style={{ borderColor: 'var(--color-line)' }}>
          <div className="flex items-center gap-1.5">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="max-w-20 shrink-0 rounded-md bg-transparent font-mono text-[10px] outline-none"
              style={{ color: colorOf(categoryId) }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
              }}
              placeholder="Add a task…"
              className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-[var(--color-ink-soft)]"
              style={{ color: 'var(--color-ink)' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
