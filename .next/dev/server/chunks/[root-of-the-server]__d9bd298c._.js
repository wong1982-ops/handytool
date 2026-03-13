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
"[project]/lib/story/r2-seeds.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupJobSeeds",
    ()=>cleanupJobSeeds,
    "downloadSeedBuffer",
    ()=>downloadSeedBuffer,
    "uploadSeedBuffer",
    ()=>uploadSeedBuffer
]);
/**
 * R2 storage helpers for illustration seed buffers.
 *
 * Seed buffers (raw image data, potentially >4MB) are stored in R2 under
 * `jobs/{jobId}/seed-{page}` for sequential page illustration chaining.
 *
 * Each page's buffer is passed as `previousPageImage` to the next page
 * for visual continuity (Strategy 5: Re-use Successful Images).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1005$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__ = __turbopack_context__.i("[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs, [project]/node_modules/.pnpm/@aws-sdk+client-s3@3.1005.0/node_modules/@aws-sdk/client-s3)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$r2$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/r2.ts [app-route] (ecmascript)");
;
;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || 'story-assets';
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
/** R2 key for a seed buffer. */ function seedKey(jobId, page) {
    return `jobs/${jobId}/seed-${page}`;
}
async function uploadSeedBuffer(jobId, page, buffer) {
    const key = seedKey(jobId, page);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$r2$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadToR2"])(key, buffer, 'application/octet-stream', {
        upsert: true
    });
    console.log(`[r2-seeds] Uploaded seed for job ${jobId} page ${page} (${(buffer.length / 1024).toFixed(0)} KB)`);
}
async function downloadSeedBuffer(jobId, page) {
    const key = seedKey(jobId, page);
    try {
        const client = getClient();
        const response = await client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$client$2d$s3$40$3$2e$1005$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["GetObjectCommand"]({
            Bucket: R2_BUCKET,
            Key: key
        }));
        if (!response.Body) return null;
        // Convert readable stream to Buffer
        const chunks = [];
        const stream = response.Body;
        for await (const chunk of stream){
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        console.log(`[r2-seeds] Downloaded seed for job ${jobId} page ${page} (${(buffer.length / 1024).toFixed(0)} KB)`);
        return buffer;
    } catch (err) {
        // NoSuchKey = seed doesn't exist yet (expected for page 1)
        if (err instanceof Error && 'name' in err && err.name === 'NoSuchKey') {
            return null;
        }
        console.error(`[r2-seeds] Failed to download seed for job ${jobId} page ${page}:`, err);
        return null;
    }
}
async function cleanupJobSeeds(jobId, totalPages) {
    if (totalPages <= 0) return;
    // Build list of all possible seed keys: cover seed + page seeds
    const keys = [];
    for(let page = 0; page <= totalPages; page++){
        keys.push(seedKey(jobId, page));
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$r2$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteManyFromR2"])(keys);
        console.log(`[r2-seeds] Cleaned up ${keys.length} seeds for job ${jobId}`);
    } catch (err) {
        console.error(`[r2-seeds] Failed to cleanup seeds for job ${jobId}:`, err);
    }
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[project]/lib/supabase/admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAdminSupabase",
    ()=>getAdminSupabase
]);
/**
 * Service-role Supabase client for background jobs and internal API routes.
 * Bypasses RLS — use only in server-side code that doesn't have a user session.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.95.3/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
let _adminClient = null;
function getAdminSupabase() {
    if (_adminClient) return _adminClient;
    // Production: SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL
    // Local dev:  SUPABASE_LOCAL_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_LOCAL_URL
    const prodKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const localKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
    let url;
    let key;
    if (prodKey) {
        url = ("TURBOPACK compile-time value", "https://wgrcfnumbozvtmhcavnm.supabase.co");
        key = prodKey;
    } else if (localKey) {
        // Local dev: always use local Supabase URL with local service role key
        url = ("TURBOPACK compile-time value", "http://127.0.0.1:54321") || 'http://127.0.0.1:54321';
        key = localKey;
    } else {
        throw new Error('Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY (production) or SUPABASE_LOCAL_SERVICE_ROLE_KEY (local dev).');
    }
    _adminClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key);
    return _adminClient;
}
}),
"[project]/lib/notifications/push.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "notifyBookComplete",
    ()=>notifyBookComplete,
    "sendPushToUser",
    ()=>sendPushToUser
]);
/**
 * Web Push notification helpers.
 * Used by background job steps to notify users when their book is ready.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$web$2d$push$40$3$2e$6$2e$7$2f$node_modules$2f$web$2d$push$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/admin.ts [app-route] (ecmascript)");
;
;
const VAPID_PUBLIC_KEY = ("TURBOPACK compile-time value", "BP8D46YTkNkqaFUbj8FAPBN6H2hDDTkWKPTOE-kCQpKmWpIH5NSmDrkRJqtX9YRRjMSFc21ZPssK4d6vbPWde2c") || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:loicwong1982@gmail.com';
let vapidConfigured = false;
function ensureVapid() {
    if (vapidConfigured) return;
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn('[push] VAPID keys not configured — push notifications disabled');
        return;
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$web$2d$push$40$3$2e$6$2e$7$2f$node_modules$2f$web$2d$push$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    vapidConfigured = true;
}
async function sendPushToUser(userId, payload) {
    ensureVapid();
    if (!vapidConfigured) return;
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdminSupabase"])();
    // Check user prefs
    const { data: prefs } = await supabase.from('user_notification_prefs').select('push_on_book_complete').eq('user_id', userId).single();
    // Default is true if no prefs row exists
    if (prefs && prefs.push_on_book_complete === false) {
        return;
    }
    // Get all push subscriptions for this user
    const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', userId);
    if (error || !subscriptions?.length) {
        return;
    }
    const jsonPayload = JSON.stringify(payload);
    const expiredIds = [];
    await Promise.allSettled(subscriptions.map(async (sub)=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$web$2d$push$40$3$2e$6$2e$7$2f$node_modules$2f$web$2d$push$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sendNotification({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }, jsonPayload, {
                TTL: 86400
            });
        } catch (err) {
            const statusCode = err?.statusCode;
            if (statusCode === 404 || statusCode === 410) {
                // Subscription expired or unsubscribed — mark for cleanup
                expiredIds.push(sub.id);
            } else {
                console.error(`[push] Failed to send to ${sub.endpoint}:`, err);
            }
        }
    }));
    // Clean up expired subscriptions
    if (expiredIds.length > 0) {
        await supabase.from('push_subscriptions').delete().in('id', expiredIds);
    }
}
async function notifyBookComplete(userId, bookTitle, bookSlug, coverUrl) {
    await sendPushToUser(userId, {
        title: 'Your Book is Ready!',
        body: `"${bookTitle}" has been illustrated and narrated. Tap to read.`,
        icon: coverUrl || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        url: `/tools/story-studio/book/${bookSlug}`,
        tag: `book-complete-${bookSlug}`
    });
}
}),
"[project]/lib/notifications/email.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "emailBookComplete",
    ()=>emailBookComplete
]);
/**
 * Email notification helpers for Story Studio.
 * Reuses existing nodemailer/Gmail SMTP configuration.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$nodemailer__$5b$external$5d$__$28$nodemailer$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nodemailer$40$8$2e$0$2e$1$2f$node_modules$2f$nodemailer$29$__ = __turbopack_context__.i("[externals]/nodemailer [external] (nodemailer, cjs, [project]/node_modules/.pnpm/nodemailer@8.0.1/node_modules/nodemailer)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/admin.ts [app-route] (ecmascript)");
;
;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
function createTransport() {
    if (!SMTP_USER || !SMTP_PASS) {
        console.warn('[email] SMTP credentials not configured — email notifications disabled');
        return null;
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$nodemailer__$5b$external$5d$__$28$nodemailer$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nodemailer$40$8$2e$0$2e$1$2f$node_modules$2f$nodemailer$29$__["default"].createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
}
async function emailBookComplete(userId, bookTitle, bookSlug, coverUrl) {
    const transport = createTransport();
    if (!transport) return;
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdminSupabase"])();
    // Check user prefs
    const { data: prefs } = await supabase.from('user_notification_prefs').select('email_on_book_complete').eq('user_id', userId).single();
    if (prefs && prefs.email_on_book_complete === false) {
        return;
    }
    // Get user email from auth
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const email = userData?.user?.email;
    if (!email) {
        console.warn(`[email] No email found for user ${userId}`);
        return;
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com';
    const bookUrl = `${siteUrl}/tools/story-studio/book/${bookSlug}`;
    const coverHtml = coverUrl ? `<img src="${coverUrl}" alt="Book cover" style="width:200px;height:auto;border-radius:12px;margin:0 auto 24px;display:block;box-shadow:0 4px 20px rgba(0,0,0,0.15);" />` : '';
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
</html>`;
    try {
        await transport.sendMail({
            from: `"Toolk1t Story Studio" <${SMTP_USER}>`,
            to: email,
            subject: `✨ "${bookTitle}" is ready to read!`,
            html
        });
        console.log(`[email] Book completion email sent to ${email}`);
    } catch (err) {
        console.error('[email] Failed to send book completion email:', err);
    }
}
}),
"[project]/app/api/v1/story/jobs/[id]/save/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$job$2d$step$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/story/job-step.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$r2$2d$seeds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/story/r2-seeds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2f$push$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/notifications/push.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2f$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/notifications/email.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/cache.js [app-route] (ecmascript)");
;
;
;
;
;
const POST = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$job$2d$step$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withJobStep"])('save', async (ctx)=>{
    const { job, supabase } = ctx;
    const { concept, seriesId } = job.input;
    // Idempotent
    if (job.book_id) {
        return {
            statePatch: {}
        };
    }
    const storyData = job.state.storyData;
    const slug = job.state.slug;
    const authorName = job.state.authorName || 'Anonymous';
    const coverUrl = job.state.coverUrl;
    const illustratedPages = job.state.pages ?? [];
    const audioPages = job.state.audio ?? [];
    const voiceMap = job.state.voiceMap;
    const now = new Date().toISOString();
    const bookId = `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    // Merge illustrations and audio into pages
    const rawPages = storyData?.pages || [];
    const pagesWithAssets = rawPages.map((page, i)=>{
        const seq = page.sequence ?? i + 1;
        const illustration = illustratedPages.find((p)=>p.seq === seq);
        const audio = audioPages.find((a)=>a.seq === seq);
        return {
            ...page,
            sequence: seq,
            imageUrl: illustration?.imageUrl || '',
            imageStatus: illustration?.imageUrl ? 'done' : 'error',
            audioUrl: audio?.audioUrl || undefined
        };
    });
    const finalBook = {
        id: bookId,
        slug,
        title: storyData?.title || concept.title,
        authors: [
            'AI',
            authorName
        ],
        coverImageUrl: coverUrl,
        concept,
        theme: storyData?.theme || '',
        setting: storyData?.setting || '',
        characters: storyData?.characters || [],
        pages: pagesWithAssets,
        voiceMap,
        status: 'complete',
        createdAt: now,
        updatedAt: now
    };
    // Save to books table
    const { data: insertedBook, error: insertError } = await supabase.rpc('insert_book', {
        p_user_id: job.user_id,
        p_slug: slug,
        p_data: finalBook,
        p_is_public: false,
        p_series_id: seriesId ?? null
    });
    if (insertError) {
        console.error('[save] Failed to save book:', insertError);
        throw new Error(`Failed to save book: ${insertError.message}`);
    }
    // Extract the book UUID from the RPC result
    const row = Array.isArray(insertedBook) ? insertedBook[0] : insertedBook;
    const savedBookId = row?.id || row?.book_id;
    // Complete the job
    if (savedBookId) {
        await supabase.rpc('complete_job', {
            p_job_id: job.id,
            p_book_id: savedBookId
        });
    }
    // Confirm credit reservation
    if (job.credits_reservation_id) {
        try {
            const { data: confirmResult } = await supabase.rpc('confirm_reserved_credits', {
                p_reservation_id: job.credits_reservation_id,
                p_description: `Story Studio — ${finalBook.title}`
            });
            const confirmRow = Array.isArray(confirmResult) ? confirmResult[0] : confirmResult;
            const txnId = confirmRow?.transaction_id;
            if (txnId) {
                await supabase.rpc('update_credit_transaction_metadata', {
                    p_txn_id: txnId,
                    p_metadata: {
                        reservation_id: job.credits_reservation_id,
                        book_slug: slug,
                        book_title: finalBook.title
                    }
                });
            }
        } catch (err) {
            console.error('[save] Failed to confirm credits:', err);
        }
    }
    // Cleanup seed buffers from R2
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$story$2f$r2$2d$seeds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanupJobSeeds"])(job.id, job.total_pages);
    // Revalidate static pages
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["revalidatePath"])(`/tools/story-studio/book/${slug}`);
    } catch  {}
    // Send notifications (fire-and-forget — don't block save completion)
    Promise.allSettled([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2f$push$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyBookComplete"])(job.user_id, finalBook.title, slug, coverUrl),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2f$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emailBookComplete"])(job.user_id, finalBook.title, slug, coverUrl)
    ]).catch(()=>{});
    return {
        statePatch: {
            bookId: savedBookId,
            savedAt: now
        }
    };
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d9bd298c._.js.map