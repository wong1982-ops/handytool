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
"[project]/lib/story/enrich.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateConcepts",
    ()=>generateConcepts,
    "generateSlug",
    ()=>generateSlug,
    "generateStoryBible",
    ()=>generateStoryBible,
    "generateStoryDraft",
    ()=>generateStoryDraft,
    "refineConceptStream",
    ()=>refineConceptStream,
    "rephrasePlot",
    ()=>rephrasePlot,
    "sanitizePlotText",
    ()=>sanitizePlotText,
    "validateAndFix",
    ()=>validateAndFix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
;
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY);
// Relaxed safety settings for children's story generation — avoids false positives
// on whimsical/fantasy content (dragons, villains, mild conflict) that Gemini's
// default filters sometimes flag as PROHIBITED_CONTENT.
const storySafetySettings = [
    {
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmCategory"].HARM_CATEGORY_HARASSMENT,
        threshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmBlockThreshold"].BLOCK_ONLY_HIGH
    },
    {
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmCategory"].HARM_CATEGORY_HATE_SPEECH,
        threshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmBlockThreshold"].BLOCK_ONLY_HIGH
    },
    {
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmCategory"].HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmBlockThreshold"].BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmCategory"].HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HarmBlockThreshold"].BLOCK_ONLY_HIGH
    }
];
// Safety language rules injected into all story generation prompts to prevent
// Gemini's content filter from blocking children's stories with innocent intent.
const CONTENT_SAFETY_RULES = `
CONTENT SAFETY — You MUST follow these rewriting rules to keep stories child-safe:
1. Children must NEVER find and eat/drink unknown items. If the plot involves consuming something magical, rewrite so a TRUSTED CHARACTER (fairy, sprite, guardian, parent) offers or gifts it to them.
2. NEVER use enticement/luring language: "irresistible scent", "couldn't resist", "so attractive", "drawn to it". Instead use: "warm glow", "friendly shimmer", "gentle sparkle".
3. NEVER describe body sensations after ingestion: "peculiar tingle", "felt something changed", "strange feeling". Instead use: "felt a burst of energy", "felt brave and strong", "felt ready for anything".
4. Frame magical powers as GIFTS or BLESSINGS earned through kindness, courage, or friendship — never as side effects of consuming unknown substances.
5. NEVER use words: "drug", "potion", "intoxicating", "addictive", "seduce", "lure", "irresistible", "inject", "swallow". Use child-safe alternatives.
6. Avoid "fight", "kill", "die", "weapon", "blood", "dark magic", "evil". Use: "challenge", "defeat", "vanish", "tool", "tricky spells", "mischievous".
7. Physical strength gains should be described as "discovering hidden talents" or "unlocking abilities" — never as "got more power" or "body transformation".
8. All conflict must be resolved through wit, kindness, teamwork, or clever thinking — never through violence.
`;
function sanitizePlotText(text) {
    // Word/phrase replacements (case-insensitive)
    const replacements = [
        // Ingestion patterns — the #1 trigger for children's stories
        [
            /\bpicked up and eat\b/gi,
            'were gifted and tasted'
        ],
        [
            /\bpicked up and ate\b/gi,
            'were gifted and tasted'
        ],
        [
            /\beat it\b/gi,
            'tasted it'
        ],
        [
            /\bate it\b/gi,
            'tasted it'
        ],
        [
            /\bate them\b/gi,
            'tasted them'
        ],
        [
            /\beat them\b/gi,
            'tasted them'
        ],
        [
            /\bthey eat\b/gi,
            'they taste'
        ],
        [
            /\bthey ate\b/gi,
            'they tasted'
        ],
        [
            /\bswallow(?:ed|s|ing)?\b/gi,
            'tasted'
        ],
        [
            /\bdevour(?:ed|s|ing)?\b/gi,
            'enjoyed'
        ],
        [
            /\bgulp(?:ed|s|ing)?\b/gi,
            'sipped'
        ],
        [
            /\bconsume(?:d|s|ing)?\b/gi,
            'enjoyed'
        ],
        // Enticement / luring language
        [
            /\birresistible\b/gi,
            'wonderful'
        ],
        [
            /\bcouldn'?t resist\b/gi,
            'were delighted by'
        ],
        [
            /\bso attractive\b/gi,
            'so inviting'
        ],
        [
            /\bdrawn to\b/gi,
            'curious about'
        ],
        [
            /\blure(?:d|s|ing)?\b/gi,
            'invited'
        ],
        [
            /\bseduce(?:d|s|ing)?\b/gi,
            'charmed'
        ],
        [
            /\bintoxicat(?:ed|ing|es)?\b/gi,
            'enchanting'
        ],
        [
            /\baddictive\b/gi,
            'delightful'
        ],
        [
            /\bsmells? so good\b/gi,
            'glowed warmly'
        ],
        // Body sensation after ingestion
        [
            /\bfeel(?:s)? something changed\b/gi,
            'felt a burst of energy'
        ],
        [
            /\bfelt something change(?:d)?\b/gi,
            'felt a burst of energy'
        ],
        [
            /\bpeculiar tingle\b/gi,
            'warm glow'
        ],
        [
            /\bstrange feeling\b/gi,
            'wonderful feeling'
        ],
        [
            /\btingle(?:d|s|ing)?\b/gi,
            'glow'
        ],
        // Violence / danger words
        [
            /\bkill(?:ed|s|ing)?\b/gi,
            'defeated'
        ],
        [
            /\bdie(?:d|s)?\b/gi,
            'vanished'
        ],
        [
            /\bdeath\b/gi,
            'defeat'
        ],
        [
            /\bfight(?:s|ing)?\b/gi,
            'challenge'
        ],
        [
            /\bfought\b/gi,
            'challenged'
        ],
        [
            /\battack(?:ed|s|ing)?\b/gi,
            'challenged'
        ],
        [
            /\bdestroy(?:ed|s|ing)?\b/gi,
            'undid'
        ],
        [
            /\bweapon(?:s)?\b/gi,
            'tool'
        ],
        [
            /\bblood(?:y)?\b/gi,
            'magic'
        ],
        [
            /\bevil\b/gi,
            'mischievous'
        ],
        [
            /\bdark magic\b/gi,
            'tricky spells'
        ],
        [
            /\bpoison(?:ed|s|ous|ing)?\b/gi,
            'enchanted'
        ],
        [
            /\bdrug(?:s|ged|ging)?\b/gi,
            'charm'
        ],
        [
            /\bpotion(?:s)?\b/gi,
            'magical drink'
        ],
        [
            /\binject(?:ed|s|ing|ion)?\b/gi,
            'gifted'
        ],
        // Power / transformation framing
        [
            /\bgot more power\b/gi,
            'discovered hidden talents'
        ],
        [
            /\bgained? power(?:s)?\b/gi,
            'discovered amazing abilities'
        ],
        [
            /\bbody transform(?:ed|ation|ing)?\b/gi,
            'abilities awakened'
        ],
        [
            /\bsupernatural power(?:s)?\b/gi,
            'magical gifts'
        ]
    ];
    let result = text;
    for (const [pattern, replacement] of replacements){
        result = result.replace(pattern, replacement);
    }
    return result;
}
async function rephrasePlot(plot) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings: storySafetySettings,
        systemInstruction: `You are a children's book editor. Your ONLY job is to rephrase a story plot so it is clearly wholesome, age-appropriate, and safe for young children (ages 3-8).

Rules:
- Keep the SAME characters, setting, and story arc
- Replace any language that could be misinterpreted as violent, scary, or inappropriate with gentle, child-friendly alternatives
- Keep the plot interesting — don't make it boring, just safe
- Return ONLY the rephrased plot text, nothing else
- Keep roughly the same length

${CONTENT_SAFETY_RULES}`,
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000
        }
    });
    const safePlot = sanitizePlotText(plot);
    const result = await model.generateContent(`Rephrase this children's story plot to be unmistakably child-friendly:\n\n${safePlot}`);
    const text = result.response.text();
    if (!text) return plot // fallback to original if rephrase fails
    ;
    return text.trim();
}
async function generateConcepts(input) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings: storySafetySettings,
        systemInstruction: `You are a professional children's book creative director. Given a story plot idea, generate a compelling story concept with rich detail.

Rules:
- Sections should be vivid and specific — avoid generic descriptions
- Keep each section concise (1-3 sentences max)

${CONTENT_SAFETY_RULES}`,
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                properties: {
                    id: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING
                    },
                    title: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                        description: 'A compelling, memorable book title'
                    },
                    coverDescription: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                        description: 'Visual description of the book cover'
                    },
                    sections: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                        properties: {
                            premise: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'What is this story about? Set the scene and central conflict.'
                            },
                            authorIntent: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'What emotions or thoughts should this story stir?'
                            },
                            messageToAudience: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'What should the reader take away?'
                            },
                            narrativeArc: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'How does the story unfold? Beginning, turning point, resolution.'
                            },
                            tone: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'How is the story told? Voice, humor, emotional texture.'
                            },
                            visualStyle: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'Art direction, color palette, visual mood.'
                            }
                        },
                        required: [
                            'premise',
                            'authorIntent',
                            'messageToAudience',
                            'narrativeArc',
                            'tone',
                            'visualStyle'
                        ]
                    },
                    tags: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                        properties: {
                            style: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'Art style (e.g., Watercolor, Cartoon, Anime)'
                            },
                            audience: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'Target age group (e.g., Ages 2-4, Ages 5-7)'
                            },
                            pageCount: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].NUMBER,
                                description: 'Number of pages, between 8 and 12'
                            },
                            tone: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'Short emotional tone label'
                            }
                        },
                        required: [
                            'style',
                            'audience',
                            'pageCount',
                            'tone'
                        ]
                    }
                },
                required: [
                    'id',
                    'title',
                    'coverDescription',
                    'sections',
                    'tags'
                ]
            }
        }
    });
    // Build prompt with optional series context
    const safePlot = sanitizePlotText(input.plot);
    let prompt = `Story idea:\n${safePlot}`;
    if (input.seriesContext) {
        const { setting, characters, artStyle } = input.seriesContext;
        prompt += `\n\nIMPORTANT — This story is part of a series with the following constraints:
- Setting: ${setting}
- Art style: ${artStyle} (you MUST use this exact style in tags.style)
- The story MUST feature these characters with EXACTLY these physical descriptions:
${characters.map((c)=>`  * ${c.name}: ${c.description}`).join('\n')}

The story concept MUST revolve around these characters in this setting. Do NOT invent new main characters.`;
        if (input.seriesContext.existingBooks?.length) {
            prompt += `\n\nPrevious books in this series (for continuity — create a NEW story, do NOT repeat these plots):
${input.seriesContext.existingBooks.map((b, i)=>`  ${i + 1}. "${b.title}" — ${b.premise}${b.theme ? ` (Theme: ${b.theme})` : ''}`).join('\n')}

Build on these stories: reference shared history, develop character relationships further, and explore new adventures. The new story should feel like a natural continuation of the series.`;
        }
    }
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) throw new Error('No response from Gemini');
    const concept = JSON.parse(text);
    // If series context provided, force the art style
    if (input.seriesContext) {
        concept.tags.style = input.seriesContext.artStyle;
    }
    return concept;
}
async function* refineConceptStream(input) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings: storySafetySettings,
        systemInstruction: `You are a children's book creative director helping an author refine their story concept. The author has selected a concept and wants to make changes.

Given the current concept and the author's feedback, produce an updated concept with the requested changes applied. Also write a brief reply (1-2 sentences) explaining what you changed and why.

You MUST respond with valid JSON matching this structure:
{
  "concept": { ...the full updated StoryConcept object with same structure as input... },
  "reply": "string — brief explanation of what changed"
}

Rules:
- Preserve the concept structure exactly (id, title, coverDescription, sections, tags)
- Only change what the author asked for — keep everything else intact
- If the author's request affects multiple sections, update all relevant ones
- The reply should be conversational and encouraging
- Respond ONLY with the JSON object, no markdown code fences

${CONTENT_SAFETY_RULES}`
    });
    const history = input.history.map((m)=>`${m.role === 'user' ? 'Author' : 'Director'}: ${m.content}`).join('\n');
    const userMessage = `Current concept:
${JSON.stringify(input.concept, null, 2)}

${history ? `Previous conversation:\n${history}\n\n` : ''}Author's new request: ${input.message}`;
    const result = await model.generateContentStream(userMessage);
    let accumulated = '';
    for await (const chunk of result.stream){
        const text = chunk.text();
        if (text) {
            accumulated += text;
            yield {
                type: 'chunk',
                text
            };
        }
    }
    if (!accumulated) throw new Error('No response from Gemini');
    let jsonText = accumulated.trim();
    // Strip markdown code fences if present (streaming doesn't use responseMimeType)
    if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/```[\s\S]*$/, '');
    }
    // Fallback: extract JSON between first { and last }
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }
    yield {
        type: 'done',
        data: JSON.parse(jsonText)
    };
}
async function generateStoryBible(input) {
    const { concept, seriesContext } = input;
    const plot = sanitizePlotText(input.plot);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings: storySafetySettings,
        systemInstruction: `You are a world-building specialist for children's picture books. Given a story concept and plot, create a comprehensive Story Bible that will serve as the grounding document for writing and illustrating the book.

