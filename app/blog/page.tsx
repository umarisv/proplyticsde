import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowRight, Building2 } from "lucide-react"

// Simple blog data
const blogPosts = [
  {
    id: "immobilienmarkt-2024-trends",
    title: "Immobilienmarkt 2024: Trends und Entwicklungen",
    excerpt: "Entdecken Sie die wichtigsten Entwicklungen am Immobilienmarkt 2024.",
    author: "Proplytics Team",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Marktanalyse",
    tags: ["Trends", "2024", "Marktanalyse"]
  },
  {
    id: "ki-immobilienbewertung-zukunft",
    title: "KI in der Immobilienbewertung",
    excerpt: "Wie künstliche Intelligenz die Immobilienbewertung revolutioniert.",
    author: "Dr. Sarah Weber",
    date: "2024-01-10",
    readTime: "7 min",
    category: "Technologie",
    tags: ["KI", "Bewertung", "Innovation"]
  },
  {
    id: "immobilien-kaufen-2024-guide",
    title: "Immobilien kaufen 2024: Leitfaden für Erstkäufer",
    excerpt: "Alles was Sie über den Immobilienkauf 2024 wissen müssen.",
    author: "Michael Bauer",
    date: "2024-01-10",
    readTime: "12 min",
    category: "Ratgeber",
    tags: ["Erstkäufer", "Immobilienkauf", "Finanzierung"]
  }
]

export default function BlogPage() {
  const featuredPosts = blogPosts.slice(0, 1)
  const recentPosts = blogPosts.slice(1, 4)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" />
              <span className="text-lg font-semibold">Proplytics</span>
            </Link>
            <Link href="/analyse">
              <Button>Analyse starten</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Immobilien-Blog</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Aktuelle Trends, Marktanalysen und Expertenwissen für Immobilieninvestoren.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Featured Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Artikel</h2>
          <div className="grid grid-cols-1 gap-6">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{post.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl">
                    <Link href={`/blog/${post.id}`} className="hover:text-emerald-600 transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-4">
                      <span>von {post.author}</span>
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <Button variant="outline" size="sm">
                        Lesen <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Aktuelle Artikel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Card key={post.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2">{post.category}</Badge>
                  <CardTitle className="text-lg">
                    <Link href={`/blog/${post.id}`} className="hover:text-emerald-600 transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{post.author}</span>
                    <Link href={`/blog/${post.id}`}>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        Lesen →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}