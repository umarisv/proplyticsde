"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, ArrowRight, TrendingUp, Building2, Euro, Search, ExternalLink, Newspaper } from "lucide-react"

// Mock blog data - in production, this would come from a CMS or database
const blogPosts = [
  {
    id: "immobilienmarkt-2024-trends",
    title: "Immobilienmarkt 2024: Diese Trends prägen die Zukunft",
    excerpt: "Entdecken Sie die wichtigsten Entwicklungen am Immobilienmarkt 2024. Von KI-gestützten Bewertungen bis hin zu nachhaltigen Investments.",
    author: "Proplytics Team",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Marktanalyse",
    image: "/blog/immobilien-2024.jpg",
    featured: true,
    tags: ["Trends", "2024", "Marktanalyse", "Investitionen"]
  },
  {
    id: "ki-immobilienbewertung-zukunft",
    title: "KI in der Immobilienbewertung: Die Zukunft ist bereits da",
    excerpt: "Wie künstliche Intelligenz die Immobilienbewertung revolutioniert und was das für Käufer und Verkäufer bedeutet.",
    author: "Dr. Sarah Weber",
    date: "2024-01-10",
    readTime: "7 min",
    category: "Technologie",
    image: "/blog/ki-immobilien.jpg",
    featured: true,
    tags: ["KI", "Bewertung", "Innovation", "Zukunft"]
  },
  {
    id: "wohnungsknappheit-deutschland",
    title: "Wohnungsknappheit in Deutschland: Ursachen und Lösungsansätze",
    excerpt: "Eine Analyse der aktuellen Wohnungsknappheit und welche Maßnahmen wirklich helfen könnten.",
    author: "Prof. Michael Bauer",
    date: "2024-01-08",
    readTime: "6 min",
    category: "Politik",
    image: "/blog/wohnungsknappheit.jpg",
    featured: false,
    tags: ["Wohnungsknappheit", "Politik", "Deutschland", "Lösungen"]
  },
  {
    id: "nachhaltige-immobilien-investitionen",
    title: "Nachhaltige Immobilien: Grüne Investments mit Zukunft",
    excerpt: "Warum nachhaltige Immobilien nicht nur gut für die Umwelt, sondern auch für Ihr Portfolio sind.",
    author: "Anna Schmidt",
    date: "2024-01-05",
    readTime: "4 min",
    category: "Nachhaltigkeit",
    image: "/blog/nachhaltige-immobilien.jpg",
    featured: false,
    tags: ["Nachhaltigkeit", "Investitionen", "Umwelt", "Zukunft"]
  },
  {
    id: "immobilienfinanzierung-zinsen-2024",
    title: "Immobilienfinanzierung 2024: Zinsen im Fokus",
    excerpt: "Aktuelle Zinsentwicklung und Tipps für die optimale Immobilienfinanzierung in diesem Jahr.",
    author: "Marcus Richter",
    date: "2024-01-03",
    readTime: "5 min",
    category: "Finanzierung",
    image: "/blog/zinsen-2024.jpg",
    featured: false,
    tags: ["Finanzierung", "Zinsen", "2024", "Kredite"]
  },
  {
    id: "wohntrends-2024-staedte",
    title: "Wohntrends 2024: Die beliebtesten Städte zum Leben",
    excerpt: "Welche Städte in Deutschland bieten die beste Lebensqualität und die höchsten Renditen für Investoren?",
    author: "Lisa Wagner",
    date: "2024-01-01",
    readTime: "8 min",
    category: "Lebensqualität",
    image: "/blog/stadt-trends.jpg",
    featured: false,
    tags: ["Städte", "Lebensqualität", "Trends", "Investitionen"]
  },
  {
    id: "immobilien-kaufen-2024-guide",
    title: "Immobilien kaufen 2024: Der ultimative Leitfaden für Erstkäufer",
    excerpt: "Alles was Sie über den Immobilienkauf 2024 wissen müssen. Von Finanzierung bis Notar - Ihr kompletter Ratgeber.",
    author: "Michael Bauer",
    date: "2024-01-10",
    readTime: "12 min",
    category: "Ratgeber",
    image: "/blog/erstkaeufer-guide.jpg",
    featured: true,
    tags: ["Erstkäufer", "Immobilienkauf", "Finanzierung", "Ratgeber", "2024"]
  },
  {
    id: "rental-yields-deutschland-vergleich",
    title: "Mietrenditen in Deutschland: Städtevergleich 2024",
    excerpt: "Welche Städte bieten die besten Mietrenditen für Immobilieninvestoren? Datenbasierte Analyse der Top-Standorte.",
    author: "Dr. Anna Weber",
    date: "2024-01-12",
    readTime: "10 min",
    category: "Investitionen",
    image: "/blog/mietrenditen-vergleich.jpg",
    featured: true,
    tags: ["Mietrendite", "Investitionen", "Städtevergleich", "Rendite", "Deutschland"]
  },
  {
    id: "energetische-sanierung-foerderung",
    title: "Energetische Sanierung: Alle Förderungen 2024 im Überblick",
    excerpt: "Maximale Förderungen für Ihre energetische Sanierung sichern. Alle Programme und Anträge erklärt.",
    author: "Thomas Richter",
    date: "2024-01-15",
    readTime: "9 min",
    category: "Sanierung",
    image: "/blog/energetische-sanierung.jpg",
    featured: false,
    tags: ["Sanierung", "Förderungen", "Energieeffizienz", "Kosten", "2024"]
  },
  {
    id: "immobilienbewertung-kosten-vermeiden",
    title: "Immobilienbewertung Kosten sparen: Diese Fehler vermeiden",
    excerpt: "Typische Fehler bei der Immobilienbewertung und wie Sie teure Korrekturen vermeiden können.",
    author: "Sarah Müller",
    date: "2024-01-18",
    readTime: "6 min",
    category: "Bewertung",
    image: "/blog/bewertung-fehler.jpg",
    featured: false,
    tags: ["Bewertung", "Kosten", "Fehler", "Gutachten", "Tipps"]
  },
  {
    id: "wohnung-verkaufen-tipps-2024",
    title: "Wohnung verkaufen 2024: Höchstpreis erzielen mit diesen Strategien",
    excerpt: "Professionelle Tipps für den optimalen Wohnungverkauf. Von Preisstrategie bis Vertragsabschluss.",
    author: "Markus Schneider",
    date: "2024-01-20",
    readTime: "11 min",
    category: "Verkauf",
    image: "/blog/wohnung-verkaufen.jpg",
    featured: false,
    tags: ["Wohnung verkaufen", "Preisstrategie", "Verkaufstipps", "Marktanalyse", "2024"]
  }
]

