module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/local-dev.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Local development constants.
 * Used when NEXT_PUBLIC_SUPABASE_MODE=local to bypass auth
 * and point at the local Supabase Docker stack.
 */ __turbopack_context__.s([
    "LOCAL_DEV_EMAIL",
    ()=>LOCAL_DEV_EMAIL,
    "LOCAL_DEV_NAME",
    ()=>LOCAL_DEV_NAME,
    "LOCAL_DEV_USER_ID",
    ()=>LOCAL_DEV_USER_ID,
    "isLocalDev",
    ()=>isLocalDev
]);
const LOCAL_DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
const LOCAL_DEV_EMAIL = 'loicwong1982@gmail.com';
const LOCAL_DEV_NAME = 'Local Dev User';
const isLocalDev = process.env.NEXT_PUBLIC_SUPABASE_MODE === 'local';
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.95.3/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$local$2d$dev$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/local-dev.ts [app-route] (ecmascript)");
;
;
;
;
/**
 * Cached dev client — avoids creating a new cookie-based client per request.
 * In dev mode with DEV_USER_ID, all RPCs are SECURITY DEFINER so we don't
 * need user-session auth. Using a cached client eliminates the slow
 * auth.getUser() round-trip that was causing 30s timeouts.
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
let _devClient = null;
function getDevClient() {
    if (_devClient) return _devClient;
    _devClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://wgrcfnumbozvtmhcavnm.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncmNmbnVtYm96dnRtaGNhdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczNjMsImV4cCI6MjA4NjE5MzM2M30.m1FZNFbzKQ0NeN-YTkwxu9dQ_n4AwZMoNAxdj2Mr3UQ"));
    return _devClient;
}
async function createClient() {
    // Local dev: use local Supabase URL + service role key (bypasses RLS)
    if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$local$2d$dev$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLocalDev"]) {
        const url = ("TURBOPACK compile-time value", "http://127.0.0.1:54321") || 'http://127.0.0.1:54321';
        const key = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncmNmbnVtYm96dnRtaGNhdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczNjMsImV4cCI6MjA4NjE5MzM2M30.m1FZNFbzKQ0NeN-YTkwxu9dQ_n4AwZMoNAxdj2Mr3UQ");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(url, key, {
            db: {
                schema: 'public'
            },
            global: {
                fetch: (url, options)=>fetch(url, {
                        ...options,
                        signal: AbortSignal.timeout(30000)
                    })
            },
            cookies: {
                getAll () {
                    return [];
                },
                setAll () {}
            }
        });
    }
    // Dev mode with DEV_USER_ID: use cached client (no cookie auth overhead).
    // All RPCs are SECURITY DEFINER — they don't need a user session.
    if (("TURBOPACK compile-time value", "development") === 'development' && process.env.DEV_USER_ID) {
        return getDevClient();
    }
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://wgrcfnumbozvtmhcavnm.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncmNmbnVtYm96dnRtaGNhdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczNjMsImV4cCI6MjA4NjE5MzM2M30.m1FZNFbzKQ0NeN-YTkwxu9dQ_n4AwZMoNAxdj2Mr3UQ"), {
        db: {
            schema: 'public'
        },
        global: {
            fetch: (url, options)=>fetch(url, {
                    ...options,
                    signal: AbortSignal.timeout(30000)
                })
        },
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing sessions.
                }
            }
        }
    });
}
}),
"[project]/lib/story/queue.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IS_DEV",
    ()=>IS_DEV,
    "PIPELINE_STEPS",
    ()=>PIPELINE_STEPS,
    "getNextStep",
    ()=>getNextStep,
    "getStepLabel",
    ()=>getStepLabel,
    "triggerNextStep",
    ()=>triggerNextStep,
    "triggerTtsBatch",
    ()=>triggerTtsBatch,
    "verifyCronSecret",
    ()=>verifyCronSecret
]);
/**
 * In-house job queue orchestration for Story Studio background generation.
 *
 * Each step route completes work → writes state to `book_jobs` via RPC →
 * fires a fetch() to the next step route (fire-and-forget).
 *
 * Vercel Cron `/api/cron/process-jobs` runs every 1 min as safety net
 * to pick up stuck jobs.
 */ const CRON_SECRET = process.env.CRON_SECRET || '';
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
const PIPELINE_STEPS = [
    'story_bible',
    'story_draft',
    'validate',
    'character_ref',
    'cover',
    'illustrate_page',
    'tts_page',
    'save'
];
/** Map step name → API route path segment */ const STEP_ROUTES = {
    story_bible: 'story-bible',
    story_draft: 'story-draft',
    validate: 'validate',
    character_ref: 'character-ref',
    cover: 'cover',
    illustrate_page: 'illustrate-page',
    tts_page: 'tts-page',
    save: 'save'
};
const IS_DEV = ("TURBOPACK compile-time value", "development") === 'development';
/**
 * Build the URL for a step route.
 */ function buildStepUrl(jobId, step, params) {
    const routeSegment = STEP_ROUTES[step];
    if (!routeSegment) {
        console.error(`[queue] Unknown step: ${step}`);
        return null;
    }
    const url = new URL(`/api/v1/story/jobs/${jobId}/${routeSegment}`, APP_URL);
    if (params) {
        for (const [key, value] of Object.entries(params)){
            url.searchParams.set(key, value);
        }
    }
    return url.toString();
}
/**
 * Fetch a step route.
 * Returns a promise that resolves when the step HTTP call completes.
 */ function fetchStep(url, jobId, step) {
    // Illustration and TTS steps can take several minutes — extend the timeout
    // to avoid undici HeadersTimeoutError killing the chain.
    const timeoutMs = step === 'illustrate_page' || step === 'tts_page' || step === 'character_ref' || step === 'cover' ? 5 * 60_000 // 5 minutes for image/audio generation
     : 2 * 60_000 // 2 minutes for text steps
    ;
    return fetch(url, {
        method: 'POST',
        headers: {
            'x-cron-secret': CRON_SECRET,
            'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(timeoutMs)
    }).then((res)=>{
        if (!res.ok) {
            console.error(`[queue] Step ${step} for job ${jobId} returned ${res.status}`);
        }
    }).catch((err)=>{
        console.error(`[queue] Failed to trigger ${step} for job ${jobId}:`, err);
    });
}
function triggerNextStep(jobId, step, params) {
    const url = buildStepUrl(jobId, step, params);
    if (!url) return;
    console.log(`[queue] Triggering step: ${step} for job ${jobId}`);
    if ("TURBOPACK compile-time truthy", 1) {
        // Dev: return the promise so withJobStep can await it
        return fetchStep(url, jobId, step);
    }
    //TURBOPACK unreachable
    ;
}
function triggerTtsBatch(jobId, totalPages) {
    if ("TURBOPACK compile-time truthy", 1) {
        // Sequential: trigger page 1 only — each tts-page step will trigger the next
        return triggerNextStep(jobId, 'tts_page', {
            page: '1'
        });
    }
    //TURBOPACK unreachable
    ;
    let page;
}
function verifyCronSecret(request) {
    const secret = request.headers.get('x-cron-secret');
    if (!CRON_SECRET) {
        // In development without CRON_SECRET set, allow all requests
        console.warn('[queue] CRON_SECRET not set — allowing request in dev mode');
        return true;
    }
    return secret === CRON_SECRET;
}
function getNextStep(currentStep, context) {
    switch(currentStep){
        case 'story_bible':
            return {
                step: 'story_draft'
            };
        case 'story_draft':
            return {
                step: 'validate'
            };
        case 'validate':
            return {
                step: 'character_ref'
            };
        case 'character_ref':
            return {
                step: 'cover'
            };
        case 'cover':
            if (context.skipIllustration) {
                // Skip per-page illustrations → go to TTS or save
                return context.skipAudio ? {
                    step: 'save'
                } : 'tts_batch';
            }
            // Start sequential illustration chain with page 1
            return {
                step: 'illustrate_page',
                params: {
                    page: '1'
                }
            };
        case 'illustrate_page':
            {
                const nextPage = (context.currentPage ?? 0) + 1;
                if (nextPage <= context.totalPages) {
                    return {
                        step: 'illustrate_page',
                        params: {
                            page: String(nextPage)
                        }
                    };
                }
                // All pages illustrated → trigger TTS batch (or skip to save)
                if (context.skipAudio) return {
                    step: 'save'
                };
                return 'tts_batch';
            }
        case 'tts_page':
            {
                const done = context.completedTtsCount ?? 0;
                if (done >= context.totalPages) {
                    return {
                        step: 'save'
                    };
                }
                // More TTS pages pending — don't trigger anything (they're already running)
                return null;
            }
        case 'save':
            return null // Pipeline complete
            ;
        default:
            return null;
    }
}
function getStepLabel(step, currentPage, totalPages) {
    switch(step){
        case 'story_bible':
            return 'Building story foundation...';
        case 'story_draft':
            return 'Writing your story...';
        case 'validate':
            return 'Reviewing for consistency...';
        case 'character_ref':
            return 'Creating character reference...';
        case 'cover':
            return 'Illustrating cover...';
        case 'illustrate_page':
            return currentPage && totalPages ? `Illustrating page ${currentPage} of ${totalPages}...` : 'Illustrating pages...';
        case 'tts_page':
            return currentPage && totalPages ? `Recording narration ${currentPage} of ${totalPages}...` : 'Recording narration...';
        case 'save':
            return 'Saving your book...';
        case 'done':
            return 'Complete!';
        default:
            return 'Processing...';
    }
}
}),
"[project]/lib/story/job-step.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "withJobStep",
    ()=>withJobStep
]);
/**
 * Shared wrapper for all job step routes.
 *
 * Each step route uses `withJobStep()` which handles:
 * 1. CRON_SECRET verification
 * 2. Load job from DB (input + state)
 * 3. Call the step handler
 * 4. Write result to state via `update_job_step` RPC
 * 5. Trigger next step (or handle errors)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/story/queue.ts [app-route] (ecmascript)");
;
;
;
function withJobStep(stepName, handler) {
    return async (request, { params: routeParams })=>{
        // 1. Verify secret
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyCronSecret"])(request)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const { id: jobId } = await routeParams;
        // 2. Load job from DB via SECURITY DEFINER RPC (step routes have no user session)
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: jobs, error: fetchError } = await supabase.rpc('get_job_by_id', {
            p_job_id: jobId
        });
        const job = Array.isArray(jobs) ? jobs[0] : jobs;
        if (fetchError || !job) {
            console.error(`[job-step] Job ${jobId} not found:`, fetchError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Job not found'
            }, {
                status: 404
            });
        }
        const jobRow = job;
        // Don't process completed jobs
        if (jobRow.status === 'completed') {
            console.log(`[job-step] Job ${jobId} already completed, skipping ${stepName}`);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: true,
                skipped: true
            });
        }
        // Mark job as running via RPC
        if (jobRow.status === 'scheduled') {
            await supabase.rpc('set_job_running', {
                p_job_id: jobId
            });
        }
        // Parse query params
        const searchParams = request.nextUrl.searchParams;
        const queryParams = {};
        searchParams.forEach((value, key)=>{
            queryParams[key] = value;
        });
        // 3. Execute step handler
        try {
            const result = await handler({
                job: jobRow,
                supabase,
                params: queryParams
            });
            // 4. Write state to DB via RPC
            const currentPage = queryParams.page ? parseInt(queryParams.page, 10) : undefined;
            // Determine the next step
            const jobInput = jobRow.input;
            const nextStepInfo = result.nextStep ? {
                step: result.nextStep,
                params: result.nextParams
            } : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNextStep"])(stepName, {
                totalPages: result.setTotalPages ?? jobRow.total_pages,
                currentPage,
                completedTtsCount: result.triggerTtsBatch ? 0 : undefined,
                skipIllustration: jobInput.skipIllustration,
                skipAudio: jobInput.skipAudio
            });
            const nextStepName = nextStepInfo === 'tts_batch' ? 'tts_page' : nextStepInfo ? nextStepInfo.step : stepName === 'save' ? 'done' : stepName;
            const nextStatus = nextStepName === 'done' ? 'completed' : 'running';
            // Write state via SECURITY DEFINER RPC
            const { error: updateError } = await supabase.rpc('update_job_step', {
                p_job_id: jobId,
                p_step: stepName,
                p_state_patch: result.statePatch,
                p_next_step: nextStepName,
                p_status: nextStatus
            });
            if (updateError) {
                console.error(`[job-step] Failed to update job ${jobId}:`, updateError);
                throw new Error(`DB update failed: ${updateError.message}`);
            }
            // Update total_pages if set by the handler
            if (result.setTotalPages !== undefined) {
                await supabase.rpc('set_job_total_pages', {
                    p_job_id: jobId,
                    p_total_pages: result.setTotalPages
                });
            }
            // 5. Trigger next step
            // In dev mode: await to serialize requests (Turbopack can only compile one route at a time).
            // In production: fire-and-forget (returns void, non-blocking).
            if (nextStepInfo === 'tts_batch') {
                const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["triggerTtsBatch"])(jobId, result.setTotalPages ?? jobRow.total_pages);
                if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IS_DEV"] && p) await p;
            } else if (nextStepInfo && nextStepName !== 'done') {
                const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["triggerNextStep"])(jobId, nextStepInfo.step, nextStepInfo.params);
                if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IS_DEV"] && p) await p;
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: true,
                step: stepName,
                next: nextStepName
            });
        } catch (err) {
            console.error(`[job-step] Step ${stepName} failed for job ${jobId}:`, err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            const newRetryCount = jobRow.retry_count + 1;
            if (newRetryCount >= 3) {
                // Park as failed after 3 retries
                await supabase.rpc('fail_job_step', {
                    p_job_id: jobId,
                    p_step: stepName,
                    p_error: errorMessage,
                    p_retry_count: newRetryCount
                });
                // Release reserved credits on permanent failure
                if (jobRow.credits_reservation_id) {
                    try {
                        await supabase.rpc('release_reserved_credits', {
                            p_reservation_id: jobRow.credits_reservation_id,
                            p_reason: `Story Studio — generation failed at ${stepName}: ${errorMessage}`
                        });
                    } catch (releaseErr) {
                        console.error(`[job-step] Failed to release credits for job ${jobId}:`, releaseErr);
                    }
                }
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: errorMessage,
                    parked: true
                }, {
                    status: 500
                });
            }
            // Increment retry count and let cron pick it up
            await supabase.rpc('increment_job_retry', {
                p_job_id: jobId,
                p_error: errorMessage
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: errorMessage,
                retryCount: newRetryCount
            }, {
                status: 500
            });
        }
    };
}
}),
"[project]/lib/story/tts.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assignVoices",
    ()=>assignVoices,
    "buildPageNarration",
    ()=>buildPageNarration,
    "generateMultiVoicePageAudio",
    ()=>generateMultiVoicePageAudio,
    "generatePageAudio",
    ()=>generatePageAudio,
    "segmentPageAudio",
    ()=>segmentPageAudio,
    "stitchWavBuffers",
    ()=>stitchWavBuffers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
;
;
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
;
const VOICE_POOL = {
    narrator: 'Enceladus',
    protagonist: 'Aoede',
    antagonist: 'Charon',
    supporting: [
        'Puck',
        'Fenrir',
        'Kore'
    ]
};
function assignVoices(characters, voicePreferences) {
    const map = {
        narrator: voicePreferences?.['__narrator__'] || VOICE_POOL.narrator
    };
    let supportingIdx = 0;
    for (const char of characters){
        if (map[char.name]) continue; // skip duplicates
        // Use voice preference if set (from series character)
        if (voicePreferences?.[char.name]) {
            map[char.name] = voicePreferences[char.name];
            continue;
        }
        switch(char.role){
            case 'protagonist':
                map[char.name] = VOICE_POOL.protagonist;
                break;
            case 'antagonist':
                map[char.name] = VOICE_POOL.antagonist;
                break;
            case 'supporting':
            default:
                map[char.name] = VOICE_POOL.supporting[supportingIdx % VOICE_POOL.supporting.length];
                supportingIdx++;
                break;
        }
    }
    return map;
}
function segmentPageAudio(narrativeText, dialogue, voiceMap) {
    const segments = [];
    // Narrative segment (always present)
    if (narrativeText.trim()) {
        segments.push({
            speaker: 'narrator',
            text: narrativeText.trim(),
            voiceName: voiceMap.narrator || VOICE_POOL.narrator
        });
    }
    // Dialogue segments
    if (dialogue?.length) {
        for (const d of dialogue){
            segments.push({
                speaker: d.speaker,
                text: d.line,
                voiceName: voiceMap[d.speaker] || VOICE_POOL.narrator
            });
        }
    }
    return segments;
}
// ---------------------------------------------------------------------------
// WAV stitching
// ---------------------------------------------------------------------------
const WAV_HEADER_SIZE = 44;
const SAMPLE_RATE = 24000;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;
const BYTES_PER_MS = SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8) / 1000;
/** Create a WAV header for the given PCM data size */ function makeWavHeader(dataSize) {
    const byteRate = SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
    const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
    const header = Buffer.alloc(WAV_HEADER_SIZE);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(NUM_CHANNELS, 22);
    header.writeUInt32LE(SAMPLE_RATE, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(BITS_PER_SAMPLE, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);
    return header;
}
function stitchWavBuffers(buffers, silenceMs = 400) {
    if (buffers.length === 0) return Buffer.alloc(0);
    if (buffers.length === 1) return buffers[0];
    // Strip WAV headers to get raw PCM
    const pcmChunks = buffers.map((buf)=>buf.subarray(WAV_HEADER_SIZE));
    // Silence gap as zero-filled PCM
    const silenceBytes = Math.round(silenceMs * BYTES_PER_MS);
    const silence = Buffer.alloc(silenceBytes);
    // Calculate total PCM size
    let totalPcmSize = 0;
    for(let i = 0; i < pcmChunks.length; i++){
        totalPcmSize += pcmChunks[i].length;
        if (i < pcmChunks.length - 1) totalPcmSize += silenceBytes;
    }
    // Concatenate
    const pcmData = Buffer.alloc(totalPcmSize);
    let offset = 0;
    for(let i = 0; i < pcmChunks.length; i++){
        pcmChunks[i].copy(pcmData, offset);
        offset += pcmChunks[i].length;
        if (i < pcmChunks.length - 1) {
            silence.copy(pcmData, offset);
            offset += silenceBytes;
        }
    }
    // Write new WAV with combined header
    const header = makeWavHeader(totalPcmSize);
    return Buffer.concat([
        header,
        pcmData
    ]);
}
// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------
/** Retry an async fn with exponential backoff */ async function retry(fn, maxAttempts) {
    for(let attempt = 0; attempt < maxAttempts; attempt++){
        try {
            return await fn();
        } catch (err) {
            if (attempt === maxAttempts - 1) throw err;
            const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500;
            await new Promise((r)=>setTimeout(r, delay));
        }
    }
    throw new Error('Unreachable');
}
// ---------------------------------------------------------------------------
// Low-level TTS generation (unchanged)
// ---------------------------------------------------------------------------
function pcmToWav(pcmBase64, sampleRate) {
    const pcmData = Buffer.from(pcmBase64, 'base64');
    const dataSize = pcmData.length;
    const wav = Buffer.alloc(WAV_HEADER_SIZE + dataSize);
    // Reuse makeWavHeader logic inline for the base64 path
    const byteRate = sampleRate * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
    const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
    wav.write('RIFF', 0);
    wav.writeUInt32LE(36 + dataSize, 4);
    wav.write('WAVE', 8);
    wav.write('fmt ', 12);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(NUM_CHANNELS, 22);
    wav.writeUInt32LE(sampleRate, 24);
    wav.writeUInt32LE(byteRate, 28);
    wav.writeUInt16LE(blockAlign, 32);
    wav.writeUInt16LE(BITS_PER_SAMPLE, 34);
    wav.write('data', 36);
    wav.writeUInt32LE(dataSize, 40);
    pcmData.copy(wav, 44);
    return wav;
}
/** Generate audio using Gemini TTS */ async function generateWithGemini(text, voiceName) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-preview-tts'
    });
    const result = await model.generateContent({
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text
                    }
                ]
            }
        ],
        generationConfig: {
            responseModalities: [
                'AUDIO'
            ],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName
                    }
                }
            }
        }
    });
    const response = result.response;
    const audioPart = response.candidates?.[0]?.content?.parts?.find((p)=>p.inlineData?.mimeType?.startsWith('audio/'));
    if (!audioPart?.inlineData?.data) {
        throw new Error('No audio returned from Gemini TTS');
    }
    return pcmToWav(audioPart.inlineData.data, 24000);
}
/** Generate audio using OpenAI TTS as fallback */ async function generateWithOpenAI(text) {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured for TTS fallback');
    }
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'tts-1',
            voice: 'alloy',
            input: text,
            response_format: 'mp3'
        })
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI TTS error: ${response.status} ${err}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
async function generatePageAudio(input) {
    const voiceName = input.voiceName || 'Kore';
    let audioBuffer;
    let contentType;
    let fileExtension;
    let provider;
    if (input.forceProvider === 'openai') {
        audioBuffer = await retry(()=>generateWithOpenAI(input.text), 3);
        contentType = 'audio/mpeg';
        fileExtension = 'mp3';
        provider = 'openai';
    } else if (input.forceProvider === 'gemini') {
        audioBuffer = await retry(()=>generateWithGemini(input.text, voiceName), 3);
        contentType = 'audio/wav';
        fileExtension = 'wav';
        provider = 'gemini';
    } else {
        try {
            audioBuffer = await retry(()=>generateWithGemini(input.text, voiceName), 3);
            contentType = 'audio/wav';
            fileExtension = 'wav';
            provider = 'gemini';
        } catch (geminiErr) {
            console.warn('Gemini TTS failed after 3 retries, falling back to OpenAI TTS:', geminiErr);
            audioBuffer = await retry(()=>generateWithOpenAI(input.text), 2);
            contentType = 'audio/mpeg';
            fileExtension = 'mp3';
            provider = 'openai';
        }
    }
    // In dev mode, return a data URL to skip Supabase upload
    if ("TURBOPACK compile-time truthy", 1) {
        const base64 = audioBuffer.toString('base64');
        return {
            audioUrl: `data:${contentType};base64,${base64}`,
            provider
        };
    }
    //TURBOPACK unreachable
    ;
    // Upload to R2
    const filename = undefined;
    const audioUrl = undefined;
}
async function generateMultiVoicePageAudio(input) {
    const { segments, bookId, pageNumber, forceProvider } = input;
    // OpenAI fallback: single-voice, combine all text
    if (forceProvider === 'openai') {
        const fullText = segments.map((s)=>s.text).join('. ');
        return generatePageAudio({
            text: fullText,
            bookId,
            pageNumber,
            forceProvider: 'openai'
        });
    }
    // Gemini multi-voice: generate each segment separately
    const wavBuffers = [];
    let detectedProvider = 'gemini';
    for (const segment of segments){
        try {
            const buf = await retry(()=>generateWithGemini(segment.text, segment.voiceName), 3);
            wavBuffers.push(buf);
        } catch (err) {
            // If any segment fails on Gemini, fall back to single-voice OpenAI for entire page
            console.warn(`Gemini TTS failed for segment "${segment.speaker}" on page ${pageNumber}, falling back to OpenAI single-voice:`, err);
            const fullText = segments.map((s)=>s.text).join('. ');
            return generatePageAudio({
                text: fullText,
                bookId,
                pageNumber,
                forceProvider: 'openai'
            });
        }
    }
    // Stitch all WAV segments
    const stitchedBuffer = stitchWavBuffers(wavBuffers, 400);
    const contentType = 'audio/wav';
    const fileExtension = 'wav';
    // In dev mode, return data URL
    if ("TURBOPACK compile-time truthy", 1) {
        const base64 = stitchedBuffer.toString('base64');
        return {
            audioUrl: `data:${contentType};base64,${base64}`,
            provider: detectedProvider
        };
    }
    //TURBOPACK unreachable
    ;
    // Upload to R2
    const filename = undefined;
    const audioUrl = undefined;
}
function buildPageNarration(narrativeText, dialogue) {
    let text = narrativeText;
    if (dialogue?.length) {
        text += '. ' + dialogue.map((d)=>`${d.speaker} says: "${d.line}"`).join('. ');
    }
    return text;
}
}),
"[project]/app/api/v1/story/jobs/[id]/tts-page/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$job$2d$step$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/story/job-step.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$tts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/story/tts.ts [app-route] (ecmascript) <locals>");
;
;
const POST = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$job$2d$step$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withJobStep"])('tts_page', async (ctx)=>{
    const { job, supabase } = ctx;
    const pageNum = parseInt(ctx.params.page, 10);
    const { seriesId } = job.input;
    // Idempotent: check if this page's audio is already done
    const existingAudio = job.state.audio ?? [];
    if (existingAudio.find((a)=>a.seq === pageNum)) {
        // Check if all TTS pages are done
        const totalPages = job.total_pages;
        if (existingAudio.length >= totalPages) {
            return {
                statePatch: {},
                nextStep: 'save'
            };
        }
        return {
            statePatch: {}
        };
    }
    const storyData = job.state.storyData;
    const allPages = storyData?.pages || [];
    const page = allPages.find((p)=>p.sequence === pageNum);
    if (!page) {
        throw new Error(`Page ${pageNum} not found in story data`);
    }
    // Get or build voice map
    let voiceMap = job.state.voiceMap;
    if (!voiceMap) {
        // Load series voice preferences if applicable
        let seriesVoicePreferences = {};
        if (seriesId) {
            try {
                const { data: seriesData } = await supabase.rpc('get_series_with_characters', {
                    p_series_id: seriesId,
                    p_user_id: job.user_id
                });
                const series = Array.isArray(seriesData) ? seriesData?.[0] : seriesData;
                if (series) {
                    const chars = series.characters || [];
                    for (const c of chars){
                        if (c.voice) seriesVoicePreferences[c.name] = c.voice;
                    }
                }
                // Carry forward narrator voice from first book
                const { data: seriesBooks } = await supabase.rpc('get_series_books_data', {
                    p_series_id: seriesId
                });
                const firstBook = Array.isArray(seriesBooks) ? seriesBooks[0] : null;
                if (firstBook) {
                    const bd = firstBook.data;
                    const bookVoiceMap = bd?.voiceMap;
                    if (bookVoiceMap?.narrator && !seriesVoicePreferences['__narrator__']) {
                        seriesVoicePreferences['__narrator__'] = bookVoiceMap.narrator;
                    }
                }
            } catch (err) {
                console.error('[tts-page] Failed to load series voice preferences:', err);
            }
        }
        const characters = storyData?.characters || [];
        voiceMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$tts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["assignVoices"])(characters, Object.keys(seriesVoicePreferences).length > 0 ? seriesVoicePreferences : undefined);
    }
    const bookId = `job_${job.id}`;
    let audioUrl;
    let lockedProvider = job.state.ttsProvider;
    try {
        if (lockedProvider === 'openai') {
            const narration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$tts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildPageNarration"])(page.narrativeText, page.dialogue);
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$tts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generatePageAudio"])({
                text: narration,
                bookId,
                pageNumber: pageNum,
                forceProvider: 'openai'
            });
            audioUrl = result.audioUrl;
        } else {
            const segments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$tts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["segmentPageAudio"])(page.narrativeText, page.dialogue, voiceMap);
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$tts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateMultiVoicePageAudio"])({
                segments,
                bookId,
                pageNumber: pageNum,
                forceProvider: lockedProvider
            });
            audioUrl = result.audioUrl;
            lockedProvider = result.provider;
        }
    } catch (err) {
        console.error(`[tts-page] TTS failed for page ${pageNum}:`, err);
    // Don't fail the whole job — continue with empty audio
    }
    const updatedAudio = [
        ...existingAudio,
        {
            seq: pageNum,
            audioUrl: audioUrl || ''
        }
    ];
    const totalPages = job.total_pages;
    // Build result
    const result = {
        statePatch: {
            audio: updatedAudio,
            voiceMap,
            ttsProvider: lockedProvider
        }
    };
    // Check if this is the last TTS page
    if (updatedAudio.length >= totalPages) {
        result.nextStep = 'save';
    } else if ("TURBOPACK compile-time truthy", 1) {
        // Dev mode: TTS runs sequentially (not batched) to avoid Turbopack crashes.
        // Chain to the next TTS page explicitly.
        result.nextStep = 'tts_page';
        result.nextParams = {
            page: String(pageNum + 1)
        };
    }
    return result;
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3e0e85b0._.js.map