import { useState } from 'react'
import type { Category, Task } from '../lib/types'
import { ProgressBar } from './ProgressBar'
import { TaskList } from './TaskList'
import { QuickAdd } from './QuickAdd'
import { ScheduleMenu } from './ScheduleMenu'
import { useStore } from '../lib/store'

export function CategoryCard({ category, tasks }: { category: Category; tasks: Task[] }) {
  const { addTask, toggleTask, renameTask, scheduleTask, renameCategory, deleteCategory } = useStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const done = tasks.filter((t) => t.done).length

  function commitRename() {
    setEditing(false)
    if (name.trim() && name.trim() !== category.name) renameCategory(category.id, name)
    else setName(category.name)
  }

  function handleDelete() {
    if (tasks.length === 0) {
      deleteCategory(category.id)
      return
    }
    setConfirmDelete(true)
  }

  return (
    <div
      className="flex h-full flex-col rounded-2xl border bg-[var(--color-card)] p-4 shadow-sm"
      style={{ borderColor: 'var(--color-line)' }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') {
                  setName(category.name)
                  setEditing(false)
                }
              }}
              className="w-full border-b bg-transparent font-[Fraunces] text-lg font-semibold outline-none"
              style={{ borderColor: category.color }}
            />
          ) : (
            <h2
              onClick={() => setEditing(true)}
              className="cursor-text truncate font-[Fraunces] text-lg font-semibold"
              style={{ color: 'var(--color-ink)' }}
              title="Click to rename"
            >
              {category.name}
            </h2>
          )}
        </div>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: category.color }} />
        <button
          type="button"
          onClick={handleDelete}
          className="shrink-0 rounded-full px-1.5 py-0.5 font-mono text-xs opacity-40 transition-opacity hover:opacity-100"
          title="Delete category"
        >
          ✕
        </button>
      </div>

      <ProgressBar done={done} total={tasks.length} color={category.color} />

      {confirmDelete && (
        <div
          className="mt-2 rounded-lg border px-2 py-2 text-xs"
          style={{ borderColor: category.color, background: 'var(--color-bg)' }}
        >
          <p className="mb-1.5" style={{ color: 'var(--color-ink)' }}>
            Delete "{category.name}" and its {tasks.length} task{tasks.length === 1 ? '' : 's'}?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                deleteCategory(category.id)
                setConfirmDelete(false)
              }}
              className="rounded-md px-2 py-1 font-medium"
              style={{ background: category.color, color: 'var(--color-card)' }}
            >
              Delete all
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-md px-2 py-1"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="thin-scroll mt-2 max-h-64 flex-1 overflow-y-auto pr-1">
        <TaskList
          tasks={tasks}
          onToggle={toggleTask}
          onRename={renameTask}
          emptyMessage="Nothing here yet"
          renderRightAction={(t) => (
            <ScheduleMenu currentDate={t.planned_date} onSchedule={(d) => scheduleTask(t.id, d)} />
          )}
        />
      </div>

      <QuickAdd placeholder="Add a task…" accent={category.color} onAdd={(label) => addTask(category.id, label)} />
    </div>
  )
}
