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
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[project]/lib/storage/r2.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteFromR2",
    ()=>deleteFromR2,
    "deleteManyFromR2",
    ()=>deleteManyFromR2,
    "getR2PublicUrl",
    ()=>getR2PublicUrl,
    "uploadToR2",
    ()=>uploadToR2
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1005$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__ = __turbopack_context__.i("[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs, [project]/node_modules/.pnpm/@aws-sdk+client-s3@3.1005.0/node_modules/@aws-sdk/client-s3)");
;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || 'story-assets';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev';
let _client = null;
function getClient() {
    if (!_client) {
        _client = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1005$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["S3Client"]({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY
            }
        });
    }
    return _client;
}
async function uploadToR2(path, body, contentType, options) {
    const client = getClient();
    await client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1005$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["PutObjectCommand"]({
        Bucket: R2_BUCKET,
        Key: path,
        Body: body,
        ContentType: contentType,
        CacheControl: options?.upsert ? 'no-cache' : 'public, max-age=31536000, immutable'
    }));
    return getR2PublicUrl(path);
}
function getR2PublicUrl(path) {
    return `${R2_PUBLIC_URL}/${path}`;
}
async function deleteFromR2(path) {
    const client = getClient();
    await client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1005$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["DeleteObjectCommand"]({
        Bucket: R2_BUCKET,
        Key: path
    }));
}
async function deleteManyFromR2(paths) {
    if (paths.length === 0) return;
    const client = getClient();
    await client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1005$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["DeleteObjectsCommand"]({
        Bucket: R2_BUCKET,
        Delete: {
            Objects: paths.map((key)=>({
                    Key: key
                })),
            Quiet: true
        }
    }));
}
}),
"[project]/lib/story/illustrate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateCharacterReference",
    ()=>generateCharacterReference,
    "generateIllustration",
    ()=>generateIllustration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$google$2d$auth$2d$library$40$10$2e$6$2e$1$2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/google-auth-library@10.6.1/node_modules/google-auth-library/build/src/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$r2$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/r2.ts [app-route] (ecmascript)");
