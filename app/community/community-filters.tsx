"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface Props {
  categories: { value: string; label: string }[]
  activeCategory: string
}

export function CommunityFilters({ categories, activeCategory }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "alle") {
      params.delete("kategorie")
    } else {
      params.set("kategorie", value)
    }
    router.push(`/community?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleSelect(cat.value)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeCategory === cat.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
