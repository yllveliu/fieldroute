# FieldRoute — Sprint 1 Demo Checklist

**KAN-24 | Assignee: Albi | Target: develop**

---

## 1. Sprint 1 Demo Goal

The Sprint 1 demo shows the first working foundation of FieldRoute. The goal is to prove that the full local stack is running end-to-end: the app starts with Docker, the database migrates and seeds correctly, core API endpoints respond, and the frontend renders all major pages.

What the demo covers:

- Local startup with Docker Compose
- Backend health check
- Database migration with Alembic
- Seed data loaded and visible
- Customer job/service request creation
- Dispatcher board (jobs overview)
- Technicians list
- Parts and inventory page
- AI suggestion panel (stub placeholder)
- Assignment modal (gate placeholder)

---

## 2. Pre-Demo Setup

Run the following commands before the demo to bring the stack up and seed the database.

**Start the database and API:**

```bash
docker compose up -d --build db api
```

**Run database migrations:**

```bash
docker compose exec api alembic upgrade head
```

**Start the frontend:**

```bash
docker compose up -d --build frontend
```

**Verify the stack is running:**

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8000/health |

Open both URLs in a browser and confirm they respond before starting the demo.

---

## 3. Demo Flow

Walk through the following steps in order. Check each one off as you go.

- [ ] Open the app at `http://localhost:5173` and show the homepage
- [ ] Navigate to the customer request form
- [ ] Submit a customer service request (or walk through the form fields if live submission is skipped)
- [ ] Show the customer tracking page and explain how a customer would track their job
- [ ] Navigate to the Dispatcher Board and show the list of jobs
- [ ] Navigate to the Technicians page and show the technicians list
- [ ] Navigate to the Inventory page and show the parts list
- [ ] Show the AI suggestion panel placeholder and explain it will call Claude in Sprint 2
- [ ] Show the assignment modal placeholder and explain the assignment flow
- [ ] Explain the 409 conflict response format: when two dispatchers attempt to assign the same technician simultaneously, the API will return a `409 Conflict` — the full locking logic for this will be completed in Sprint 2

---

## 4. What Works in Sprint 1

- Project runs locally with Docker Compose (db + api + frontend)
- Backend (FastAPI) and frontend (React/Vite) skeletons are fully set up
- PostgreSQL is connected and accessible from the API
- Alembic migrations can run cleanly from scratch
- Seed data exists and populates the database on migration
- Customer request API (`/jobs` or equivalent) accepts and stores requests
- Dispatcher board API returns job listings
- Technicians API returns the technician list
- Parts/inventory API returns parts data
- All major frontend pages and placeholders are rendering

---

## 5. Known Limitations

Be upfront with stakeholders about what is not production-ready yet:

- **Assignment gate:** The full locking/conflict logic for simultaneous assignments is not fully implemented in Sprint 1 — the 409 format is defined but the concurrency guard is a Sprint 2 item
- **AI integration:** The AI suggestion panel is a stub — it is not yet connected to Claude or any live model; real integration is planned for Sprint 2
- **Authentication:** Auth is either minimal or not included yet — not production-ready and will be addressed in a later sprint
- **UI polish:** The frontend is Sprint 1 level — functional but not final; styling and UX improvements will come in later sprints

---

## 6. Presenter Notes

- **Keep it short.** Aim for 10–15 minutes. Walk the flow, do not dive into code unless asked.
- **Show the working path first.** Start from local startup → health check → seed data → customer request → dispatcher board. This proves the stack works end-to-end.
- **Be honest about risks.** Call out the known limitations above proactively — it builds trust and sets accurate expectations for Sprint 2.
- **Frame Sprint 2 clearly.** Explain that Sprint 2 will focus on deeper backend integration, the real assignment transaction logic (optimistic locking / 409 handling), and wiring up the AI panel to Claude.
- **Have the stack running before the meeting starts.** Do not run `docker compose up` live during the demo — set it up in advance and verify it.
