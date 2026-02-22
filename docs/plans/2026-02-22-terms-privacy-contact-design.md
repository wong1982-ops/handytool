# Terms of Service, Privacy Policy & Contact Support — Design

**Date**: 2026-02-22
**Status**: Approved

## Overview

Add three new pages to Toolk1t: Terms of Service, Privacy Policy, and Contact Support. Legal pages contain generic but branded content. Contact page has a form that sends emails to loicwong1982@gmail.com via Supabase Edge Function + Gmail SMTP.

## Pages

| Page | Route | Purpose |
|------|-------|---------|
| Terms of Service | `/terms` | Generic SaaS terms with Toolk1t branding |
| Privacy Policy | `/privacy` | Generic privacy policy (cookies, data, third parties) |
| Contact Support | `/contact` | Form: Name, Email, Subject, Message → email delivery |

All pages reuse the existing site layout (Header + Footer). Content centered in `max-w-3xl` container.

## Contact Form

### Fields
- **Name** (text, required)
- **Email** (email, required, validated)
- **Subject** (text, required)
- **Message** (textarea, required, min 10 chars)

### Email Delivery Flow
```
User submits form
  → POST /api/contact (Next.js API route)
    → Zod validation
    → Rate limit check (5 req/IP/hour)
    → Calls Supabase Edge Function "send-contact-email"
      → Gmail SMTP → loicwong1982@gmail.com
    → Returns success/error
  → Toast feedback to user
```

### Rate Limiting
In-memory rate limit: 5 requests per IP per hour.

### Email Format
HTML email with:
- Sender name and email (set as Reply-To)
- Subject line
- Message body
- Timestamp

## Terms of Service Content Sections
1. Agreement to Terms
2. Description of Service
3. User Responsibilities
4. Intellectual Property
5. Disclaimer of Warranties
6. Limitation of Liability
7. Changes to Terms
8. Contact Information

## Privacy Policy Content Sections
1. Information We Collect
2. How We Use Information
3. Cookies & Tracking
4. Third-Party Services (Supabase, Vercel)
5. Data Retention
6. Your Rights
7. Children's Privacy
8. Changes to Policy
9. Contact Information

## Files Changed

| File | Action |
|------|--------|
| `app/terms/page.tsx` | New — Terms of Service page |
| `app/privacy/page.tsx` | New — Privacy Policy page |
| `app/contact/page.tsx` | New — Contact form page |
| `app/api/contact/route.ts` | New — API route for contact form |
| `components/layout/footer.tsx` | Edit — Update `#` links to real routes |
| Supabase Edge Function `send-contact-email` | New — Email delivery |

## Navigation
Footer links only (existing placeholders updated from `#` to real routes).

## Styling
- Glass card container matching existing tool pages
- Prose typography for legal content
- Mobile-first responsive
- Dark mode support
- CSS custom properties (`--tk-*`) for brand colors
