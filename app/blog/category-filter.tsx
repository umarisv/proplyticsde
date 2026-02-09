"use client"

import { useRouter } from "next/navigation"

export function BlogCategoryFilter({
  categories,
  active,
}: {
  categories: string[]
  active: string
}) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() =>
            router.push(cat === "Alle" ? "/blog" : `/blog?kategorie=${encodeURIComponent(cat)}`)
          }
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === cat
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
