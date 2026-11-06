# Recipe Website

A recipe website running locally, consisting of three decoupled applications and one PostgreSQL server:
- **Frontend (`frontend/`):** React 19 + Vite + TypeScript + Tailwind v4 + React Router + TanStack Query.
- **Backend (`backend/`):** NestJS 12 (ESM) + Prisma 7 (with `@prisma/adapter-pg`) + Vitest + Oxlint.
- **CMS (`cms/`):** Strapi 5 (TypeScript) for managing editorial content (recipes, categories, tags, ingredients, media).
- **Database:** PostgreSQL 18 container managed via Docker Compose (`app`, `cms`, and `app_test` databases).

---

## Architecture

```
Browser: React (Vite) :5173
      │  JSON over HTTP + httpOnly auth cookie
      ▼
NestJS API :3000  ─────── HTTP + read-only API token ───────►  Strapi CMS :1337  ◄── editors (/admin)
      │ Prisma                                                      │
      ▼                                                             ▼
PostgreSQL database "app"                                  PostgreSQL database "cms"
      └─────────────── one Postgres container :5432 ───────────────┘
```

---

## Prerequisites

- **Node.js:** Node 26 (LTS). Run `nvm use` to select Node 26 specified in `.nvmrc`.
- **npm:** Bundled with Node 26.
- **Docker & Docker Compose:** With Compose v2.

---

## One-Command Automated Startup

To start the whole stack step-by-step automatically (PostgreSQL Database → Strapi CMS → NestJS API → React Frontend):

```bash
./start.sh
```
*(or `npm start` / `npm run dev`)*

The script automatically:
1. Ensures all `.env` files are present.
2. Starts the PostgreSQL 18 container and waits until it accepts connections on port 5432.
3. Launches the Strapi CMS dev server in background and waits until it is responsive on port 1337.
4. Boots the NestJS API backend and waits until health check succeeds on port 3000.
5. Launches the React Frontend with hot reloading on port 5173.
6. Handles `Ctrl+C` to cleanly terminate all running server processes.

---

## Manual Step-by-Step Setup

### 1. Database
```bash
cp .env.example .env
docker compose up -d
```
This spins up PostgreSQL 18 and automatically initializes the `cms` and `app_test` databases via `scripts/init-db.sh`.

### 2. CMS (Strapi)
```bash
cd cms
cp .env.example .env     # Ensure database credentials match root .env
npm install
npm run develop          # Open http://localhost:1337/admin to create the initial admin
```
In Strapi Admin (`http://localhost:1337/admin`):
1. Go to **Settings → API Tokens**.
2. Click **Create new API Token**:
   - Name: `backend`
   - Token type: `Read-only`
   - Token duration: `Unlimited`
3. Copy the generated token and save it into `backend/.env` as `STRAPI_API_TOKEN`.

### 3. Backend (NestJS)
```bash
cd ../backend
cp .env.example .env     # Configure JWT_SECRET, STRAPI_API_TOKEN, etc.
npm install
npx prisma migrate dev   # Runs migrations on database 'app' and generates the Prisma client
npm run start:dev        # Starts backend on http://localhost:3000/api
```
- Swagger documentation is available at `http://localhost:3000/docs`.
- Health check: `http://localhost:3000/api/health`.

### 4. Frontend (React)
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev              # Starts frontend on http://localhost:5173
```

---

## Ports Summary

| Service | Port | URL |
|---|---|---|
| PostgreSQL | 5432 | `localhost:5432` |
| Strapi CMS | 1337 | `http://localhost:1337` (Admin: `/admin`) |
| NestJS API | 3000 | `http://localhost:3000/api` (Docs: `/docs`) |
| React Frontend | 5173 | `http://localhost:5173` |

---

## Daily Workflow

```bash
docker compose up -d            # Start database
cd cms && npm run develop       # Terminal 1: Strapi CMS
cd backend && npm run start:dev # Terminal 2: NestJS Backend
cd frontend && npm run dev      # Terminal 3: React Frontend
```

---

## Testing & Quality Assurance

- **Backend:**
  - `npm run test` (Vitest unit tests)
  - `npm run test:e2e` (Vitest + Supertest e2e tests)
  - `npm run lint` (oxlint)
  - `npm run format:check` (Prettier)
- **Frontend:**
  - `npm run test` (Vitest + Testing Library)
  - `npm run test:e2e` (Playwright)
  - `npm run lint` (oxlint)
  - `npm run format:check` (Prettier)
