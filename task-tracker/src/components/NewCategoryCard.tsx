import { useRef, useState } from 'react'
import { useStore } from '../lib/store'

export function NewCategoryCard() {
  const { addCategory } = useStore()
  const [active, setActive] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    if (value.trim()) addCategory(value)
    setValue('')
    setActive(false)
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => {
          setActive(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        className="flex h-full min-h-32 w-full items-center justify-center rounded-2xl border-2 border-dashed p-4 font-mono text-sm transition-colors hover:border-[var(--color-orange)] hover:text-[var(--color-orange)]"
        style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}
      >
        + new category
      </button>
    )
  }

  return (
    <div
      className="flex h-full min-h-32 w-full flex-col justify-center gap-2 rounded-2xl border-2 border-dashed p-4"
      style={{ borderColor: 'var(--color-orange)' }}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') {
            setValue('')
            setActive(false)
          }
        }}
        onBlur={submit}
        placeholder="Category name…"
        className="w-full bg-transparent font-[Fraunces] text-lg font-semibold outline-none"
        style={{ color: 'var(--color-ink)' }}
      />
      <span className="font-mono text-xs" style={{ color: 'var(--color-ink-soft)' }}>
        enter to create
      </span>
    </div>
  )
}
