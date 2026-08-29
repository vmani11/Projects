export function CheckCircle({
  done,
  onToggle,
  size = 22,
}: {
  done: boolean
  onToggle: () => void
  size?: number
}) {
  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={done ? 'Mark as not done' : 'Mark as done'}
      onClick={onToggle}
      className="group relative shrink-0 cursor-pointer rounded-full transition-transform duration-150 ease-out active:scale-90"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0 rounded-full border-2 transition-all duration-200 ease-out"
        style={{
          borderColor: done ? 'var(--color-orange)' : 'var(--color-line)',
          backgroundColor: done ? 'var(--color-orange)' : 'transparent',
          transform: done ? 'scale(1)' : 'scale(1)',
        }}
      />
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 transition-all duration-200 ease-out"
        style={{
          opacity: done ? 1 : 0,
          transform: done ? 'scale(1)' : 'scale(0.5)',
        }}
      >
        <path
          d="M6 12.5L10 16.5L18 8"
          fill="none"
          stroke="#FAF6EF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
