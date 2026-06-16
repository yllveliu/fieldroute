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
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
