/**
 * Email notification helpers for Story Studio.
 * Reuses existing nodemailer/Gmail SMTP configuration.
 */
import nodemailer from 'nodemailer'
import { getAdminSupabase } from '@/lib/supabase/admin'

const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

function createTransport() {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[email] SMTP credentials not configured — email notifications disabled')
    return null
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

/**
 * Send "Book Complete" email to the user.
 */
export async function emailBookComplete(
  userId: string,
  bookTitle: string,
  bookSlug: string,
  coverUrl?: string,
): Promise<void> {
  const transport = createTransport()
  if (!transport) return

  const supabase = getAdminSupabase()

  // Check user prefs
  const { data: prefs } = await (supabase as any)
    .from('user_notification_prefs')
    .select('email_on_book_complete')
    .eq('user_id', userId)
    .single()

  if (prefs && prefs.email_on_book_complete === false) {
    return
  }

  // Get user email from auth
  const { data: userData } = await (supabase as any).auth.admin.getUserById(userId)
  const email = userData?.user?.email
  if (!email) {
    console.warn(`[email] No email found for user ${userId}`)
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'
  const bookUrl = `${siteUrl}/tools/story-studio/book/${bookSlug}`
  const coverHtml = coverUrl
    ? `<img src="${coverUrl}" alt="Book cover" style="width:200px;height:auto;border-radius:12px;margin:0 auto 24px;display:block;box-shadow:0 4px 20px rgba(0,0,0,0.15);" />`
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <!-- Header -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;margin:0 auto 16px;border-radius:50%;background:linear-gradient(135deg,#818cf8,#c084fc);display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;">✨</span>
        </div>
        <h1 style="margin:0;font-size:22px;color:#1e293b;font-family:Palatino,'Palatino Linotype','Book Antiqua',serif;">
          Your Book is Ready!
        </h1>
      </div>

      ${coverHtml}

      <p style="margin:0 0 8px;font-size:15px;color:#334155;text-align:center;">
        <strong>"${bookTitle}"</strong> has been illustrated and narrated.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;text-align:center;">
        Your story is waiting for you on your bookshelf.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${bookUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;">
          Read Your Book
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

      <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
        Sent by <a href="${siteUrl}" style="color:#6366f1;text-decoration:none;">Toolk1t</a> Story Studio
      </p>
      <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;text-align:center;">
        <a href="${siteUrl}/tools/story-studio" style="color:#94a3b8;text-decoration:underline;">Manage notification preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`

  try {
    await transport.sendMail({
      from: `"Toolk1t Story Studio" <${SMTP_USER}>`,
      to: email,
      subject: `✨ "${bookTitle}" is ready to read!`,
      html,
    })
    console.log(`[email] Book completion email sent to ${email}`)
  } catch (err) {
    console.error('[email] Failed to send book completion email:', err)
  }
}
