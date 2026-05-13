# Syrflow — Turn Google Maps Into a Beautiful Website

Transform your Google Maps business listing into a stunning one-page website in seconds. No coding required. Built with Next.js, Supabase, and AI-powered content generation.

**Live:** [syrflow.com](https://syrflow.com)

---

## 🎯 Features

- **One-Click Setup** — Import from Google Maps URL, get a live site in 60 seconds
- **AI-Generated Content** — Automatic taglines, descriptions, and service suggestions (Groq LLaMA 3.3)
- **Multi-Tenant Architecture** — Each business gets its own subdomain (e.g., `mybiz.syrflow.com`)
- **Image Management** — Upload, organize, and display images on Cloudflare R2
- **Customization** — Theme colors, layout options, business hours, testimonials
- **Mobile-First Design** — Responsive, dark mode, RTL support (English + Arabic)
- **Analytics Ready** — Vercel cron jobs for Supabase keep-alive pings
- **Rate-Limited APIs** — Protect against abuse with per-user rate limiting

---

## 📊 Architecture

### Request Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE (Middleware)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Subdomain routing (slug.syrflow.com → /site/slug)  │   │
│  │ • App subdomain redirect (app.syrflow.com → /dash)   │   │
│  │ • Security headers (CSP, X-Frame-Options, etc)       │   │
│  │ • Route all /site/* to NextResponse.rewrite()        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────────┐
        │      NEXT.JS SERVER (Vercel Functions)    │
        │                                           │
        │  ┌──────────────────────────────────────┐ │
        │  │ Protected Routes (Auth Required)     │ │
        │  │ • /dashboard - Business editor       │ │
        │  │ • /api/business - CRUD operations    │ │
        │  │ • /api/upload - R2 presigned URLs    │ │
        │  │ • /api/ai-fill - Content generation  │ │
        │  │ • /api/delete-account - User cleanup │ │
        │  └──────────────────────────────────────┘ │
        │                                           │
        │  ┌──────────────────────────────────────┐ │
        │  │ Public Routes (No Auth)              │ │
        │  │ • /site/[slug] - Business pages      │ │
        │  │ • / - Marketing site                 │ │
        │  │ • /register - Sign up                │ │
        │  │ • /auth/login - Login page           │ │
        │  └──────────────────────────────────────┘ │
        │                                           │
        │  ┌──────────────────────────────────────┐ │
        │  │ Public APIs (Rate-Limited)           │ │
        │  │ • /api/places - Google Maps import   │ │
        │  │ • /api/search-images - Pexels        │ │
        │  │ • /api/ping - Health check           │ │
        │  └──────────────────────────────────────┘ │
        └───────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────────┐
        │           External Services                │
        ├───────────────────────────────────────────┤
        │ • Supabase (Auth, Database, Storage)      │
        │ • Cloudflare R2 (Image Storage)           │
        │ • Google Places API (Business Data)       │
        │ • Groq API (AI - Llama 3.3 70B)           │
        │ • Pexels API (Stock Images)               │
        └───────────────────────────────────────────┘
```

### Data Flow
```
User Registration Flow:
┌─────────────┐
│   /register │ (Client-side form)
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────────┐
│  Supabase Auth.signUp()                  │
│  • Email validation                      │
│  • Password hashing                      │
│  • Session cookie creation               │
└──────┬───────────────────────────────────┘
       │
       ↓
  ┌────────────────────────────────────┐
  │  businesses table (empty)          │
  │  users → 1:N → businesses         │
  └────────────────────────────────────┘

Business Creation Flow:
┌──────────────┐
│  /dashboard  │ (Authenticated user)
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────────┐
│  POST /api/places (Google Maps import)   │
│  • User auth verified                    │
│  • Rate limit: 5/hour                    │
│  • Fetch place details                   │
│  • Generate hero image from category     │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│  POST /api/ai-fill (Content generation)  │
│  • Groq LLaMA 3.3 70B                    │
│  • Generate tagline (250-300 chars)      │
│  • Generate description (350-400 chars)  │
│  • Generate services with descriptions   │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│  POST /api/business (Save to DB)         │
│  • User auth verified                    │
│  • Rate limit: 5/hour                    │
│  • Validate & sanitize inputs            │
│  • Store in businesses table             │
└──────┬───────────────────────────────────┘
       │
       ↓
  ┌────────────────────────────────────┐
  │  businesses table                  │
  │  {                                 │
  │    id: uuid                        │
  │    user_id: uuid                   │
  │    slug: string (unique)           │
  │    name, tagline, description      │
  │    gallery: url[]                  │
  │    services: json[]                │
  │    theme_color, corner_radius      │
  │    ...                             │
  │  }                                 │
  └────────────────────────────────────┘

Public Site Flow:
┌─────────────────────────────────┐
│  slug.syrflow.com (subdomain)   │
└──────┬──────────────────────────┘
       │
       ↓ (Middleware rewrites to /site/slug)
       │
┌──────────────────────────────────────────┐
│  GET /site/[slug]                        │
│  • No auth required                      │
│  • Query businesses table by slug        │
│  • Fetch business data                   │
│  • Render template with business data    │
└──────┬───────────────────────────────────┘
       │
       ↓
  ┌────────────────────────────────────┐
  │  Rendered HTML (next/image, SSR)   │
  │  • Hero with image from gallery    │
  │  • Business info (name, phone, etc)│
  │  • Service cards                   │
  │  • Testimonials                    │
  │  • Contact CTA                     │
  │  • Theme colors applied            │
  └────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (root)
│   │   ├── layout.tsx              # Root layout (theme, language provider)
│   │   ├── page.tsx                # Marketing homepage
│   │   └── globals.css             # Tailwind, global styles
│   │
│   ├── api/                        # API routes (all route handlers)
│   │   ├── ai-fill/route.ts        # AI content generation (Groq)
│   │   ├── auth/callback/          # OAuth callback handler
│   │   ├── business/route.ts       # CRUD: create, read, update business
│   │   ├── delete-account/         # Account deletion (admin)
│   │   ├── delete-image/           # Delete image from R2
│   │   ├── facebook/data-deletion/ # Facebook DSR compliance
│   │   ├── ping/route.ts           # Health check (Vercel cron)
│   │   ├── places/                 # Google Maps import
│   │   │   ├── route.ts            # Main endpoint
│   │   │   └── preview/route.ts    # Preview before save
│   │   ├── search-images/route.ts  # Pexels image search
│   │   ├── set-slug/route.ts       # Update business slug
│   │   └── upload/route.ts         # R2 presigned URL generation
│   │
│   ├── auth/
│   │   ├── login/page.tsx          # Login form
│   │   ├── forgot-password/        # Password recovery
│   │   └── layout.tsx              # Auth pages layout
│   │
│   ├── dashboard/
│   │   ├── page.tsx                # Server component (auth check)
│   │   ├── DashboardClient.tsx     # Main editor (client-side)
│   │   └── layout.tsx              # Dashboard layout
│   │
│   ├── site/[slug]/
│   │   ├── page.tsx                # Public business site
│   │   ├── layout.tsx              # Business site metadata
│   │   └── SiteClient.tsx          # Rendered business page
│   │
│   ├── register/page.tsx           # Signup form (Facebook + email)
│   ├── contact/page.tsx            # Contact form
│   ├── pricing/page.tsx            # Pricing page
│   ├── privacy-policy/page.tsx     # Legal docs
│   ├── terms/page.tsx              #
│   ├── refund/page.tsx             #
│   ├── middleware.ts               # Subdomain routing, security headers
│   └── ...
│
├── components/
│   ├── site/                       # Business site components
│   │   ├── SiteHero.tsx            # Hero section with image
│   │   ├── SiteServices.tsx        # Services grid
│   │   ├── SiteTestimonials.tsx    # Reviews carousel
│   │   ├── SiteContact.tsx         # Contact section
│   │   └── ...
│   ├── ui/                         # Shared UI primitives
│   │   ├── Button.tsx              # shadcn/ui button
│   │   ├── Input.tsx               # shadcn/ui input
│   │   ├── Card.tsx                # shadcn/ui card
│   │   └── ...
│   ├── ImageSearchPicker.tsx       # Pexels image picker
│   ├── ThemeProvider.tsx           # Dark/light mode context
│   └── ...
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # SSR client (for server components)
│   │   └── client.ts               # Browser client (for use client)
│   ├── places.ts                   # Google Places API fetcher
│   ├── why-us.ts                   # "Why Us" section generator
│   ├── rate-limit.ts               # Per-user rate limiting
│   ├── use-rate-limit.ts           # Client-side rate limit UI
│   ├── language.tsx                # i18n (English + Arabic)
│   ├── images.ts                   # Default category images
│   ├── utils.ts                    # clsx, cn utilities
│   └── ...
│
├── styles/
│   └── globals.css                 # Global Tailwind
│
└── types/
    ├── database.ts                 # Supabase schema types
    └── ...

public/
├── favicon.ico                     # Icons & manifests
├── social-icons/                   # Brand logos
├── fonts/                          # Preloaded fonts
└── ...

config files:
├── .env.local.example              # Environment template
├── next.config.ts                  # Next.js config (images, redirects)
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind CSS config
├── vercel.json                     # Vercel cron jobs
└── .npmrc                          # NPM config (legacy-peer-deps)
```

---

## 🔐 Authentication & Authorization

```
┌─────────────────────────────────────┐
│  Authentication Methods             │
├─────────────────────────────────────┤
│ 1. Email/Password (Supabase Auth)   │
│    • Sign up: /register             │
│    • Login: /auth/login             │
│    • Password reset: /auth/forgot   │
│                                     │
│ 2. Facebook OAuth (optional)        │
│    • Sign up with Facebook on       │
│      /register page                 │
│    • Fallback to email if rejected  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Authorization Levels               │
├─────────────────────────────────────┤
│ PUBLIC                              │
│ • / (home)                          │
│ • /site/[slug] (business pages)     │
│ • /register, /auth/login            │
│ • /pricing, /privacy-policy, etc    │
│                                     │
│ AUTHENTICATED                       │
│ • /dashboard (business editor)      │
│ • /api/business (CRUD)              │
│ • /api/upload, /api/delete-image    │
│ • /api/ai-fill, /api/places         │
│                                     │
│ RATE-LIMITED (per user/IP)          │
│ • /api/business (5/hour)            │
│ • /api/places (5/hour)              │
│ • /api/ai-fill (varies by field)    │
│ • /api/upload (30/hour)             │
│ • /api/delete-image (60/hour)       │
│ • /api/delete-account (3/day)       │
└─────────────────────────────────────┘

Session Flow:
┌────────────┐
│ Supabase   │ creates session → HTTP-only cookie
│ Auth       │ (sb-{project}-auth-token)
└────────────┘
       ↓
Supabase SSR Client:
┌────────────────────────────────────┐
│ createServerClient() reads cookie   │
│ Validates session                  │
│ Refreshes token if needed          │
└────────────────────────────────────┘
```

---

## 📦 API Routes

### Public APIs

#### `GET /api/search-images`
Search for stock images from Pexels
```
Query: ?query=restaurant&page=1&perPage=12
Returns: { photos: [], total_results, page, per_page }
Rate limit: None (public)
```

#### `GET /api/ping`
Health check for Vercel cron jobs
```
Returns: { ok: true }
Used by: Vercel cron every 5 minutes (keeps Supabase connection alive)
```

### Protected APIs (Auth Required)

#### `POST /api/places`
Import business data from Google Maps URL
```
Body: { mapsUrl: string }
Returns: { id, slug, name, category, hero_image, gallery, ... }
Rate limit: 5 per hour per user
Validates: Google Maps URL format
Fetches: Place details from Google Places API
```

#### `POST /api/business`
Create or update business
```
Body: {
  name, tagline, description,
  phone, email, website,
  hero_image, gallery, about_image,
  hours, services, testimonials,
  theme_color, corner_radius,
  stat_years, stat_clients, stat_projects
}
Returns: { id, slug, ... }
Rate limit: 5 per hour per user
Validates: All inputs sanitized, max lengths enforced
```

#### `POST /api/upload`
Get presigned URL for R2 image upload
```
Body: { filename, contentType, size }
Returns: { presignedUrl, publicUrl }
Rate limit: 30 per hour per user
Validates: Image type (JPEG, PNG, WebP, GIF), max 5 MB
Signs: URL valid for 120 seconds
```

#### `DELETE /api/delete-image`
Remove image from R2
```
Body: { url: string (R2 public URL) }
Returns: { ok: true }
Rate limit: 60 per hour per user
Validates: User ownership (must be in user's folder)
```

#### `POST /api/ai-fill`
Generate content using Groq Llama 3.3 70B
```
Body: {
  field: "tagline" | "description" | "service_title" | "service_description",
  category: string,
  name: string,
  tagline?: string,
  serviceTitle?: string
}
Returns: { content: string, tokens: number }
Rate limit: Varies per field
Validates: Minimum text length, API key available
```

#### `DELETE /api/delete-account`
Delete user account and all related data
```
Returns: { ok: true }
Rate limit: 3 per day per user
Action: Deletes all businesses, media, and user record (requires service role)
```

#### `POST /api/set-slug`
Update business slug (URL identifier)
```
Body: { businessId, newSlug }
Returns: { slug: string }
Validates: Slug format, uniqueness
```

---

## 🌍 Database Schema (Supabase)

```sql
-- users (managed by Supabase Auth)
id: UUID (primary key)
email: string
created_at: timestamp

-- businesses
CREATE TABLE businesses (
  id: UUID (primary key),
  user_id: UUID (foreign key → users.id),
  slug: string (unique, indexed),
  
  -- Business Info
  name: string (max 100 chars),
  category: string,
  tagline: string (max 300 chars),
  description: string (max 400 chars),
  
  -- Contact
  phone: string,
  email: string,
  website: string,
  
  -- Images
  hero_image: string (R2 URL),
  about_image: string (R2 URL),
  gallery: string[] (R2 URLs),
  
  -- Content
  hours: JSON (business hours),
  services: JSON[] (name, description, price),
  testimonials: JSON[] (author, text, rating),
  social: JSON (Facebook, Instagram, etc),
  
  -- Customization
  theme_color: string (hex),
  corner_radius: number (0-32),
  
  -- Stats
  stat_years: number,
  stat_clients: number,
  stat_projects: number,
  
  -- Metadata
  created_at: timestamp,
  updated_at: timestamp
);

-- Indexes
CREATE INDEX businesses_user_id ON businesses(user_id);
CREATE INDEX businesses_slug ON businesses(slug);
CREATE UNIQUE INDEX businesses_slug_unique ON businesses(slug);
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone repository**
```bash
git clone https://github.com/yourusername/syrflow.git
cd syrflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# APIs
GOOGLE_PLACES_API_KEY=your-key
GROQ_API_KEY=your-key
PEXELS_API_KEY=your-key

# R2 Storage (Cloudflare)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET_NAME=syrflow
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Domain
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

4. **Start dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build & Deploy

**Local build:**
```bash
npm run build
npm start
```

**Deploy to Vercel:**
1. Push to GitHub
2. Connect repo in [Vercel dashboard](https://vercel.com)
3. Add environment variables in project settings
4. Deploy!

**Configure wildcard subdomains:**
1. Go to **Vercel Dashboard → Project → Settings → Domains**
2. Add your domain (e.g., `syrflow.com`)
3. Enable wildcard: `*.syrflow.com`
4. DNS records will be auto-configured

---

## 📋 Environment Variables Reference

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | string | Supabase project URL | `https://abc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | string | Public Supabase key | `eyJh...` |
| `SUPABASE_SERVICE_ROLE_KEY` | string | Admin key (server-only) | `eyJh...` |
| `GOOGLE_PLACES_API_KEY` | string | Google Places API key | `AIza...` |
| `GROQ_API_KEY` | string | Groq API key | `gsk_...` |
| `PEXELS_API_KEY` | string | Pexels API key | `563492...` |
| `R2_ACCOUNT_ID` | string | Cloudflare R2 account ID | `abc123` |
| `R2_ACCESS_KEY_ID` | string | R2 access key | `12345...` |
| `R2_SECRET_ACCESS_KEY` | string | R2 secret key | `abc123...` |
| `R2_BUCKET_NAME` | string | R2 bucket name | `syrflow` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | string | R2 public URL prefix | `https://pub-xxx.r2.dev` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | string | Root domain | `syrflow.com` |
| `SCRAPER_URL` | string | Google Maps scraper URL | `http://localhost:8080` |

---

## 🔒 Security

- **Rate Limiting** — Per-user, per-endpoint rate limits prevent abuse
- **Input Validation** — All inputs sanitized and validated server-side
- **File Uploads** — Type & size restrictions, stored securely on R2
- **Authentication** — Supabase SSR client with secure HTTP-only cookies
- **CORS** — Security headers set in middleware
- **Session** — Auto-refreshing, expires after inactivity
- **Admin Operations** — Service role key used server-side only (never exposed)

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router, SSR, SSG) |
| **Runtime** | Node.js (Vercel Functions) |
| **Styling** | Tailwind CSS v4, shadcn/ui components |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Email + OAuth) |
| **File Storage** | Cloudflare R2 (S3-compatible) |
| **AI** | Groq LLaMA 3.3 70B |
| **APIs** | Google Places, Pexels |
| **Image Optimization** | Next.js Image component |
| **Deployment** | Vercel |
| **Language** | TypeScript, React 19 |

---

## 📖 Key Features Explained

### 1. **Subdomain Routing**
Each business gets a unique subdomain:
```
slug.syrflow.com → /site/slug (rewritten in middleware)
Middleware pattern matches: *.syrflow.com
```

### 2. **AI Content Generation**
Uses Groq's Llama 3.3 70B model to generate:
- **Tagline** (250-300 chars): Hook describing the business
- **Description** (350-400 chars): Detailed "About Us" paragraph
- **Service Names**: Quick service title suggestions
- **Service Descriptions** (150 chars fixed): Specific service details

### 3. **Image Management**
- Upload to R2: Presigned URL generation (120s valid)
- Optimize: Next.js Image with automatic sizing
- Delete: Remove from R2 with user ownership verification
- Gallery: Multiple images per business

### 4. **Multi-Tenant**
- Row-level security (Supabase RLS) ensures users see only their data
- Slug-based isolation on public sites
- Subdomain routing in middleware handles tenant routing

---

## 🐛 Troubleshooting

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`
- Check TypeScript: `npx tsc --noEmit`

### Supabase Connection
- Verify keys in `.env.local`
- Check Supabase project is active
- Ensure API is enabled in Supabase dashboard

### R2 Upload Issues
- Verify account ID and keys
- Check bucket name
- Ensure CORS is configured in R2

### Subdomain Not Working
- Add wildcard domain to Vercel dashboard
- Update DNS records (Vercel will show required records)
- Wait for DNS propagation (up to 48 hours)

---

## 📞 Support & Resources

- **Next.js Docs** — [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs** — [supabase.io/docs](https://supabase.io/docs)
- **Tailwind** — [tailwindcss.com](https://tailwindcss.com)
- **Vercel** — [vercel.com/docs](https://vercel.com/docs)
- **TypeScript** — [typescriptlang.org](https://www.typescriptlang.org)

---

## 📄 License

MIT License — See LICENSE file for details

---

**Made with ❤️ for small businesses**
