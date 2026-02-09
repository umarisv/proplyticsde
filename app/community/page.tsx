import { Suspense } from "react"
import Link from "next/link"
import { getPosts, getCurrentUser } from "./community-api"
import type { CommunityPost } from "./types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Heart,
  Plus,
  BarChart3,
  Lock,
  Users,
} from "lucide-react"
import { CommunityFilters } from "./community-filters"

export const metadata = {
  title: "Community - proplytics.de",
  description:
    "Tauschen Sie sich mit anderen Immobilien-Investoren ueber Objekte aus und erhalten Sie Meinungsbilder.",
}

const categories = [
  { value: "alle", label: "Alle" },
  { value: "meinungsbild", label: "Meinungsbild" },
  { value: "deal-analyse", label: "Deal-Analyse" },
  { value: "finanzierung", label: "Finanzierung" },
  { value: "strategie", label: "Strategie" },
  { value: "steuern", label: "Steuern & Recht" },
  { value: "allgemein", label: "Allgemein" },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "gerade eben"
  if (mins < 60) return `vor ${mins} Min.`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `vor ${hrs} Std.`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `vor ${days} Tagen`
  return new Date(dateStr).toLocaleDateString("de-DE")
}

function PostCard({ post }: { post: CommunityPost }) {
  const isMeinungsbild = post.post_type === "meinungsbild"

  return (
    <Link href={`/community/${post.id}`}>
      <Card className="group transition-all hover:border-primary/20 hover:shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {isMeinungsbild && (
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700 text-[10px]">
                    Meinungsbild
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px]">
                  {categories.find((c) => c.value === post.category)?.label ??
                    post.category}
                </Badge>
                {post.is_pinned && (
                  <Badge variant="secondary" className="text-[10px]">
                    Angepinnt
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>

              {/* Object data for Meinungsbild */}
              {isMeinungsbild && post.objektdaten && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {post.objektdaten.objekttyp && (
                    <span>{post.objektdaten.objekttyp}</span>
                  )}
                  {post.objektdaten.kaufpreis && (
                    <span>{post.objektdaten.kaufpreis} EUR</span>
                  )}
                  {post.objektdaten.wohneinheiten && (
                    <span>{post.objektdaten.wohneinheiten} WE</span>
                  )}
                  {post.objektdaten.baujahr && (
                    <span>Bj. {post.objektdaten.baujahr}</span>
                  )}
                </div>
              )}

              {/* Content preview */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.content}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                <span>{post.author_name}</span>
                <span>{timeAgo(post.created_at)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{post.reply_count}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                <span>{post.like_count}</span>
              </div>
              {isMeinungsbild && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Bewerten</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()
  const category = params.kategorie || "alle"
  const posts = await getPosts(category)

  return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Community</h1>
            <p className="text-muted-foreground">
              Tauschen Sie sich mit anderen Investoren ueber Objekte und
              Strategien aus.
            </p>
          </div>
          {user ? (
            <Button
              asChild
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/community/neu">
                <Plus className="h-4 w-4" />
                Neuer Beitrag
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="gap-2">
              <Link href="/login?redirect=/community">
                <Lock className="h-4 w-4" />
                Anmelden zum Mitmachen
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-10" />}>
            <CommunityFilters
              categories={categories}
              activeCategory={category}
            />
          </Suspense>
        </div>

        {/* Posts list */}
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold">Noch keine Beitraege</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {user
                  ? "Seien Sie der Erste - starten Sie eine Diskussion oder teilen Sie ein Objekt fuer ein Meinungsbild."
                  : "Melden Sie sich an um Beitraege zu sehen und an Diskussionen teilzunehmen."}
              </p>
              {user && (
                <Button asChild className="mt-4" size="sm">
                  <Link href="/community/neu">Ersten Beitrag erstellen</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
  )
}
