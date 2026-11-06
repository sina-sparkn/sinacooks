# AGENTS.md

Instructions for AI coding agents (and humans) building the **Recipe Website**.
Read this file fully before making changes. When this file conflicts with your assumptions, follow this file.

> Package versions in this file were verified against the npm registry and official release notes on **2026-11-05**. See §2 for versions, install commands, and the compatibility notes you must respect.

---

## 1. Project Overview

A recipe website running entirely on a local laptop, made of three apps and one database server:

- **Frontend (React):** the public site. Browse, search, and filter recipes; view a recipe with scalable ingredients; log in and save favorites.
- **Backend (NestJS):** the only API the frontend talks to. It serves recipe content from the CMS in a clean format, and owns application logic and data: users, authentication, favorites, and later ratings, shopping lists, and meal plans.
- **CMS (Strapi):** the editors' admin panel. It owns the content: recipes, categories, tags, ingredients, and images.
- **Database (PostgreSQL in Docker):** one Postgres container with separate databases for the CMS and the backend.

### Architecture

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

### Goals
1. A working, good-looking recipe site with a real CMS and a real backend.
2. Simple setup: one command for the database, one per app.
3. Clean, typed, tested code that is easy to extend.

### Non-goals (for now)
- Server-side rendering / SEO optimization (the frontend is a SPA).
- Production deployment, CI/CD, cloud storage.
- Ratings, comments, meal planner (see Roadmap, last phase).

---

## 2. Tech Stack and Package Versions

### 2.1 Stack (versions verified 2026-11-05)

**Runtime and infrastructure**
| Item | Version | Notes |
|---|---|---|
| Node.js | **26 (Active LTS since 2026-10-28)** | Pin with a root `.nvmrc` containing `26`. Strapi supports Node 22 to 26. |
| npm | the version bundled with Node 26 | Use npm only (no yarn/pnpm). |
| PostgreSQL | **18** (`postgres:18-alpine`) | PostgreSQL 19 is not GA yet (planned 2026-11-19). Re-evaluate after GA and after Prisma and Strapi confirm support. |
| Docker | current Docker Desktop / Engine with Compose v2 | |

**CMS (`cms/`)**
| Package | Version |
|---|---|
| `@strapi/strapi` (via `create-strapi`) | 5.61.0 |

