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
  BarChart3,
  Users,
  BookOpen,
  ShoppingBag,
  GraduationCap,
  LayoutDashboard,
  ChevronRight,
  Building2,
  Menu,
  X,
} from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Marktwert Range",
    description: "Realistische Wertspanne basierend auf aktuellen Marktdaten und Vergleichswerten.",
  },
  {
    icon: PieChart,
    title: "Rendite & IRR",
    description: "Sofortige Rentabilitaetsanalyse fuer fundierte Investitionsentscheidungen.",
  },
  {
    icon: Wrench,
    title: "Sanierungsbedarf",
    description: "Kostenschaetzung fuer notwendige Modernisierungen und Instandhaltung.",
  },
  {
    icon: MapPin,
    title: "Mietspiegel & Lage",
    description: "Lokale Marktindikatoren und detaillierte Lagefaktoren im Ueberblick.",
  },
  {
    icon: GitCompare,
    title: "Vergleichsobjekte",
    description: "Aehnliche Immobilien in der Umgebung zum direkten Vergleich.",
  },
  {
    icon: FileDown,
    title: "PDF Report",
    description: "Professioneller Bewertungsreport zum Download in einem Klick.",
  },
]

const steps = [
  {
    num: "01",
    title: "Adresse eingeben",
    description: "Geben Sie die Adresse der Immobilie ein und starten Sie die Analyse.",
  },
  {
    num: "02",
    title: "KI analysiert",
    description: "Unsere KI wertet Marktdaten, Vergleichsobjekte und Lagefaktoren aus.",
  },
  {
    num: "03",
    title: "Ergebnis erhalten",
    description: "Erhalten Sie eine professionelle Bewertung mit PDF-Report.",
  },
]

const platformSections = [
  {
    icon: BarChart3,
    title: "Analyse",
    description: "KI-gestuetzte Immobilienbewertung mit detaillierter Marktanalyse.",
    href: "/analyse",
    color: "bg-emerald-500",
  },
  {
    icon: LayoutDashboard,
    title: "Portal",
    description: "Ihr persoenliches Dashboard mit allen Bewertungen und Dokumenten.",
    href: "/portal",
    color: "bg-sky-500",
  },
  {
    icon: ShoppingBag,
    title: "Marktplatz",
    description: "Finden Sie Dienstleister, Gutachter und Services rund um Immobilien.",
    href: "/portal/marktplatz",
    color: "bg-amber-500",
  },
  {
    icon: Users,
    title: "Community",
    description: "Tauschen Sie sich mit anderen Investoren und Eigentuemern aus.",
    href: "/community",
    color: "bg-violet-500",
  },
  {
    icon: GraduationCap,
    title: "Academy",
    description: "Lernen Sie alles ueber Immobilienbewertung und Investitionen.",
    href: "/portal/academy",
    color: "bg-rose-500",
  },
  {
    icon: BookOpen,
    title: "Blog",
    description: "Aktuelle Artikel, Marktberichte und Expertenwissen.",
    href: "/blog",
    color: "bg-teal-500",
  },
]

const stats = [
  { value: "10.000+", label: "Bewertungen" },
  { value: "98%", label: "Genauigkeit" },
  { value: "< 60s", label: "Analysezeit" },
  { value: "4.8/5", label: "Kundenzufriedenheit" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">proplytics.de</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link href="/analyse" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Analyse
            </Link>
            <Link href="/blog" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Blog
            </Link>
            <Link href="/community" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Community
            </Link>
            <Link href="/portal/marktplatz" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Marktplatz
            </Link>
            <Link href="/portal/academy" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Academy
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                KI-gestuetzte Immobilienbewertung
              </span>
            </div>

            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Immobilie analysieren.{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Professionell.
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Detaillierte Marktanalyse, Wirtschaftlichkeitsberechnung &
              professionelle Bewertung - in unter 60 Sekunden.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/analyse"
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/30 sm:w-auto"
              >
                Kostenlose Analyse starten
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/portal"
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-border px-8 text-base font-medium transition-colors hover:bg-secondary sm:w-auto"
              >
                Zum Portal
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
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
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Kostenloser Einstieg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border sm:px-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 py-8 text-center sm:px-6">
              <div className="text-2xl font-bold text-emerald-600 sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Alles was Sie brauchen
            </h2>
            <p className="mx-auto max-w-lg text-lg text-muted-foreground">
              Umfassende Analyse-Tools fuer fundierte Immobilienentscheidungen.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 transition-colors group-hover:bg-emerald-100">
                  <feature.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-secondary/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
              So funktioniert es
            </h2>
            <p className="mx-auto max-w-lg text-lg text-muted-foreground">
              In drei einfachen Schritten zur professionellen Bewertung.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+40px)] top-6 hidden h-px w-[calc(100%-80px)] bg-border md:block" />
                )}
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                  {step.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Sections */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Die Proplytics Plattform
            </h2>
            <p className="mx-auto max-w-lg text-lg text-muted-foreground">
              Mehr als nur Bewertung - eine komplette Plattform fuer Immobilienprofis.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platformSections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-emerald-200 hover:shadow-md"
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${section.color}`}>
                  <section.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 font-semibold">{section.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {section.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Entdecken <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / CTA */}
      <section className="border-t border-border bg-secondary/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <Shield className="mx-auto mb-6 h-12 w-12 text-emerald-500" />
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Vertrauen & Sicherheit
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Ihre Daten sind bei uns sicher. DSGVO-konform, nach deutschen Standards
            und mit hoechster Datenschutzsorgfalt.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/analyse"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Jetzt kostenlos starten
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-6 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Account erstellen
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link href="/" className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">proplytics.de</span>
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                KI-gestuetzte Immobilienbewertung fuer Profis und Privatpersonen.
              </p>
            </div>

            {/* Produkt */}
            <div>
              <h4 className="mb-3 text-sm font-semibold">Produkt</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href="/analyse" className="text-sm text-muted-foreground hover:text-foreground">Analyse</Link></li>
                <li><Link href="/portal" className="text-sm text-muted-foreground hover:text-foreground">Portal</Link></li>
                <li><Link href="/portal/marktplatz" className="text-sm text-muted-foreground hover:text-foreground">Marktplatz</Link></li>
                <li><Link href="/portal/academy" className="text-sm text-muted-foreground hover:text-foreground">Academy</Link></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="mb-3 text-sm font-semibold">Community</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link href="/community" className="text-sm text-muted-foreground hover:text-foreground">Community</Link></li>
              </ul>
            </div>

            {/* Rechtliches */}
            <div>
              <h4 className="mb-3 text-sm font-semibold">Rechtliches</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground">Impressum</Link></li>
                <li><Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground">Datenschutz</Link></li>
                <li><Link href="/agb" className="text-sm text-muted-foreground hover:text-foreground">AGB</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {"© " + new Date().getFullYear() + " proplytics.de - Alle Rechte vorbehalten."}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Made in Germany</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