Your Story Bible must ensure:
- Character physical descriptions use a STRICT STRUCTURED FORMAT (see below). This is critical because the description is copied verbatim into every illustration prompt. Prose descriptions cause the AI illustrator to drift.
- Character personalities include motivations, fears, and quirks that drive behavior
- Relationships between characters are explicit and directional
- The narrative arc is broken into clear beats
- Rules capture any world-specific logic or character constraints
- Art direction provides visual coherence guidance for the illustrator

MANDATORY FORMAT for physicalDescription (use this exact structure for EVERY character):
"[Species/type, e.g. human girl, talking fox, robot]. Hair: [exact color, length, style, e.g. shoulder-length wavy auburn hair with a side part]. Eyes: [exact color and shape, e.g. large round emerald-green eyes]. Skin: [exact tone, e.g. warm olive skin with freckles across the nose]. Build: [body type, height relative to other characters, e.g. petite and slender, shorter than Sophie]. Outfit: [SPECIFIC clothing items with exact colors and details, e.g. a lavender cardigan over a white peter-pan collar blouse, navy pleated skirt, white knee socks, brown mary-jane shoes]. Accessories: [specific items, e.g. a small gold locket, round wire-rimmed glasses]. Distinguishing features: [unique identifiers, e.g. a gap between front teeth, a small birthmark on left cheek]."