Let `create-strapi` generate the dependency list for the CMS (it includes Strapi's own admin React 18 and TypeScript; that is independent of the frontend).

**Backend (`backend/`)**
| Package | Version | Notes |
|---|---|---|
| `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/testing` | 12.3.3 | NestJS 12 |
| `@nestjs/cli` | 12.0.11 | Scaffold with ESM + Vitest + oxlint (the Nest 12 defaults) |
| `@nestjs/config` | 12.1.0 | |
| `@nestjs/jwt` | 12.0.3 | |
| `@nestjs/passport` | 12.0.0 | |
| `@nestjs/swagger` | 12.1.0 | Requires TypeScript 5.5 or 6 (not 7) |
| `@nestjs/throttler` | 6.7.1 | Supports Nest 12 |
| `@nestjs/cache-manager` | 12.0.2 | Needs `cache-manager` ≥ 6 and `keyv` ≥ 5 |
| `cache-manager` | 7.2.9 | |
| `keyv` | 6.1.0 | |
| `@nestjs/terminus` | 12.1.0 | Health checks |
| `prisma` (CLI, dev) | **7.10.1 (pin)** | See compatibility note C3 |
| `@prisma/client` | **7.10.1 (pin)** | |
| `@prisma/adapter-pg` | **7.10.1 (pin)** | Prisma 7 requires a driver adapter |
| `pg` | 8.23.1 | |
| `class-validator` | 0.15.1 | |
| `class-transformer` | 0.5.1 | |
| `argon2` | 0.45.2 | Password hashing |
| `helmet` | 8.3.0 | |
| `cookie-parser` | 1.4.7 | |
| `passport`, `passport-jwt` | 0.7.0, 4.0.1 | |
| `qs` | 6.17.1 | Strapi query strings |
| `joi` | 18.3.2 | Env validation |
| `dotenv` | 18.0.9 | Used by `prisma.config.ts` |
| `rxjs`, `reflect-metadata` | 7.8.2, 0.2.2 | Nest peers |
| `typescript` (dev) | **~6.0.3 (pin)** | See compatibility note C2 |
| `vitest` (dev) | 5.1.0 | Nest 12 ESM default test runner |
| `supertest` (dev) | 7.3.1 | |
| `oxlint` (dev) | 1.91.0 | Nest 12 default linter |
| `prettier` (dev) | 3.9.10 | |
| `@types/node` (dev) | 26.6.6 | Match Node 26 |
| `@types/supertest`, `@types/passport-jwt`, `@types/cookie-parser`, `@types/qs`, `@types/pg` (dev) | 7.2.1, 4.0.1, 1.4.10, 6.15.1, 8.23.1 | |

**Frontend (`frontend/`)**
| Package | Version | Notes |
|---|---|---|
| `react`, `react-dom` | 19.3.1 | |
| `vite` | 8.3.6 | |
| `@vitejs/plugin-react` | 6.2.1 | Requires Vite 8 |
| `typescript` (dev) | ~7.0.2 | Vite `react-ts` scaffold default; see C2 |
| `react-router` | 8.5.1 | Import from `react-router`. Do **not** use `react-router-dom` (it stays on 7.x) |
| `@tanstack/react-query` | 5.106.1 | |
| `tailwindcss`, `@tailwindcss/vite` | 4.3.4 | Tailwind v4: CSS-first config (see §10.7 and §11) |
| `react-hook-form` | 7.91.0 | |
| `zod` | 4.6.7 | |
| `@hookform/resolvers` | 7.0.3 | Supports Zod 4 |
| `@strapi/blocks-react-renderer` | 1.0.2 | Renders Strapi rich-text Blocks |
| `gsap`, `@gsap/react` | 3.15.1, 2.1.2 | GSAP core, timeline, ScrollTrigger, Flip |
| `lenis` | 1.3.27 | Smooth scrolling |
| `vitest`, `@vitest/coverage-v8` (dev) | 5.1.0 | |
| `jsdom` (dev) | 30.1.3 | |
| `@testing-library/react` (dev) | 16.3.3 | Also install its peer `@testing-library/dom` |
| `@testing-library/jest-dom`, `@testing-library/user-event` (dev) | 7.0.1, 14.6.8 | |
| `msw` (dev) | 3.0.3 | |
| `@playwright/test` (dev) | 1.64.1 | |
| `oxlint` (dev) | 1.91.0 | Vite scaffold default linter |
| `prettier`, `prettier-plugin-tailwindcss` (dev) | 3.9.10, 0.8.1 | |
| `@types/react`, `@types/react-dom` (dev) | 19.3.0 | |
| `@types/node` (dev) | 26.6.6 | The Vite scaffold pins an older major; set it to 26 |

Do **not** add new major dependencies (state libraries, UI kits, ORMs, CSS frameworks) without a clear reason noted in the commit message.

### 2.2 Install commands

```bash
# Root
echo "26" > .nvmrc          # then: nvm install 26 && nvm use

# CMS
npx create-strapi@latest cms        # choose TypeScript and PostgreSQL; use npm

# Backend (choose npm, and ESM when asked for the module system: Vitest + oxlint)
npm install -g @nestjs/cli@latest
nest new backend
cd backend
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger @nestjs/throttler \
  @nestjs/cache-manager cache-manager keyv @nestjs/terminus class-validator class-transformer \
  passport passport-jwt argon2 helmet cookie-parser qs joi dotenv \
  @prisma/client@7.10.1 @prisma/adapter-pg@7.10.1 pg
npm install -D prisma@7.10.1 typescript@~6.0.3 @types/node@26 supertest @types/supertest \
  @types/passport-jwt @types/cookie-parser @types/qs @types/pg prettier

# Frontend
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router @tanstack/react-query react-hook-form zod @hookform/resolvers \
  @strapi/blocks-react-renderer tailwindcss @tailwindcss/vite
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/dom \
  @testing-library/jest-dom @testing-library/user-event msw @playwright/test \
  prettier prettier-plugin-tailwindcss @types/node@26
```

### 2.3 Compatibility notes (read before upgrading anything)

- **C1. Node.js:** use Node 26 LTS everywhere. Several current packages require a recent Node (`react-router` ≥ 22.22, `jsdom` 30 ≥ 22.22 / 24.15 / 26, `@nestjs/schematics` ≥ 22.22.3 / 24.15 / 26). Strapi supports Node 22 to 26 only, so do not jump to a Node major above 26 until Strapi supports it.
- **C2. TypeScript differs by app.** TypeScript 7 (native compiler) is the latest, but `@nestjs/swagger` supports only TypeScript 5.5 or 6, and the Nest 12 CLI is built on ~6.0. So: **backend uses `~6.0.3`**, **frontend uses `~7.0.2`** (the Vite scaffold default, and the frontend uses oxlint, which does not depend on the TypeScript version). Strapi uses whatever `create-strapi` generates. Move the backend to TypeScript 7 only after `@nestjs/swagger` and `@nestjs/schematics` declare support.
- **C3. Prisma: pin 7.10.1.** On npm, the `latest` tag of the `prisma` CLI currently points to a release candidate (`8.0.0-rc.30`), while `@prisma/client` `latest` is 7.10.1. Never run `npm install prisma@latest`. Install `prisma`, `@prisma/client`, and `@prisma/adapter-pg` at the same stable version, and upgrade all three together once Prisma 8 is stable.
- **C4. React Router 8** ships as the `react-router` package and needs React ≥ 19.2.7 and Node ≥ 22.22. Import everything from `react-router`.
- **C5. PostgreSQL 18 Docker image:** the volume must be mounted at `/var/lib/postgresql` (not `/var/lib/postgresql/data`); see §6.
- **C6. Linting is oxlint + Prettier** in the frontend and backend (the defaults of the Vite and Nest 12 scaffolds). ESLint is not used. Strapi gets no linter unless asked.
- **C7. Tailwind v4:** there is no `tailwind.config.js` by default. Use `@import "tailwindcss";` and an `@theme` block in `src/index.css`, with the `@tailwindcss/vite` plugin.
- **C8. Separate projects, separate React versions:** Strapi's admin uses React 18 internally; the frontend uses React 19. This is fine because `cms/` and `frontend/` never share `node_modules`.

### 2.4 Upgrade policy for agents

1. Before adding or changing a dependency, run `npm view <package> version` and check its `engines` and `peerDependencies` (`npm view <package> peerDependencies engines`).
2. Install with `@latest` unless this section pins a version. Never downgrade a package listed here without telling the user why.
3. Watch for npm `latest` tags pointing at a pre-release (as with Prisma, C3). If the version contains `-rc`, `-beta`, or `-alpha`, do not use it.
4. After any dependency change, run build, lint, and tests in the affected app, then **update the tables in this section** and the "verified" date at the top of this file.
5. Commit lockfiles (`package-lock.json`).

---

## 3. Responsibilities and Hard Boundaries

| Concern | Owner |
|---|---|
| Recipes, categories, tags, ingredients, images, editorial workflow (draft/publish) | **Strapi** |
| Users, passwords, sessions, favorites, and any future user-generated data | **NestJS + Postgres `app` database** |
| Searching, filtering, caching, shaping responses for the UI | **NestJS** |
| Rendering, routing, UI state | **React** |

Rules (never break these):
1. **The browser never calls Strapi's API.** The frontend calls NestJS only. (The browser loads images from Strapi's `/uploads` path, and editors use Strapi's `/admin`; nothing else.)
2. **Strapi's Public role has no permissions.** NestJS reads Strapi using a **read-only API token** kept in `backend/.env`.
3. **NestJS never returns raw Strapi responses.** It maps them to its own DTOs (flat, stable, documented).
4. **User data never goes into Strapi**, and recipe content is never copied into the `app` database. The `app` database stores Strapi `documentId`s as references only.
5. The three apps are independent npm projects. Never import code across `cms/`, `backend/`, and `frontend/`.

---

## 4. Repository Layout

```
recipe-site/
├── AGENTS.md
├── README.md
├── .nvmrc                      # 26
├── docker-compose.yml          # Postgres
├── .env.example                # Root env for docker-compose
├── .gitignore
├── scripts/
│   ├── init-db.sh              # Creates the extra databases on first Postgres start
│   └── seed-assets/            # Placeholder images used by the CMS seed
├── cms/                        # Strapi app
│   ├── config/                 # database.ts, server.ts, middlewares.ts, plugins.ts
│   ├── src/
│   │   ├── api/                # Content types: recipe, category, tag, ingredient
│   │   ├── components/         # recipe.ingredient-line, recipe.step, recipe.nutrition
│   │   └── index.ts            # register/bootstrap (seed hook)
│   ├── public/uploads/         # Local media (gitignored)
│   ├── .env.example
│   └── package.json
├── backend/                    # NestJS app (ESM)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── prisma.config.ts        # Prisma 7 config (schema path, migrations, DATABASE_URL)
│   ├── src/
│   │   ├── main.ts             # bootstrap: prefix, pipes, cors, helmet, swagger
│   │   ├── app.module.ts
│   │   ├── generated/prisma/   # Generated Prisma client (gitignored)
│   │   ├── config/             # typed, validated configuration
│   │   ├── common/             # filters, interceptors, guards, decorators, pagination DTOs
│   │   ├── prisma/             # PrismaModule + PrismaService
│   │   ├── cms/                # CmsModule: Strapi client, query builder, mappers, cache
│   │   ├── recipes/            # RecipesModule (controller, service, DTOs)
│   │   ├── categories/
│   │   ├── tags/
│   │   ├── auth/               # register, login, logout, me, JWT strategy/guard
│   │   ├── users/
│   │   ├── favorites/
│   │   ├── webhooks/           # CMS webhook receiver (cache invalidation)
│   │   └── health/
│   ├── test/                   # e2e tests
│   ├── .env.example
│   └── package.json
└── frontend/                   # React app
    ├── src/
    │   ├── api/                # API client, query hooks, response types
    │   ├── components/         # Reusable UI (RecipeCard, SearchBar, ...)
    │   ├── features/           # recipes/, categories/, favorites/, auth/
    │   ├── hooks/
    │   ├── lib/                # Utilities (formatters, unit scaling, ...)
    │   ├── pages/              # Route-level components
    │   ├── routes.tsx
    │   ├── main.tsx
    │   └── index.css           # Tailwind import + @theme tokens
    ├── e2e/                    # Playwright tests
    ├── .env.example
    └── package.json
```

---

## 5. Local Development Setup

### Ports
| Service | URL |
|---|---|
| Postgres | `localhost:5432` |
| Strapi (admin + content API) | `http://localhost:1337` (admin at `/admin`) |
| NestJS API | `http://localhost:3000/api` (Swagger at `http://localhost:3000/docs`) |
| Frontend (Vite) | `http://localhost:5173` |

### First-time setup
Scaffold the apps with the commands in §2.2 first (or, if they already exist, install dependencies with `npm install`).

```bash
# 0. Node 26
nvm install 26 && nvm use       # reads .nvmrc

# 1. Database (creates databases: app, cms, app_test)
cp .env.example .env
docker compose up -d

# 2. CMS
cd cms
cp .env.example .env            # fill in secrets (see §6)
npm install
npm run develop                 # create the first admin user in the browser
# In the admin: Settings → API Tokens → create a "backend" token (Read-only).
# Copy it into backend/.env as STRAPI_API_TOKEN. It is shown only once.

# 3. Backend
cd ../backend
cp .env.example .env            # fill in secrets and STRAPI_API_TOKEN
npm install
npx prisma migrate dev          # creates tables in the "app" database and generates the client
npm run start:dev

# 4. Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

### Daily workflow
```bash
docker compose up -d             # database
cd cms && npm run develop        # terminal 1
cd backend && npm run start:dev  # terminal 2
cd frontend && npm run dev       # terminal 3
```

### Stop / reset
```bash
docker compose down            # stop, keep data
docker compose down -v         # stop and DELETE all database data (destructive)
```

---

## 6. Docker and Environment

### `docker-compose.yml` (reference)
```yaml
services:
  postgres:
    image: postgres:18-alpine
    container_name: recipe_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      # PostgreSQL 18+ images: mount the PARENT directory, not /var/lib/postgresql/data
      - pgdata:/var/lib/postgresql
      - ./scripts/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  pgdata:
```

> **PostgreSQL 18 mount path:** since the 18 image, `PGDATA` defaults to `/var/lib/postgresql/18/docker` and the declared volume is `/var/lib/postgresql`. Mounting at the old `/var/lib/postgresql/data` path makes the container fail to start. Do not "fix" this by reverting the path.

### `scripts/init-db.sh`
Runs only the first time the volume is created. Keep **LF** line endings (important on Windows).
```bash
#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE cms;
  CREATE DATABASE app_test;
EOSQL
```
(`POSTGRES_DB=app` is created automatically by the image.) If the volume already exists, create the extra databases manually:
`docker exec -it recipe_postgres psql -U recipes -d app -c "CREATE DATABASE cms;"`

### Root `.env.example`
```
POSTGRES_DB=app
POSTGRES_USER=recipes
POSTGRES_PASSWORD=change-me
```

### `cms/.env.example`
```
HOST=0.0.0.0
PORT=1337

# Generate each secret with: openssl rand -base64 32
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
JWT_SECRET=
ENCRYPTION_KEY=

DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=cms
DATABASE_USERNAME=recipes
DATABASE_PASSWORD=change-me
DATABASE_SSL=false

# Set to true once to seed sample content (idempotent)
SEED_ON_BOOT=false
```

### `backend/.env.example`
```
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://recipes:change-me@localhost:5432/app?schema=public

# Auth
JWT_SECRET=                 # openssl rand -base64 32
JWT_EXPIRES_IN=7d
COOKIE_NAME=recipe_token

# CORS: comma-separated browser origins allowed to call this API
CLIENT_URL=http://localhost:5173

# CMS
STRAPI_URL=http://localhost:1337
STRAPI_PUBLIC_URL=http://localhost:1337   # base URL browsers use to load images
STRAPI_API_TOKEN=                          # read-only token from Strapi admin
STRAPI_WEBHOOK_SECRET=                     # shared secret for CMS → backend webhooks

CACHE_TTL_SECONDS=60
```

### `frontend/.env.example`
```
VITE_API_URL=http://localhost:3000/api
```

Rules:
- **Never commit `.env` files.** Only `.env.example` files are committed.
- Anything prefixed `VITE_` is **public** in the browser bundle. Never put secrets or tokens there.
- The backend validates its environment at startup (via `@nestjs/config` with a Joi schema) and **fails fast** if anything required is missing.

---

## 7. CMS (Strapi) Specification

Create the project with `npx create-strapi@latest cms` (choose TypeScript, PostgreSQL). Build content types via the Content-Type Builder in development; the generated files in `cms/src/api/` and `cms/src/components/` **must be committed**. The Content-Type Builder only works in development mode.

### 7.1 Content types

#### `Recipe` (collection type, Draft & Publish enabled)
| Field | Type | Notes |
|---|---|---|
| `title` | Short text | Required |
| `slug` | UID | Attached to `title`, required, unique |
| `description` | Long text | Short summary shown on cards |
| `cover` | Media (single image) | Required for published recipes |
| `gallery` | Media (multiple images) | Optional |
| `prepTimeMinutes` | Integer | Min 0 |
| `cookTimeMinutes` | Integer | Min 0 |
| `totalTimeMinutes` | Integer | **Computed** (prep + cook), see §7.4; not edited by hand |
| `servings` | Integer | Required, min 1 (base servings) |
| `difficulty` | Enumeration | `easy`, `medium`, `hard` |
| `ingredients` | Component (repeatable) | `recipe.ingredient-line` |
| `steps` | Component (repeatable) | `recipe.step` |
| `nutrition` | Component (single) | `recipe.nutrition`, optional, per serving |
| `notes` | Rich text (Blocks) | Tips, storage, substitutions |
| `sourceUrl` | Text | Optional attribution |
| `featured` | Boolean | Default false; shown on home page |
| `categories` | Relation | Many-to-many with `Category` |
| `tags` | Relation | Many-to-many with `Tag` |

Only published recipes are visible through the API (Strapi 5 returns published content by default; the backend must never request drafts).

#### `Category` (collection type)
`name` (required), `slug` (UID on `name`), `description` (long text), `image` (media, optional). Examples: Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks.

#### `Tag` (collection type)
`name` (required, unique), `slug` (UID on `name`). Examples: vegan, vegetarian, gluten-free, quick, spicy, one-pot.

#### `Ingredient` (collection type)
`name` (required, unique), `slug` (UID on `name`). Kept as its own type to avoid duplicates ("tomato" vs "tomatoes") and to allow filtering recipes by ingredient later.

### 7.2 Components

#### `recipe.ingredient-line`
| Field | Type | Notes |
|---|---|---|
| `quantity` | Decimal | Optional ("salt to taste" has none) |
| `unit` | Enumeration | `g`, `kg`, `ml`, `l`, `tsp`, `tbsp`, `cup`, `oz`, `lb`, `piece`, `pinch`, `clove`, `slice` |
| `ingredient` | Relation | Many-to-one with `Ingredient` |
| `note` | Short text | e.g. "finely chopped" |
| `group` | Short text | Optional heading, e.g. "For the sauce" |

#### `recipe.step`
`instruction` (long text, required), `image` (media, optional), `timerMinutes` (integer, optional).

#### `recipe.nutrition`
`calories`, `proteinGrams`, `carbsGrams`, `fatGrams`, `fiberGrams` (all decimal, optional).

### 7.3 Permissions and API token

- **Settings → Users & Permissions → Roles → Public:** enable **nothing**. Also leave **Authenticated** empty; Strapi's own user system is not used.
- **Settings → API Tokens:** create a token named `backend`, type **Read-only**, no expiry (local use). Its value goes into `backend/.env` as `STRAPI_API_TOKEN`. Never commit it.
- Uploaded files are served from `/uploads` publicly by Strapi; that is expected, since browsers load images directly.

### 7.4 Custom logic in Strapi

Keep it minimal. The only required customization is computing `totalTimeMinutes = prepTimeMinutes + cookTimeMinutes` on create/update, so the backend can filter by total time. Implement it as a Strapi 5 document-service middleware (database lifecycle hooks `beforeCreate`/`beforeUpdate` are an acceptable alternative). Add a code comment explaining why. Other business logic belongs in NestJS.

### 7.5 Webhooks (cache invalidation)

In **Settings → Webhooks**, add a webhook to `http://localhost:3000/api/webhooks/cms` with header `x-webhook-secret: <STRAPI_WEBHOOK_SECRET>`, for events: entry publish, unpublish, update, delete. The backend clears its recipe cache when it receives one.

### 7.6 Seed data

Provide an idempotent seed that runs in Strapi's `bootstrap` when `SEED_ON_BOOT=true`, using the Strapi document service (no token needed). It creates ~10 sample recipes with images from `scripts/seed-assets/`, plus categories, tags, and ingredients. Running it twice must not create duplicates. Remind the user to set `SEED_ON_BOOT=false` afterwards.

---

## 8. Backend (NestJS) Specification

Scaffold with the Nest CLI (`nest new backend`, npm, **ESM**). This gives an ESM project with Vitest and oxlint. Use TypeScript `~6.0.3` (see C2). In ESM, relative imports in source files carry a `.js` extension (e.g. `import { PrismaService } from './prisma.service.js'`), matching the scaffold's configuration.

### 8.1 `main.ts` bootstrap

- Global prefix `api`.
- Global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- `helmet()`, `cookie-parser`.
- CORS: `origin` from `CLIENT_URL` (split on commas), `credentials: true`. Never use `*`.
- Swagger at `/docs`, only when `NODE_ENV !== 'production'`.
- Global exception filter (see §8.5).
- Enable shutdown hooks (for Prisma).

### 8.2 Modules

| Module | Responsibility |
|---|---|
| `ConfigModule` | Typed, validated env config; global |
| `PrismaModule` | `PrismaService` (extends the generated `PrismaClient` with the `PrismaPg` adapter), connect/disconnect lifecycle |
| `CmsModule` | **The only code that talks to Strapi.** Strapi HTTP client, query builder, response mappers, caching |
| `RecipesModule` | Public recipe endpoints; delegates to `CmsService` |
| `CategoriesModule`, `TagsModule` | Public list endpoints |
| `AuthModule` | Register, login, logout, current user; JWT strategy and guard |
| `UsersModule` | User persistence and lookup |
| `FavoritesModule` | A user's favorite recipes (stores Strapi `documentId`s) |
| `WebhooksModule` | Receives Strapi webhooks, verifies the secret, clears cache |
| `HealthModule` | `GET /api/health` via `@nestjs/terminus` (app up; DB reachable; CMS reachable) |
| `ThrottlerModule` | Global rate limit; stricter limits on `/auth/*` |
| `CacheModule` | Short-TTL in-memory cache for CMS reads (`CACHE_TTL_SECONDS`) |

### 8.3 CmsModule rules

- Use the built-in `fetch` (Node 26) with `Authorization: Bearer ${STRAPI_API_TOKEN}`, a base URL from config, and a request timeout (e.g. `AbortSignal.timeout(5000)`).
- Build Strapi query strings with the `qs` library, never by hand.
- Map Strapi responses to DTOs in dedicated **pure mapper functions** (`mapRecipe`, `mapRecipeSummary`, `mapCategory`, ...). Mappers:
  - flatten relations (an ingredient line becomes `{ quantity, unit, name, note, group }`),
  - convert media to `{ url, alt, width, height, formats }` with **absolute URLs** (`STRAPI_PUBLIC_URL` + path),
  - never leak Strapi internals (numeric `id`, `createdAt` internals, `documentId` naming). The Strapi `documentId` is exposed to clients as `id`.
- Populate only what each endpoint needs. Never use `populate=*` or deep populate in list queries. For summaries, also restrict with `fields`.
- Cache GET results keyed by the serialized query. Webhooks clear the cache.
- Never request drafts.

Strapi query examples the CmsService should produce:
```
# List (summaries)
GET /api/recipes?fields[0]=title&fields[1]=slug&fields[2]=description&fields[3]=totalTimeMinutes
    &fields[4]=difficulty&fields[5]=servings
    &populate[cover]=true&populate[categories]=true&populate[tags]=true
    &sort=publishedAt:desc&pagination[page]=1&pagination[pageSize]=12

# Detail by slug
GET /api/recipes?filters[slug][$eq]=pancakes
    &populate[cover]=true&populate[gallery]=true
    &populate[ingredients][populate][ingredient]=true
    &populate[steps][populate][image]=true
    &populate[nutrition]=true&populate[categories]=true&populate[tags]=true

# Search
GET /api/recipes?filters[$or][0][title][$containsi]=pasta&filters[$or][1][description][$containsi]=pasta

# Filters
GET /api/recipes?filters[categories][slug][$eq]=dessert
GET /api/recipes?filters[tags][slug][$in][0]=vegan&filters[tags][slug][$in][1]=quick
GET /api/recipes?filters[totalTimeMinutes][$lte]=30&filters[difficulty][$eq]=easy

# By ids (favorites)
GET /api/recipes?filters[documentId][$in][0]=abc&filters[documentId][$in][1]=def
```

### 8.4 Auth

- `POST /api/auth/register`: email + password + displayName. Hash with `argon2`. Reject duplicate emails with 409.
- `POST /api/auth/login`: verify credentials, sign a JWT, set it as an **httpOnly cookie** (`COOKIE_NAME`) with `sameSite: 'lax'`, `secure: NODE_ENV === 'production'`, and a `maxAge` matching `JWT_EXPIRES_IN`.
- `POST /api/auth/logout`: clear the cookie.
- `GET /api/auth/me`: return the current user (never the hash).
- `JwtAuthGuard` reads the JWT from the cookie. Protected routes use `@UseGuards(JwtAuthGuard)` and a `@CurrentUser()` decorator.
- Password rules: minimum 8 characters, validated by DTO.
- Use the same generic error for "unknown email" and "wrong password" (no user enumeration).
- Throttle `/auth/login` and `/auth/register` more strictly than the rest.

### 8.5 Errors

A global exception filter returns a consistent shape:
```json
{ "statusCode": 404, "message": "Recipe not found", "error": "Not Found", "path": "/api/recipes/nope", "timestamp": "..." }
```
Mapping for CMS failures: Strapi 404 / empty slug result → `404`; Strapi unreachable, timeout, 401/403/5xx → `502 Bad Gateway` with a generic message. Log the real cause server-side; never return Strapi error bodies or tokens to clients.

### 8.6 Database (Prisma 7)

Prisma 7 differs from older versions: the database URL lives in `prisma.config.ts` (not in `schema.prisma`), the client is generated into your source tree (not `node_modules`), and a **driver adapter** is required. Follow the current Prisma and NestJS docs if details differ from the references below.

`prisma/schema.prisma` (reference):
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String
  displayName  String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  favorites    Favorite[]
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  recipeId  String   // Strapi documentId (reference only, no foreign key)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, recipeId])
  @@index([userId])
}
```

`prisma.config.ts` (reference):
```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
```

`src/prisma/prisma.service.ts` (reference):
```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({ adapter: new PrismaPg({ connectionString: config.getOrThrow<string>('DATABASE_URL') }) });
  }
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

