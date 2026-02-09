export type CommunityPost = {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  post_type: "diskussion" | "meinungsbild"
  objektdaten: Record<string, string> | null
  is_pinned: boolean
  created_at: string
  updated_at: string
  author_name: string | null
  reply_count: number
  like_count: number
  user_has_liked?: boolean
}

export type CommunityReply = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  author_name: string | null
}

export type MeinungsbildRating = {
  id: string
  post_id: string
  user_id: string
  rendite: number
  risiko: number
  finanzierung: number
  value_add: number
  lage_markt: number
  deal_sourcing: number
  kommentar: string | null
  created_at: string
  author_name: string | null
}

export type MeinungsbildAggregation = {
  count: number
  rendite: number
  risiko: number
  finanzierung: number
  value_add: number
  lage_markt: number
  deal_sourcing: number
}

export function aggregateRatings(ratings: MeinungsbildRating[]): MeinungsbildAggregation {
  if (ratings.length === 0) {
    return { count: 0, rendite: 0, risiko: 0, finanzierung: 0, value_add: 0, lage_markt: 0, deal_sourcing: 0 }
  }
  const dims = ["rendite", "risiko", "finanzierung", "value_add", "lage_markt", "deal_sourcing"] as const
  const agg: Record<string, number> = {}
  for (const d of dims) {
    agg[d] = Math.round((ratings.reduce((s, r) => s + r[d], 0) / ratings.length) * 10) / 10
  }
  return { count: ratings.length, ...agg } as MeinungsbildAggregation
}
