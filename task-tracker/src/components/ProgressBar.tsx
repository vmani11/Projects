export function ProgressBar({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--color-line)' }}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums" style={{ color: 'var(--color-ink-soft)' }}>
        {done}/{total}
      </span>
    </div>
  )
}
