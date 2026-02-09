# Proplytics PDF Worker - Fargate Container
# Uses full Chromium (not @sparticuz/chromium) since we have a full container

FROM node:22-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files and install
COPY package.json ./
RUN npm install --omit=dev

# Copy compiled code
COPY dist/ ./dist/

# Health check: process should be running
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD pgrep -x node || exit 1

# Run as non-root
RUN groupadd -r worker && useradd -r -g worker worker
USER worker

CMD ["node", "dist/index.js"]
