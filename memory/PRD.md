# The Blooming Branch Team — PRD

## Original Problem Statement
Build a modern, clean, animated website for The Blooming Branch Team that provides consulting, speech therapy, executive skills functioning, tutoring, early intervention, parent coaching, therapy materials, digital materials, and physical products. Future: courses.

- **Tagline**: "Let's grow, speak, and bloom together."
- **Unique**: Blends clinical speech therapy with transformational coaching.
- **Audience**: Parents, Educators, Therapists — ages 2–99 (including adult executive functioning).

## Architecture
- **Backend**: FastAPI + MongoDB (motor). JWT (bcrypt) auth. Emergent Stripe proxy for checkout. Emergent object storage for digital files.
- **Frontend**: React 19 + React Router + Tailwind + shadcn/ui + Framer Motion. Cormorant Garamond serif + Manrope sans. Palette: cream / cocoa / sage / dusty-rose.

## Implemented

### v1 (2026-02 initial MVP)
- Marketing pages: Home, About, Services, Contact, Booking (form-only, no payment).
- Shop with Stripe checkout + email-link delivery (graceful DB fallback for emergent proxy quirk).
- Admin login + dashboard with product CRUD + file upload, contacts, bookings.
- Botanical SVG accents, scroll animations, glassmorphic header.

### v1.1 (2026-05 — P1)
- **Orders/transactions tab** in admin: list payment_transactions, copy download link, reissue download link button (mints new token).
- **Google Analytics** placeholder: `REACT_APP_GA_ID` env var; `useAnalytics()` hook fires GA4 page_view on route change. No-op if env var missing.
- **Blog/Journal section**: public list at `/blog`, detail at `/blog/:slug`, admin CRUD with title, slug auto-format, excerpt, content (light markdown), cover image, draft/publish.
- **Testimonials section**: public grid on Home page (after audiences, before CTA), admin CRUD with quote/name/role/image/rating/sort_order/published.
- Resilient clipboard fallback (textarea + execCommand) for browsers blocking navigator.clipboard.

## Test Credentials
`/app/memory/test_credentials.md` — admin / bloom2026

## Prioritised Backlog
- **P0 (user)**: Resend API key + verified from-domain → wire contact/booking auto-replies and post-purchase download emails.
- **P0 (user)**: GA4 Measurement ID → fill `REACT_APP_GA_ID` in `/app/frontend/.env`.
- **P1**: Webhook signature verification with Stripe webhook secret; SEO meta-tags per page; sitemap.xml + robots.txt; image upload helper for blog/testimonial covers.
- **P2**: Courses module (enrollments + lessons), physical products with shipping, lead-magnet email capture, multi-admin + roles.

## Notes
- Stripe emergent test proxy creates sessions on random test accounts → retrieval can fail. Handled: status endpoint falls back to DB; webhook updates DB; polling still resolves to download_token.
- Resend email **MOCKED / DEFERRED** — nothing is emailed yet.
- GA gated by env var — no calls fire until ID is set.
