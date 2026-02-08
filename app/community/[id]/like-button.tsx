"use client"

import { useTransition, useOptimistic } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleLike } from "../community-api"

interface Props {
  postId: string
  liked: boolean
  count: number
  disabled: boolean
}

export function LikeButton({ postId, liked, count, disabled }: Props) {
  const [isPending, startTransition] = useTransition()
  const [optimisticState, setOptimistic] = useOptimistic(
    { liked, count },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    })
  )

  function handleClick() {
    if (disabled) return
    setOptimistic(optimisticState)
    startTransition(async () => {
      await toggleLike(postId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        "flex items-center gap-1.5 text-sm transition-colors",
        optimisticState.liked
          ? "text-red-500"
          : "text-muted-foreground hover:text-red-500",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <Heart
        className={cn("h-4 w-4", optimisticState.liked && "fill-current")}
      />
      <span>{optimisticState.count}</span>
    </button>
  )
}