const categories = [
  { name: "Alle", count: blogPosts.length, icon: Search },
  { name: "Marktanalyse", count: blogPosts.filter(p => p.category === "Marktanalyse").length, icon: TrendingUp },
  { name: "Technologie", count: blogPosts.filter(p => p.category === "Technologie").length, icon: Building2 },
  { name: "Investitionen", count: blogPosts.filter(p => p.category === "Investitionen").length, icon: Euro },
  { name: "Ratgeber", count: blogPosts.filter(p => p.category === "Ratgeber").length, icon: Building2 },
  { name: "Bewertung", count: blogPosts.filter(p => p.category === "Bewertung").length, icon: Building2 },
  { name: "Verkauf", count: blogPosts.filter(p => p.category === "Verkauf").length, icon: Building2 },
  { name: "Sanierung", count: blogPosts.filter(p => p.category === "Sanierung").length, icon: Building2 },
  { name: "Nachhaltigkeit", count: blogPosts.filter(p => p.category === "Nachhaltigkeit").length, icon: Building2 },
]

interface NewsArticle {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  imageUrl?: string
}

export default function BlogPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(true)

  const featuredPosts = blogPosts.filter(post => post.featured)
  const recentPosts = blogPosts.filter(post => !post.featured).slice(0, 4)

  // Fetch latest news on component mount
  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/google-news?limit=3')
        const data = await response.json()
        if (data.status === 'success') {
          setNewsArticles(data.articles)
        }
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setNewsLoading(false)
      }
    }

    fetchNews()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Immobilien-Insights
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Aktuelle Trends, Marktanalysen und Expertenwissen für Immobilieninvestoren und -käufer.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category.name}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <category.icon className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{category.name}</span>
              <Badge variant="secondary" className="text-xs">{category.count}</Badge>
            </button>
          ))}
        </div>

        {/* Featured Posts */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Featured Artikel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-md">
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-emerald-600" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      {post.category}
                    </Badge>
                    <span className="text-sm text-slate-500">Featured</span>
                  </div>
                  <CardTitle className="text-xl hover:text-emerald-600 transition-colors">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <p className="text-slate-600 line-clamp-3">{post.excerpt}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('de-DE')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>
                    <Link href={`/blog/${post.id}`} className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                      Lesen <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* News Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-emerald-600" />
            Aktuelle Immobilien-Nachrichten
          </h2>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-0 shadow-sm animate-pulse">
                  <div className="h-32 bg-slate-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsArticles.map((article, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
                  <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 rounded-t-lg flex items-center justify-center">
                    <Newspaper className="w-8 h-8 text-emerald-600" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.source}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(article.publishedAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1">
                        {article.title}
                        <ExternalLink className="w-3 h-3 mt-1 flex-shrink-0 opacity-60" />
                      </a>
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3">
                      {article.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-6">
            <p className="text-slate-600 mb-4">
              Bleiben Sie informiert mit den neuesten Immobilien-Nachrichten aus Deutschland.
            </p>
            <Link href="/api/google-news" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Mehr Nachrichten laden →
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Aktuelle Artikel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg hover:text-emerald-600 transition-colors line-clamp-2">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <p className="text-slate-600 text-sm line-clamp-3">{post.excerpt}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>{post.author}</span>
                      <span>{new Date(post.date).toLocaleDateString('de-DE')}</span>
                    </div>
                    <Link href={`/blog/${post.id}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Lesen →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Bleiben Sie informiert</h3>
          <p className="mb-6 opacity-90">
            Erhalten Sie die neuesten Immobilien-Trends und Marktanalysen direkt in Ihr Postfach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Ihre E-Mail-Adresse"
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder:text-slate-500"
            />
            <button className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
              Abonnieren
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}