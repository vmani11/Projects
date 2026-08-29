import { StoreProvider, useStore } from './lib/store'
import { Dashboard } from './components/Dashboard'
import { AuthGate } from './components/AuthGate'

function Gate() {
  const { authRequired, loading } = useStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <p className="font-mono text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          loading…
        </p>
      </div>
    )
  }

  if (authRequired) return <AuthGate />

  return <Dashboard />
}

function App() {
  return (
    <StoreProvider>
      <Gate />
    </StoreProvider>
  )
}

export default App
