import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, User, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Aktuelle Marktanalysen, Expertenwissen und Strategien rund um Immobilienbewertung, Investment und Finanzierung. Datenbasiert und KI-optimiert.",
}

const blogPosts = [
  {
    id: "immobilienmarkt-2024-trends",
    title: "Immobilienmarkt 2024: Trends und Entwicklungen",
    excerpt:
      "Der Immobilienmarkt 2024 steht vor bedeutenden Veraenderungen durch KI-Technologie, steigende Nachhaltigkeitsanforderungen und demografischen Wandel. Wir analysieren die wichtigsten Trends fuer Kaufer, Verkaeufer und Investoren auf Basis aktueller Marktdaten. Erfahren Sie, welche Regionen besonders profitieren und wo Risiken lauern. Dieser Ueberblick hilft Ihnen, fundierte Entscheidungen in einem dynamischen Marktumfeld zu treffen.",
    author: "Proplytics Team",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Marktanalyse",
    tags: ["Trends", "2024", "Marktanalyse"],
  },
  {
    id: "ki-immobilienbewertung-zukunft",
    title: "KI in der Immobilienbewertung: Die Zukunft ist da",
    excerpt:
      "Kuenstliche Intelligenz veraendert die Immobilienbranche grundlegend - von automatisierten Marktwertberechnungen bis hin zu praezisen Standortbewertungen. Moderne KI-Systeme analysieren historische Verkaufsdaten, Wirtschaftsindikatoren und soziodemografische Faktoren in Echtzeit. Das Ergebnis sind schnellere, transparentere und genauere Bewertungen fuer alle Beteiligten. In diesem Artikel zeigen wir, wie Kaufer, Verkaeufer und Makler von der Technologie profitieren.",
    author: "Dr. Sarah Weber",
    date: "2024-01-10",
    readTime: "7 min",
    category: "Technologie",
    tags: ["KI", "Bewertung", "Innovation"],
  },
  {
    id: "immobilien-kaufen-2024-guide",
    title: "Immobilien kaufen 2024: Leitfaden fuer Erstkaeufer",
    excerpt:
      "Der Immobilienkauf zaehlt zu den komplexesten finanziellen Entscheidungen im Leben - von der Finanzierungsstrukturierung ueber die Standortanalyse bis zur rechtlichen Due Diligence. Dieser datenbasierte Leitfaden fuehrt Erstkaeufer Schritt fuer Schritt durch den gesamten Prozess mit aktuellen Marktdaten und Finanzierungskonditionen 2024. Lernen Sie die haeufigsten Fehler-Muster kennen und nutzen Sie KI-optimierte Entscheidungshilfen fuer Ihren erfolgreichen Immobilienkauf.",
    author: "Dr. Michael Bauer",
    date: "2024-01-10",
    readTime: "22 min",
    category: "Ratgeber",
    tags: ["Erstkaeufer", "Finanzierung", "Due Diligence"],
  },
  {
    id: "rental-yields-deutschland-vergleich",
    title: "Mietrenditen Deutschland 2024: Staedtevergleich",
    excerpt:
      "Die Wahl des richtigen Standorts entscheidet ueber Erfolg oder Misserfolg einer Immobilieninvestition. Basierend auf Daten des Statistischen Bundesamtes und empirischen Analysen von ueber 50.000 Transaktionen praesentieren wir den umfassendsten Staedtevergleich fuer Mietrenditen in Deutschland. Leipzig fuehrt mit 5,8% Cashflow-Rendite, gefolgt von Dresden und Dortmund. Erfahren Sie, welche Investmentstrategie zu Ihrem Risikoprofil passt.",
    author: "Proplytics Research",
    date: "2024-01-05",
    readTime: "18 min",
    category: "Analyse",
    tags: ["Mietrenditen", "Staedtevergleich", "Investment"],
  },
  {
    id: "energetische-sanierung-foerderung",
    title: "Energetische Sanierung: Foerderungen & Wirtschaftlichkeit",
    excerpt:
      "Die energetische Sanierung von Bestandsimmobilien wird durch steigende Energiepreise und verschaerfte gesetzliche Vorgaben immer wichtiger. Mit den richtigen Foerderprogrammen - insbesondere der KfW und BAFA - lassen sich bis zu 45% der Sanierungskosten abdecken. Wir analysieren die Wirtschaftlichkeit verschiedener Sanierungsmassnahmen von der Daemmung bis zur Waermepumpe. Erfahren Sie, welche Investitionen sich am schnellsten amortisieren und den Immobilienwert nachhaltig steigern.",
    author: "Proplytics Team",
    date: "2024-01-02",
    readTime: "10 min",
    category: "Ratgeber",
    tags: ["Sanierung", "Foerderung", "Energieeffizienz"],
  },
]

export default function BlogPage() {
  const featuredPost = blogPosts[0]
  const recentPosts = blogPosts.slice(1)

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-secondary/30 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Immobilien-Blog
            </span>
          </div>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Wissen & Marktanalysen
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Aktuelle Trends, datenbasierte Analysen und Expertenwissen fuer
            Immobilieninvestoren und Eigentuemer.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        {/* Featured Post */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold">Featured Artikel</h2>
          <Card className="overflow-hidden border-border transition-shadow hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="border-none bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  {featuredPost.category}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {featuredPost.readTime}
                </span>
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                <Link
                  href={`/blog/${featuredPost.id}`}
                  className="transition-colors hover:text-emerald-600"
                >
                  {featuredPost.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {featuredPost.author}
                  </span>
                  <span>{featuredPost.date}</span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/blog/${featuredPost.id}`}>
                    Lesen <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Posts */}
        <section>
          <h2 className="mb-6 text-xl font-bold">Aktuelle Artikel</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {recentPosts.map((post) => (
              <Card
                key={post.id}
                className="flex flex-col border-border transition-shadow hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="border-none bg-secondary text-secondary-foreground"
                    >
                      {post.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg">
                    <Link
                      href={`/blog/${post.id}`}
                      className="transition-colors hover:text-emerald-600"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                    <Link
                      href={`/blog/${post.id}`}
                      className="font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {"Lesen ->"}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
