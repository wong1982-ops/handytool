/**
 * Web Push notification helpers.
 * Used by background job steps to notify users when their book is ready.
 */
import webpush from 'web-push'
import { getAdminSupabase } from '@/lib/supabase/admin'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:loicwong1982@gmail.com'

let vapidConfigured = false

function ensureVapid() {
  if (vapidConfigured) return
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[push] VAPID keys not configured — push notifications disabled')
    return
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  vapidConfigured = true
}

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
}

/**
 * Send a push notification to all of a user's subscribed devices.
 * Silently skips if VAPID keys are not configured or user has no subscriptions.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  ensureVapid()
  if (!vapidConfigured) return

  const supabase = getAdminSupabase()

  // Check user prefs
  const { data: prefs } = await (supabase as any)
    .from('user_notification_prefs')
    .select('push_on_book_complete')
    .eq('user_id', userId)
    .single()

  // Default is true if no prefs row exists
  if (prefs && prefs.push_on_book_complete === false) {
    return
  }

  // Get all push subscriptions for this user
  const { data: subscriptions, error } = await (supabase as any)
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (error || !subscriptions?.length) {
    return
  }

  const jsonPayload = JSON.stringify(payload)
  const expiredIds: string[] = []

  await Promise.allSettled(
    subscriptions.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          jsonPayload,
          { TTL: 86400 }, // 24 hours
        )
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Subscription expired or unsubscribed — mark for cleanup
          expiredIds.push(sub.id)
        } else {
          console.error(`[push] Failed to send to ${sub.endpoint}:`, err)
        }
      }
    }),
  )

  // Clean up expired subscriptions
  if (expiredIds.length > 0) {
    await (supabase as any)
      .from('push_subscriptions')
      .delete()
      .in('id', expiredIds)
  }
}

/**
 * Send "Book Complete" push notification.
 */
export async function notifyBookComplete(
  userId: string,
  bookTitle: string,
  bookSlug: string,
  coverUrl?: string,
): Promise<void> {
  await sendPushToUser(userId, {
    title: 'Your Book is Ready!',
    body: `"${bookTitle}" has been illustrated and narrated. Tap to read.`,
    icon: coverUrl || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    url: `/tools/story-studio/book/${bookSlug}`,
    tag: `book-complete-${bookSlug}`,
  })
}
