# Daily Article Generation System

Dieses System generiert automatisch täglich 3 neue Blog-Artikel zu aktuellen Immobilienthemen.

## 🚀 Funktionsweise

### Tägliche Rotation
Das System rotiert täglich durch verschiedene Themenbereiche:

- **Tage ÷ 3 = 1**: Zinsentwicklung & Finanzierung
- **Tage ÷ 3 = 2**: Preisentwicklung & Marktanalyse
- **Tage ÷ 3 = 0/3**: Wohnungspolitik & Gesetze

### KI-Optimierung
Alle Artikel sind speziell für KI-Suchmaschinen optimiert:
- Strukturierte Daten & Tabellen
- Klare Definitionen & Formeln
- FAQ-Sektionen
- Quantitative Analysen
- Schema.org konforme Struktur

## 📋 Voraussetzungen

- Node.js 20+
- pnpm
- Git
- Internetzugang für API-Calls

## 🛠️ Verwendung

### Manuell ausführen
```bash
# Einzelne Artikel generieren
node scripts/generate-daily-articles.js

# Alle drei Artikeltypen generieren (POST request)
curl -X POST https://proplytics.de/api/generate-articles
```

### Automatische Ausführung
Das System läuft automatisch über GitHub Actions:
- **Täglich um 10:00 Uhr CEST**
- Automatisches Commit der neuen Artikel
- Logging in `logs/article-generation.log`

## 📊 Datenquellen

### Markt-Daten (wöchentlich aktualisieren)
```javascript
const CURRENT_MARKET_DATA = {
  interestRate: 3.85,        // Aktuelle Zinsen
  inflationRate: 2.5,        // Inflation Deutschland
  unemploymentRate: 5.9,     // Arbeitslosenquote
  averagePricePerSqm: {      // Durchschnittspreise
    munich: 12450,
    berlin: 7350,
    // ...
  }
}
```

### Quellen
- Bulwiengesa Marktbericht
- Statistisches Bundesamt
- Interhyp Zinsdaten
- IVD Immobilienverband
- empirische Marktdaten

## 📈 Artikel-Kategorien

### 1. Zinsentwicklung (Finanzierung)
- Aktuelle Zinsübersicht
- EZB-Politik & Prognosen
- Finanzierungsbeispiele
- Strategien für Käufer

### 2. Preisentwicklung (Marktanalyse)
- Städtevergleiche & Trends
- Faktoren der Preissteigerung
- Investmentstrategien
- Prognosen 2025

### 3. Wohnungspolitik (Politik)
- Neue Gesetze & Reformen
- Förderprogramme
- Auswirkungen auf Investoren
- Digitale Transformation

## 🔧 Konfiguration

### Umgebungsvariablen
```bash
API_BASE_URL=https://proplytics.de    # Basis-URL der Anwendung
```

### Anpassung der Daten
Bearbeiten Sie `CURRENT_MARKET_DATA` in der Skript-Datei für aktuelle Werte.

## 📝 Logging

### Log-Datei: `logs/article-generation.log`
```json
{
  "timestamp": "2024-01-15T08:00:00.000Z",
  "articles_generated": 1,
  "titles": ["Zinsentwicklung 2024: Wohin steuern die Immobilienzinsen?"],
  "status": "success"
}
```

### Fehlerbehandlung
- Automatische Fehlerlogs
- Graceful failure handling
- Retry-Mechanismen
- Benachrichtigungen bei Fehlern

## 📊 Monitoring

### GitHub Actions Dashboard
- Tägliche Ausführungsberichte
- Erfolgs-/Fehlerraten
- Performance-Metriken

### Manueller Check
```bash
# Letzte Generation prüfen
tail -5 logs/article-generation.log

# Anzahl generierter Artikel
grep -c "articles_generated" logs/article-generation.log
```

## 🔄 Workflow

1. **8:00 UTC (10:00 CEST)**: GitHub Actions startet
2. **Server starten**: Next.js Anwendung wird gestartet
3. **API-Call**: Artikel-Generierung über `/api/generate-articles`
4. **Speicherung**: Artikel werden in localStorage gespeichert
5. **Commit**: Automatisches Commit der Änderungen
6. **Benachrichtigung**: Erfolgs-/Fehlermeldung

## 🚨 Fehlerbehebung

### Häufige Probleme

#### API nicht erreichbar
```bash
# Server manuell starten
pnpm dev

# API direkt testen
curl http://localhost:3000/api/generate-articles
```

#### Git-Commit fehlgeschlagen
```bash
# Manuelles Commit
git add .
git commit -m "🤖 Daily articles: $(date +'%Y-%m-%d')"
git push
```

#### Daten veraltet
```javascript
// CURRENT_MARKET_DATA in generate-daily-articles.js aktualisieren
const CURRENT_MARKET_DATA = {
  interestRate: 3.75, // Neue Zinsen
  // ...
}
```

## 📈 Erweiterungen

### Geplante Features
- **RSS-Feed Integration**: Automatische News-Artikel
- **Social Media Posting**: Automatische Veröffentlichung
- **A/B Testing**: Verschiedene Artikel-Varianten
- **Performance Tracking**: Leser-Engagement messen

### Skalierung
- Mehr Artikeltypen
- Personalisierte Inhalte
- Multi-Sprachen-Support
- Integration mit CMS-Systemen

## 📞 Support

Bei Problemen:
1. Logs prüfen: `logs/article-generation.log`
2. GitHub Actions History ansehen
3. Manuellen Test durchführen
4. Issues im Repository erstellen

---

**Automatisches Content-System für kontinuierliche SEO-Optimierung** 🤖📝