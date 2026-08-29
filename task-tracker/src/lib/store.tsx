import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './supabase'
import type { Category, Task } from './types'
import { nextCategoryColor } from './palette'
import { todayStr } from './dates'

const CACHE_KEY = 'tasktracker:cache:v1'
const QUEUE_KEY = 'tasktracker:queue:v1'

type Op =
  | { table: 'categories'; type: 'insert' | 'update'; row: Partial<Category> & { id: string } }
  | { table: 'categories'; type: 'delete'; id: string }
  | { table: 'tasks'; type: 'insert' | 'update'; row: Partial<Task> & { id: string } }
  | { table: 'tasks'; type: 'delete'; id: string }

function loadCache(): { categories: Category[]; tasks: Task[] } {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore corrupt cache
  }
  return { categories: [], tasks: [] }
}

function saveCache(categories: Category[], tasks: Task[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ categories, tasks }))
}

function loadQueue(): Op[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

function saveQueue(queue: Op[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

type Store = {
  categories: Category[]
  tasks: Task[]
  loading: boolean
  online: boolean
  syncing: boolean
  authRequired: boolean
  session: Session | null
  addCategory: (name: string) => void
  renameCategory: (id: string, name: string) => void
  deleteCategory: (id: string, reassignTo?: string | null) => void
  addTask: (categoryId: string, label: string, plannedDate?: string | null) => void
  toggleTask: (id: string) => void
  renameTask: (id: string, label: string) => void
  scheduleTask: (id: string, date: string | null) => void
  reorderCategories: (orderedIds: string[]) => void
}

const StoreCtx = createContext<Store | null>(null)

function uid() {
  return crypto.randomUUID()
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const cached = useMemo(loadCache, [])
  const [categories, setCategories] = useState<Category[]>(cached.categories)
  const [tasks, setTasks] = useState<Task[]>(cached.tasks)
  const [loading, setLoading] = useState(supabaseConfigured)
  const [online, setOnline] = useState(navigator.onLine)
  const [syncing, setSyncing] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const queueRef = useRef<Op[]>(loadQueue())

  // persist to local cache on every change so a reload/offline launch is instant
  useEffect(() => {
    saveCache(categories, tasks)
  }, [categories, tasks])

  const enqueue = useCallback((op: Op) => {
    queueRef.current = [...queueRef.current, op]
    saveQueue(queueRef.current)
  }, [])

  const flushQueue = useCallback(async () => {
    if (!supabase || !session || queueRef.current.length === 0) return
    setSyncing(true)
    const remaining: Op[] = []
    for (const op of queueRef.current) {
      try {
        // supabase-js resolves to { data, error } on a failed query rather than
        // throwing — awaiting the call alone can't detect a rejected write, so
        // the error has to be pulled out and thrown explicitly to be caught below
        let error: { message: string } | null = null
        if (op.table === 'categories') {
          if (op.type === 'delete') {
            ;({ error } = await supabase.from('categories').delete().eq('id', op.id))
          } else {
            ;({ error } = await supabase.from('categories').upsert({ ...op.row, user_id: session.user.id }))
          }
        } else {
          if (op.type === 'delete') {
            ;({ error } = await supabase.from('tasks').delete().eq('id', op.id))
          } else {
            ;({ error } = await supabase.from('tasks').upsert({ ...op.row, user_id: session.user.id }))
          }
        }
        if (error) throw error
      } catch (err) {
        console.error('[tasks] sync failed, will retry:', op, err)
        remaining.push(op)
      }
    }
    queueRef.current = remaining
    saveQueue(remaining)
    setSyncing(false)
  }, [session])

  // auth
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // initial load from server once authed
  useEffect(() => {
    if (!supabase || !session) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const [{ data: cats }, { data: tks }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('tasks').select('*').order('created_at', { ascending: true }),
      ])
      if (cancelled) return
      if (cats) setCategories(cats as Category[])
      if (tks) setTasks(tks as Task[])
      setLoading(false)
      await flushQueue()
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  // online/offline
  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      flushQueue()
    }
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [flushQueue])

  // auto-carry: anything still open from a previous day moves onto today
  useEffect(() => {
    const today = todayStr()
    setTasks((prev) => {
      let changed = false
      const next = prev.map((t) => {
        if (!t.done && t.planned_date && t.planned_date < today) {
          changed = true
          const updated = { ...t, carried_from: t.planned_date, planned_date: today }
          enqueue({ table: 'tasks', type: 'update', row: updated })
          return updated
        }
        return t
      })
      return changed ? next : prev
    })
    // re-check on a timer in case the app is left open across midnight
    const interval = setInterval(
      () => {
        const t2 = todayStr()
        setTasks((prev) => {
          let changed = false
          const next = prev.map((t) => {
            if (!t.done && t.planned_date && t.planned_date < t2) {
              changed = true
              const updated = { ...t, carried_from: t.planned_date, planned_date: t2 }
              enqueue({ table: 'tasks', type: 'update', row: updated })
              return updated
            }
            return t
          })
          return changed ? next : prev
        })
      },
      5 * 60 * 1000,
    )
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (session) flushQueue()
  }, [session, flushQueue])

  const addCategory = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setCategories((prev) => {
        const color = nextCategoryColor(prev.map((c) => c.color))
        const row: Category = {
          id: uid(),
          name: trimmed,
          color,
          sort_order: prev.length,
          created_at: new Date().toISOString(),
        }
        enqueue({ table: 'categories', type: 'insert', row })
        flushQueue()
        return [...prev, row]
      })
    },
    [enqueue, flushQueue],
  )

  const renameCategory = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const updated = { ...c, name: trimmed }
          enqueue({ table: 'categories', type: 'update', row: updated })
          return updated
        }),
      )
      flushQueue()
    },
    [enqueue, flushQueue],
  )

  const deleteCategory = useCallback(
    (id: string, reassignTo?: string | null) => {
      setTasks((prev) => {
        const inCategory = prev.filter((t) => t.category_id === id)
        if (inCategory.length === 0) return prev
        if (reassignTo) {
          return prev.map((t) => {
            if (t.category_id !== id) return t
            const updated = { ...t, category_id: reassignTo }
            enqueue({ table: 'tasks', type: 'update', row: updated })
            return updated
          })
        }
        inCategory.forEach((t) => enqueue({ table: 'tasks', type: 'delete', id: t.id }))
        return prev.filter((t) => t.category_id !== id)
      })
      setCategories((prev) => prev.filter((c) => c.id !== id))
      enqueue({ table: 'categories', type: 'delete', id })
      flushQueue()
    },
    [enqueue, flushQueue],
  )

  const addTask = useCallback(
    (categoryId: string, label: string, plannedDate: string | null = null) => {
      const trimmed = label.trim()
      if (!trimmed) return
      const row: Task = {
        id: uid(),
        category_id: categoryId,
        label: trimmed,
        done: false,
        planned_date: plannedDate,
        carried_from: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      }
      setTasks((prev) => [...prev, row])
      enqueue({ table: 'tasks', type: 'insert', row })
      flushQueue()
    },
    [enqueue, flushQueue],
  )

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          const done = !t.done
          const updated = { ...t, done, completed_at: done ? new Date().toISOString() : null }
          enqueue({ table: 'tasks', type: 'update', row: updated })
          return updated
        }),
      )
      flushQueue()
    },
    [enqueue, flushQueue],
  )

  const renameTask = useCallback(
    (id: string, label: string) => {
      const trimmed = label.trim()
      if (!trimmed) return
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          const updated = { ...t, label: trimmed }
          enqueue({ table: 'tasks', type: 'update', row: updated })
          return updated
        }),
      )
      flushQueue()
    },
    [enqueue, flushQueue],
  )

  const scheduleTask = useCallback(
    (id: string, date: string | null) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          const updated = { ...t, planned_date: date, carried_from: date ? t.carried_from : null }
          enqueue({ table: 'tasks', type: 'update', row: updated })
          return updated
        }),
      )
      flushQueue()
    },
    [enqueue, flushQueue],
  )

  const reorderCategories = useCallback(
    (orderedIds: string[]) => {
      setCategories((prev) => {
        const byId = new Map(prev.map((c) => [c.id, c]))
        return orderedIds.map((id, i) => {
          const c = byId.get(id)!
          const updated = { ...c, sort_order: i }
          enqueue({ table: 'categories', type: 'update', row: updated })
          return updated
        })
      })
      flushQueue()
    },
    [enqueue, flushQueue],
  )

  const value: Store = {
    categories: [...categories].sort((a, b) => a.sort_order - b.sort_order),
    tasks,
    loading,
    online,
    syncing,
    authRequired: supabaseConfigured && !session,
    session,
    addCategory,
    renameCategory,
    deleteCategory,
    addTask,
    toggleTask,
    renameTask,
    scheduleTask,
    reorderCategories,
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
