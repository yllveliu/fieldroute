# FieldRoute

FieldRoute is a field-service dispatch web app for scheduling jobs, tracking technicians, and managing parts inventory.

## Tech stack

- Backend: FastAPI with SQLAlchemy and Alembic
- Frontend: React + TypeScript with Vite
- Database: PostgreSQL
- Local environment: Docker Compose

## Prerequisites

- Git
- Docker Desktop with Docker Compose
- Node.js and Python only if running outside Docker

## Clone repository

```bash
git clone <repository-url>
cd fieldroute
```

## Environment setup

Copy the example environment file and customize as needed:

```bash
cp .env.example .env
```

Required variables:

- `POSTGRES_USER`: database user name
- `POSTGRES_PASSWORD`: database password
- `POSTGRES_DB`: database name
- `DATABASE_URL`: SQLAlchemy connection string, usually `postgresql+psycopg://<user>:<password>@db:5432/<db>`

Optional runtime variable:

- `ANTHROPIC_API_KEY`: AI service key for the backend if AI features are used

## Docker startup

Start the database and API first:

```bash
docker compose up -d --build db api
```

Run migrations:

```bash
docker compose exec api alembic upgrade head
```

Then start the frontend:

```bash
docker compose up -d --build frontend
```

## Useful URLs

- Frontend: http://localhost:5173
- Backend health: http://localhost:8000/health
- API docs: http://localhost:8000/docs

## Database and migrations

The backend schema is managed with Alembic. After the `api` and `db` services are running, use:

```bash
docker compose exec api alembic upgrade head
```

This applies all available migrations to the PostgreSQL database.

## Seed data

Seed data is available in `backend/app/db/seed.py`. Run it after migrations with:

```bash
docker compose exec api python app/db/seed.py
```

This will populate sample services, technicians, customers, parts, and jobs.

## Git workflow

- Branch from `develop` for each task
- Create a task branch like `docs/kan-23-readme-setup`
- Open a PR into `develop`
- Do not push directly to `main` or `develop`

## Troubleshooting

- Docker not running: make sure Docker Desktop is started before running Compose commands
- Ports in use: `8000`, `5173`, or `5432` must be free for the app and database
- DB connection issues: verify `.env` values and that the `db` service is running
- Migration command fails: ensure `docker compose up -d --build db api` has been started and the `api` service is available
"# FieldRoute" 
