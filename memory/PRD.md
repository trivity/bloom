# The Blooming Branch Team — PRD

## Original Problem Statement
Build a modern, clean, animated website for The Blooming Branch Team that provides consulting, speech therapy, executive skills functioning, tutoring, early intervention, parent coaching, therapy materials, digital materials, and physical products. Future: courses.

- **Tagline**: "Let's grow, speak, and bloom together."
- **Unique**: Blends clinical speech therapy with transformational coaching.
- **Pages**: Home · About · Services · Contact · Booking · Shop (Digital Downloads).
- **Audience**: Parents, Educators, Therapists — ages 2–99 (including adult executive functioning).

## User Choices (Feb 2026)
1. Booking page → contact/request form only (no payment).
2. Shop page → Stripe checkout + post-purchase email download link.
3. Admin → manage products (simple user/pass auth).
4. Resend email integration → deferred; contact/booking save to DB for now.
5. Stripe test key pre-configured in backend env.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). JWT (bcrypt) auth. Emergent Stripe proxy for checkout. Emergent object storage for digital files. Startup seeds 1 admin + 4 demo products.
- **Frontend**: React 19 + React Router + Tailwind + shadcn/ui + Framer Motion. Cormorant Garamond serif + Manrope sans. Palette: cream (#F5EFE5) / cocoa brown (#4A3A28) / sage green (#8A9A86) / dusty rose (#D4B8B1).

## Implemented (2026-02 initial)
- Home with editorial hero, values band, services grid, unique band, audiences, CTA.
- About with story, values, ages band.
- Services with 7 services (speech, executive functioning, tutoring, early intervention, parent coaching, materials, consulting).
- Contact form → DB.
- Booking form → DB (no payment).
- Shop: product list, filter by category, product detail with Stripe checkout.
- Checkout success page polling + download link via time-limited token.
- Admin login + dashboard (products CRUD + file upload + contacts + bookings).
- Sticky glassmorphic header, botanical SVG accents, scroll-reveal animations.
- Graceful Stripe status polling (falls back to DB state + webhook-driven updates).

## Test Credentials
`/app/memory/test_credentials.md` — admin / bloom2026

## Prioritised Backlog (P0 → P2)
- **P0 (user to provide)**: Resend API key → wire contact/booking confirmations and post-purchase download email.
- **P1**: Full Stripe live mode (custom key), webhook signature verification, email-delivery of download links, Google Analytics.
- **P1**: Admin orders tab (list all payment_transactions with download-token re-issue).
- **P2**: Physical products with shipping fields, courses module (enrollments + lessons), testimonials section, blog.
- **P2**: Multi-admin + role-based access, SEO meta per page, sitemap.xml.

## Known Notes
- Stripe emergent test proxy can create sessions but cannot reliably retrieve them (random test accounts per request). Mitigated: status endpoint falls back to DB state; webhook (POST /api/webhook/stripe) updates DB on completion — frontend polling still works end-to-end.
- Resend email **MOCKED / DEFERRED** — nothing is emailed yet; all submissions are saved to DB.
