# ahna.ae

Turn your Google Maps listing into a beautiful one-page website in seconds.

## Stack

- **Framework** — Next.js 16 (App Router)
- **Styling** — Tailwind CSS v4
- **Database / Auth** — Supabase
- **Deployment** — Vercel
- **AI** — Groq (Llama 3.3 70B) for tagline / description generation
- **Places data** — Google Places API

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GOOGLE_PLACES_API_KEY` | Google Places API key (server-side) |
| `GROQ_API_KEY` | Groq API key for AI fill |

## Project structure

```
src/
  app/
    api/          # API routes (ai-fill, auth, business, places)
    auth/         # Login, forgot-password pages
    dashboard/    # Business editor dashboard
    site/[slug]/  # Public business page
  components/
    site/         # Public page components (hero, slider, reviews…)
    ui/           # Shared UI primitives
  lib/            # Supabase clients, utilities
```

## Deployment

Deploy on Vercel — connect your GitHub repo, add the environment variables in Vercel project settings, done.

Build command: `next build`
Output directory: `.next` (default)
