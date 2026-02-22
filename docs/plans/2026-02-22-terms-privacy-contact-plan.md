# Terms, Privacy & Contact Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Terms of Service, Privacy Policy, and Contact Support pages with email delivery via Supabase Edge Function + Gmail SMTP.

**Architecture:** Three static pages under `app/terms/`, `app/privacy/`, `app/contact/`. Contact form POSTs to `app/api/contact/route.ts` which calls a Supabase Edge Function (`send-contact-email`) that sends email via SMTP. Footer links updated from `#` to real routes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 + SCSS, Zod validation, Supabase Edge Functions, Playwright E2E.

---

### Task 1: Update Footer Links

**Files:**
- Modify: `components/layout/footer.tsx`

**Step 1: Update default links**

Change the default `links` array in `footer.tsx` from `#` to real routes:

```tsx
links = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Contact Support', href: '/contact' },
],
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds (pages don't exist yet but links are valid Next.js routes)

**Step 3: Commit**

```bash
git add components/layout/footer.tsx
git commit -m "feat: update footer links to real routes"
```

---

### Task 2: Terms of Service Page

**Files:**
- Create: `app/terms/page.tsx`
- Test: `e2e/terms-privacy-contact.spec.ts`

**Step 1: Write the E2E test for Terms page**

Create `e2e/terms-privacy-contact.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Terms of Service', () => {
  test('renders Terms of Service page with all sections', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.getByRole('heading', { level: 1, name: /Terms of Service/i })).toBeVisible()
    await expect(page.getByText('Last updated')).toBeVisible()
    // Check key sections exist
    await expect(page.getByRole('heading', { name: /Agreement to Terms/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Limitation of Liability/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Contact/i })).toBeVisible()
  })

  test('footer link navigates to Terms page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Terms of Service' }).click()
    await expect(page).toHaveURL('/terms')
    await expect(page.getByRole('heading', { level: 1, name: /Terms of Service/i })).toBeVisible()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test e2e/terms-privacy-contact.spec.ts --grep "Terms"`
Expected: FAIL — page doesn't exist yet

**Step 3: Create Terms of Service page**

Create `app/terms/page.tsx` — a server component with static content. Use the `GlassCard` wrapper, `max-w-3xl` centered layout, prose typography. Include all 8 sections from the design doc. Reference "Toolk1t" as the service name, "loicwong1982@gmail.com" for contact email. Include `Last updated: February 2026` at top.

Add metadata export:
```tsx
export const metadata = {
  title: 'Terms of Service — Toolk1t',
  description: 'Terms of Service for Toolk1t, your free online toolkit.',
}
```

Content sections:
1. Agreement to Terms — using Toolk1t means you agree
2. Description of Service — free online tools (IP check, converters, editors, etc.)
3. User Responsibilities — no misuse, no automated scraping, no illegal use
4. Intellectual Property — Toolk1t owns the platform, user retains their uploaded content
5. Disclaimer of Warranties — "as is" basis, no guarantees
6. Limitation of Liability — not liable for damages from tool use
7. Changes to Terms — may update, continued use = acceptance
8. Contact Information — loicwong1982@gmail.com

**Step 4: Run test to verify it passes**

Run: `pnpm exec playwright test e2e/terms-privacy-contact.spec.ts --grep "Terms"`
Expected: PASS

**Step 5: Commit**

```bash
git add app/terms/page.tsx e2e/terms-privacy-contact.spec.ts
git commit -m "feat: add Terms of Service page with E2E tests"
```

---

### Task 3: Privacy Policy Page

**Files:**
- Create: `app/privacy/page.tsx`
- Modify: `e2e/terms-privacy-contact.spec.ts`

**Step 1: Add E2E tests for Privacy page**

Append to `e2e/terms-privacy-contact.spec.ts`:

```typescript
test.describe('Privacy Policy', () => {
  test('renders Privacy Policy page with all sections', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeVisible()
    await expect(page.getByText('Last updated')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Information We Collect/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Your Rights/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Contact/i })).toBeVisible()
  })

  test('footer link navigates to Privacy page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Privacy Policy' }).click()
    await expect(page).toHaveURL('/privacy')
    await expect(page.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeVisible()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test e2e/terms-privacy-contact.spec.ts --grep "Privacy"`
Expected: FAIL

**Step 3: Create Privacy Policy page**

Create `app/privacy/page.tsx` — same layout pattern as Terms. Include all 9 sections from design doc.

Add metadata:
```tsx
export const metadata = {
  title: 'Privacy Policy — Toolk1t',
  description: 'Privacy Policy for Toolk1t. Learn how we handle your data.',
}
```

Content sections:
1. Information We Collect — usage data (pages visited, time spent), form submissions (contact form), auth data (name, email via Supabase OAuth)
2. How We Use Information — improve tools, respond to inquiries, analytics
3. Cookies & Tracking — auth session cookies (Supabase), analytics cookies
4. Third-Party Services — Supabase (auth, database), Vercel (hosting), frankfurter.app (currency rates)
5. Data Retention — keep data as long as account active, delete on request
6. Your Rights — access, correct, delete your data; email loicwong1982@gmail.com
7. Children's Privacy — not intended for children under 13
8. Changes to Policy — may update, notify via site
9. Contact Information — loicwong1982@gmail.com

**Step 4: Run test to verify it passes**

Run: `pnpm exec playwright test e2e/terms-privacy-contact.spec.ts --grep "Privacy"`
Expected: PASS

**Step 5: Commit**

```bash
git add app/privacy/page.tsx e2e/terms-privacy-contact.spec.ts
git commit -m "feat: add Privacy Policy page with E2E tests"
```

---

### Task 4: Contact Form UI (Client Component)

**Files:**
- Create: `app/contact/page.tsx`
- Modify: `e2e/terms-privacy-contact.spec.ts`

**Step 1: Add E2E tests for Contact page**

Append to `e2e/terms-privacy-contact.spec.ts`:

```typescript
test.describe('Contact Support', () => {
  test('renders contact form with all fields', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByRole('heading', { level: 1, name: /Contact Support/i })).toBeVisible()
    await expect(page.getByLabel(/Name/i)).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Subject/i)).toBeVisible()
    await expect(page.getByLabel(/Message/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Send Message/i })).toBeVisible()
  })

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: /Send Message/i }).click()
    // Should show validation feedback (required fields)
    await expect(page.getByText(/required/i).first()).toBeVisible()
  })

  test('footer link navigates to Contact page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Contact Support' }).click()
    await expect(page).toHaveURL('/contact')
    await expect(page.getByRole('heading', { level: 1, name: /Contact Support/i })).toBeVisible()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `pnpm exec playwright test e2e/terms-privacy-contact.spec.ts --grep "Contact"`
