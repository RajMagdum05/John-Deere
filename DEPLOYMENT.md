# Deployment & Dockerization Guide

This guide covers running the application locally using Docker Compose, as well as deploying live to **Vercel (Frontend)** and **Render (Backend & PostgreSQL)**.

---

## 1. Local Docker Setup (One-Command Run)

### Start All Services:
```bash
# Build & start PostgreSQL, FastAPI backend, and Nginx frontend in background
docker-compose up -d --build
```

### URLs when running locally via Docker:
- **Frontend App**: [http://localhost:3000](http://localhost:3000) (also mapped on port 5173)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (`farm_action_loop`)

### Common Docker Commands:
```bash
# View live logs
docker-compose logs -f

# Check container status
docker-compose ps

# Stop all containers
docker-compose down

# Stop and remove persistent database volumes (reset data)
docker-compose down -v
```

---

## 2. Deploy Backend & PostgreSQL to Render

Render offers free hosting for FastAPI backend web services and managed PostgreSQL databases.

### Step 1: Connect Repository to Render Blueprint
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository (`RajMagdum05/John-Deere` or your repo).
4. Render will automatically detect [`render.yaml`](file:///r:/john-deere-opportunity/render.yaml) and configure:
   - **PostgreSQL Database**: `farm-action-loop-db`
   - **FastAPI Web Service**: `farm-action-loop-backend`

### Step 2: Environment Variables on Render
Under your backend Web Service settings on Render, verify/add:
| Key | Value / Source |
|---|---|
| `DATABASE_URL` | Auto-populated by Render Blueprint from the database |
| `GEMINI_API_KEY` | Your Gemini API Key (`AIza...`) |
| `PORT` | `8000` |
| `PYTHON_VERSION` | `3.11.0` |

### Step 3: Copy Your Backend Live URL
Once deployed, Render gives you a URL like:
`https://farm-action-loop-backend.onrender.com`

---

## 3. Deploy Frontend to Vercel

Vercel provides instant global edge deployment for Vite React SPAs.

### Method A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (or leave default if using root [`vercel.json`](file:///r:/john-deere-opportunity/vercel.json))
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **`VITE_API_URL`**: `https://farm-action-loop-backend.onrender.com` (your Render backend URL)
5. Click **Deploy**.

### Method B: Via Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel --prod -e VITE_API_URL="https://farm-action-loop-backend.onrender.com"
```

---

## 4. Production Checklist

- [x] **Docker Compose**: Containerized multi-stage Node/Nginx + Python 3.11 + Postgres 15.
- [x] **Reverse Proxy**: Nginx forwards `/api` requests seamlessly in container mode.
- [x] **Client-Side SPA Routing**: [`vercel.json`](file:///r:/john-deere-opportunity/frontend/vercel.json) and [`nginx.conf`](file:///r:/john-deere-opportunity/frontend/nginx.conf) configured with fallback rewrites.
- [x] **Dynamic Base URL**: Centralized [`apiConfig.ts`](file:///r:/john-deere-opportunity/frontend/src/services/apiConfig.ts) automatically detects `VITE_API_URL` when deployed to Vercel and defaults gracefully in local environments.
- [x] **Cross-Origin Requests (CORS)**: FastAPI configured to accept incoming requests from all Vercel domains (`https://*.vercel.app`).
