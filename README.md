# FreelanceHub - Full-Stack Freelancer Marketplace

A modern, production-grade full-stack Freelancer Marketplace featuring **JWT Authentication**, **Role-Based Dashboards (Clients & Freelancers)**, **REST APIs backed by PostgreSQL**, and **Real-Time Messaging via Socket.IO**.

---

## Architecture Overview

```
FREELANCER/
├── client/                          # React + Tailwind CSS + Vite Frontend
│   ├── src/
│   │   ├── components/              # UI Components (NavBar, Layout, etc.)
│   │   ├── context/                 # AuthContext (JWT session management)
│   │   ├── hooks/                   # TanStack Query API hooks
│   │   ├── pages/                   # Role-based views & pages (BrowseTalent, BrowseProjects, Messages, Profile...)
│   │   ├── services/                # Axios REST API client & Socket.IO client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── server/                          # Node.js + Express + PostgreSQL + Socket.IO Backend
│   ├── src/
│   │   ├── config/                  # Database pool (pg) & configuration
│   │   ├── controllers/             # Auth, Profile, Project, Review, Message, Saved, Portfolio
│   │   ├── middleware/              # JWT auth verification, role authorization, error handling
│   │   ├── routes/                  # Express REST routes (/api/auth, /api/projects, etc.)
│   │   ├── sockets/                 # Socket.IO real-time chat handlers & presence
│   │   ├── db/                      # Database schema, migrations, seed script
│   │   └── index.js                 # Express server bootstrap
│   ├── server.js                    # Server entry point
│   ├── package.json
│   └── .env.example
├── package.json                     # Monorepo orchestrator (concurrently)
└── README.md
```

---

## ✨ Features

- **🔐 Secure JWT Authentication**: User registration and login with `bcrypt` password hashing and token expiry.
- ** Role-Based Access Control**:
  - **Client Role**: Post and edit projects, search and bookmark freelancers, submit ratings and reviews, direct chat.
  - **Freelancer Role**: Browse open projects, build a showcase portfolio, bookmark gigs, chat in real-time.
- ** Real-Time WebSockets (Socket.IO)**:
  - Instant live chat delivery across client and freelancer threads.
  - Typing indicator (`... is typing`).
  - Active conversation room isolation.
- **🐘 Robust Relational Database (PostgreSQL)**:
  - Schema with foreign keys, cascading deletes, unique constraints, and indexes.
  - Automatic migration runner (`npm run db:init`) and demo seed script (`npm run db:seed`).
- **🎨 Glassmorphism & Modern UI**: Built with Tailwind CSS, responsive on mobile, tablet, and desktop.

---

## 🚀 Quick Start (Local Setup)

### 1. Install Dependencies
```bash
# Install root, client, and server dependencies
npm run install:all
```

### 2. Configure Environment Variables

Create `server/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/freelancer_db
JWT_SECRET=super_secret_jwt_key_freelancer_2026!
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Initialize & Seed Database
```bash
# Run PostgreSQL schema migrations
npm run db:init

# (Optional) Seed sample users, projects, and portfolio items
npm run db:seed
```

### 4. Start Development Servers
```bash
# Run both Frontend & Backend concurrently
npm run dev
```
- Frontend runs at: `http://localhost:5173`
- Backend runs at: `http://localhost:5000`

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new client or freelancer |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/me` | Authenticated | Get current user's profile |
| `GET` | `/api/profiles/freelancers` | Public | List freelancers (filters: search, experience, category, rate) |
| `GET` | `/api/profiles/clients` | Public | List clients |
| `GET` | `/api/profiles/:id` | Public | Get single profile details |
| `PUT` | `/api/profiles/me` | Authenticated | Update user's profile |
| `GET` | `/api/projects` | Public | List open projects (filters: search, category, budget) |
| `POST` | `/api/projects` | Client | Create a new project listing |
| `PUT` | `/api/projects/:id` | Client (Owner) | Update project listing |
| `DELETE` | `/api/projects/:id` | Client (Owner) | Delete project listing |
| `GET` | `/api/portfolio/:freelancerId`| Public | Get freelancer portfolio items |
| `POST` | `/api/portfolio` | Freelancer | Add portfolio item |
| `DELETE`| `/api/portfolio/:id` | Freelancer (Owner)| Delete portfolio item |
| `GET` | `/api/reviews/freelancer/:id`| Public | Get client reviews for a freelancer |
| `POST` | `/api/reviews` | Client | Submit a rating and review |
| `GET` | `/api/messages/conversations` | Authenticated | Get all active conversation threads |
| `POST` | `/api/messages/conversations` | Authenticated | Get or create conversation with user |
| `GET` | `/api/messages/conversations/:id/messages` | Authenticated | Get messages in conversation |
| `POST` | `/api/messages/conversations/:id/messages` | Authenticated | Send message in conversation |
| `GET` | `/api/saved/profiles` | Client | Get saved freelancer bookmarks |
| `POST` | `/api/saved/profiles/:id` | Client | Save freelancer |
| `DELETE`| `/api/saved/profiles/:id` | Client | Remove saved freelancer |
| `GET` | `/api/saved/projects` | Freelancer | Get saved project bookmarks |
| `POST` | `/api/saved/projects/:id` | Freelancer | Save project |
| `DELETE`| `/api/saved/projects/:id` | Freelancer | Remove saved project |

---

## 🌐 Production Deployment Guide

### Option 1: Deploying to Render (Recommended for Full-Stack)
1. **Database**: Create a free PostgreSQL instance on [Render](https://render.com) or [Supabase](https://supabase.com). Copy the `DATABASE_URL`.
2. **Backend Web Service**:
   - Repository: Point to this repo.
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `PORT` = `5000`
     - `DATABASE_URL` = `<Your PostgreSQL URL>`
     - `JWT_SECRET` = `<Random secure secret>`
     - `CLIENT_URL` = `<Your frontend URL>`
3. **Frontend Static Site**:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     - `VITE_API_URL` = `https://your-backend.onrender.com/api`
     - `VITE_SOCKET_URL` = `https://your-backend.onrender.com`

### Option 2: Deploying to Railway / Fly.io / Vercel
- **Frontend (Vercel)**: Connect Git repo, set root directory to `client`, set `VITE_API_URL` and `VITE_SOCKET_URL` to your backend URL.
- **Backend (Railway/Fly.io)**: Connect Git repo, set root directory to `server`, provide environment variables (`DATABASE_URL`, `JWT_SECRET`).