Rules:
- Pin `prisma`, `@prisma/client`, and `@prisma/adapter-pg` to the same stable version (see C3).
- `src/generated/` is gitignored; regenerate with `npx prisma generate` (also runs on `migrate dev`).
- Schema changes go through **migrations** (`npx prisma migrate dev --name <change>`). Commit the migration files. **Never edit a migration that has already been applied.**
- Services use `PrismaService`; controllers never touch Prisma directly.
- Normalize emails to lowercase before storing and querying.

### 8.7 Conventions inside NestJS

- Controllers are thin: parse/validate input, call a service, return a DTO.
- Services hold the logic. Inject dependencies via constructors.
- Every request/response body has a DTO class with validation decorators (`class-validator`) and Swagger decorators (`@ApiProperty`, `@ApiTags`, ...).
- No business logic in mappers; no HTTP calls outside `CmsModule`.
- Use Nest's `Logger`; never log passwords, tokens, or cookies.

---

## 9. Backend API Contract (what the frontend consumes)

Base URL: `${VITE_API_URL}` (default `http://localhost:3000/api`). All responses are JSON. Authenticated routes need the cookie; the frontend must send requests with `credentials: 'include'`.

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/recipes` | no | Paginated list of recipe summaries |
| GET | `/recipes/:slug` | no | Full recipe detail |
| GET | `/categories` | no | All categories |
| GET | `/tags` | no | All tags |
| POST | `/auth/register` | no | Create account and log in |
| POST | `/auth/login` | no | Log in |
| POST | `/auth/logout` | yes | Log out |
| GET | `/auth/me` | yes | Current user |
| GET | `/favorites` | yes | Current user's favorite recipes (summaries) |
| PUT | `/favorites/:recipeId` | yes | Add favorite (idempotent) |
| DELETE | `/favorites/:recipeId` | yes | Remove favorite (idempotent) |
| POST | `/webhooks/cms` | secret header | Strapi webhook (not used by the frontend) |
| GET | `/health` | no | Health check |

### `GET /recipes` query parameters
| Param | Type | Notes |
|---|---|---|
| `page` | int ≥ 1 | Default 1 |
| `pageSize` | int 1-50 | Default 12 |
| `q` | string | Searches title and description |
| `category` | string | Category slug |
| `tag` | string, repeatable | Tag slug(s); matches any |
| `difficulty` | `easy` \| `medium` \| `hard` | |
| `maxTime` | int | Max `totalTimeMinutes` |
| `featured` | boolean | Only featured recipes |

### Response shapes
```ts
// Paginated list
{ items: RecipeSummary[], meta: { page: number, pageSize: number, pageCount: number, total: number } }

