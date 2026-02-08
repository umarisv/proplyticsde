import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, User, BookOpen } from "lucide-react"
import { PageHero } from "@/components/page-hero"
import { getAllPosts, blogCategories, type BlogPost } from "@/lib/blog-data"
import { BlogCategoryFilter } from "./category-filter"

export const metadata: Metadata = {
  title: "Immobilien-Wissen & Marktanalysen | Proplytics Blog",
  description:
    "Rendite-Kennzahlen, Risikomanagement, Finanzierungsstrategien, Deal Sourcing und Investmentlogik - datenbasiertes Expertenwissen fuer Immobilieninvestoren.",
  keywords: [
    "Immobilien Blog",
    "Rendite Kennzahlen",
    "Immobilien Risikomanagement",
    "Finanzierungsstrategie",
    "Deal Sourcing",
    "Immobilien Investment",
    "Marktanalyse",
  ],
  openGraph: {
    title: "Immobilien-Wissen & Marktanalysen | Proplytics Blog",
    description:
      "Datenbasiertes Expertenwissen fuer Immobilieninvestoren: Rendite, Risiko, Finanzierung, Strategie.",
    type: "website",
  },
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Card
      className={`flex flex-col border-border transition-all hover:shadow-lg ${
        featured ? "sm:col-span-2" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge className="border-none bg-primary/10 text-primary hover:bg-primary/10">
            {post.category}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {post.readTime}
          </span>
          {post.featured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
        <CardTitle className={featured ? "text-2xl md:text-3xl" : "text-lg"}>
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {post.author}
          </span>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href={`/blog/${post.slug}`}>
              Lesen <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string }>
}) {
  const params = await searchParams
  const category = params.kategorie || "Alle"
  const allPosts = getAllPosts()
  const filteredPosts =
    category === "Alle"
      ? allPosts
      : allPosts.filter((p) => p.category === category)
  const featuredPost = allPosts.find((p) => p.featured) || allPosts[0]

  return (
    <div className="bg-background text-foreground">
      <PageHero
        badge="Immobilien-Wissen"
        badgeIcon={<BookOpen className="h-4 w-4 text-primary" />}
        title="Expertenwissen &"
        titleAccent="Definitionen"
        description="Rendite-Kennzahlen, Risikomanagement, Finanzierung und Investmentlogik - fundiert und datenbasiert."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        {/* Featured (only on Alle) */}
        {category === "Alle" && (
          <section className="mb-12">
            <h2 className="mb-6 text-xl font-bold">Featured</h2>
            <PostCard post={featuredPost} featured />
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-8">
          <BlogCategoryFilter
            categories={blogCategories as unknown as string[]}
            active={category}
          />
        </section>

        {/* Posts Grid */}
        <section>
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredPosts
              .filter((p) => category !== "Alle" || p.slug !== featuredPost.slug)
              .map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">
                Keine Artikel in dieser Kategorie.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