This structured format MUST be followed exactly — do NOT write prose paragraphs. The illustrator needs each attribute as a discrete, reproducible detail.

Target audience: ${concept.tags.audience}
Art style: ${concept.tags.style}
Tone: ${concept.tags.tone}

${CONTENT_SAFETY_RULES}`,
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                properties: {
                    characters: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].ARRAY,
                        items: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                            properties: {
                                name: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING
                                },
                                physicalDescription: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'STRUCTURED physical appearance using this exact format: "[Species/type]. Hair: [color, length, style]. Eyes: [color, shape]. Skin: [tone, texture]. Build: [body type, relative height]. Outfit: [specific clothing items with exact colors]. Accessories: [specific items]. Distinguishing features: [unique identifiers]." This is copied verbatim into every image prompt — be precise and consistent.'
                                },
                                personality: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'Core motivations, fears, quirks, and behavioral traits'
                                },
                                role: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'protagonist, antagonist, or supporting'
                                },
                                relationships: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].ARRAY,
                                    items: {
                                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                                        properties: {
                                            with: {
                                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                                description: 'Name of the other character'
                                            },
                                            nature: {
                                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                                description: 'How this character feels about/relates to the other'
                                            }
                                        },
                                        required: [
                                            'with',
                                            'nature'
                                        ]
                                    }
                                }
                            },
                            required: [
                                'name',
                                'physicalDescription',
                                'personality',
                                'role',
                                'relationships'
                            ]
                        }
                    },
                    setting: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                        properties: {
                            location: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'Where the story takes place — specific and vivid'
                            },
                            timeContext: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'When: era, season, time-of-day progression through the story'
                            },
                            atmosphere: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'Mood, sensory details, ambient sounds and smells'
                            }
                        },
                        required: [
                            'location',
                            'timeContext',
                            'atmosphere'
                        ]
                    },
                    narrativeArc: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                        properties: {
                            opening: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'How the story begins — status quo'
                            },
                            incitingIncident: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'What disrupts the status quo'
                            },
                            risingAction: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'How tension escalates'
                            },
                            climax: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'The turning point'
                            },
                            resolution: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'How the story resolves'
                            }
                        },
                        required: [
                            'opening',
                            'incitingIncident',
                            'risingAction',
                            'climax',
                            'resolution'
                        ]
                    },
                    rules: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].ARRAY,
                        items: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING
                        },
                        description: 'Story-specific rules and constraints (e.g., "magic always costs energy", "the cat never speaks")'
                    },
                    artDirection: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                        properties: {
                            style: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING
                            },
                            colorPalette: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'Overall color direction: warm, cool, muted, vibrant, etc.'
                            },
                            lightingProgression: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                description: 'How lighting changes through the story (e.g., dawn to dusk, bright to stormy)'
                            }
                        },
                        required: [
                            'style',
                            'colorPalette',
                            'lightingProgression'
                        ]
                    }
                },
                required: [
                    'characters',
                    'setting',
                    'narrativeArc',
                    'rules',
                    'artDirection'
                ]
            }
        }
    });
    let prompt = sanitizePlotText(`Story concept: "${concept.title}"

