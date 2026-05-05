# The Blooming Branch Team — PRD

## Original Problem Statement
Modern, animated marketing + e-commerce site for The Blooming Branch Team — speech therapy, executive functioning, tutoring, early intervention, parent coaching, consulting, digital materials. Future: courses, physical products.

- **Tagline**: "Let's grow, speak, and bloom together."
- **Audience**: Parents, Educators, Therapists — ages 2–99.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). JWT/bcrypt admin auth. Emergent Stripe proxy for checkout. Emergent object storage for digital files + image uploads.
- **Frontend**: React 19 + React Router + Tailwind + shadcn/ui + Framer Motion + react-helmet-async. Cormorant Garamond + Manrope. Cream / cocoa / sage / dusty-rose palette.

## Implemented

### v1 (2026-02 — initial MVP)
- Marketing pages: Home, About, Services, Contact, Booking, Shop, ShopDetail, Checkout success.
- Stripe checkout via emergent proxy with DB-fallback polling + webhook.
- Admin login + dashboard (products CRUD + file upload), contacts, bookings.

### v1.1 (2026-05 — P1 batch 1)
- Orders/transactions tab with Reissue download link button (clipboard fallback).
- Blog/Journal section: public list, detail page, admin CRUD.
- Testimonials: public grid on Home, admin CRUD.
- Google Analytics 4 placeholder via `REACT_APP_GA_ID` env var + `useAnalytics()` hook.

### v1.2 (2026-05 — P1 batch 2)
- **SEO meta tags** on every public page via `react-helmet-async`: unique title, description, canonical, og:title/description/image, twitter:card. ShopDetail and BlogDetail use product/post names.
- **Sitemap** at `/api/sitemap.xml` — dynamic, includes static pages + all published blog posts + products. Forces `https` and uses `x-forwarded-host`.
- **robots.txt** at site root — disallows `/admin` and `/checkout/`, references the sitemap.
- **Image upload helper** for admin: `<ImageUploader />` component with file picker, preview, Replace, Remove, and URL fallback. Backend `/api/admin/uploads/image` (auth, 8 MB cap, image-MIME validation) + public `/api/uploads/{path:path}` serving.
- ImageUploader wired into Product, Blog, and Testimonial admin forms.

## Test Credentials
`/app/memory/test_credentials.md` — admin / bloom2026

## Tests
- 52/52 backend pytest tests passing (100%).
- Frontend: all critical flows verified across iterations 1, 2, 3.

## Prioritised Backlog
- **P0 (user)**: GA4 Measurement ID → drop into `REACT_APP_GA_ID` in `/app/frontend/.env`.
- **P0 (user)**: Resend API key + verified from-domain → wire booking/contact/post-purchase emails.
- **P1**: "More like this" recirculation block on blog detail; lead-magnet email opt-in on Home.
- **P1**: Webhook signature verification with Stripe webhook secret; ETag on uploads; `updated_at` on blog posts for sitemap lastmod.
- **P2**: Courses module (enrollments + lessons), physical products with shipping, multi-admin + RBAC.

## Known Notes
- Stripe emergent test proxy creates sessions on random test accounts → status retrieval can 404. Mitigated: status endpoint falls back to DB; webhook updates payment_status; polling resolves to download_token.
- Resend email **MOCKED / DEFERRED** — nothing is emailed yet.
- GA gated by env var — no calls fire until ID is set.
