# ============================================================
# Mini CRM de Clientes
# Dockerfile — multi-stage friendly single-stage build
# Base image: python:3.12-slim for a small footprint
# ============================================================

FROM python:3.12-slim

# ── Environment hygiene ──────────────────────────────────────
# Prevents Python from writing .pyc files and enables
# unbuffered stdout/stderr so logs appear in real time.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# ── Working directory ────────────────────────────────────────
WORKDIR /app

# ── Install Python dependencies ──────────────────────────────
# Copy requirements first to leverage Docker layer cache;
# the pip install layer is only rebuilt when requirements.txt changes.
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ── Copy project source ──────────────────────────────────────
COPY . .

# ── Ensure data directory exists for SQLite ──────────────────
RUN mkdir -p /app/data

# ── Collect static files into staticfiles/ ──────────────────
# Django's collectstatic gathers all static assets so they can
# be served efficiently in a production-like environment.
RUN SECRET_KEY=build-only python manage.py collectstatic --noinput

# ── Expose port ──────────────────────────────────────────────
EXPOSE 8000

# ── Default command ──────────────────────────────────────────
# Runs Django's built-in development server bound to all
# interfaces so it is reachable from the host machine.
# For production, replace with gunicorn or uvicorn.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
