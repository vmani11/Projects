export type Category = {
  id: string
  name: string
  color: string
  sort_order: number
  created_at: string
}

export type Task = {
  id: string
  category_id: string
  label: string
  done: boolean
  planned_date: string | null // 'YYYY-MM-DD', null = backlog
  carried_from: string | null
  created_at: string
  completed_at: string | null
}
