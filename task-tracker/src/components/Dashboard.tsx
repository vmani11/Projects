import { useStore } from '../lib/store'
import { CategoryCard } from './CategoryCard'
import { NewCategoryCard } from './NewCategoryCard'
import { WeekStrip } from './WeekStrip'
import { Header } from './Header'

export function Dashboard() {
  const { categories, tasks } = useStore()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Header />

      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} tasks={tasks.filter((t) => t.category_id === c.id)} />
          ))}
          <NewCategoryCard />
        </div>
      </section>

      <section>
        <WeekStrip tasks={tasks} categories={categories} />
      </section>
    </div>
  )
}
