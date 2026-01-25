# CyberScraper 2077 — Proplytics Integration

This folder contains a local clone of [CyberScraper 2077](https://github.com/itsOwen/CyberScraper-2077) for fetching comparable listings.

## Prerequisites

- Docker installed
- Gemini API key (`GOOGLE_API_KEY`)

## Quick Start (Docker)

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

| Variable         | Description            |
|------------------|------------------------|
| GOOGLE_API_KEY   | Gemini API key         |
| OPENAI_API_KEY   | (optional) OpenAI key  |

## Usage

1. Open http://localhost:8501 in browser
2. Enter target URL (whitelisted source)
3. Query for listings (e.g., "extract all apartments with price, size, rooms")
4. Export results as JSON/CSV

## Notes

- Ensure whitelisted access before scraping any external site.
- This tool is for internal research/analysis only.
