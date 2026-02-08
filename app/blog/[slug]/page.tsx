import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Clock, User, ArrowRight, BarChart3 } from "lucide-react"
import {
  getPostBySlug,
  getRelatedPosts,
  getAllPosts,
} from "@/lib/blog-data"

// Generate static paths for all blog posts
export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

// Dynamic SEO metadata per article
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: "Artikel nicht gefunden" }

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    keywords: post.seoKeywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.seoDescription,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  }
}

// Simple markdown-to-HTML (supports headings, tables, bold, links, blockquotes, lists, code)
function renderMarkdown(md: string) {
  const lines = md.trim().split("\n")
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Table
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1]?.match(/^\|[-|\s]+\|$/)) {
      const headers = line
        .split("|")
        .filter(Boolean)
        .map((h) => h.trim())
      i += 2 // skip separator
      const rows: string[][] = []
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(
          lines[i]
            .split("|")
            .filter(Boolean)
            .map((c) => c.trim())
        )
        i++
      }
      elements.push(
        <div key={i} className="my-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {headers.map((h, j) => (
                  <th
                    key={j}
                    className="px-4 py-2.5 text-left font-semibold text-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-border last:border-0"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2 text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: cell
                          .replace(
                            /\*\*(.+?)\*\*/g,
                            '<strong class="text-foreground font-medium">$1</strong>'
                          )
                          .replace(
                            /\[(.+?)\]\((.+?)\)/g,
                            '<a href="$2" class="text-primary hover:underline">$1</a>'
                          ),
                      }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // Heading
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="mb-4 mt-10 text-2xl font-bold tracking-tight text-foreground"
        >
          {line.slice(3)}
        </h2>
      )
      i++
      continue
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="mb-3 mt-8 text-lg font-semibold text-foreground"
        >
          {line.slice(4)}
        </h3>
      )
      i++
      continue
    }

    // Blockquote (definition box)
    if (line.startsWith("> ")) {
      elements.push(
        <div
          key={i}
          className="my-6 rounded-lg border-l-4 border-primary bg-primary/5 p-4"
          dangerouslySetInnerHTML={{
            __html: line
              .slice(2)
              .replace(
                /\*\*(.+?)\*\*/g,
                '<strong class="font-semibold text-foreground">$1</strong>'
              ),
          }}
        />
      )
      i++
      continue
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="my-8 border-border" />)
      i++
      continue
    }

    // Unordered list
    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={i} className="my-4 space-y-1.5 pl-5 list-disc text-muted-foreground">
          {items.map((item, j) => (
            <li
              key={j}
              dangerouslySetInnerHTML={{
                __html: item
                  .replace(
                    /\*\*(.+?)\*\*/g,
                    '<strong class="text-foreground font-medium">$1</strong>'
                  )
                  .replace(
                    /\[(.+?)\]\((.+?)\)/g,
                    '<a href="$2" class="text-primary hover:underline">$1</a>'
                  ),
              }}
            />
          ))}
        </ul>
      )
      continue
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""))
        i++
      }
      elements.push(
        <ol key={i} className="my-4 space-y-1.5 pl-5 list-decimal text-muted-foreground">
          {items.map((item, j) => (
            <li
              key={j}
              dangerouslySetInnerHTML={{
                __html: item.replace(
                  /\*\*(.+?)\*\*/g,
                  '<strong class="text-foreground font-medium">$1</strong>'
                ),
              }}
            />
          ))}
        </ol>
      )
      continue
    }

    // Empty line
    if (line.trim() === "") {
      i++
      continue
    }

    // Paragraph
    elements.push(
      <p
        key={i}
        className="my-3 leading-relaxed text-muted-foreground"
        dangerouslySetInnerHTML={{
          __html: line
            .replace(
              /\*\*(.+?)\*\*/g,
              '<strong class="text-foreground font-medium">$1</strong>'
            )
            .replace(
              /\[(.+?)\]\((.+?)\)/g,
              '<a href="$2" class="text-primary hover:underline">$1</a>'
            ),
        }}
      />
    )
    i++
  }

  return elements
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = getRelatedPosts(slug)

  // JSON-LD structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription,
    author: { "@type": "Person", name: post.author },
    datePublished: post.date,
    publisher: {
      "@type": "Organization",
      name: "Proplytics",
      url: "https://proplytics.de",
    },
    keywords: post.seoKeywords.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://proplytics.de/blog/${slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Alle Artikel
              </Link>
            </Button>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="border-none bg-primary/10 text-primary">
                {post.category}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>

            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span>{post.date}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {renderMarkdown(post.content)}

          {/* Tags */}
          <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Box */}
          <Card className="mt-10 border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  Jetzt selbst analysieren
                </p>
                <p className="text-sm text-muted-foreground">
                  Berechnen Sie Rendite, Risiko und Finanzierung fuer Ihr Objekt
                  mit der KI von Proplytics.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/analyse">
                  Analyse starten <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-6 text-xl font-bold">Verwandte Artikel</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Card
                    key={r.slug}
                    className="transition-all hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <Badge
                        variant="secondary"
                        className="mb-2 text-xs"
                      >
                        {r.category}
                      </Badge>
                      <Link
                        href={`/blog/${r.slug}`}
                        className="block font-semibold leading-snug transition-colors hover:text-primary"
                      >
                        {r.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.readTime}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  )
}