;
;
;
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$google$2b$generative$2d$ai$40$0$2e$24$2e$1$2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY || '');
// Vertex AI config for Imagen 3
const VERTEX_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const VERTEX_REGION = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
// Fallback providers
const FAL_API_KEY = process.env.FAL_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// ---------- Vertex AI Auth ----------
let vertexAuth = null;
function getVertexAuth() {
    if (vertexAuth) return vertexAuth;
    const serviceKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const adcJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (serviceKey) {
        // Service account key (JSON)
        vertexAuth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$google$2d$auth$2d$library$40$10$2e$6$2e$1$2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleAuth"]({
            credentials: JSON.parse(serviceKey),
            scopes: [
                'https://www.googleapis.com/auth/cloud-platform'
            ]
        });
    } else if (adcJson) {
        // User OAuth credentials (from gcloud auth application-default login)
        // Works on Vercel where ADC file doesn't exist
        vertexAuth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$google$2d$auth$2d$library$40$10$2e$6$2e$1$2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleAuth"]({
            credentials: JSON.parse(adcJson),
            scopes: [
                'https://www.googleapis.com/auth/cloud-platform'
            ]
        });
    } else {
        // Fall back to Application Default Credentials (local dev)
        vertexAuth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$google$2d$auth$2d$library$40$10$2e$6$2e$1$2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleAuth"]({
            scopes: [
                'https://www.googleapis.com/auth/cloud-platform'
            ]
        });
    }
    return vertexAuth;
}
async function getVertexAccessToken() {
    const auth = getVertexAuth();
    const client = await auth.getClient();
    const { token } = await client.getAccessToken();
    if (!token) throw new Error('Failed to get Vertex AI access token');
    return token;
}
// ---------- Subject Type Detection ----------
/**
 * Common animal keywords for species-specific anatomy prompts.
 * Maps keyword → { anatomy description, Imagen 3 subject type }.
 */ const ANIMAL_ANATOMY = {
    dog: {
        anatomy: '4 legs, 1 tail, 2 ears, 1 snout, 4 paws with paw pads',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    puppy: {
        anatomy: '4 legs, 1 tail, 2 ears, 1 snout, 4 paws with paw pads',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    cat: {
        anatomy: '4 legs, 1 tail, 2 ears, 4 paws with retractable claws, whiskers',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    kitten: {
        anatomy: '4 legs, 1 tail, 2 ears, 4 paws with retractable claws, whiskers',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    rabbit: {
        anatomy: '4 legs, 1 short fluffy tail, 2 long ears, 4 paws',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    bunny: {
        anatomy: '4 legs, 1 short fluffy tail, 2 long ears, 4 paws',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    horse: {
        anatomy: '4 legs with hooves, 1 long tail, 2 ears, 1 mane',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    pony: {
        anatomy: '4 legs with hooves, 1 long tail, 2 ears, 1 mane',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    unicorn: {
        anatomy: '4 legs with hooves, 1 long tail, 2 ears, 1 mane, 1 horn on forehead',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    bear: {
        anatomy: '4 legs, 1 short tail, 2 rounded ears, 4 paws with claws',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    fox: {
        anatomy: '4 legs, 1 bushy tail, 2 pointed ears, 4 paws, pointed snout',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    wolf: {
        anatomy: '4 legs, 1 bushy tail, 2 pointed ears, 4 paws, elongated snout',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    bird: {
        anatomy: '2 wings, 2 legs with talons, 1 beak, 1 tail fan, feathered body',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    owl: {
        anatomy: '2 wings, 2 legs with talons, 1 beak, large round eyes, feathered body, can rotate head',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    eagle: {
        anatomy: '2 large wings, 2 legs with talons, 1 hooked beak, 1 tail fan',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    penguin: {
        anatomy: '2 flippers (not flying wings), 2 legs with webbed feet, 1 beak, upright posture',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    dragon: {
        anatomy: '4 legs with claws, 2 wings, 1 long tail, 2 horns, scales covering body',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    frog: {
        anatomy: '4 legs (2 long hind legs for jumping, 2 shorter front legs), no tail, wide mouth, bulging eyes',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    turtle: {
        anatomy: '4 legs, 1 shell (dome top, flat bottom), 1 small tail, 1 head that can retract',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    fish: {
        anatomy: 'fins (dorsal, pectoral, caudal/tail), scales, gills, no legs',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    elephant: {
        anatomy: '4 thick legs, 1 trunk, 2 large ears, 1 thin tail, 2 tusks (if adult)',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    lion: {
        anatomy: '4 legs, 1 tail with tuft, 2 ears, 4 paws with claws, mane (if male)',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    mouse: {
        anatomy: '4 legs, 1 long thin tail, 2 large round ears, 4 tiny paws, whiskers',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    deer: {
        anatomy: '4 legs with hooves, 1 short tail, 2 ears, antlers (if male/stag)',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    butterfly: {
        anatomy: '2 pairs of wings (4 wings total), 6 legs, 2 antennae, proboscis',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    spider: {
        anatomy: '8 legs, no wings, multiple eyes (usually 8), spinnerets',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    snake: {
        anatomy: 'no legs, no arms, long cylindrical body, forked tongue, scales',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    },
    monkey: {
        anatomy: '2 arms, 2 legs, 1 long tail (prehensile), 5 fingers per hand, 5 toes per foot',
        subjectType: 'SUBJECT_TYPE_ANIMAL'
    }
};
/** Object/item keywords for Imagen 3 subject type detection */ const OBJECT_KEYWORDS = [
    'wand',
    'sword',
    'staff',
    'crown',
    'ring',
    'amulet',
    'book',
    'lamp',
    'mirror',
    'key',
    'chest',
    'potion',
    'crystal',
    'orb',
    'shield',
    'gem',
    'robot',
    'machine',
    'vehicle',
    'ship',
    'castle',
    'house',
    'toy'
];
/**
 * Detect the Imagen 3 subject type and species-specific anatomy from a character description.
 * Returns { subjectType, anatomyHint } for use in prompts and API calls.
 */ function detectSubjectInfo(description) {
    const lower = description.toLowerCase();
    // Check animal keywords first (more specific)
    for (const [keyword, info] of Object.entries(ANIMAL_ANATOMY)){
        if (lower.includes(keyword)) {
            return {
                subjectType: info.subjectType,
                anatomyHint: `${keyword} anatomy: ${info.anatomy}`
            };
        }
    }
    // Check object keywords
    for (const kw of OBJECT_KEYWORDS){
        if (lower.includes(kw)) {
            return {
                subjectType: 'SUBJECT_TYPE_PRODUCT',
                anatomyHint: ''
            };
        }
    }
    // Default to person (humans, humanoids, fairies, elves, etc.)
    return {
        subjectType: 'SUBJECT_TYPE_PERSON',
        anatomyHint: 'human anatomy: exactly 2 arms, 2 legs, 5 fingers per hand, 5 toes per foot, normal proportioned neck'
    };
}
// ---------- Prompt Building ----------
/**
 * Build a structured prompt with full character descriptions repeated every time.
 *
 * Strategy 2: Consistent Base Prompt — same core character descriptions in every prompt.
 * Strategy 4: Specific Details — use the detailed descriptions from story generation.
 * Strategy 6: Prompt Repetition — copy the ENTIRE physical description into each prompt.
 *             Do NOT assume the model remembers characters from previous turns.
 * Strategy 7: Use Specific Terms — "messy charcoal-grey hair" not "grey hair".
 *             Specific modifiers help the AI repeatedly produce similar visuals.
 */ function buildPrompt(input) {
    let prompt = '';
    // Strategy 6: Full character descriptions repeated in EVERY prompt
    // Strategy 7: Descriptions should already contain specific terms from story generation
    if (input.characters?.length) {
        prompt += 'CHARACTER CONSISTENCY RULES (MANDATORY):\n';
        prompt += '- You MUST reproduce EVERY attribute listed below EXACTLY as specified.\n';
        prompt += '- Do NOT change, omit, or reinterpret ANY detail: hair color/length/style, eye color/shape, skin tone, body type, outfit (every clothing item with exact colors), accessories, and distinguishing features.\n';
        prompt += '- Each character MUST be visually distinguishable and match their description on EVERY page.\n';
        prompt += '- If a character appeared on a previous page, they MUST look IDENTICAL here.\n\n';
        prompt += 'CHARACTERS:\n';
        prompt += input.characters.map((c)=>`• ${c.name}: ${c.description}`).join('\n');
        prompt += '\n\n';
    }
    if (input.style) {
        prompt += `ART STYLE: ${input.style}. `;
    }
    // Anatomical correctness rules — species-specific when possible
    prompt += 'ANATOMY RULES (MANDATORY):\n';
    if (input.characters?.length) {
        const anatomyHints = input.characters.map((c)=>{
            const info = detectSubjectInfo(c.description);
            return info.anatomyHint ? `- ${c.name}: ${info.anatomyHint}` : null;
        }).filter(Boolean);
        if (anatomyHints.length) {
            prompt += anatomyHints.join('\n') + '\n';
        }
    }
    prompt += '- No extra limbs, merged fingers, elongated/snake-like necks, or distorted body proportions.\n';
    prompt += '- Hands must have natural proportions with correct finger count.\n\n';
    prompt += `SCENE: ${input.imagePrompt}`;
    prompt += '\n\nIMPORTANT: Do not include any text, words, letters, or writing in the image. Illustration only.';
    return prompt;
}
/**
 * Build an Imagen 3 prompt that references subjects using [N] bracket notation.
 * When using subject references, the prompt must contain [referenceId] markers.
 *
 * Strategy 6: Full character descriptions repeated every time (Prompt Repetition).
 * Strategy 7: Specific physical terms for visual consistency.
 */ function buildImagen3Prompt(input, subjectRefCount) {
    let prompt = '';
    if (input.style) {
        prompt += `${input.style} style. `;
    }
    if (input.characters?.length && subjectRefCount > 0) {
        // With subject references, use [N] notation to link each character to their portrait
        // Strategy 6: Still include full descriptions even with reference images
        if (subjectRefCount === 1) {
            prompt += `Illustrate [1] in this scene: ${input.imagePrompt}. `;
        } else {
            // Multiple character references: [1], [2], etc.
            const refTags = Array.from({
                length: subjectRefCount
            }, (_, i)=>`[${i + 1}]`).join(' and ');
            prompt += `Illustrate ${refTags} in this scene: ${input.imagePrompt}. `;
        }
        prompt += `CRITICAL — reproduce EVERY physical attribute exactly as described. Do NOT change hair, eyes, skin, outfit, or accessories: ${input.characters.map((c)=>`${c.name} — ${c.description}`).join('. ')}. `;
    } else if (input.characters?.length) {
        // Strategy 6+7: Full specific descriptions repeated in every prompt
        prompt += input.characters.map((c)=>`${c.name}: ${c.description}`).join('. ') + '. ';
        prompt += input.imagePrompt + '. ';
    } else {
        prompt += input.imagePrompt + '. ';
    }
    // Species-specific anatomy for Imagen 3 prompts
    if (input.characters?.length) {
        const hints = input.characters.map((c)=>detectSubjectInfo(c.description).anatomyHint).filter(Boolean);
        if (hints.length) {
            prompt += `Anatomically correct: ${hints.join('. ')}. `;
        }
    } else {
        prompt += 'Anatomically correct: humans have exactly 2 arms, 2 legs, 5 fingers per hand, normal neck. Animals have species-accurate limb count. ';
    }
    prompt += 'No text, words, letters, or writing in the image. Children\'s book illustration.';
    return prompt;
}
async function generateCharacterReference(characters, style, styleReferenceImage) {
    // Build prompt based on single character vs multiple
    const isSingle = characters.length === 1;
    const charDescs = characters.map((c)=>`${c.name}: ${c.description}`).join('. ');
    const anatomyRules = 'Anatomically correct: humans have exactly 2 arms, 2 legs, 5 fingers per hand, 5 toes per foot, normal proportioned neck. Animals have species-accurate limb count. No extra limbs, merged fingers, or distorted proportions.';
    const buildRefPrompt = (suffix)=>isSingle ? `${style} style full body character portrait of ${characters[0].name}. ${characters[0].description}. Standing pose, clear details, clean background. ${anatomyRules} ${suffix}` : `${style} style character reference sheet showing all main characters side by side, full body, clear distinct appearances, white background. Characters: ${charDescs}. ${anatomyRules} ${suffix}`;
    // Try Imagen 3 with style reference first (best consistency with existing portraits)
    if (characters.length && VERTEX_PROJECT_ID && styleReferenceImage) {
        try {
            console.log(`[illustrate] Generating character ${isSingle ? 'portrait' : 'reference sheet'} via Imagen 3 with style reference...`);
            const prompt = buildRefPrompt('No text, words, or letters in the image.');
            const token = await getVertexAccessToken();
            const url = `https://${VERTEX_REGION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_REGION}/publishers/google/models/imagen-3.0-capability-001:predict`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    instances: [
                        {
                            prompt,
                            referenceImages: [
                                {
                                    referenceType: 'REFERENCE_TYPE_STYLE',
                                    referenceId: 1,
                                    referenceImage: {
                                        bytesBase64Encoded: styleReferenceImage.toString('base64')
                                    },
                                    styleImageConfig: {
                                        styleDescription: `Match this exact ${style} art style, color palette, line weight, shading technique, and visual mood`
                                    }
                                }
                            ]
                        }
                    ],
                    parameters: {
                        sampleCount: 1,
                        personGeneration: 'allow_all',
                        safetySetting: 'block_only_high'
                    }
                })
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Imagen 3 capability error: ${response.status} ${err}`);
            }
            const data = await response.json();
            const prediction = data.predictions?.[0];
            if (!prediction?.bytesBase64Encoded) {
                throw new Error('No image returned from Imagen 3 capability');
            }
            const buffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
            console.log(`[illustrate] Character ${isSingle ? 'portrait' : 'reference'} via Imagen 3 + style ref (${(buffer.length / 1024).toFixed(0)} KB)`);
            return buffer;
        } catch (err) {
            console.warn('[illustrate] Imagen 3 capability with style ref failed, trying standard:', err);
        }
    }
    // Try Imagen 3 standard (no style reference)
    if (characters.length && VERTEX_PROJECT_ID) {
        try {
            console.log(`[illustrate] Generating character ${isSingle ? 'portrait' : 'reference sheet'} via Imagen 3...`);
            const prompt = buildRefPrompt('No text, words, or letters in the image.');
            const buffer = await generateWithImagen3Standard(prompt);
            console.log(`[illustrate] Character ${isSingle ? 'portrait' : 'reference'} via Imagen 3 (${(buffer.length / 1024).toFixed(0)} KB)`);
            return buffer;
        } catch (err) {
            console.warn('[illustrate] Imagen 3 character reference failed, trying Gemini Flash:', err);
        }
    }
    if (!characters.length || !process.env.GEMINI_API_KEY) {
        console.log('[illustrate] Skipping character reference: no characters or no API key');
        return null;
    }
    try {
        const prompt = buildRefPrompt('No text.');
        console.log('[illustrate] Generating character reference sheet via Gemini Flash...');
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp-image-generation',
            generationConfig: {
                // @ts-expect-error — responseModalities is valid for image generation models
                responseModalities: [
                    'IMAGE',
                    'TEXT'
                ]
            }
        });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const imagePart = response.candidates?.[0]?.content?.parts?.find((p)=>p.inlineData?.mimeType?.startsWith('image/'));
        if (!imagePart?.inlineData?.data) {
            console.warn('[illustrate] Character reference: no image in response');
            return null;
        }
        const buf = Buffer.from(imagePart.inlineData.data, 'base64');
        console.log(`[illustrate] Character reference via Gemini Flash (${(buf.length / 1024).toFixed(0)} KB)`);
        return buf;
    } catch (err) {
        console.error('[illustrate] Character reference generation failed:', err);
        return null;
    }
}
// ---------- Imagen 3 via Vertex AI ----------
/**
 * Generate with Imagen 3 standard model (imagen-3.0-generate-002).
 * Supports: seed for deterministic output, aspect ratio, negative prompts.
 * Strategy 1: Lock the Seed.
 */ async function generateWithImagen3Standard(prompt, seed) {
    const token = await getVertexAccessToken();
    const url = `https://${VERTEX_REGION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_REGION}/publishers/google/models/imagen-3.0-generate-002:predict`;
    console.log(`[illustrate] Imagen 3 standard generation${seed != null ? ` (seed=${seed})` : ''}`);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            instances: [
                {
                    prompt
                }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: '3:4',
                addWatermark: false,
                personGeneration: 'allow_all',
                safetySetting: 'block_only_high',
                negativePrompt: 'text, words, letters, writing, watermark, signature, blurry, low quality, inconsistent character appearance, different hairstyle, different clothing, different eye color, character redesign, wrong outfit color, extra arms, extra legs, extra fingers, six fingers, four arms, three arms, merged fingers, fused fingers, deformed hands, malformed hands, extra limbs, missing limbs, elongated neck, snake neck, distorted anatomy, extra ears, three eyes, deformed face, mutated body',
                ...seed != null ? {
                    seed
                } : {}
            }
        })
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Imagen 3 error: ${response.status} ${err}`);
    }
    const data = await response.json();
    const prediction = data.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
        throw new Error('No image returned from Imagen 3 (possibly filtered by safety)');
    }
    return Buffer.from(prediction.bytesBase64Encoded, 'base64');
}
/**
 * Generate with Imagen 3 capability model (imagen-3.0-capability-001).
 * Supports: subject reference images for character consistency.
 * Strategy 3: Character Reference — pass reference sheet as subject reference.
 * Strategy 5: Re-use Successful Images — pass previous page as style reference.
 */ async function generateWithImagen3WithReference(prompt, characterRefs, previousPageImage) {
    const token = await getVertexAccessToken();
    const url = `https://${VERTEX_REGION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_REGION}/publishers/google/models/imagen-3.0-capability-001:predict`;
    // Build reference images array — one subject reference per character portrait
    // Detect correct subject type (person, animal, product) from character description
    const referenceImages = characterRefs.map((ref, idx)=>{
        const { subjectType } = detectSubjectInfo(ref.description);
        return {
            referenceType: 'REFERENCE_TYPE_SUBJECT',
            referenceId: idx + 1,
            referenceImage: {
                bytesBase64Encoded: ref.buffer.toString('base64')
            },
            subjectImageConfig: {
                subjectDescription: `${ref.name} — MUST match exactly: ${ref.description}`,
                subjectType
            }
        };
    });
    // Add previous page as style reference for visual continuity (Strategy 5)
    // Style reference ID comes after all subject references
    if (previousPageImage) {
        referenceImages.push({
            referenceType: 'REFERENCE_TYPE_STYLE',
            referenceId: characterRefs.length + 1,
            referenceImage: {
                bytesBase64Encoded: previousPageImage.toString('base64')
            },
            styleImageConfig: {
                styleDescription: 'Maintain the same art style, color palette, visual mood, AND character appearances (identical hair, clothing, features) as this previous page'
            }
        });
    }
    console.log(`[illustrate] Imagen 3 capability generation (${characterRefs.length} subject ref${characterRefs.length > 1 ? 's' : ''}${previousPageImage ? ' + style ref' : ''})`);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            instances: [
                {
                    prompt,
                    referenceImages
                }
            ],
            parameters: {
                sampleCount: 1,
                personGeneration: 'allow_all',
                safetySetting: 'block_only_high'
            }
        })
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Imagen 3 capability error: ${response.status} ${err}`);
    }
    const data = await response.json();
    const prediction = data.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
        throw new Error('No image returned from Imagen 3 capability (possibly filtered)');
    }
    return Buffer.from(prediction.bytesBase64Encoded, 'base64');
}
// ---------- Gemini Flash (fallback with reference support) ----------
/** Extract image base64 from a Gemini response */ function extractBase64FromGeminiResponse(response) {
    const imagePart = response.candidates?.[0]?.content?.parts?.find((p)=>p.inlineData?.mimeType?.startsWith('image/'));
    if (!imagePart?.inlineData?.data) {
        throw new Error('No image returned from Gemini');
    }
    return imagePart.inlineData.data;
}
async function generateWithGemini(prompt, referenceImage, previousPageImage, seed) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp-image-generation',
        generationConfig: {
            // @ts-expect-error — responseModalities is valid for image generation models
            responseModalities: [
                'IMAGE',
                'TEXT'
            ],
            ...seed != null ? {
                seed
            } : {}
        }
    });
    const hasImages = referenceImage || previousPageImage;
    if (hasImages) {
        const parts = [];
        if (referenceImage) {
            parts.push({
                inlineData: {
                    mimeType: 'image/png',
                    data: referenceImage.toString('base64')
                }
            });
        }
        if (previousPageImage) {
            parts.push({
                inlineData: {
                    mimeType: 'image/png',
                    data: previousPageImage.toString('base64')
                }
            });
        }
        let instruction = '';
        if (referenceImage && previousPageImage) {
            instruction = 'IMAGE 1 is the character reference sheet. IMAGE 2 is the previous page illustration. ' + 'CHARACTER CONSISTENCY IS THE #1 PRIORITY. You MUST match EVERY attribute from the reference sheet: ' + 'exact hair color, length, and style; exact eye color and shape; exact skin tone; exact clothing items with their specific colors; ' + 'exact accessories; exact body proportions and build. Do NOT change ANY of these attributes. ' + 'Maintain the same art style, color palette, and lighting as the previous page for visual continuity. ';
        } else if (referenceImage) {
            instruction = 'The image above is the character reference sheet. ' + 'CHARACTER CONSISTENCY IS THE #1 PRIORITY. You MUST match EVERY attribute from this reference: ' + 'exact hair color, length, and style; exact eye color and shape; exact skin tone; exact clothing items with their specific colors; ' + 'exact accessories; exact body proportions and build. Do NOT change ANY of these attributes. ';
        } else if (previousPageImage) {
            instruction = 'The image above is the previous page illustration. ' + 'CHARACTER CONSISTENCY IS THE #1 PRIORITY. Maintain IDENTICAL character appearances — same hair, eyes, skin, outfit, accessories. ' + 'Also maintain the same art style, color palette, and visual mood for continuity. ';
        }
        instruction += 'ANATOMY: Humans must have exactly 2 arms, 2 legs, 5 fingers per hand, normal neck. Animals must have species-correct limb count. No extra limbs or merged fingers. ';
        parts.push({
            text: instruction + prompt
        });
        console.log(`[illustrate] Gemini Flash with${referenceImage ? ' reference' : ''}${previousPageImage ? ' + prev page' : ''}${seed != null ? ` (seed=${seed})` : ''}`);
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts
                }
            ]
        });
        const base64 = extractBase64FromGeminiResponse(result.response);
        return Buffer.from(base64, 'base64');
    }
    console.log(`[illustrate] Gemini Flash without reference${seed != null ? ` (seed=${seed})` : ''}`);
    const result = await model.generateContent(prompt);
    const base64 = extractBase64FromGeminiResponse(result.response);
    return Buffer.from(base64, 'base64');
}
// ---------- Other Fallbacks ----------
async function generateWithFal(prompt) {
    const response = await fetch('https://fal.run/fal-ai/flux/dev', {
        method: 'POST',
        headers: {
            'Authorization': `Key ${FAL_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt,
            image_size: 'landscape_16_9',
            num_inference_steps: 28,
            guidance_scale: 3.5
        })
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`fal.ai error: ${response.status} ${err}`);
    }
    const data = await response.json();
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) throw new Error('No image returned from fal.ai');
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error('Failed to download generated image');
    const ab = await imageResponse.arrayBuffer();
    return Buffer.from(ab);
}
async function generateWithDalle(prompt) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1792x1024',
            quality: 'standard',
            response_format: 'url'
        })
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`DALL-E error: ${response.status} ${err}`);
    }
    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) throw new Error('No image returned from DALL-E');
    // Download image and return buffer (caller uploads to R2)
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error('Failed to download generated image');
    const ab = await imageResponse.arrayBuffer();
    return {
        buffer: Buffer.from(ab),
        url: ''
    };
}
// ---------- Upload Helper ----------
async function uploadToStorage(buffer) {
    const filename = `illustrations/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$r2$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadToR2"])(filename, buffer, 'image/png');
}
async function generateIllustration(input) {
    let buffer = null;
    // Resolve character references: prefer per-character portraits (series mode),
    // fall back to single reference image (standalone mode)
    const charRefs = input.characterReferences?.length ? input.characterReferences : input.referenceImage && input.characters?.length ? [
        {
            name: 'characters',
            description: input.characters.map((c)=>`${c.name}: ${c.description}`).join('. '),
            buffer: input.referenceImage
        }
    ] : [];
    // --- Priority 1: Imagen 3 with subject/style reference (best consistency) ---
    if (VERTEX_PROJECT_ID && charRefs.length > 0) {
        try {
            const prompt = buildImagen3Prompt(input, charRefs.length);
            buffer = await generateWithImagen3WithReference(prompt, charRefs, input.previousPageImage);
            const url = await uploadToStorage(buffer);
            return {
                url,
                buffer
            };
        } catch (err) {
            console.warn('[illustrate] Imagen 3 capability failed, trying standard:', err);
        }
    }
    // --- Priority 2: Imagen 3 standard with seed (deterministic, no reference) ---
    if (VERTEX_PROJECT_ID) {
        try {
            const prompt = buildImagen3Prompt(input, 0);
            buffer = await generateWithImagen3Standard(prompt, input.seed);
            const url = await uploadToStorage(buffer);
            return {
                url,
                buffer
            };
        } catch (err) {
            console.warn('[illustrate] Imagen 3 standard failed, falling back to Gemini Flash:', err);
        }
    }
    // --- Priority 3: Gemini Flash (supports inline reference images, uses first ref only) ---
    if (process.env.GEMINI_API_KEY) {
        try {
            const prompt = buildPrompt(input);
            const firstRef = charRefs.length > 0 ? charRefs[0].buffer : undefined;
            buffer = await generateWithGemini(prompt, firstRef, input.previousPageImage, input.seed);
            const url = await uploadToStorage(buffer);
            return {
                url,
                buffer
            };
        } catch (err) {
            console.warn('[illustrate] Gemini Flash failed, falling back:', err);
        }
    }
    // --- Priority 4: fal.ai (no reference support) ---
    if (FAL_API_KEY) {
        const prompt = buildPrompt(input);
        buffer = await generateWithFal(prompt);
        const url = await uploadToStorage(buffer);
        return {
            url,
            buffer
        };
    }
    // --- Priority 5: DALL-E (no reference support) ---
    const prompt = buildPrompt(input);
    const dalleResult = await generateWithDalle(prompt);
    if (dalleResult.url) {
        return {
            url: dalleResult.url,
            buffer: dalleResult.buffer
        };
    }
    buffer = dalleResult.buffer;
    const url = await uploadToStorage(buffer);
    return {
        url,
        buffer
    };
}
}),
"[project]/app/api/v1/story/jobs/[id]/character-ref/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$job$2d$step$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/story/job-step.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$illustrate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/story/illustrate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$r2$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/r2.ts [app-route] (ecmascript)");
;
;
;
const POST = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$job$2d$step$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withJobStep"])('character_ref', async (ctx)=>{
    const { job, supabase } = ctx;
    const { concept, seriesId } = job.input;
    // Idempotent
    if (job.state.characterRefUrl || job.state.characterRefSkipped) {
        return {
            statePatch: {}
        };
    }
    const storyData = job.state.storyData;
    const characters = (storyData?.characters || []).map((c)=>({
            name: c.name,
            description: c.description
        }));
    // Check for existing series character portraits
    let seriesReferenceImages = [];
    if (seriesId) {
        try {
            const { data: seriesData } = await supabase.rpc('get_series_with_characters', {
                p_series_id: seriesId,
                p_user_id: job.user_id
            });
            const series = Array.isArray(seriesData) ? seriesData?.[0] : seriesData;
            if (series) {
                const chars = series.characters || [];
                const approvedChars = chars.filter((c)=>c.status === 'approved' && c.referenceImageUrl);
                for (const c of approvedChars){
                    try {
                        const res = await fetch(c.referenceImageUrl);
                        if (res.ok) {
                            const buf = Buffer.from(await res.arrayBuffer());
                            seriesReferenceImages.push({
                                name: c.name,
                                description: c.description,
                                buffer: buf
                            });
                        }
                    } catch  {}
                }
            }
        } catch (err) {
            console.error('[character-ref] Failed to load series characters:', err);
        }
    }
    if (seriesReferenceImages.length > 0) {
        // Series mode: store character ref metadata (buffers re-fetched by illustrate step)
        const charNames = seriesReferenceImages.map((r)=>r.name);
        return {
            statePatch: {
                characterRefMode: 'series',
                characterRefNames: charNames
            }
        };
    }
    // Standalone mode: generate new reference sheet
    let referenceImage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$illustrate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateCharacterReference"])(characters, concept.tags.style);
    // Retry once
    if (!referenceImage) {
        referenceImage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$illustrate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateCharacterReference"])(characters, concept.tags.style);
    }
    if (referenceImage) {
        const refPath = `jobs/${job.id}/character-ref.png`;
        const refUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$r2$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadToR2"])(refPath, referenceImage, 'image/png', {
            upsert: true
        });
        return {
            statePatch: {
                characterRefUrl: refUrl,
                characterRefMode: 'standalone'
            }
        };
    }
    // No reference available — continue without it
    return {
        statePatch: {
            characterRefSkipped: true
        }
    };
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__81d052e6._.js.map