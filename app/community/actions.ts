"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ─── Types ───────────────────────────────────────────────
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

// ─── Fetch all posts ─────────────────────────────────────
export async function getPosts(category?: string): Promise<CommunityPost[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from("community_posts")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (category && category !== "alle") {
    query = query.eq("category", category)
  }

  const { data: posts, error } = await query

  if (error || !posts) return []

  // Enrich with reply count, like count, author name
  const enriched = await Promise.all(
    posts.map(async (post) => {
      const [replyRes, likeRes, authorRes, userLikeRes] = await Promise.all([
        supabase.from("community_replies").select("id", { count: "exact", head: true }).eq("post_id", post.id),
        supabase.from("community_likes").select("id", { count: "exact", head: true }).eq("post_id", post.id),
        supabase.from("profiles").select("full_name").eq("id", post.user_id).single(),
        user
          ? supabase.from("community_likes").select("id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle()
          : { data: null },
      ])
      return {
        ...post,
        reply_count: replyRes.count ?? 0,
        like_count: likeRes.count ?? 0,
        author_name: authorRes.data?.full_name ?? "Anonym",
        user_has_liked: !!userLikeRes.data,
      }
    })
  )

  return enriched
}

// ─── Fetch single post ───────────────────────────────────
export async function getPost(id: string): Promise<CommunityPost | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .single()

  if (!post) return null

  const [replyRes, likeRes, authorRes, userLikeRes] = await Promise.all([
    supabase.from("community_replies").select("id", { count: "exact", head: true }).eq("post_id", post.id),
    supabase.from("community_likes").select("id", { count: "exact", head: true }).eq("post_id", post.id),
    supabase.from("profiles").select("full_name").eq("id", post.user_id).single(),
    user
      ? supabase.from("community_likes").select("id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle()
      : { data: null },
  ])

  return {
    ...post,
    reply_count: replyRes.count ?? 0,
    like_count: likeRes.count ?? 0,
    author_name: authorRes.data?.full_name ?? "Anonym",
    user_has_liked: !!userLikeRes.data,
  }
}

// ─── Fetch replies ───────────────────────────────────────
export async function getReplies(postId: string): Promise<CommunityReply[]> {
  const supabase = await createClient()

  const { data: replies } = await supabase
    .from("community_replies")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (!replies) return []

  const enriched = await Promise.all(
    replies.map(async (r) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", r.user_id)
        .single()
      return { ...r, author_name: profile?.full_name ?? "Anonym" }
    })
  )

  return enriched
}

// ─── Fetch Meinungsbild ratings ──────────────────────────
export async function getRatings(postId: string): Promise<MeinungsbildRating[]> {
  const supabase = await createClient()

  const { data: ratings } = await supabase
    .from("community_ratings")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })

  if (!ratings) return []

  const enriched = await Promise.all(
    ratings.map(async (r) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", r.user_id)
        .single()
      return { ...r, author_name: profile?.full_name ?? "Anonym" }
    })
  )

  return enriched
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

// ─── Create post ─────────────────────────────────────────
export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht eingeloggt" }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const category = formData.get("category") as string
  const postType = (formData.get("post_type") as string) || "diskussion"

  let objektdaten: Record<string, string> | null = null
  if (postType === "meinungsbild") {
    objektdaten = {
      adresse: (formData.get("obj_adresse") as string) || "",
      objekttyp: (formData.get("obj_objekttyp") as string) || "",
      baujahr: (formData.get("obj_baujahr") as string) || "",
      wohneinheiten: (formData.get("obj_wohneinheiten") as string) || "",
      kaufpreis: (formData.get("obj_kaufpreis") as string) || "",
      mieteinnahmen: (formData.get("obj_mieteinnahmen") as string) || "",
    }
  }

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category,
      post_type: postType,
      objektdaten,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/community")
  return { id: data.id }
}

// ─── Create reply ────────────────────────────────────────
export async function createReply(postId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht eingeloggt" }

  const { error } = await supabase
    .from("community_replies")
    .insert({ post_id: postId, user_id: user.id, content: content.trim() })

  if (error) return { error: error.message }

  revalidatePath(`/community/${postId}`)
  return { success: true }
}

// ─── Toggle like ─────────────────────────────────────────
export async function toggleLike(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht eingeloggt" }

  const { data: existing } = await supabase
    .from("community_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from("community_likes").delete().eq("id", existing.id)
  } else {
    await supabase.from("community_likes").insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath("/community")
  revalidatePath(`/community/${postId}`)
  return { liked: !existing }
}

// ─── Submit Meinungsbild rating ──────────────────────────
export async function submitRating(postId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht eingeloggt" }

  // Check if user already rated
  const { data: existing } = await supabase
    .from("community_ratings")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) return { error: "Sie haben bereits bewertet" }

  const dims = ["rendite", "risiko", "finanzierung", "value_add", "lage_markt", "deal_sourcing"]
  const values: Record<string, number> = {}
  for (const d of dims) {
    const val = parseInt(formData.get(d) as string)
    if (isNaN(val) || val < 1 || val > 3) return { error: `Ungueltige Bewertung fuer ${d}` }
    values[d] = val
  }

  const { error } = await supabase
    .from("community_ratings")
    .insert({
      post_id: postId,
      user_id: user.id,
      ...values,
      kommentar: (formData.get("kommentar") as string)?.trim() || null,
    })

  if (error) return { error: error.message }

  revalidatePath(`/community/${postId}`)
  return { success: true }
}

// ─── Get current user ────────────────────────────────────
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
