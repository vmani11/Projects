import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Task } from '../lib/types'
import { TaskRow } from './TaskRow'

const HOLD_MS = 350 // let the checkmark-fill animation finish before collapsing
const COLLAPSE_MS = 280

export function TaskList({
  tasks,
  onToggle,
  onRename,
  renderLeading,
  renderRightAction,
  emptyMessage,
}: {
  tasks: Task[]
  onToggle: (id: string) => void
  onRename: (id: string, label: string) => void
  renderLeading?: (task: Task) => ReactNode
  renderRightAction: (task: Task) => ReactNode
  emptyMessage: string
}) {
  // A task marked done disappears from the list rather than lingering
  // crossed-out forever — but it still gets a beat to show the checkmark
  // fill before it collapses away, so the signature interaction reads.
  const [phases, setPhases] = useState<Map<string, 'visible' | 'collapsing'>>(new Map())
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>[]>>(new Map())

  useEffect(() => {
    return () => {
      timers.current.forEach((ts) => ts.forEach(clearTimeout))
    }
  }, [])

  function handleToggle(task: Task) {
    onToggle(task.id)
    if (!task.done) {
      setPhases((prev) => new Map(prev).set(task.id, 'visible'))
      const t1 = setTimeout(() => {
        setPhases((prev) => new Map(prev).set(task.id, 'collapsing'))
      }, HOLD_MS)
      const t2 = setTimeout(() => {
        setPhases((prev) => {
          const next = new Map(prev)
          next.delete(task.id)
          return next
        })
        timers.current.delete(task.id)
      }, HOLD_MS + COLLAPSE_MS)
      timers.current.set(task.id, [t1, t2])
    } else {
      // unchecked before it fully left — cancel any pending collapse
      timers.current.get(task.id)?.forEach(clearTimeout)
      timers.current.delete(task.id)
      setPhases((prev) => {
        const next = new Map(prev)
        next.delete(task.id)
        return next
      })
    }
  }

  const visible = tasks
    .filter((t) => !t.done || phases.has(t.id))
    .sort((a, b) => a.created_at.localeCompare(b.created_at))

  if (visible.length === 0) {
    return (
      <p className="py-3 text-center text-xs italic" style={{ color: 'var(--color-ink-soft)' }}>
        {emptyMessage}
      </p>
    )
  }

  return (
    <>
      {visible.map((t) => {
        const phase = phases.get(t.id)
        return (
          <div
            key={t.id}
            style={{
              display: 'grid',
              gridTemplateRows: phase === 'collapsing' ? '0fr' : '1fr',
              opacity: phase === 'collapsing' ? 0 : 1,
              transition: `grid-template-rows ${COLLAPSE_MS}ms ease, opacity ${COLLAPSE_MS}ms ease`,
            }}
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              {renderLeading?.(t)}
              <div className="min-w-0 flex-1">
                <TaskRow
                  task={t}
                  onToggle={() => handleToggle(t)}
                  onRename={(label) => onRename(t.id, label)}
                  rightAction={renderRightAction(t)}
                />
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
