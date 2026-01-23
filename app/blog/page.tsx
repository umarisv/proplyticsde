"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowRight, TrendingUp, Building2, Euro, Search, ExternalLink, Newspaper, LayoutDashboard, Home, BookOpen, Filter, Star, Eye, ThumbsUp, AlertCircle, BarChart3 } from "lucide-react"

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

// Dynamic categories based on all available posts
const getCategories = (posts: any[]) => [
  { name: "Alle", count: posts.length, icon: Search, color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
  { name: "Marktanalyse", count: posts.filter(p => p.category === "Marktanalyse").length, icon: BarChart3, color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  { name: "Technologie", count: posts.filter(p => p.category === "Technologie").length, icon: TrendingUp, color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  { name: "Investitionen", count: posts.filter(p => p.category === "Investitionen").length, icon: Euro, color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  { name: "Finanzierung", count: posts.filter(p => p.category === "Finanzierung").length, icon: Euro, color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  { name: "Ratgeber", count: posts.filter(p => p.category === "Ratgeber").length, icon: BookOpen, color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  { name: "Bewertung", count: posts.filter(p => p.category === "Bewertung").length, icon: Eye, color: "bg-red-100 text-red-700 hover:bg-red-200" },
  { name: "Verkauf", count: posts.filter(p => p.category === "Verkauf").length, icon: Building2, color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
  { name: "Sanierung", count: posts.filter(p => p.category === "Sanierung").length, icon: Building2, color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  { name: "Politik", count: posts.filter(p => p.category === "Politik").length, icon: Building2, color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
  { name: "Nachhaltigkeit", count: posts.filter(p => p.category === "Nachhaltigkeit").length, icon: Eye, color: "bg-green-100 text-green-700 hover:bg-green-200" },
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
  // Simplified state management
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Alle")

  // Use only static blog posts for now (simplified)
  const allBlogPosts = blogPosts
  const categories = getCategories(allBlogPosts)

  // Memoized filtering for performance
  const filteredPosts = useMemo(() => {
    if (!searchTerm && selectedCategory === "Alle") return allBlogPosts

    return allBlogPosts.filter(post => {
      const matchesSearch = !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "Alle" || post.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory, allBlogPosts])

  const featuredPosts = filteredPosts.filter(post => post.featured)
  const recentPosts = filteredPosts.filter(post => !post.featured).slice(0, 6)


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
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

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.05) 50%, transparent 51%)
          `,
          backgroundSize: '60px 60px, 40px 40px, 20px 20px'
        }}></div>

        {/* Floating data points */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xs font-bold">+8.7%</span>
          </div>
          <div className="absolute top-32 right-32 w-20 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xs">2024</span>
          </div>
          <div className="absolute bottom-32 left-32 w-24 h-16 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xs font-bold">€12.450/m²</span>
          </div>
          <div className="absolute bottom-20 right-20 w-18 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xs">München</span>
          </div>
        </div>
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
                {getCategories(allBlogPosts).map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({allBlogPosts.filter(p => category.name === "Alle" || p.category === category.name).length})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-full">
              {filteredPosts.length} Artikel verfügbar
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
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
              Unsere beliebtesten und meistgelesenen Artikel zu aktuellen Immobilienthemen
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.map((post, index) => (
              <Card key={post.id} className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white ${index === 0 ? 'lg:row-span-2' : ''}`}>
                <div className="relative overflow-hidden">
                  <div className={`aspect-video ${index === 0 ? 'lg:aspect-square' : ''} bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative overflow-hidden`}>
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.6)"/>
                        <circle cx="80" cy="30" r="1.5" fill="rgba(255,255,255,0.4)"/>
                        <circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.5)"/>
                        <circle cx="70" cy="80" r="1.5" fill="rgba(255,255,255,0.3)"/>
                        <rect x="50" y="20" width="3" height="8" fill="rgba(255,255,255,0.4)" rx="1"/>
                        <rect x="15" y="60" width="2" height="6" fill="rgba(255,255,255,0.5)" rx="1"/>
                      </svg>
                    </div>

                    <div className="text-white text-center relative z-10">
                      {/* Dynamic icons based on article category */}
                      {post.category === "Finanzierung" && (
                        <>
                          <Euro className={`mx-auto mb-2 ${index === 0 ? 'w-20 h-20' : 'w-16 h-16'}`} />
                          <div className="text-xs opacity-90">Finanzen</div>
                        </>
                      )}
                      {post.category === "Marktanalyse" && (
                        <>
                          <TrendingUp className={`mx-auto mb-2 ${index === 0 ? 'w-20 h-20' : 'w-16 h-16'}`} />
                          <div className="text-xs opacity-90">Analyse</div>
                        </>
                      )}
                      {post.category === "Politik" && (
                        <>
                          <Building className={`mx-auto mb-2 ${index === 0 ? 'w-20 h-20' : 'w-16 h-16'}`} />
                          <div className="text-xs opacity-90">Politik</div>
                        </>
                      )}
                      {post.category === "Technologie" && (
                        <>
                          <TrendingUp className={`mx-auto mb-2 ${index === 0 ? 'w-20 h-20' : 'w-16 h-16'}`} />
                          <div className="text-xs opacity-90">KI & Tech</div>
                        </>
                      )}
                      {!["Finanzierung", "Marktanalyse", "Politik", "Technologie"].includes(post.category) && (
                        <>
                          <Building2 className={`mx-auto mb-2 ${index === 0 ? 'w-20 h-20' : 'w-16 h-16'}`} />
                          <div className="text-xs opacity-90">Immobilien</div>
                        </>
                      )}
                    </div>

                    {/* Floating data elements */}
                    <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                      <span className="text-white text-xs font-bold">{post.readTime}</span>
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

        {/* Simple featured articles section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Alle Artikel
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Umfassende Analysen und praktische Tipps für Ihre Immobilienentscheidungen
            </p>
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

          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%),
              linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)
            `,
            backgroundSize: '20px 20px, 20px 20px'
          }}></div>

          {/* Floating stats */}
          <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-xs text-emerald-200">📈</div>
            <div className="text-xs font-bold">+8.7%</div>
          </div>
          <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-xs text-blue-200">📊</div>
            <div className="text-xs font-bold">2024</div>
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
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
                className="flex-1 px-4 py-4 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-white/40"
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