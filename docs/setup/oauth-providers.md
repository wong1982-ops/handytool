# OAuth Provider Setup Guide

This guide covers how to configure Google and Facebook OAuth for HandyTool using Supabase Authentication.

---

## 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project or select an existing one.
3. In the left sidebar, navigate to **APIs & Services** → **Library**.
4. Search for **Google Identity** (formerly Google+ API) and enable it.
5. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth Client ID**.
6. Set **Application type** to **Web application**.
7. Under **Authorized redirect URIs**, add:
   ```
   https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-supabase-ref>` with your Supabase project reference ID (found in Supabase Dashboard → Project Settings → General).
8. Click **Create**. Copy the **Client ID** and **Client Secret** — you will need these in step 3.

---

## 2. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com).
2. Click **My Apps** → **Create App**.
3. Select **Consumer** as the app type and complete the creation form.
4. In the app dashboard, click **Add Product** and add **Facebook Login**.
5. In **Facebook Login** → **Settings**, add the following under **Valid OAuth Redirect URIs**:
   ```
   https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```
6. Go to **Settings** → **Basic** to find your **App ID** and **App Secret**. Copy both — you will need these in step 3.

---

## 3. Supabase Configuration

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Navigate to **Authentication** → **Providers**.

**Enable Google:**
- Toggle **Google** on.
- Paste the **Client ID** and **Client Secret** from step 1.
- Save.

**Enable Facebook:**
- Toggle **Facebook** on.
- Paste the **App ID** (as Client ID) and **App Secret** (as Client Secret) from step 2.
- Save.

**Configure URL settings:**
1. In the Supabase Dashboard, go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to your production domain, e.g.:
   ```
   https://handytool.app
   ```
3. Under **Redirect URLs**, add all allowed callback URLs:
   ```
   http://localhost:3000/auth/callback
   https://handytool.app/auth/callback
   ```
4. Save.

---

## 4. Environment Variables

Set the following environment variables in your `.env.local` (development) or your hosting provider's environment settings (production).

| Variable | Where to find it | Required by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API | client, admin |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API | client, admin |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API | admin app only |

Example `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Admin app only — never expose this key on the client side
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Never prefix it with `NEXT_PUBLIC_` and never expose it in client-side code.

---

## 5. Troubleshooting

### Redirect URI mismatch
- **Symptom:** OAuth flow returns an error about an invalid redirect URI.
- **Fix:** Ensure the redirect URI registered in the Google Cloud Console or Facebook Developer portal exactly matches `https://<your-supabase-ref>.supabase.co/auth/v1/callback`. No trailing slashes, no HTTP vs HTTPS mismatch.

### Provider not enabled
- **Symptom:** Sign-in button does nothing or returns a `Provider not found` error.
- **Fix:** Go to Supabase Dashboard → Authentication → Providers and confirm the provider toggle is on and credentials are saved.

### Missing environment variables
- **Symptom:** App fails to initialize Supabase client or returns `undefined` for the URL.
- **Fix:** Confirm `.env.local` is present at the project root and the variable names match exactly. Restart the Next.js dev server after any `.env` change.

### How to check authentication logs
1. Go to Supabase Dashboard → **Authentication** → **Logs**.
2. Filter by user email or timestamp to find the failed auth attempt.
3. The error message in the log will indicate whether the issue is a redirect URI mismatch, a disabled provider, or an expired token.
