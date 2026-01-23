"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowRight, TrendingUp, Building2, Euro, Search, MessageCircle, Users, ThumbsUp, Share2, Eye, BookOpen } from "lucide-react"

// Community topics and discussions
const communityTopics = [
  {
    id: "zinspolitik-diskussion",
    title: "EZB Zinsentscheidung: Was bedeutet das für Immobilienkäufer?",
    excerpt: "Die EZB hat gestern die Zinsen stabil gehalten. Wie wirkt sich das auf die Immobilienpreise aus? Diskutieren wir über die Auswirkungen auf Käufer und Investoren.",
    author: "Markus_Finanzguru",
    date: "2024-01-23",
    replies: 24,
    views: 156,
    likes: 12,
    category: "Finanzierung",
    tags: ["EZB", "Zinsen", "Immobilienkauf", "2024"],
    isHot: true,
    lastReply: "2024-01-23T14:30:00Z"
  },
  {
    id: "preisentwicklung-fragen",
    title: "Sind die Immobilienpreise in München noch gerechtfertigt?",
    excerpt: "Bei 15.000€/m² in Top-Lagen frage ich mich, ob das noch rational ist. Wie beurteilt ihr die Preis-Nutzen-Relation in München?",
    author: "Sarah_Investorin",
    date: "2024-01-22",
    replies: 18,
    views: 203,
    likes: 8,
    category: "Preise",
    tags: ["München", "Preise", "Überteuert", "Investition"],
    isHot: true,
    lastReply: "2024-01-23T12:15:00Z"
  },
  {
    id: "sanierungstipps-teilen",
    title: "Erfolgreiche Sanierungen: Eure besten Tipps und Erfahrungen",
    excerpt: "Ich plane eine Komplettsanierung meines Altbaus. Welche Erfahrungen habt ihr gemacht? Welche Handwerker empfehlt ihr? Budget-Überraschungen?",
    author: "Thomas_Sanierer",
    date: "2024-01-21",
    replies: 31,
    views: 289,
    likes: 22,
    category: "Sanierung",
    tags: ["Sanierung", "Altbau", "Handwerker", "Budget"],
    isHot: false,
    lastReply: "2024-01-23T10:45:00Z"
  },
  {
    id: "vermietung-erfahrungen",
    title: "Vermietung an Studenten: Pro und Contra",
    excerpt: "Ich überlege, meine Wohnung an Studenten zu vermieten. Wie sind eure Erfahrungen? Zuverlässigkeit, Schäden, Mietausfälle?",
    author: "Lisa_Vermieterin",
    date: "2024-01-20",
    replies: 15,
    views: 167,
    likes: 6,
    category: "Vermietung",
    tags: ["Studenten", "Vermietung", "Erfahrungen", "Risiken"],
    isHot: false,
    lastReply: "2024-01-22T16:20:00Z"
  },
  {
    id: "steueroptimierung-tipps",
    title: "Steuervorteile bei Immobilien: Was nutzt ihr?",
    excerpt: "Welche steuerlichen Vorteile bei Immobilienbesitz kennt ihr? AfA, Werbungskosten, Steuererklärungstipps? Teilt eure Strategien!",
    author: "Michael_Steuerfuchs",
    date: "2024-01-19",
    replies: 27,
    views: 334,
    likes: 19,
    category: "Steuern",
    tags: ["Steuern", "AfA", "Werbungskosten", "Optimierung"],
    isHot: false,
    lastReply: "2024-01-23T08:30:00Z"
  },
  {
    id: "klimawandel-immobilien",
    title: "Klimawandel und Immobilienwert: Wie schützt man sich?",
    excerpt: "Angesichts der zunehmenden Wetterextreme mache ich mir Sorgen um meinen Immobilienwert. Hochwassergebiete, Hitzeperioden... Wie geht ihr damit um?",
    author: "Anna_Nachhaltig",
    date: "2024-01-18",
    replies: 20,
    views: 245,
    likes: 14,
    category: "Nachhaltigkeit",
    tags: ["Klimawandel", "Risiken", "Nachhaltigkeit", "Schutz"],
    isHot: false,
    lastReply: "2024-01-22T19:10:00Z"
  }
]

