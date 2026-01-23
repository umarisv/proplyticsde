"use client"

import { use } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  TrendingUp,
  Building2
} from "lucide-react"

// Mock blog data - in production, this would come from a CMS or database
const blogPosts = {
  "immobilienmarkt-2024-trends": {
    title: "Immobilienmarkt 2024: Diese Trends prägen die Zukunft",
    excerpt: "Entdecken Sie die wichtigsten Entwicklungen am Immobilienmarkt 2024. Von KI-gestützten Bewertungen bis hin zu nachhaltigen Investments.",
    content: `
# Immobilienmarkt 2024: Diese Trends prägen die Zukunft

Der Immobilienmarkt 2024 steht vor bedeutenden Veränderungen. In diesem Artikel analysieren wir die wichtigsten Trends, die Käufer, Verkäufer und Investoren kennen sollten.

## 1. KI-gestützte Bewertungen werden Standard

Künstliche Intelligenz revolutioniert die Immobilienbewertung. Moderne Algorithmen können nun:

- Automatische Marktwertberechnungen
- Risikoanalysen in Echtzeit
- Standortbasierte Preisprognosen
- Energieeffizienz-Bewertungen

## 2. Nachhaltigkeit als Investitionskriterium

Umweltbewusste Investitionen werden immer wichtiger:

- Grüne Gebäude mit höheren Wiederverkaufswerten
- Energieeffizienz-Klasse A+ als Standard
- Nachhaltige Materialien reduzieren langfristige Kosten
- ESG-Kriterien beeinflussen Finanzierungen

## 3. Digitale Transformation

Die Immobilienbranche digitalisiert sich rasant:

- Virtuelle Besichtigungen werden Normalität
- Blockchain für Eigentumsübertragungen
- Smart Home Technologien
- Digitale Verwaltungssysteme

## 4. Demografischer Wandel

Bevölkerungsveränderungen wirken sich aus:

- Urbanisierung nimmt weiter zu
- Nachfrage nach seniorengerechtem Wohnen
- Mikro-Apartments für Singles
- Co-Living Konzepte gewinnen an Beliebtheit

## Fazit

Der Immobilienmarkt 2024 bietet sowohl Herausforderungen als auch Chancen. Wer die Trends früh erkennt und sich anpasst, wird erfolgreich sein.

Bleiben Sie informiert und nutzen Sie moderne Tools für Ihre Immobilienentscheidungen.
    `,
    author: "Proplytics Team",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Marktanalyse",
    tags: ["Trends", "2024", "Marktanalyse", "Investitionen"],
    relatedPosts: ["ki-immobilienbewertung-zukunft", "nachhaltige-immobilien-investitionen"]
  },
  "ki-immobilienbewertung-zukunft": {
    title: "KI in der Immobilienbewertung: Die Zukunft ist bereits da",
    excerpt: "Wie künstliche Intelligenz die Immobilienbewertung revolutioniert und was das für Käufer und Verkäufer bedeutet.",
    content: `
# KI in der Immobilienbewertung: Die Zukunft ist bereits da

Künstliche Intelligenz verändert die Immobilienbranche fundamental. Erfahren Sie, wie KI die Bewertung revolutioniert.

## Was KI bereits heute kann

Moderne KI-Systeme analysieren:

- Historische Verkaufsdaten
- Marktentwicklungen
- Standortfaktoren
- Wirtschaftsindikatoren
- Soziodemografische Daten

## Vorteile für alle Beteiligten

**Für Käufer:**
- Transparentere Preise
- Schnellere Entscheidungen
- Bessere Verhandlungsposition

**Für Verkäufer:**
- Realistische Preisvorstellungen
- Schnellere Verkaufsprozesse
- Höhere Verkaufspreise

**Für Makler:**
- Professionellere Beratung
- Zeitersparnis
- Wettbewerbsvorteil

## Die Zukunft der KI-Bewertung

In naher Zukunft werden KI-Systeme:

- Echtzeit-Marktdaten verarbeiten
- Sentiment-Analysen durchführen
- Klimawandel-Effekte berücksichtigen
- Personalisierte Empfehlungen geben

## Fazit

KI ist keine Bedrohung, sondern eine Chance für die Immobilienbranche. Wer sich früh damit auseinandersetzt, wird erfolgreich sein.
    `,
    author: "Dr. Sarah Weber",
    date: "2024-01-10",
    readTime: "7 min",
    category: "Technologie",
    tags: ["KI", "Bewertung", "Innovation", "Zukunft"],
    relatedPosts: ["immobilienmarkt-2024-trends", "wohntrends-2024-staedte"]
  }
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params)
  const post = blogPosts[slug as keyof typeof blogPosts]

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Artikel nicht gefunden</h1>
          <Link href="/blog" className="text-emerald-600 hover:text-emerald-700">
            Zurück zum Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Blog
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-6">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
              {post.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              {post.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('de-DE')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <div
            className="text-slate-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/\n/g, '<br>').replace(/^# (.+)$/gm, '<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">$1</h2>').replace(/^## (.+)$/gm, '<h3 class="text-xl font-semibold text-slate-800 mt-6 mb-3">$1</h3>')
            }}
          />
        </div>

        {/* Article Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsUp className="w-4 h-4" />
                Gefällt mir
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Kommentieren
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Teilen
            </Button>
          </div>
        </div>

        {/* Related Posts */}
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Weiterlesen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {post.relatedPosts.map((relatedSlug) => {
                const relatedPost = blogPosts[relatedSlug as keyof typeof blogPosts]
                if (!relatedPost) return null

                return (
                  <Card key={relatedSlug} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {relatedPost.category}
                      </Badge>
                      <h4 className="font-semibold text-slate-900 mb-2 hover:text-emerald-600 transition-colors">
                        <Link href={`/blog/${relatedSlug}`}>{relatedPost.title}</Link>
                      </h4>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{relatedPost.author}</span>
                        <span>•</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Bleiben Sie auf dem Laufenden</h3>
          <p className="mb-6 opacity-90 text-sm">
            Erhalten Sie wöchentlich die neuesten Immobilien-Trends und Marktanalysen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Ihre E-Mail-Adresse"
              className="flex-1 px-4 py-2 rounded-lg text-slate-900 placeholder:text-slate-500 text-sm"
            />
            <button className="px-4 py-2 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm">
              Abonnieren
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}