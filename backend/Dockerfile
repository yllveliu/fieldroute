# ── Stage 1: dependency installer ──────────────────────────────────────────
FROM python:3.11-slim AS builder
WORKDIR /app

# Install system build tools needed by some Python packages (e.g. psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

# ── Stage 2: lean runtime image ────────────────────────────────────────────
FROM python:3.11-slim AS runtime
WORKDIR /app

# Runtime system dep for psycopg (PostgreSQL client library)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
 && rm -rf /var/lib/apt/lists/*

# Create the non-root user (with a home dir) before copying deps so the
# pip --user packages land somewhere this user can actually read & execute.
RUN useradd --system --create-home appuser

# Copy only the installed packages from the builder — no gcc or build tools.
# They go into appuser's home (not /root, which is mode 700 and unreadable by
# appuser) so the console scripts in .local/bin are runnable at runtime.
# --chown sets ownership in the COPY layer itself; a separate `chown -R` would
# duplicate the whole ~120 MB tree into a second layer and bloat the image.
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy application code and config (owned by appuser via --chown)
COPY --chown=appuser:appuser ./app       ./app
COPY --chown=appuser:appuser alembic.ini ./alembic.ini
COPY --chown=appuser:appuser ./alembic   ./alembic
COPY --chown=appuser:appuser start.sh    ./start.sh
RUN chmod +x start.sh

# Run as non-root user for production security
USER appuser

EXPOSE 8000
CMD ["./start.sh"]
