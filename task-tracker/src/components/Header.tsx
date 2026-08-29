import { useStore } from '../lib/store'
import { todayStr } from '../lib/dates'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { SetPassword } from './SetPassword'

export function Header() {
  const { tasks, online, syncing, session } = useStore()
  const today = todayStr()
  const todayTasks = tasks.filter((t) => t.planned_date === today)
  const done = todayTasks.filter((t) => t.done).length

  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--color-ink-soft)' }}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-[Fraunces] text-3xl font-semibold" style={{ color: 'var(--color-ink)' }}>
          Tasks
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="rounded-full border px-3 py-1 font-mono text-xs"
          style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}
        >
          {done}/{todayTasks.length} done today
        </span>
        {!online && (
          <span className="font-mono text-xs" style={{ color: 'var(--color-plum)' }}>
            offline
          </span>
        )}
        {online && syncing && (
          <span className="font-mono text-xs" style={{ color: 'var(--color-ink-soft)' }}>
            syncing…
          </span>
        )}
        {supabaseConfigured && session && <SetPassword />}
        {supabaseConfigured && session && (
          <button
            type="button"
            onClick={() => supabase?.auth.signOut()}
            className="font-mono text-xs underline decoration-dotted underline-offset-2"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            sign out
          </button>
        )}
      </div>
    </header>
  )
}