Premise: ${concept.sections.premise}
Author's intent: ${concept.sections.authorIntent}
Narrative arc: ${concept.sections.narrativeArc}
Tone: ${concept.sections.tone}
Visual style: ${concept.sections.visualStyle}
Cover description: ${concept.coverDescription}

Original plot idea: ${plot}`);
    if (seriesContext?.existingBooks?.length) {
        prompt += `\n\nThis story is part of a series. Previous books:
${seriesContext.existingBooks.map((b, i)=>`  ${i + 1}. "${b.title}" — ${b.premise}${b.theme ? ` (Theme: ${b.theme})` : ''}`).join('\n')}

Build character relationships and world details that respect established continuity.`;
    }
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) throw new Error('No response from Gemini (Story Bible)');
    const bible = JSON.parse(text);
    // Force art style from concept
    bible.artDirection.style = concept.tags.style;
    return bible;
}
async function generateStoryDraft(input, storyBible) {
    const { concept } = input;
    const plot = sanitizePlotText(input.plot);
    const { style, audience, pageCount, tone } = concept.tags;
    // Build character reference block from Story Bible
    const characterBlock = storyBible.characters.map((c)=>`- ${c.name} (${c.role}): ${c.physicalDescription}`).join('\n');
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings: storySafetySettings,
        systemInstruction: `You are a professional children's book author and illustrator. Create a complete ${pageCount}-page picture book grounded in the Story Bible below.

