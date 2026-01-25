# CyberScraper 2077 — Proplytics Integration

This folder contains a local clone of [CyberScraper 2077](https://github.com/itsOwen/CyberScraper-2077) for fetching comparable listings.

## Prerequisites

- Docker installed
- Gemini API key (`GOOGLE_API_KEY`)

## Option 1: API Server (Recommended for Production)

The API server provides a REST endpoint that the dashboard calls directly.

```bash
cd tools/cyberscraper2077

# Build API image
docker build -f Dockerfile.api -t cyberscraper-api .

# Run API server (replace YOUR_GEMINI_KEY)
docker run -d \
  -p 8502:8502 \
  -e GOOGLE_API_KEY="YOUR_GEMINI_KEY" \
  --name cyberscraper-api \
  cyberscraper-api
```

**API Endpoints:**

- `GET /health` — Health check
- `GET /comps?address=40239+Düsseldorf&rooms=3&size=80` — Fetch comparables
- `POST /comps` — Same as GET but with JSON body

**Example:**
```bash
curl "http://localhost:8502/comps?address=40239%20D%C3%BCsseldorf&rooms=3"
```

## Option 2: Streamlit UI (Development/Manual Use)

```bash
cd tools/cyberscraper2077

# Build image
docker build -t cyberscraper2077 .

# Run container (replace YOUR_GEMINI_KEY)
docker run -d \
  -p 8501:8501 \
  -e GOOGLE_API_KEY="YOUR_GEMINI_KEY" \
  --name cyberscraper \
  cyberscraper2077
```

Access UI at **http://localhost:8501**

## Environment Variables

| Variable         | Description                       |
|------------------|-----------------------------------|
| GOOGLE_API_KEY   | Gemini API key (required)         |
| SCRAPER_MODEL    | LLM model (default: gemini-2.0-flash) |
| PORT             | API server port (default: 8502)   |

## Dashboard Integration

Set these in `dashboard/.env`:

```env
COMP_SCRAPER_BASE_URL=http://localhost:8502
COMP_SCRAPER_TOKEN=optional-auth-token
```

Then the "Vergleich" tab will fetch real listings from ImmoScout.

## Notes

- Ensure whitelisted access before scraping any external site.
- This tool is for internal research/analysis only.
- First request may be slow (~10-20s) as the browser starts up.
