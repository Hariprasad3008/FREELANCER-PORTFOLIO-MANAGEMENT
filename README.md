# Full-Stack Freelancer Marketplace & Portfolio Directory

A production-ready, full-stack Freelancer Marketplace and Portfolio Directory with role-based access control (RBAC), normalized 16-table PostgreSQL / Supabase database schema, JWT authentication, proposal bidding lifecycle, and real-time Socket.IO chat engine.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v7, Lucide Icons, TanStack Query v5, Axios, Socket.IO Client.
- **Backend**: Node.js (ES Modules), Express.js, Socket.IO, `pg` (node-postgres), `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`.
- **Database**: PostgreSQL / Supabase with 16 normalized relational tables, foreign key cascades, and performance indexes.

---

## 🗄️ Database Schema (16 Tables)

1. **`users`**: Base identity (`id BIGINT PK`, `name`, `email UNIQUE`, `password_hash`, `age`, `gender`, `role: 'CLIENT' | 'FREELANCER'`, `bio`, `avatar_url`, timestamps).
2. **`freelancer_profiles`**: 1-to-1 with `users` (`user_id`, `title`, `hourly_rate`, `experience_years`, `experience_level`, `location`, `availability_status`, `response_time_minutes`, `projects_completed`, `success_rate`, `average_rating`).
3. **`client_profiles`**: 1-to-1 with `users` (`user_id`, `company_name`, `company_location`, `company_description`, `website`).
4. **`skills`**: Normalized skills catalog (`id`, `name UNIQUE`).
5. **`freelancer_skills`**: Many-to-many (`freelancer_id`, `skill_id`).
6. **`portfolio_projects`**: Freelancer project showcases (`freelancer_id`, `title`, `description`, `project_url`, `image_url`).
7. **`projects`**: Client job listings (`client_id`, `title`, `description`, `category`, `budget_min`, `budget_max`, `budget_type`, `deadline`, `status`).
8. **`project_skills`**: Many-to-many required skills (`project_id`, `skill_id`).
9. **`proposals`**: Freelancer bids on projects (`project_id`, `freelancer_id`, `cover_letter`, `bid_amount`, `estimated_days`, `status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'`).
10. **`contracts`**: Active/completed hire contracts (`project_id`, `proposal_id`, `client_id`, `freelancer_id`, `agreed_amount`, `start_date`, `end_date`, `status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'`).
11. **`reviews`**: Verified client feedback linked to contracts (`contract_id`, `client_id`, `freelancer_id`, `rating: 1-5`, `comment`).
12. **`saved_projects`**: Freelancers bookmarking gigs (`freelancer_id`, `project_id`).
13. **`saved_freelancers`**: Clients bookmarking talent (`client_id`, `freelancer_id`).
14. **`conversations`**: Chat channels (`project_id`, `created_at`, `last_message_at`).
15. **`conversation_participants`**: Users in chat channels (`conversation_id`, `user_id`, `last_read_at`).
16. **`messages`**: Real-time chat messages (`conversation_id`, `sender_id`, `body`, `created_at`, `read_at`).

---

## 🚀 Quick Start Guide

### 1. Configure Supabase PostgreSQL

In `server/.env`, set your Supabase `DATABASE_URL`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=super_secret_jwt_key_freelancer_marketplace_2026_secure

# Supabase PostgreSQL Connection String (Pooler or Direct)
DATABASE_URL=postgresql://postgres.your-project-ref:your-db-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### 2. Run Database Migrations & Rich Seeder

```bash
# Run schema migration (creates all 16 normalized tables and indexes)
npm run db:migrate

# Seed database with sample users, profiles, skills, gigs, proposals, contracts, reviews, and messages
npm run db:seed
```

### 3. Start Development Servers

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Accounts

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Freelancer** | `freelancer@demo.com` | `demo123` | Submit proposals/bids, upload portfolio projects, real-time client chat, bookmark gigs |
| **Client** | `client@demo.com` | `demo123` | Post project gigs, review & accept proposals (hire), submit verified reviews, chat with talent |
