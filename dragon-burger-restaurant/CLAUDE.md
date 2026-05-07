# Dragon Burger Restaurant — Management System

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Deployment:** Vercel

## Supabase Project
- **URL:** https://gnhemfikofnzpemgnqdv.supabase.co
- **Project:** Dragon Burger Restaurant

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` ✅ already set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ already set
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Get from Supabase Dashboard → Settings → API → service_role key
- `NEXT_PUBLIC_OWNER_PHONE` — your phone number
- `NEXT_PUBLIC_APP_NAME` — Dragon Burger Restaurant

### 2. Run SQL Schema
Go to Supabase Dashboard → SQL Editor → paste contents of `supabase/schema.sql` → Run

### 3. Create Admin User
Supabase Dashboard → Authentication → Users → Add User
- Email: your admin email
- Password: your password
- Disable "Confirm email" in Auth settings

### 4. Enable Realtime
Supabase Dashboard → Database → Replication → Enable `orders` table

### 5. Install & Run
```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo on vercel.com
3. Add environment variables
4. Deploy

## Admin: Deactivate Account
- Supabase Dashboard → Table Editor → `account_status`
- Set `is_active = false` to instantly lock
- Set `expires_at` to schedule auto-shutdown

## Features
- 📋 Real-time order overview
- ➕ New order with delivery support
- 📑 Full order history with filters
- 📊 Reports with CSV export
- 💳 Udhaar (credit) tracking
- 🏷️ Menu editor with live updates
