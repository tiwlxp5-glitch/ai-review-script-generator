# Project: ai-review-script-generator - Cloudflare Edge 500 Fix

## Architecture
- **Framework**: Next.js 14 (App Router) deployed to Cloudflare Edge Runtime via Cloudflare Pages / `@cloudflare/next-on-pages`
- **Database & Auth**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **AI Service**: Google Gemini API (`@google/generative-ai`)
- **Middleware**: `middleware.ts` intercepting all routes for session update

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Middleware Error Boundary | Wrap Supabase session update in `middleware.ts` with try-catch to prevent uncaught exceptions on missing env vars from returning Cloudflare HTML 500 | M1 | survey |
| 2 | Supabase Client Validation | Validate `NEXT_PUBLIC_SUPABASE_URL` and keys in `lib/supabase/server.ts` before instantiation to prevent runtime throws | M1 | survey |
| 3 | `/api/generate-script` Guarding | Top-level try-catch, fail-fast `GEMINI_API_KEY` & payload validation, guaranteed `Content-Type: application/json` | M2 | survey |
| 4 | `/api/user-usage` Guarding | Top-level try-catch, fallback free-tier payload on error, guaranteed `Content-Type: application/json` | M2 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Edge Middleware & Supabase Guarding | `middleware.ts`, `lib/supabase/server.ts` | none | DONE |
| 2 | M2: API Route Hardening & Error Payloads | `app/api/generate-script/route.ts`, `app/api/user-usage/route.ts` | M1 | DONE |

## Interface Contracts
### Middleware ↔ API Routes / Edge Runtime
- `middleware.ts` MUST catch any exception during `createServerClient` or `supabase.auth.getUser()`.
- If an exception occurs in `middleware.ts` on an `/api/` request, it must return a clean `Response.json({ error: "Server Configuration Error: Missing environment variables" }, { status: 500, headers: { "Content-Type": "application/json" } })` or pass control to the API route without crashing.

### API Routes ↔ Frontend
- `/api/generate-script` and `/api/user-usage` MUST guarantee that every response (success or failure) returns `Content-Type: application/json`.
- Missing `GEMINI_API_KEY` must return `{ "error": "Missing GEMINI_API_KEY" }` with status 500 (or 400 if user client error).

## Code Layout
- `middleware.ts` - Top-level Next.js Edge middleware
- `lib/supabase/server.ts` - Server-side Supabase client helpers
- `app/api/generate-script/route.ts` - API route for generating script via Gemini
- `app/api/user-usage/route.ts` - API route for querying user subscription / usage limits