interface Media { url: string; alt: string | null; width: number; height: number;
  formats?: { thumbnail?: Media; small?: Media; medium?: Media; large?: Media } }

interface RecipeSummary {
  id: string;            // Strapi documentId
  slug: string; title: string; description: string | null;
  cover: Media | null;
  totalTimeMinutes: number | null; servings: number;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
}

interface Recipe extends RecipeSummary {
  gallery: Media[];
  prepTimeMinutes: number | null; cookTimeMinutes: number | null;
  ingredients: { quantity: number | null; unit: string | null; name: string; note: string | null; group: string | null }[];
  steps: { instruction: string; image: Media | null; timerMinutes: number | null }[];
  nutrition: { calories?: number; proteinGrams?: number; carbsGrams?: number; fatGrams?: number; fiberGrams?: number } | null;
  notes: unknown[] | null;   // Strapi Blocks JSON, passed through unchanged
  sourceUrl: string | null;
  featured: boolean;
  publishedAt: string;
}

interface User { id: string; email: string; displayName: string }
```
Keep this contract in sync: if a DTO changes, update this section, the Swagger decorators, and `frontend/src/api/types.ts` in the same change.

---

## 10. Frontend Specification

### 10.1 Routes

| Path | Page |
|---|---|
| `/` | Home: hero, search bar, featured recipes, categories, latest recipes |
| `/recipes` | All recipes with search, filters (category, tag, max time, difficulty), pagination |
| `/recipes/:slug` | Recipe detail |
| `/categories/:slug` | Recipes in a category |
| `/favorites` | Saved recipes (**protected**, redirects to login) |
| `/login`, `/register` | Auth forms |
| `*` | Not-found page |

Use `react-router` (v8) for routing; import from `react-router`. Keep search, filter, and page state in the **URL query string**, so pages are shareable and the back button works.

### 10.2 Recipe detail page

- Cover image, title, description, meta row (prep, cook, total time, servings, difficulty)
- Categories and tags as links
- **Servings scaler:** +/- control scaling all ingredient quantities proportionally from the recipe's base `servings`. Format sensibly (`0.5` → `1/2`, max 2 decimals; hide quantity if null).
- Ingredient list, grouped by `group` if present
- Numbered steps with optional images and timer hints
- Nutrition panel (if provided), notes, source link
- Print-friendly stylesheet (`@media print`)
- Favorite (heart) toggle

### 10.3 Key components
`Layout`, `Header`, `Footer`, `RecipeCard`, `RecipeGrid`, `SearchBar`, `FilterPanel`, `Pagination`, `ServingsScaler`, `IngredientList`, `StepList`, `NutritionTable`, `FavoriteButton`, `AuthForm`, `ProtectedRoute`, `Skeleton`, `ErrorState`, `EmptyState`.

### 10.4 Data layer
- One typed API client in `src/api/client.ts`: a thin `fetch` wrapper that sets `credentials: 'include'`, throws a typed `ApiError` on non-2xx, and parses JSON.
- One file per resource in `src/api/` (`recipes.ts`, `favorites.ts`, `auth.ts`) exporting query functions and TanStack Query hooks (`useRecipes`, `useRecipe`, `useFavorites`, ...).
- Response types live in `src/api/types.ts` and mirror §9.
- Stable query keys, e.g. `['recipes', { page, filters }]`.
- Every data-driven view handles **loading, error, and empty** states.

### 10.5 Auth and favorites
- An `AuthProvider` calls `GET /auth/me` on load to find the current user. The token is an httpOnly cookie, so **the frontend never reads or stores the JWT** (no `localStorage`).
- Login/register forms use React Hook Form + Zod 4 (via `@hookform/resolvers`), mirroring the backend's rules.
- Favorite toggles use TanStack Query mutations with optimistic updates and rollback on error.
- If a logged-out user clicks the heart, send them to `/login` and return them to the page afterwards.

### 10.6 Notes (rich text)
Render the `notes` Blocks JSON with `@strapi/blocks-react-renderer`. Never use `dangerouslySetInnerHTML` with CMS content.

### 10.7 Styling (Tailwind v4)
- `src/index.css` starts with `@import "tailwindcss";` and defines design tokens (colors, fonts, spacing) in an `@theme { ... }` block. There is no `tailwind.config.js` unless a plugin requires one.
- Register the `@tailwindcss/vite` plugin in `vite.config.ts`.
- Extract repeated patterns into components, not custom CSS.

### 10.8 UX, accessibility, quality bar
- Mobile-first, responsive (cards: 1 column on mobile, 2 on tablet, 3-4 on desktop).
- Semantic HTML, one `<h1>` per page, visible focus states, keyboard-operable controls.
- Images need `alt` text (use `media.alt`, fall back to the recipe title). Use `loading="lazy"` below the fold and the right `formats` size (thumbnail/small/medium) instead of always loading the original.
- WCAG AA contrast. Dark mode if time permits.
- Set `document.title` per page.

---

## 11. Coding Conventions

### General
- **TypeScript strict mode** in all apps. No `any` unless commented with a reason; prefer `unknown` and narrow.
- Small, focused functions and components. Name things clearly: components `PascalCase`, hooks `useThing`, utilities `camelCase`. Nest files follow Nest naming (`recipes.controller.ts`, `recipes.service.ts`, `recipes.module.ts`, `*.dto.ts`).
- No dead code, commented-out blocks, or leftover `console.log`.

### React
- Function components and hooks only.
- Server state lives in TanStack Query; do not copy it into `useState`. Use local state for UI-only state and the URL for filter/search state.
- Keep components presentational where possible; fetch in pages/feature containers or hooks.

### Styling
- Tailwind v4 utility classes; tokens in the `@theme` block (see §10.7).

### Formatting and linting
- **oxlint** (`npm run lint`) and **Prettier** in `frontend/` and `backend/`. Add a `format:check` script (`prettier --check .`) to each if missing. ESLint is not used.
- Run lint, type-check, and the format check before finishing any task.

### Git
- Small commits with Conventional Commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- Never commit secrets, `.env`, `node_modules`, `cms/public/uploads`, `cms/.tmp`, `backend/src/generated`, `dist/`, or `backups/`.

---

## 12. Commands Reference

### CMS (`cms/`)
```bash
npm run develop    # dev mode with autoreload (Content-Type Builder enabled)
npm run build      # build the admin panel
npm run start      # production mode (no Content-Type Builder)
npm run strapi export -- --no-encrypt -f backup   # export data (also: import)
```

### Backend (`backend/`)
```bash
npm run start:dev                  # watch mode
npm run build                      # compile
npm run start:prod                 # run compiled app
npm run lint                       # oxlint
npm run format:check               # Prettier
npm run test                       # unit tests (Vitest)
npm run test:e2e                   # e2e tests (Vitest + Supertest, uses the app_test database)
npx prisma migrate dev --name x    # create + apply a migration
npx prisma generate                # regenerate the client
npx prisma studio                  # browse the app database
```

### Frontend (`frontend/`)
```bash
npm run dev            # Vite dev server
npm run build          # type-check (tsc -b) + production build
npm run preview        # serve the production build
npm run lint           # oxlint
npm run format:check   # Prettier
npm run test           # Vitest
npm run test:e2e       # Playwright (needs DB, CMS, backend running with seed data)
```

Make sure these scripts exist in each `package.json`; add them if missing.

---

## 13. Testing

| App | Level | Tool | What to test |
|---|---|---|---|
| Backend | Unit | Vitest | Mappers (Strapi → DTO), query builder, services (with a mocked `CmsService` and mocked Prisma), auth service |
| Backend | E2E | Vitest + Supertest | Recipes endpoints (with `CmsService` replaced by a stub), register/login/logout/me flow, favorites add/remove/list, validation errors, 401 on protected routes, rate limiting. Uses the `app_test` database (`DATABASE_URL` pointing at it, migrations applied with `npx prisma migrate deploy`), reset between runs |
| Frontend | Unit | Vitest | `lib/` utilities: ingredient scaling, fraction formatting, time formatting |
| Frontend | Component | Vitest + Testing Library (jsdom) + MSW | `RecipeCard`, `ServingsScaler`, `FilterPanel`, loading/error/empty states |
| Full stack | E2E | Playwright | Home shows featured recipes; search; filter by category; open a recipe; scale servings; register, log in, favorite, see it on `/favorites`, log out |

Rules:
- New logic ships with tests. Mappers and utilities are pure functions and must be unit tested.
- Fix bugs by first writing a failing test when practical.
- Full-stack E2E relies on the seed data; never depend on manually created content.

---

## 14. Security

- Strapi's Public role has **no** permissions; only the backend's read-only token can read content.
- Strapi admin is local-only; never expose it publicly.
- The frontend never receives or stores tokens or secrets. The JWT is an httpOnly cookie.
- Passwords are hashed with argon2; never log or return them.
- `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` on every endpoint; DTOs for every body and query.
- `helmet`, strict CORS (explicit origin + credentials), rate limiting (stricter on auth).
- State-changing routes accept JSON only; cookies are `SameSite=Lax`. Revisit CSRF protections before any cross-site deployment.
- Verify the `x-webhook-secret` header on `/webhooks/cms` using a constant-time comparison.
- Use strong, generated values for all secrets, even locally. Run `npm audit` periodically and keep Node on the latest 26.x patch release.
- Never render CMS content with `dangerouslySetInnerHTML`.

---

## 15. Performance

- Paginate every list (default 12, max 50).
- Populate only required relations/fields in Strapi queries; use `fields` for summaries.
- Cache CMS reads in NestJS with a short TTL; invalidate on webhook.
- Use responsive image formats and lazy loading in the frontend.
- Debounce search input (300 ms) and keep previous data in TanStack Query while new pages load.
- Add database indexes for new query patterns in Prisma migrations.
- Code-split routes with `React.lazy` if the bundle grows large.

---

## 16. Backup and Data Safety

- All databases live in the Docker volume `pgdata`. `docker compose down -v` **deletes them all**; never run it without explicit confirmation.
- Back up both databases:
  ```bash
  mkdir -p backups
  docker exec recipe_postgres pg_dump -U recipes app > backups/app_$(date +%F).sql
  docker exec recipe_postgres pg_dump -U recipes cms > backups/cms_$(date +%F).sql
  ```
- Uploaded images live in `cms/public/uploads/` (gitignored). Back them up too, or use `strapi export`, which includes media.
- Major PostgreSQL upgrades (e.g. 18 → 19) require a dump/restore or `pg_upgrade`; never just change the image tag on an existing volume.

---

## 17. Roadmap (build in this order)

Complete and verify each phase before starting the next.

**Phase 0: Foundation**
- [ ] Repo, `.gitignore`, `README.md`, `.nvmrc` (`26`)
- [ ] `docker-compose.yml` + `scripts/init-db.sh`; confirm Postgres 18 is healthy and databases `app`, `cms`, `app_test` exist
- [ ] Scaffold Strapi (`cms/`) on the `cms` database; create the first admin user
- [ ] Scaffold NestJS (`backend/`, ESM) with config validation, Prisma 7 (adapter, `prisma.config.ts`), and `GET /api/health`
- [ ] Scaffold React + Vite + TS + Tailwind v4 (`frontend/`); oxlint/Prettier/Vitest
- [ ] Confirm the package versions in §2 match what is installed (`npm ls --depth=0` in each app)

**Phase 1: Content model (CMS)**
- [ ] `Category`, `Tag`, `Ingredient`, components, and `Recipe`
- [ ] `totalTimeMinutes` computation
- [ ] Public role empty; create the read-only API token
- [ ] Seed script; seed ~10 recipes with images

**Phase 2: Backend core (NestJS)**
- [ ] `CmsModule`: client, query builder, mappers, cache
- [ ] `GET /recipes`, `GET /recipes/:slug`, `/categories`, `/tags`
- [ ] Global validation, error filter, helmet, CORS, Swagger, throttling
- [ ] Webhook receiver + Strapi webhook configured
- [ ] Unit tests (mappers, query builder) and e2e tests for the public endpoints

**Phase 3: Frontend core**
- [ ] Layout, header/footer, routing (`react-router`)
- [ ] API client, types, TanStack Query hooks
- [ ] Home page, recipe list with pagination, recipe detail page
- [ ] Loading/error/empty states

**Phase 4: Discovery**
- [ ] Debounced search and filters (category, tag, time, difficulty) synced to the URL
- [ ] Category pages
- [ ] Servings scaler with unit tests

**Phase 5: Accounts and favorites**
- [ ] Prisma `User` and `Favorite` models + migration
- [ ] Backend: register, login, logout, me, guard; favorites endpoints; tests
- [ ] Frontend: `AuthProvider`, login/register pages, `ProtectedRoute`, `FavoriteButton`, `/favorites`

**Phase 6: Polish**
- [ ] Print stylesheet, accessibility pass, responsive pass, dark mode (optional)
- [ ] Playwright full-stack E2E suite
- [ ] README with setup instructions and screenshots

**Phase 7: Future ideas (not in scope until requested)**
- Ratings and comments; personal collections
- Shopping list generated from selected recipes; meal planner
- Nutrition calculation service in the backend
- SSR/prerendering for SEO
- Upgrade to PostgreSQL 19 and Prisma 8 once stable and supported
- Dockerize all apps and deploy

---

## 18. Rules for AI Agents

**Do**
- Read this file and the existing code before changing anything; match existing patterns.
- Make the smallest change that solves the task. Keep diffs focused.
- Use the exact field names, content types, endpoints, and DTO shapes defined above. If a change to the content model or API is needed, update §7 / §9 in this file in the same change.
- Follow the versions and compatibility notes in §2 and the upgrade policy in §2.4.
- Run lint, type-check, and relevant tests after changes, and report the results.
- Ask the user when requirements are ambiguous or a decision has big consequences.
- Mention any manual steps the user must do (create the Strapi API token, set the webhook, run migrations, run the seed, restart a server).

**Don't**
- Don't call Strapi from the browser, and don't enable Public permissions in Strapi.
- Don't return raw Strapi responses from NestJS, and don't put HTTP calls to Strapi anywhere outside `CmsModule`.
- Don't store user data in Strapi or copy recipe content into the `app` database.
- Don't install pre-release versions (`-rc`, `-beta`, `-alpha`), and never run `npm install prisma@latest` (see C3).
- Don't upgrade the backend to TypeScript 7 or switch the frontend to `react-router-dom` (see C2, C4).
- Don't install new major dependencies or swap tools (Strapi, NestJS, Prisma, Tailwind, TanStack Query) without asking.
- Don't run destructive commands (`docker compose down -v`, `prisma migrate reset` on the dev DB, dropping tables, deleting uploads, `git reset --hard`, `rm -rf`) without explicit confirmation.
- Don't edit already-applied Prisma migrations.
- Don't edit or commit `.env` files, and never print secrets or tokens.
- Don't hand-edit Strapi's generated schema JSON if the Content-Type Builder can do it; if you must, keep it valid and restart Strapi.
- Don't use `populate=*`, `any`, `dangerouslySetInnerHTML` with CMS content, or `localStorage` for tokens.
- Don't add features outside the current roadmap phase unless asked.
- Don't leave the project broken: it must always start with the commands in §5.

### Definition of done
A task is done when:
1. The code compiles with no TypeScript errors and passes lint and formatting checks.
2. Relevant tests are added or updated and pass.
3. The feature works end to end against the real stack (loading, error, and empty states handled in the UI).
4. No secrets, debug logs, or unrelated changes are included.
5. This file and the README are updated if setup, commands, content model, API, or package versions changed.
6. A short summary of what changed and any manual steps is provided.

---

## 19. Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| Postgres container exits right after start | Volume mounted at `/var/lib/postgresql/data` on the 18 image; mount `/var/lib/postgresql` (see §6) |
| Strapi or NestJS cannot connect to Postgres | Container not running or unhealthy (`docker compose ps`); check `DATABASE_*` / `DATABASE_URL` values match the root `.env` |
| Database `cms` does not exist | Volume was created before `init-db.sh` existed; create it manually (see §6) |
| Backend logs `401` from Strapi | `STRAPI_API_TOKEN` missing, wrong, or revoked; create a new token in Strapi admin |
| Backend logs `403` from Strapi | The API token lacks permission for that content type; use a Read-only token or grant `find`/`findOne` |
| API returns `502` | NestJS cannot reach Strapi (not running, wrong `STRAPI_URL`, timeout) or the token is invalid |
| Browser CORS error | `CLIENT_URL` in `backend/.env` does not match the frontend origin (scheme + host + port); restart the backend |
| Logged in but `/auth/me` returns 401 | Frontend not sending `credentials: 'include'`, or CORS `credentials` not enabled, or the cookie blocked/expired |
| Images do not load | `STRAPI_PUBLIC_URL` wrong, or Strapi not running; image URLs must be absolute |
| Recipe not returned | It is still a draft; publish it in the Strapi admin |
| Changes in Strapi not visible | Backend cache; wait for the TTL, or check the webhook is configured and the secret matches |
| `Cannot find module '.../generated/prisma/client'` | Client not generated; run `npx prisma generate`. In ESM, keep the `.js` extension in imports |
| Prisma complains about missing adapter or datasource URL | Prisma 7: pass `PrismaPg` adapter to `PrismaClient`, and keep the URL in `prisma.config.ts` (see §8.6) |
| Weird Prisma CLI/client mismatch errors | `prisma` and `@prisma/client` versions differ; pin both (and the adapter) to 7.10.1 (see C3) |
| Swagger or Nest build fails after TypeScript upgrade | Backend must stay on TypeScript `~6.0.3` (see C2) |
| `npm install` engine warnings | Wrong Node version; run `nvm use` (Node 26) |
| Content-Type Builder is read-only | Strapi was started with `npm run start`; use `npm run develop` |
| Port already in use | Another process uses 5432, 1337, 3000, or 5173; stop it or change the port in the env/config |
