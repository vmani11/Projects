import { useRef, useState } from 'react'

export function QuickAdd({
  placeholder,
  onAdd,
  accent,
}: {
  placeholder: string
  onAdd: (label: string) => void
  accent?: string
}) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex items-center gap-2 border-t px-1 pt-2" style={{ borderColor: 'var(--color-line)' }}>
      <span className="font-mono text-sm" style={{ color: accent ?? 'var(--color-ink-soft)' }}>
        +
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
        placeholder={placeholder}
        className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-[var(--color-ink-soft)]"
        style={{ color: 'var(--color-ink)' }}
      />
    </div>
  )
}