Expected: FAIL

**Step 3: Create Contact page**

Create `app/contact/page.tsx` as a `'use client'` component with:

- GlassCard wrapper, `max-w-2xl` centered
- Form with 4 fields: Name, Email, Subject, Message (textarea)
- Zod schema for client-side validation:
  ```typescript
  const contactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  })
  ```
- State: `formData`, `errors`, `status` ('idle' | 'sending' | 'success' | 'error')
- On submit: validate with Zod, show field errors if invalid, POST to `/api/contact` if valid
- Success state: show "Message sent!" confirmation with a reset button
- Error state: show error message with retry
- Loading state: disable button, show spinner
- Styling: match existing tool page patterns (glass card, dark mode, Tailwind)
- Labels with `htmlFor`, inputs with `id` and `aria-describedby` for errors
- 44px minimum touch targets on mobile

**Step 4: Run tests to verify they pass**

Run: `pnpm exec playwright test e2e/terms-privacy-contact.spec.ts --grep "Contact"`
Expected: PASS (form renders, validation errors show — API submission test deferred to Task 5)

**Step 5: Commit**

```bash
git add app/contact/page.tsx e2e/terms-privacy-contact.spec.ts
git commit -m "feat: add Contact Support form page with validation"
```

---

### Task 5: Contact API Route

**Files:**
- Create: `app/api/contact/route.ts`

**Step 1: Create the API route**

