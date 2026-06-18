# Overlap

A collaborative Venn diagram tool. Create a team, share one link, and let everyone fill in their own circle. An AI suggestion card appears at the intersection once two or more people have added items.

Built with React + Vite, Supabase (Postgres, Realtime, Edge Functions), and Claude Haiku.

## Prerequisites

- Node.js (v18+)
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment**

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

**3. Run the database migration**

In your Supabase project, open the SQL Editor, paste the contents of `supabase/migrations/001_init.sql`, and run it.

**4. Deploy the edge function**

```bash
supabase login
supabase link
supabase secrets set ANTHROPIC_API_KEY=your-anthropic-key
supabase functions deploy suggest
```

## Development

```bash
npm run dev
```

App runs at `http://localhost:5173`.