=== STORY BIBLE (you MUST follow this exactly) ===

CHARACTERS:
${characterBlock}

SETTING: ${storyBible.setting.location} — ${storyBible.setting.timeContext}
ATMOSPHERE: ${storyBible.setting.atmosphere}

NARRATIVE ARC:
- Opening: ${storyBible.narrativeArc.opening}
- Inciting incident: ${storyBible.narrativeArc.incitingIncident}
- Rising action: ${storyBible.narrativeArc.risingAction}
- Climax: ${storyBible.narrativeArc.climax}
- Resolution: ${storyBible.narrativeArc.resolution}

RULES:
${storyBible.rules.map((r)=>`- ${r}`).join('\n')}

ART DIRECTION:
- Style: ${storyBible.artDirection.style}
- Color palette: ${storyBible.artDirection.colorPalette}
- Lighting progression: ${storyBible.artDirection.lightingProgression}

=== END STORY BIBLE ===

Art style: ${style}
Target audience: ${audience}
Tone: ${tone}

Rules:
- Exactly ${pageCount} pages
- First page is the opening scene, last page is the resolution
- Each page should advance the story following the narrative arc above
- Keep language age-appropriate for ${audience}
- Characters MUST act according to their personality and relationships defined in the Story Bible
- Every imagePrompt MUST start with "${style} style" and include the FULL physicalDescription from the Story Bible for EVERY character present in the scene.
- CRITICAL: Copy the ENTIRE structured physicalDescription VERBATIM for each character in the scene — do NOT abbreviate, paraphrase, or omit ANY attribute (hair, eyes, skin, build, outfit, accessories, distinguishing features). The illustrator treats each attribute independently; omitting any causes visual drift.
- If the story text describes a character changing appearance (e.g. putting on a costume, getting muddy), the imagePrompt MUST still include the full base description and then append "MODIFICATION: [what changed]" — never replace the base description.
- ANATOMY: Every imagePrompt for scenes with humans MUST include "anatomically correct human with exactly 2 arms, 2 legs, 5 fingers per hand, normal proportioned neck". For animals, include "species-accurate anatomy with correct limb count". This prevents AI image generators from producing extra limbs or distorted body parts.
- Image prompts must follow the art direction: use the specified color palette and lighting progression
- Do not include any text, words, or letters in image prompts

