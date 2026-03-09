/**
 * Local development constants.
 * Used when NEXT_PUBLIC_SUPABASE_MODE=local to bypass auth
 * and point at the local Supabase Docker stack.
 */
export const LOCAL_DEV_USER_ID = '00000000-0000-0000-0000-000000000001'
export const LOCAL_DEV_EMAIL = 'loicwong1982@gmail.com'
export const LOCAL_DEV_NAME = 'Local Dev User'
export const isLocalDev = process.env.NEXT_PUBLIC_SUPABASE_MODE === 'local'
