"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowRight, TrendingUp, Building2, Euro, Search, ExternalLink, Newspaper, LayoutDashboard, Home, BookOpen, Filter, Star, Eye, ThumbsUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Alle")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const featuredPosts = blogPosts.filter(post => post.featured)
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "Alle" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  const recentPosts = filteredPosts.filter(post => !post.featured).slice(0, 6)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-105">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
              <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none"/>
              <rect x="11" y="10" width="3" height="8" rx="1" fill="url(#logoGradient)"/>
              <rect x="15.5" y="8" width="3" height="10" rx="1" fill="url(#logoGradient)"/>
              <rect x="20" y="12" width="3" height="6" rx="1" fill="url(#logoGradient)" opacity="0.7"/>
            </svg>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Proplytics
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors">
              <Home className="w-4 h-4" />
              Startseite
            </Link>
            <Link href="/blog" className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button
                size="sm"
                asChild
                className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-4 font-medium shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
              >
                <Link href="https://dashboard.proplytics.de" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                asChild
                className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-4 font-medium shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
              >
                <Link href="/analyse" className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Analyse starten
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Immobilien-Insights</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              Immobilien-Wissen
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Aktuelle Trends, Marktanalysen und Expertenwissen für smarte Immobilienentscheidungen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-emerald-200">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm">KI-optimierte Analysen</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <Eye className="w-5 h-5" />
                <span className="text-sm">Expertise aus der Praxis</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-sm">Datenbasiert & objektiv</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Artikel suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-full border-slate-200 focus:border-emerald-300 focus:ring-emerald-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm focus:border-emerald-300 focus:ring-emerald-300"
              >
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Featured Posts */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              Featured Artikel
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Unsere beliebtesten und meistgelesenen Artikel zu aktuellen Immobilienthemen
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.map((post, index) => (
              <Card key={post.id} className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white ${index === 0 ? 'lg:row-span-2' : ''}`}>
                <div className="relative overflow-hidden">
                  <div className={`aspect-video ${index === 0 ? 'lg:aspect-square' : ''} bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                    <div className="text-white text-center">
                      <Building2 className={`mx-auto mb-2 ${index === 0 ? 'w-20 h-20' : 'w-16 h-16'}`} />
                      <div className="text-xs opacity-90">Immobilien</div>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-emerald-500 text-white border-0 shadow-lg">
                      Featured
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-slate-200">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader className={`${index === 0 ? 'lg:p-8' : 'p-6'}`}>
                  <CardTitle className={`font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <p className={`text-slate-600 mt-3 ${index === 0 ? 'text-base lg:text-lg' : 'text-sm'} leading-relaxed`}>
                    {post.excerpt}
                  </p>
                </CardHeader>
                <CardContent className={`${index === 0 ? 'lg:px-8 lg:pb-8' : 'px-6 pb-6'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{post.author}</span>
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
                    <Button asChild size="sm" variant="outline" className="group-hover:bg-emerald-50 group-hover:border-emerald-300">
                      <Link href={`/blog/${post.id}`} className="flex items-center gap-2">
                        Lesen
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* News Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
              <Newspaper className="w-8 h-8 text-emerald-600" />
              Aktuelle Immobilien-Nachrichten
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Die neuesten Entwicklungen aus der Immobilienwelt - direkt aus zuverlässigen Quellen
            </p>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg animate-pulse bg-white">
                  <div className="aspect-video bg-slate-200 rounded-t-xl"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-16 h-4 bg-slate-200 rounded"></div>
                      <div className="w-12 h-3 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-5 bg-slate-200 rounded mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {newsArticles.map((article, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden">
                  <div className="relative overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Newspaper className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/20 text-white border-0 backdrop-blur-sm">
                        {article.source}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString('de-DE')}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-tight">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
                        <span>{article.title}</span>
                        <ExternalLink className="w-4 h-4 mt-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-emerald-300 text-emerald-600 hover:bg-emerald-50">
              <Link href="/api/google-news" className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                Mehr Nachrichten laden
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Alle Artikel
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Umfassende Analysen und praktische Tipps für Ihre Immobilienentscheidungen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden">
                <div className="relative overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Building2 className="w-12 h-12 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-slate-200 text-slate-700">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-6">
                  <CardTitle className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <p className="text-slate-600 text-sm mt-3 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-auto">
                      <Link href={`/blog/${post.id}`} className="flex items-center gap-1 text-sm font-medium">
                        Lesen
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length > 6 && (
            <div className="text-center mt-12">
              <p className="text-slate-600 mb-4">
                {filteredPosts.length - 6} weitere Artikel verfügbar
              </p>
              <Button variant="outline" className="border-emerald-300 text-emerald-600 hover:bg-emerald-50">
                Alle Artikel anzeigen
              </Button>
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 text-white text-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">Exklusive Insights</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Bleiben Sie informiert</h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Erhalten Sie die neuesten Immobilien-Trends, Marktanalysen und exklusive Experteneinsichten direkt in Ihr Postfach.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="ihre@email.de"
                className="flex-1 px-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-white/40"
              />
              <Button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl">
                Kostenlos abonnieren
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              Kein Spam. Abmeldung jederzeit möglich.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}