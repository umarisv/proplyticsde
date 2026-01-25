# Property Statistics API — Proplytics Integration

This folder provides regional property price statistics using official open data sources.

## Data Sources

- **Destatis** (Statistisches Bundesamt) — Official house price indices
- **Regional market reports** — Price data by city and region
- **OpenPLZ API** — PLZ to region mapping

## Quick Start (Recommended)

```bash
cd tools/cyberscraper2077

# Build lightweight stats API
docker build -f Dockerfile.stats -t property-stats-api .

# Run container
docker run -d \
  -p 8502:8502 \
  --name property-stats-api \
  --restart unless-stopped \
  property-stats-api
```

**No API keys required!** The stats are built into the service.

## API Endpoints

- `GET /health` — Health check
- `GET /stats?address=Düsseldorf&size=80&rooms=3` — Get regional statistics
- `GET /comps?address=...` — Legacy endpoint (same data)

**Example:**
```bash
curl "http://localhost:8502/stats?address=Berlin&size=75"
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "region": "Berlin",
    "bundesland": "Berlin",
    "avg_price_sqm": 4850,
    "price_range_min": 3638,
    "price_range_max": 6548,
    "trend_percent": 2.1,
    "trend_direction": "steigend",
    "estimated_price": 363750,
    "national_comparison": "+56.5% über Bundesschnitt"
  },
  "comparable_regions": [...]
}
```

## Dashboard Integration

The dashboard works **without any configuration** — it uses built-in static data as fallback.

Optionally, set in `dashboard/.env` to use the API:
```env
COMP_SCRAPER_BASE_URL=http://localhost:8502
```

## Covered Cities

Major cities with specific data:
- Berlin, Hamburg, München, Köln, Frankfurt
- Düsseldorf, Stuttgart, Leipzig, Dortmund, Essen
- Bremen, Dresden, Hannover, Nürnberg, Bonn
- And 10+ more...

All other locations fall back to Bundesland or national averages.

## Data Updates

The price data is based on Q4 2025 market reports. To update:
1. Edit `api_server.py` → `REGIONAL_PRICES` dict
2. Rebuild the Docker image
