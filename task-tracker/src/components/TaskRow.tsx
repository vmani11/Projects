import { useState } from 'react'
import type { Task } from '../lib/types'
import { CheckCircle } from './CheckCircle'

export function TaskRow({
  task,
  onToggle,
  onRename,
  rightAction,
}: {
  task: Task
  onToggle: () => void
  onRename?: (label: string) => void
  rightAction?: React.ReactNode
}) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(task.label)

  function commit() {
    setEditing(false)
    const trimmed = label.trim()
    if (onRename && trimmed && trimmed !== task.label) onRename(trimmed)
    else setLabel(task.label)
  }

  return (
    <div className="group flex items-center gap-2.5 py-1.5">
      <CheckCircle done={task.done} onToggle={onToggle} />
      {editing ? (
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setLabel(task.label)
              setEditing(false)
            }
          }}
          className="min-w-0 flex-1 border-b bg-transparent text-sm outline-none"
          style={{ borderColor: 'var(--color-orange)', color: 'var(--color-ink)' }}
        />
      ) : (
        <span
          onClick={() => onRename && setEditing(true)}
          className="min-w-0 flex-1 truncate text-sm transition-all duration-150"
          style={{
            color: task.done ? 'var(--color-ink-soft)' : 'var(--color-ink)',
            textDecoration: task.done ? 'line-through' : 'none',
            cursor: onRename ? 'text' : 'default',
          }}
          title={onRename ? 'Click to edit' : undefined}
        >
          {task.label}
        </span>
      )}
      {task.carried_from && !task.done && (
        <span
          className="shrink-0 font-mono text-[10px] uppercase tracking-wide opacity-60"
          style={{ color: 'var(--color-ink-soft)' }}
          title={`Carried from ${task.carried_from}`}
        >
          carried
        </span>
      )}
      {rightAction && (
        <div className="shrink-0 opacity-60 transition-opacity duration-150 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          {rightAction}
        </div>
      )}
    </div>
  )
}
