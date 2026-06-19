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

## Deploy (GitHub Pages)

**One-time setup:**

1. Push this repo to GitHub (`jefftrevino/venn`)
2. Add three repository secrets at **Settings → Secrets and variables → Actions**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — found in your Supabase project under **Settings → API → service_role**
3. Enable GitHub Pages at **Settings → Pages → Source: GitHub Actions**
4. Visit `https://jefftrevino.github.io/venn/`

After that, every push to `main` deploys automatically. The live app will be at:

```
https://jefftrevino.github.io/venn/
```

**Deploying a revision:**

```bash
git add .
git commit -m "your message"
git push
```

GitHub Actions builds and deploys automatically. Watch progress at `github.com/jefftrevino/venn/actions`.

**Deploying a schema change:**

```bash
supabase db reset --linked   # wipe and reapply 001_init.sql to the live DB
```

**Deploying an edge function change:**

```bash
supabase functions deploy suggest
```

## Data retention

Teams older than 7 days are deleted automatically every night at 3 AM UTC by `.github/workflows/cleanup.yml`. Deleting a team cascades to its participants, items, and results. To change the TTL, edit the `'7 days ago'` string in that workflow and push.