const communityCategories = [
  { name: "Alle", count: communityTopics.length, icon: Search, color: "bg-slate-100 text-slate-700" },
  { name: "Finanzierung", count: communityTopics.filter(t => t.category === "Finanzierung").length, icon: Euro, color: "bg-emerald-100 text-emerald-700" },
  { name: "Preise", count: communityTopics.filter(t => t.category === "Preise").length, icon: TrendingUp, color: "bg-blue-100 text-blue-700" },
  { name: "Sanierung", count: communityTopics.filter(t => t.category === "Sanierung").length, icon: Building2, color: "bg-orange-100 text-orange-700" },
  { name: "Vermietung", count: communityTopics.filter(t => t.category === "Vermietung").length, icon: Users, color: "bg-purple-100 text-purple-700" },
  { name: "Steuern", count: communityTopics.filter(t => t.category === "Steuern").length, icon: BookOpen, color: "bg-red-100 text-red-700" },
  { name: "Nachhaltigkeit", count: communityTopics.filter(t => t.category === "Nachhaltigkeit").length, icon: Eye, color: "bg-green-100 text-green-700" },
]

interface CommunityTopic {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  replies: number
  views: number
  likes: number
  category: string
  tags: string[]
  isHot: boolean
  lastReply: string
}

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Alle")
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "active">("newest")

  const filteredTopics = communityTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "Alle" || topic.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.likes + b.replies) - (a.likes + a.replies)
      case "active":
        return new Date(b.lastReply).getTime() - new Date(a.lastReply).getTime()
      case "newest":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          backgroundSize: '100px 100px'
        }}></div>

        {/* Floating discussion elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-16 w-20 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm animate-pulse">
            <span className="text-white text-xs">💬 Diskussion</span>
          </div>
          <div className="absolute top-24 right-20 w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-emerald-200 text-xs font-bold">24</span>
          </div>
          <div className="absolute bottom-20 left-20 w-24 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-blue-200 text-xs">👥 Community</span>
          </div>
          <div className="absolute bottom-16 right-16 w-18 h-14 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-purple-200 text-xs font-bold">156</span>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Immobilien-Community</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Wissen teilen.<br />
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Gemeinsam wachsen.
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Tausche dich mit Immobilienexperten aus, diskutiere aktuelle Trends und finde Antworten auf deine Fragen.
              Eine Community für Käufer, Verkäufer und Investoren.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-emerald-300">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">24/7 Diskussionen</span>
              </div>
              <div className="flex items-center gap-2 text-blue-300">
                <Users className="w-5 h-5" />
                <span className="text-sm">Experten & Enthusiasten</span>
              </div>
              <div className="flex items-center gap-2 text-purple-300">
                <Eye className="w-5 h-5" />
                <span className="text-sm">Tägliche Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Themen durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-full border-slate-200 focus:border-emerald-300 focus:ring-emerald-300"
              />
            </div>

            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm focus:border-emerald-300 focus:ring-emerald-300"
              >
                {communityCategories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "popular" | "active")}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm focus:border-emerald-300 focus:ring-emerald-300"
              >
                <option value="newest">Neueste</option>
                <option value="popular">Beliebt</option>
                <option value="active">Aktiv</option>
              </select>
            </div>

            <Button className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-6">
              Neues Thema
            </Button>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-6">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {topic.category}
                      </Badge>
                      {topic.isHot && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          Heiß
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-emerald-600 transition-colors">
                      <Link href={`/community/${topic.id}`}>{topic.title}</Link>
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      {topic.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {topic.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{topic.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(topic.date).toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {topic.replies} Antworten
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {topic.views} Views
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {topic.likes}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/community/${topic.id}`} className="flex items-center gap-2">
                        Diskussion beitreten
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Keine Themen gefunden</h3>
            <p className="text-slate-500 mb-6">Versuche andere Suchbegriffe oder Kategorien.</p>
            <Button onClick={() => setSearchTerm("")}>
              Alle Themen anzeigen
            </Button>
          </div>
        )}

        {/* Community Stats */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="text-3xl font-bold mb-2">{communityTopics.length}</div>
              <div className="text-emerald-100">Aktive Themen</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {communityTopics.reduce((sum, topic) => sum + topic.replies, 0)}
              </div>
              <div className="text-emerald-100">Antworten</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {communityTopics.reduce((sum, topic) => sum + topic.views, 0)}
              </div>
              <div className="text-emerald-100">Views</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {new Set(communityTopics.map(topic => topic.author)).size}
              </div>
              <div className="text-emerald-100">Aktive Mitglieder</div>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-4">Werde Teil der Community</h3>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Tausche dich mit Immobilienexperten aus, teile deine Erfahrungen und lerne von anderen. Unsere Community hilft dir, bessere Entscheidungen zu treffen.
          </p>
          <Button className="bg-white text-emerald-600 font-semibold hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl">
            Jetzt beitreten
          </Button>
        </div>
      </div>
    </div>
  )
}