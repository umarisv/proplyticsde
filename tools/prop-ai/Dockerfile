FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Store Playwright browsers in a shared path for the runtime user
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browser for scraping
RUN mkdir -p /ms-playwright
RUN playwright install chromium --with-deps

# Copy application
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app /ms-playwright
USER appuser

# Expose API port
EXPOSE 8503

# Default command
CMD ["python", "-m", "app.main", "run_api"]
