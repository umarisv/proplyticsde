"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Search,
  MessageCircle,
  Users,
  ThumbsUp,
  Eye,
  User,
  Calendar,
} from "lucide-react"
import { PageHero } from "@/components/page-hero"

const communityTopics = [
  {
    id: "zinspolitik-diskussion",
    title: "EZB Zinsentscheidung: Was bedeutet das fuer Immobilienkaufer?",
    excerpt:
      "Die EZB hat gestern die Zinsen stabil gehalten. Wie wirkt sich das auf die Immobilienpreise aus? Diskutieren wir ueber die Auswirkungen.",
    author: "Markus_Finanzguru",
    date: "2024-01-23",
    replies: 24,
    views: 156,
    likes: 12,
    category: "Finanzierung",
    tags: ["EZB", "Zinsen", "Immobilienkauf"],
    isHot: true,
  },
  {
    id: "preisentwicklung-fragen",
    title: "Sind die Immobilienpreise in Muenchen noch gerechtfertigt?",
    excerpt:
      "Bei 15.000 EUR/m2 in Top-Lagen frage ich mich, ob das noch rational ist. Wie beurteilt ihr die Preis-Nutzen-Relation?",
    author: "Sarah_Investorin",
    date: "2024-01-22",
    replies: 18,
    views: 203,
    likes: 8,
    category: "Preise",
    tags: ["Muenchen", "Preise", "Investition"],
    isHot: true,
  },
  {
    id: "sanierungstipps-teilen",
    title: "Erfolgreiche Sanierungen: Eure besten Tipps und Erfahrungen",
    excerpt:
      "Ich plane eine Komplettsanierung meines Altbaus. Welche Erfahrungen habt ihr gemacht? Welche Handwerker empfehlt ihr?",
    author: "Thomas_Sanierer",
    date: "2024-01-21",
    replies: 31,
    views: 289,
    likes: 22,
    category: "Sanierung",
    tags: ["Sanierung", "Altbau", "Handwerker"],
    isHot: false,
  },
  {
    id: "vermietung-erfahrungen",
    title: "Vermietung an Studenten: Pro und Contra",
    excerpt:
      "Ich ueberlege, meine Wohnung an Studenten zu vermieten. Wie sind eure Erfahrungen?",
    author: "Lisa_Vermieterin",
    date: "2024-01-20",
    replies: 15,
    views: 167,
    likes: 6,
    category: "Vermietung",
    tags: ["Studenten", "Vermietung", "Erfahrungen"],
    isHot: false,
  },
  {
    id: "steueroptimierung-tipps",
    title: "Steuervorteile bei Immobilien: Was nutzt ihr?",
    excerpt:
      "Welche steuerlichen Vorteile bei Immobilienbesitz kennt ihr? AfA, Werbungskosten, Tipps?",
    author: "Michael_Steuerfuchs",
    date: "2024-01-19",
    replies: 27,
    views: 334,
    likes: 19,
    category: "Steuern",
    tags: ["Steuern", "AfA", "Werbungskosten"],
    isHot: false,
  },
  {
    id: "klimawandel-immobilien",
    title: "Klimawandel und Immobilienwert: Wie schuetzt man sich?",
    excerpt:
      "Angesichts der zunehmenden Wetterextreme mache ich mir Sorgen um meinen Immobilienwert.",
    author: "Anna_Nachhaltig",
    date: "2024-01-18",
    replies: 20,
    views: 245,
    likes: 14,
    category: "Nachhaltigkeit",
    tags: ["Klimawandel", "Risiken", "Nachhaltigkeit"],
    isHot: false,
  },
]

const categories = [
  "Alle",
  "Finanzierung",
  "Preise",
  "Sanierung",
  "Vermietung",
  "Steuern",
  "Nachhaltigkeit",
]

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Alle")
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "active">(
    "newest"
  )

  const filteredTopics = communityTopics
    .filter((topic) => {
      const matchesSearch =
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === "Alle" || topic.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.likes + b.replies - (a.likes + a.replies)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return (
    <div className="bg-background text-foreground">
      <PageHero
        badge="Immobilien-Community"
        badgeIcon={<Users className="h-4 w-4 text-primary" />}
        title="Wissen teilen."
        titleAccent="Gemeinsam wachsen."
        description="Tauschen Sie sich mit Immobilienexperten aus, diskutieren Sie aktuelle Trends und finden Sie Antworten auf Ihre Fragen."
      >
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span>24/7 Diskussionen</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Experten & Enthusiasten</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span>Taegliche Updates</span>
          </div>
        </div>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Search & Filter */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Themen durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-full pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary/50 focus:ring-primary/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "popular" | "active")
                }
                className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary/50 focus:ring-primary/50"
              >
                <option value="newest">Neueste</option>
                <option value="popular">Beliebt</option>
                <option value="active">Aktiv</option>
              </select>
            </div>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Neues Thema
            </Button>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-col gap-4">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="border-border transition-all hover:border-primary/20 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Badge className="border-none bg-primary/10 text-primary hover:bg-primary/10">
                    {topic.category}
                  </Badge>
                  {topic.isHot && (
                    <Badge className="border-none bg-destructive/10 text-destructive hover:bg-destructive/10">
                      Heiss
                    </Badge>
                  )}
                </div>
                <h3 className="mb-2 text-xl font-bold transition-colors hover:text-primary">
                  <Link href={`/community/${topic.id}`}>{topic.title}</Link>
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                  {topic.excerpt}
                </p>
                <div className="mb-3 flex flex-wrap gap-1">
                  {topic.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {topic.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(topic.date).toLocaleDateString("de-DE")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {topic.replies}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {topic.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {topic.likes}
                    </span>
                  </div>

                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/community/${topic.id}`}
                      className="flex items-center gap-2"
                    >
                      Diskussion beitreten
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-xl font-semibold">Keine Themen gefunden</h3>
            <p className="mb-6 text-muted-foreground">
              Versuche andere Suchbegriffe oder Kategorien.
            </p>
            <Button onClick={() => setSearchTerm("")}>
              Alle Themen anzeigen
            </Button>
          </div>
        )}

        {/* Community Stats CTA */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <div className="mb-1 text-3xl font-bold text-primary">
                {communityTopics.length}
              </div>
              <div className="text-sm text-muted-foreground">Aktive Themen</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-primary">
                {communityTopics.reduce((s, t) => s + t.replies, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Antworten</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-primary">
                {communityTopics.reduce((s, t) => s + t.views, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-primary">
                {new Set(communityTopics.map((t) => t.author)).size}
              </div>
              <div className="text-sm text-muted-foreground">Aktive Mitglieder</div>
            </div>
          </div>
          <h3 className="mb-3 text-2xl font-bold">
            Werde Teil der Community
          </h3>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
            Tauschen Sie sich mit Immobilienexperten aus, teilen Sie Ihre
            Erfahrungen und lernen Sie von anderen.
          </p>
          <Button className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
            Jetzt beitreten
          </Button>
        </div>
      </div>
    </div>
  )
}