${CONTENT_SAFETY_RULES}`,
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                properties: {
                    title: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING
                    },
                    theme: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                        description: 'One-sentence theme'
                    },
                    setting: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                        description: 'Where/when the story takes place'
                    },
                    characters: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].ARRAY,
                        items: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                            properties: {
                                name: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING
                                },
                                role: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'protagonist, antagonist, or supporting'
                                },
                                description: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'Copy the EXACT physicalDescription from the Story Bible verbatim. Format: "[Type]. Hair: [...]. Eyes: [...]. Skin: [...]. Build: [...]. Outfit: [...]. Accessories: [...]. Distinguishing features: [...]."'
                                },
                                age: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING
                                }
                            },
                            required: [
                                'name',
                                'role',
                                'description',
                                'age'
                            ]
                        }
                    },
                    pages: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].ARRAY,
                        items: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                            properties: {
                                sequence: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].NUMBER
                                },
                                sceneDescription: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'Detailed visual scene description for the illustrator'
                                },
                                narrativeText: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'The text that appears on this page of the book'
                                },
                                dialogue: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].ARRAY,
                                    items: {
                                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                                        properties: {
                                            speaker: {
                                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING
                                            },
                                            line: {
                                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING
                                            }
                                        },
                                        required: [
                                            'speaker',
                                            'line'
                                        ]
                                    }
                                },
                                mood: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'Emotional tone'
                                },
                                imagePrompt: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: `Detailed image generation prompt starting with '${style} style'. Include full character appearances, scene, mood, lighting. No text in images.`
                                }
                            },
                            required: [
                                'sequence',
                                'sceneDescription',
                                'narrativeText',
                                'mood',
                                'imagePrompt'
                            ]
                        }
                    }
                },
                required: [
                    'title',
                    'theme',
                    'setting',
                    'characters',
                    'pages'
                ]
            }
        }
    });
    const userMessage = sanitizePlotText(`Story concept: ${concept.title}

Author's intent: ${concept.sections.authorIntent}
Premise: ${concept.sections.premise}
Message to audience: ${concept.sections.messageToAudience}

Original plot idea: ${plot}`);
    const result = await model.generateContent(userMessage);
    const text = result.response.text();
    if (!text) throw new Error('No text response from Gemini (Story Draft)');
    return JSON.parse(text);
}
async function validateAndFix(storyBible, draft) {
    const characterBlock = storyBible.characters.map((c)=>`- ${c.name} (${c.role}): ${c.physicalDescription} | Personality: ${c.personality}`).join('\n');
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings: storySafetySettings,
        systemInstruction: `You are a senior narrative editor for children's picture books. Your job is to review a story draft against its Story Bible and identify any inconsistencies.

=== STORY BIBLE ===

CHARACTERS:
${characterBlock}

RELATIONSHIPS:
${storyBible.characters.flatMap((c)=>c.relationships.map((r)=>`- ${c.name} → ${r.with}: ${r.nature}`)).join('\n')}

SETTING: ${storyBible.setting.location} — ${storyBible.setting.timeContext}
ATMOSPHERE: ${storyBible.setting.atmosphere}

NARRATIVE ARC:
- Opening: ${storyBible.narrativeArc.opening}
- Inciting incident: ${storyBible.narrativeArc.incitingIncident}
- Rising action: ${storyBible.narrativeArc.risingAction}
- Climax: ${storyBible.narrativeArc.climax}
- Resolution: ${storyBible.narrativeArc.resolution}

RULES:
${storyBible.rules.map((r)=>`- ${r}`).join('\n')}

ART DIRECTION:
- Style: ${storyBible.artDirection.style}
- Color palette: ${storyBible.artDirection.colorPalette}
- Lighting: ${storyBible.artDirection.lightingProgression}

=== END STORY BIBLE ===

