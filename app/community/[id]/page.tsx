import { notFound } from "next/navigation"
import Link from "next/link"
import {
  getPost,
  getReplies,
  getRatings,
  getCurrentUser,
  aggregateRatings,
} from "../community-api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, BarChart3 } from "lucide-react"
import { ReplyForm } from "./reply-form"
import { LikeButton } from "./like-button"
import { MeinungsbildPanel } from "./meinungsbild-panel"
import { RatingForm } from "./rating-form"

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

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [post, replies, ratings, user] = await Promise.all([
    getPost(id),
    getReplies(id),
    getRatings(id),
    getCurrentUser(),
  ])

  if (!post) notFound()

  const isMeinungsbild = post.post_type === "meinungsbild"
  const agg = await aggregateRatings(ratings)
  const userHasRated = user
    ? ratings.some((r) => r.user_id === user.id)
    : false

  return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/community">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurueck zur Community
            </Link>
          </Button>
        </div>

        <div className={`grid gap-6 ${isMeinungsbild ? "lg:grid-cols-3" : ""}`}>
          {/* Main column */}
          <div className={`space-y-6 ${isMeinungsbild ? "lg:col-span-2" : ""}`}>
            {/* Post card */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {isMeinungsbild && (
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                      Meinungsbild
                    </Badge>
                  )}
                  <Badge variant="outline">{post.category}</Badge>
                </div>

                <h1 className="mb-3 text-2xl font-bold tracking-tight">
                  {post.title}
                </h1>

                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {post.author_name}
                  </span>
                  <span>{timeAgo(post.created_at)}</span>
                </div>

                {/* Objektdaten */}
                {isMeinungsbild && post.objektdaten && (
                  <div className="mb-5 rounded-lg border border-border bg-secondary/50 p-4">
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Objektdaten
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                      {post.objektdaten.adresse && (
                        <div>
                          <span className="text-muted-foreground">Adresse:</span>{" "}
                          <span className="font-medium">{post.objektdaten.adresse}</span>
                        </div>
                      )}
                      {post.objektdaten.objekttyp && (
                        <div>
                          <span className="text-muted-foreground">Typ:</span>{" "}
                          <span className="font-medium">{post.objektdaten.objekttyp}</span>
                        </div>
                      )}
                      {post.objektdaten.baujahr && (
                        <div>
                          <span className="text-muted-foreground">Baujahr:</span>{" "}
                          <span className="font-medium">{post.objektdaten.baujahr}</span>
                        </div>
                      )}
                      {post.objektdaten.wohneinheiten && (
                        <div>
                          <span className="text-muted-foreground">WE:</span>{" "}
                          <span className="font-medium">{post.objektdaten.wohneinheiten}</span>
                        </div>
                      )}
                      {post.objektdaten.kaufpreis && (
                        <div>
                          <span className="text-muted-foreground">Kaufpreis:</span>{" "}
                          <span className="font-medium">{post.objektdaten.kaufpreis} EUR</span>
                        </div>
                      )}
                      {post.objektdaten.mieteinnahmen && (
                        <div>
                          <span className="text-muted-foreground">Miete/M:</span>{" "}
                          <span className="font-medium">{post.objektdaten.mieteinnahmen} EUR</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {post.content}
                </div>

                {/* Actions bar */}
                <div className="mt-6 flex items-center gap-4 border-t border-border pt-4">
                  <LikeButton
                    postId={post.id}
                    liked={post.user_has_liked ?? false}
                    count={post.like_count}
                    disabled={!user}
                  />
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{replies.length} Antworten</span>
                  </div>
                  {isMeinungsbild && (
                    <div className="flex items-center gap-1.5 text-sm text-primary">
                      <BarChart3 className="h-4 w-4" />
                      <span>{agg.count} Bewertungen</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Replies */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                Antworten ({replies.length})
              </h2>

              {replies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Noch keine Antworten. Seien Sie der Erste!
                </p>
              ) : (
                replies.map((reply) => (
                  <Card key={reply.id}>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-3 text-sm">
                        <span className="font-medium text-foreground">
                          {reply.author_name}
                        </span>
                        <span className="text-muted-foreground">
                          {timeAgo(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}

              {user ? (
                <ReplyForm postId={post.id} />
              ) : (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Melden Sie sich an um zu antworten.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/login?redirect=/community/${post.id}`}>
                        Anmelden
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - Meinungsbild */}
          {isMeinungsbild && (
            <div className="space-y-6">
              <MeinungsbildPanel aggregation={agg} ratings={ratings} />

              {user && !userHasRated ? (
                <RatingForm postId={post.id} />
              ) : user && userHasRated ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Sie haben bereits Ihre Einschaetzung abgegeben.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Anmelden um Ihre Einschaetzung abzugeben.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/login?redirect=/community/${post.id}`}>
                        Anmelden
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
  )
}
