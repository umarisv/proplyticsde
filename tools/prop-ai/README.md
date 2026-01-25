# PropAI - Immobilienanalyse Pipeline

Lokales Scraping- & Feature-Pipeline-Projekt fuer Immobilienanalyse.

**Fokus:** Makler-Websites + OpenStreetMap (Overpass API) + Open Data (Destatis, BORIS NRW, etc.)

**WICHTIG:** Dieses Projekt scrapt **keine grossen Portale** wie ImmoScout24, Immowelt, etc. Der Fokus liegt auf kleineren Makler-Websites und oeffentlichen Datenquellen.

## Features

- **Broker Scraper**: Crawlt Makler-Websites und extrahiert Immobilienangebote (Preis, Flaeche, Baujahr, Ausstattung)
- **Adress-Normalisierung**: Vereinheitlicht Adressen fuer Entity Resolution
- **Snapshot-System**: Speichert historische Daten (niemals ueberschreiben!)
- **Overpass Integration**: Holt POIs, OEPNV-Anbindung, Laerm-Proxy aus OpenStreetMap
- **Open Data Adapter**: Modulare Struktur fuer BORIS NRW, Destatis, etc. (teilweise noch Placeholder)
- **FastAPI**: Optionale REST-API fuer Abfragen

## Projektstruktur

```
prop-ai/
├── app/
│   ├── core/           # Config, Logging, Database
│   ├── models/         # Pydantic Schemas
│   ├── pipelines/      # Scraping & Feature Pipelines
│   ├── utils/          # Text-Extraktion, Rate Limiting
│   ├── api.py          # FastAPI Endpoints
│   └── main.py         # CLI Entry Point
├── migrations/         # Alembic Migrations
├── seeds/              # Seed-Dateien (Broker URLs)
├── requirements.txt
└── README.md
```

## Setup

### 1. Python Environment

```bash
cd prop-ai
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Playwright Browser installieren

```bash
playwright install chromium
```

### 3. Datenbank einrichten (Supabase oder lokal)

```bash
# Option A: Supabase (empfohlen für Proplytics Integration)
# Setze DATABASE_URL in .env auf deine Supabase Postgres URL.

# Option B: Lokale PostgreSQL (für Standalone)
docker run -d \
  --name propai-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=prop_ai \
  -p 5432:5432 \
  postgres:15

# Optional: Manuell eine Datenbank erstellen:
# CREATE DATABASE prop_ai;
```

### 4. Environment konfigurieren

```bash
cp .env.example .env
# Anpassen falls noetig (DATABASE_URL, SUPABASE_URL, SUPABASE_KEY, TABLE_PREFIX)
```

### 5. Datenbank initialisieren

```bash
python -m app.main init_db
```

## Verwendung

### CLI Befehle

```bash
# Datenbank-Tabellen erstellen
python -m app.main init_db

# Broker-Websites scrapen
python -m app.main scrape_brokers --seed_urls seeds/brokers.txt --max_pages 50

# Snapshots mit Overpass Features anreichern
python -m app.main enrich_features --limit 50

# Open Data Quellen pruefen
python -m app.main check_sources

# API Server starten
python -m app.main run_api
```

### Seed-Datei bearbeiten

Fuege Makler-URLs in `seeds/brokers.txt` hinzu:

```
# Beispiel
https://www.mein-makler.de/immobilien/
https://www.anderer-makler.de/angebote/
```

**Regeln:**
- Eine URL pro Zeile
- Zeilen mit `#` sind Kommentare
- Nur Makler-Websites, keine grossen Portale
- Der Scraper respektiert `robots.txt`

## Datenmodell

### Tabellen

- **propai_property**: Kerndaten zur Immobilie (Adresse, Koordinaten)
- **propai_source_event**: Logging aller Datenquellen-Ereignisse
- **propai_property_snapshot**: Zeitpunktbezogene Daten (Preis, Flaeche, Ausstattung)
- **propai_snapshot_features**: Angereicherte Features (POIs, Transit Score, Laerm)
- **propai_model_output**: ML-Vorhersagen (Marktwert, Risiko)

### Datenfluss

```
Broker Website -> Scrape -> ScrapedListing
                              |
                              v
                         Normalize Address
                              |
                              v
                     Entity Resolution (property_id)
                              |
                              v
                       Create Snapshot
                              |
                              v
                    Enrich with Overpass Features
                              |
                              v
                      Model Prediction (TODO)
```

## API Endpoints

Nach Start mit `python -m app.main run_api`:

- `GET /health` - Health Check
- `GET /properties` - Properties auflisten (Filter: city, postal_code)
- `GET /properties/{id}` - Einzelne Property
- `GET /properties/{id}/snapshots` - Snapshots einer Property
- `GET /snapshots/{id}` - Einzelner Snapshot
- `GET /snapshots/{id}/features` - Features eines Snapshots
- `GET /stats` - Gesamtstatistiken

Swagger UI: http://localhost:8503/docs

## Rate Limiting

Der Scraper implementiert:
- Per-Domain Delay (default: 1 Sekunde)
- Max Requests/Minute pro Domain (default: 30)
- robots.txt Respektierung
- Crawl-Delay aus robots.txt wird beruecksichtigt

## Text-Extraktion

Robuste Parser fuer:
- **Preise**: `1.234.567 €`, `1,234,567 EUR`, `Kaufpreis: 450.000€`
- **Flaeche**: `80 m²`, `ca. 75 qm`, `Wohnflaeche: 120m²`
- **Zimmer**: `3,5 Zimmer`, `4 Zi.`, `3-Zimmer-Wohnung`
- **Baujahr**: `Baujahr 1985`, `Bj. 2010`, `erbaut 1995`
- **Ausstattung**: Balkon, Terrasse, Aufzug, Garage (Keyword-Matching)

## Open Data Integration

Aktuell als Placeholder implementiert (TODO):

| Quelle | Status | Daten |
|--------|--------|-------|
| BORIS NRW | Placeholder | Bodenrichtwerte |
| Open.NRW | Placeholder | Diverse Datensaetze |
| OpenData Koeln | Placeholder | Stadtstatistiken |
| Destatis GENESIS | Placeholder | Preisindizes |

## Entwicklung

```bash
# Tests ausfuehren
pytest

# Neue Migration erstellen
alembic revision --autogenerate -m "beschreibung"

# Migrationen anwenden
alembic upgrade head
```

## Wichtige Hinweise

1. **Keine grossen Portale**: ImmoScout24, Immowelt, etc. blockieren Scraper
2. **Respektiere robots.txt**: Der Scraper prueft automatisch
3. **Rate Limits einhalten**: Default 1 req/sec pro Domain
4. **Historische Daten**: Snapshots werden nie ueberschrieben
5. **Confidence Score**: 0-100 basierend auf verfuegbaren Feldern

## Lizenz

Privates Projekt - Nur fuer interne Nutzung.
