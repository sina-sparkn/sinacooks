# Production Deployment Guide: Recipe Website

This guide walks you through deploying the **Recipe Website** to production on the internet:
- **Frontend (React 19 + Vite):** Hosted on **Vercel** (Global Edge CDN, auto-SSL, instant previews).
- **Backend (NestJS 12 API), CMS (Strapi 5), & PostgreSQL 18:** Hosted on **Railway**, **Render**, or any **VPS** (via Docker Compose).

---

## 1. Architecture in Production

```
Internet Users
      │
      ▼
Frontend: React SPA on Vercel (https://your-recipe-app.vercel.app)
      │
      │ HTTPS + Cookies (SameSite=None, Secure=true)
      ▼
Backend: NestJS API on Cloud / VPS (https://api.yourdomain.com/api)
      │
      ├───────────────────────────────┐
      ▼                               ▼
Strapi CMS 5                    PostgreSQL 18
(https://cms.yourdomain.com)    ("app" & "cms" databases)
```

---

## 2. Step 1: Push Code to GitHub

The repository is fully prepared with all production configurations (`vercel.json`, `render.yaml`, Dockerfiles, and cross-site auth).

If you haven't linked a GitHub remote yet:

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `recipe-site`).
2. Run the following commands in your project root terminal:

```bash
# Add your GitHub repository remote:
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/recipe-site.git

# Set main branch and push:
git branch -M main
git push -u origin main
```

---

## 3. Step 2: Deploy Frontend to Vercel

### Option A: Via the Vercel Web Dashboard (Recommended)

1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`recipe-site`) and click **Import**.
4. In the **Configure Project** screen:
   - **Framework Preset:** `Vite` (auto-detected)
   - **Root Directory:** Click "Edit" and choose `frontend`
   - **Build and Output Settings:** Leave default (`npm run build`, `dist`)
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<YOUR_BACKEND_URL>/api` (e.g. `https://recipe-api.up.railway.app/api` or your backend domain)
6. Click **Deploy**.

Vercel will build and deploy the React frontend in under 30 seconds. All client-side SPA routing (`/recipes`, `/login`, etc.) is handled automatically via `frontend/vercel.json`.

---

### Option B: Via Vercel CLI

You can also deploy directly from your local terminal:

```bash
cd frontend
npx vercel
```
Follow the interactive CLI prompts:
- Link to existing project? `No`
- What's your project's name? `recipe-website`
- In which directory is your code located? `./`
- Want to modify settings? `No`

For production deployment:
```bash
npx vercel --prod
```

---

## 4. Step 3: Deploy Backend, CMS, and Database

Because the frontend on Vercel is a client-side app, it needs the NestJS API and Strapi CMS accessible on public URLs. Choose either **Render / Railway** (Managed Cloud) or a **VPS** (Docker Compose).

### Choice 1: Render (1-Click Blueprint)

The repository includes a ready-to-use `render.yaml` blueprint:
1. Log in to [Render](https://render.com).
2. Click **New +** → **Blueprint**.
3. Connect your `recipe-site` GitHub repository.
4. Render will automatically read `render.yaml` and provision:
   - PostgreSQL database (`recipe-postgres`)
   - Strapi CMS Web Service (`recipe-cms`)
   - NestJS API Web Service (`recipe-backend`)
5. Once Strapi is deployed:
   - Open Strapi admin (`https://recipe-cms.onrender.com/admin`) and create an admin user.
   - Go to **Settings → API Tokens** → Create a **Read-only** token named `backend`.
   - Add this token to the `STRAPI_API_TOKEN` environment variable in the `recipe-backend` service.
6. Copy your `recipe-backend` URL (e.g. `https://recipe-backend.onrender.com`) and set it in Vercel as `VITE_API_URL=https://recipe-backend.onrender.com/api`.

---

### Choice 2: Railway

1. Go to [Railway](https://railway.app) and create a **New Project**.
2. Add **PostgreSQL** database from the marketplace.
3. Add **GitHub Repo** → select `recipe-site`:
   - Service 1: Set root directory to `cms`, add environment variables from `cms/.env.example`.
   - Service 2: Set root directory to `backend`, add environment variables from `backend/.env.example`.
4. In `backend` environment variables:
   - `CLIENT_URL`: `https://*.vercel.app,https://<YOUR_VERCEL_DOMAIN>.vercel.app`
   - `COOKIE_SAME_SITE`: `none`
   - `COOKIE_SECURE`: `true`

---

### Choice 3: Self-Hosted Linux VPS (Docker Compose)

On any Ubuntu / Debian VPS with Docker installed:

1. Clone your repo:
   ```bash
   git clone https://github.com/<YOUR_GITHUB_USERNAME>/recipe-site.git
   cd recipe-site
   ```
2. Start the production stack:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. Set up a reverse proxy (e.g. Caddy or Nginx with Let's Encrypt SSL) to point:
   - `api.yourdomain.com` → `http://localhost:3000`
   - `cms.yourdomain.com` → `http://localhost:1337`
4. Set `CLIENT_URL=https://your-app.vercel.app` in `backend` and `VITE_API_URL=https://api.yourdomain.com/api` in Vercel.

---

## 5. Summary of Environment Variables

### Frontend (in Vercel):
| Variable | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://<backend-host>/api` | URL of the NestJS API |

### Backend (in Production Host):
| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production environment |
| `DATABASE_URL` | `postgresql://...` | Connection string to PostgreSQL `app` DB |
| `JWT_SECRET` | `<32-char-random-string>` | Secret for signing auth tokens |
| `COOKIE_SAME_SITE` | `none` | Allows cross-domain cookies between Vercel and Backend |
| `COOKIE_SECURE` | `true` | Requires HTTPS for auth cookies |
| `CLIENT_URL` | `https://*.vercel.app,https://<your-app>.vercel.app` | Allowed CORS origins |
| `STRAPI_URL` | `http://cms:1337` (internal) or `https://<cms-host>` | URL to reach Strapi CMS |
| `STRAPI_PUBLIC_URL` | `https://<cms-host>` | Public URL for media uploads |
| `STRAPI_API_TOKEN` | `<token>` | Read-only Strapi token |
