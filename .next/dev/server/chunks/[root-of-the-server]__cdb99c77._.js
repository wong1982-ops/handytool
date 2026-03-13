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
"[project]/app/api/v1/analytics/track/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$ua$2d$parser$2d$js$40$2$2e$0$2e$9$2f$node_modules$2f$ua$2d$parser$2d$js$2f$src$2f$main$2f$ua$2d$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/ua-parser-js@2.0.9/node_modules/ua-parser-js/src/main/ua-parser.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
;
;
;
const DEVICE_MAP = {
    console: 'desktop',
    mobile: 'mobile',
    tablet: 'tablet',
    smarttv: 'desktop',
    wearable: 'mobile',
    embedded: 'desktop'
};
async function POST(request) {
    try {
        const body = await request.json();
        const { session_id, page_path, tool_slug, referrer, duration_ms } = body;
        // Basic validation
        if (!session_id || typeof session_id !== 'string' || session_id.length > 100) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid session_id'
            }, {
                status: 400
            });
        }
        if (!page_path || typeof page_path !== 'string' || page_path.length > 500) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid page_path'
            }, {
                status: 400
            });
        }
        if (tool_slug !== undefined && tool_slug !== null && (typeof tool_slug !== 'string' || tool_slug.length > 100)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid tool_slug'
            }, {
                status: 400
            });
        }
        if (duration_ms !== undefined && duration_ms !== null && (typeof duration_ms !== 'number' || duration_ms < 0 || duration_ms > 86400000)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid duration_ms'
            }, {
                status: 400
            });
        }
        // Parse User-Agent
        const uaResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$ua$2d$parser$2d$js$40$2$2e$0$2e$9$2f$node_modules$2f$ua$2d$parser$2d$js$2f$src$2f$main$2f$ua$2d$parser$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UAParser"])(request.headers.get('user-agent') || '');
        const deviceResult = uaResult.device;
        const browserResult = uaResult.browser;
        const osResult = uaResult.os;
        const device_type = DEVICE_MAP[deviceResult.type || ''] || 'desktop';
        const browser = browserResult.name || 'Unknown';
        const os = osResult.name || 'Unknown';
        // Insert into Supabase
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { error } = await supabase.from('page_events').insert({
            session_id,
            page_path,
            tool_slug: tool_slug || null,
            referrer: typeof referrer === 'string' ? referrer.slice(0, 500) : null,
            duration_ms: typeof duration_ms === 'number' ? Math.round(duration_ms) : null,
            device_type,
            browser,
            os
        });
        if (error) {
            console.error('Analytics insert error:', error.message);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
                status: 204
            });
        }
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
            status: 204
        });
    } catch  {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
            status: 204
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cdb99c77._.js.map