Create `app/api/contact/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  // Validate body
  const body = await request.json().catch(() => null)
  const result = contactSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // Call Supabase Edge Function
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(result.data),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Edge function error:', errText)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/api/contact/route.ts
git commit -m "feat: add contact form API route with rate limiting"
```

---

### Task 6: Supabase Edge Function — send-contact-email

**Files:**
- Deploy: Supabase Edge Function `send-contact-email`

**Step 1: Deploy the Edge Function via Supabase MCP**

Use `mcp__supabase__deploy_edge_function` to deploy a function called `send-contact-email` with `verify_jwt: false` (it receives the anon key from our API route, but needs to be callable). The function:

- Receives JSON body: `{ name, email, subject, message }`
- Validates input
- Sends email using Deno's built-in SMTP or the `npm:nodemailer` package
- SMTP config from environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO_EMAIL`
- Sends to `loicwong1982@gmail.com`
- Sets Reply-To as the sender's email
- HTML email template with clean formatting

The edge function code:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465')
    const SMTP_USER = Deno.env.get('SMTP_USER')
    const SMTP_PASS = Deno.env.get('SMTP_PASS')
    const TO_EMAIL = Deno.env.get('CONTACT_TO_EMAIL') || 'loicwong1982@gmail.com'

    if (!SMTP_USER || !SMTP_PASS) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Use Deno's SMTP client
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts")
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: { username: SMTP_USER, password: SMTP_PASS },
      },
    })

    await client.send({
      from: SMTP_USER,
      to: TO_EMAIL,
      replyTo: email,
      subject: `[Toolk1t Contact] ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3D6AF2;">New Contact Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666;">Name:</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Subject:</td><td style="padding: 8px 0;">${subject}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <div style="white-space: pre-wrap; line-height: 1.6;">${message}</div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="color: #999; font-size: 12px;">Sent from Toolk1t Contact Form at ${new Date().toISOString()}</p>
        </div>
      `,
    })

    await client.close()

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Email send error:', err)
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
```

**Step 2: Set Edge Function secrets**

Set the following secrets on the Supabase project (via dashboard or CLI):
- `SMTP_HOST` = `smtp.gmail.com`
- `SMTP_PORT` = `465`
- `SMTP_USER` = (Gmail address or app-specific email)
- `SMTP_PASS` = (Gmail App Password — generate from Google Account > Security > App Passwords)
- `CONTACT_TO_EMAIL` = `loicwong1982@gmail.com`

**Note:** User must create a Gmail App Password. This requires 2FA enabled on the Google account. Go to: Google Account > Security > 2-Step Verification > App passwords.

**Step 3: Test the Edge Function**

Test manually via curl or the contact form. Verify email arrives at loicwong1982@gmail.com.

**Step 4: Commit** (no local files to commit — edge function deployed remotely)

---

### Task 7: End-to-End Integration Test

**Files:**
- Modify: `e2e/terms-privacy-contact.spec.ts`

**Step 1: Run all E2E tests**

Run: `pnpm exec playwright test e2e/terms-privacy-contact.spec.ts`
Expected: All tests pass (Terms, Privacy, Contact form rendering, validation, footer navigation)

**Step 2: Final commit if any test adjustments needed**

```bash
git add e2e/terms-privacy-contact.spec.ts
git commit -m "test: finalize E2E tests for terms, privacy, and contact pages"
```

---

## Task Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Update footer links | `components/layout/footer.tsx` |
| 2 | Terms of Service page + tests | `app/terms/page.tsx`, `e2e/terms-privacy-contact.spec.ts` |
| 3 | Privacy Policy page + tests | `app/privacy/page.tsx`, `e2e/terms-privacy-contact.spec.ts` |
| 4 | Contact form UI + validation + tests | `app/contact/page.tsx`, `e2e/terms-privacy-contact.spec.ts` |
| 5 | Contact API route + rate limiting | `app/api/contact/route.ts` |
| 6 | Supabase Edge Function for email | Deployed remotely |
| 7 | E2E integration test pass | `e2e/terms-privacy-contact.spec.ts` |
