FROM python:3.12-slim

WORKDIR /app

# Install system deps for Scrapling (Playwright browsers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget gnupg curl && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers for StealthyFetcher
RUN python -m playwright install chromium --with-deps 2>/dev/null || true

COPY . .

EXPOSE 4001

CMD ["gunicorn", "app:app", "-b", "0.0.0.0:4001", "-w", "2", "--timeout", "120"]
