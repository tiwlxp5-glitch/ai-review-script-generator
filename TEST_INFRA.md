# E2E Test Infra: ai-review-script-generator

## Test Philosophy
- Opaque-box, requirement-driven testing.
- Verify `/api/generate-script` and `/api/user-usage` API routes, `middleware.ts`, and Supabase client fallbacks under missing environment variables and Edge Runtime conditions.
- Primary acceptance criteria: Guarantee `Content-Type: application/json` and structured JSON error responses `{ "error": "..." }`, never HTML 500 pages.

## Feature Inventory & Test Coverage Goals
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|--------|:------:|:------:|:------:|:------:|
| 1 | Middleware Exception Protection | Requirement R2 | 5 | 5 | ✓ | ✓ |
| 2 | `/api/generate-script` Resilience | Requirement R1, R2 | 5 | 5 | ✓ | ✓ |
| 3 | `/api/user-usage` Resilience | Requirement R1, R2 | 5 | 5 | ✓ | ✓ |
| 4 | Supabase Client Fallback | Requirement R1 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test Suite Location: `tests/` or `__tests__/`
- Verification mechanism: API route handlers called with missing env vars (`GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) must return `Response` with status 400/500 and `headers.get('content-type') === 'application/json'`.
