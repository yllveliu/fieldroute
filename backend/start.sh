#!/bin/sh
# Wait for the database to accept connections, then migrate and seed.
echo "Waiting for database..."
until alembic upgrade head; do
  echo "Migration failed — database not ready yet. Retrying in 2s..."
  sleep 2
done

echo "Running seed script..."
python -m app.db.seed

echo "Starting server..."
# Hosts like Render/Railway inject the port to listen on via $PORT; fall back to
# 8000 for local Docker Compose where the port is fixed.
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
