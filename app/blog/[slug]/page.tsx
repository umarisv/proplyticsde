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
  "ki-immobilienbewertung-zukunft":   {
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
  },
  "immobilien-kaufen-2024-guide": {
    title: "Immobilien kaufen 2024: Der ultimative Leitfaden für Erstkäufer",
    excerpt: "Alles was Sie über den Immobilienkauf 2024 wissen müssen. Von Finanzierung bis Notar - Ihr kompletter Ratgeber.",
    content: `
# Immobilien kaufen 2024: Der ultimative Leitfaden für Erstkäufer

Der Traum von den eigenen vier Wänden ist für viele Deutsche greifbar nah. Doch der Immobilienkauf ist komplex. Dieser Leitfaden zeigt Ihnen Schritt für Schritt, wie Sie erfolgreich Ihre erste Immobilie kaufen.

## Schritt 1: Finanzielle Situation prüfen

**Eigenkapital:** Mindestens 20-30% des Kaufpreises sollten Sie selbst aufbringen können.

**Monatliche Belastung:** Die monatliche Rate sollte nicht mehr als 35% Ihres Nettoeinkommens betragen.

**Bonität:** Eine gute SCHUFA-Auskunft ist entscheidend für günstige Zinsen.

## Schritt 2: Die richtige Immobilie finden

**Standortwahl:** Berücksichtigen Sie Arbeitsweg, Schulen und Infrastruktur.

**Zustand prüfen:** Lassen Sie die Immobilie von einem unabhängigen Gutachter bewerten.

**Preisverhandlung:** Mit einer professionellen Bewertung können Sie besser verhandeln.

## Schritt 3: Finanzierung sichern

**Angebote vergleichen:** Holen Sie mehrere Kreditangebote ein.

**Nebenkosten berücksichtigen:** Notar, Grunderwerbsteuer, Maklerprovision.

**Förderungen nutzen:** KfW-Kredite können Zinsen sparen.

## Schritt 4: Kaufvertrag und Notar

**Vertragsprüfung:** Lassen Sie den Vertrag von einem Anwalt prüfen.

**Eigentümerwechsel:** Grundbuchamt und Notar regeln den Eigentümerwechsel.

**Übergabe:** Wohnungsübergabe mit detailliertem Protokoll.

## Häufige Fehler vermeiden

- **Übereilte Entscheidungen:** Nehmen Sie sich Zeit für die Entscheidung
- **Unrealistische Preisvorstellungen:** Lassen Sie eine neutrale Bewertung erstellen
- **Fehlende Rücklagen:** Planen Sie unerwartete Kosten ein

## Fazit

Mit der richtigen Vorbereitung und professioneller Beratung steht Ihrem Immobilienkauf nichts im Wege. Nutzen Sie moderne Tools für eine fundierte Entscheidung.
    `,
    author: "Michael Bauer",
    date: "2024-01-10",
    readTime: "12 min",
    category: "Ratgeber",
    tags: ["Erstkäufer", "Immobilienkauf", "Finanzierung", "Ratgeber", "2024"],
    relatedPosts: ["immobilienbewertung-kosten-vermeiden", "energetische-sanierung-foerderung"]
  },
  "rental-yields-deutschland-vergleich": {
    title: "Mietrenditen in Deutschland: Städtevergleich 2024",
    excerpt: "Welche Städte bieten die besten Mietrenditen für Immobilieninvestoren? Datenbasierte Analyse der Top-Standorte.",
    content: `
# Mietrenditen in Deutschland: Städtevergleich 2024

Die Wahl des richtigen Standorts entscheidet über den Erfolg Ihrer Immobilieninvestition. Dieser Vergleich zeigt Ihnen die besten Städte für Mietrenditen in Deutschland.

## Methodik der Analyse

**Bruttomietrendite:** Jährliche Mieteinnahmen ÷ Kaufpreis × 100

**Nettorendite:** Berücksichtigt alle Kosten (Bewirtschaftung, Steuern, Abschreibungen)

**Standortfaktoren:** Bevölkerungswachstum, Arbeitslosenquote, Infrastruktur

## Top 10 Städte nach Mietrendite

### 1. Leipzig (5.2% Bruttorendite)
- Durchschnittspreis: 3.200 €/m²
- Durchschnittsmiete: 9,50 €/m²
- Bevölkerungswachstum: +15% seit 2010
- Vorteile: Geringe Kaufpreise, hohe Nachfrage

### 2. Dresden (4.8% Bruttorendite)
- Durchschnittspreis: 3.100 €/m²
- Durchschnittsmiete: 8,80 €/m²
- Universitätsstadt mit jungen Mietern
- Vorteile: Stabile Nachfrage, gute Infrastruktur

### 3. Dortmund (4.6% Bruttorendite)
- Durchschnittspreis: 2.800 €/m²
- Durchschnittsmiete: 7,80 €/m²
- Wirtschaftswachstum durch Digitalisierung
- Vorteile: Günstige Einstiegspreise

### 4. Essen (4.4% Bruttorendite)
- Durchschnittspreis: 2.600 €/m²
- Durchschnittsmiete: 7,20 €/m²
- Stabile Nachfrage durch Industrie
- Vorteile: Konstante Mieteinnahmen

### 5. Hannover (4.2% Bruttorendite)
- Durchschnittspreis: 3.800 €/m²
- Durchschnittsmiete: 9,00 €/m²
- Messeeffekt steigert Nachfrage
- Vorteile: Saisonale Zusatzrendite

## Faktoren für hohe Renditen

**Demografische Entwicklung:**
- Junge Bevölkerung = Höhere Nachfrage nach Mietwohnungen
- Zuzug aus anderen Regionen

**Wirtschaftliche Stärke:**
- Niedrige Arbeitslosigkeit = Zahlungsfähige Mieter
- Branchenvielfalt = Stabile Wirtschaft

**Infrastruktur:**
- Gute Anbindung = Höhere Mietbereitschaft
- Bildungseinrichtungen = Familien mit Kindern

## Risiken beachten

**Marktrisiken:**
- Überhitzte Märkte können zu Preisblasen führen
- Regulatorische Änderungen (Mietendeckel)

**Standortrisiken:**
- Abhängigkeit von einzelnen Branchen
- Demografische Verschiebungen

## Fazit

Leipzig und Dresden bieten aktuell die attraktivsten Mietrenditen. Bei der Investitionsentscheidung sollten Sie jedoch immer eine professionelle Marktanalyse durchführen.
    `,
    author: "Dr. Anna Weber",
    date: "2024-01-12",
    readTime: "10 min",
    category: "Investitionen",
    tags: ["Mietrendite", "Investitionen", "Städtevergleich", "Rendite", "Deutschland"],
    relatedPosts: ["immobilienmarkt-2024-trends", "wohntrends-2024-staedte"]
  },
  "energetische-sanierung-foerderung": {
    title: "Energetische Sanierung: Alle Förderungen 2024 im Überblick",
    excerpt: "Maximale Förderungen für Ihre energetische Sanierung sichern. Alle Programme und Anträge erklärt.",
    content: `
# Energetische Sanierung: Alle Förderungen 2024 im Überblick

Energetische Sanierungen sind teuer, aber die Förderungen machen sie erschwinglich. Hier erfahren Sie alles über die aktuellen Förderprogramme 2024.

## KfW-Förderprogramme

### 1. KfW 261 - Energieeffizient Bauen & Sanieren
- **Zinsgünstige Kredite** bis 150.000 €
- **Tilgungszuschuss** bis 37.500 €
- **Effizienzhaus-Standards** 40/55/70/85

### 2. KfW 262 - Energieeffizient Bauen & Sanieren
- **Zinsgünstige Kredite** bis 150.000 €
- **Tilgungszuschuss** bis 37.500 €
- **Einzelmaßnahmen** (Dämmung, Heizung, etc.)

### 3. KfW 270 - Erneuerbare Energien
- **Solaranlagen** und **Wärmepumpen**
- **Kredite** bis 150.000 €
- **Tilgungszuschuss** bis 37.500 €

## Bundesförderung für effiziente Gebäude (BEG)

### BEG WG - Wohngebäude
- **Zuschuss** bis 37.500 € (30% der Kosten)
- **Kredit** bis 150.000 € (0,75% Zins)
- **Für alle Maßnahmen** der energetischen Sanierung

### BEG NWG - Nichtwohngebäude
- **Zuschuss** bis 37.500 € (25% der Kosten)
- **Kredit** bis 150.000 € (0,75% Zins)
- **Für Gewerbeimmobilien**

## Kommunale Förderungen

### Stadtwerke und Energieversorger
- **Lokale Zuschüsse** für Heizungstausch
- **Beratungsförderungen** kostenfrei
- **Sonderaktionen** für bestimmte Maßnahmen

### Landesförderungen
- **Zusätzliche Boni** in einzelnen Bundesländern
- **Spezielle Programme** für Denkmalschutz
- **Regionale Besonderheiten**

## Antragsprozess

### 1. Energieberatung
- **Vor-Ort-Termin** mit zertifiziertem Berater
- **Sanierungsfahrplan** erstellen lassen
- **Förderfähigkeit** prüfen

### 2. Antrag stellen
- **Online über KfW-Portal**
- **Notwendige Unterlagen** vorbereiten
- **Fristen** beachten (vor Beginn der Maßnahmen)

### 3. Durchführung
- **Zugelassene Fachbetriebe** beauftragen
- **Rechnungskopie** für Nachweis aufbewahren
- **Nachweis** über erfolgte Maßnahmen

## Maximale Förderungen sichern

**Kombinationsmöglichkeiten:**
- KfW + BEG können kombiniert werden
- Kommunale Förderungen addieren sich
- Steuerliche Vorteile zusätzlich möglich

**Beispielrechnung:**
- Sanierungskosten: 100.000 €
- KfW-Zuschuss: 37.500 €
- BEG-Zuschuss: 30.000 €
- Gesamtförderung: 67.500 € (67,5%)

## Fazit

Mit der richtigen Kombination der Förderprogramme können Sie bis zu 70% der Sanierungskosten sparen. Lassen Sie sich professionell beraten!
    `,
    author: "Thomas Richter",
    date: "2024-01-15",
    readTime: "9 min",
    category: "Sanierung",
    tags: ["Sanierung", "Förderungen", "Energieeffizienz", "Kosten", "2024"],
    relatedPosts: ["immobilien-kaufen-2024-guide", "nachhaltige-immobilien-investitionen"]
  },
  "immobilienbewertung-kosten-vermeiden": {
    title: "Immobilienbewertung Kosten sparen: Diese Fehler vermeiden",
    excerpt: "Typische Fehler bei der Immobilienbewertung und wie Sie teure Korrekturen vermeiden können.",
    content: `
# Immobilienbewertung Kosten sparen: Diese Fehler vermeiden

Eine falsche Immobilienbewertung kann teuer werden. Erfahren Sie, welche Fehler Sie vermeiden sollten und wie Sie Kosten sparen.

## Fehler Nr. 1: Online-Schätzungen blind vertrauen

**Das Problem:**
- Ungenaue Algorithmen ohne lokale Marktdaten
- Fehlende Berücksichtigung von Objektzustand
- Unrealistische Preisvorstellungen

**Die Lösung:**
- Mehrere professionelle Bewertungen einholen
- Lokale Marktkenntnisse prüfen
- Vergleichbare Objekte selbst recherchieren

## Fehler Nr. 2: Wichtige Unterlagen fehlen

**Häufig fehlende Dokumente:**
- Aktuelle Grundbuchauszüge
- Baulastenverzeichnis
- Energieausweis
- Mietverträge und Nebenkostenabrechnungen

**Kostenfolge:**
- Nachbewertungen kosten zusätzlich 500-1.000 €
- Verzögerte Verkaufsprozesse
- Schlechtere Verhandlungsposition

## Fehler Nr. 3: Zeitdruck bei der Bewertung

**Warum es schief geht:**
- Makler müssen schnell verkaufen
- Wenig Zeit für gründliche Marktanalyse
- Druck von Verkäufern

**Professionelle Bewertung braucht:**
- Mindestens 2-3 Tage Recherche
- Persönliche Objektbesichtigung
- Ausführliches Gespräch mit Eigentümern

## Fehler Nr. 4: Falsche Vergleichsobjekte

**Häufige Irrtümer:**
- Zu alte Vergleichsdaten (>6 Monate)
- Falsche Lage (andere Stadtteile)
- Unterschiedliche Objektzustände
- Vergessene Größenunterschiede

**Korrekte Vorgehensweise:**
- Aktuelle Verkaufsdaten der letzten 3 Monate
- Identische Lage und Infrastruktur
- Vergleichbare Ausstattung und Zustand
- Quadratmeterpreise berechnen

## Fehler Nr. 5: Emotionale Preisvorstellungen

**Verkäufer überschätzen oft um:**
- 10-20% bei Eigentumswohnungen
- 15-30% bei Einfamilienhäusern
- 20-40% bei Luxusimmobilien

**Neutrale Bewertung:**
- Professionelle Marktanalyse
- Datenbasierte Preisermittlung
- Realistische Preisvorstellungen

## Kosten sparen durch richtige Vorbereitung

**Vor der Bewertung:**
- Alle Unterlagen komplett vorbereiten
- Mehrere Angebote einholen
- Zeitdruck vermeiden

**Bei der Bewertung:**
- Aktive Mitarbeit bei Besichtigung
- Offene Kommunikation mit Gutachter
- Nachfragen bei Unklarheiten

## Fazit

Eine gute Vorbereitung spart Ihnen Geld und Nerven. Investieren Sie in eine professionelle Bewertung und vermeiden Sie teure Nachkorrekturen.
    `,
    author: "Sarah Müller",
    date: "2024-01-18",
    readTime: "6 min",
    category: "Bewertung",
    tags: ["Bewertung", "Kosten", "Fehler", "Gutachten", "Tipps"],
    relatedPosts: ["immobilien-kaufen-2024-guide", "wohnung-verkaufen-tipps-2024"]
  },
  "wohnung-verkaufen-tipps-2024": {
    title: "Wohnung verkaufen 2024: Höchstpreis erzielen mit diesen Strategien",
    excerpt: "Professionelle Tipps für den optimalen Wohnungverkauf. Von Preisstrategie bis Vertragsabschluss.",
    content: `
# Wohnung verkaufen 2024: Höchstpreis erzielen mit diesen Strategien

Der Wohnungverkauf ist komplex, aber mit der richtigen Strategie erzielen Sie den bestmöglichen Preis. Hier sind die Profi-Tipps für 2024.

## Schritt 1: Professionelle Bewertung

**Warum eine Bewertung wichtig ist:**
- Realistische Preisvorstellung setzen
- Bessere Verhandlungsposition
- Vermeidung von Unterverkauf

**Kosten-Nutzen-Rechnung:**
- Bewertung kostet 300-600 €
- Falscher Preis kostet 10.000+ € Verlust
- ROI: 2.000% bei korrekter Preisstrategie

## Schritt 2: Immobilie verkaufsfertig machen

**Home Staging Tipps:**
- Professionelle Reinigung und Entrümpelung
- Neutrale Wandfarben und Möbel
- Gute Beleuchtung und Luftzirkulation
- Kleine Reparaturen durchführen

**Erste Eindruck optimieren:**
- Eingangsbereich aufräumen
- Beleuchtung überprüfen
- Angenehmen Geruch sicherstellen

## Schritt 3: Marketing-Strategie

**Professionelle Fotos:**
- Mindestens 20-30 hochwertige Fotos
- Drohnenaufnahmen für Außenbereich
- 360°-Touren für virtuelle Besichtigungen

**Online-Präsenz:**
- Alle relevanten Portale (ImmobilienScout24, Immowelt)
- Soziale Medien für zusätzliche Reichweite
- Eigene Website mit virtueller Tour

## Schritt 4: Preisstrategie

**Preisspanne setzen:**
- Untergrenze: Gewünschter Mindestpreis
- Obergrenze: Leicht über dem Marktwert
- Verhandlungspielraum einplanen

**Dynamische Preisstrategie:**
- Erste 4 Wochen: Voller Preis
- Nach 4 Wochen: 2-3% Preisreduktion
- Nach 8 Wochen: Ernsthaftes Nachverhandeln

## Schritt 5: Besichtigungen optimal führen

**Vorbereitung:**
- Alle Unterlagen bereit halten
- Hausordnung und Nachbarn informieren
- Professionelle Beschilderung

**Während der Besichtigung:**
- Vorteile der Immobilie hervorheben
- Nachteile offen ansprechen
- Fragen der Interessenten beantworten
- Zeit für individuelle Gespräche nehmen

## Schritt 6: Verhandlung führen

**Professionelle Unterstützung:**
- Makler mit Verhandlungsmandat
- Anwalt für rechtliche Absicherung
- Steuerberater für steuerliche Optimierung

**Verhandlungstipps:**
- Erstes Angebot nie sofort annehmen
- Gegenangebote mit Begründung ablehnen
- Zeit als Verbündeten nutzen
- Emotionen aus der Verhandlung heraushalten

## Schritt 7: Notartermin und Übergabe

**Notarvertrag prüfen:**
- Alle Angaben auf Richtigkeit prüfen
- Auflagen und Bedingungen verstehen
- Zahlungsmodalitäten klären

**Übergabe vorbereiten:**
- Wohnungsübergabeprotokoll erstellen
- Zählerstände dokumentieren
- Schlüssel und Unterlagen übergeben
- Nachsorge für Fragen anbieten

## Häufige Fehler vermeiden

**Preisfehler:**
- Zu hohe Preisvorstellung
- Keine Preisreduktion bei Stillstand
- Emotionale Preisentscheidungen

**Marketingfehler:**
- Schlechte Fotos und Beschreibungen
- Fehlende Online-Präsenz
- Mangelnde Erreichbarkeit

## Fazit

Ein erfolgreicher Wohnungverkauf braucht Planung und Professionalität. Mit der richtigen Strategie erzielen Sie den optimalen Preis und vermeiden Stress.
    `,
    author: "Markus Schneider",
    date: "2024-01-20",
    readTime: "11 min",
    category: "Verkauf",
    tags: ["Wohnung verkaufen", "Preisstrategie", "Verkaufstipps", "Marktanalyse", "2024"],
    relatedPosts: ["immobilienbewertung-kosten-vermeiden", "immobilienmarkt-2024-trends"]
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