Review the draft for:
1. Timeline — events follow a logical sequence; no page references future events
2. Character behavior — actions align with personality/motivations from Story Bible
3. Relationship consistency — characters interact per established dynamics
4. Causality — every action has a reason; no deus ex machina
5. Physical descriptions — imagePrompts must contain the EXACT FULL structured physicalDescription from the Story Bible for each character present (no drift, no abbreviation, no omitted attributes — every field: Hair, Eyes, Skin, Build, Outfit, Accessories, Distinguishing features must be present)
6. Art direction — imagePrompts follow the color palette and lighting progression
7. Age-appropriateness — language and themes match target audience

If the draft is perfect, return status "VALIDATED" with an empty issues array.
If issues are found, return status "NEEDS_FIX" with each issue including the corrected content in the "fix" field.
Be conservative — only flag real problems, not stylistic preferences.

${CONTENT_SAFETY_RULES}
Also flag any language that violates the content safety rules above as an issue.`,
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                properties: {
                    status: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                        description: 'VALIDATED or NEEDS_FIX'
                    },
                    issues: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].ARRAY,
                        items: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].OBJECT,
                            properties: {
                                page: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].NUMBER,
                                    description: 'Page sequence number (0 for book-level issues)'
                                },
                                category: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'timeline, character_behavior, relationship, causality, physical_description, art_direction, or age_appropriateness'
                                },
                                description: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'What is wrong'
                                },
                                fix: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'The corrected content for this field'
                                },
                                field: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SchemaType"].STRING,
                                    description: 'narrativeText, dialogue, imagePrompt, or sceneDescription'
                                }
                            },
                            required: [
                                'page',
                                'category',
                                'description',
                                'fix',
                                'field'
                            ]
                        }
                    }
                },
                required: [
                    'status',
                    'issues'
                ]
            }
        }
    });
    const result = await model.generateContent(`Review this story draft:\n\n${JSON.stringify(draft, null, 2)}`);
    const text = result.response.text();
    if (!text) throw new Error('No response from Gemini (Validation)');
    const validation = JSON.parse(text);
    if (validation.status === 'VALIDATED' || !validation.issues?.length) {
        return draft;
    }
    // Apply surgical fixes
    const pages = draft.pages || [];
    for (const issue of validation.issues){
        if (issue.page === 0) continue; // Skip book-level issues (no field to patch)
        const page = pages.find((p)=>p.sequence === issue.page);
        if (!page) continue;
        if (issue.field === 'dialogue') {
            // Dialogue fix: parse the fix as JSON array if possible, otherwise skip
            try {
                page.dialogue = JSON.parse(issue.fix);
            } catch  {
            // If fix isn't valid JSON, skip this fix
            }
        } else if (issue.field in page) {
            page[issue.field] = issue.fix;
        }
    }
    return {
        ...draft,
        pages
    };
}
function generateSlug(title) {
    const base = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 40).replace(/-$/, '');
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base}-${suffix}`;
}
}),
"[project]/app/api/v1/story/jobs/[id]/validate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$job$2d$step$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/story/job-step.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$enrich$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/story/enrich.ts [app-route] (ecmascript)");
;
;
const POST = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$job$2d$step$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withJobStep"])('validate', async (ctx)=>{
    const { job, supabase } = ctx;
    const { concept, skipValidation } = job.input;
    // Idempotent
    if (job.state.validated) {
        return {
            statePatch: {}
        };
    }
    const bible = job.state.bible;
    const draft = job.state.draft;
    if (!bible || !draft) {
        throw new Error('Bible or draft missing — cannot validate');
    }
    // Speed mode: skip AI validation, use draft as-is
    // Quality mode: run full consistency check & auto-fix
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storyData = skipValidation ? draft : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$enrich$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAndFix"])(bible, draft);
    const slug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$enrich$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateSlug"])(storyData.title || concept.title);
    // Determine author name
    let authorName = 'Anonymous';
    try {
        const { data: displayName } = await supabase.rpc('get_profile_display_name', {
            p_user_id: job.user_id
        });
        if (displayName) authorName = displayName;
    } catch  {
    // Fall back to Anonymous
    }
    return {
        statePatch: {
            validated: true,
            storyData,
            slug,
            authorName
        }
    };
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6a5660eb._.js.map