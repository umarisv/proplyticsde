import Link from "next/link"
import {
  MapPin,
  ArrowRight,
  TrendingUp,
  PieChart,
  Wrench,
  GitCompare,
  FileDown,
  Sparkles,
  Shield,
  CheckCircle,
} from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Marktwert Range",
    description: "Realistische Wertspanne basierend auf aktuellen Marktdaten.",
  },
  {
    icon: PieChart,
    title: "Rendite & IRR",
    description: "Sofortige Rentabilitaetsanalyse fuer Investitionsentscheidungen.",
  },
  {
    icon: Wrench,
    title: "Sanierungsbedarf",
    description: "Kostenschaetzung fuer notwendige Modernisierungen.",
  },
  {
    icon: MapPin,
    title: "Mietspiegel & Lage",
    description: "Lokale Marktindikatoren und Lagefaktoren im Ueberblick.",
  },
  {
    icon: GitCompare,
    title: "Vergleichsobjekte",
    description: "Aehnliche Immobilien in der Umgebung zum Vergleich.",
  },
  {
    icon: FileDown,
    title: "PDF Report",
    description: "Professioneller Report zum Download in einem Klick.",
  },
]

const steps = [
  {
    num: "1",
    title: "Adresse eingeben",
    description: "Geben Sie die Adresse der Immobilie ein.",
  },
  {
    num: "2",
    title: "KI analysiert",
    description: "Unsere KI wertet Marktdaten und Vergleichsobjekte aus.",
  },
  {
    num: "3",
    title: "Ergebnis erhalten",
    description: "Sie erhalten eine professionelle Bewertung als PDF.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold">proplytics.de</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              So funktioniert es
            </a>
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-md bg-emerald-500 px-4 text-sm font-medium text-white hover:bg-emerald-600"
            >
              Anmelden
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex min-h-[80vh] items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">
              KI-gestuetzte Immobilienbewertung
            </span>
          </div>

          <h1 className="mb-6 text-balance text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
            {"Immobilie analysieren. "}
            <span className="text-emerald-500">Professionell.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
            Detaillierte Marktanalyse, Wirtschaftlichkeitsberechnung & professionelle Bewertung.
          </p>

          <Link
            href="/analyse"
            className="inline-flex h-14 items-center gap-2 rounded-xl bg-emerald-500 px-8 text-base font-medium text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:shadow-emerald-500/40"
          >
            Kostenlose Analyse starten
            <ArrowRight className="h-5 w-5" />
          </Link>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>ImmoWertV 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Vollstaendige Analyse</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Alles was Sie brauchen
            </h2>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              Umfassende Analyse-Tools fuer fundierte Entscheidungen.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50">
                  <feature.icon className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="mb-2 font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-secondary/50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              So funktioniert es
            </h2>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              In drei Schritten zur professionellen Bewertung.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-lg font-semibold text-white">
                  {step.num}
                </div>
                <h3 className="mb-2 font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-border py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Shield className="mx-auto mb-6 h-10 w-10 text-emerald-500" />
          <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Vertrauen & Sicherheit
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-lg text-muted-foreground">
            Ihre Daten sind bei uns sicher. DSGVO-konform und nach deutschen Standards.
          </p>
          <Link
            href="/analyse"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-medium text-white hover:bg-emerald-600"
          >
            Jetzt starten
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <span>Proplytics</span>
            <span className="text-muted-foreground">
              {"© " + new Date().getFullYear()}
            </span>
          </div>
          <nav className="flex items-center gap-6">
            {["Impressum", "Datenschutz", "AGB", "Kontakt"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
