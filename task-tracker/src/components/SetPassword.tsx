import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function SetPassword() {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (password.length < 6 || !supabase) return
    setStatus('saving')
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
      setStatus('done')
      setPassword('')
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-xs underline decoration-dotted underline-offset-2"
        style={{ color: 'var(--color-ink-soft)' }}
      >
        set password
      </button>
    )
  }

  return (
    <div
      className="flex items-center gap-2 rounded-full border px-2 py-1"
      style={{ borderColor: 'var(--color-line)' }}
    >
      {status === 'done' ? (
        <span className="font-mono text-xs" style={{ color: 'var(--color-sage)' }}>
          password set
        </span>
      ) : (
        <>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
            placeholder="new password (6+ chars)"
            className="w-40 bg-transparent text-xs outline-none"
            style={{ color: 'var(--color-ink)' }}
            autoFocus
          />
          <button
            type="button"
            onClick={submit}
            disabled={status === 'saving'}
            className="font-mono text-xs"
            style={{ color: 'var(--color-orange)' }}
          >
            save
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-mono text-xs"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            ✕
          </button>
        </>
      )}
      {error && (
        <span className="font-mono text-xs" style={{ color: 'var(--color-plum)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
