# 🚀 Production Deployment Guide

This project is a full-stack **Freelancer Marketplace & Portfolio Directory** built with:
- **Frontend**: React 19, Vite, Tailwind CSS, React Router v7, Socket.IO client
- **Backend**: Node.js, Express, Socket.IO (WebSocket server)
- **Database**: PostgreSQL / Supabase (16 normalized relational tables)

---

## 📋 Table of Contents
1. [Pre-Deployment Setup: PostgreSQL Database](#1-database-setup-supabase--neon--render-postgres)
2. [Option A: Unified Full-Stack Deploy on Render (Easiest)](#option-a-unified-full-stack-deploy-on-render-recommended)
3. [Option B: Decoupled Deploy (Vercel Frontend + Render/Railway Backend)](#option-b-decoupled-deploy-vercel--renderrailway)
4. [Option C: Docker Container Deployment](#option-c-docker-container-deployment)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Post-Deployment Verification Checklist](#post-deployment-verification-checklist)

---

## 1. Database Setup (Supabase / Neon / Render Postgres)

Before deploying the web application, prepare a hosted PostgreSQL database:

### Using Supabase (Recommended Free Tier):
1. Go to [Supabase](https://supabase.com) and create a free project.
2. Navigate to **Project Settings** -> **Database**.
3. Under **Connection string**, select **URI**.
   - For serverless or connection pooler mode (port 6543):
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - Or direct connection (port 5432):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```
4. Run schema migration and seeding from your local terminal with your remote `DATABASE_URL`:
   ```bash
   # In server directory or root with your DATABASE_URL in server/.env:
   npm run db:migrate
   npm run db:seed
   ```

---

## Option A: Unified Full-Stack Deploy on Render (Recommended)

In this approach, Render serves your Express API, WebSockets, and the compiled React frontend from a single web service and custom domain.

1. Push your repository to **GitHub** or **GitLab**.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name**: `freelancer-marketplace`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm run build:all`
   - **Start Command**: `npm start`
6. Add the **Environment Variables**:
   | Variable | Value | Notes |
   |----------|-------|-------|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Render standard port |
   | `DATABASE_URL` | `postgresql://...` | Your Supabase or cloud Postgres URI |
   | `JWT_SECRET` | *Click "Generate"* | Secure random key for auth tokens |
   | `CLIENT_URL` | `https://your-service.onrender.com` | Your Render service URL |
7. Click **Deploy Web Service**.

---

## Option B: Decoupled Deploy (Vercel + Render/Railway)

### 1. Backend on Render (Web Service):
- **Root Directory**: `server` (or keep root with `cd server`)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT=5000`
  - `NODE_ENV=production`
  - `DATABASE_URL=postgresql://...`
  - `JWT_SECRET=your_jwt_secret`
  - `CLIENT_URL=https://your-frontend.vercel.app` (your frontend Vercel URL)

### 2. Frontend on Vercel:
1. Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Root Directory**: `client` (or use repo root, `vercel.json` will route automatically)
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://your-backend.onrender.com` |
5. Click **Deploy**.

---

## Option C: Docker Container Deployment

A multi-stage `Dockerfile` and `docker-compose.yml` are included in the repository.

```bash
# 1. Build and run the entire stack with local PostgreSQL:
docker compose up -d --build

# 2. Or build the production image standalone:
docker build -t freelancer-marketplace .
docker run -p 5000:5000 -e DATABASE_URL="postgresql://..." freelancer-marketplace
```

---

## Environment Variables Reference

### Backend (`server/.env` or Platform Config)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Optional | Port for the Express & Socket.IO server | `5000` or `10000` |
| `NODE_ENV` | Yes | App runtime mode | `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://postgres:...@...:5432/postgres` |
| `JWT_SECRET` | Yes | Token hashing secret | `random_high_entropy_secret_key` |
| `CLIENT_URL` | Yes | Frontend domain for CORS and websockets | `https://your-app.vercel.app` |

### Frontend (`client/.env` or Platform Config)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | If split | Full URL to backend API | `https://api.yourdomain.com/api` |
| `VITE_SOCKET_URL` | If split | Full URL to backend WebSocket host | `https://api.yourdomain.com` |

---

## Post-Deployment Verification Checklist

- [ ] **Health Endpoint**: Visit `https://your-backend-url/api/health` and verify `{"status": "ok"}` response.
- [ ] **Database Connection**: Confirm the backend logs show `[DB] Connected successfully`.
- [ ] **SPA Route Refresh**: Navigate to `/projects` or `/profile` and refresh the page to confirm no 404 error occurs.
- [ ] **Authentication**: Log in with demo accounts (`freelancer@demo.com` / `demo123` or `client@demo.com` / `demo123`).
- [ ] **Real-Time WebSockets**: Send a test message in the chat and verify instant delivery without browser errors.
