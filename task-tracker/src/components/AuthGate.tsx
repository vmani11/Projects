import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthGate() {
  const [mode, setMode] = useState<'magic-link' | 'password'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendLink() {
    if (!email.trim() || !supabase) return
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  async function signInWithPassword() {
    if (!email.trim() || !password || !supabase) return
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError(error.message)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div
        className="w-full max-w-sm rounded-2xl border bg-[var(--color-card)] p-6 shadow-sm"
        style={{ borderColor: 'var(--color-line)' }}
      >
        <h1 className="mb-1 font-[Fraunces] text-2xl font-semibold" style={{ color: 'var(--color-ink)' }}>
          Tasks
        </h1>
        <p className="mb-4 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          {mode === 'password' ? 'Sign in with your password.' : 'Sign in with a magic link — no password to remember.'}
        </p>

        {mode === 'password' ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') signInWithPassword()
              }}
              placeholder="password"
              className="mb-3 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
            />
            <button
              type="button"
              onClick={signInWithPassword}
              className="w-full rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-orange)' }}
            >
              Sign in
            </button>
          </>
        ) : sent ? (
          <p className="text-sm" style={{ color: 'var(--color-sage)' }}>
            Check {email} for a sign-in link.
          </p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendLink()
              }}
              placeholder="you@example.com"
              className="mb-3 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
            />
            <button
              type="button"
              onClick={sendLink}
              className="w-full rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-orange)' }}
            >
              Send magic link
            </button>
          </>
        )}

        {error && (
          <p className="mt-2 text-xs" style={{ color: 'var(--color-plum)' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'password' ? 'magic-link' : 'password')
            setError(null)
            setSent(false)
          }}
          className="mt-4 w-full text-center text-xs underline decoration-dotted underline-offset-2"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          {mode === 'password' ? 'Use a magic link instead' : 'Use a password instead'}
        </button>
      </div>
    </div>
  )
}
