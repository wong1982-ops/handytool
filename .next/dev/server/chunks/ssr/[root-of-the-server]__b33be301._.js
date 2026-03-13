module.exports = [
"[project]/app/icon.png.mjs { IMAGE => \"[project]/app/icon.png (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/icon.png.mjs { IMAGE => \"[project]/app/icon.png (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/not-found.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/not-found.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/tools/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/tools/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/tools/story-studio/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/tools/story-studio/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/lib/local-dev.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/supabase/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.95.3/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$local$2d$dev$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/local-dev.ts [app-rsc] (ecmascript)");
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
    _devClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://wgrcfnumbozvtmhcavnm.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncmNmbnVtYm96dnRtaGNhdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczNjMsImV4cCI6MjA4NjE5MzM2M30.m1FZNFbzKQ0NeN-YTkwxu9dQ_n4AwZMoNAxdj2Mr3UQ"));
    return _devClient;
}
async function createClient() {
    // Local dev: use local Supabase URL + service role key (bypasses RLS)
    if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$local$2d$dev$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isLocalDev"]) {
        const url = ("TURBOPACK compile-time value", "http://127.0.0.1:54321") || 'http://127.0.0.1:54321';
        const key = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncmNmbnVtYm96dnRtaGNhdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczNjMsImV4cCI6MjA4NjE5MzM2M30.m1FZNFbzKQ0NeN-YTkwxu9dQ_n4AwZMoNAxdj2Mr3UQ");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(url, key, {
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
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://wgrcfnumbozvtmhcavnm.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncmNmbnVtYm96dnRtaGNhdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczNjMsImV4cCI6MjA4NjE5MzM2M30.m1FZNFbzKQ0NeN-YTkwxu9dQ_n4AwZMoNAxdj2Mr3UQ"), {
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
"[project]/app/tools/story-studio/book/[slug]/book-reader-client.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BookReaderClient",
    ()=>BookReaderClient
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BookReaderClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BookReaderClient() from the server but BookReaderClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/tools/story-studio/book/[slug]/book-reader-client.tsx <module evaluation>", "BookReaderClient");
}),
"[project]/app/tools/story-studio/book/[slug]/book-reader-client.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BookReaderClient",
    ()=>BookReaderClient
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BookReaderClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BookReaderClient() from the server but BookReaderClient is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/tools/story-studio/book/[slug]/book-reader-client.tsx", "BookReaderClient");
}),
"[project]/app/tools/story-studio/book/[slug]/book-reader-client.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/book-reader-client.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/book-reader-client.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/tools/story-studio/book/[slug]/book-reader-fallback.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BookReaderFallback",
    ()=>BookReaderFallback
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BookReaderFallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BookReaderFallback() from the server but BookReaderFallback is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/tools/story-studio/book/[slug]/book-reader-fallback.tsx <module evaluation>", "BookReaderFallback");
}),
"[project]/app/tools/story-studio/book/[slug]/book-reader-fallback.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BookReaderFallback",
    ()=>BookReaderFallback
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BookReaderFallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BookReaderFallback() from the server but BookReaderFallback is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/tools/story-studio/book/[slug]/book-reader-fallback.tsx", "BookReaderFallback");
}),
"[project]/app/tools/story-studio/book/[slug]/book-reader-fallback.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$fallback$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/book-reader-fallback.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$fallback$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/book-reader-fallback.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$fallback$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/tools/story-studio/book/[slug]/back-button.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BackButton",
    ()=>BackButton
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BackButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BackButton() from the server but BackButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/tools/story-studio/book/[slug]/back-button.tsx <module evaluation>", "BackButton");
}),
"[project]/app/tools/story-studio/book/[slug]/back-button.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BackButton",
    ()=>BackButton
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BackButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BackButton() from the server but BackButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/tools/story-studio/book/[slug]/back-button.tsx", "BackButton");
}),
"[project]/app/tools/story-studio/book/[slug]/back-button.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$back$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/back-button.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$back$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/back-button.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$back$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/tools/story-studio/book/[slug]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BookPage,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.95.3/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$local$2d$dev$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/local-dev.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_@playwright+test@1.58.2_react-dom@19.2.3_react@19.2.3__react@19.2.3_sass@1.97.3/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/book-reader-client.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$fallback$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/book-reader-fallback.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$back$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/back-button.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
async function getCurrentUserId() {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$local$2d$dev$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isLocalDev"]) return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$local$2d$dev$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LOCAL_DEV_USER_ID"];
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) return user.id;
    } catch  {}
    if ("TURBOPACK compile-time truthy", 1) {
        return process.env.DEV_USER_ID;
    }
    //TURBOPACK unreachable
    ;
}
/**
 * Fetch book shell (metadata without pages) — cached via ISR.
 * Public books are served from edge cache instantly.
 * Cache is keyed by slug and revalidated every hour.
 */ /**
 * Try shell RPC (fast, no pages). Falls back to full get_book_by_slug if shell RPC doesn't exist.
 */ async function fetchBookShell(slug, userId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // Try lightweight shell RPC first
    const { data, error } = await supabase.rpc('get_book_shell_by_slug', {
        p_slug: slug,
        p_user_id: userId
    });
    if (!error && data) {
        const book = Array.isArray(data) ? data[0] : data;
        if (book) return {
            ...book,
            _mode: 'shell'
        };
    }
    // Fallback: use original full RPC
    console.warn('[book] get_book_shell_by_slug failed, using get_book_by_slug fallback', error?.message);
    const { data: fullData, error: fullErr } = await supabase.rpc('get_book_by_slug', {
        p_slug: slug,
        p_user_id: userId
    });
    if (fullErr) {
        console.error('[book] get_book_by_slug failed:', fullErr.message);
        return null;
    }
    const book = Array.isArray(fullData) ? fullData[0] : fullData;
    if (!book) return null;
    // Extract page count and mark as full mode (pages already loaded)
    const bookData = book.data;
    const pages = bookData?.pages;
    return {
        ...book,
        page_count: pages?.length ?? 0,
        _mode: 'full'
    };
}
/**
 * Cached version for public books (no user context).
 * Uses a standalone anon client (no cookies) so it's safe inside unstable_cache.
 */ const getCachedBookShell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["unstable_cache"])(async (slug)=>{
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://wgrcfnumbozvtmhcavnm.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncmNmbnVtYm96dnRtaGNhdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTczNjMsImV4cCI6MjA4NjE5MzM2M30.m1FZNFbzKQ0NeN-YTkwxu9dQ_n4AwZMoNAxdj2Mr3UQ"));
    const { data, error } = await supabase.rpc('get_book_shell_by_slug', {
        p_slug: slug,
        p_user_id: null
    });
    if (!error && data) {
        const book = Array.isArray(data) ? data[0] : data;
        if (book) return {
            ...book,
            _mode: 'shell'
        };
    }
    // Fallback
    const { data: fullData, error: fullErr } = await supabase.rpc('get_book_by_slug', {
        p_slug: slug,
        p_user_id: null
    });
    if (fullErr || !fullData) return null;
    const book = Array.isArray(fullData) ? fullData[0] : fullData;
    if (!book) return null;
    const bookData = book.data;
    const pages = bookData?.pages;
    return {
        ...book,
        page_count: pages?.length ?? 0,
        _mode: 'full'
    };
}, [
    'book-shell'
], {
    revalidate: 3600,
    tags: [
        'book-shell'
    ]
});
/** Fetch initial pages (first batch) for SSR */ async function fetchInitialPages(bookId, userId) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: pages, error } = await supabase.rpc('get_book_pages', {
        p_book_id: bookId,
        p_user_id: userId,
        p_offset: 0,
        p_limit: 4
    });
    if (error) {
        console.warn('[book] get_book_pages failed, skipping lazy load:', error.message);
        return null // null = RPC doesn't exist, use full data
        ;
    }
    return (pages || []).map((row)=>row.page_data);
}
async function getBook(slug) {
    const currentUserId = await getCurrentUserId();
    // Try cached shell first (works for public books)
    let shell = await getCachedBookShell(slug);
    // If no cached result, try with user auth (private book)
    if (!shell && currentUserId) {
        shell = await fetchBookShell(slug, currentUserId);
    }
    if (!shell) {
        return {
            shell: null,
            initialPages: null,
            currentUserId,
            dbError: false
        };
    }
    // If full mode (fallback), pages are already in the data — no lazy load needed
    if (shell._mode === 'full') {
        return {
            shell,
            initialPages: null,
            currentUserId,
            dbError: false
        };
    }
    // Shell mode: fetch first batch of pages for lazy loading
    const initialPages = await fetchInitialPages(shell.id, currentUserId ?? null);
    return {
        shell,
        initialPages,
        currentUserId,
        dbError: false
    };
}
async function generateMetadata({ params }) {
    const { slug } = await params;
    // Use cached shell for metadata (fast, no pages needed)
    let shell = await getCachedBookShell(slug);
    if (!shell) {
        const currentUserId = await getCurrentUserId();
        if (currentUserId) {
            shell = await fetchBookShell(slug, currentUserId);
        }
    }
    if (!shell) {
        return {
            title: 'Story Studio'
        };
    }
    const bookData = shell.data;
    const concept = bookData.concept;
    const sections = concept?.sections;
    const title = bookData.title || 'Untitled';
    const description = sections?.premise || 'An AI-generated story book';
    const coverImage = bookData.coverImageUrl || undefined;
    return {
        title: `${title} | Story Studio`,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            ...coverImage ? {
                images: [
                    {
                        url: coverImage,
                        width: 1200,
                        height: 630
                    }
                ]
            } : {}
        },
        twitter: {
            card: coverImage ? 'summary_large_image' : 'summary',
            title,
            description,
            ...coverImage ? {
                images: [
                    coverImage
                ]
            } : {}
        }
    };
}
function BookPageShell({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50 dark:bg-slate-950",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3 mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$back$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BackButton"], {}, void 0, false, {
                            fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                            lineNumber: 204,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/tools/story-studio",
                            className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--tk-color-primary-500,#3D6AF2)] text-white text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap ml-auto",
                            style: {
                                minHeight: '40px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-4 h-4",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: 2,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        d: "M12 4.5v15m7.5-7.5h-15"
                                    }, void 0, false, {
                                        fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                                        lineNumber: 211,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                                    lineNumber: 210,
                                    columnNumber: 13
                                }, this),
                                "Create Your Own Story"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                            lineNumber: 205,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                    lineNumber: 203,
                    columnNumber: 9
                }, this),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
            lineNumber: 201,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
        lineNumber: 200,
        columnNumber: 5
    }, this);
}
async function BookPage({ params }) {
    const { slug } = await params;
    const { shell, initialPages, currentUserId } = await getBook(slug);
    // No shell found — try full fallback (client-side loading)
    if (!shell) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(BookPageShell, {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$fallback$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BookReaderFallback"], {
                slug: slug
            }, void 0, false, {
                fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                lineNumber: 230,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
            lineNumber: 229,
            columnNumber: 7
        }, this);
    }
    const bookData = shell.data;
    const concept = bookData.concept;
    const sections = concept?.sections;
    const title = bookData.title || 'Untitled';
    const authors = bookData.authors || [];
    const premise = sections?.premise || '';
    const coverImage = bookData.coverImageUrl || null;
    const isOwner = !!(currentUserId && shell.user_id === currentUserId);
    const bookId = shell.id;
    const pageCount = shell.page_count || 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(BookPageShell, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sr-only",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                        lineNumber: 251,
                        columnNumber: 9
                    }, this),
                    authors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "Written by ",
                            authors.join(' & ')
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                        lineNumber: 252,
                        columnNumber: 32
                    }, this),
                    premise && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: premise
                    }, void 0, false, {
                        fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                        lineNumber: 253,
                        columnNumber: 21
                    }, this),
                    coverImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: coverImage,
                        alt: title
                    }, void 0, false, {
                        fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                        lineNumber: 254,
                        columnNumber: 24
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                lineNumber: 250,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_$40$playwright$2b$test$40$1$2e$58$2e$2_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3_sass$40$1$2e$97$2e$3$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$tools$2f$story$2d$studio$2f$book$2f5b$slug$5d2f$book$2d$reader$2d$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BookReaderClient"], {
                bookData: bookData,
                bookId: bookId,
                isOwner: isOwner,
                ...initialPages !== null ? {
                    initialPages: initialPages,
                    pageCount
                } : {}
            }, void 0, false, {
                fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/tools/story-studio/book/[slug]/page.tsx",
        lineNumber: 248,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/tools/story-studio/book/[slug]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/tools/story-studio/book/[slug]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b33be301._.js.map