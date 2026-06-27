# كويك ديل (QD) — Quick Deal Finance Solutions

Next.js 14 + Supabase web application — bilingual AR/EN, RTL-first.

## 🚀 Deploy to Vercel in 3 steps

### 1 — Set up Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste `supabase/schema.sql` → **Run**
3. Copy **Project URL** and **anon public key** from Project Settings → API

### 2 — Configure environment
```bash
cp .env.example .env.local
# Fill in your Supabase values:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3 — Install & deploy
```bash
npm install --legacy-peer-deps
npm run build          # verify build passes
vercel --prod          # or push to GitHub and connect Vercel
```

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/apply` | 3-step application form |
| `/portal` | Client application status portal |
| `/login` | Admin/staff login |
| `/admin` | Applications list + management |
| `/admin/applications/[id]` | Application details + notes |
| `/admin/staff` | Staff management |
| `/admin/access-requests` | PII access request approvals |
| `/admin/analytics` | KPIs and charts |
| `/setup-demo` | First admin account setup |

## Tech stack

- **Framework:** Next.js 14 App Router, TypeScript
- **Database/Auth:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS v3 + shadcn/ui
- **Language:** RTL-first, bilingual AR/EN
