module.exports = [
"[project]/node_modules/.pnpm/@supabase+functions-js@2.95.3/node_modules/@supabase/functions-js/dist/module/types.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Base error for Supabase Edge Function invocations.
 *
 * @example
 * ```ts
 * import { FunctionsError } from '@supabase/functions-js'
 *
 * throw new FunctionsError('Unexpected error invoking function', 'FunctionsError', {
 *   requestId: 'abc123',
 * })
 * ```
 */ __turbopack_context__.s([
    "FunctionRegion",
    ()=>FunctionRegion,
    "FunctionsError",
    ()=>FunctionsError,
    "FunctionsFetchError",
    ()=>FunctionsFetchError,
    "FunctionsHttpError",
    ()=>FunctionsHttpError,
    "FunctionsRelayError",
    ()=>FunctionsRelayError
]);
class FunctionsError extends Error {
    constructor(message, name = 'FunctionsError', context){
        super(message);
        this.name = name;
        this.context = context;
    }
}
class FunctionsFetchError extends FunctionsError {
    constructor(context){
        super('Failed to send a request to the Edge Function', 'FunctionsFetchError', context);
    }
}
class FunctionsRelayError extends FunctionsError {
    constructor(context){
        super('Relay Error invoking the Edge Function', 'FunctionsRelayError', context);
    }
}
class FunctionsHttpError extends FunctionsError {
    constructor(context){
        super('Edge Function returned a non-2xx status code', 'FunctionsHttpError', context);
    }
}
var FunctionRegion;
(function(FunctionRegion) {
    FunctionRegion["Any"] = "any";
    FunctionRegion["ApNortheast1"] = "ap-northeast-1";
    FunctionRegion["ApNortheast2"] = "ap-northeast-2";
    FunctionRegion["ApSouth1"] = "ap-south-1";
    FunctionRegion["ApSoutheast1"] = "ap-southeast-1";
    FunctionRegion["ApSoutheast2"] = "ap-southeast-2";
    FunctionRegion["CaCentral1"] = "ca-central-1";
    FunctionRegion["EuCentral1"] = "eu-central-1";
    FunctionRegion["EuWest1"] = "eu-west-1";
    FunctionRegion["EuWest2"] = "eu-west-2";
    FunctionRegion["EuWest3"] = "eu-west-3";
    FunctionRegion["SaEast1"] = "sa-east-1";
    FunctionRegion["UsEast1"] = "us-east-1";
    FunctionRegion["UsWest1"] = "us-west-1";
    FunctionRegion["UsWest2"] = "us-west-2";
})(FunctionRegion || (FunctionRegion = {})); //# sourceMappingURL=types.js.map
}),
"[project]/node_modules/.pnpm/@supabase+functions-js@2.95.3/node_modules/@supabase/functions-js/dist/module/helper.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveFetch",
    ()=>resolveFetch
]);
const resolveFetch = (customFetch)=>{
    if (customFetch) {
        return (...args)=>customFetch(...args);
    }
    return (...args)=>fetch(...args);
}; //# sourceMappingURL=helper.js.map
}),
"[project]/node_modules/.pnpm/@supabase+functions-js@2.95.3/node_modules/@supabase/functions-js/dist/module/FunctionsClient.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FunctionsClient",
    ()=>FunctionsClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tslib$40$2$2e$8$2e$1$2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.es6.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$helper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+functions-js@2.95.3/node_modules/@supabase/functions-js/dist/module/helper.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+functions-js@2.95.3/node_modules/@supabase/functions-js/dist/module/types.js [app-route] (ecmascript)");
;
;
;
class FunctionsClient {
    /**
     * Creates a new Functions client bound to an Edge Functions URL.
     *
     * @example
     * ```ts
     * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
     *
     * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
     *   headers: { apikey: 'public-anon-key' },
     *   region: FunctionRegion.UsEast1,
     * })
     * ```
     */ constructor(url, { headers = {}, customFetch, region = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FunctionRegion"].Any } = {}){
        this.url = url;
        this.headers = headers;
        this.region = region;
        this.fetch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$helper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveFetch"])(customFetch);
    }
    /**
     * Updates the authorization header
     * @param token - the new jwt token sent in the authorisation header
     * @example
     * ```ts
     * functions.setAuth(session.access_token)
     * ```
     */ setAuth(token) {
        this.headers.Authorization = `Bearer ${token}`;
    }
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     * @example
     * ```ts
     * const { data, error } = await functions.invoke('hello-world', {
     *   body: { name: 'Ada' },
     * })
     * ```
     */ invoke(functionName_1) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tslib$40$2$2e$8$2e$1$2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__awaiter"])(this, arguments, void 0, function*(functionName, options = {}) {
            var _a;
            let timeoutId;
            let timeoutController;
            try {
                const { headers, method, body: functionArgs, signal, timeout } = options;
                let _headers = {};
                let { region } = options;
                if (!region) {
                    region = this.region;
                }
                // Add region as query parameter using URL API
                const url = new URL(`${this.url}/${functionName}`);
                if (region && region !== 'any') {
                    _headers['x-region'] = region;
                    url.searchParams.set('forceFunctionRegion', region);
                }
                let body;
                if (functionArgs && (headers && !Object.prototype.hasOwnProperty.call(headers, 'Content-Type') || !headers)) {
                    if (typeof Blob !== 'undefined' && functionArgs instanceof Blob || functionArgs instanceof ArrayBuffer) {
                        // will work for File as File inherits Blob
                        // also works for ArrayBuffer as it is the same underlying structure as a Blob
                        _headers['Content-Type'] = 'application/octet-stream';
                        body = functionArgs;
                    } else if (typeof functionArgs === 'string') {
                        // plain string
                        _headers['Content-Type'] = 'text/plain';
                        body = functionArgs;
                    } else if (typeof FormData !== 'undefined' && functionArgs instanceof FormData) {
                        // don't set content-type headers
                        // Request will automatically add the right boundary value
                        body = functionArgs;
                    } else {
                        // default, assume this is JSON
                        _headers['Content-Type'] = 'application/json';
                        body = JSON.stringify(functionArgs);
                    }
                } else {
                    if (functionArgs && typeof functionArgs !== 'string' && !(typeof Blob !== 'undefined' && functionArgs instanceof Blob) && !(functionArgs instanceof ArrayBuffer) && !(typeof FormData !== 'undefined' && functionArgs instanceof FormData)) {
                        body = JSON.stringify(functionArgs);
                    } else {
                        body = functionArgs;
                    }
                }
                // Handle timeout by creating an AbortController
                let effectiveSignal = signal;
                if (timeout) {
                    timeoutController = new AbortController();
                    timeoutId = setTimeout(()=>timeoutController.abort(), timeout);
                    // If user provided their own signal, we need to respect both
                    if (signal) {
                        effectiveSignal = timeoutController.signal;
                        // If the user's signal is aborted, abort our timeout controller too
                        signal.addEventListener('abort', ()=>timeoutController.abort());
                    } else {
                        effectiveSignal = timeoutController.signal;
                    }
                }
                const response = yield this.fetch(url.toString(), {
                    method: method || 'POST',
                    // headers priority is (high to low):
                    // 1. invoke-level headers
                    // 2. client-level headers
                    // 3. default Content-Type header
                    headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
                    body,
                    signal: effectiveSignal
                }).catch((fetchError)=>{
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FunctionsFetchError"](fetchError);
                });
                const isRelayError = response.headers.get('x-relay-error');
                if (isRelayError && isRelayError === 'true') {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FunctionsRelayError"](response);
                }
                if (!response.ok) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FunctionsHttpError"](response);
                }
                let responseType = ((_a = response.headers.get('Content-Type')) !== null && _a !== void 0 ? _a : 'text/plain').split(';')[0].trim();
                let data;
                if (responseType === 'application/json') {
                    data = yield response.json();
                } else if (responseType === 'application/octet-stream' || responseType === 'application/pdf') {
                    data = yield response.blob();
                } else if (responseType === 'text/event-stream') {
                    data = response;
                } else if (responseType === 'multipart/form-data') {
                    data = yield response.formData();
                } else {
                    // default to text
                    data = yield response.text();
                }
                return {
                    data,
                    error: null,
                    response
                };
            } catch (error) {
                return {
                    data: null,
                    error,
                    response: error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FunctionsHttpError"] || error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FunctionsRelayError"] ? error.context : undefined
                };
            } finally{
                // Clear the timeout if it was set
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
        });
    }
} //# sourceMappingURL=FunctionsClient.js.map
}),
"[project]/node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.es6.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__addDisposableResource",
    ()=>__addDisposableResource,
    "__assign",
    ()=>__assign,
    "__asyncDelegator",
    ()=>__asyncDelegator,
    "__asyncGenerator",
    ()=>__asyncGenerator,
    "__asyncValues",
    ()=>__asyncValues,
    "__await",
    ()=>__await,
    "__awaiter",
    ()=>__awaiter,
    "__classPrivateFieldGet",
    ()=>__classPrivateFieldGet,
    "__classPrivateFieldIn",
    ()=>__classPrivateFieldIn,
    "__classPrivateFieldSet",
    ()=>__classPrivateFieldSet,
    "__createBinding",
    ()=>__createBinding,
    "__decorate",
    ()=>__decorate,
    "__disposeResources",
    ()=>__disposeResources,
    "__esDecorate",
    ()=>__esDecorate,
    "__exportStar",
    ()=>__exportStar,
    "__extends",
    ()=>__extends,
    "__generator",
    ()=>__generator,
    "__importDefault",
    ()=>__importDefault,
    "__importStar",
    ()=>__importStar,
    "__makeTemplateObject",
    ()=>__makeTemplateObject,
    "__metadata",
    ()=>__metadata,
    "__param",
    ()=>__param,
    "__propKey",
    ()=>__propKey,
    "__read",
    ()=>__read,
    "__rest",
    ()=>__rest,
    "__rewriteRelativeImportExtension",
    ()=>__rewriteRelativeImportExtension,
    "__runInitializers",
    ()=>__runInitializers,
    "__setFunctionName",
    ()=>__setFunctionName,
    "__spread",
    ()=>__spread,
    "__spreadArray",
    ()=>__spreadArray,
    "__spreadArrays",
    ()=>__spreadArrays,
    "__values",
    ()=>__values,
    "default",
    ()=>__TURBOPACK__default__export__
]);
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol, Iterator */ var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || ({
        __proto__: []
    }) instanceof Array && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return extendStatics(d, b);
};
function __extends(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function __rest(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for(var i = decorators.length - 1; i >= 0; i--){
        var context = {};
        for(var p in contextIn)context[p] = p === "access" ? {} : contextIn[p];
        for(var p in contextIn.access)context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
            if (done) throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
            get: descriptor.get,
            set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
;
function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for(var i = 0; i < initializers.length; i++){
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
}
;
function __propKey(x) {
    return typeof x === "symbol" ? x : "".concat(x);
}
;
function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
        configurable: true,
        value: prefix ? "".concat(prefix, " ", name) : name
    });
}
;
function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    //TURBOPACK unreachable
    ;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __createBinding = Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
};
function __exportStar(m, o) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
}
function __spread() {
    for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat(__read(arguments[i]));
    return ar;
}
function __spreadArrays() {
    for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
    for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
    return r;
}
function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    //TURBOPACK unreachable
    ;
    function awaitReturn(f) {
        return function(v) {
            return Promise.resolve(v).then(f, reject);
        };
    }
    function verb(n, f) {
        if (g[n]) {
            i[n] = function(v) {
                return new Promise(function(a, b) {
                    q.push([
                        n,
                        v,
                        a,
                        b
                    ]) > 1 || resume(n, v);
                });
            };
            if (f) i[n] = f(i[n]);
        }
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
        return this;
    }, i;
    //TURBOPACK unreachable
    ;
    function verb(n, f) {
        i[n] = o[n] ? function(v) {
            return (p = !p) ? {
                value: __await(o[n](v)),
                done: false
            } : f ? f(v) : v;
        } : f;
    }
}
function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    //TURBOPACK unreachable
    ;
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v) {
            resolve({
                value: v,
                done: d
            });
        }, reject);
    }
}
function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) {
        Object.defineProperty(cooked, "raw", {
            value: raw
        });
    } else {
        cooked.raw = raw;
    }
    return cooked;
}
;
var __setModuleDefault = Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
};
var ownKeys = function(o) {
    ownKeys = Object.getOwnPropertyNames || function(o) {
        var ar = [];
        for(var k in o)if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
        return ar;
    };
    return ownKeys(o);
};
function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k = ownKeys(mod), i = 0; i < k.length; i++)if (k[i] !== "default") __createBinding(result, mod, k[i]);
    }
    __setModuleDefault(result, mod);
    return result;
}
function __importDefault(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldIn(state, receiver) {
    if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}
function __addDisposableResource(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() {
            try {
                inner.call(this);
            } catch (e) {
                return Promise.reject(e);
            }
        };
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) {
        env.stack.push({
            async: true
        });
    }
    return value;
}
var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function __disposeResources(env) {
    function fail(e) {
        env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
    }
    var r, s = 0;
    function next() {
        while(r = env.stack.pop()){
            try {
                if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                if (r.dispose) {
                    var result = r.dispose.call(r.value);
                    if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                        fail(e);
                        return next();
                    });
                } else s |= 1;
            } catch (e) {
                fail(e);
            }
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
    }
    return next();
}
function __rewriteRelativeImportExtension(path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
        });
    }
    return path;
}
const __TURBOPACK__default__export__ = {
    __extends,
    __assign,
    __rest,
    __decorate,
    __param,
    __esDecorate,
    __runInitializers,
    __propKey,
    __setFunctionName,
    __metadata,
    __awaiter,
    __generator,
    __createBinding,
    __exportStar,
    __values,
    __read,
    __spread,
    __spreadArrays,
    __spreadArray,
    __await,
    __asyncGenerator,
    __asyncDelegator,
    __asyncValues,
    __makeTemplateObject,
    __importStar,
    __importDefault,
    __classPrivateFieldGet,
    __classPrivateFieldSet,
    __classPrivateFieldIn,
    __addDisposableResource,
    __disposeResources,
    __rewriteRelativeImportExtension
};
}),
"[project]/node_modules/.pnpm/@supabase+postgrest-js@2.95.3/node_modules/@supabase/postgrest-js/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PostgrestBuilder",
    ()=>PostgrestBuilder,
    "PostgrestClient",
    ()=>PostgrestClient,
    "PostgrestError",
    ()=>PostgrestError,
    "PostgrestFilterBuilder",
    ()=>PostgrestFilterBuilder,
    "PostgrestQueryBuilder",
    ()=>PostgrestQueryBuilder,
    "PostgrestTransformBuilder",
    ()=>PostgrestTransformBuilder,
    "default",
    ()=>src_default
]);
//#region src/PostgrestError.ts
/**
* Error format
*
* {@link https://postgrest.org/en/stable/api.html?highlight=options#errors-and-http-status-codes}
*/ var PostgrestError = class extends Error {
    /**
	* @example
	* ```ts
	* import PostgrestError from '@supabase/postgrest-js'
	*
	* throw new PostgrestError({
	*   message: 'Row level security prevented the request',
	*   details: 'RLS denied the insert',
	*   hint: 'Check your policies',
	*   code: 'PGRST301',
	* })
	* ```
	*/ constructor(context){
        super(context.message);
        this.name = "PostgrestError";
        this.details = context.details;
        this.hint = context.hint;
        this.code = context.code;
    }
};
//#endregion
//#region src/PostgrestBuilder.ts
var PostgrestBuilder = class {
    /**
	* Creates a builder configured for a specific PostgREST request.
	*
	* @example
	* ```ts
	* import PostgrestQueryBuilder from '@supabase/postgrest-js'
	*
	* const builder = new PostgrestQueryBuilder(
	*   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
	*   { headers: new Headers({ apikey: 'public-anon-key' }) }
	* )
	* ```
	*/ constructor(builder){
        var _builder$shouldThrowO, _builder$isMaybeSingl, _builder$urlLengthLim;
        this.shouldThrowOnError = false;
        this.method = builder.method;
        this.url = builder.url;
        this.headers = new Headers(builder.headers);
        this.schema = builder.schema;
        this.body = builder.body;
        this.shouldThrowOnError = (_builder$shouldThrowO = builder.shouldThrowOnError) !== null && _builder$shouldThrowO !== void 0 ? _builder$shouldThrowO : false;
        this.signal = builder.signal;
        this.isMaybeSingle = (_builder$isMaybeSingl = builder.isMaybeSingle) !== null && _builder$isMaybeSingl !== void 0 ? _builder$isMaybeSingl : false;
        this.urlLengthLimit = (_builder$urlLengthLim = builder.urlLengthLimit) !== null && _builder$urlLengthLim !== void 0 ? _builder$urlLengthLim : 8e3;
        if (builder.fetch) this.fetch = builder.fetch;
        else this.fetch = fetch;
    }
    /**
	* If there's an error with the query, throwOnError will reject the promise by
	* throwing the error instead of returning it as part of a successful response.
	*
	* {@link https://github.com/supabase/supabase-js/issues/92}
	*/ throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /**
	* Set an HTTP header for the request.
	*/ setHeader(name, value) {
        this.headers = new Headers(this.headers);
        this.headers.set(name, value);
        return this;
    }
    then(onfulfilled, onrejected) {
        var _this = this;
        if (this.schema === void 0) {} else if ([
            "GET",
            "HEAD"
        ].includes(this.method)) this.headers.set("Accept-Profile", this.schema);
        else this.headers.set("Content-Profile", this.schema);
        if (this.method !== "GET" && this.method !== "HEAD") this.headers.set("Content-Type", "application/json");
        const _fetch = this.fetch;
        let res = _fetch(this.url.toString(), {
            method: this.method,
            headers: this.headers,
            body: JSON.stringify(this.body),
            signal: this.signal
        }).then(async (res$1)=>{
            let error = null;
            let data = null;
            let count = null;
            let status = res$1.status;
            let statusText = res$1.statusText;
            if (res$1.ok) {
                var _this$headers$get2, _res$headers$get;
                if (_this.method !== "HEAD") {
                    var _this$headers$get;
                    const body = await res$1.text();
                    if (body === "") {} else if (_this.headers.get("Accept") === "text/csv") data = body;
                    else if (_this.headers.get("Accept") && ((_this$headers$get = _this.headers.get("Accept")) === null || _this$headers$get === void 0 ? void 0 : _this$headers$get.includes("application/vnd.pgrst.plan+text"))) data = body;
                    else data = JSON.parse(body);
                }
                const countHeader = (_this$headers$get2 = _this.headers.get("Prefer")) === null || _this$headers$get2 === void 0 ? void 0 : _this$headers$get2.match(/count=(exact|planned|estimated)/);
                const contentRange = (_res$headers$get = res$1.headers.get("content-range")) === null || _res$headers$get === void 0 ? void 0 : _res$headers$get.split("/");
                if (countHeader && contentRange && contentRange.length > 1) count = parseInt(contentRange[1]);
                if (_this.isMaybeSingle && _this.method === "GET" && Array.isArray(data)) if (data.length > 1) {
                    error = {
                        code: "PGRST116",
                        details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                        hint: null,
                        message: "JSON object requested, multiple (or no) rows returned"
                    };
                    data = null;
                    count = null;
                    status = 406;
                    statusText = "Not Acceptable";
                } else if (data.length === 1) data = data[0];
                else data = null;
            } else {
                var _error$details;
                const body = await res$1.text();
                try {
                    error = JSON.parse(body);
                    if (Array.isArray(error) && res$1.status === 404) {
                        data = [];
                        error = null;
                        status = 200;
                        statusText = "OK";
                    }
                } catch (_unused) {
                    if (res$1.status === 404 && body === "") {
                        status = 204;
                        statusText = "No Content";
                    } else error = {
                        message: body
                    };
                }
                if (error && _this.isMaybeSingle && (error === null || error === void 0 || (_error$details = error.details) === null || _error$details === void 0 ? void 0 : _error$details.includes("0 rows"))) {
                    error = null;
                    status = 200;
                    statusText = "OK";
                }
                if (error && _this.shouldThrowOnError) throw new PostgrestError(error);
            }
            return {
                error,
                data,
                count,
                status,
                statusText
            };
        });
        if (!this.shouldThrowOnError) res = res.catch((fetchError)=>{
            var _fetchError$name2;
            let errorDetails = "";
            let hint = "";
            let code = "";
            const cause = fetchError === null || fetchError === void 0 ? void 0 : fetchError.cause;
            if (cause) {
                var _cause$message, _cause$code, _fetchError$name, _cause$name;
                const causeMessage = (_cause$message = cause === null || cause === void 0 ? void 0 : cause.message) !== null && _cause$message !== void 0 ? _cause$message : "";
                const causeCode = (_cause$code = cause === null || cause === void 0 ? void 0 : cause.code) !== null && _cause$code !== void 0 ? _cause$code : "";
                errorDetails = `${(_fetchError$name = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name !== void 0 ? _fetchError$name : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`;
                errorDetails += `\n\nCaused by: ${(_cause$name = cause === null || cause === void 0 ? void 0 : cause.name) !== null && _cause$name !== void 0 ? _cause$name : "Error"}: ${causeMessage}`;
                if (causeCode) errorDetails += ` (${causeCode})`;
                if (cause === null || cause === void 0 ? void 0 : cause.stack) errorDetails += `\n${cause.stack}`;
            } else {
                var _fetchError$stack;
                errorDetails = (_fetchError$stack = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _fetchError$stack !== void 0 ? _fetchError$stack : "";
            }
            const urlLength = this.url.toString().length;
            if ((fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) === "AbortError" || (fetchError === null || fetchError === void 0 ? void 0 : fetchError.code) === "ABORT_ERR") {
                code = "";
                hint = "Request was aborted (timeout or manual cancellation)";
                if (urlLength > this.urlLengthLimit) hint += `. Note: Your request URL is ${urlLength} characters, which may exceed server limits. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [many IDs])), consider using an RPC function to pass values server-side.`;
            } else if ((cause === null || cause === void 0 ? void 0 : cause.name) === "HeadersOverflowError" || (cause === null || cause === void 0 ? void 0 : cause.code) === "UND_ERR_HEADERS_OVERFLOW") {
                code = "";
                hint = "HTTP headers exceeded server limits (typically 16KB)";
                if (urlLength > this.urlLengthLimit) hint += `. Your request URL is ${urlLength} characters. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [200+ IDs])), consider using an RPC function instead.`;
            }
            return {
                error: {
                    message: `${(_fetchError$name2 = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name2 !== void 0 ? _fetchError$name2 : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
                    details: errorDetails,
                    hint,
                    code
                },
                data: null,
                count: null,
                status: 0,
                statusText: ""
            };
        });
        return res.then(onfulfilled, onrejected);
    }
    /**
	* Override the type of the returned `data`.
	*
	* @typeParam NewResult - The new result type to override with
	* @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
	*/ returns() {
        /* istanbul ignore next */ return this;
    }
    /**
	* Override the type of the returned `data` field in the response.
	*
	* @typeParam NewResult - The new type to cast the response data to
	* @typeParam Options - Optional type configuration (defaults to { merge: true })
	* @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
	* @example
	* ```typescript
	* // Merge with existing types (default behavior)
	* const query = supabase
	*   .from('users')
	*   .select()
	*   .overrideTypes<{ custom_field: string }>()
	*
	* // Replace existing types completely
	* const replaceQuery = supabase
	*   .from('users')
	*   .select()
	*   .overrideTypes<{ id: number; name: string }, { merge: false }>()
	* ```
	* @returns A PostgrestBuilder instance with the new type
	*/ overrideTypes() {
        return this;
    }
};
//#endregion
//#region src/PostgrestTransformBuilder.ts
var PostgrestTransformBuilder = class extends PostgrestBuilder {
    /**
	* Perform a SELECT on the query result.
	*
	* By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
	* return modified rows. By calling this method, modified rows are returned in
	* `data`.
	*
	* @param columns - The columns to retrieve, separated by commas
	*/ select(columns) {
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c)=>{
            if (/\s/.test(c) && !quoted) return "";
            if (c === "\"") quoted = !quoted;
            return c;
        }).join("");
        this.url.searchParams.set("select", cleanedColumns);
        this.headers.append("Prefer", "return=representation");
        return this;
    }
    /**
	* Order the query result by `column`.
	*
	* You can call this method multiple times to order by multiple columns.
	*
	* You can order referenced tables, but it only affects the ordering of the
	* parent table if you use `!inner` in the query.
	*
	* @param column - The column to order by
	* @param options - Named parameters
	* @param options.ascending - If `true`, the result will be in ascending order
	* @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
	* `null`s appear last.
	* @param options.referencedTable - Set this to order a referenced table by
	* its columns
	* @param options.foreignTable - Deprecated, use `options.referencedTable`
	* instead
	*/ order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable } = {}) {
        const key = referencedTable ? `${referencedTable}.order` : "order";
        const existingOrder = this.url.searchParams.get(key);
        this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
        return this;
    }
    /**
	* Limit the query result by `count`.
	*
	* @param count - The maximum number of rows to return
	* @param options - Named parameters
	* @param options.referencedTable - Set this to limit rows of referenced
	* tables instead of the parent table
	* @param options.foreignTable - Deprecated, use `options.referencedTable`
	* instead
	*/ limit(count, { foreignTable, referencedTable = foreignTable } = {}) {
        const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
        this.url.searchParams.set(key, `${count}`);
        return this;
    }
    /**
	* Limit the query result by starting at an offset `from` and ending at the offset `to`.
	* Only records within this range are returned.
	* This respects the query order and if there is no order clause the range could behave unexpectedly.
	* The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
	* and fourth rows of the query.
	*
	* @param from - The starting index from which to limit the result
	* @param to - The last index to which to limit the result
	* @param options - Named parameters
	* @param options.referencedTable - Set this to limit rows of referenced
	* tables instead of the parent table
	* @param options.foreignTable - Deprecated, use `options.referencedTable`
	* instead
	*/ range(from, to, { foreignTable, referencedTable = foreignTable } = {}) {
        const keyOffset = typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`;
        const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
        this.url.searchParams.set(keyOffset, `${from}`);
        this.url.searchParams.set(keyLimit, `${to - from + 1}`);
        return this;
    }
    /**
	* Set the AbortSignal for the fetch request.
	*
	* @param signal - The AbortSignal to use for the fetch request
	*/ abortSignal(signal) {
        this.signal = signal;
        return this;
    }
    /**
	* Return `data` as a single object instead of an array of objects.
	*
	* Query result must be one row (e.g. using `.limit(1)`), otherwise this
	* returns an error.
	*/ single() {
        this.headers.set("Accept", "application/vnd.pgrst.object+json");
        return this;
    }
    /**
	* Return `data` as a single object instead of an array of objects.
	*
	* Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
	* this returns an error.
	*/ maybeSingle() {
        if (this.method === "GET") this.headers.set("Accept", "application/json");
        else this.headers.set("Accept", "application/vnd.pgrst.object+json");
        this.isMaybeSingle = true;
        return this;
    }
    /**
	* Return `data` as a string in CSV format.
	*/ csv() {
        this.headers.set("Accept", "text/csv");
        return this;
    }
    /**
	* Return `data` as an object in [GeoJSON](https://geojson.org) format.
	*/ geojson() {
        this.headers.set("Accept", "application/geo+json");
        return this;
    }
    /**
	* Return `data` as the EXPLAIN plan for the query.
	*
	* You need to enable the
	* [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
	* setting before using this method.
	*
	* @param options - Named parameters
	*
	* @param options.analyze - If `true`, the query will be executed and the
	* actual run time will be returned
	*
	* @param options.verbose - If `true`, the query identifier will be returned
	* and `data` will include the output columns of the query
	*
	* @param options.settings - If `true`, include information on configuration
	* parameters that affect query planning
	*
	* @param options.buffers - If `true`, include information on buffer usage
	*
	* @param options.wal - If `true`, include information on WAL record generation
	*
	* @param options.format - The format of the output, can be `"text"` (default)
	* or `"json"`
	*/ explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = "text" } = {}) {
        var _this$headers$get;
        const options = [
            analyze ? "analyze" : null,
            verbose ? "verbose" : null,
            settings ? "settings" : null,
            buffers ? "buffers" : null,
            wal ? "wal" : null
        ].filter(Boolean).join("|");
        const forMediatype = (_this$headers$get = this.headers.get("Accept")) !== null && _this$headers$get !== void 0 ? _this$headers$get : "application/json";
        this.headers.set("Accept", `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`);
        if (format === "json") return this;
        else return this;
    }
    /**
	* Rollback the query.
	*
	* `data` will still be returned, but the query is not committed.
	*/ rollback() {
        this.headers.append("Prefer", "tx=rollback");
        return this;
    }
    /**
	* Override the type of the returned `data`.
	*
	* @typeParam NewResult - The new result type to override with
	* @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
	*/ returns() {
        return this;
    }
    /**
	* Set the maximum number of rows that can be affected by the query.
	* Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
	*
	* @param value - The maximum number of rows that can be affected
	*/ maxAffected(value) {
        this.headers.append("Prefer", "handling=strict");
        this.headers.append("Prefer", `max-affected=${value}`);
        return this;
    }
};
//#endregion
//#region src/PostgrestFilterBuilder.ts
const PostgrestReservedCharsRegexp = /* @__PURE__ */ new RegExp("[,()]");
var PostgrestFilterBuilder = class extends PostgrestTransformBuilder {
    /**
	* Match only rows where `column` is equal to `value`.
	*
	* To check if the value of `column` is NULL, you should use `.is()` instead.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ eq(column, value) {
        this.url.searchParams.append(column, `eq.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is not equal to `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ neq(column, value) {
        this.url.searchParams.append(column, `neq.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is greater than `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ gt(column, value) {
        this.url.searchParams.append(column, `gt.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is greater than or equal to `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ gte(column, value) {
        this.url.searchParams.append(column, `gte.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is less than `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ lt(column, value) {
        this.url.searchParams.append(column, `lt.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is less than or equal to `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ lte(column, value) {
        this.url.searchParams.append(column, `lte.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` matches `pattern` case-sensitively.
	*
	* @param column - The column to filter on
	* @param pattern - The pattern to match with
	*/ like(column, pattern) {
        this.url.searchParams.append(column, `like.${pattern}`);
        return this;
    }
    /**
	* Match only rows where `column` matches all of `patterns` case-sensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/ likeAllOf(column, patterns) {
        this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`);
        return this;
    }
    /**
	* Match only rows where `column` matches any of `patterns` case-sensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/ likeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`);
        return this;
    }
    /**
	* Match only rows where `column` matches `pattern` case-insensitively.
	*
	* @param column - The column to filter on
	* @param pattern - The pattern to match with
	*/ ilike(column, pattern) {
        this.url.searchParams.append(column, `ilike.${pattern}`);
        return this;
    }
    /**
	* Match only rows where `column` matches all of `patterns` case-insensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/ ilikeAllOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`);
        return this;
    }
    /**
	* Match only rows where `column` matches any of `patterns` case-insensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/ ilikeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`);
        return this;
    }
    /**
	* Match only rows where `column` matches the PostgreSQL regex `pattern`
	* case-sensitively (using the `~` operator).
	*
	* @param column - The column to filter on
	* @param pattern - The PostgreSQL regular expression pattern to match with
	*/ regexMatch(column, pattern) {
        this.url.searchParams.append(column, `match.${pattern}`);
        return this;
    }
    /**
	* Match only rows where `column` matches the PostgreSQL regex `pattern`
	* case-insensitively (using the `~*` operator).
	*
	* @param column - The column to filter on
	* @param pattern - The PostgreSQL regular expression pattern to match with
	*/ regexIMatch(column, pattern) {
        this.url.searchParams.append(column, `imatch.${pattern}`);
        return this;
    }
    /**
	* Match only rows where `column` IS `value`.
	*
	* For non-boolean columns, this is only relevant for checking if the value of
	* `column` is NULL by setting `value` to `null`.
	*
	* For boolean columns, you can also set `value` to `true` or `false` and it
	* will behave the same way as `.eq()`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ is(column, value) {
        this.url.searchParams.append(column, `is.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` IS DISTINCT FROM `value`.
	*
	* Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
	* are considered equal (not distinct), and comparing `NULL` with any non-NULL
	* value returns true (distinct).
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ isDistinct(column, value) {
        this.url.searchParams.append(column, `isdistinct.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is included in the `values` array.
	*
	* @param column - The column to filter on
	* @param values - The values array to filter with
	*/ in(column, values) {
        const cleanedValues = Array.from(new Set(values)).map((s)=>{
            if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s)) return `"${s}"`;
            else return `${s}`;
        }).join(",");
        this.url.searchParams.append(column, `in.(${cleanedValues})`);
        return this;
    }
    /**
	* Match only rows where `column` is NOT included in the `values` array.
	*
	* @param column - The column to filter on
	* @param values - The values array to filter with
	*/ notIn(column, values) {
        const cleanedValues = Array.from(new Set(values)).map((s)=>{
            if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s)) return `"${s}"`;
            else return `${s}`;
        }).join(",");
        this.url.searchParams.append(column, `not.in.(${cleanedValues})`);
        return this;
    }
    /**
	* Only relevant for jsonb, array, and range columns. Match only rows where
	* `column` contains every element appearing in `value`.
	*
	* @param column - The jsonb, array, or range column to filter on
	* @param value - The jsonb, array, or range value to filter with
	*/ contains(column, value) {
        if (typeof value === "string") this.url.searchParams.append(column, `cs.${value}`);
        else if (Array.isArray(value)) this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
        else this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
        return this;
    }
    /**
	* Only relevant for jsonb, array, and range columns. Match only rows where
	* every element appearing in `column` is contained by `value`.
	*
	* @param column - The jsonb, array, or range column to filter on
	* @param value - The jsonb, array, or range value to filter with
	*/ containedBy(column, value) {
        if (typeof value === "string") this.url.searchParams.append(column, `cd.${value}`);
        else if (Array.isArray(value)) this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
        else this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is greater than any element in `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeGt(column, range) {
        this.url.searchParams.append(column, `sr.${range}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is either contained in `range` or greater than any element in
	* `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeGte(column, range) {
        this.url.searchParams.append(column, `nxl.${range}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is less than any element in `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeLt(column, range) {
        this.url.searchParams.append(column, `sl.${range}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is either contained in `range` or less than any element in
	* `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeLte(column, range) {
        this.url.searchParams.append(column, `nxr.${range}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where `column` is
	* mutually exclusive to `range` and there can be no element between the two
	* ranges.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeAdjacent(column, range) {
        this.url.searchParams.append(column, `adj.${range}`);
        return this;
    }
    /**
	* Only relevant for array and range columns. Match only rows where
	* `column` and `value` have an element in common.
	*
	* @param column - The array or range column to filter on
	* @param value - The array or range value to filter with
	*/ overlaps(column, value) {
        if (typeof value === "string") this.url.searchParams.append(column, `ov.${value}`);
        else this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
        return this;
    }
    /**
	* Only relevant for text and tsvector columns. Match only rows where
	* `column` matches the query string in `query`.
	*
	* @param column - The text or tsvector column to filter on
	* @param query - The query text to match with
	* @param options - Named parameters
	* @param options.config - The text search configuration to use
	* @param options.type - Change how the `query` text is interpreted
	*/ textSearch(column, query, { config, type } = {}) {
        let typePart = "";
        if (type === "plain") typePart = "pl";
        else if (type === "phrase") typePart = "ph";
        else if (type === "websearch") typePart = "w";
        const configPart = config === void 0 ? "" : `(${config})`;
        this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
        return this;
    }
    /**
	* Match only rows where each column in `query` keys is equal to its
	* associated value. Shorthand for multiple `.eq()`s.
	*
	* @param query - The object to filter with, with column names as keys mapped
	* to their filter values
	*/ match(query) {
        Object.entries(query).forEach(([column, value])=>{
            this.url.searchParams.append(column, `eq.${value}`);
        });
        return this;
    }
    /**
	* Match only rows which doesn't satisfy the filter.
	*
	* Unlike most filters, `opearator` and `value` are used as-is and need to
	* follow [PostgREST
	* syntax](https://postgrest.org/en/stable/api.html#operators). You also need
	* to make sure they are properly sanitized.
	*
	* @param column - The column to filter on
	* @param operator - The operator to be negated to filter with, following
	* PostgREST syntax
	* @param value - The value to filter with, following PostgREST syntax
	*/ not(column, operator, value) {
        this.url.searchParams.append(column, `not.${operator}.${value}`);
        return this;
    }
    /**
	* Match only rows which satisfy at least one of the filters.
	*
	* Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
	* syntax](https://postgrest.org/en/stable/api.html#operators). You also need
	* to make sure it's properly sanitized.
	*
	* It's currently not possible to do an `.or()` filter across multiple tables.
	*
	* @param filters - The filters to use, following PostgREST syntax
	* @param options - Named parameters
	* @param options.referencedTable - Set this to filter on referenced tables
	* instead of the parent table
	* @param options.foreignTable - Deprecated, use `referencedTable` instead
	*/ or(filters, { foreignTable, referencedTable = foreignTable } = {}) {
        const key = referencedTable ? `${referencedTable}.or` : "or";
        this.url.searchParams.append(key, `(${filters})`);
        return this;
    }
    /**
	* Match only rows which satisfy the filter. This is an escape hatch - you
	* should use the specific filter methods wherever possible.
	*
	* Unlike most filters, `opearator` and `value` are used as-is and need to
	* follow [PostgREST
	* syntax](https://postgrest.org/en/stable/api.html#operators). You also need
	* to make sure they are properly sanitized.
	*
	* @param column - The column to filter on
	* @param operator - The operator to filter with, following PostgREST syntax
	* @param value - The value to filter with, following PostgREST syntax
	*/ filter(column, operator, value) {
        this.url.searchParams.append(column, `${operator}.${value}`);
        return this;
    }
};
//#endregion
//#region src/PostgrestQueryBuilder.ts
var PostgrestQueryBuilder = class {
    /**
	* Creates a query builder scoped to a Postgres table or view.
	*
	* @example
	* ```ts
	* import PostgrestQueryBuilder from '@supabase/postgrest-js'
	*
	* const query = new PostgrestQueryBuilder(
	*   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
	*   { headers: { apikey: 'public-anon-key' } }
	* )
	* ```
	*/ constructor(url, { headers = {}, schema, fetch: fetch$1, urlLengthLimit = 8e3 }){
        this.url = url;
        this.headers = new Headers(headers);
        this.schema = schema;
        this.fetch = fetch$1;
        this.urlLengthLimit = urlLengthLimit;
    }
    /**
	* Clone URL and headers to prevent shared state between operations.
	*/ cloneRequestState() {
        return {
            url: new URL(this.url.toString()),
            headers: new Headers(this.headers)
        };
    }
    /**
	* Perform a SELECT query on the table or view.
	*
	* @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
	*
	* @param options - Named parameters
	*
	* @param options.head - When set to `true`, `data` will not be returned.
	* Useful if you only need the count.
	*
	* @param options.count - Count algorithm to use to count rows in the table or view.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @remarks
	* When using `count` with `.range()` or `.limit()`, the returned `count` is the total number of rows
	* that match your filters, not the number of rows in the current page. Use this to build pagination UI.
	*/ select(columns, options) {
        const { head = false, count } = options !== null && options !== void 0 ? options : {};
        const method = head ? "HEAD" : "GET";
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c)=>{
            if (/\s/.test(c) && !quoted) return "";
            if (c === "\"") quoted = !quoted;
            return c;
        }).join("");
        const { url, headers } = this.cloneRequestState();
        url.searchParams.set("select", cleanedColumns);
        if (count) headers.append("Prefer", `count=${count}`);
        return new PostgrestFilterBuilder({
            method,
            url,
            headers,
            schema: this.schema,
            fetch: this.fetch,
            urlLengthLimit: this.urlLengthLimit
        });
    }
    /**
	* Perform an INSERT into the table or view.
	*
	* By default, inserted rows are not returned. To return it, chain the call
	* with `.select()`.
	*
	* @param values - The values to insert. Pass an object to insert a single row
	* or an array to insert multiple rows.
	*
	* @param options - Named parameters
	*
	* @param options.count - Count algorithm to use to count inserted rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @param options.defaultToNull - Make missing fields default to `null`.
	* Otherwise, use the default value for the column. Only applies for bulk
	* inserts.
	*/ insert(values, { count, defaultToNull = true } = {}) {
        var _this$fetch;
        const method = "POST";
        const { url, headers } = this.cloneRequestState();
        if (count) headers.append("Prefer", `count=${count}`);
        if (!defaultToNull) headers.append("Prefer", `missing=default`);
        if (Array.isArray(values)) {
            const columns = values.reduce((acc, x)=>acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
                const uniqueColumns = [
                    ...new Set(columns)
                ].map((column)=>`"${column}"`);
                url.searchParams.set("columns", uniqueColumns.join(","));
            }
        }
        return new PostgrestFilterBuilder({
            method,
            url,
            headers,
            schema: this.schema,
            body: values,
            fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch,
            urlLengthLimit: this.urlLengthLimit
        });
    }
    /**
	* Perform an UPSERT on the table or view. Depending on the column(s) passed
	* to `onConflict`, `.upsert()` allows you to perform the equivalent of
	* `.insert()` if a row with the corresponding `onConflict` columns doesn't
	* exist, or if it does exist, perform an alternative action depending on
	* `ignoreDuplicates`.
	*
	* By default, upserted rows are not returned. To return it, chain the call
	* with `.select()`.
	*
	* @param values - The values to upsert with. Pass an object to upsert a
	* single row or an array to upsert multiple rows.
	*
	* @param options - Named parameters
	*
	* @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
	* duplicate rows are determined. Two rows are duplicates if all the
	* `onConflict` columns are equal.
	*
	* @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
	* `false`, duplicate rows are merged with existing rows.
	*
	* @param options.count - Count algorithm to use to count upserted rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @param options.defaultToNull - Make missing fields default to `null`.
	* Otherwise, use the default value for the column. This only applies when
	* inserting new rows, not when merging with existing rows under
	* `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
	*
	* @example Upsert a single row using a unique key
	* ```ts
	* // Upserting a single row, overwriting based on the 'username' unique column
	* const { data, error } = await supabase
	*   .from('users')
	*   .upsert({ username: 'supabot' }, { onConflict: 'username' })
	*
	* // Example response:
	* // {
	* //   data: [
	* //     { id: 4, message: 'bar', username: 'supabot' }
	* //   ],
	* //   error: null
	* // }
	* ```
	*
	* @example Upsert with conflict resolution and exact row counting
	* ```ts
	* // Upserting and returning exact count
	* const { data, error, count } = await supabase
	*   .from('users')
	*   .upsert(
	*     {
	*       id: 3,
	*       message: 'foo',
	*       username: 'supabot'
	*     },
	*     {
	*       onConflict: 'username',
	*       count: 'exact'
	*     }
	*   )
	*
	* // Example response:
	* // {
	* //   data: [
	* //     {
	* //       id: 42,
	* //       handle: "saoirse",
	* //       display_name: "Saoirse"
	* //     }
	* //   ],
	* //   count: 1,
	* //   error: null
	* // }
	* ```
	*/ upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true } = {}) {
        var _this$fetch2;
        const method = "POST";
        const { url, headers } = this.cloneRequestState();
        headers.append("Prefer", `resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`);
        if (onConflict !== void 0) url.searchParams.set("on_conflict", onConflict);
        if (count) headers.append("Prefer", `count=${count}`);
        if (!defaultToNull) headers.append("Prefer", "missing=default");
        if (Array.isArray(values)) {
            const columns = values.reduce((acc, x)=>acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
                const uniqueColumns = [
                    ...new Set(columns)
                ].map((column)=>`"${column}"`);
                url.searchParams.set("columns", uniqueColumns.join(","));
            }
        }
        return new PostgrestFilterBuilder({
            method,
            url,
            headers,
            schema: this.schema,
            body: values,
            fetch: (_this$fetch2 = this.fetch) !== null && _this$fetch2 !== void 0 ? _this$fetch2 : fetch,
            urlLengthLimit: this.urlLengthLimit
        });
    }
    /**
	* Perform an UPDATE on the table or view.
	*
	* By default, updated rows are not returned. To return it, chain the call
	* with `.select()` after filters.
	*
	* @param values - The values to update with
	*
	* @param options - Named parameters
	*
	* @param options.count - Count algorithm to use to count updated rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/ update(values, { count } = {}) {
        var _this$fetch3;
        const method = "PATCH";
        const { url, headers } = this.cloneRequestState();
        if (count) headers.append("Prefer", `count=${count}`);
        return new PostgrestFilterBuilder({
            method,
            url,
            headers,
            schema: this.schema,
            body: values,
            fetch: (_this$fetch3 = this.fetch) !== null && _this$fetch3 !== void 0 ? _this$fetch3 : fetch,
            urlLengthLimit: this.urlLengthLimit
        });
    }
    /**
	* Perform a DELETE on the table or view.
	*
	* By default, deleted rows are not returned. To return it, chain the call
	* with `.select()` after filters.
	*
	* @param options - Named parameters
	*
	* @param options.count - Count algorithm to use to count deleted rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/ delete({ count } = {}) {
        var _this$fetch4;
        const method = "DELETE";
        const { url, headers } = this.cloneRequestState();
        if (count) headers.append("Prefer", `count=${count}`);
        return new PostgrestFilterBuilder({
            method,
            url,
            headers,
            schema: this.schema,
            fetch: (_this$fetch4 = this.fetch) !== null && _this$fetch4 !== void 0 ? _this$fetch4 : fetch,
            urlLengthLimit: this.urlLengthLimit
        });
    }
};
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/typeof.js
function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
        return typeof o$1;
    } : function(o$1) {
        return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, _typeof(o);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPrimitive.js
function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPropertyKey.js
function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/defineProperty.js
function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/objectSpread2.js
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r$1) {
            return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread2(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r$1) {
            _defineProperty(e, r$1, t[r$1]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r$1) {
            Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
        });
    }
    return e;
}
//#endregion
//#region src/PostgrestClient.ts
/**
* PostgREST client.
*
* @typeParam Database - Types for the schema from the [type
* generator](https://supabase.com/docs/reference/javascript/next/typescript-support)
*
* @typeParam SchemaName - Postgres schema to switch to. Must be a string
* literal, the same one passed to the constructor. If the schema is not
* `"public"`, this must be supplied manually.
*/ var PostgrestClient = class PostgrestClient {
    /**
	* Creates a PostgREST client.
	*
	* @param url - URL of the PostgREST endpoint
	* @param options - Named parameters
	* @param options.headers - Custom headers
	* @param options.schema - Postgres schema to switch to
	* @param options.fetch - Custom fetch
	* @param options.timeout - Optional timeout in milliseconds for all requests. When set, requests will automatically abort after this duration to prevent indefinite hangs.
	* @param options.urlLengthLimit - Maximum URL length in characters before warnings/errors are triggered. Defaults to 8000.
	* @example
	* ```ts
	* import PostgrestClient from '@supabase/postgrest-js'
	*
	* const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
	*   headers: { apikey: 'public-anon-key' },
	*   schema: 'public',
	*   timeout: 30000, // 30 second timeout
	* })
	* ```
	*/ constructor(url, { headers = {}, schema, fetch: fetch$1, timeout, urlLengthLimit = 8e3 } = {}){
        this.url = url;
        this.headers = new Headers(headers);
        this.schemaName = schema;
        this.urlLengthLimit = urlLengthLimit;
        const originalFetch = fetch$1 !== null && fetch$1 !== void 0 ? fetch$1 : globalThis.fetch;
        if (timeout !== void 0 && timeout > 0) this.fetch = (input, init)=>{
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), timeout);
            const existingSignal = init === null || init === void 0 ? void 0 : init.signal;
            if (existingSignal) {
                if (existingSignal.aborted) {
                    clearTimeout(timeoutId);
                    return originalFetch(input, init);
                }
                const abortHandler = ()=>{
                    clearTimeout(timeoutId);
                    controller.abort();
                };
                existingSignal.addEventListener("abort", abortHandler, {
                    once: true
                });
                return originalFetch(input, _objectSpread2(_objectSpread2({}, init), {}, {
                    signal: controller.signal
                })).finally(()=>{
                    clearTimeout(timeoutId);
                    existingSignal.removeEventListener("abort", abortHandler);
                });
            }
            return originalFetch(input, _objectSpread2(_objectSpread2({}, init), {}, {
                signal: controller.signal
            })).finally(()=>clearTimeout(timeoutId));
        };
        else this.fetch = originalFetch;
    }
    /**
	* Perform a query on a table or a view.
	*
	* @param relation - The table or view name to query
	*/ from(relation) {
        if (!relation || typeof relation !== "string" || relation.trim() === "") throw new Error("Invalid relation name: relation must be a non-empty string.");
        return new PostgrestQueryBuilder(new URL(`${this.url}/${relation}`), {
            headers: new Headers(this.headers),
            schema: this.schemaName,
            fetch: this.fetch,
            urlLengthLimit: this.urlLengthLimit
        });
    }
    /**
	* Select a schema to query or perform an function (rpc) call.
	*
	* The schema needs to be on the list of exposed schemas inside Supabase.
	*
	* @param schema - The schema to query
	*/ schema(schema) {
        return new PostgrestClient(this.url, {
            headers: this.headers,
            schema,
            fetch: this.fetch,
            urlLengthLimit: this.urlLengthLimit
        });
    }
    /**
	* Perform a function call.
	*
	* @param fn - The function name to call
	* @param args - The arguments to pass to the function call
	* @param options - Named parameters
	* @param options.head - When set to `true`, `data` will not be returned.
	* Useful if you only need the count.
	* @param options.get - When set to `true`, the function will be called with
	* read-only access mode.
	* @param options.count - Count algorithm to use to count rows returned by the
	* function. Only applicable for [set-returning
	* functions](https://www.postgresql.org/docs/current/functions-srf.html).
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @example
	* ```ts
	* // For cross-schema functions where type inference fails, use overrideTypes:
	* const { data } = await supabase
	*   .schema('schema_b')
	*   .rpc('function_a', {})
	*   .overrideTypes<{ id: string; user_id: string }[]>()
	* ```
	*/ rpc(fn, args = {}, { head = false, get = false, count } = {}) {
        var _this$fetch;
        let method;
        const url = new URL(`${this.url}/rpc/${fn}`);
        let body;
        const _isObject = (v)=>v !== null && typeof v === "object" && (!Array.isArray(v) || v.some(_isObject));
        const _hasObjectArg = head && Object.values(args).some(_isObject);
        if (_hasObjectArg) {
            method = "POST";
            body = args;
        } else if (head || get) {
            method = head ? "HEAD" : "GET";
            Object.entries(args).filter(([_, value])=>value !== void 0).map(([name, value])=>[
                    name,
                    Array.isArray(value) ? `{${value.join(",")}}` : `${value}`
                ]).forEach(([name, value])=>{
                url.searchParams.append(name, value);
            });
        } else {
            method = "POST";
            body = args;
        }
        const headers = new Headers(this.headers);
        if (_hasObjectArg) headers.set("Prefer", count ? `count=${count},return=minimal` : "return=minimal");
        else if (count) headers.set("Prefer", `count=${count}`);
        return new PostgrestFilterBuilder({
            method,
            url,
            headers,
            schema: this.schemaName,
            body,
            fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch,
            urlLengthLimit: this.urlLengthLimit
        });
    }
};
//#endregion
//#region src/index.ts
var src_default = {
    PostgrestClient,
    PostgrestQueryBuilder,
    PostgrestFilterBuilder,
    PostgrestTransformBuilder,
    PostgrestBuilder,
    PostgrestError
};
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utilities for creating WebSocket instances across runtimes.
 */ __turbopack_context__.s([
    "WebSocketFactory",
    ()=>WebSocketFactory,
    "default",
    ()=>__TURBOPACK__default__export__
]);
class WebSocketFactory {
    /**
     * Static-only utility – prevent instantiation.
     */ constructor(){}
    static detectEnvironment() {
        var _a;
        if (typeof WebSocket !== 'undefined') {
            return {
                type: 'native',
                constructor: WebSocket
            };
        }
        if (typeof globalThis !== 'undefined' && typeof globalThis.WebSocket !== 'undefined') {
            return {
                type: 'native',
                constructor: globalThis.WebSocket
            };
        }
        if (("TURBOPACK compile-time value", "object") !== 'undefined' && typeof /*TURBOPACK member replacement*/ __turbopack_context__.g.WebSocket !== 'undefined') {
            return {
                type: 'native',
                constructor: /*TURBOPACK member replacement*/ __turbopack_context__.g.WebSocket
            };
        }
        if (typeof globalThis !== 'undefined' && typeof globalThis.WebSocketPair !== 'undefined' && typeof globalThis.WebSocket === 'undefined') {
            return {
                type: 'cloudflare',
                error: 'Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.',
                workaround: 'Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime.'
            };
        }
        if (typeof globalThis !== 'undefined' && globalThis.EdgeRuntime || typeof navigator !== 'undefined' && ((_a = navigator.userAgent) === null || _a === void 0 ? void 0 : _a.includes('Vercel-Edge'))) {
            return {
                type: 'unsupported',
                error: 'Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.',
                workaround: 'Use serverless functions or a different deployment target for WebSocket functionality.'
            };
        }
        // Use dynamic property access to avoid Next.js Edge Runtime static analysis warnings
        const _process = globalThis['process'];
        if (_process) {
            const processVersions = _process['versions'];
            if (processVersions && processVersions['node']) {
                // Remove 'v' prefix if present and parse the major version
                const versionString = processVersions['node'];
                const nodeVersion = parseInt(versionString.replace(/^v/, '').split('.')[0]);
                // Node.js 22+ should have native WebSocket
                if (nodeVersion >= 22) {
                    // Check if native WebSocket is available (should be in Node.js 22+)
                    if (typeof globalThis.WebSocket !== 'undefined') {
                        return {
                            type: 'native',
                            constructor: globalThis.WebSocket
                        };
                    }
                    // If not available, user needs to provide it
                    return {
                        type: 'unsupported',
                        error: `Node.js ${nodeVersion} detected but native WebSocket not found.`,
                        workaround: 'Provide a WebSocket implementation via the transport option.'
                    };
                }
                // Node.js < 22 doesn't have native WebSocket
                return {
                    type: 'unsupported',
                    error: `Node.js ${nodeVersion} detected without native WebSocket support.`,
                    workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\n' + 'import ws from "ws"\n' + 'new RealtimeClient(url, { transport: ws })'
                };
            }
        }
        return {
            type: 'unsupported',
            error: 'Unknown JavaScript runtime without WebSocket support.',
            workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
        };
    }
    /**
     * Returns the best available WebSocket constructor for the current runtime.
     *
     * @example
     * ```ts
     * const WS = WebSocketFactory.getWebSocketConstructor()
     * const socket = new WS('wss://realtime.supabase.co/socket')
     * ```
     */ static getWebSocketConstructor() {
        const env = this.detectEnvironment();
        if (env.constructor) {
            return env.constructor;
        }
        let errorMessage = env.error || 'WebSocket not supported in this environment.';
        if (env.workaround) {
            errorMessage += `\n\nSuggested solution: ${env.workaround}`;
        }
        throw new Error(errorMessage);
    }
    /**
     * Creates a WebSocket using the detected constructor.
     *
     * @example
     * ```ts
     * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
     * ```
     */ static createWebSocket(url, protocols) {
        const WS = this.getWebSocketConstructor();
        return new WS(url, protocols);
    }
    /**
     * Detects whether the runtime can establish WebSocket connections.
     *
     * @example
     * ```ts
     * if (!WebSocketFactory.isWebSocketSupported()) {
     *   console.warn('Falling back to long polling')
     * }
     * ```
     */ static isWebSocketSupported() {
        try {
            const env = this.detectEnvironment();
            return env.type === 'native' || env.type === 'ws';
        } catch (_a) {
            return false;
        }
    }
}
const __TURBOPACK__default__export__ = WebSocketFactory;
 //# sourceMappingURL=websocket-factory.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/version.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Generated automatically during releases by scripts/update-version-files.ts
// This file provides runtime access to the package version for:
// - HTTP request headers (e.g., X-Client-Info header for API requests)
// - Debugging and support (identifying which version is running)
// - Telemetry and logging (version reporting in errors/analytics)
// - Ensuring build artifacts match the published package version
__turbopack_context__.s([
    "version",
    ()=>version
]);
const version = '2.95.3'; //# sourceMappingURL=version.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/constants.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CHANNEL_EVENTS",
    ()=>CHANNEL_EVENTS,
    "CHANNEL_STATES",
    ()=>CHANNEL_STATES,
    "CONNECTION_STATE",
    ()=>CONNECTION_STATE,
    "DEFAULT_TIMEOUT",
    ()=>DEFAULT_TIMEOUT,
    "DEFAULT_VERSION",
    ()=>DEFAULT_VERSION,
    "DEFAULT_VSN",
    ()=>DEFAULT_VSN,
    "MAX_PUSH_BUFFER_SIZE",
    ()=>MAX_PUSH_BUFFER_SIZE,
    "SOCKET_STATES",
    ()=>SOCKET_STATES,
    "TRANSPORTS",
    ()=>TRANSPORTS,
    "VERSION",
    ()=>VERSION,
    "VSN_1_0_0",
    ()=>VSN_1_0_0,
    "VSN_2_0_0",
    ()=>VSN_2_0_0,
    "WS_CLOSE_NORMAL",
    ()=>WS_CLOSE_NORMAL
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$version$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/version.js [app-route] (ecmascript)");
;
const DEFAULT_VERSION = `realtime-js/${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$version$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["version"]}`;
const VSN_1_0_0 = '1.0.0';
const VSN_2_0_0 = '2.0.0';
const DEFAULT_VSN = VSN_2_0_0;
const VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$version$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["version"];
const DEFAULT_TIMEOUT = 10000;
const WS_CLOSE_NORMAL = 1000;
const MAX_PUSH_BUFFER_SIZE = 100;
var SOCKET_STATES;
(function(SOCKET_STATES) {
    SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
    SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
    SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
    SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
})(SOCKET_STATES || (SOCKET_STATES = {}));
var CHANNEL_STATES;
(function(CHANNEL_STATES) {
    CHANNEL_STATES["closed"] = "closed";
    CHANNEL_STATES["errored"] = "errored";
    CHANNEL_STATES["joined"] = "joined";
    CHANNEL_STATES["joining"] = "joining";
    CHANNEL_STATES["leaving"] = "leaving";
})(CHANNEL_STATES || (CHANNEL_STATES = {}));
var CHANNEL_EVENTS;
(function(CHANNEL_EVENTS) {
    CHANNEL_EVENTS["close"] = "phx_close";
    CHANNEL_EVENTS["error"] = "phx_error";
    CHANNEL_EVENTS["join"] = "phx_join";
    CHANNEL_EVENTS["reply"] = "phx_reply";
    CHANNEL_EVENTS["leave"] = "phx_leave";
    CHANNEL_EVENTS["access_token"] = "access_token";
})(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
var TRANSPORTS;
(function(TRANSPORTS) {
    TRANSPORTS["websocket"] = "websocket";
})(TRANSPORTS || (TRANSPORTS = {}));
var CONNECTION_STATE;
(function(CONNECTION_STATE) {
    CONNECTION_STATE["Connecting"] = "connecting";
    CONNECTION_STATE["Open"] = "open";
    CONNECTION_STATE["Closing"] = "closing";
    CONNECTION_STATE["Closed"] = "closed";
})(CONNECTION_STATE || (CONNECTION_STATE = {})); //# sourceMappingURL=constants.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/serializer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Serializer
]);
class Serializer {
    constructor(allowedMetadataKeys){
        this.HEADER_LENGTH = 1;
        this.USER_BROADCAST_PUSH_META_LENGTH = 6;
        this.KINDS = {
            userBroadcastPush: 3,
            userBroadcast: 4
        };
        this.BINARY_ENCODING = 0;
        this.JSON_ENCODING = 1;
        this.BROADCAST_EVENT = 'broadcast';
        this.allowedMetadataKeys = [];
        this.allowedMetadataKeys = allowedMetadataKeys !== null && allowedMetadataKeys !== void 0 ? allowedMetadataKeys : [];
    }
    encode(msg, callback) {
        if (msg.event === this.BROADCAST_EVENT && !(msg.payload instanceof ArrayBuffer) && typeof msg.payload.event === 'string') {
            return callback(this._binaryEncodeUserBroadcastPush(msg));
        }
        let payload = [
            msg.join_ref,
            msg.ref,
            msg.topic,
            msg.event,
            msg.payload
        ];
        return callback(JSON.stringify(payload));
    }
    _binaryEncodeUserBroadcastPush(message) {
        var _a;
        if (this._isArrayBuffer((_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload)) {
            return this._encodeBinaryUserBroadcastPush(message);
        } else {
            return this._encodeJsonUserBroadcastPush(message);
        }
    }
    _encodeBinaryUserBroadcastPush(message) {
        var _a, _b;
        const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : new ArrayBuffer(0);
        return this._encodeUserBroadcastPush(message, this.BINARY_ENCODING, userPayload);
    }
    _encodeJsonUserBroadcastPush(message) {
        var _a, _b;
        const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : {};
        const encoder = new TextEncoder();
        const encodedUserPayload = encoder.encode(JSON.stringify(userPayload)).buffer;
        return this._encodeUserBroadcastPush(message, this.JSON_ENCODING, encodedUserPayload);
    }
    _encodeUserBroadcastPush(message, encodingType, encodedPayload) {
        var _a, _b;
        const topic = message.topic;
        const ref = (_a = message.ref) !== null && _a !== void 0 ? _a : '';
        const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : '';
        const userEvent = message.payload.event;
        // Filter metadata based on allowed keys
        const rest = this.allowedMetadataKeys ? this._pick(message.payload, this.allowedMetadataKeys) : {};
        const metadata = Object.keys(rest).length === 0 ? '' : JSON.stringify(rest);
        // Validate lengths don't exceed uint8 max value (255)
        if (joinRef.length > 255) {
            throw new Error(`joinRef length ${joinRef.length} exceeds maximum of 255`);
        }
        if (ref.length > 255) {
            throw new Error(`ref length ${ref.length} exceeds maximum of 255`);
        }
        if (topic.length > 255) {
            throw new Error(`topic length ${topic.length} exceeds maximum of 255`);
        }
        if (userEvent.length > 255) {
            throw new Error(`userEvent length ${userEvent.length} exceeds maximum of 255`);
        }
        if (metadata.length > 255) {
            throw new Error(`metadata length ${metadata.length} exceeds maximum of 255`);
        }
        const metaLength = this.USER_BROADCAST_PUSH_META_LENGTH + joinRef.length + ref.length + topic.length + userEvent.length + metadata.length;
        const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
        let view = new DataView(header);
        let offset = 0;
        view.setUint8(offset++, this.KINDS.userBroadcastPush); // kind
        view.setUint8(offset++, joinRef.length);
        view.setUint8(offset++, ref.length);
        view.setUint8(offset++, topic.length);
        view.setUint8(offset++, userEvent.length);
        view.setUint8(offset++, metadata.length);
        view.setUint8(offset++, encodingType);
        Array.from(joinRef, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(ref, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(topic, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(userEvent, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(metadata, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        var combined = new Uint8Array(header.byteLength + encodedPayload.byteLength);
        combined.set(new Uint8Array(header), 0);
        combined.set(new Uint8Array(encodedPayload), header.byteLength);
        return combined.buffer;
    }
    decode(rawPayload, callback) {
        if (this._isArrayBuffer(rawPayload)) {
            let result = this._binaryDecode(rawPayload);
            return callback(result);
        }
        if (typeof rawPayload === 'string') {
            const jsonPayload = JSON.parse(rawPayload);
            const [join_ref, ref, topic, event, payload] = jsonPayload;
            return callback({
                join_ref,
                ref,
                topic,
                event,
                payload
            });
        }
        return callback({});
    }
    _binaryDecode(buffer) {
        const view = new DataView(buffer);
        const kind = view.getUint8(0);
        const decoder = new TextDecoder();
        switch(kind){
            case this.KINDS.userBroadcast:
                return this._decodeUserBroadcast(buffer, view, decoder);
        }
    }
    _decodeUserBroadcast(buffer, view, decoder) {
        const topicSize = view.getUint8(1);
        const userEventSize = view.getUint8(2);
        const metadataSize = view.getUint8(3);
        const payloadEncoding = view.getUint8(4);
        let offset = this.HEADER_LENGTH + 4;
        const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
        offset = offset + topicSize;
        const userEvent = decoder.decode(buffer.slice(offset, offset + userEventSize));
        offset = offset + userEventSize;
        const metadata = decoder.decode(buffer.slice(offset, offset + metadataSize));
        offset = offset + metadataSize;
        const payload = buffer.slice(offset, buffer.byteLength);
        const parsedPayload = payloadEncoding === this.JSON_ENCODING ? JSON.parse(decoder.decode(payload)) : payload;
        const data = {
            type: this.BROADCAST_EVENT,
            event: userEvent,
            payload: parsedPayload
        };
        // Metadata is optional and always JSON encoded
        if (metadataSize > 0) {
            data['meta'] = JSON.parse(metadata);
        }
        return {
            join_ref: null,
            ref: null,
            topic: topic,
            event: this.BROADCAST_EVENT,
            payload: data
        };
    }
    _isArrayBuffer(buffer) {
        var _a;
        return buffer instanceof ArrayBuffer || ((_a = buffer === null || buffer === void 0 ? void 0 : buffer.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'ArrayBuffer';
    }
    _pick(obj, keys) {
        if (!obj || typeof obj !== 'object') {
            return {};
        }
        return Object.fromEntries(Object.entries(obj).filter(([key])=>keys.includes(key)));
    }
} //# sourceMappingURL=serializer.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/timer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
 *
 * @example
 *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
 *      return [1000, 5000, 10000][tries - 1] || 10000
 *    })
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 *    reconnectTimer.scheduleTimeout() // fires after 5000
 *    reconnectTimer.reset()
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 */ __turbopack_context__.s([
    "default",
    ()=>Timer
]);
class Timer {
    constructor(callback, timerCalc){
        this.callback = callback;
        this.timerCalc = timerCalc;
        this.timer = undefined;
        this.tries = 0;
        this.callback = callback;
        this.timerCalc = timerCalc;
    }
    reset() {
        this.tries = 0;
        clearTimeout(this.timer);
        this.timer = undefined;
    }
    // Cancels any previous scheduleTimeout and schedules callback
    scheduleTimeout() {
        clearTimeout(this.timer);
        this.timer = setTimeout(()=>{
            this.tries = this.tries + 1;
            this.callback();
        }, this.timerCalc(this.tries + 1));
    }
} //# sourceMappingURL=timer.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/transformers.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Helpers to convert the change Payload into native JS types.
 */ // Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
// 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
__turbopack_context__.s([
    "PostgresTypes",
    ()=>PostgresTypes,
    "convertCell",
    ()=>convertCell,
    "convertChangeData",
    ()=>convertChangeData,
    "convertColumn",
    ()=>convertColumn,
    "httpEndpointURL",
    ()=>httpEndpointURL,
    "toArray",
    ()=>toArray,
    "toBoolean",
    ()=>toBoolean,
    "toJson",
    ()=>toJson,
    "toNumber",
    ()=>toNumber,
    "toTimestampString",
    ()=>toTimestampString
]);
var PostgresTypes;
(function(PostgresTypes) {
    PostgresTypes["abstime"] = "abstime";
    PostgresTypes["bool"] = "bool";
    PostgresTypes["date"] = "date";
    PostgresTypes["daterange"] = "daterange";
    PostgresTypes["float4"] = "float4";
    PostgresTypes["float8"] = "float8";
    PostgresTypes["int2"] = "int2";
    PostgresTypes["int4"] = "int4";
    PostgresTypes["int4range"] = "int4range";
    PostgresTypes["int8"] = "int8";
    PostgresTypes["int8range"] = "int8range";
    PostgresTypes["json"] = "json";
    PostgresTypes["jsonb"] = "jsonb";
    PostgresTypes["money"] = "money";
    PostgresTypes["numeric"] = "numeric";
    PostgresTypes["oid"] = "oid";
    PostgresTypes["reltime"] = "reltime";
    PostgresTypes["text"] = "text";
    PostgresTypes["time"] = "time";
    PostgresTypes["timestamp"] = "timestamp";
    PostgresTypes["timestamptz"] = "timestamptz";
    PostgresTypes["timetz"] = "timetz";
    PostgresTypes["tsrange"] = "tsrange";
    PostgresTypes["tstzrange"] = "tstzrange";
})(PostgresTypes || (PostgresTypes = {}));
const convertChangeData = (columns, record, options = {})=>{
    var _a;
    const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
    if (!record) {
        return {};
    }
    return Object.keys(record).reduce((acc, rec_key)=>{
        acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
        return acc;
    }, {});
};
const convertColumn = (columnName, columns, record, skipTypes)=>{
    const column = columns.find((x)=>x.name === columnName);
    const colType = column === null || column === void 0 ? void 0 : column.type;
    const value = record[columnName];
    if (colType && !skipTypes.includes(colType)) {
        return convertCell(colType, value);
    }
    return noop(value);
};
const convertCell = (type, value)=>{
    // if data type is an array
    if (type.charAt(0) === '_') {
        const dataType = type.slice(1, type.length);
        return toArray(value, dataType);
    }
    // If not null, convert to correct type.
    switch(type){
        case PostgresTypes.bool:
            return toBoolean(value);
        case PostgresTypes.float4:
        case PostgresTypes.float8:
        case PostgresTypes.int2:
        case PostgresTypes.int4:
        case PostgresTypes.int8:
        case PostgresTypes.numeric:
        case PostgresTypes.oid:
            return toNumber(value);
        case PostgresTypes.json:
        case PostgresTypes.jsonb:
            return toJson(value);
        case PostgresTypes.timestamp:
            return toTimestampString(value); // Format to be consistent with PostgREST
        case PostgresTypes.abstime:
        case PostgresTypes.date:
        case PostgresTypes.daterange:
        case PostgresTypes.int4range:
        case PostgresTypes.int8range:
        case PostgresTypes.money:
        case PostgresTypes.reltime:
        case PostgresTypes.text:
        case PostgresTypes.time:
        case PostgresTypes.timestamptz:
        case PostgresTypes.timetz:
        case PostgresTypes.tsrange:
        case PostgresTypes.tstzrange:
            return noop(value);
        default:
            // Return the value for remaining types
            return noop(value);
    }
};
const noop = (value)=>{
    return value;
};
const toBoolean = (value)=>{
    switch(value){
        case 't':
            return true;
        case 'f':
            return false;
        default:
            return value;
    }
};
const toNumber = (value)=>{
    if (typeof value === 'string') {
        const parsedValue = parseFloat(value);
        if (!Number.isNaN(parsedValue)) {
            return parsedValue;
        }
    }
    return value;
};
const toJson = (value)=>{
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (_a) {
            return value;
        }
    }
    return value;
};
const toArray = (value, type)=>{
    if (typeof value !== 'string') {
        return value;
    }
    const lastIdx = value.length - 1;
    const closeBrace = value[lastIdx];
    const openBrace = value[0];
    // Confirm value is a Postgres array by checking curly brackets
    if (openBrace === '{' && closeBrace === '}') {
        let arr;
        const valTrim = value.slice(1, lastIdx);
        // TODO: find a better solution to separate Postgres array data
        try {
            arr = JSON.parse('[' + valTrim + ']');
        } catch (_) {
            // WARNING: splitting on comma does not cover all edge cases
            arr = valTrim ? valTrim.split(',') : [];
        }
        return arr.map((val)=>convertCell(type, val));
    }
    return value;
};
const toTimestampString = (value)=>{
    if (typeof value === 'string') {
        return value.replace(' ', 'T');
    }
    return value;
};
const httpEndpointURL = (socketUrl)=>{
    const wsUrl = new URL(socketUrl);
    wsUrl.protocol = wsUrl.protocol.replace(/^ws/i, 'http');
    wsUrl.pathname = wsUrl.pathname.replace(/\/+$/, '') // remove all trailing slashes
    .replace(/\/socket\/websocket$/i, '') // remove the socket/websocket path
    .replace(/\/socket$/i, '') // remove the socket path
    .replace(/\/websocket$/i, ''); // remove the websocket path
    if (wsUrl.pathname === '' || wsUrl.pathname === '/') {
        wsUrl.pathname = '/api/broadcast';
    } else {
        wsUrl.pathname = wsUrl.pathname + '/api/broadcast';
    }
    return wsUrl.href;
}; //# sourceMappingURL=transformers.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/push.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Push
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/constants.js [app-route] (ecmascript)");
;
class Push {
    /**
     * Initializes the Push
     *
     * @param channel The Channel
     * @param event The event, for example `"phx_join"`
     * @param payload The payload, for example `{user_id: 123}`
     * @param timeout The push timeout in milliseconds
     */ constructor(channel, event, payload = {}, timeout = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_TIMEOUT"]){
        this.channel = channel;
        this.event = event;
        this.payload = payload;
        this.timeout = timeout;
        this.sent = false;
        this.timeoutTimer = undefined;
        this.ref = '';
        this.receivedResp = null;
        this.recHooks = [];
        this.refEvent = null;
    }
    resend(timeout) {
        this.timeout = timeout;
        this._cancelRefEvent();
        this.ref = '';
        this.refEvent = null;
        this.receivedResp = null;
        this.sent = false;
        this.send();
    }
    send() {
        if (this._hasReceived('timeout')) {
            return;
        }
        this.startTimeout();
        this.sent = true;
        this.channel.socket.push({
            topic: this.channel.topic,
            event: this.event,
            payload: this.payload,
            ref: this.ref,
            join_ref: this.channel._joinRef()
        });
    }
    updatePayload(payload) {
        this.payload = Object.assign(Object.assign({}, this.payload), payload);
    }
    receive(status, callback) {
        var _a;
        if (this._hasReceived(status)) {
            callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
        }
        this.recHooks.push({
            status,
            callback
        });
        return this;
    }
    startTimeout() {
        if (this.timeoutTimer) {
            return;
        }
        this.ref = this.channel.socket._makeRef();
        this.refEvent = this.channel._replyEventName(this.ref);
        const callback = (payload)=>{
            this._cancelRefEvent();
            this._cancelTimeout();
            this.receivedResp = payload;
            this._matchReceive(payload);
        };
        this.channel._on(this.refEvent, {}, callback);
        this.timeoutTimer = setTimeout(()=>{
            this.trigger('timeout', {});
        }, this.timeout);
    }
    trigger(status, response) {
        if (this.refEvent) this.channel._trigger(this.refEvent, {
            status,
            response
        });
    }
    destroy() {
        this._cancelRefEvent();
        this._cancelTimeout();
    }
    _cancelRefEvent() {
        if (!this.refEvent) {
            return;
        }
        this.channel._off(this.refEvent, {});
    }
    _cancelTimeout() {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = undefined;
    }
    _matchReceive({ status, response }) {
        this.recHooks.filter((h)=>h.status === status).forEach((h)=>h.callback(response));
    }
    _hasReceived(status) {
        return this.receivedResp && this.receivedResp.status === status;
    }
} //# sourceMappingURL=push.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
  This file draws heavily from https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/assets/js/phoenix/presence.js
  License: https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/LICENSE.md
*/ __turbopack_context__.s([
    "REALTIME_PRESENCE_LISTEN_EVENTS",
    ()=>REALTIME_PRESENCE_LISTEN_EVENTS,
    "default",
    ()=>RealtimePresence
]);
var REALTIME_PRESENCE_LISTEN_EVENTS;
(function(REALTIME_PRESENCE_LISTEN_EVENTS) {
    REALTIME_PRESENCE_LISTEN_EVENTS["SYNC"] = "sync";
    REALTIME_PRESENCE_LISTEN_EVENTS["JOIN"] = "join";
    REALTIME_PRESENCE_LISTEN_EVENTS["LEAVE"] = "leave";
})(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
class RealtimePresence {
    /**
     * Creates a Presence helper that keeps the local presence state in sync with the server.
     *
     * @param channel - The realtime channel to bind to.
     * @param opts - Optional custom event names, e.g. `{ events: { state: 'state', diff: 'diff' } }`.
     *
     * @example
     * ```ts
     * const presence = new RealtimePresence(channel)
     *
     * channel.on('presence', ({ event, key }) => {
     *   console.log(`Presence ${event} on ${key}`)
     * })
     * ```
     */ constructor(channel, opts){
        this.channel = channel;
        this.state = {};
        this.pendingDiffs = [];
        this.joinRef = null;
        this.enabled = false;
        this.caller = {
            onJoin: ()=>{},
            onLeave: ()=>{},
            onSync: ()=>{}
        };
        const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
            state: 'presence_state',
            diff: 'presence_diff'
        };
        this.channel._on(events.state, {}, (newState)=>{
            const { onJoin, onLeave, onSync } = this.caller;
            this.joinRef = this.channel._joinRef();
            this.state = RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
            this.pendingDiffs.forEach((diff)=>{
                this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
            });
            this.pendingDiffs = [];
            onSync();
        });
        this.channel._on(events.diff, {}, (diff)=>{
            const { onJoin, onLeave, onSync } = this.caller;
            if (this.inPendingSyncState()) {
                this.pendingDiffs.push(diff);
            } else {
                this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
                onSync();
            }
        });
        this.onJoin((key, currentPresences, newPresences)=>{
            this.channel._trigger('presence', {
                event: 'join',
                key,
                currentPresences,
                newPresences
            });
        });
        this.onLeave((key, currentPresences, leftPresences)=>{
            this.channel._trigger('presence', {
                event: 'leave',
                key,
                currentPresences,
                leftPresences
            });
        });
        this.onSync(()=>{
            this.channel._trigger('presence', {
                event: 'sync'
            });
        });
    }
    /**
     * Used to sync the list of presences on the server with the
     * client's state.
     *
     * An optional `onJoin` and `onLeave` callback can be provided to
     * react to changes in the client's local presences across
     * disconnects and reconnects with the server.
     *
     * @internal
     */ static syncState(currentState, newState, onJoin, onLeave) {
        const state = this.cloneDeep(currentState);
        const transformedState = this.transformState(newState);
        const joins = {};
        const leaves = {};
        this.map(state, (key, presences)=>{
            if (!transformedState[key]) {
                leaves[key] = presences;
            }
        });
        this.map(transformedState, (key, newPresences)=>{
            const currentPresences = state[key];
            if (currentPresences) {
                const newPresenceRefs = newPresences.map((m)=>m.presence_ref);
                const curPresenceRefs = currentPresences.map((m)=>m.presence_ref);
                const joinedPresences = newPresences.filter((m)=>curPresenceRefs.indexOf(m.presence_ref) < 0);
                const leftPresences = currentPresences.filter((m)=>newPresenceRefs.indexOf(m.presence_ref) < 0);
                if (joinedPresences.length > 0) {
                    joins[key] = joinedPresences;
                }
                if (leftPresences.length > 0) {
                    leaves[key] = leftPresences;
                }
            } else {
                joins[key] = newPresences;
            }
        });
        return this.syncDiff(state, {
            joins,
            leaves
        }, onJoin, onLeave);
    }
    /**
     * Used to sync a diff of presence join and leave events from the
     * server, as they happen.
     *
     * Like `syncState`, `syncDiff` accepts optional `onJoin` and
     * `onLeave` callbacks to react to a user joining or leaving from a
     * device.
     *
     * @internal
     */ static syncDiff(state, diff, onJoin, onLeave) {
        const { joins, leaves } = {
            joins: this.transformState(diff.joins),
            leaves: this.transformState(diff.leaves)
        };
        if (!onJoin) {
            onJoin = ()=>{};
        }
        if (!onLeave) {
            onLeave = ()=>{};
        }
        this.map(joins, (key, newPresences)=>{
            var _a;
            const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
            state[key] = this.cloneDeep(newPresences);
            if (currentPresences.length > 0) {
                const joinedPresenceRefs = state[key].map((m)=>m.presence_ref);
                const curPresences = currentPresences.filter((m)=>joinedPresenceRefs.indexOf(m.presence_ref) < 0);
                state[key].unshift(...curPresences);
            }
            onJoin(key, currentPresences, newPresences);
        });
        this.map(leaves, (key, leftPresences)=>{
            let currentPresences = state[key];
            if (!currentPresences) return;
            const presenceRefsToRemove = leftPresences.map((m)=>m.presence_ref);
            currentPresences = currentPresences.filter((m)=>presenceRefsToRemove.indexOf(m.presence_ref) < 0);
            state[key] = currentPresences;
            onLeave(key, currentPresences, leftPresences);
            if (currentPresences.length === 0) delete state[key];
        });
        return state;
    }
    /** @internal */ static map(obj, func) {
        return Object.getOwnPropertyNames(obj).map((key)=>func(key, obj[key]));
    }
    /**
     * Remove 'metas' key
     * Change 'phx_ref' to 'presence_ref'
     * Remove 'phx_ref' and 'phx_ref_prev'
     *
     * @example
     * // returns {
     *  abc123: [
     *    { presence_ref: '2', user_id: 1 },
     *    { presence_ref: '3', user_id: 2 }
     *  ]
     * }
     * RealtimePresence.transformState({
     *  abc123: {
     *    metas: [
     *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
     *      { phx_ref: '3', user_id: 2 }
     *    ]
     *  }
     * })
     *
     * @internal
     */ static transformState(state) {
        state = this.cloneDeep(state);
        return Object.getOwnPropertyNames(state).reduce((newState, key)=>{
            const presences = state[key];
            if ('metas' in presences) {
                newState[key] = presences.metas.map((presence)=>{
                    presence['presence_ref'] = presence['phx_ref'];
                    delete presence['phx_ref'];
                    delete presence['phx_ref_prev'];
                    return presence;
                });
            } else {
                newState[key] = presences;
            }
            return newState;
        }, {});
    }
    /** @internal */ static cloneDeep(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    /** @internal */ onJoin(callback) {
        this.caller.onJoin = callback;
    }
    /** @internal */ onLeave(callback) {
        this.caller.onLeave = callback;
    }
    /** @internal */ onSync(callback) {
        this.caller.onSync = callback;
    }
    /** @internal */ inPendingSyncState() {
        return !this.joinRef || this.joinRef !== this.channel._joinRef();
    }
} //# sourceMappingURL=RealtimePresence.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimeChannel.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REALTIME_CHANNEL_STATES",
    ()=>REALTIME_CHANNEL_STATES,
    "REALTIME_LISTEN_TYPES",
    ()=>REALTIME_LISTEN_TYPES,
    "REALTIME_POSTGRES_CHANGES_LISTEN_EVENT",
    ()=>REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
    "REALTIME_SUBSCRIBE_STATES",
    ()=>REALTIME_SUBSCRIBE_STATES,
    "default",
    ()=>RealtimeChannel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/constants.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$push$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/push.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$timer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/timer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimePresence$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$transformers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/transformers.js [app-route] (ecmascript)");
;
;
;
;
;
;
var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
(function(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT) {
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["ALL"] = "*";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["INSERT"] = "INSERT";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["UPDATE"] = "UPDATE";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["DELETE"] = "DELETE";
})(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
var REALTIME_LISTEN_TYPES;
(function(REALTIME_LISTEN_TYPES) {
    REALTIME_LISTEN_TYPES["BROADCAST"] = "broadcast";
    REALTIME_LISTEN_TYPES["PRESENCE"] = "presence";
    REALTIME_LISTEN_TYPES["POSTGRES_CHANGES"] = "postgres_changes";
    REALTIME_LISTEN_TYPES["SYSTEM"] = "system";
})(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
var REALTIME_SUBSCRIBE_STATES;
(function(REALTIME_SUBSCRIBE_STATES) {
    REALTIME_SUBSCRIBE_STATES["SUBSCRIBED"] = "SUBSCRIBED";
    REALTIME_SUBSCRIBE_STATES["TIMED_OUT"] = "TIMED_OUT";
    REALTIME_SUBSCRIBE_STATES["CLOSED"] = "CLOSED";
    REALTIME_SUBSCRIBE_STATES["CHANNEL_ERROR"] = "CHANNEL_ERROR";
})(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
const REALTIME_CHANNEL_STATES = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"];
class RealtimeChannel {
    /**
     * Creates a channel that can broadcast messages, sync presence, and listen to Postgres changes.
     *
     * The topic determines which realtime stream you are subscribing to. Config options let you
     * enable acknowledgement for broadcasts, presence tracking, or private channels.
     *
     * @example
     * ```ts
     * import RealtimeClient from '@supabase/realtime-js'
     *
     * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
     *   params: { apikey: 'public-anon-key' },
     * })
     * const channel = new RealtimeChannel('realtime:public:messages', { config: {} }, client)
     * ```
     */ constructor(/** Topic name can be any string. */ topic, params = {
        config: {}
    }, socket){
        var _a, _b;
        this.topic = topic;
        this.params = params;
        this.socket = socket;
        this.bindings = {};
        this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].closed;
        this.joinedOnce = false;
        this.pushBuffer = [];
        this.subTopic = topic.replace(/^realtime:/i, '');
        this.params.config = Object.assign({
            broadcast: {
                ack: false,
                self: false
            },
            presence: {
                key: '',
                enabled: false
            },
            private: false
        }, params.config);
        this.timeout = this.socket.timeout;
        this.joinPush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$push$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](this, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_EVENTS"].join, this.params, this.timeout);
        this.rejoinTimer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$timer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](()=>this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
        this.joinPush.receive('ok', ()=>{
            this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].joined;
            this.rejoinTimer.reset();
            this.pushBuffer.forEach((pushEvent)=>pushEvent.send());
            this.pushBuffer = [];
        });
        this._onClose(()=>{
            this.rejoinTimer.reset();
            this.socket.log('channel', `close ${this.topic} ${this._joinRef()}`);
            this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].closed;
            this.socket._remove(this);
        });
        this._onError((reason)=>{
            if (this._isLeaving() || this._isClosed()) {
                return;
            }
            this.socket.log('channel', `error ${this.topic}`, reason);
            this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive('timeout', ()=>{
            if (!this._isJoining()) {
                return;
            }
            this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
            this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive('error', (reason)=>{
            if (this._isLeaving() || this._isClosed()) {
                return;
            }
            this.socket.log('channel', `error ${this.topic}`, reason);
            this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this._on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_EVENTS"].reply, {}, (payload, ref)=>{
            this._trigger(this._replyEventName(ref), payload);
        });
        this.presence = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimePresence$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](this);
        this.broadcastEndpointURL = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$transformers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["httpEndpointURL"])(this.socket.endPoint);
        this.private = this.params.config.private || false;
        if (!this.private && ((_b = (_a = this.params.config) === null || _a === void 0 ? void 0 : _a.broadcast) === null || _b === void 0 ? void 0 : _b.replay)) {
            throw `tried to use replay on public channel '${this.topic}'. It must be a private channel.`;
        }
    }
    /** Subscribe registers your client with the server */ subscribe(callback, timeout = this.timeout) {
        var _a, _b, _c;
        if (!this.socket.isConnected()) {
            this.socket.connect();
        }
        if (this.state == __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].closed) {
            const { config: { broadcast, presence, private: isPrivate } } = this.params;
            const postgres_changes = (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r)=>r.filter)) !== null && _b !== void 0 ? _b : [];
            const presence_enabled = !!this.bindings[REALTIME_LISTEN_TYPES.PRESENCE] && this.bindings[REALTIME_LISTEN_TYPES.PRESENCE].length > 0 || ((_c = this.params.config.presence) === null || _c === void 0 ? void 0 : _c.enabled) === true;
            const accessTokenPayload = {};
            const config = {
                broadcast,
                presence: Object.assign(Object.assign({}, presence), {
                    enabled: presence_enabled
                }),
                postgres_changes,
                private: isPrivate
            };
            if (this.socket.accessTokenValue) {
                accessTokenPayload.access_token = this.socket.accessTokenValue;
            }
            this._onError((e)=>callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, e));
            this._onClose(()=>callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CLOSED));
            this.updateJoinPayload(Object.assign({
                config
            }, accessTokenPayload));
            this.joinedOnce = true;
            this._rejoin(timeout);
            this.joinPush.receive('ok', async ({ postgres_changes })=>{
                var _a;
                // Only refresh auth if using callback-based tokens
                if (!this.socket._isManualToken()) {
                    this.socket.setAuth();
                }
                if (postgres_changes === undefined) {
                    callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                    return;
                } else {
                    const clientPostgresBindings = this.bindings.postgres_changes;
                    const bindingsLen = (_a = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a !== void 0 ? _a : 0;
                    const newPostgresBindings = [];
                    for(let i = 0; i < bindingsLen; i++){
                        const clientPostgresBinding = clientPostgresBindings[i];
                        const { filter: { event, schema, table, filter } } = clientPostgresBinding;
                        const serverPostgresFilter = postgres_changes && postgres_changes[i];
                        if (serverPostgresFilter && serverPostgresFilter.event === event && RealtimeChannel.isFilterValueEqual(serverPostgresFilter.schema, schema) && RealtimeChannel.isFilterValueEqual(serverPostgresFilter.table, table) && RealtimeChannel.isFilterValueEqual(serverPostgresFilter.filter, filter)) {
                            newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), {
                                id: serverPostgresFilter.id
                            }));
                        } else {
                            this.unsubscribe();
                            this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].errored;
                            callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error('mismatch between server and client bindings for postgres changes'));
                            return;
                        }
                    }
                    this.bindings.postgres_changes = newPostgresBindings;
                    callback && callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                    return;
                }
            }).receive('error', (error)=>{
                this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].errored;
                callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(', ') || 'error')));
                return;
            }).receive('timeout', ()=>{
                callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT);
                return;
            });
        }
        return this;
    }
    /**
     * Returns the current presence state for this channel.
     *
     * The shape is a map keyed by presence key (for example a user id) where each entry contains the
     * tracked metadata for that user.
     */ presenceState() {
        return this.presence.state;
    }
    /**
     * Sends the supplied payload to the presence tracker so other subscribers can see that this
     * client is online. Use `untrack` to stop broadcasting presence for the same key.
     */ async track(payload, opts = {}) {
        return await this.send({
            type: 'presence',
            event: 'track',
            payload
        }, opts.timeout || this.timeout);
    }
    /**
     * Removes the current presence state for this client.
     */ async untrack(opts = {}) {
        return await this.send({
            type: 'presence',
            event: 'untrack'
        }, opts);
    }
    on(type, filter, callback) {
        if (this.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].joined && type === REALTIME_LISTEN_TYPES.PRESENCE) {
            this.socket.log('channel', `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`);
            this.unsubscribe().then(async ()=>await this.subscribe());
        }
        return this._on(type, filter, callback);
    }
    /**
     * Sends a broadcast message explicitly via REST API.
     *
     * This method always uses the REST API endpoint regardless of WebSocket connection state.
     * Useful when you want to guarantee REST delivery or when gradually migrating from implicit REST fallback.
     *
     * @param event The name of the broadcast event
     * @param payload Payload to be sent (required)
     * @param opts Options including timeout
     * @returns Promise resolving to object with success status, and error details if failed
     */ async httpSend(event, payload, opts = {}) {
        var _a;
        if (payload === undefined || payload === null) {
            return Promise.reject('Payload is required for httpSend()');
        }
        const headers = {
            apikey: this.socket.apiKey ? this.socket.apiKey : '',
            'Content-Type': 'application/json'
        };
        if (this.socket.accessTokenValue) {
            headers['Authorization'] = `Bearer ${this.socket.accessTokenValue}`;
        }
        const options = {
            method: 'POST',
            headers,
            body: JSON.stringify({
                messages: [
                    {
                        topic: this.subTopic,
                        event,
                        payload: payload,
                        private: this.private
                    }
                ]
            })
        };
        const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
        if (response.status === 202) {
            return {
                success: true
            };
        }
        let errorMessage = response.statusText;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.error || errorBody.message || errorMessage;
        } catch (_b) {}
        return Promise.reject(new Error(errorMessage));
    }
    /**
     * Sends a message into the channel.
     *
     * @param args Arguments to send to channel
     * @param args.type The type of event to send
     * @param args.event The name of the event being sent
     * @param args.payload Payload to be sent
     * @param opts Options to be used during the send process
     */ async send(args, opts = {}) {
        var _a, _b;
        if (!this._canPush() && args.type === 'broadcast') {
            console.warn('Realtime send() is automatically falling back to REST API. ' + 'This behavior will be deprecated in the future. ' + 'Please use httpSend() explicitly for REST delivery.');
            const { event, payload: endpoint_payload } = args;
            const headers = {
                apikey: this.socket.apiKey ? this.socket.apiKey : '',
                'Content-Type': 'application/json'
            };
            if (this.socket.accessTokenValue) {
                headers['Authorization'] = `Bearer ${this.socket.accessTokenValue}`;
            }
            const options = {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    messages: [
                        {
                            topic: this.subTopic,
                            event,
                            payload: endpoint_payload,
                            private: this.private
                        }
                    ]
                })
            };
            try {
                const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
                await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
                return response.ok ? 'ok' : 'error';
            } catch (error) {
                if (error.name === 'AbortError') {
                    return 'timed out';
                } else {
                    return 'error';
                }
            }
        } else {
            return new Promise((resolve)=>{
                var _a, _b, _c;
                const push = this._push(args.type, args, opts.timeout || this.timeout);
                if (args.type === 'broadcast' && !((_c = (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
                    resolve('ok');
                }
                push.receive('ok', ()=>resolve('ok'));
                push.receive('error', ()=>resolve('error'));
                push.receive('timeout', ()=>resolve('timed out'));
            });
        }
    }
    /**
     * Updates the payload that will be sent the next time the channel joins (reconnects).
     * Useful for rotating access tokens or updating config without re-creating the channel.
     */ updateJoinPayload(payload) {
        this.joinPush.updatePayload(payload);
    }
    /**
     * Leaves the channel.
     *
     * Unsubscribes from server events, and instructs channel to terminate on server.
     * Triggers onClose() hooks.
     *
     * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
     * channel.unsubscribe().receive("ok", () => alert("left!") )
     */ unsubscribe(timeout = this.timeout) {
        this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].leaving;
        const onClose = ()=>{
            this.socket.log('channel', `leave ${this.topic}`);
            this._trigger(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_EVENTS"].close, 'leave', this._joinRef());
        };
        this.joinPush.destroy();
        let leavePush = null;
        return new Promise((resolve)=>{
            leavePush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$push$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](this, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_EVENTS"].leave, {}, timeout);
            leavePush.receive('ok', ()=>{
                onClose();
                resolve('ok');
            }).receive('timeout', ()=>{
                onClose();
                resolve('timed out');
            }).receive('error', ()=>{
                resolve('error');
            });
            leavePush.send();
            if (!this._canPush()) {
                leavePush.trigger('ok', {});
            }
        }).finally(()=>{
            leavePush === null || leavePush === void 0 ? void 0 : leavePush.destroy();
        });
    }
    /**
     * Teardown the channel.
     *
     * Destroys and stops related timers.
     */ teardown() {
        this.pushBuffer.forEach((push)=>push.destroy());
        this.pushBuffer = [];
        this.rejoinTimer.reset();
        this.joinPush.destroy();
        this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].closed;
        this.bindings = {};
    }
    /** @internal */ async _fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const id = setTimeout(()=>controller.abort(), timeout);
        const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), {
            signal: controller.signal
        }));
        clearTimeout(id);
        return response;
    }
    /** @internal */ _push(event, payload, timeout = this.timeout) {
        if (!this.joinedOnce) {
            throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
        }
        let pushEvent = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$push$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](this, event, payload, timeout);
        if (this._canPush()) {
            pushEvent.send();
        } else {
            this._addToPushBuffer(pushEvent);
        }
        return pushEvent;
    }
    /** @internal */ _addToPushBuffer(pushEvent) {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
        // Enforce buffer size limit
        if (this.pushBuffer.length > __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_PUSH_BUFFER_SIZE"]) {
            const removedPush = this.pushBuffer.shift();
            if (removedPush) {
                removedPush.destroy();
                this.socket.log('channel', `discarded push due to buffer overflow: ${removedPush.event}`, removedPush.payload);
            }
        }
    }
    /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling before dispatching to the channel callbacks.
     * Must return the payload, modified or unmodified.
     *
     * @internal
     */ _onMessage(_event, payload, _ref) {
        return payload;
    }
    /** @internal */ _isMember(topic) {
        return this.topic === topic;
    }
    /** @internal */ _joinRef() {
        return this.joinPush.ref;
    }
    /** @internal */ _trigger(type, payload, ref) {
        var _a, _b;
        const typeLower = type.toLocaleLowerCase();
        const { close, error, leave, join } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_EVENTS"];
        const events = [
            close,
            error,
            leave,
            join
        ];
        if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
            return;
        }
        let handledPayload = this._onMessage(typeLower, payload, ref);
        if (payload && !handledPayload) {
            throw 'channel onMessage callbacks must return the payload, modified or unmodified';
        }
        if ([
            'insert',
            'update',
            'delete'
        ].includes(typeLower)) {
            (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind)=>{
                var _a, _b, _c;
                return ((_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event) === '*' || ((_c = (_b = bind.filter) === null || _b === void 0 ? void 0 : _b.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
            }).map((bind)=>bind.callback(handledPayload, ref));
        } else {
            (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind)=>{
                var _a, _b, _c, _d, _e, _f;
                if ([
                    'broadcast',
                    'presence',
                    'postgres_changes'
                ].includes(typeLower)) {
                    if ('id' in bind) {
                        const bindId = bind.id;
                        const bindEvent = (_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event;
                        return bindId && ((_b = payload.ids) === null || _b === void 0 ? void 0 : _b.includes(bindId)) && (bindEvent === '*' || (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase()));
                    } else {
                        const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
                        return bindEvent === '*' || bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase());
                    }
                } else {
                    return bind.type.toLocaleLowerCase() === typeLower;
                }
            }).map((bind)=>{
                if (typeof handledPayload === 'object' && 'ids' in handledPayload) {
                    const postgresChanges = handledPayload.data;
                    const { schema, table, commit_timestamp, type, errors } = postgresChanges;
                    const enrichedPayload = {
                        schema: schema,
                        table: table,
                        commit_timestamp: commit_timestamp,
                        eventType: type,
                        new: {},
                        old: {},
                        errors: errors
                    };
                    handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
                }
                bind.callback(handledPayload, ref);
            });
        }
    }
    /** @internal */ _isClosed() {
        return this.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].closed;
    }
    /** @internal */ _isJoined() {
        return this.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].joined;
    }
    /** @internal */ _isJoining() {
        return this.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].joining;
    }
    /** @internal */ _isLeaving() {
        return this.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].leaving;
    }
    /** @internal */ _replyEventName(ref) {
        return `chan_reply_${ref}`;
    }
    /** @internal */ _on(type, filter, callback) {
        const typeLower = type.toLocaleLowerCase();
        const binding = {
            type: typeLower,
            filter: filter,
            callback: callback
        };
        if (this.bindings[typeLower]) {
            this.bindings[typeLower].push(binding);
        } else {
            this.bindings[typeLower] = [
                binding
            ];
        }
        return this;
    }
    /** @internal */ _off(type, filter) {
        const typeLower = type.toLocaleLowerCase();
        if (this.bindings[typeLower]) {
            this.bindings[typeLower] = this.bindings[typeLower].filter((bind)=>{
                var _a;
                return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower && RealtimeChannel.isEqual(bind.filter, filter));
            });
        }
        return this;
    }
    /** @internal */ static isEqual(obj1, obj2) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return false;
        }
        for(const k in obj1){
            if (obj1[k] !== obj2[k]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Compares two optional filter values for equality.
     * Treats undefined, null, and empty string as equivalent empty values.
     * @internal
     */ static isFilterValueEqual(serverValue, clientValue) {
        const normalizedServer = serverValue !== null && serverValue !== void 0 ? serverValue : undefined;
        const normalizedClient = clientValue !== null && clientValue !== void 0 ? clientValue : undefined;
        return normalizedServer === normalizedClient;
    }
    /** @internal */ _rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout();
        if (this.socket.isConnected()) {
            this._rejoin();
        }
    }
    /**
     * Registers a callback that will be executed when the channel closes.
     *
     * @internal
     */ _onClose(callback) {
        this._on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_EVENTS"].close, {}, callback);
    }
    /**
     * Registers a callback that will be executed when the channel encounteres an error.
     *
     * @internal
     */ _onError(callback) {
        this._on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_EVENTS"].error, {}, (reason)=>callback(reason));
    }
    /**
     * Returns `true` if the socket is connected and the channel has been joined.
     *
     * @internal
     */ _canPush() {
        return this.socket.isConnected() && this._isJoined();
    }
    /** @internal */ _rejoin(timeout = this.timeout) {
        if (this._isLeaving()) {
            return;
        }
        this.socket._leaveOpenTopic(this.topic);
        this.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_STATES"].joining;
        this.joinPush.resend(timeout);
    }
    /** @internal */ _getPayloadRecords(payload) {
        const records = {
            new: {},
            old: {}
        };
        if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
            records.new = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$transformers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertChangeData"](payload.columns, payload.record);
        }
        if (payload.type === 'UPDATE' || payload.type === 'DELETE') {
            records.old = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$transformers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertChangeData"](payload.columns, payload.old_record);
        }
        return records;
    }
} //# sourceMappingURL=RealtimeChannel.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RealtimeClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$websocket$2d$factory$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/constants.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$serializer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/serializer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$timer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/timer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$transformers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/transformers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimeChannel$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimeChannel.js [app-route] (ecmascript)");
;
;
;
;
;
;
const noop = ()=>{};
// Connection-related constants
const CONNECTION_TIMEOUTS = {
    HEARTBEAT_INTERVAL: 25000,
    RECONNECT_DELAY: 10,
    HEARTBEAT_TIMEOUT_FALLBACK: 100
};
const RECONNECT_INTERVALS = [
    1000,
    2000,
    5000,
    10000
];
const DEFAULT_RECONNECT_FALLBACK = 10000;
const WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
class RealtimeClient {
    /**
     * Initializes the Socket.
     *
     * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
     * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
     * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
     * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
     * @param options.params The optional params to pass when connecting.
     * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
     * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
     * @param options.heartbeatCallback The optional function to handle heartbeat status and latency.
     * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
     * @param options.logLevel Sets the log level for Realtime
     * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
     * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
     * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
     * @param options.worker Use Web Worker to set a side flow. Defaults to false.
     * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
     * @param options.vsn The protocol version to use when connecting. Supported versions are "1.0.0" and "2.0.0". Defaults to "2.0.0".
     * @example
     * ```ts
     * import RealtimeClient from '@supabase/realtime-js'
     *
     * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
     *   params: { apikey: 'public-anon-key' },
     * })
     * client.connect()
     * ```
     */ constructor(endPoint, options){
        var _a;
        this.accessTokenValue = null;
        this.apiKey = null;
        this._manuallySetToken = false;
        this.channels = new Array();
        this.endPoint = '';
        this.httpEndpoint = '';
        /** @deprecated headers cannot be set on websocket connections */ this.headers = {};
        this.params = {};
        this.timeout = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_TIMEOUT"];
        this.transport = null;
        this.heartbeatIntervalMs = CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.heartbeatTimer = undefined;
        this.pendingHeartbeatRef = null;
        this.heartbeatCallback = noop;
        this.ref = 0;
        this.reconnectTimer = null;
        this.vsn = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_VSN"];
        this.logger = noop;
        this.conn = null;
        this.sendBuffer = [];
        this.serializer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$serializer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
        this.stateChangeCallbacks = {
            open: [],
            close: [],
            error: [],
            message: []
        };
        this.accessToken = null;
        this._connectionState = 'disconnected';
        this._wasManualDisconnect = false;
        this._authPromise = null;
        this._heartbeatSentAt = null;
        /**
         * Use either custom fetch, if provided, or default fetch to make HTTP requests
         *
         * @internal
         */ this._resolveFetch = (customFetch)=>{
            if (customFetch) {
                return (...args)=>customFetch(...args);
            }
            return (...args)=>fetch(...args);
        };
        // Validate required parameters
        if (!((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey)) {
            throw new Error('API key is required to connect to Realtime');
        }
        this.apiKey = options.params.apikey;
        // Initialize endpoint URLs
        this.endPoint = `${endPoint}/${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRANSPORTS"].websocket}`;
        this.httpEndpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$transformers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["httpEndpointURL"])(endPoint);
        this._initializeOptions(options);
        this._setupReconnectionTimer();
        this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
    }
    /**
     * Connects the socket, unless already connected.
     */ connect() {
        // Skip if already connecting, disconnecting, or connected
        if (this.isConnecting() || this.isDisconnecting() || this.conn !== null && this.isConnected()) {
            return;
        }
        this._setConnectionState('connecting');
        // Trigger auth if needed and not already in progress
        // This ensures auth is called for standalone RealtimeClient usage
        // while avoiding race conditions with SupabaseClient's immediate setAuth call
        if (this.accessToken && !this._authPromise) {
            this._setAuthSafely('connect');
        }
        // Establish WebSocket connection
        if (this.transport) {
            // Use custom transport if provided
            this.conn = new this.transport(this.endpointURL());
        } else {
            // Try to use native WebSocket
            try {
                this.conn = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$websocket$2d$factory$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createWebSocket(this.endpointURL());
            } catch (error) {
                this._setConnectionState('disconnected');
                const errorMessage = error.message;
                // Provide helpful error message based on environment
                if (errorMessage.includes('Node.js')) {
                    throw new Error(`${errorMessage}\n\n` + 'To use Realtime in Node.js, you need to provide a WebSocket implementation:\n\n' + 'Option 1: Use Node.js 22+ which has native WebSocket support\n' + 'Option 2: Install and provide the "ws" package:\n\n' + '  npm install ws\n\n' + '  import ws from "ws"\n' + '  const client = new RealtimeClient(url, {\n' + '    ...options,\n' + '    transport: ws\n' + '  })');
                }
                throw new Error(`WebSocket not available: ${errorMessage}`);
            }
        }
        this._setupConnectionHandlers();
    }
    /**
     * Returns the URL of the websocket.
     * @returns string The URL of the websocket.
     */ endpointURL() {
        return this._appendParams(this.endPoint, Object.assign({}, this.params, {
            vsn: this.vsn
        }));
    }
    /**
     * Disconnects the socket.
     *
     * @param code A numeric status code to send on disconnect.
     * @param reason A custom reason for the disconnect.
     */ disconnect(code, reason) {
        if (this.isDisconnecting()) {
            return;
        }
        this._setConnectionState('disconnecting', true);
        if (this.conn) {
            // Setup fallback timer to prevent hanging in disconnecting state
            const fallbackTimer = setTimeout(()=>{
                this._setConnectionState('disconnected');
            }, 100);
            this.conn.onclose = ()=>{
                clearTimeout(fallbackTimer);
                this._setConnectionState('disconnected');
            };
            // Close the WebSocket connection if close method exists
            if (typeof this.conn.close === 'function') {
                if (code) {
                    this.conn.close(code, reason !== null && reason !== void 0 ? reason : '');
                } else {
                    this.conn.close();
                }
            }
            this._teardownConnection();
        } else {
            this._setConnectionState('disconnected');
        }
    }
    /**
     * Returns all created channels
     */ getChannels() {
        return this.channels;
    }
    /**
     * Unsubscribes and removes a single channel
     * @param channel A RealtimeChannel instance
     */ async removeChannel(channel) {
        const status = await channel.unsubscribe();
        // Only remove from channels list if unsubscribe was successful
        if (status === 'ok') {
            this._remove(channel);
        }
        if (this.channels.length === 0) {
            this.disconnect();
        }
        return status;
    }
    /**
     * Unsubscribes and removes all channels
     */ async removeAllChannels() {
        const values_1 = await Promise.all(this.channels.map((channel)=>channel.unsubscribe()));
        this.channels = [];
        this.disconnect();
        return values_1;
    }
    /**
     * Logs the message.
     *
     * For customized logging, `this.logger` can be overridden.
     */ log(kind, msg, data) {
        this.logger(kind, msg, data);
    }
    /**
     * Returns the current state of the socket.
     */ connectionState() {
        switch(this.conn && this.conn.readyState){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOCKET_STATES"].connecting:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONNECTION_STATE"].Connecting;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOCKET_STATES"].open:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONNECTION_STATE"].Open;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOCKET_STATES"].closing:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONNECTION_STATE"].Closing;
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONNECTION_STATE"].Closed;
        }
    }
    /**
     * Returns `true` is the connection is open.
     */ isConnected() {
        return this.connectionState() === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CONNECTION_STATE"].Open;
    }
    /**
     * Returns `true` if the connection is currently connecting.
     */ isConnecting() {
        return this._connectionState === 'connecting';
    }
    /**
     * Returns `true` if the connection is currently disconnecting.
     */ isDisconnecting() {
        return this._connectionState === 'disconnecting';
    }
    /**
     * Creates (or reuses) a {@link RealtimeChannel} for the provided topic.
     *
     * Topics are automatically prefixed with `realtime:` to match the Realtime service.
     * If a channel with the same topic already exists it will be returned instead of creating
     * a duplicate connection.
     */ channel(topic, params = {
        config: {}
    }) {
        const realtimeTopic = `realtime:${topic}`;
        const exists = this.getChannels().find((c)=>c.topic === realtimeTopic);
        if (!exists) {
            const chan = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimeChannel$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](`realtime:${topic}`, params, this);
            this.channels.push(chan);
            return chan;
        } else {
            return exists;
        }
    }
    /**
     * Push out a message if the socket is connected.
     *
     * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
     */ push(data) {
        const { topic, event, payload, ref } = data;
        const callback = ()=>{
            this.encode(data, (result)=>{
                var _a;
                (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
            });
        };
        this.log('push', `${topic} ${event} (${ref})`, payload);
        if (this.isConnected()) {
            callback();
        } else {
            this.sendBuffer.push(callback);
        }
    }
    /**
     * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
     *
     * If param is null it will use the `accessToken` callback function or the token set on the client.
     *
     * On callback used, it will set the value of the token internal to the client.
     *
     * When a token is explicitly provided, it will be preserved across channel operations
     * (including removeChannel and resubscribe). The `accessToken` callback will not be
     * invoked until `setAuth()` is called without arguments.
     *
     * @param token A JWT string to override the token set on the client.
     *
     * @example
     * // Use a manual token (preserved across resubscribes, ignores accessToken callback)
     * client.realtime.setAuth('my-custom-jwt')
     *
     * // Switch back to using the accessToken callback
     * client.realtime.setAuth()
     */ async setAuth(token = null) {
        this._authPromise = this._performAuth(token);
        try {
            await this._authPromise;
        } finally{
            this._authPromise = null;
        }
    }
    /**
     * Returns true if the current access token was explicitly set via setAuth(token),
     * false if it was obtained via the accessToken callback.
     * @internal
     */ _isManualToken() {
        return this._manuallySetToken;
    }
    /**
     * Sends a heartbeat message if the socket is connected.
     */ async sendHeartbeat() {
        var _a;
        if (!this.isConnected()) {
            try {
                this.heartbeatCallback('disconnected');
            } catch (e) {
                this.log('error', 'error in heartbeat callback', e);
            }
            return;
        }
        // Handle heartbeat timeout and force reconnection if needed
        if (this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null;
            this._heartbeatSentAt = null;
            this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
            try {
                this.heartbeatCallback('timeout');
            } catch (e) {
                this.log('error', 'error in heartbeat callback', e);
            }
            // Force reconnection after heartbeat timeout
            this._wasManualDisconnect = false;
            (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WS_CLOSE_NORMAL"], 'heartbeat timeout');
            setTimeout(()=>{
                var _a;
                if (!this.isConnected()) {
                    (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout();
                }
            }, CONNECTION_TIMEOUTS.HEARTBEAT_TIMEOUT_FALLBACK);
            return;
        }
        // Send heartbeat message to server
        this._heartbeatSentAt = Date.now();
        this.pendingHeartbeatRef = this._makeRef();
        this.push({
            topic: 'phoenix',
            event: 'heartbeat',
            payload: {},
            ref: this.pendingHeartbeatRef
        });
        try {
            this.heartbeatCallback('sent');
        } catch (e) {
            this.log('error', 'error in heartbeat callback', e);
        }
        this._setAuthSafely('heartbeat');
    }
    /**
     * Sets a callback that receives lifecycle events for internal heartbeat messages.
     * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
     */ onHeartbeat(callback) {
        this.heartbeatCallback = callback;
    }
    /**
     * Flushes send buffer
     */ flushSendBuffer() {
        if (this.isConnected() && this.sendBuffer.length > 0) {
            this.sendBuffer.forEach((callback)=>callback());
            this.sendBuffer = [];
        }
    }
    /**
     * Return the next message ref, accounting for overflows
     *
     * @internal
     */ _makeRef() {
        let newRef = this.ref + 1;
        if (newRef === this.ref) {
            this.ref = 0;
        } else {
            this.ref = newRef;
        }
        return this.ref.toString();
    }
    /**
     * Unsubscribe from channels with the specified topic.
     *
     * @internal
     */ _leaveOpenTopic(topic) {
        let dupChannel = this.channels.find((c)=>c.topic === topic && (c._isJoined() || c._isJoining()));
        if (dupChannel) {
            this.log('transport', `leaving duplicate topic "${topic}"`);
            dupChannel.unsubscribe();
        }
    }
    /**
     * Removes a subscription from the socket.
     *
     * @param channel An open subscription.
     *
     * @internal
     */ _remove(channel) {
        this.channels = this.channels.filter((c)=>c.topic !== channel.topic);
    }
    /** @internal */ _onConnMessage(rawMessage) {
        this.decode(rawMessage.data, (msg)=>{
            // Handle heartbeat responses
            if (msg.topic === 'phoenix' && msg.event === 'phx_reply' && msg.ref && msg.ref === this.pendingHeartbeatRef) {
                const latency = this._heartbeatSentAt ? Date.now() - this._heartbeatSentAt : undefined;
                try {
                    this.heartbeatCallback(msg.payload.status === 'ok' ? 'ok' : 'error', latency);
                } catch (e) {
                    this.log('error', 'error in heartbeat callback', e);
                }
                this._heartbeatSentAt = null;
                this.pendingHeartbeatRef = null;
            }
            // Log incoming message
            const { topic, event, payload, ref } = msg;
            const refString = ref ? `(${ref})` : '';
            const status = payload.status || '';
            this.log('receive', `${status} ${topic} ${event} ${refString}`.trim(), payload);
            // Route message to appropriate channels
            this.channels.filter((channel)=>channel._isMember(topic)).forEach((channel)=>channel._trigger(event, payload, ref));
            this._triggerStateCallbacks('message', msg);
        });
    }
    /**
     * Clear specific timer
     * @internal
     */ _clearTimer(timer) {
        var _a;
        if (timer === 'heartbeat' && this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        } else if (timer === 'reconnect') {
            (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.reset();
        }
    }
    /**
     * Clear all timers
     * @internal
     */ _clearAllTimers() {
        this._clearTimer('heartbeat');
        this._clearTimer('reconnect');
    }
    /**
     * Setup connection handlers for WebSocket events
     * @internal
     */ _setupConnectionHandlers() {
        if (!this.conn) return;
        // Set binary type if supported (browsers and most WebSocket implementations)
        if ('binaryType' in this.conn) {
            ;
            this.conn.binaryType = 'arraybuffer';
        }
        this.conn.onopen = ()=>this._onConnOpen();
        this.conn.onerror = (error)=>this._onConnError(error);
        this.conn.onmessage = (event)=>this._onConnMessage(event);
        this.conn.onclose = (event)=>this._onConnClose(event);
        if (this.conn.readyState === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOCKET_STATES"].open) {
            this._onConnOpen();
        }
    }
    /**
     * Teardown connection and cleanup resources
     * @internal
     */ _teardownConnection() {
        if (this.conn) {
            if (this.conn.readyState === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOCKET_STATES"].open || this.conn.readyState === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SOCKET_STATES"].connecting) {
                try {
                    this.conn.close();
                } catch (e) {
                    this.log('error', 'Error closing connection', e);
                }
            }
            this.conn.onopen = null;
            this.conn.onerror = null;
            this.conn.onmessage = null;
            this.conn.onclose = null;
            this.conn = null;
        }
        this._clearAllTimers();
        this._terminateWorker();
        this.channels.forEach((channel)=>channel.teardown());
    }
    /** @internal */ _onConnOpen() {
        this._setConnectionState('connected');
        this.log('transport', `connected to ${this.endpointURL()}`);
        // Wait for any pending auth operations before flushing send buffer
        // This ensures channel join messages include the correct access token
        const authPromise = this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve());
        authPromise.then(()=>{
            this.flushSendBuffer();
        }).catch((e)=>{
            this.log('error', 'error waiting for auth on connect', e);
            // Proceed anyway to avoid hanging connections
            this.flushSendBuffer();
        });
        this._clearTimer('reconnect');
        if (!this.worker) {
            this._startHeartbeat();
        } else {
            if (!this.workerRef) {
                this._startWorkerHeartbeat();
            }
        }
        this._triggerStateCallbacks('open');
    }
    /** @internal */ _startHeartbeat() {
        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(()=>this.sendHeartbeat(), this.heartbeatIntervalMs);
    }
    /** @internal */ _startWorkerHeartbeat() {
        if (this.workerUrl) {
            this.log('worker', `starting worker for from ${this.workerUrl}`);
        } else {
            this.log('worker', `starting default worker`);
        }
        const objectUrl = this._workerObjectUrl(this.workerUrl);
        this.workerRef = new Worker(objectUrl);
        this.workerRef.onerror = (error)=>{
            this.log('worker', 'worker error', error.message);
            this._terminateWorker();
        };
        this.workerRef.onmessage = (event)=>{
            if (event.data.event === 'keepAlive') {
                this.sendHeartbeat();
            }
        };
        this.workerRef.postMessage({
            event: 'start',
            interval: this.heartbeatIntervalMs
        });
    }
    /**
     * Terminate the Web Worker and clear the reference
     * @internal
     */ _terminateWorker() {
        if (this.workerRef) {
            this.log('worker', 'terminating worker');
            this.workerRef.terminate();
            this.workerRef = undefined;
        }
    }
    /** @internal */ _onConnClose(event) {
        var _a;
        this._setConnectionState('disconnected');
        this.log('transport', 'close', event);
        this._triggerChanError();
        this._clearTimer('heartbeat');
        // Only schedule reconnection if it wasn't a manual disconnect
        if (!this._wasManualDisconnect) {
            (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout();
        }
        this._triggerStateCallbacks('close', event);
    }
    /** @internal */ _onConnError(error) {
        this._setConnectionState('disconnected');
        this.log('transport', `${error}`);
        this._triggerChanError();
        this._triggerStateCallbacks('error', error);
        try {
            this.heartbeatCallback('error');
        } catch (e) {
            this.log('error', 'error in heartbeat callback', e);
        }
    }
    /** @internal */ _triggerChanError() {
        this.channels.forEach((channel)=>channel._trigger(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_EVENTS"].error));
    }
    /** @internal */ _appendParams(url, params) {
        if (Object.keys(params).length === 0) {
            return url;
        }
        const prefix = url.match(/\?/) ? '&' : '?';
        const query = new URLSearchParams(params);
        return `${url}${prefix}${query}`;
    }
    _workerObjectUrl(url) {
        let result_url;
        if (url) {
            result_url = url;
        } else {
            const blob = new Blob([
                WORKER_SCRIPT
            ], {
                type: 'application/javascript'
            });
            result_url = URL.createObjectURL(blob);
        }
        return result_url;
    }
    /**
     * Set connection state with proper state management
     * @internal
     */ _setConnectionState(state, manual = false) {
        this._connectionState = state;
        if (state === 'connecting') {
            this._wasManualDisconnect = false;
        } else if (state === 'disconnecting') {
            this._wasManualDisconnect = manual;
        }
    }
    /**
     * Perform the actual auth operation
     * @internal
     */ async _performAuth(token = null) {
        let tokenToSend;
        let isManualToken = false;
        if (token) {
            tokenToSend = token;
            // Track if this is a manually-provided token
            isManualToken = true;
        } else if (this.accessToken) {
            // Call the accessToken callback to get fresh token
            try {
                tokenToSend = await this.accessToken();
            } catch (e) {
                this.log('error', 'Error fetching access token from callback', e);
                // Fall back to cached value if callback fails
                tokenToSend = this.accessTokenValue;
            }
        } else {
            tokenToSend = this.accessTokenValue;
        }
        // Track whether this token was manually set or fetched via callback
        if (isManualToken) {
            this._manuallySetToken = true;
        } else if (this.accessToken) {
            // If we used the callback, clear the manual flag
            this._manuallySetToken = false;
        }
        if (this.accessTokenValue != tokenToSend) {
            this.accessTokenValue = tokenToSend;
            this.channels.forEach((channel)=>{
                const payload = {
                    access_token: tokenToSend,
                    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_VERSION"]
                };
                tokenToSend && channel.updateJoinPayload(payload);
                if (channel.joinedOnce && channel._isJoined()) {
                    channel._push(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNEL_EVENTS"].access_token, {
                        access_token: tokenToSend
                    });
                }
            });
        }
    }
    /**
     * Wait for any in-flight auth operations to complete
     * @internal
     */ async _waitForAuthIfNeeded() {
        if (this._authPromise) {
            await this._authPromise;
        }
    }
    /**
     * Safely call setAuth with standardized error handling
     * @internal
     */ _setAuthSafely(context = 'general') {
        // Only refresh auth if using callback-based tokens
        if (!this._isManualToken()) {
            this.setAuth().catch((e)=>{
                this.log('error', `Error setting auth in ${context}`, e);
            });
        }
    }
    /**
     * Trigger state change callbacks with proper error handling
     * @internal
     */ _triggerStateCallbacks(event, data) {
        try {
            this.stateChangeCallbacks[event].forEach((callback)=>{
                try {
                    callback(data);
                } catch (e) {
                    this.log('error', `error in ${event} callback`, e);
                }
            });
        } catch (e) {
            this.log('error', `error triggering ${event} callbacks`, e);
        }
    }
    /**
     * Setup reconnection timer with proper configuration
     * @internal
     */ _setupReconnectionTimer() {
        this.reconnectTimer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$timer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](async ()=>{
            setTimeout(async ()=>{
                await this._waitForAuthIfNeeded();
                if (!this.isConnected()) {
                    this.connect();
                }
            }, CONNECTION_TIMEOUTS.RECONNECT_DELAY);
        }, this.reconnectAfterMs);
    }
    /**
     * Initialize client options with defaults
     * @internal
     */ _initializeOptions(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        // Set defaults
        this.transport = (_a = options === null || options === void 0 ? void 0 : options.transport) !== null && _a !== void 0 ? _a : null;
        this.timeout = (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null && _b !== void 0 ? _b : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_TIMEOUT"];
        this.heartbeatIntervalMs = (_c = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _c !== void 0 ? _c : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.worker = (_d = options === null || options === void 0 ? void 0 : options.worker) !== null && _d !== void 0 ? _d : false;
        this.accessToken = (_e = options === null || options === void 0 ? void 0 : options.accessToken) !== null && _e !== void 0 ? _e : null;
        this.heartbeatCallback = (_f = options === null || options === void 0 ? void 0 : options.heartbeatCallback) !== null && _f !== void 0 ? _f : noop;
        this.vsn = (_g = options === null || options === void 0 ? void 0 : options.vsn) !== null && _g !== void 0 ? _g : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_VSN"];
        // Handle special cases
        if (options === null || options === void 0 ? void 0 : options.params) this.params = options.params;
        if (options === null || options === void 0 ? void 0 : options.logger) this.logger = options.logger;
        if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
            this.logLevel = options.logLevel || options.log_level;
            this.params = Object.assign(Object.assign({}, this.params), {
                log_level: this.logLevel
            });
        }
        // Set up functions with defaults
        this.reconnectAfterMs = (_h = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _h !== void 0 ? _h : (tries)=>{
            return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK;
        };
        switch(this.vsn){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VSN_1_0_0"]:
                this.encode = (_j = options === null || options === void 0 ? void 0 : options.encode) !== null && _j !== void 0 ? _j : (payload, callback)=>{
                    return callback(JSON.stringify(payload));
                };
                this.decode = (_k = options === null || options === void 0 ? void 0 : options.decode) !== null && _k !== void 0 ? _k : (payload, callback)=>{
                    return callback(JSON.parse(payload));
                };
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VSN_2_0_0"]:
                this.encode = (_l = options === null || options === void 0 ? void 0 : options.encode) !== null && _l !== void 0 ? _l : this.serializer.encode.bind(this.serializer);
                this.decode = (_m = options === null || options === void 0 ? void 0 : options.decode) !== null && _m !== void 0 ? _m : this.serializer.decode.bind(this.serializer);
                break;
            default:
                throw new Error(`Unsupported serializer version: ${this.vsn}`);
        }
        // Handle worker setup
        if (this.worker) {
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
        }
    }
} //# sourceMappingURL=RealtimeClient.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimeClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimeChannel$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimeChannel.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimePresence$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$lib$2f$websocket$2d$factory$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js [app-route] (ecmascript)");
;
;
;
;
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js [app-route] (ecmascript) <export default as RealtimeClient>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RealtimeClient",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimeClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimeClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js [app-route] (ecmascript)");
}),
"[project]/node_modules/.pnpm/iceberg-js@0.8.1/node_modules/iceberg-js/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IcebergError",
    ()=>IcebergError,
    "IcebergRestCatalog",
    ()=>IcebergRestCatalog,
    "getCurrentSchema",
    ()=>getCurrentSchema,
    "isDecimalType",
    ()=>isDecimalType,
    "isFixedType",
    ()=>isFixedType,
    "parseDecimalType",
    ()=>parseDecimalType,
    "parseFixedType",
    ()=>parseFixedType,
    "typesEqual",
    ()=>typesEqual
]);
// src/errors/IcebergError.ts
var IcebergError = class extends Error {
    constructor(message, opts){
        super(message);
        this.name = "IcebergError";
        this.status = opts.status;
        this.icebergType = opts.icebergType;
        this.icebergCode = opts.icebergCode;
        this.details = opts.details;
        this.isCommitStateUnknown = opts.icebergType === "CommitStateUnknownException" || [
            500,
            502,
            504
        ].includes(opts.status) && opts.icebergType?.includes("CommitState") === true;
    }
    /**
   * Returns true if the error is a 404 Not Found error.
   */ isNotFound() {
        return this.status === 404;
    }
    /**
   * Returns true if the error is a 409 Conflict error.
   */ isConflict() {
        return this.status === 409;
    }
    /**
   * Returns true if the error is a 419 Authentication Timeout error.
   */ isAuthenticationTimeout() {
        return this.status === 419;
    }
};
// src/utils/url.ts
function buildUrl(baseUrl, path, query) {
    const url = new URL(path, baseUrl);
    if (query) {
        for (const [key, value] of Object.entries(query)){
            if (value !== void 0) {
                url.searchParams.set(key, value);
            }
        }
    }
    return url.toString();
}
// src/http/createFetchClient.ts
async function buildAuthHeaders(auth) {
    if (!auth || auth.type === "none") {
        return {};
    }
    if (auth.type === "bearer") {
        return {
            Authorization: `Bearer ${auth.token}`
        };
    }
    if (auth.type === "header") {
        return {
            [auth.name]: auth.value
        };
    }
    if (auth.type === "custom") {
        return await auth.getHeaders();
    }
    return {};
}
function createFetchClient(options) {
    const fetchFn = options.fetchImpl ?? globalThis.fetch;
    return {
        async request ({ method, path, query, body, headers }) {
            const url = buildUrl(options.baseUrl, path, query);
            const authHeaders = await buildAuthHeaders(options.auth);
            const res = await fetchFn(url, {
                method,
                headers: {
                    ...body ? {
                        "Content-Type": "application/json"
                    } : {},
                    ...authHeaders,
                    ...headers
                },
                body: body ? JSON.stringify(body) : void 0
            });
            const text = await res.text();
            const isJson = (res.headers.get("content-type") || "").includes("application/json");
            const data = isJson && text ? JSON.parse(text) : text;
            if (!res.ok) {
                const errBody = isJson ? data : void 0;
                const errorDetail = errBody?.error;
                throw new IcebergError(errorDetail?.message ?? `Request failed with status ${res.status}`, {
                    status: res.status,
                    icebergType: errorDetail?.type,
                    icebergCode: errorDetail?.code,
                    details: errBody
                });
            }
            return {
                status: res.status,
                headers: res.headers,
                data
            };
        }
    };
}
// src/catalog/namespaces.ts
function namespaceToPath(namespace) {
    return namespace.join("");
}
var NamespaceOperations = class {
    constructor(client, prefix = ""){
        this.client = client;
        this.prefix = prefix;
    }
    async listNamespaces(parent) {
        const query = parent ? {
            parent: namespaceToPath(parent.namespace)
        } : void 0;
        const response = await this.client.request({
            method: "GET",
            path: `${this.prefix}/namespaces`,
            query
        });
        return response.data.namespaces.map((ns)=>({
                namespace: ns
            }));
    }
    async createNamespace(id, metadata) {
        const request = {
            namespace: id.namespace,
            properties: metadata?.properties
        };
        const response = await this.client.request({
            method: "POST",
            path: `${this.prefix}/namespaces`,
            body: request
        });
        return response.data;
    }
    async dropNamespace(id) {
        await this.client.request({
            method: "DELETE",
            path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
        });
    }
    async loadNamespaceMetadata(id) {
        const response = await this.client.request({
            method: "GET",
            path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
        });
        return {
            properties: response.data.properties
        };
    }
    async namespaceExists(id) {
        try {
            await this.client.request({
                method: "HEAD",
                path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
            });
            return true;
        } catch (error) {
            if (error instanceof IcebergError && error.status === 404) {
                return false;
            }
            throw error;
        }
    }
    async createNamespaceIfNotExists(id, metadata) {
        try {
            return await this.createNamespace(id, metadata);
        } catch (error) {
            if (error instanceof IcebergError && error.status === 409) {
                return;
            }
            throw error;
        }
    }
};
// src/catalog/tables.ts
function namespaceToPath2(namespace) {
    return namespace.join("");
}
var TableOperations = class {
    constructor(client, prefix = "", accessDelegation){
        this.client = client;
        this.prefix = prefix;
        this.accessDelegation = accessDelegation;
    }
    async listTables(namespace) {
        const response = await this.client.request({
            method: "GET",
            path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`
        });
        return response.data.identifiers;
    }
    async createTable(namespace, request) {
        const headers = {};
        if (this.accessDelegation) {
            headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
        }
        const response = await this.client.request({
            method: "POST",
            path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`,
            body: request,
            headers
        });
        return response.data.metadata;
    }
    async updateTable(id, request) {
        const response = await this.client.request({
            method: "POST",
            path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
            body: request
        });
        return {
            "metadata-location": response.data["metadata-location"],
            metadata: response.data.metadata
        };
    }
    async dropTable(id, options) {
        await this.client.request({
            method: "DELETE",
            path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
            query: {
                purgeRequested: String(options?.purge ?? false)
            }
        });
    }
    async loadTable(id) {
        const headers = {};
        if (this.accessDelegation) {
            headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
        }
        const response = await this.client.request({
            method: "GET",
            path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
            headers
        });
        return response.data.metadata;
    }
    async tableExists(id) {
        const headers = {};
        if (this.accessDelegation) {
            headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
        }
        try {
            await this.client.request({
                method: "HEAD",
                path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
                headers
            });
            return true;
        } catch (error) {
            if (error instanceof IcebergError && error.status === 404) {
                return false;
            }
            throw error;
        }
    }
    async createTableIfNotExists(namespace, request) {
        try {
            return await this.createTable(namespace, request);
        } catch (error) {
            if (error instanceof IcebergError && error.status === 409) {
                return await this.loadTable({
                    namespace: namespace.namespace,
                    name: request.name
                });
            }
            throw error;
        }
    }
};
// src/catalog/IcebergRestCatalog.ts
var IcebergRestCatalog = class {
    /**
   * Creates a new Iceberg REST Catalog client.
   *
   * @param options - Configuration options for the catalog client
   */ constructor(options){
        let prefix = "v1";
        if (options.catalogName) {
            prefix += `/${options.catalogName}`;
        }
        const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : `${options.baseUrl}/`;
        this.client = createFetchClient({
            baseUrl,
            auth: options.auth,
            fetchImpl: options.fetch
        });
        this.accessDelegation = options.accessDelegation?.join(",");
        this.namespaceOps = new NamespaceOperations(this.client, prefix);
        this.tableOps = new TableOperations(this.client, prefix, this.accessDelegation);
    }
    /**
   * Lists all namespaces in the catalog.
   *
   * @param parent - Optional parent namespace to list children under
   * @returns Array of namespace identifiers
   *
   * @example
   * ```typescript
   * // List all top-level namespaces
   * const namespaces = await catalog.listNamespaces();
   *
   * // List namespaces under a parent
   * const children = await catalog.listNamespaces({ namespace: ['analytics'] });
   * ```
   */ async listNamespaces(parent) {
        return this.namespaceOps.listNamespaces(parent);
    }
    /**
   * Creates a new namespace in the catalog.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespace(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * console.log(response.namespace); // ['analytics']
   * console.log(response.properties); // { owner: 'data-team', ... }
   * ```
   */ async createNamespace(id, metadata) {
        return this.namespaceOps.createNamespace(id, metadata);
    }
    /**
   * Drops a namespace from the catalog.
   *
   * The namespace must be empty (contain no tables) before it can be dropped.
   *
   * @param id - Namespace identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropNamespace({ namespace: ['analytics'] });
   * ```
   */ async dropNamespace(id) {
        await this.namespaceOps.dropNamespace(id);
    }
    /**
   * Loads metadata for a namespace.
   *
   * @param id - Namespace identifier to load
   * @returns Namespace metadata including properties
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadNamespaceMetadata({ namespace: ['analytics'] });
   * console.log(metadata.properties);
   * ```
   */ async loadNamespaceMetadata(id) {
        return this.namespaceOps.loadNamespaceMetadata(id);
    }
    /**
   * Lists all tables in a namespace.
   *
   * @param namespace - Namespace identifier to list tables from
   * @returns Array of table identifiers
   *
   * @example
   * ```typescript
   * const tables = await catalog.listTables({ namespace: ['analytics'] });
   * console.log(tables); // [{ namespace: ['analytics'], name: 'events' }, ...]
   * ```
   */ async listTables(namespace) {
        return this.tableOps.listTables(namespace);
    }
    /**
   * Creates a new table in the catalog.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTable(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     },
   *     'partition-spec': {
   *       'spec-id': 0,
   *       fields: [
   *         { source_id: 2, field_id: 1000, name: 'ts_day', transform: 'day' }
   *       ]
   *     }
   *   }
   * );
   * ```
   */ async createTable(namespace, request) {
        return this.tableOps.createTable(namespace, request);
    }
    /**
   * Updates an existing table's metadata.
   *
   * Can update the schema, partition spec, or properties of a table.
   *
   * @param id - Table identifier to update
   * @param request - Update request with fields to modify
   * @returns Response containing the metadata location and updated table metadata
   *
   * @example
   * ```typescript
   * const response = await catalog.updateTable(
   *   { namespace: ['analytics'], name: 'events' },
   *   {
   *     properties: { 'read.split.target-size': '134217728' }
   *   }
   * );
   * console.log(response['metadata-location']); // s3://...
   * console.log(response.metadata); // TableMetadata object
   * ```
   */ async updateTable(id, request) {
        return this.tableOps.updateTable(id, request);
    }
    /**
   * Drops a table from the catalog.
   *
   * @param id - Table identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropTable({ namespace: ['analytics'], name: 'events' });
   * ```
   */ async dropTable(id, options) {
        await this.tableOps.dropTable(id, options);
    }
    /**
   * Loads metadata for a table.
   *
   * @param id - Table identifier to load
   * @returns Table metadata including schema, partition spec, location, etc.
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadTable({ namespace: ['analytics'], name: 'events' });
   * console.log(metadata.schema);
   * console.log(metadata.location);
   * ```
   */ async loadTable(id) {
        return this.tableOps.loadTable(id);
    }
    /**
   * Checks if a namespace exists in the catalog.
   *
   * @param id - Namespace identifier to check
   * @returns True if the namespace exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.namespaceExists({ namespace: ['analytics'] });
   * console.log(exists); // true or false
   * ```
   */ async namespaceExists(id) {
        return this.namespaceOps.namespaceExists(id);
    }
    /**
   * Checks if a table exists in the catalog.
   *
   * @param id - Table identifier to check
   * @returns True if the table exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.tableExists({ namespace: ['analytics'], name: 'events' });
   * console.log(exists); // true or false
   * ```
   */ async tableExists(id) {
        return this.tableOps.tableExists(id);
    }
    /**
   * Creates a namespace if it does not exist.
   *
   * If the namespace already exists, returns void. If created, returns the response.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties, or void if it already exists
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespaceIfNotExists(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * if (response) {
   *   console.log('Created:', response.namespace);
   * } else {
   *   console.log('Already exists');
   * }
   * ```
   */ async createNamespaceIfNotExists(id, metadata) {
        return this.namespaceOps.createNamespaceIfNotExists(id, metadata);
    }
    /**
   * Creates a table if it does not exist.
   *
   * If the table already exists, returns its metadata instead.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created or existing table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTableIfNotExists(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     }
   *   }
   * );
   * ```
   */ async createTableIfNotExists(namespace, request) {
        return this.tableOps.createTableIfNotExists(namespace, request);
    }
};
// src/catalog/types.ts
var DECIMAL_REGEX = /^decimal\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/;
var FIXED_REGEX = /^fixed\s*\[\s*(\d+)\s*\]$/;
function parseDecimalType(type) {
    const match = type.match(DECIMAL_REGEX);
    if (!match) return null;
    return {
        precision: parseInt(match[1], 10),
        scale: parseInt(match[2], 10)
    };
}
function parseFixedType(type) {
    const match = type.match(FIXED_REGEX);
    if (!match) return null;
    return {
        length: parseInt(match[1], 10)
    };
}
function isDecimalType(type) {
    return DECIMAL_REGEX.test(type);
}
function isFixedType(type) {
    return FIXED_REGEX.test(type);
}
function typesEqual(a, b) {
    const decimalA = parseDecimalType(a);
    const decimalB = parseDecimalType(b);
    if (decimalA && decimalB) {
        return decimalA.precision === decimalB.precision && decimalA.scale === decimalB.scale;
    }
    const fixedA = parseFixedType(a);
    const fixedB = parseFixedType(b);
    if (fixedA && fixedB) {
        return fixedA.length === fixedB.length;
    }
    return a === b;
}
function getCurrentSchema(metadata) {
    return metadata.schemas.find((s)=>s["schema-id"] === metadata["current-schema-id"]);
}
;
 //# sourceMappingURL=index.mjs.map
 //# sourceMappingURL=index.mjs.map
}),
"[project]/node_modules/.pnpm/@supabase+storage-js@2.95.3/node_modules/@supabase/storage-js/dist/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StorageAnalyticsClient",
    ()=>StorageAnalyticsClient,
    "StorageApiError",
    ()=>StorageApiError,
    "StorageClient",
    ()=>StorageClient,
    "StorageError",
    ()=>StorageError,
    "StorageUnknownError",
    ()=>StorageUnknownError,
    "StorageVectorsApiError",
    ()=>StorageVectorsApiError,
    "StorageVectorsClient",
    ()=>StorageVectorsClient,
    "StorageVectorsError",
    ()=>StorageVectorsError,
    "StorageVectorsErrorCode",
    ()=>StorageVectorsErrorCode,
    "StorageVectorsUnknownError",
    ()=>StorageVectorsUnknownError,
    "VectorBucketApi",
    ()=>VectorBucketApi,
    "VectorBucketScope",
    ()=>VectorBucketScope,
    "VectorDataApi",
    ()=>VectorDataApi,
    "VectorIndexApi",
    ()=>VectorIndexApi,
    "VectorIndexScope",
    ()=>VectorIndexScope,
    "isStorageError",
    ()=>isStorageError,
    "isStorageVectorsError",
    ()=>isStorageVectorsError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$iceberg$2d$js$40$0$2e$8$2e$1$2f$node_modules$2f$iceberg$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/iceberg-js@0.8.1/node_modules/iceberg-js/dist/index.mjs [app-route] (ecmascript)");
;
//#region src/lib/common/errors.ts
/**
* Base error class for all Storage errors
* Supports both 'storage' and 'vectors' namespaces
*/ var StorageError = class extends Error {
    constructor(message, namespace = "storage", status, statusCode){
        super(message);
        this.__isStorageError = true;
        this.namespace = namespace;
        this.name = namespace === "vectors" ? "StorageVectorsError" : "StorageError";
        this.status = status;
        this.statusCode = statusCode;
    }
};
/**
* Type guard to check if an error is a StorageError
* @param error - The error to check
* @returns True if the error is a StorageError
*/ function isStorageError(error) {
    return typeof error === "object" && error !== null && "__isStorageError" in error;
}
/**
* API error returned from Storage service
* Includes HTTP status code and service-specific error code
*/ var StorageApiError = class extends StorageError {
    constructor(message, status, statusCode, namespace = "storage"){
        super(message, namespace, status, statusCode);
        this.name = namespace === "vectors" ? "StorageVectorsApiError" : "StorageApiError";
        this.status = status;
        this.statusCode = statusCode;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            statusCode: this.statusCode
        };
    }
};
/**
* Unknown error that doesn't match expected error patterns
* Wraps the original error for debugging
*/ var StorageUnknownError = class extends StorageError {
    constructor(message, originalError, namespace = "storage"){
        super(message, namespace);
        this.name = namespace === "vectors" ? "StorageVectorsUnknownError" : "StorageUnknownError";
        this.originalError = originalError;
    }
};
/**
* @deprecated Use StorageError with namespace='vectors' instead
* Alias for backward compatibility with existing vector storage code
*/ var StorageVectorsError = class extends StorageError {
    constructor(message){
        super(message, "vectors");
    }
};
/**
* Type guard to check if an error is a StorageVectorsError
* @param error - The error to check
* @returns True if the error is a StorageVectorsError
*/ function isStorageVectorsError(error) {
    return isStorageError(error) && error["namespace"] === "vectors";
}
/**
* @deprecated Use StorageApiError with namespace='vectors' instead
* Alias for backward compatibility with existing vector storage code
*/ var StorageVectorsApiError = class extends StorageApiError {
    constructor(message, status, statusCode){
        super(message, status, statusCode, "vectors");
    }
};
/**
* @deprecated Use StorageUnknownError with namespace='vectors' instead
* Alias for backward compatibility with existing vector storage code
*/ var StorageVectorsUnknownError = class extends StorageUnknownError {
    constructor(message, originalError){
        super(message, originalError, "vectors");
    }
};
/**
* Error codes specific to S3 Vectors API
* Maps AWS service errors to application-friendly error codes
*/ let StorageVectorsErrorCode = /* @__PURE__ */ function(StorageVectorsErrorCode$1) {
    /** Internal server fault (HTTP 500) */ StorageVectorsErrorCode$1["InternalError"] = "InternalError";
    /** Resource already exists / conflict (HTTP 409) */ StorageVectorsErrorCode$1["S3VectorConflictException"] = "S3VectorConflictException";
    /** Resource not found (HTTP 404) */ StorageVectorsErrorCode$1["S3VectorNotFoundException"] = "S3VectorNotFoundException";
    /** Delete bucket while not empty (HTTP 400) */ StorageVectorsErrorCode$1["S3VectorBucketNotEmpty"] = "S3VectorBucketNotEmpty";
    /** Exceeds bucket quota/limit (HTTP 400) */ StorageVectorsErrorCode$1["S3VectorMaxBucketsExceeded"] = "S3VectorMaxBucketsExceeded";
    /** Exceeds index quota/limit (HTTP 400) */ StorageVectorsErrorCode$1["S3VectorMaxIndexesExceeded"] = "S3VectorMaxIndexesExceeded";
    return StorageVectorsErrorCode$1;
}({});
//#endregion
//#region src/lib/common/helpers.ts
/**
* Resolves the fetch implementation to use
* Uses custom fetch if provided, otherwise uses native fetch
*
* @param customFetch - Optional custom fetch implementation
* @returns Resolved fetch function
*/ const resolveFetch = (customFetch)=>{
    if (customFetch) return (...args)=>customFetch(...args);
    return (...args)=>fetch(...args);
};
/**
* Determine if input is a plain object
* An object is plain if it's created by either {}, new Object(), or Object.create(null)
*
* @param value - Value to check
* @returns True if value is a plain object
* @source https://github.com/sindresorhus/is-plain-obj
*/ const isPlainObject = (value)=>{
    if (typeof value !== "object" || value === null) return false;
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
};
/**
* Recursively converts object keys from snake_case to camelCase
* Used for normalizing API responses
*
* @param item - Object to convert
* @returns Converted object with camelCase keys
*/ const recursiveToCamel = (item)=>{
    if (Array.isArray(item)) return item.map((el)=>recursiveToCamel(el));
    else if (typeof item === "function" || item !== Object(item)) return item;
    const result = {};
    Object.entries(item).forEach(([key, value])=>{
        const newKey = key.replace(/([-_][a-z])/gi, (c)=>c.toUpperCase().replace(/[-_]/g, ""));
        result[newKey] = recursiveToCamel(value);
    });
    return result;
};
/**
* Validates if a given bucket name is valid according to Supabase Storage API rules
* Mirrors backend validation from: storage/src/storage/limits.ts:isValidBucketName()
*
* Rules:
* - Length: 1-100 characters
* - Allowed characters: alphanumeric (a-z, A-Z, 0-9), underscore (_), and safe special characters
* - Safe special characters: ! - . * ' ( ) space & $ @ = ; : + , ?
* - Forbidden: path separators (/, \), path traversal (..), leading/trailing whitespace
*
* AWS S3 Reference: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
*
* @param bucketName - The bucket name to validate
* @returns true if valid, false otherwise
*/ const isValidBucketName = (bucketName)=>{
    if (!bucketName || typeof bucketName !== "string") return false;
    if (bucketName.length === 0 || bucketName.length > 100) return false;
    if (bucketName.trim() !== bucketName) return false;
    if (bucketName.includes("/") || bucketName.includes("\\")) return false;
    return /^[\w!.\*'() &$@=;:+,?-]+$/.test(bucketName);
};
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/typeof.js
function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
        return typeof o$1;
    } : function(o$1) {
        return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, _typeof(o);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPrimitive.js
function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPropertyKey.js
function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/defineProperty.js
function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/objectSpread2.js
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r$1) {
            return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread2(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r$1) {
            _defineProperty(e, r$1, t[r$1]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r$1) {
            Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
        });
    }
    return e;
}
//#endregion
//#region src/lib/common/fetch.ts
/**
* Extracts error message from various error response formats
* @param err - Error object from API
* @returns Human-readable error message
*/ const _getErrorMessage = (err)=>{
    var _err$error;
    return err.msg || err.message || err.error_description || (typeof err.error === "string" ? err.error : (_err$error = err.error) === null || _err$error === void 0 ? void 0 : _err$error.message) || JSON.stringify(err);
};
/**
* Handles fetch errors and converts them to Storage error types
* @param error - The error caught from fetch
* @param reject - Promise rejection function
* @param options - Fetch options that may affect error handling
* @param namespace - Error namespace ('storage' or 'vectors')
*/ const handleError = async (error, reject, options, namespace)=>{
    if (error && typeof error === "object" && "status" in error && "ok" in error && typeof error.status === "number" && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
        const responseError = error;
        const status = responseError.status || 500;
        if (typeof responseError.json === "function") responseError.json().then((err)=>{
            const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || (err === null || err === void 0 ? void 0 : err.code) || status + "";
            reject(new StorageApiError(_getErrorMessage(err), status, statusCode, namespace));
        }).catch(()=>{
            if (namespace === "vectors") {
                const statusCode = status + "";
                reject(new StorageApiError(responseError.statusText || `HTTP ${status} error`, status, statusCode, namespace));
            } else {
                const statusCode = status + "";
                reject(new StorageApiError(responseError.statusText || `HTTP ${status} error`, status, statusCode, namespace));
            }
        });
        else {
            const statusCode = status + "";
            reject(new StorageApiError(responseError.statusText || `HTTP ${status} error`, status, statusCode, namespace));
        }
    } else reject(new StorageUnknownError(_getErrorMessage(error), error, namespace));
};
/**
* Builds request parameters for fetch calls
* @param method - HTTP method
* @param options - Custom fetch options
* @param parameters - Additional fetch parameters like AbortSignal
* @param body - Request body (will be JSON stringified if plain object)
* @returns Complete fetch request parameters
*/ const _getRequestParams = (method, options, parameters, body)=>{
    const params = {
        method,
        headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
    };
    if (method === "GET" || method === "HEAD" || !body) return _objectSpread2(_objectSpread2({}, params), parameters);
    if (isPlainObject(body)) {
        params.headers = _objectSpread2({
            "Content-Type": "application/json"
        }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
    } else params.body = body;
    if (options === null || options === void 0 ? void 0 : options.duplex) params.duplex = options.duplex;
    return _objectSpread2(_objectSpread2({}, params), parameters);
};
/**
* Internal request handler that wraps fetch with error handling
* @param fetcher - Fetch function to use
* @param method - HTTP method
* @param url - Request URL
* @param options - Custom fetch options
* @param parameters - Additional fetch parameters
* @param body - Request body
* @param namespace - Error namespace ('storage' or 'vectors')
* @returns Promise with parsed response or error
*/ async function _handleRequest(fetcher, method, url, options, parameters, body, namespace) {
    return new Promise((resolve, reject)=>{
        fetcher(url, _getRequestParams(method, options, parameters, body)).then((result)=>{
            if (!result.ok) throw result;
            if (options === null || options === void 0 ? void 0 : options.noResolveJson) return result;
            if (namespace === "vectors") {
                const contentType = result.headers.get("content-type");
                if (result.headers.get("content-length") === "0" || result.status === 204) return {};
                if (!contentType || !contentType.includes("application/json")) return {};
            }
            return result.json();
        }).then((data)=>resolve(data)).catch((error)=>handleError(error, reject, options, namespace));
    });
}
/**
* Creates a fetch API with the specified namespace
* @param namespace - Error namespace ('storage' or 'vectors')
* @returns Object with HTTP method functions
*/ function createFetchApi(namespace = "storage") {
    return {
        get: async (fetcher, url, options, parameters)=>{
            return _handleRequest(fetcher, "GET", url, options, parameters, void 0, namespace);
        },
        post: async (fetcher, url, body, options, parameters)=>{
            return _handleRequest(fetcher, "POST", url, options, parameters, body, namespace);
        },
        put: async (fetcher, url, body, options, parameters)=>{
            return _handleRequest(fetcher, "PUT", url, options, parameters, body, namespace);
        },
        head: async (fetcher, url, options, parameters)=>{
            return _handleRequest(fetcher, "HEAD", url, _objectSpread2(_objectSpread2({}, options), {}, {
                noResolveJson: true
            }), parameters, void 0, namespace);
        },
        remove: async (fetcher, url, body, options, parameters)=>{
            return _handleRequest(fetcher, "DELETE", url, options, parameters, body, namespace);
        }
    };
}
const defaultApi = createFetchApi("storage");
const { get, post, put, head, remove } = defaultApi;
const vectorsApi = createFetchApi("vectors");
//#endregion
//#region src/lib/common/BaseApiClient.ts
/**
* @ignore
* Base API client class for all Storage API classes
* Provides common infrastructure for error handling and configuration
*
* @typeParam TError - The error type (StorageError or subclass)
*/ var BaseApiClient = class {
    /**
	* Creates a new BaseApiClient instance
	* @param url - Base URL for API requests
	* @param headers - Default headers for API requests
	* @param fetch - Optional custom fetch implementation
	* @param namespace - Error namespace ('storage' or 'vectors')
	*/ constructor(url, headers = {}, fetch$1, namespace = "storage"){
        this.shouldThrowOnError = false;
        this.url = url;
        this.headers = headers;
        this.fetch = resolveFetch(fetch$1);
        this.namespace = namespace;
    }
    /**
	* Enable throwing errors instead of returning them.
	* When enabled, errors are thrown instead of returned in { data, error } format.
	*
	* @returns this - For method chaining
	*/ throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /**
	* Handles API operation with standardized error handling
	* Eliminates repetitive try-catch blocks across all API methods
	*
	* This wrapper:
	* 1. Executes the operation
	* 2. Returns { data, error: null } on success
	* 3. Returns { data: null, error } on failure (if shouldThrowOnError is false)
	* 4. Throws error on failure (if shouldThrowOnError is true)
	*
	* @typeParam T - The expected data type from the operation
	* @param operation - Async function that performs the API call
	* @returns Promise with { data, error } tuple
	*
	* @example
	* ```typescript
	* async listBuckets() {
	*   return this.handleOperation(async () => {
	*     return await get(this.fetch, `${this.url}/bucket`, {
	*       headers: this.headers,
	*     })
	*   })
	* }
	* ```
	*/ async handleOperation(operation) {
        var _this = this;
        try {
            return {
                data: await operation(),
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if (isStorageError(error)) return {
                data: null,
                error
            };
            throw error;
        }
    }
};
//#endregion
//#region src/packages/StreamDownloadBuilder.ts
var StreamDownloadBuilder = class {
    constructor(downloadFn, shouldThrowOnError){
        this.downloadFn = downloadFn;
        this.shouldThrowOnError = shouldThrowOnError;
    }
    then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }
    async execute() {
        var _this = this;
        try {
            return {
                data: (await _this.downloadFn()).body,
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if (isStorageError(error)) return {
                data: null,
                error
            };
            throw error;
        }
    }
};
//#endregion
//#region src/packages/BlobDownloadBuilder.ts
let _Symbol$toStringTag;
_Symbol$toStringTag = Symbol.toStringTag;
var BlobDownloadBuilder = class {
    constructor(downloadFn, shouldThrowOnError){
        this.downloadFn = downloadFn;
        this.shouldThrowOnError = shouldThrowOnError;
        this[_Symbol$toStringTag] = "BlobDownloadBuilder";
        this.promise = null;
    }
    asStream() {
        return new StreamDownloadBuilder(this.downloadFn, this.shouldThrowOnError);
    }
    then(onfulfilled, onrejected) {
        return this.getPromise().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.getPromise().catch(onrejected);
    }
    finally(onfinally) {
        return this.getPromise().finally(onfinally);
    }
    getPromise() {
        if (!this.promise) this.promise = this.execute();
        return this.promise;
    }
    async execute() {
        var _this = this;
        try {
            return {
                data: await (await _this.downloadFn()).blob(),
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if (isStorageError(error)) return {
                data: null,
                error
            };
            throw error;
        }
    }
};
//#endregion
//#region src/packages/StorageFileApi.ts
const DEFAULT_SEARCH_OPTIONS = {
    limit: 100,
    offset: 0,
    sortBy: {
        column: "name",
        order: "asc"
    }
};
const DEFAULT_FILE_OPTIONS = {
    cacheControl: "3600",
    contentType: "text/plain;charset=UTF-8",
    upsert: false
};
var StorageFileApi = class extends BaseApiClient {
    constructor(url, headers = {}, bucketId, fetch$1){
        super(url, headers, fetch$1, "storage");
        this.bucketId = bucketId;
    }
    /**
	* Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
	*
	* @param method HTTP method.
	* @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
	* @param fileBody The body of the file to be stored in the bucket.
	*/ async uploadOrUpdate(method, path, fileBody, fileOptions) {
        var _this = this;
        return _this.handleOperation(async ()=>{
            let body;
            const options = _objectSpread2(_objectSpread2({}, DEFAULT_FILE_OPTIONS), fileOptions);
            let headers = _objectSpread2(_objectSpread2({}, _this.headers), method === "POST" && {
                "x-upsert": String(options.upsert)
            });
            const metadata = options.metadata;
            if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
                body = new FormData();
                body.append("cacheControl", options.cacheControl);
                if (metadata) body.append("metadata", _this.encodeMetadata(metadata));
                body.append("", fileBody);
            } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
                body = fileBody;
                if (!body.has("cacheControl")) body.append("cacheControl", options.cacheControl);
                if (metadata && !body.has("metadata")) body.append("metadata", _this.encodeMetadata(metadata));
            } else {
                body = fileBody;
                headers["cache-control"] = `max-age=${options.cacheControl}`;
                headers["content-type"] = options.contentType;
                if (metadata) headers["x-metadata"] = _this.toBase64(_this.encodeMetadata(metadata));
                if ((typeof ReadableStream !== "undefined" && body instanceof ReadableStream || body && typeof body === "object" && "pipe" in body && typeof body.pipe === "function") && !options.duplex) options.duplex = "half";
            }
            if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) headers = _objectSpread2(_objectSpread2({}, headers), fileOptions.headers);
            const cleanPath = _this._removeEmptyFolders(path);
            const _path = _this._getFinalPath(cleanPath);
            const data = await (method == "PUT" ? put : post)(_this.fetch, `${_this.url}/object/${_path}`, body, _objectSpread2({
                headers
            }, (options === null || options === void 0 ? void 0 : options.duplex) ? {
                duplex: options.duplex
            } : {}));
            return {
                path: cleanPath,
                id: data.Id,
                fullPath: data.Key
            };
        });
    }
    /**
	* Uploads a file to an existing bucket.
	*
	* @category File Buckets
	* @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
	* @param fileBody The body of the file to be stored in the bucket.
	* @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
	* @returns Promise with response containing file path, id, and fullPath or error
	*
	* @example Upload file
	* ```js
	* const avatarFile = event.target.files[0]
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .upload('public/avatar1.png', avatarFile, {
	*     cacheControl: '3600',
	*     upsert: false
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "public/avatar1.png",
	*     "fullPath": "avatars/public/avatar1.png"
	*   },
	*   "error": null
	* }
	* ```
	*
	* @example Upload file using `ArrayBuffer` from base64 file data
	* ```js
	* import { decode } from 'base64-arraybuffer'
	*
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .upload('public/avatar1.png', decode('base64FileData'), {
	*     contentType: 'image/png'
	*   })
	* ```
	*/ async upload(path, fileBody, fileOptions) {
        return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
    }
    /**
	* Upload a file with a token generated from `createSignedUploadUrl`.
	*
	* @category File Buckets
	* @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
	* @param token The token generated from `createSignedUploadUrl`
	* @param fileBody The body of the file to be stored in the bucket.
	* @param fileOptions HTTP headers (cacheControl, contentType, etc.).
	* **Note:** The `upsert` option has no effect here. To enable upsert behavior,
	* pass `{ upsert: true }` when calling `createSignedUploadUrl()` instead.
	* @returns Promise with response containing file path and fullPath or error
	*
	* @example Upload to a signed URL
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "folder/cat.jpg",
	*     "fullPath": "avatars/folder/cat.jpg"
	*   },
	*   "error": null
	* }
	* ```
	*/ async uploadToSignedUrl(path, token, fileBody, fileOptions) {
        var _this3 = this;
        const cleanPath = _this3._removeEmptyFolders(path);
        const _path = _this3._getFinalPath(cleanPath);
        const url = new URL(_this3.url + `/object/upload/sign/${_path}`);
        url.searchParams.set("token", token);
        return _this3.handleOperation(async ()=>{
            let body;
            const options = _objectSpread2({
                upsert: DEFAULT_FILE_OPTIONS.upsert
            }, fileOptions);
            const headers = _objectSpread2(_objectSpread2({}, _this3.headers), {
                "x-upsert": String(options.upsert)
            });
            if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
                body = new FormData();
                body.append("cacheControl", options.cacheControl);
                body.append("", fileBody);
            } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
                body = fileBody;
                body.append("cacheControl", options.cacheControl);
            } else {
                body = fileBody;
                headers["cache-control"] = `max-age=${options.cacheControl}`;
                headers["content-type"] = options.contentType;
            }
            return {
                path: cleanPath,
                fullPath: (await put(_this3.fetch, url.toString(), body, {
                    headers
                })).Key
            };
        });
    }
    /**
	* Creates a signed upload URL.
	* Signed upload URLs can be used to upload files to the bucket without further authentication.
	* They are valid for 2 hours.
	*
	* @category File Buckets
	* @param path The file path, including the current file name. For example `folder/image.png`.
	* @param options.upsert If set to true, allows the file to be overwritten if it already exists.
	* @returns Promise with response containing signed upload URL, token, and path or error
	*
	* @example Create Signed Upload URL
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUploadUrl('folder/cat.jpg')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "signedUrl": "https://example.supabase.co/storage/v1/object/upload/sign/avatars/folder/cat.jpg?token=<TOKEN>",
	*     "path": "folder/cat.jpg",
	*     "token": "<TOKEN>"
	*   },
	*   "error": null
	* }
	* ```
	*/ async createSignedUploadUrl(path, options) {
        var _this4 = this;
        return _this4.handleOperation(async ()=>{
            let _path = _this4._getFinalPath(path);
            const headers = _objectSpread2({}, _this4.headers);
            if (options === null || options === void 0 ? void 0 : options.upsert) headers["x-upsert"] = "true";
            const data = await post(_this4.fetch, `${_this4.url}/object/upload/sign/${_path}`, {}, {
                headers
            });
            const url = new URL(_this4.url + data.url);
            const token = url.searchParams.get("token");
            if (!token) throw new StorageError("No token returned by API");
            return {
                signedUrl: url.toString(),
                path,
                token
            };
        });
    }
    /**
	* Replaces an existing file at the specified path with a new one.
	*
	* @category File Buckets
	* @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
	* @param fileBody The body of the file to be stored in the bucket.
	* @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
	* @returns Promise with response containing file path, id, and fullPath or error
	*
	* @example Update file
	* ```js
	* const avatarFile = event.target.files[0]
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .update('public/avatar1.png', avatarFile, {
	*     cacheControl: '3600',
	*     upsert: true
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "public/avatar1.png",
	*     "fullPath": "avatars/public/avatar1.png"
	*   },
	*   "error": null
	* }
	* ```
	*
	* @example Update file using `ArrayBuffer` from base64 file data
	* ```js
	* import {decode} from 'base64-arraybuffer'
	*
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .update('public/avatar1.png', decode('base64FileData'), {
	*     contentType: 'image/png'
	*   })
	* ```
	*/ async update(path, fileBody, fileOptions) {
        return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
    }
    /**
	* Moves an existing file to a new path in the same bucket.
	*
	* @category File Buckets
	* @param fromPath The original file path, including the current file name. For example `folder/image.png`.
	* @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
	* @param options The destination options.
	* @returns Promise with response containing success message or error
	*
	* @example Move file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .move('public/avatar1.png', 'private/avatar2.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully moved"
	*   },
	*   "error": null
	* }
	* ```
	*/ async move(fromPath, toPath, options) {
        var _this6 = this;
        return _this6.handleOperation(async ()=>{
            return await post(_this6.fetch, `${_this6.url}/object/move`, {
                bucketId: _this6.bucketId,
                sourceKey: fromPath,
                destinationKey: toPath,
                destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
            }, {
                headers: _this6.headers
            });
        });
    }
    /**
	* Copies an existing file to a new path in the same bucket.
	*
	* @category File Buckets
	* @param fromPath The original file path, including the current file name. For example `folder/image.png`.
	* @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
	* @param options The destination options.
	* @returns Promise with response containing copied file path or error
	*
	* @example Copy file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .copy('public/avatar1.png', 'private/avatar2.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "avatars/private/avatar2.png"
	*   },
	*   "error": null
	* }
	* ```
	*/ async copy(fromPath, toPath, options) {
        var _this7 = this;
        return _this7.handleOperation(async ()=>{
            return {
                path: (await post(_this7.fetch, `${_this7.url}/object/copy`, {
                    bucketId: _this7.bucketId,
                    sourceKey: fromPath,
                    destinationKey: toPath,
                    destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
                }, {
                    headers: _this7.headers
                })).Key
            };
        });
    }
    /**
	* Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
	*
	* @category File Buckets
	* @param path The file path, including the current file name. For example `folder/image.png`.
	* @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
	* @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
	* @param options.transform Transform the asset before serving it to the client.
	* @returns Promise with response containing signed URL or error
	*
	* @example Create Signed URL
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrl('folder/avatar1.png', 60)
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
	*   },
	*   "error": null
	* }
	* ```
	*
	* @example Create a signed URL for an asset with transformations
	* ```js
	* const { data } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrl('folder/avatar1.png', 60, {
	*     transform: {
	*       width: 100,
	*       height: 100,
	*     }
	*   })
	* ```
	*
	* @example Create a signed URL which triggers the download of the asset
	* ```js
	* const { data } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrl('folder/avatar1.png', 60, {
	*     download: true,
	*   })
	* ```
	*/ async createSignedUrl(path, expiresIn, options) {
        var _this8 = this;
        return _this8.handleOperation(async ()=>{
            let _path = _this8._getFinalPath(path);
            let data = await post(_this8.fetch, `${_this8.url}/object/sign/${_path}`, _objectSpread2({
                expiresIn
            }, (options === null || options === void 0 ? void 0 : options.transform) ? {
                transform: options.transform
            } : {}), {
                headers: _this8.headers
            });
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
            return {
                signedUrl: encodeURI(`${_this8.url}${data.signedURL}${downloadQueryParam}`)
            };
        });
    }
    /**
	* Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
	*
	* @category File Buckets
	* @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
	* @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
	* @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
	* @returns Promise with response containing array of objects with signedUrl, path, and error or error
	*
	* @example Create Signed URLs
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [
	*     {
	*       "error": null,
	*       "path": "folder/avatar1.png",
	*       "signedURL": "/object/sign/avatars/folder/avatar1.png?token=<TOKEN>",
	*       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
	*     },
	*     {
	*       "error": null,
	*       "path": "folder/avatar2.png",
	*       "signedURL": "/object/sign/avatars/folder/avatar2.png?token=<TOKEN>",
	*       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar2.png?token=<TOKEN>"
	*     }
	*   ],
	*   "error": null
	* }
	* ```
	*/ async createSignedUrls(paths, expiresIn, options) {
        var _this9 = this;
        return _this9.handleOperation(async ()=>{
            const data = await post(_this9.fetch, `${_this9.url}/object/sign/${_this9.bucketId}`, {
                expiresIn,
                paths
            }, {
                headers: _this9.headers
            });
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
            return data.map((datum)=>_objectSpread2(_objectSpread2({}, datum), {}, {
                    signedUrl: datum.signedURL ? encodeURI(`${_this9.url}${datum.signedURL}${downloadQueryParam}`) : null
                }));
        });
    }
    /**
	* Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
	*
	* @category File Buckets
	* @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
	* @param options.transform Transform the asset before serving it to the client.
	* @param parameters Additional fetch parameters like signal for cancellation. Supports standard fetch options including cache control.
	* @returns BlobDownloadBuilder instance for downloading the file
	*
	* @example Download file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .download('folder/avatar1.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": <BLOB>,
	*   "error": null
	* }
	* ```
	*
	* @example Download file with transformations
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .download('folder/avatar1.png', {
	*     transform: {
	*       width: 100,
	*       height: 100,
	*       quality: 80
	*     }
	*   })
	* ```
	*
	* @example Download with cache control (useful in Edge Functions)
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .download('folder/avatar1.png', {}, { cache: 'no-store' })
	* ```
	*
	* @example Download with abort signal
	* ```js
	* const controller = new AbortController()
	* setTimeout(() => controller.abort(), 5000)
	*
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .download('folder/avatar1.png', {}, { signal: controller.signal })
	* ```
	*/ download(path, options, parameters) {
        const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined" ? "render/image/authenticated" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        const queryString = transformationQuery ? `?${transformationQuery}` : "";
        const _path = this._getFinalPath(path);
        const downloadFn = ()=>get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
                headers: this.headers,
                noResolveJson: true
            }, parameters);
        return new BlobDownloadBuilder(downloadFn, this.shouldThrowOnError);
    }
    /**
	* Retrieves the details of an existing file.
	*
	* @category File Buckets
	* @param path The file path, including the file name. For example `folder/image.png`.
	* @returns Promise with response containing file metadata or error
	*
	* @example Get file info
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .info('folder/avatar1.png')
	* ```
	*/ async info(path) {
        var _this10 = this;
        const _path = _this10._getFinalPath(path);
        return _this10.handleOperation(async ()=>{
            return recursiveToCamel(await get(_this10.fetch, `${_this10.url}/object/info/${_path}`, {
                headers: _this10.headers
            }));
        });
    }
    /**
	* Checks the existence of a file.
	*
	* @category File Buckets
	* @param path The file path, including the file name. For example `folder/image.png`.
	* @returns Promise with response containing boolean indicating file existence or error
	*
	* @example Check file existence
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .exists('folder/avatar1.png')
	* ```
	*/ async exists(path) {
        var _this11 = this;
        const _path = _this11._getFinalPath(path);
        try {
            await head(_this11.fetch, `${_this11.url}/object/${_path}`, {
                headers: _this11.headers
            });
            return {
                data: true,
                error: null
            };
        } catch (error) {
            if (_this11.shouldThrowOnError) throw error;
            if (isStorageError(error) && error instanceof StorageUnknownError) {
                const originalError = error.originalError;
                if ([
                    400,
                    404
                ].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) return {
                    data: false,
                    error
                };
            }
            throw error;
        }
    }
    /**
	* A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
	* This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
	*
	* @category File Buckets
	* @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
	* @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
	* @param options.transform Transform the asset before serving it to the client.
	* @returns Object with public URL
	*
	* @example Returns the URL for an asset in a public bucket
	* ```js
	* const { data } = supabase
	*   .storage
	*   .from('public-bucket')
	*   .getPublicUrl('folder/avatar1.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "publicUrl": "https://example.supabase.co/storage/v1/object/public/public-bucket/folder/avatar1.png"
	*   }
	* }
	* ```
	*
	* @example Returns the URL for an asset in a public bucket with transformations
	* ```js
	* const { data } = supabase
	*   .storage
	*   .from('public-bucket')
	*   .getPublicUrl('folder/avatar1.png', {
	*     transform: {
	*       width: 100,
	*       height: 100,
	*     }
	*   })
	* ```
	*
	* @example Returns the URL which triggers the download of an asset in a public bucket
	* ```js
	* const { data } = supabase
	*   .storage
	*   .from('public-bucket')
	*   .getPublicUrl('folder/avatar1.png', {
	*     download: true,
	*   })
	* ```
	*/ getPublicUrl(path, options) {
        const _path = this._getFinalPath(path);
        const _queryString = [];
        const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `download=${options.download === true ? "" : options.download}` : "";
        if (downloadQueryParam !== "") _queryString.push(downloadQueryParam);
        const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined" ? "render/image" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        if (transformationQuery !== "") _queryString.push(transformationQuery);
        let queryString = _queryString.join("&");
        if (queryString !== "") queryString = `?${queryString}`;
        return {
            data: {
                publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`)
            }
        };
    }
    /**
	* Deletes files within the same bucket
	*
	* @category File Buckets
	* @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
	* @returns Promise with response containing array of deleted file objects or error
	*
	* @example Delete file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .remove(['folder/avatar1.png'])
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [],
	*   "error": null
	* }
	* ```
	*/ async remove(paths) {
        var _this12 = this;
        return _this12.handleOperation(async ()=>{
            return await remove(_this12.fetch, `${_this12.url}/object/${_this12.bucketId}`, {
                prefixes: paths
            }, {
                headers: _this12.headers
            });
        });
    }
    /**
	* Get file metadata
	* @param id the file id to retrieve metadata
	*/ /**
	* Update file metadata
	* @param id the file id to update metadata
	* @param meta the new file metadata
	*/ /**
	* Lists all the files and folders within a path of the bucket.
	*
	* @category File Buckets
	* @param path The folder path.
	* @param options Search options including limit (defaults to 100), offset, sortBy, and search
	* @param parameters Optional fetch parameters including signal for cancellation
	* @returns Promise with response containing array of files or error
	*
	* @example List files in a bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .list('folder', {
	*     limit: 100,
	*     offset: 0,
	*     sortBy: { column: 'name', order: 'asc' },
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [
	*     {
	*       "name": "avatar1.png",
	*       "id": "e668cf7f-821b-4a2f-9dce-7dfa5dd1cfd2",
	*       "updated_at": "2024-05-22T23:06:05.580Z",
	*       "created_at": "2024-05-22T23:04:34.443Z",
	*       "last_accessed_at": "2024-05-22T23:04:34.443Z",
	*       "metadata": {
	*         "eTag": "\"c5e8c553235d9af30ef4f6e280790b92\"",
	*         "size": 32175,
	*         "mimetype": "image/png",
	*         "cacheControl": "max-age=3600",
	*         "lastModified": "2024-05-22T23:06:05.574Z",
	*         "contentLength": 32175,
	*         "httpStatusCode": 200
	*       }
	*     }
	*   ],
	*   "error": null
	* }
	* ```
	*
	* @example Search files in a bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .list('folder', {
	*     limit: 100,
	*     offset: 0,
	*     sortBy: { column: 'name', order: 'asc' },
	*     search: 'jon'
	*   })
	* ```
	*/ async list(path, options, parameters) {
        var _this13 = this;
        return _this13.handleOperation(async ()=>{
            const body = _objectSpread2(_objectSpread2(_objectSpread2({}, DEFAULT_SEARCH_OPTIONS), options), {}, {
                prefix: path || ""
            });
            return await post(_this13.fetch, `${_this13.url}/object/list/${_this13.bucketId}`, body, {
                headers: _this13.headers
            }, parameters);
        });
    }
    /**
	* @experimental this method signature might change in the future
	*
	* @category File Buckets
	* @param options search options
	* @param parameters
	*/ async listV2(options, parameters) {
        var _this14 = this;
        return _this14.handleOperation(async ()=>{
            const body = _objectSpread2({}, options);
            return await post(_this14.fetch, `${_this14.url}/object/list-v2/${_this14.bucketId}`, body, {
                headers: _this14.headers
            }, parameters);
        });
    }
    encodeMetadata(metadata) {
        return JSON.stringify(metadata);
    }
    toBase64(data) {
        if (typeof Buffer !== "undefined") return Buffer.from(data).toString("base64");
        return btoa(data);
    }
    _getFinalPath(path) {
        return `${this.bucketId}/${path.replace(/^\/+/, "")}`;
    }
    _removeEmptyFolders(path) {
        return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
    }
    transformOptsToQueryString(transform) {
        const params = [];
        if (transform.width) params.push(`width=${transform.width}`);
        if (transform.height) params.push(`height=${transform.height}`);
        if (transform.resize) params.push(`resize=${transform.resize}`);
        if (transform.format) params.push(`format=${transform.format}`);
        if (transform.quality) params.push(`quality=${transform.quality}`);
        return params.join("&");
    }
};
//#endregion
//#region src/lib/version.ts
const version = "2.95.3";
//#endregion
//#region src/lib/constants.ts
const DEFAULT_HEADERS = {
    "X-Client-Info": `storage-js/${version}`
};
//#endregion
//#region src/packages/StorageBucketApi.ts
var StorageBucketApi = class extends BaseApiClient {
    constructor(url, headers = {}, fetch$1, opts){
        const baseUrl = new URL(url);
        if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
            if (/supabase\.(co|in|red)$/.test(baseUrl.hostname) && !baseUrl.hostname.includes("storage.supabase.")) baseUrl.hostname = baseUrl.hostname.replace("supabase.", "storage.supabase.");
        }
        const finalUrl = baseUrl.href.replace(/\/$/, "");
        const finalHeaders = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS), headers);
        super(finalUrl, finalHeaders, fetch$1, "storage");
    }
    /**
	* Retrieves the details of all Storage buckets within an existing project.
	*
	* @category File Buckets
	* @param options Query parameters for listing buckets
	* @param options.limit Maximum number of buckets to return
	* @param options.offset Number of buckets to skip
	* @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
	* @param options.sortOrder Sort order ('asc' or 'desc')
	* @param options.search Search term to filter bucket names
	* @returns Promise with response containing array of buckets or error
	*
	* @example List buckets
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .listBuckets()
	* ```
	*
	* @example List buckets with options
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .listBuckets({
	*     limit: 10,
	*     offset: 0,
	*     sortColumn: 'created_at',
	*     sortOrder: 'desc',
	*     search: 'prod'
	*   })
	* ```
	*/ async listBuckets(options) {
        var _this = this;
        return _this.handleOperation(async ()=>{
            const queryString = _this.listBucketOptionsToQueryString(options);
            return await get(_this.fetch, `${_this.url}/bucket${queryString}`, {
                headers: _this.headers
            });
        });
    }
    /**
	* Retrieves the details of an existing Storage bucket.
	*
	* @category File Buckets
	* @param id The unique identifier of the bucket you would like to retrieve.
	* @returns Promise with response containing bucket details or error
	*
	* @example Get bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .getBucket('avatars')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "id": "avatars",
	*     "name": "avatars",
	*     "owner": "",
	*     "public": false,
	*     "file_size_limit": 1024,
	*     "allowed_mime_types": [
	*       "image/png"
	*     ],
	*     "created_at": "2024-05-22T22:26:05.100Z",
	*     "updated_at": "2024-05-22T22:26:05.100Z"
	*   },
	*   "error": null
	* }
	* ```
	*/ async getBucket(id) {
        var _this2 = this;
        return _this2.handleOperation(async ()=>{
            return await get(_this2.fetch, `${_this2.url}/bucket/${id}`, {
                headers: _this2.headers
            });
        });
    }
    /**
	* Creates a new Storage bucket
	*
	* @category File Buckets
	* @param id A unique identifier for the bucket you are creating.
	* @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
	* @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
	* The global file size limit takes precedence over this value.
	* The default value is null, which doesn't set a per bucket file size limit.
	* @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
	* The default value is null, which allows files with all mime types to be uploaded.
	* Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
	* @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
	*   - default bucket type is `STANDARD`
	* @returns Promise with response containing newly created bucket name or error
	*
	* @example Create bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .createBucket('avatars', {
	*     public: false,
	*     allowedMimeTypes: ['image/png'],
	*     fileSizeLimit: 1024
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "name": "avatars"
	*   },
	*   "error": null
	* }
	* ```
	*/ async createBucket(id, options = {
        public: false
    }) {
        var _this3 = this;
        return _this3.handleOperation(async ()=>{
            return await post(_this3.fetch, `${_this3.url}/bucket`, {
                id,
                name: id,
                type: options.type,
                public: options.public,
                file_size_limit: options.fileSizeLimit,
                allowed_mime_types: options.allowedMimeTypes
            }, {
                headers: _this3.headers
            });
        });
    }
    /**
	* Updates a Storage bucket
	*
	* @category File Buckets
	* @param id A unique identifier for the bucket you are updating.
	* @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
	* @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
	* The global file size limit takes precedence over this value.
	* The default value is null, which doesn't set a per bucket file size limit.
	* @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
	* The default value is null, which allows files with all mime types to be uploaded.
	* Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
	* @returns Promise with response containing success message or error
	*
	* @example Update bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .updateBucket('avatars', {
	*     public: false,
	*     allowedMimeTypes: ['image/png'],
	*     fileSizeLimit: 1024
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully updated"
	*   },
	*   "error": null
	* }
	* ```
	*/ async updateBucket(id, options) {
        var _this4 = this;
        return _this4.handleOperation(async ()=>{
            return await put(_this4.fetch, `${_this4.url}/bucket/${id}`, {
                id,
                name: id,
                public: options.public,
                file_size_limit: options.fileSizeLimit,
                allowed_mime_types: options.allowedMimeTypes
            }, {
                headers: _this4.headers
            });
        });
    }
    /**
	* Removes all objects inside a single bucket.
	*
	* @category File Buckets
	* @param id The unique identifier of the bucket you would like to empty.
	* @returns Promise with success message or error
	*
	* @example Empty bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .emptyBucket('avatars')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully emptied"
	*   },
	*   "error": null
	* }
	* ```
	*/ async emptyBucket(id) {
        var _this5 = this;
        return _this5.handleOperation(async ()=>{
            return await post(_this5.fetch, `${_this5.url}/bucket/${id}/empty`, {}, {
                headers: _this5.headers
            });
        });
    }
    /**
	* Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
	* You must first `empty()` the bucket.
	*
	* @category File Buckets
	* @param id The unique identifier of the bucket you would like to delete.
	* @returns Promise with success message or error
	*
	* @example Delete bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .deleteBucket('avatars')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully deleted"
	*   },
	*   "error": null
	* }
	* ```
	*/ async deleteBucket(id) {
        var _this6 = this;
        return _this6.handleOperation(async ()=>{
            return await remove(_this6.fetch, `${_this6.url}/bucket/${id}`, {}, {
                headers: _this6.headers
            });
        });
    }
    listBucketOptionsToQueryString(options) {
        const params = {};
        if (options) {
            if ("limit" in options) params.limit = String(options.limit);
            if ("offset" in options) params.offset = String(options.offset);
            if (options.search) params.search = options.search;
            if (options.sortColumn) params.sortColumn = options.sortColumn;
            if (options.sortOrder) params.sortOrder = options.sortOrder;
        }
        return Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : "";
    }
};
//#endregion
//#region src/packages/StorageAnalyticsClient.ts
/**
* Client class for managing Analytics Buckets using Iceberg tables
* Provides methods for creating, listing, and deleting analytics buckets
*/ var StorageAnalyticsClient = class extends BaseApiClient {
    /**
	* @alpha
	*
	* Creates a new StorageAnalyticsClient instance
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param url - The base URL for the storage API
	* @param headers - HTTP headers to include in requests
	* @param fetch - Optional custom fetch implementation
	*
	* @example
	* ```typescript
	* const client = new StorageAnalyticsClient(url, headers)
	* ```
	*/ constructor(url, headers = {}, fetch$1){
        const finalUrl = url.replace(/\/$/, "");
        const finalHeaders = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS), headers);
        super(finalUrl, finalHeaders, fetch$1, "storage");
    }
    /**
	* @alpha
	*
	* Creates a new analytics bucket using Iceberg tables
	* Analytics buckets are optimized for analytical queries and data processing
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param name A unique name for the bucket you are creating
	* @returns Promise with response containing newly created analytics bucket or error
	*
	* @example Create analytics bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .analytics
	*   .createBucket('analytics-data')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "name": "analytics-data",
	*     "type": "ANALYTICS",
	*     "format": "iceberg",
	*     "created_at": "2024-05-22T22:26:05.100Z",
	*     "updated_at": "2024-05-22T22:26:05.100Z"
	*   },
	*   "error": null
	* }
	* ```
	*/ async createBucket(name) {
        var _this = this;
        return _this.handleOperation(async ()=>{
            return await post(_this.fetch, `${_this.url}/bucket`, {
                name
            }, {
                headers: _this.headers
            });
        });
    }
    /**
	* @alpha
	*
	* Retrieves the details of all Analytics Storage buckets within an existing project
	* Only returns buckets of type 'ANALYTICS'
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param options Query parameters for listing buckets
	* @param options.limit Maximum number of buckets to return
	* @param options.offset Number of buckets to skip
	* @param options.sortColumn Column to sort by ('name', 'created_at', 'updated_at')
	* @param options.sortOrder Sort order ('asc' or 'desc')
	* @param options.search Search term to filter bucket names
	* @returns Promise with response containing array of analytics buckets or error
	*
	* @example List analytics buckets
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .analytics
	*   .listBuckets({
	*     limit: 10,
	*     offset: 0,
	*     sortColumn: 'created_at',
	*     sortOrder: 'desc'
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [
	*     {
	*       "name": "analytics-data",
	*       "type": "ANALYTICS",
	*       "format": "iceberg",
	*       "created_at": "2024-05-22T22:26:05.100Z",
	*       "updated_at": "2024-05-22T22:26:05.100Z"
	*     }
	*   ],
	*   "error": null
	* }
	* ```
	*/ async listBuckets(options) {
        var _this2 = this;
        return _this2.handleOperation(async ()=>{
            const queryParams = new URLSearchParams();
            if ((options === null || options === void 0 ? void 0 : options.limit) !== void 0) queryParams.set("limit", options.limit.toString());
            if ((options === null || options === void 0 ? void 0 : options.offset) !== void 0) queryParams.set("offset", options.offset.toString());
            if (options === null || options === void 0 ? void 0 : options.sortColumn) queryParams.set("sortColumn", options.sortColumn);
            if (options === null || options === void 0 ? void 0 : options.sortOrder) queryParams.set("sortOrder", options.sortOrder);
            if (options === null || options === void 0 ? void 0 : options.search) queryParams.set("search", options.search);
            const queryString = queryParams.toString();
            const url = queryString ? `${_this2.url}/bucket?${queryString}` : `${_this2.url}/bucket`;
            return await get(_this2.fetch, url, {
                headers: _this2.headers
            });
        });
    }
    /**
	* @alpha
	*
	* Deletes an existing analytics bucket
	* A bucket can't be deleted with existing objects inside it
	* You must first empty the bucket before deletion
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param bucketName The unique identifier of the bucket you would like to delete
	* @returns Promise with response containing success message or error
	*
	* @example Delete analytics bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .analytics
	*   .deleteBucket('analytics-data')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully deleted"
	*   },
	*   "error": null
	* }
	* ```
	*/ async deleteBucket(bucketName) {
        var _this3 = this;
        return _this3.handleOperation(async ()=>{
            return await remove(_this3.fetch, `${_this3.url}/bucket/${bucketName}`, {}, {
                headers: _this3.headers
            });
        });
    }
    /**
	* @alpha
	*
	* Get an Iceberg REST Catalog client configured for a specific analytics bucket
	* Use this to perform advanced table and namespace operations within the bucket
	* The returned client provides full access to the Apache Iceberg REST Catalog API
	* with the Supabase `{ data, error }` pattern for consistent error handling on all operations.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param bucketName - The name of the analytics bucket (warehouse) to connect to
	* @returns The wrapped Iceberg catalog client
	* @throws {StorageError} If the bucket name is invalid
	*
	* @example Get catalog and create table
	* ```js
	* // First, create an analytics bucket
	* const { data: bucket, error: bucketError } = await supabase
	*   .storage
	*   .analytics
	*   .createBucket('analytics-data')
	*
	* // Get the Iceberg catalog for that bucket
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // Create a namespace
	* const { error: nsError } = await catalog.createNamespace({ namespace: ['default'] })
	*
	* // Create a table with schema
	* const { data: tableMetadata, error: tableError } = await catalog.createTable(
	*   { namespace: ['default'] },
	*   {
	*     name: 'events',
	*     schema: {
	*       type: 'struct',
	*       fields: [
	*         { id: 1, name: 'id', type: 'long', required: true },
	*         { id: 2, name: 'timestamp', type: 'timestamp', required: true },
	*         { id: 3, name: 'user_id', type: 'string', required: false }
	*       ],
	*       'schema-id': 0,
	*       'identifier-field-ids': [1]
	*     },
	*     'partition-spec': {
	*       'spec-id': 0,
	*       fields: []
	*     },
	*     'write-order': {
	*       'order-id': 0,
	*       fields: []
	*     },
	*     properties: {
	*       'write.format.default': 'parquet'
	*     }
	*   }
	* )
	* ```
	*
	* @example List tables in namespace
	* ```js
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // List all tables in the default namespace
	* const { data: tables, error: listError } = await catalog.listTables({ namespace: ['default'] })
	* if (listError) {
	*   if (listError.isNotFound()) {
	*     console.log('Namespace not found')
	*   }
	*   return
	* }
	* console.log(tables) // [{ namespace: ['default'], name: 'events' }]
	* ```
	*
	* @example Working with namespaces
	* ```js
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // List all namespaces
	* const { data: namespaces } = await catalog.listNamespaces()
	*
	* // Create namespace with properties
	* await catalog.createNamespace(
	*   { namespace: ['production'] },
	*   { properties: { owner: 'data-team', env: 'prod' } }
	* )
	* ```
	*
	* @example Cleanup operations
	* ```js
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // Drop table with purge option (removes all data)
	* const { error: dropError } = await catalog.dropTable(
	*   { namespace: ['default'], name: 'events' },
	*   { purge: true }
	* )
	*
	* if (dropError?.isNotFound()) {
	*   console.log('Table does not exist')
	* }
	*
	* // Drop namespace (must be empty)
	* await catalog.dropNamespace({ namespace: ['default'] })
	* ```
	*
	* @remarks
	* This method provides a bridge between Supabase's bucket management and the standard
	* Apache Iceberg REST Catalog API. The bucket name maps to the Iceberg warehouse parameter.
	* All authentication and configuration is handled automatically using your Supabase credentials.
	*
	* **Error Handling**: Invalid bucket names throw immediately. All catalog
	* operations return `{ data, error }` where errors are `IcebergError` instances from iceberg-js.
	* Use helper methods like `error.isNotFound()` or check `error.status` for specific error handling.
	* Use `.throwOnError()` on the analytics client if you prefer exceptions for catalog operations.
	*
	* **Cleanup Operations**: When using `dropTable`, the `purge: true` option permanently
	* deletes all table data. Without it, the table is marked as deleted but data remains.
	*
	* **Library Dependency**: The returned catalog wraps `IcebergRestCatalog` from iceberg-js.
	* For complete API documentation and advanced usage, refer to the
	* [iceberg-js documentation](https://supabase.github.io/iceberg-js/).
	*/ from(bucketName) {
        var _this4 = this;
        if (!isValidBucketName(bucketName)) throw new StorageError("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
        const catalog = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$iceberg$2d$js$40$0$2e$8$2e$1$2f$node_modules$2f$iceberg$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IcebergRestCatalog"]({
            baseUrl: this.url,
            catalogName: bucketName,
            auth: {
                type: "custom",
                getHeaders: async ()=>_this4.headers
            },
            fetch: this.fetch
        });
        const shouldThrowOnError = this.shouldThrowOnError;
        return new Proxy(catalog, {
            get (target, prop) {
                const value = target[prop];
                if (typeof value !== "function") return value;
                return async (...args)=>{
                    try {
                        return {
                            data: await value.apply(target, args),
                            error: null
                        };
                    } catch (error) {
                        if (shouldThrowOnError) throw error;
                        return {
                            data: null,
                            error
                        };
                    }
                };
            }
        });
    }
};
//#endregion
//#region src/packages/VectorIndexApi.ts
/**
* @hidden
* Base implementation for vector index operations.
* Use {@link VectorBucketScope} via `supabase.storage.vectors.from('bucket')` instead.
*/ var VectorIndexApi = class extends BaseApiClient {
    /** Creates a new VectorIndexApi instance */ constructor(url, headers = {}, fetch$1){
        const finalUrl = url.replace(/\/$/, "");
        const finalHeaders = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS), {}, {
            "Content-Type": "application/json"
        }, headers);
        super(finalUrl, finalHeaders, fetch$1, "vectors");
    }
    /** Creates a new vector index within a bucket */ async createIndex(options) {
        var _this = this;
        return _this.handleOperation(async ()=>{
            return await vectorsApi.post(_this.fetch, `${_this.url}/CreateIndex`, options, {
                headers: _this.headers
            }) || {};
        });
    }
    /** Retrieves metadata for a specific vector index */ async getIndex(vectorBucketName, indexName) {
        var _this2 = this;
        return _this2.handleOperation(async ()=>{
            return await vectorsApi.post(_this2.fetch, `${_this2.url}/GetIndex`, {
                vectorBucketName,
                indexName
            }, {
                headers: _this2.headers
            });
        });
    }
    /** Lists vector indexes within a bucket with optional filtering and pagination */ async listIndexes(options) {
        var _this3 = this;
        return _this3.handleOperation(async ()=>{
            return await vectorsApi.post(_this3.fetch, `${_this3.url}/ListIndexes`, options, {
                headers: _this3.headers
            });
        });
    }
    /** Deletes a vector index and all its data */ async deleteIndex(vectorBucketName, indexName) {
        var _this4 = this;
        return _this4.handleOperation(async ()=>{
            return await vectorsApi.post(_this4.fetch, `${_this4.url}/DeleteIndex`, {
                vectorBucketName,
                indexName
            }, {
                headers: _this4.headers
            }) || {};
        });
    }
};
//#endregion
//#region src/packages/VectorDataApi.ts
/**
* @hidden
* Base implementation for vector data operations.
* Use {@link VectorIndexScope} via `supabase.storage.vectors.from('bucket').index('idx')` instead.
*/ var VectorDataApi = class extends BaseApiClient {
    /** Creates a new VectorDataApi instance */ constructor(url, headers = {}, fetch$1){
        const finalUrl = url.replace(/\/$/, "");
        const finalHeaders = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS), {}, {
            "Content-Type": "application/json"
        }, headers);
        super(finalUrl, finalHeaders, fetch$1, "vectors");
    }
    /** Inserts or updates vectors in batch (1-500 per request) */ async putVectors(options) {
        var _this = this;
        if (options.vectors.length < 1 || options.vectors.length > 500) throw new Error("Vector batch size must be between 1 and 500 items");
        return _this.handleOperation(async ()=>{
            return await vectorsApi.post(_this.fetch, `${_this.url}/PutVectors`, options, {
                headers: _this.headers
            }) || {};
        });
    }
    /** Retrieves vectors by their keys in batch */ async getVectors(options) {
        var _this2 = this;
        return _this2.handleOperation(async ()=>{
            return await vectorsApi.post(_this2.fetch, `${_this2.url}/GetVectors`, options, {
                headers: _this2.headers
            });
        });
    }
    /** Lists vectors in an index with pagination */ async listVectors(options) {
        var _this3 = this;
        if (options.segmentCount !== void 0) {
            if (options.segmentCount < 1 || options.segmentCount > 16) throw new Error("segmentCount must be between 1 and 16");
            if (options.segmentIndex !== void 0) {
                if (options.segmentIndex < 0 || options.segmentIndex >= options.segmentCount) throw new Error(`segmentIndex must be between 0 and ${options.segmentCount - 1}`);
            }
        }
        return _this3.handleOperation(async ()=>{
            return await vectorsApi.post(_this3.fetch, `${_this3.url}/ListVectors`, options, {
                headers: _this3.headers
            });
        });
    }
    /** Queries for similar vectors using approximate nearest neighbor search */ async queryVectors(options) {
        var _this4 = this;
        return _this4.handleOperation(async ()=>{
            return await vectorsApi.post(_this4.fetch, `${_this4.url}/QueryVectors`, options, {
                headers: _this4.headers
            });
        });
    }
    /** Deletes vectors by their keys in batch (1-500 per request) */ async deleteVectors(options) {
        var _this5 = this;
        if (options.keys.length < 1 || options.keys.length > 500) throw new Error("Keys batch size must be between 1 and 500 items");
        return _this5.handleOperation(async ()=>{
            return await vectorsApi.post(_this5.fetch, `${_this5.url}/DeleteVectors`, options, {
                headers: _this5.headers
            }) || {};
        });
    }
};
//#endregion
//#region src/packages/VectorBucketApi.ts
/**
* @hidden
* Base implementation for vector bucket operations.
* Use {@link StorageVectorsClient} via `supabase.storage.vectors` instead.
*/ var VectorBucketApi = class extends BaseApiClient {
    /** Creates a new VectorBucketApi instance */ constructor(url, headers = {}, fetch$1){
        const finalUrl = url.replace(/\/$/, "");
        const finalHeaders = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS), {}, {
            "Content-Type": "application/json"
        }, headers);
        super(finalUrl, finalHeaders, fetch$1, "vectors");
    }
    /** Creates a new vector bucket */ async createBucket(vectorBucketName) {
        var _this = this;
        return _this.handleOperation(async ()=>{
            return await vectorsApi.post(_this.fetch, `${_this.url}/CreateVectorBucket`, {
                vectorBucketName
            }, {
                headers: _this.headers
            }) || {};
        });
    }
    /** Retrieves metadata for a specific vector bucket */ async getBucket(vectorBucketName) {
        var _this2 = this;
        return _this2.handleOperation(async ()=>{
            return await vectorsApi.post(_this2.fetch, `${_this2.url}/GetVectorBucket`, {
                vectorBucketName
            }, {
                headers: _this2.headers
            });
        });
    }
    /** Lists vector buckets with optional filtering and pagination */ async listBuckets(options = {}) {
        var _this3 = this;
        return _this3.handleOperation(async ()=>{
            return await vectorsApi.post(_this3.fetch, `${_this3.url}/ListVectorBuckets`, options, {
                headers: _this3.headers
            });
        });
    }
    /** Deletes a vector bucket (must be empty first) */ async deleteBucket(vectorBucketName) {
        var _this4 = this;
        return _this4.handleOperation(async ()=>{
            return await vectorsApi.post(_this4.fetch, `${_this4.url}/DeleteVectorBucket`, {
                vectorBucketName
            }, {
                headers: _this4.headers
            }) || {};
        });
    }
};
//#endregion
//#region src/packages/StorageVectorsClient.ts
/**
*
* @alpha
*
* Main client for interacting with S3 Vectors API
* Provides access to bucket, index, and vector data operations
*
* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
*
* **Usage Patterns:**
*
* ```typescript
* const { data, error } = await supabase
*  .storage
*  .vectors
*  .createBucket('embeddings-prod')
*
* // Access index operations via buckets
* const bucket = supabase.storage.vectors.from('embeddings-prod')
* await bucket.createIndex({
*   indexName: 'documents',
*   dataType: 'float32',
*   dimension: 1536,
*   distanceMetric: 'cosine'
* })
*
* // Access vector operations via index
* const index = bucket.index('documents')
* await index.putVectors({
*   vectors: [
*     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
*   ]
* })
*
* // Query similar vectors
* const { data } = await index.queryVectors({
*   queryVector: { float32: [...] },
*   topK: 5,
*   returnDistance: true
* })
* ```
*/ var StorageVectorsClient = class extends VectorBucketApi {
    /**
	* @alpha
	*
	* Creates a StorageVectorsClient that can manage buckets, indexes, and vectors.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param url - Base URL of the Storage Vectors REST API.
	* @param options.headers - Optional headers (for example `Authorization`) applied to every request.
	* @param options.fetch - Optional custom `fetch` implementation for non-browser runtimes.
	*
	* @example
	* ```typescript
	* const client = new StorageVectorsClient(url, options)
	* ```
	*/ constructor(url, options = {}){
        super(url, options.headers || {}, options.fetch);
    }
    /**
	*
	* @alpha
	*
	* Access operations for a specific vector bucket
	* Returns a scoped client for index and vector operations within the bucket
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Name of the vector bucket
	* @returns Bucket-scoped client with index and vector operations
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* ```
	*/ from(vectorBucketName) {
        return new VectorBucketScope(this.url, this.headers, vectorBucketName, this.fetch);
    }
    /**
	*
	* @alpha
	*
	* Creates a new vector bucket
	* Vector buckets are containers for vector indexes and their data
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Unique name for the vector bucket
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .createBucket('embeddings-prod')
	* ```
	*/ async createBucket(vectorBucketName) {
        var _superprop_getCreateBucket = ()=>super.createBucket, _this = this;
        return _superprop_getCreateBucket().call(_this, vectorBucketName);
    }
    /**
	*
	* @alpha
	*
	* Retrieves metadata for a specific vector bucket
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Name of the vector bucket
	* @returns Promise with bucket metadata or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .getBucket('embeddings-prod')
	*
	* console.log('Bucket created:', data?.vectorBucket.creationTime)
	* ```
	*/ async getBucket(vectorBucketName) {
        var _superprop_getGetBucket = ()=>super.getBucket, _this2 = this;
        return _superprop_getGetBucket().call(_this2, vectorBucketName);
    }
    /**
	*
	* @alpha
	*
	* Lists all vector buckets with optional filtering and pagination
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Optional filters (prefix, maxResults, nextToken)
	* @returns Promise with list of buckets or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .listBuckets({ prefix: 'embeddings-' })
	*
	* data?.vectorBuckets.forEach(bucket => {
	*   console.log(bucket.vectorBucketName)
	* })
	* ```
	*/ async listBuckets(options = {}) {
        var _superprop_getListBuckets = ()=>super.listBuckets, _this3 = this;
        return _superprop_getListBuckets().call(_this3, options);
    }
    /**
	*
	* @alpha
	*
	* Deletes a vector bucket (bucket must be empty)
	* All indexes must be deleted before deleting the bucket
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Name of the vector bucket to delete
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .deleteBucket('embeddings-old')
	* ```
	*/ async deleteBucket(vectorBucketName) {
        var _superprop_getDeleteBucket = ()=>super.deleteBucket, _this4 = this;
        return _superprop_getDeleteBucket().call(_this4, vectorBucketName);
    }
};
/**
*
* @alpha
*
* Scoped client for operations within a specific vector bucket
* Provides index management and access to vector operations
*
* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
*/ var VectorBucketScope = class extends VectorIndexApi {
    /**
	* @alpha
	*
	* Creates a helper that automatically scopes all index operations to the provided bucket.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* ```
	*/ constructor(url, headers, vectorBucketName, fetch$1){
        super(url, headers, fetch$1);
        this.vectorBucketName = vectorBucketName;
    }
    /**
	*
	* @alpha
	*
	* Creates a new vector index in this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Index configuration (vectorBucketName is automatically set)
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* await bucket.createIndex({
	*   indexName: 'documents-openai',
	*   dataType: 'float32',
	*   dimension: 1536,
	*   distanceMetric: 'cosine',
	*   metadataConfiguration: {
	*     nonFilterableMetadataKeys: ['raw_text']
	*   }
	* })
	* ```
	*/ async createIndex(options) {
        var _superprop_getCreateIndex = ()=>super.createIndex, _this5 = this;
        return _superprop_getCreateIndex().call(_this5, _objectSpread2(_objectSpread2({}, options), {}, {
            vectorBucketName: _this5.vectorBucketName
        }));
    }
    /**
	*
	* @alpha
	*
	* Lists indexes in this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Listing options (vectorBucketName is automatically set)
	* @returns Promise with response containing indexes array and pagination token or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* const { data } = await bucket.listIndexes({ prefix: 'documents-' })
	* ```
	*/ async listIndexes(options = {}) {
        var _superprop_getListIndexes = ()=>super.listIndexes, _this6 = this;
        return _superprop_getListIndexes().call(_this6, _objectSpread2(_objectSpread2({}, options), {}, {
            vectorBucketName: _this6.vectorBucketName
        }));
    }
    /**
	*
	* @alpha
	*
	* Retrieves metadata for a specific index in this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param indexName - Name of the index to retrieve
	* @returns Promise with index metadata or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* const { data } = await bucket.getIndex('documents-openai')
	* console.log('Dimension:', data?.index.dimension)
	* ```
	*/ async getIndex(indexName) {
        var _superprop_getGetIndex = ()=>super.getIndex, _this7 = this;
        return _superprop_getGetIndex().call(_this7, _this7.vectorBucketName, indexName);
    }
    /**
	*
	* @alpha
	*
	* Deletes an index from this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param indexName - Name of the index to delete
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* await bucket.deleteIndex('old-index')
	* ```
	*/ async deleteIndex(indexName) {
        var _superprop_getDeleteIndex = ()=>super.deleteIndex, _this8 = this;
        return _superprop_getDeleteIndex().call(_this8, _this8.vectorBucketName, indexName);
    }
    /**
	*
	* @alpha
	*
	* Access operations for a specific index within this bucket
	* Returns a scoped client for vector data operations
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param indexName - Name of the index
	* @returns Index-scoped client with vector data operations
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	*
	* // Insert vectors
	* await index.putVectors({
	*   vectors: [
	*     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
	*   ]
	* })
	*
	* // Query similar vectors
	* const { data } = await index.queryVectors({
	*   queryVector: { float32: [...] },
	*   topK: 5
	* })
	* ```
	*/ index(indexName) {
        return new VectorIndexScope(this.url, this.headers, this.vectorBucketName, indexName, this.fetch);
    }
};
/**
*
* @alpha
*
* Scoped client for operations within a specific vector index
* Provides vector data operations (put, get, list, query, delete)
*
* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
*/ var VectorIndexScope = class extends VectorDataApi {
    /**
	*
	* @alpha
	*
	* Creates a helper that automatically scopes all vector operations to the provided bucket/index names.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* ```
	*/ constructor(url, headers, vectorBucketName, indexName, fetch$1){
        super(url, headers, fetch$1);
        this.vectorBucketName = vectorBucketName;
        this.indexName = indexName;
    }
    /**
	*
	* @alpha
	*
	* Inserts or updates vectors in this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Vector insertion options (bucket and index names automatically set)
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* await index.putVectors({
	*   vectors: [
	*     {
	*       key: 'doc-1',
	*       data: { float32: [0.1, 0.2, ...] },
	*       metadata: { title: 'Introduction', page: 1 }
	*     }
	*   ]
	* })
	* ```
	*/ async putVectors(options) {
        var _superprop_getPutVectors = ()=>super.putVectors, _this9 = this;
        return _superprop_getPutVectors().call(_this9, _objectSpread2(_objectSpread2({}, options), {}, {
            vectorBucketName: _this9.vectorBucketName,
            indexName: _this9.indexName
        }));
    }
    /**
	*
	* @alpha
	*
	* Retrieves vectors by keys from this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Vector retrieval options (bucket and index names automatically set)
	* @returns Promise with response containing vectors array or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* const { data } = await index.getVectors({
	*   keys: ['doc-1', 'doc-2'],
	*   returnMetadata: true
	* })
	* ```
	*/ async getVectors(options) {
        var _superprop_getGetVectors = ()=>super.getVectors, _this10 = this;
        return _superprop_getGetVectors().call(_this10, _objectSpread2(_objectSpread2({}, options), {}, {
            vectorBucketName: _this10.vectorBucketName,
            indexName: _this10.indexName
        }));
    }
    /**
	*
	* @alpha
	*
	* Lists vectors in this index with pagination
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Listing options (bucket and index names automatically set)
	* @returns Promise with response containing vectors array and pagination token or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* const { data } = await index.listVectors({
	*   maxResults: 500,
	*   returnMetadata: true
	* })
	* ```
	*/ async listVectors(options = {}) {
        var _superprop_getListVectors = ()=>super.listVectors, _this11 = this;
        return _superprop_getListVectors().call(_this11, _objectSpread2(_objectSpread2({}, options), {}, {
            vectorBucketName: _this11.vectorBucketName,
            indexName: _this11.indexName
        }));
    }
    /**
	*
	* @alpha
	*
	* Queries for similar vectors in this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Query options (bucket and index names automatically set)
	* @returns Promise with response containing matches array of similar vectors ordered by distance or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* const { data } = await index.queryVectors({
	*   queryVector: { float32: [0.1, 0.2, ...] },
	*   topK: 5,
	*   filter: { category: 'technical' },
	*   returnDistance: true,
	*   returnMetadata: true
	* })
	* ```
	*/ async queryVectors(options) {
        var _superprop_getQueryVectors = ()=>super.queryVectors, _this12 = this;
        return _superprop_getQueryVectors().call(_this12, _objectSpread2(_objectSpread2({}, options), {}, {
            vectorBucketName: _this12.vectorBucketName,
            indexName: _this12.indexName
        }));
    }
    /**
	*
	* @alpha
	*
	* Deletes vectors by keys from this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Deletion options (bucket and index names automatically set)
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* await index.deleteVectors({
	*   keys: ['doc-1', 'doc-2', 'doc-3']
	* })
	* ```
	*/ async deleteVectors(options) {
        var _superprop_getDeleteVectors = ()=>super.deleteVectors, _this13 = this;
        return _superprop_getDeleteVectors().call(_this13, _objectSpread2(_objectSpread2({}, options), {}, {
            vectorBucketName: _this13.vectorBucketName,
            indexName: _this13.indexName
        }));
    }
};
//#endregion
//#region src/StorageClient.ts
var StorageClient = class extends StorageBucketApi {
    /**
	* Creates a client for Storage buckets, files, analytics, and vectors.
	*
	* @category File Buckets
	* @example
	* ```ts
	* import { StorageClient } from '@supabase/storage-js'
	*
	* const storage = new StorageClient('https://xyzcompany.supabase.co/storage/v1', {
	*   apikey: 'public-anon-key',
	* })
	* const avatars = storage.from('avatars')
	* ```
	*/ constructor(url, headers = {}, fetch$1, opts){
        super(url, headers, fetch$1, opts);
    }
    /**
	* Perform file operation in a bucket.
	*
	* @category File Buckets
	* @param id The bucket id to operate on.
	*
	* @example
	* ```typescript
	* const avatars = supabase.storage.from('avatars')
	* ```
	*/ from(id) {
        return new StorageFileApi(this.url, this.headers, id, this.fetch);
    }
    /**
	*
	* @alpha
	*
	* Access vector storage operations.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @returns A StorageVectorsClient instance configured with the current storage settings.
	*/ get vectors() {
        return new StorageVectorsClient(this.url + "/vector", {
            headers: this.headers,
            fetch: this.fetch
        });
    }
    /**
	*
	* @alpha
	*
	* Access analytics storage operations using Iceberg tables.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @returns A StorageAnalyticsClient instance configured with the current storage settings.
	*/ get analytics() {
        return new StorageAnalyticsClient(this.url + "/iceberg", this.headers, this.fetch);
    }
};
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/node_modules/.pnpm/@supabase+supabase-js@2.95.3/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SupabaseClient",
    ()=>SupabaseClient,
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+functions-js@2.95.3/node_modules/@supabase/functions-js/dist/module/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$FunctionsClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+functions-js@2.95.3/node_modules/@supabase/functions-js/dist/module/FunctionsClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$postgrest$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$postgrest$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+postgrest-js@2.95.3/node_modules/@supabase/postgrest-js/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimeClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__RealtimeClient$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+realtime-js@2.95.3/node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js [app-route] (ecmascript) <export default as RealtimeClient>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$storage$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$storage$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+storage-js@2.95.3/node_modules/@supabase/storage-js/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$auth$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$auth$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+auth-js@2.95.3/node_modules/@supabase/auth-js/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$auth$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$auth$2d$js$2f$dist$2f$module$2f$AuthClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__AuthClient$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+auth-js@2.95.3/node_modules/@supabase/auth-js/dist/module/AuthClient.js [app-route] (ecmascript) <export default as AuthClient>");
;
;
;
;
;
;
;
//#region src/lib/version.ts
const version = "2.95.3";
//#endregion
//#region src/lib/constants.ts
let JS_ENV = "";
if (typeof Deno !== "undefined") JS_ENV = "deno";
else if (typeof document !== "undefined") JS_ENV = "web";
else if (typeof navigator !== "undefined" && navigator.product === "ReactNative") JS_ENV = "react-native";
else JS_ENV = "node";
const DEFAULT_HEADERS = {
    "X-Client-Info": `supabase-js-${JS_ENV}/${version}`
};
const DEFAULT_GLOBAL_OPTIONS = {
    headers: DEFAULT_HEADERS
};
const DEFAULT_DB_OPTIONS = {
    schema: "public"
};
const DEFAULT_AUTH_OPTIONS = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "implicit"
};
const DEFAULT_REALTIME_OPTIONS = {};
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/typeof.js
function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
        return typeof o$1;
    } : function(o$1) {
        return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, _typeof(o);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPrimitive.js
function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPropertyKey.js
function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/defineProperty.js
function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/objectSpread2.js
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r$1) {
            return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread2(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r$1) {
            _defineProperty(e, r$1, t[r$1]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r$1) {
            Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
        });
    }
    return e;
}
//#endregion
//#region src/lib/fetch.ts
const resolveFetch = (customFetch)=>{
    if (customFetch) return (...args)=>customFetch(...args);
    return (...args)=>fetch(...args);
};
const resolveHeadersConstructor = ()=>{
    return Headers;
};
const fetchWithAuth = (supabaseKey, getAccessToken, customFetch)=>{
    const fetch$1 = resolveFetch(customFetch);
    const HeadersConstructor = resolveHeadersConstructor();
    return async (input, init)=>{
        var _await$getAccessToken;
        const accessToken = (_await$getAccessToken = await getAccessToken()) !== null && _await$getAccessToken !== void 0 ? _await$getAccessToken : supabaseKey;
        let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
        if (!headers.has("apikey")) headers.set("apikey", supabaseKey);
        if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);
        return fetch$1(input, _objectSpread2(_objectSpread2({}, init), {}, {
            headers
        }));
    };
};
//#endregion
//#region src/lib/helpers.ts
function ensureTrailingSlash(url) {
    return url.endsWith("/") ? url : url + "/";
}
function applySettingDefaults(options, defaults) {
    var _DEFAULT_GLOBAL_OPTIO, _globalOptions$header;
    const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
    const { db: DEFAULT_DB_OPTIONS$1, auth: DEFAULT_AUTH_OPTIONS$1, realtime: DEFAULT_REALTIME_OPTIONS$1, global: DEFAULT_GLOBAL_OPTIONS$1 } = defaults;
    const result = {
        db: _objectSpread2(_objectSpread2({}, DEFAULT_DB_OPTIONS$1), dbOptions),
        auth: _objectSpread2(_objectSpread2({}, DEFAULT_AUTH_OPTIONS$1), authOptions),
        realtime: _objectSpread2(_objectSpread2({}, DEFAULT_REALTIME_OPTIONS$1), realtimeOptions),
        storage: {},
        global: _objectSpread2(_objectSpread2(_objectSpread2({}, DEFAULT_GLOBAL_OPTIONS$1), globalOptions), {}, {
            headers: _objectSpread2(_objectSpread2({}, (_DEFAULT_GLOBAL_OPTIO = DEFAULT_GLOBAL_OPTIONS$1 === null || DEFAULT_GLOBAL_OPTIONS$1 === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS$1.headers) !== null && _DEFAULT_GLOBAL_OPTIO !== void 0 ? _DEFAULT_GLOBAL_OPTIO : {}), (_globalOptions$header = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _globalOptions$header !== void 0 ? _globalOptions$header : {})
        }),
        accessToken: async ()=>""
    };
    if (options.accessToken) result.accessToken = options.accessToken;
    else delete result.accessToken;
    return result;
}
/**
* Validates a Supabase client URL
*
* @param {string} supabaseUrl - The Supabase client URL string.
* @returns {URL} - The validated base URL.
* @throws {Error}
*/ function validateSupabaseUrl(supabaseUrl) {
    const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim();
    if (!trimmedUrl) throw new Error("supabaseUrl is required.");
    if (!trimmedUrl.match(/^https?:\/\//i)) throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
    try {
        return new URL(ensureTrailingSlash(trimmedUrl));
    } catch (_unused) {
        throw Error("Invalid supabaseUrl: Provided URL is malformed.");
    }
}
//#endregion
//#region src/lib/SupabaseAuthClient.ts
var SupabaseAuthClient = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$auth$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$auth$2d$js$2f$dist$2f$module$2f$AuthClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__AuthClient$3e$__["AuthClient"] {
    constructor(options){
        super(options);
    }
};
//#endregion
//#region src/SupabaseClient.ts
/**
* Supabase Client.
*
* An isomorphic Javascript client for interacting with Postgres.
*/ var SupabaseClient = class {
    /**
	* Create a new client for use in the browser.
	* @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
	* @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
	* @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
	* @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
	* @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
	* @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
	* @param options.realtime Options passed along to realtime-js constructor.
	* @param options.storage Options passed along to the storage-js constructor.
	* @param options.global.fetch A custom fetch implementation.
	* @param options.global.headers Any additional headers to send with each network request.
	* @example
	* ```ts
	* import { createClient } from '@supabase/supabase-js'
	*
	* const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
	* const { data } = await supabase.from('profiles').select('*')
	* ```
	*/ constructor(supabaseUrl, supabaseKey, options){
        var _settings$auth$storag, _settings$global$head;
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        const baseUrl = validateSupabaseUrl(supabaseUrl);
        if (!supabaseKey) throw new Error("supabaseKey is required.");
        this.realtimeUrl = new URL("realtime/v1", baseUrl);
        this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws");
        this.authUrl = new URL("auth/v1", baseUrl);
        this.storageUrl = new URL("storage/v1", baseUrl);
        this.functionsUrl = new URL("functions/v1", baseUrl);
        const defaultStorageKey = `sb-${baseUrl.hostname.split(".")[0]}-auth-token`;
        const DEFAULTS = {
            db: DEFAULT_DB_OPTIONS,
            realtime: DEFAULT_REALTIME_OPTIONS,
            auth: _objectSpread2(_objectSpread2({}, DEFAULT_AUTH_OPTIONS), {}, {
                storageKey: defaultStorageKey
            }),
            global: DEFAULT_GLOBAL_OPTIONS
        };
        const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
        this.storageKey = (_settings$auth$storag = settings.auth.storageKey) !== null && _settings$auth$storag !== void 0 ? _settings$auth$storag : "";
        this.headers = (_settings$global$head = settings.global.headers) !== null && _settings$global$head !== void 0 ? _settings$global$head : {};
        if (!settings.accessToken) {
            var _settings$auth;
            this.auth = this._initSupabaseAuthClient((_settings$auth = settings.auth) !== null && _settings$auth !== void 0 ? _settings$auth : {}, this.headers, settings.global.fetch);
        } else {
            this.accessToken = settings.accessToken;
            this.auth = new Proxy({}, {
                get: (_, prop)=>{
                    throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
                }
            });
        }
        this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
        this.realtime = this._initRealtimeClient(_objectSpread2({
            headers: this.headers,
            accessToken: this._getAccessToken.bind(this)
        }, settings.realtime));
        if (this.accessToken) Promise.resolve(this.accessToken()).then((token)=>this.realtime.setAuth(token)).catch((e)=>console.warn("Failed to set initial Realtime auth token:", e));
        this.rest = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$postgrest$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$postgrest$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PostgrestClient"](new URL("rest/v1", baseUrl).href, {
            headers: this.headers,
            schema: settings.db.schema,
            fetch: this.fetch,
            timeout: settings.db.timeout,
            urlLengthLimit: settings.db.urlLengthLimit
        });
        this.storage = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$storage$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$storage$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StorageClient"](this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
        if (!settings.accessToken) this._listenForAuthEvents();
    }
    /**
	* Supabase Functions allows you to deploy and invoke edge functions.
	*/ get functions() {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$functions$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$functions$2d$js$2f$dist$2f$module$2f$FunctionsClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FunctionsClient"](this.functionsUrl.href, {
            headers: this.headers,
            customFetch: this.fetch
        });
    }
    /**
	* Perform a query on a table or a view.
	*
	* @param relation - The table or view name to query
	*/ from(relation) {
        return this.rest.from(relation);
    }
    /**
	* Select a schema to query or perform an function (rpc) call.
	*
	* The schema needs to be on the list of exposed schemas inside Supabase.
	*
	* @param schema - The schema to query
	*/ schema(schema) {
        return this.rest.schema(schema);
    }
    /**
	* Perform a function call.
	*
	* @param fn - The function name to call
	* @param args - The arguments to pass to the function call
	* @param options - Named parameters
	* @param options.head - When set to `true`, `data` will not be returned.
	* Useful if you only need the count.
	* @param options.get - When set to `true`, the function will be called with
	* read-only access mode.
	* @param options.count - Count algorithm to use to count rows returned by the
	* function. Only applicable for [set-returning
	* functions](https://www.postgresql.org/docs/current/functions-srf.html).
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/ rpc(fn, args = {}, options = {
        head: false,
        get: false,
        count: void 0
    }) {
        return this.rest.rpc(fn, args, options);
    }
    /**
	* Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
	*
	* @param {string} name - The name of the Realtime channel.
	* @param {Object} opts - The options to pass to the Realtime channel.
	*
	*/ channel(name, opts = {
        config: {}
    }) {
        return this.realtime.channel(name, opts);
    }
    /**
	* Returns all Realtime channels.
	*/ getChannels() {
        return this.realtime.getChannels();
    }
    /**
	* Unsubscribes and removes Realtime channel from Realtime client.
	*
	* @param {RealtimeChannel} channel - The name of the Realtime channel.
	*
	*/ removeChannel(channel) {
        return this.realtime.removeChannel(channel);
    }
    /**
	* Unsubscribes and removes all Realtime channels from Realtime client.
	*/ removeAllChannels() {
        return this.realtime.removeAllChannels();
    }
    async _getAccessToken() {
        var _this = this;
        var _data$session$access_, _data$session;
        if (_this.accessToken) return await _this.accessToken();
        const { data } = await _this.auth.getSession();
        return (_data$session$access_ = (_data$session = data.session) === null || _data$session === void 0 ? void 0 : _data$session.access_token) !== null && _data$session$access_ !== void 0 ? _data$session$access_ : _this.supabaseKey;
    }
    _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, userStorage, storageKey, flowType, lock, debug, throwOnError }, headers, fetch$1) {
        const authHeaders = {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: `${this.supabaseKey}`
        };
        return new SupabaseAuthClient({
            url: this.authUrl.href,
            headers: _objectSpread2(_objectSpread2({}, authHeaders), headers),
            storageKey,
            autoRefreshToken,
            persistSession,
            detectSessionInUrl,
            storage,
            userStorage,
            flowType,
            lock,
            debug,
            throwOnError,
            fetch: fetch$1,
            hasCustomAuthorizationHeader: Object.keys(this.headers).some((key)=>key.toLowerCase() === "authorization")
        });
    }
    _initRealtimeClient(options) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$realtime$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$realtime$2d$js$2f$dist$2f$module$2f$RealtimeClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__RealtimeClient$3e$__["RealtimeClient"](this.realtimeUrl.href, _objectSpread2(_objectSpread2({}, options), {}, {
            params: _objectSpread2(_objectSpread2({}, {
                apikey: this.supabaseKey
            }), options === null || options === void 0 ? void 0 : options.params)
        }));
    }
    _listenForAuthEvents() {
        return this.auth.onAuthStateChange((event, session)=>{
            this._handleTokenChanged(event, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
        });
    }
    _handleTokenChanged(event, source, token) {
        if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && this.changedAccessToken !== token) {
            this.changedAccessToken = token;
            this.realtime.setAuth(token);
        } else if (event === "SIGNED_OUT") {
            this.realtime.setAuth();
            if (source == "STORAGE") this.auth.signOut();
            this.changedAccessToken = void 0;
        }
    }
};
//#endregion
//#region src/index.ts
/**
* Creates a new Supabase Client.
*
* @example
* ```ts
* import { createClient } from '@supabase/supabase-js'
*
* const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
* const { data, error } = await supabase.from('profiles').select('*')
* ```
*/ const createClient = (supabaseUrl, supabaseKey, options)=>{
    return new SupabaseClient(supabaseUrl, supabaseKey, options);
};
function shouldShowDeprecationWarning() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const _process = globalThis["process"];
    if (!_process) return false;
    const processVersion = _process["version"];
    if (processVersion === void 0 || processVersion === null) return false;
    const versionMatch = processVersion.match(/^v(\d+)\./);
    if (!versionMatch) return false;
    return parseInt(versionMatch[1], 10) <= 18;
}
if (shouldShowDeprecationWarning()) console.warn("⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/version.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VERSION",
    ()=>VERSION
]);
const VERSION = '0.8.0'; //# sourceMappingURL=version.js.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/helpers.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isBrowser",
    ()=>isBrowser,
    "memoryLocalStorageAdapter",
    ()=>memoryLocalStorageAdapter,
    "parse",
    ()=>parse,
    "parseCookieHeader",
    ()=>parseCookieHeader,
    "serialize",
    ()=>serialize,
    "serializeCookieHeader",
    ()=>serializeCookieHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cookie$40$1$2e$1$2e$1$2f$node_modules$2f$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cookie@1.1.1/node_modules/cookie/dist/index.js [app-route] (ecmascript)");
;
const parse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cookie$40$1$2e$1$2e$1$2f$node_modules$2f$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"];
const serialize = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cookie$40$1$2e$1$2e$1$2f$node_modules$2f$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serialize"];
function parseCookieHeader(header) {
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cookie$40$1$2e$1$2e$1$2f$node_modules$2f$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"](header);
    return Object.keys(parsed ?? {}).map((name)=>({
            name,
            value: parsed[name]
        }));
}
function serializeCookieHeader(name, value, options) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cookie$40$1$2e$1$2e$1$2f$node_modules$2f$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serialize"](name, value, options);
}
function isBrowser() {
    return ("TURBOPACK compile-time value", "undefined") !== "undefined" && typeof window.document !== "undefined";
}
function memoryLocalStorageAdapter(store = {}) {
    return {
        getItem: (key)=>{
            return store[key] || null;
        },
        setItem: (key, value)=>{
            store[key] = value;
        },
        removeItem: (key)=>{
            delete store[key];
        }
    };
} //# sourceMappingURL=helpers.js.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/constants.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_COOKIE_OPTIONS",
    ()=>DEFAULT_COOKIE_OPTIONS
]);
const DEFAULT_COOKIE_OPTIONS = {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    // https://developer.chrome.com/blog/cookie-max-age-expires
    // https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html#name-cookie-lifetime-limits
    maxAge: 400 * 24 * 60 * 60
}; //# sourceMappingURL=constants.js.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/chunker.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_CHUNK_SIZE",
    ()=>MAX_CHUNK_SIZE,
    "combineChunks",
    ()=>combineChunks,
    "createChunks",
    ()=>createChunks,
    "deleteChunks",
    ()=>deleteChunks,
    "isChunkLike",
    ()=>isChunkLike
]);
const MAX_CHUNK_SIZE = 3180;
const CHUNK_LIKE_REGEX = /^(.*)[.](0|[1-9][0-9]*)$/;
function isChunkLike(cookieName, key) {
    if (cookieName === key) {
        return true;
    }
    const chunkLike = cookieName.match(CHUNK_LIKE_REGEX);
    if (chunkLike && chunkLike[1] === key) {
        return true;
    }
    return false;
}
function createChunks(key, value, chunkSize) {
    const resolvedChunkSize = chunkSize ?? MAX_CHUNK_SIZE;
    let encodedValue = encodeURIComponent(value);
    if (encodedValue.length <= resolvedChunkSize) {
        return [
            {
                name: key,
                value
            }
        ];
    }
    const chunks = [];
    while(encodedValue.length > 0){
        let encodedChunkHead = encodedValue.slice(0, resolvedChunkSize);
        const lastEscapePos = encodedChunkHead.lastIndexOf("%");
        // Check if the last escaped character is truncated.
        if (lastEscapePos > resolvedChunkSize - 3) {
            // If so, reslice the string to exclude the whole escape sequence.
            // We only reduce the size of the string as the chunk must
            // be smaller than the chunk size.
            encodedChunkHead = encodedChunkHead.slice(0, lastEscapePos);
        }
        let valueHead = "";
        // Check if the chunk was split along a valid unicode boundary.
        while(encodedChunkHead.length > 0){
            try {
                // Try to decode the chunk back and see if it is valid.
                // Stop when the chunk is valid.
                valueHead = decodeURIComponent(encodedChunkHead);
                break;
            } catch (error) {
                if (error instanceof URIError && encodedChunkHead.at(-3) === "%" && encodedChunkHead.length > 3) {
                    encodedChunkHead = encodedChunkHead.slice(0, encodedChunkHead.length - 3);
                } else {
                    throw error;
                }
            }
        }
        chunks.push(valueHead);
        encodedValue = encodedValue.slice(encodedChunkHead.length);
    }
    return chunks.map((value, i)=>({
            name: `${key}.${i}`,
            value
        }));
}
async function combineChunks(key, retrieveChunk) {
    const value = await retrieveChunk(key);
    if (value) {
        return value;
    }
    let values = [];
    for(let i = 0;; i++){
        const chunkName = `${key}.${i}`;
        const chunk = await retrieveChunk(chunkName);
        if (!chunk) {
            break;
        }
        values.push(chunk);
    }
    if (values.length > 0) {
        return values.join("");
    }
    return null;
}
async function deleteChunks(key, retrieveChunk, removeChunk) {
    const value = await retrieveChunk(key);
    if (value) {
        await removeChunk(key);
    }
    for(let i = 0;; i++){
        const chunkName = `${key}.${i}`;
        const chunk = await retrieveChunk(chunkName);
        if (!chunk) {
            break;
        }
        await removeChunk(chunkName);
    }
} //# sourceMappingURL=chunker.js.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/base64url.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "codepointToUTF8",
    ()=>codepointToUTF8,
    "stringFromBase64URL",
    ()=>stringFromBase64URL,
    "stringFromUTF8",
    ()=>stringFromUTF8,
    "stringToBase64URL",
    ()=>stringToBase64URL,
    "stringToUTF8",
    ()=>stringToUTF8
]);
/**
 * Avoid modifying this file. It's part of
 * https://github.com/supabase-community/base64url-js.  Submit all fixes on
 * that repo!
 */ /**
 * An array of characters that encode 6 bits into a Base64-URL alphabet
 * character.
 */ const TO_BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");
/**
 * An array of characters that can appear in a Base64-URL encoded string but
 * should be ignored.
 */ const IGNORE_BASE64URL = " \t\n\r=".split("");
/**
 * An array of 128 numbers that map a Base64-URL character to 6 bits, or if -2
 * used to skip the character, or if -1 used to error out.
 */ const FROM_BASE64URL = (()=>{
    const charMap = new Array(128);
    for(let i = 0; i < charMap.length; i += 1){
        charMap[i] = -1;
    }
    for(let i = 0; i < IGNORE_BASE64URL.length; i += 1){
        charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
    }
    for(let i = 0; i < TO_BASE64URL.length; i += 1){
        charMap[TO_BASE64URL[i].charCodeAt(0)] = i;
    }
    return charMap;
})();
function stringToBase64URL(str) {
    const base64 = [];
    let queue = 0;
    let queuedBits = 0;
    const emitter = (byte)=>{
        queue = queue << 8 | byte;
        queuedBits += 8;
        while(queuedBits >= 6){
            const pos = queue >> queuedBits - 6 & 63;
            base64.push(TO_BASE64URL[pos]);
            queuedBits -= 6;
        }
    };
    stringToUTF8(str, emitter);
    if (queuedBits > 0) {
        queue = queue << 6 - queuedBits;
        queuedBits = 6;
        while(queuedBits >= 6){
            const pos = queue >> queuedBits - 6 & 63;
            base64.push(TO_BASE64URL[pos]);
            queuedBits -= 6;
        }
    }
    return base64.join("");
}
function stringFromBase64URL(str) {
    const conv = [];
    const emit = (codepoint)=>{
        conv.push(String.fromCodePoint(codepoint));
    };
    const state = {
        utf8seq: 0,
        codepoint: 0
    };
    let queue = 0;
    let queuedBits = 0;
    for(let i = 0; i < str.length; i += 1){
        const codepoint = str.charCodeAt(i);
        const bits = FROM_BASE64URL[codepoint];
        if (bits > -1) {
            // valid Base64-URL character
            queue = queue << 6 | bits;
            queuedBits += 6;
            while(queuedBits >= 8){
                stringFromUTF8(queue >> queuedBits - 8 & 0xff, state, emit);
                queuedBits -= 8;
            }
        } else if (bits === -2) {
            continue;
        } else {
            throw new Error(`Invalid Base64-URL character "${str.at(i)}" at position ${i}`);
        }
    }
    return conv.join("");
}
function codepointToUTF8(codepoint, emit) {
    if (codepoint <= 0x7f) {
        emit(codepoint);
        return;
    } else if (codepoint <= 0x7ff) {
        emit(0xc0 | codepoint >> 6);
        emit(0x80 | codepoint & 0x3f);
        return;
    } else if (codepoint <= 0xffff) {
        emit(0xe0 | codepoint >> 12);
        emit(0x80 | codepoint >> 6 & 0x3f);
        emit(0x80 | codepoint & 0x3f);
        return;
    } else if (codepoint <= 0x10ffff) {
        emit(0xf0 | codepoint >> 18);
        emit(0x80 | codepoint >> 12 & 0x3f);
        emit(0x80 | codepoint >> 6 & 0x3f);
        emit(0x80 | codepoint & 0x3f);
        return;
    }
    throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
}
function stringToUTF8(str, emit) {
    for(let i = 0; i < str.length; i += 1){
        let codepoint = str.charCodeAt(i);
        if (codepoint > 0xd7ff && codepoint <= 0xdbff) {
            // most UTF-16 codepoints are Unicode codepoints, except values in this
            // range where the next UTF-16 codepoint needs to be combined with the
            // current one to get the Unicode codepoint
            const highSurrogate = (codepoint - 0xd800) * 0x400 & 0xffff;
            const lowSurrogate = str.charCodeAt(i + 1) - 0xdc00 & 0xffff;
            codepoint = (lowSurrogate | highSurrogate) + 0x10000;
            i += 1;
        }
        codepointToUTF8(codepoint, emit);
    }
}
function stringFromUTF8(byte, state, emit) {
    if (state.utf8seq === 0) {
        if (byte <= 0x7f) {
            emit(byte);
            return;
        }
        // count the number of 1 leading bits until you reach 0
        for(let leadingBit = 1; leadingBit < 6; leadingBit += 1){
            if ((byte >> 7 - leadingBit & 1) === 0) {
                state.utf8seq = leadingBit;
                break;
            }
        }
        if (state.utf8seq === 2) {
            state.codepoint = byte & 31;
        } else if (state.utf8seq === 3) {
            state.codepoint = byte & 15;
        } else if (state.utf8seq === 4) {
            state.codepoint = byte & 7;
        } else {
            throw new Error("Invalid UTF-8 sequence");
        }
        state.utf8seq -= 1;
    } else if (state.utf8seq > 0) {
        if (byte <= 0x7f) {
            throw new Error("Invalid UTF-8 sequence");
        }
        state.codepoint = state.codepoint << 6 | byte & 63;
        state.utf8seq -= 1;
        if (state.utf8seq === 0) {
            emit(state.codepoint);
        }
    }
} //# sourceMappingURL=base64url.js.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/helpers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/constants.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/chunker.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$base64url$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/base64url.js [app-route] (ecmascript)"); //# sourceMappingURL=index.js.map
;
;
;
;
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/cookies.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyServerStorage",
    ()=>applyServerStorage,
    "createStorageFromOptions",
    ()=>createStorageFromOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cookie$40$1$2e$1$2e$1$2f$node_modules$2f$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cookie@1.1.1/node_modules/cookie/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/constants.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/chunker.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/helpers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$base64url$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/base64url.js [app-route] (ecmascript)");
;
;
const BASE64_PREFIX = "base64-";
function createStorageFromOptions(options, isServerClient) {
    const cookies = options.cookies ?? null;
    const cookieEncoding = options.cookieEncoding;
    const setItems = {};
    const removedItems = {};
    let getAll;
    let setAll;
    if (cookies) {
        if ("get" in cookies) {
            // Just get is not enough, because the client needs to see what cookies
            // are already set and unset them if necessary. To attempt to fix this
            // behavior for most use cases, we pass "hints" which is the keys of the
            // storage items. They are then converted to their corresponding cookie
            // chunk names and are fetched with get. Only 5 chunks are fetched, which
            // should be enough for the majority of use cases, but does not solve
            // those with very large sessions.
            const getWithHints = async (keyHints)=>{
                // optimistically find the first 5 potential chunks for the specified key
                const chunkNames = keyHints.flatMap((keyHint)=>[
                        keyHint,
                        ...Array.from({
                            length: 5
                        }).map((_, i)=>`${keyHint}.${i}`)
                    ]);
                const chunks = [];
                for(let i = 0; i < chunkNames.length; i += 1){
                    const value = await cookies.get(chunkNames[i]);
                    if (!value && typeof value !== "string") {
                        continue;
                    }
                    chunks.push({
                        name: chunkNames[i],
                        value
                    });
                }
                // TODO: detect and log stale chunks error
                return chunks;
            };
            getAll = async (keyHints)=>await getWithHints(keyHints);
            if ("set" in cookies && "remove" in cookies) {
                setAll = async (setCookies)=>{
                    for(let i = 0; i < setCookies.length; i += 1){
                        const { name, value, options } = setCookies[i];
                        if (value) {
                            await cookies.set(name, value, options);
                        } else {
                            await cookies.remove(name, options);
                        }
                    }
                };
            } else if (isServerClient) {
                setAll = async ()=>{
                    console.warn("@supabase/ssr: createServerClient was configured without set and remove cookie methods, but the client needs to set cookies. This can lead to issues such as random logouts, early session termination or increased token refresh requests. If in NextJS, check your middleware.ts file, route handlers and server actions for correctness. Consider switching to the getAll and setAll cookie methods instead of get, set and remove which are deprecated and can be difficult to use correctly.");
                };
            } else {
                throw new Error("@supabase/ssr: createBrowserClient requires configuring a getAll and setAll cookie method (deprecated: alternatively both get, set and remove can be used)");
            }
        } else if ("getAll" in cookies) {
            getAll = async ()=>await cookies.getAll();
            if ("setAll" in cookies) {
                setAll = cookies.setAll;
            } else if (isServerClient) {
                setAll = async ()=>{
                    console.warn("@supabase/ssr: createServerClient was configured without the setAll cookie method, but the client needs to set cookies. This can lead to issues such as random logouts, early session termination or increased token refresh requests. If in NextJS, check your middleware.ts file, route handlers and server actions for correctness.");
                };
            } else {
                throw new Error("@supabase/ssr: createBrowserClient requires configuring both getAll and setAll cookie methods (deprecated: alternatively both get, set and remove can be used)");
            }
        } else {
            // neither get nor getAll is present on cookies, only will occur if pure JavaScript is used, but cookies is an object
            throw new Error(`@supabase/ssr: ${isServerClient ? "createServerClient" : "createBrowserClient"} requires configuring getAll and setAll cookie methods (deprecated: alternatively use get, set and remove).${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBrowser"])() ? " As this is called in a browser runtime, consider removing the cookies option object to use the document.cookie API automatically." : ""}`);
        }
    } else if (!isServerClient && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBrowser"])()) {
        // The environment is browser, so use the document.cookie API to implement getAll and setAll.
        const noHintGetAll = ()=>{
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cookie$40$1$2e$1$2e$1$2f$node_modules$2f$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"])(document.cookie);
            return Object.keys(parsed).map((name)=>({
                    name,
                    value: parsed[name] ?? ""
                }));
        };
        getAll = ()=>noHintGetAll();
        setAll = (setCookies)=>{
            setCookies.forEach(({ name, value, options })=>{
                document.cookie = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cookie$40$1$2e$1$2e$1$2f$node_modules$2f$cookie$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serialize"])(name, value, options);
            });
        };
    } else if (isServerClient) {
        throw new Error("@supabase/ssr: createServerClient must be initialized with cookie options that specify getAll and setAll functions (deprecated, not recommended: alternatively use get, set and remove)");
    } else {
        // getting cookies when there's no window but we're in browser mode can be OK, because the developer probably is not using auth functions
        getAll = ()=>{
            return [];
        };
        // this is NOT OK because the developer is using auth functions that require setting some state, so that must error out
        setAll = ()=>{
            throw new Error("@supabase/ssr: createBrowserClient in non-browser runtimes (including Next.js pre-rendering mode) was not initialized cookie options that specify getAll and setAll functions (deprecated: alternatively use get, set and remove), but they were needed");
        };
    }
    if (!isServerClient) {
        // This is the storage client to be used in browsers. It only
        // works on the cookies abstraction, unlike the server client
        // which only uses cookies to read the initial state. When an
        // item is set, cookies are both cleared and set to values so
        // that stale chunks are not left remaining.
        return {
            getAll,
            setAll,
            setItems,
            removedItems,
            storage: {
                isServer: false,
                getItem: async (key)=>{
                    const allCookies = await getAll([
                        key
                    ]);
                    const chunkedCookie = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineChunks"])(key, async (chunkName)=>{
                        const cookie = allCookies?.find(({ name })=>name === chunkName) || null;
                        if (!cookie) {
                            return null;
                        }
                        return cookie.value;
                    });
                    if (!chunkedCookie) {
                        return null;
                    }
                    let decoded = chunkedCookie;
                    if (chunkedCookie.startsWith(BASE64_PREFIX)) {
                        decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$base64url$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stringFromBase64URL"])(chunkedCookie.substring(BASE64_PREFIX.length));
                    }
                    return decoded;
                },
                setItem: async (key, value)=>{
                    const allCookies = await getAll([
                        key
                    ]);
                    const cookieNames = allCookies?.map(({ name })=>name) || [];
                    const removeCookies = new Set(cookieNames.filter((name)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isChunkLike"])(name, key)));
                    let encoded = value;
                    if (cookieEncoding === "base64url") {
                        encoded = BASE64_PREFIX + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$base64url$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stringToBase64URL"])(value);
                    }
                    const setCookies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createChunks"])(key, encoded);
                    setCookies.forEach(({ name })=>{
                        removeCookies.delete(name);
                    });
                    const removeCookieOptions = {
                        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_COOKIE_OPTIONS"],
                        ...options?.cookieOptions,
                        maxAge: 0
                    };
                    const setCookieOptions = {
                        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_COOKIE_OPTIONS"],
                        ...options?.cookieOptions,
                        maxAge: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_COOKIE_OPTIONS"].maxAge
                    };
                    // the NextJS cookieStore API can get confused if the `name` from
                    // options.cookieOptions leaks
                    delete removeCookieOptions.name;
                    delete setCookieOptions.name;
                    const allToSet = [
                        ...[
                            ...removeCookies
                        ].map((name)=>({
                                name,
                                value: "",
                                options: removeCookieOptions
                            })),
                        ...setCookies.map(({ name, value })=>({
                                name,
                                value,
                                options: setCookieOptions
                            }))
                    ];
                    if (allToSet.length > 0) {
                        await setAll(allToSet);
                    }
                },
                removeItem: async (key)=>{
                    const allCookies = await getAll([
                        key
                    ]);
                    const cookieNames = allCookies?.map(({ name })=>name) || [];
                    const removeCookies = cookieNames.filter((name)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isChunkLike"])(name, key));
                    const removeCookieOptions = {
                        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_COOKIE_OPTIONS"],
                        ...options?.cookieOptions,
                        maxAge: 0
                    };
                    // the NextJS cookieStore API can get confused if the `name` from
                    // options.cookieOptions leaks
                    delete removeCookieOptions.name;
                    if (removeCookies.length > 0) {
                        await setAll(removeCookies.map((name)=>({
                                name,
                                value: "",
                                options: removeCookieOptions
                            })));
                    }
                }
            }
        };
    }
    // This is the server client. It only uses getAll to read the initial
    // state. Any subsequent changes to the items is persisted in the
    // setItems and removedItems objects. createServerClient *must* use
    // getAll, setAll and the values in setItems and removedItems to
    // persist the changes *at once* when appropriate (usually only when
    // the TOKEN_REFRESHED, USER_UPDATED or SIGNED_OUT events are fired by
    // the Supabase Auth client).
    return {
        getAll,
        setAll,
        setItems,
        removedItems,
        storage: {
            // to signal to the libraries that these cookies are
            // coming from a server environment and their value
            // should not be trusted
            isServer: true,
            getItem: async (key)=>{
                if (typeof setItems[key] === "string") {
                    return setItems[key];
                }
                if (removedItems[key]) {
                    return null;
                }
                const allCookies = await getAll([
                    key
                ]);
                const chunkedCookie = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["combineChunks"])(key, async (chunkName)=>{
                    const cookie = allCookies?.find(({ name })=>name === chunkName) || null;
                    if (!cookie) {
                        return null;
                    }
                    return cookie.value;
                });
                if (!chunkedCookie) {
                    return null;
                }
                let decoded = chunkedCookie;
                if (typeof chunkedCookie === "string" && chunkedCookie.startsWith(BASE64_PREFIX)) {
                    decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$base64url$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stringFromBase64URL"])(chunkedCookie.substring(BASE64_PREFIX.length));
                }
                return decoded;
            },
            setItem: async (key, value)=>{
                // We don't have an `onAuthStateChange` event that can let us know that
                // the PKCE code verifier is being set. Therefore, if we see it being
                // set, we need to apply the storage (call `setAll` so the cookie is
                // set properly).
                if (key.endsWith("-code-verifier")) {
                    await applyServerStorage({
                        getAll,
                        setAll,
                        // pretend only that the code verifier was set
                        setItems: {
                            [key]: value
                        },
                        // pretend that nothing was removed
                        removedItems: {}
                    }, {
                        cookieOptions: options?.cookieOptions ?? null,
                        cookieEncoding
                    });
                }
                setItems[key] = value;
                delete removedItems[key];
            },
            removeItem: async (key)=>{
                // Intentionally not applying the storage when the key is the PKCE code
                // verifier, as usually right after it's removed other items are set,
                // so application of the storage will be handled by the
                // `onAuthStateChange` callback that follows removal -- usually as part
                // of the `exchangeCodeForSession` call.
                delete setItems[key];
                removedItems[key] = true;
            }
        }
    };
}
async function applyServerStorage({ getAll, setAll, setItems, removedItems }, options) {
    const cookieEncoding = options.cookieEncoding;
    const cookieOptions = options.cookieOptions ?? null;
    const allCookies = await getAll([
        ...setItems ? Object.keys(setItems) : [],
        ...removedItems ? Object.keys(removedItems) : []
    ]);
    const cookieNames = allCookies?.map(({ name })=>name) || [];
    const removeCookies = Object.keys(removedItems).flatMap((itemName)=>{
        return cookieNames.filter((name)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isChunkLike"])(name, itemName));
    });
    const setCookies = Object.keys(setItems).flatMap((itemName)=>{
        const removeExistingCookiesForItem = new Set(cookieNames.filter((name)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isChunkLike"])(name, itemName)));
        let encoded = setItems[itemName];
        if (cookieEncoding === "base64url") {
            encoded = BASE64_PREFIX + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$base64url$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stringToBase64URL"])(encoded);
        }
        const chunks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$chunker$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createChunks"])(itemName, encoded);
        chunks.forEach((chunk)=>{
            removeExistingCookiesForItem.delete(chunk.name);
        });
        removeCookies.push(...removeExistingCookiesForItem);
        return chunks;
    });
    const removeCookieOptions = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_COOKIE_OPTIONS"],
        ...cookieOptions,
        maxAge: 0
    };
    const setCookieOptions = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_COOKIE_OPTIONS"],
        ...cookieOptions,
        maxAge: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_COOKIE_OPTIONS"].maxAge
    };
    // the NextJS cookieStore API can get confused if the `name` from
    // options.cookieOptions leaks
    delete removeCookieOptions.name;
    delete setCookieOptions.name;
    await setAll([
        ...removeCookies.map((name)=>({
                name,
                value: "",
                options: removeCookieOptions
            })),
        ...setCookies.map(({ name, value })=>({
                name,
                value,
                options: setCookieOptions
            }))
    ]);
} //# sourceMappingURL=cookies.js.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBrowserClient",
    ()=>createBrowserClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.95.3/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$version$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/version.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/helpers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$cookies$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/cookies.js [app-route] (ecmascript)");
;
;
;
;
let cachedBrowserClient;
function createBrowserClient(supabaseUrl, supabaseKey, options) {
    // singleton client is created only if isSingleton is set to true, or if isSingleton is not defined and we detect a browser
    const shouldUseSingleton = options?.isSingleton === true || (!options || !("isSingleton" in options)) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBrowser"])();
    if (shouldUseSingleton && cachedBrowserClient) {
        return cachedBrowserClient;
    }
    if (!supabaseUrl || !supabaseKey) {
        throw new Error(`@supabase/ssr: Your project's URL and API key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`);
    }
    const { storage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$cookies$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createStorageFromOptions"])({
        ...options,
        cookieEncoding: options?.cookieEncoding ?? "base64url"
    }, false);
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey, {
        // TODO: resolve type error
        ...options,
        global: {
            ...options?.global,
            headers: {
                ...options?.global?.headers,
                "X-Client-Info": `supabase-ssr/${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$version$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VERSION"]} createBrowserClient`
            }
        },
        auth: {
            ...options?.auth,
            ...options?.cookieOptions?.name ? {
                storageKey: options.cookieOptions.name
            } : null,
            flowType: "pkce",
            autoRefreshToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBrowser"])(),
            detectSessionInUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBrowser"])(),
            persistSession: true,
            storage,
            ...options?.cookies && "encode" in options.cookies && options.cookies.encode === "tokens-only" ? {
                userStorage: options?.auth?.userStorage ?? window.localStorage
            } : null
        }
    });
    if (shouldUseSingleton) {
        cachedBrowserClient = client;
    }
    return client;
} //# sourceMappingURL=createBrowserClient.js.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createServerClient",
    ()=>createServerClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.95.3/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$version$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/version.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$cookies$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/cookies.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/helpers.js [app-route] (ecmascript)");
;
;
;
;
function createServerClient(supabaseUrl, supabaseKey, options) {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error(`Your project's URL and Key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`);
    }
    const { storage, getAll, setAll, setItems, removedItems } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$cookies$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createStorageFromOptions"])({
        ...options,
        cookieEncoding: options?.cookieEncoding ?? "base64url"
    }, true);
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey, {
        // TODO: resolve type error
        ...options,
        global: {
            ...options?.global,
            headers: {
                ...options?.global?.headers,
                "X-Client-Info": `supabase-ssr/${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$version$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VERSION"]} createServerClient`
            }
        },
        auth: {
            ...options?.cookieOptions?.name ? {
                storageKey: options.cookieOptions.name
            } : null,
            ...options?.auth,
            flowType: "pkce",
            autoRefreshToken: false,
            detectSessionInUrl: false,
            persistSession: true,
            storage,
            ...options?.cookies && "encode" in options.cookies && options.cookies.encode === "tokens-only" ? {
                userStorage: options?.auth?.userStorage ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["memoryLocalStorageAdapter"])()
            } : null
        }
    });
    client.auth.onAuthStateChange(async (event)=>{
        // The SIGNED_IN event is fired very often, but we don't need to
        // apply the storage each time it fires, only if there are changes
        // that need to be set -- which is if setItems / removeItems have
        // data.
        const hasStorageChanges = Object.keys(setItems).length > 0 || Object.keys(removedItems).length > 0;
        if (hasStorageChanges && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "PASSWORD_RECOVERY" || event === "SIGNED_OUT" || event === "MFA_CHALLENGE_VERIFIED")) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$cookies$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyServerStorage"])({
                getAll,
                setAll,
                setItems,
                removedItems
            }, {
                cookieOptions: options?.cookieOptions ?? null,
                cookieEncoding: options?.cookieEncoding ?? "base64url"
            });
        }
    });
    return client;
} //# sourceMappingURL=createServerClient.js.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

//# sourceMappingURL=types.js.map
}),
"[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$8$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$utils$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.8.0_@supabase+supabase-js@2.95.3/node_modules/@supabase/ssr/dist/module/utils/index.js [app-route] (ecmascript) <locals>"); //# sourceMappingURL=index.js.map
// Check if this package is being used as one of the deprecated auth-helpers packages
if (typeof process !== "undefined" && process.env?.npm_package_name) {
    const packageName = process.env.npm_package_name;
    const deprecatedPackages = [
        "@supabase/auth-helpers-nextjs",
        "@supabase/auth-helpers-react",
        "@supabase/auth-helpers-remix",
        "@supabase/auth-helpers-sveltekit"
    ];
    if (deprecatedPackages.includes(packageName)) {
        console.warn(`
╔════════════════════════════════════════════════════════════════════════════╗
║ ⚠️  IMPORTANT: Package Consolidation Notice                                ║
║                                                                            ║
║ The ${packageName.padEnd(35)} package name is deprecated.  ║
║                                                                            ║
║ You are now using @supabase/ssr - a unified solution for all frameworks.  ║
║                                                                            ║
║ The auth-helpers packages have been consolidated into @supabase/ssr       ║
║ to provide better maintenance and consistent APIs across frameworks.      ║
║                                                                            ║
║ Please update your package.json to use @supabase/ssr directly:            ║
║   npm uninstall ${packageName.padEnd(42)} ║
║   npm install @supabase/ssr                                               ║
║                                                                            ║
║ For more information, visit:                                              ║
║ https://supabase.com/docs/guides/auth/server-side                         ║
╚════════════════════════════════════════════════════════════════════════════╝
    `);
    }
}
;
;
;
;
}),
"[project]/node_modules/.pnpm/cookie@1.1.1/node_modules/cookie/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseCookie = parseCookie;
exports.parse = parseCookie;
exports.stringifyCookie = stringifyCookie;
exports.stringifySetCookie = stringifySetCookie;
exports.serialize = stringifySetCookie;
exports.parseSetCookie = parseSetCookie;
exports.stringifySetCookie = stringifySetCookie;
exports.serialize = stringifySetCookie;
/**
 * RegExp to match cookie-name in RFC 6265 sec 4.1.1
 * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
 * which has been replaced by the token definition in RFC 7230 appendix B.
 *
 * cookie-name       = token
 * token             = 1*tchar
 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
 *                     "*" / "+" / "-" / "." / "^" / "_" /
 *                     "`" / "|" / "~" / DIGIT / ALPHA
 *
 * Note: Allowing more characters - https://github.com/jshttp/cookie/issues/191
 * Allow same range as cookie value, except `=`, which delimits end of name.
 */ const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
/**
 * RegExp to match cookie-value in RFC 6265 sec 4.1.1
 *
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; US-ASCII characters excluding CTLs,
 *                     ; whitespace DQUOTE, comma, semicolon,
 *                     ; and backslash
 *
 * Allowing more characters: https://github.com/jshttp/cookie/issues/191
 * Comma, backslash, and DQUOTE are not part of the parsing algorithm.
 */ const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
/**
 * RegExp to match domain-value in RFC 6265 sec 4.1.1
 *
 * domain-value      = <subdomain>
 *                     ; defined in [RFC1034], Section 3.5, as
 *                     ; enhanced by [RFC1123], Section 2.1
 * <subdomain>       = <label> | <subdomain> "." <label>
 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *                     Labels must be 63 characters or less.
 *                     'let-dig' not 'letter' in the first char, per RFC1123
 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 * <let-dig-hyp>     = <let-dig> | "-"
 * <let-dig>         = <letter> | <digit>
 * <letter>          = any one of the 52 alphabetic characters A through Z in
 *                     upper case and a through z in lower case
 * <digit>           = any one of the ten digits 0 through 9
 *
 * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
 *
 * > (Note that a leading %x2E ("."), if present, is ignored even though that
 * character is not permitted, but a trailing %x2E ("."), if present, will
 * cause the user agent to ignore the attribute.)
 */ const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
/**
 * RegExp to match path-value in RFC 6265 sec 4.1.1
 *
 * path-value        = <any CHAR except CTLs or ";">
 * CHAR              = %x01-7F
 *                     ; defined in RFC 5234 appendix B.1
 */ const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
/**
 * RegExp to match max-age-value in RFC 6265 sec 5.6.2
 */ const maxAgeRegExp = /^-?\d+$/;
const __toString = Object.prototype.toString;
const NullObject = /* @__PURE__ */ (()=>{
    const C = function() {};
    C.prototype = Object.create(null);
    return C;
})();
/**
 * Parse a `Cookie` header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */ function parseCookie(str, options) {
    const obj = new NullObject();
    const len = str.length;
    // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
    if (len < 2) return obj;
    const dec = options?.decode || decode;
    let index = 0;
    do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1) break; // No more cookie pairs.
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
            // backtrack on prior semicolon
            index = str.lastIndexOf(";", eqIdx - 1) + 1;
            continue;
        }
        const key = valueSlice(str, index, eqIdx);
        // only assign once
        if (obj[key] === undefined) {
            obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
    }while (index < len)
    return obj;
}
/**
 * Stringifies an object into an HTTP `Cookie` header.
 */ function stringifyCookie(cookie, options) {
    const enc = options?.encode || encodeURIComponent;
    const cookieStrings = [];
    for (const name of Object.keys(cookie)){
        const val = cookie[name];
        if (val === undefined) continue;
        if (!cookieNameRegExp.test(name)) {
            throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
            throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
    }
    return cookieStrings.join("; ");
}
function stringifySetCookie(_name, _val, _opts) {
    const cookie = typeof _name === "object" ? _name : {
        ..._opts,
        name: _name,
        value: String(_val)
    };
    const options = typeof _val === "object" ? _val : _opts;
    const enc = options?.encode || encodeURIComponent;
    if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
    }
    const value = cookie.value ? enc(cookie.value) : "";
    if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
    }
    let str = cookie.name + "=" + value;
    if (cookie.maxAge !== undefined) {
        if (!Number.isInteger(cookie.maxAge)) {
            throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
    }
    if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
            throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
    }
    if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
            throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
    }
    if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
            throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
    }
    if (cookie.httpOnly) {
        str += "; HttpOnly";
    }
    if (cookie.secure) {
        str += "; Secure";
    }
    if (cookie.partitioned) {
        str += "; Partitioned";
    }
    if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : undefined;
        switch(priority){
            case "low":
                str += "; Priority=Low";
                break;
            case "medium":
                str += "; Priority=Medium";
                break;
            case "high":
                str += "; Priority=High";
                break;
            default:
                throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
    }
    if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch(sameSite){
            case true:
            case "strict":
                str += "; SameSite=Strict";
                break;
            case "lax":
                str += "; SameSite=Lax";
                break;
            case "none":
                str += "; SameSite=None";
                break;
            default:
                throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
    }
    return str;
}
/**
 * Deserialize a `Set-Cookie` header into an object.
 *
 * deserialize('foo=bar; httpOnly')
 *   => { name: 'foo', value: 'bar', httpOnly: true }
 */ function parseSetCookie(str, options) {
    const dec = options?.decode || decode;
    const len = str.length;
    const endIdx = endIndex(str, 0, len);
    const eqIdx = eqIndex(str, 0, endIdx);
    const setCookie = eqIdx === -1 ? {
        name: "",
        value: dec(valueSlice(str, 0, endIdx))
    } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
    };
    let index = endIdx + 1;
    while(index < len){
        const endIdx = endIndex(str, index, len);
        const eqIdx = eqIndex(str, index, endIdx);
        const attr = eqIdx === -1 ? valueSlice(str, index, endIdx) : valueSlice(str, index, eqIdx);
        const val = eqIdx === -1 ? undefined : valueSlice(str, eqIdx + 1, endIdx);
        switch(attr.toLowerCase()){
            case "httponly":
                setCookie.httpOnly = true;
                break;
            case "secure":
                setCookie.secure = true;
                break;
            case "partitioned":
                setCookie.partitioned = true;
                break;
            case "domain":
                setCookie.domain = val;
                break;
            case "path":
                setCookie.path = val;
                break;
            case "max-age":
                if (val && maxAgeRegExp.test(val)) setCookie.maxAge = Number(val);
                break;
            case "expires":
                if (!val) break;
                const date = new Date(val);
                if (Number.isFinite(date.valueOf())) setCookie.expires = date;
                break;
            case "priority":
                if (!val) break;
                const priority = val.toLowerCase();
                if (priority === "low" || priority === "medium" || priority === "high") {
                    setCookie.priority = priority;
                }
                break;
            case "samesite":
                if (!val) break;
                const sameSite = val.toLowerCase();
                if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
                    setCookie.sameSite = sameSite;
                }
                break;
        }
        index = endIdx + 1;
    }
    return setCookie;
}
/**
 * Find the `;` character between `min` and `len` in str.
 */ function endIndex(str, min, len) {
    const index = str.indexOf(";", min);
    return index === -1 ? len : index;
}
/**
 * Find the `=` character between `min` and `max` in str.
 */ function eqIndex(str, min, max) {
    const index = str.indexOf("=", min);
    return index < max ? index : -1;
}
/**
 * Slice out a value between startPod to max.
 */ function valueSlice(str, min, max) {
    let start = min;
    let end = max;
    do {
        const code = str.charCodeAt(start);
        if (code !== 0x20 /*   */  && code !== 0x09 /* \t */ ) break;
    }while (++start < end)
    while(end > start){
        const code = str.charCodeAt(end - 1);
        if (code !== 0x20 /*   */  && code !== 0x09 /* \t */ ) break;
        end--;
    }
    return str.slice(start, end);
}
/**
 * URL-decode string value. Optimized to skip native call when no %.
 */ function decode(str) {
    if (str.indexOf("%") === -1) return str;
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
}
/**
 * Determine if value is a Date.
 */ function isDate(val) {
    return __toString.call(val) === "[object Date]";
} //# sourceMappingURL=index.js.map
}),
"[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs, [project]/node_modules/.pnpm/@aws-sdk+client-s3@3.1005.0/node_modules/@aws-sdk/client-s3)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@aws-sdk/client-s3-a71ac249bd89a90f", () => require("@aws-sdk/client-s3-a71ac249bd89a90f"));

module.exports = mod;
}),
"[project]/node_modules/.pnpm/bn.js@4.12.3/node_modules/bn.js/lib/bn.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

(function(module1, exports) {
    'use strict';
    // Utils
    function assert(val, msg) {
        if (!val) throw new Error(msg || 'Assertion failed');
    }
    // Could use `inherits` module, but don't want to move from single file
    // architecture yet.
    function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
    }
    // BN
    function BN(number, base, endian) {
        if (BN.isBN(number)) {
            return number;
        }
        this.negative = 0;
        this.words = null;
        this.length = 0;
        // Reduction context
        this.red = null;
        if (number !== null) {
            if (base === 'le' || base === 'be') {
                endian = base;
                base = 10;
            }
            this._init(number || 0, base || 10, endian || 'be');
        }
    }
    if ("TURBOPACK compile-time truthy", 1) {
        module1.exports = BN;
    } else //TURBOPACK unreachable
    ;
    BN.BN = BN;
    BN.wordSize = 26;
    var Buffer;
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            Buffer = __turbopack_context__.r("[externals]/buffer [external] (buffer, cjs)").Buffer;
        }
    } catch (e) {}
    BN.isBN = function isBN(num) {
        if (num instanceof BN) {
            return true;
        }
        return num !== null && typeof num === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
    };
    BN.max = function max(left, right) {
        if (left.cmp(right) > 0) return left;
        return right;
    };
    BN.min = function min(left, right) {
        if (left.cmp(right) < 0) return left;
        return right;
    };
    BN.prototype._init = function init(number, base, endian) {
        if (typeof number === 'number') {
            return this._initNumber(number, base, endian);
        }
        if (typeof number === 'object') {
            return this._initArray(number, base, endian);
        }
        if (base === 'hex') {
            base = 16;
        }
        assert(base === (base | 0) && base >= 2 && base <= 36);
        number = number.toString().replace(/\s+/g, '');
        var start = 0;
        if (number[0] === '-') {
            start++;
            this.negative = 1;
        }
        if (start < number.length) {
            if (base === 16) {
                this._parseHex(number, start, endian);
            } else {
                this._parseBase(number, base, start);
                if (endian === 'le') {
                    this._initArray(this.toArray(), base, endian);
                }
            }
        }
    };
    BN.prototype._initNumber = function _initNumber(number, base, endian) {
        if (number < 0) {
            this.negative = 1;
            number = -number;
        }
        if (number < 0x4000000) {
            this.words = [
                number & 0x3ffffff
            ];
            this.length = 1;
        } else if (number < 0x10000000000000) {
            this.words = [
                number & 0x3ffffff,
                number / 0x4000000 & 0x3ffffff
            ];
            this.length = 2;
        } else {
            assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
            this.words = [
                number & 0x3ffffff,
                number / 0x4000000 & 0x3ffffff,
                1
            ];
            this.length = 3;
        }
        if (endian !== 'le') return;
        // Reverse the bytes
        this._initArray(this.toArray(), base, endian);
    };
    BN.prototype._initArray = function _initArray(number, base, endian) {
        // Perhaps a Uint8Array
        assert(typeof number.length === 'number');
        if (number.length <= 0) {
            this.words = [
                0
            ];
            this.length = 1;
            return this;
        }
        this.length = Math.ceil(number.length / 3);
        this.words = new Array(this.length);
        for(var i = 0; i < this.length; i++){
            this.words[i] = 0;
        }
        var j, w;
        var off = 0;
        if (endian === 'be') {
            for(i = number.length - 1, j = 0; i >= 0; i -= 3){
                w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
                this.words[j] |= w << off & 0x3ffffff;
                this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
                off += 24;
                if (off >= 26) {
                    off -= 26;
                    j++;
                }
            }
        } else if (endian === 'le') {
            for(i = 0, j = 0; i < number.length; i += 3){
                w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
                this.words[j] |= w << off & 0x3ffffff;
                this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
                off += 24;
                if (off >= 26) {
                    off -= 26;
                    j++;
                }
            }
        }
        return this.strip();
    };
    function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index);
        // 'A' - 'F'
        if (c >= 65 && c <= 70) {
            return c - 55;
        // 'a' - 'f'
        } else if (c >= 97 && c <= 102) {
            return c - 87;
        // '0' - '9'
        } else {
            return c - 48 & 0xf;
        }
    }
    function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index);
        if (index - 1 >= lowerBound) {
            r |= parseHex4Bits(string, index - 1) << 4;
        }
        return r;
    }
    BN.prototype._parseHex = function _parseHex(number, start, endian) {
        // Create possibly bigger array to ensure that it fits the number
        this.length = Math.ceil((number.length - start) / 6);
        this.words = new Array(this.length);
        for(var i = 0; i < this.length; i++){
            this.words[i] = 0;
        }
        // 24-bits chunks
        var off = 0;
        var j = 0;
        var w;
        if (endian === 'be') {
            for(i = number.length - 1; i >= start; i -= 2){
                w = parseHexByte(number, start, i) << off;
                this.words[j] |= w & 0x3ffffff;
                if (off >= 18) {
                    off -= 18;
                    j += 1;
                    this.words[j] |= w >>> 26;
                } else {
                    off += 8;
                }
            }
        } else {
            var parseLength = number.length - start;
            for(i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2){
                w = parseHexByte(number, start, i) << off;
                this.words[j] |= w & 0x3ffffff;
                if (off >= 18) {
                    off -= 18;
                    j += 1;
                    this.words[j] |= w >>> 26;
                } else {
                    off += 8;
                }
            }
        }
        this.strip();
    };
    function parseBase(str, start, end, mul) {
        var r = 0;
        var len = Math.min(str.length, end);
        for(var i = start; i < len; i++){
            var c = str.charCodeAt(i) - 48;
            r *= mul;
            // 'a'
            if (c >= 49) {
                r += c - 49 + 0xa;
            // 'A'
            } else if (c >= 17) {
                r += c - 17 + 0xa;
            // '0' - '9'
            } else {
                r += c;
            }
        }
        return r;
    }
    BN.prototype._parseBase = function _parseBase(number, base, start) {
        // Initialize as zero
        this.words = [
            0
        ];
        this.length = 1;
        // Find length of limb in base
        for(var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base){
            limbLen++;
        }
        limbLen--;
        limbPow = limbPow / base | 0;
        var total = number.length - start;
        var mod = total % limbLen;
        var end = Math.min(total, total - mod) + start;
        var word = 0;
        for(var i = start; i < end; i += limbLen){
            word = parseBase(number, i, i + limbLen, base);
            this.imuln(limbPow);
            if (this.words[0] + word < 0x4000000) {
                this.words[0] += word;
            } else {
                this._iaddn(word);
            }
        }
        if (mod !== 0) {
            var pow = 1;
            word = parseBase(number, i, number.length, base);
            for(i = 0; i < mod; i++){
                pow *= base;
            }
            this.imuln(pow);
            if (this.words[0] + word < 0x4000000) {
                this.words[0] += word;
            } else {
                this._iaddn(word);
            }
        }
        this.strip();
    };
    BN.prototype.copy = function copy(dest) {
        dest.words = new Array(this.length);
        for(var i = 0; i < this.length; i++){
            dest.words[i] = this.words[i];
        }
        dest.length = this.length;
        dest.negative = this.negative;
        dest.red = this.red;
    };
    BN.prototype.clone = function clone() {
        var r = new BN(null);
        this.copy(r);
        return r;
    };
    BN.prototype._expand = function _expand(size) {
        while(this.length < size){
            this.words[this.length++] = 0;
        }
        return this;
    };
    // Remove leading `0` from `this`
    BN.prototype.strip = function strip() {
        while(this.length > 1 && this.words[this.length - 1] === 0){
            this.length--;
        }
        return this._normSign();
    };
    BN.prototype._normSign = function _normSign() {
        // -0 = 0
        if (this.length === 1 && this.words[0] === 0) {
            this.negative = 0;
        }
        return this;
    };
    BN.prototype.inspect = function inspect() {
        return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
    };
    /*

  var zeros = [];
  var groupSizes = [];
  var groupBases = [];

  var s = '';
  var i = -1;
  while (++i < BN.wordSize) {
    zeros[i] = s;
    s += '0';
  }
  groupSizes[0] = 0;
  groupSizes[1] = 0;
  groupBases[0] = 0;
  groupBases[1] = 0;
  var base = 2 - 1;
  while (++base < 36 + 1) {
    var groupSize = 0;
    var groupBase = 1;
    while (groupBase < (1 << BN.wordSize) / base) {
      groupBase *= base;
      groupSize += 1;
    }
    groupSizes[base] = groupSize;
    groupBases[base] = groupBase;
  }

  */ var zeros = [
        '',
        '0',
        '00',
        '000',
        '0000',
        '00000',
        '000000',
        '0000000',
        '00000000',
        '000000000',
        '0000000000',
        '00000000000',
        '000000000000',
        '0000000000000',
        '00000000000000',
        '000000000000000',
        '0000000000000000',
        '00000000000000000',
        '000000000000000000',
        '0000000000000000000',
        '00000000000000000000',
        '000000000000000000000',
        '0000000000000000000000',
        '00000000000000000000000',
        '000000000000000000000000',
        '0000000000000000000000000'
    ];
    var groupSizes = [
        0,
        0,
        25,
        16,
        12,
        11,
        10,
        9,
        8,
        8,
        7,
        7,
        7,
        7,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5
    ];
    var groupBases = [
        0,
        0,
        33554432,
        43046721,
        16777216,
        48828125,
        60466176,
        40353607,
        16777216,
        43046721,
        10000000,
        19487171,
        35831808,
        62748517,
        7529536,
        11390625,
        16777216,
        24137569,
        34012224,
        47045881,
        64000000,
        4084101,
        5153632,
        6436343,
        7962624,
        9765625,
        11881376,
        14348907,
        17210368,
        20511149,
        24300000,
        28629151,
        33554432,
        39135393,
        45435424,
        52521875,
        60466176
    ];
    BN.prototype.toString = function toString(base, padding) {
        base = base || 10;
        padding = padding | 0 || 1;
        var out;
        if (base === 16 || base === 'hex') {
            out = '';
            var off = 0;
            var carry = 0;
            for(var i = 0; i < this.length; i++){
                var w = this.words[i];
                var word = ((w << off | carry) & 0xffffff).toString(16);
                carry = w >>> 24 - off & 0xffffff;
                off += 2;
                if (off >= 26) {
                    off -= 26;
                    i--;
                }
                if (carry !== 0 || i !== this.length - 1) {
                    out = zeros[6 - word.length] + word + out;
                } else {
                    out = word + out;
                }
            }
            if (carry !== 0) {
                out = carry.toString(16) + out;
            }
            while(out.length % padding !== 0){
                out = '0' + out;
            }
            if (this.negative !== 0) {
                out = '-' + out;
            }
            return out;
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
            // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
            var groupSize = groupSizes[base];
            // var groupBase = Math.pow(base, groupSize);
            var groupBase = groupBases[base];
            out = '';
            var c = this.clone();
            c.negative = 0;
            while(!c.isZero()){
                var r = c.modn(groupBase).toString(base);
                c = c.idivn(groupBase);
                if (!c.isZero()) {
                    out = zeros[groupSize - r.length] + r + out;
                } else {
                    out = r + out;
                }
            }
            if (this.isZero()) {
                out = '0' + out;
            }
            while(out.length % padding !== 0){
                out = '0' + out;
            }
            if (this.negative !== 0) {
                out = '-' + out;
            }
            return out;
        }
        assert(false, 'Base should be between 2 and 36');
    };
    BN.prototype.toNumber = function toNumber() {
        var ret = this.words[0];
        if (this.length === 2) {
            ret += this.words[1] * 0x4000000;
        } else if (this.length === 3 && this.words[2] === 0x01) {
            // NOTE: at this stage it is known that the top bit is set
            ret += 0x10000000000000 + this.words[1] * 0x4000000;
        } else if (this.length > 2) {
            assert(false, 'Number can only safely store up to 53 bits');
        }
        return this.negative !== 0 ? -ret : ret;
    };
    BN.prototype.toJSON = function toJSON() {
        return this.toString(16);
    };
    BN.prototype.toBuffer = function toBuffer(endian, length) {
        assert(typeof Buffer !== 'undefined');
        return this.toArrayLike(Buffer, endian, length);
    };
    BN.prototype.toArray = function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length);
    };
    BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
        var byteLength = this.byteLength();
        var reqLength = length || Math.max(1, byteLength);
        assert(byteLength <= reqLength, 'byte array longer than desired length');
        assert(reqLength > 0, 'Requested array length <= 0');
        this.strip();
        var littleEndian = endian === 'le';
        var res = new ArrayType(reqLength);
        var b, i;
        var q = this.clone();
        if (!littleEndian) {
            // Assume big-endian
            for(i = 0; i < reqLength - byteLength; i++){
                res[i] = 0;
            }
            for(i = 0; !q.isZero(); i++){
                b = q.andln(0xff);
                q.iushrn(8);
                res[reqLength - i - 1] = b;
            }
        } else {
            for(i = 0; !q.isZero(); i++){
                b = q.andln(0xff);
                q.iushrn(8);
                res[i] = b;
            }
            for(; i < reqLength; i++){
                res[i] = 0;
            }
        }
        return res;
    };
    if (Math.clz32) {
        BN.prototype._countBits = function _countBits(w) {
            return 32 - Math.clz32(w);
        };
    } else {
        BN.prototype._countBits = function _countBits(w) {
            var t = w;
            var r = 0;
            if (t >= 0x1000) {
                r += 13;
                t >>>= 13;
            }
            if (t >= 0x40) {
                r += 7;
                t >>>= 7;
            }
            if (t >= 0x8) {
                r += 4;
                t >>>= 4;
            }
            if (t >= 0x02) {
                r += 2;
                t >>>= 2;
            }
            return r + t;
        };
    }
    BN.prototype._zeroBits = function _zeroBits(w) {
        // Short-cut
        if (w === 0) return 26;
        var t = w;
        var r = 0;
        if ((t & 0x1fff) === 0) {
            r += 13;
            t >>>= 13;
        }
        if ((t & 0x7f) === 0) {
            r += 7;
            t >>>= 7;
        }
        if ((t & 0xf) === 0) {
            r += 4;
            t >>>= 4;
        }
        if ((t & 0x3) === 0) {
            r += 2;
            t >>>= 2;
        }
        if ((t & 0x1) === 0) {
            r++;
        }
        return r;
    };
    // Return number of used bits in a BN
    BN.prototype.bitLength = function bitLength() {
        var w = this.words[this.length - 1];
        var hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
    };
    function toBitArray(num) {
        var w = new Array(num.bitLength());
        for(var bit = 0; bit < w.length; bit++){
            var off = bit / 26 | 0;
            var wbit = bit % 26;
            w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
        }
        return w;
    }
    // Number of trailing zero bits
    BN.prototype.zeroBits = function zeroBits() {
        if (this.isZero()) return 0;
        var r = 0;
        for(var i = 0; i < this.length; i++){
            var b = this._zeroBits(this.words[i]);
            r += b;
            if (b !== 26) break;
        }
        return r;
    };
    BN.prototype.byteLength = function byteLength() {
        return Math.ceil(this.bitLength() / 8);
    };
    BN.prototype.toTwos = function toTwos(width) {
        if (this.negative !== 0) {
            return this.abs().inotn(width).iaddn(1);
        }
        return this.clone();
    };
    BN.prototype.fromTwos = function fromTwos(width) {
        if (this.testn(width - 1)) {
            return this.notn(width).iaddn(1).ineg();
        }
        return this.clone();
    };
    BN.prototype.isNeg = function isNeg() {
        return this.negative !== 0;
    };
    // Return negative clone of `this`
    BN.prototype.neg = function neg() {
        return this.clone().ineg();
    };
    BN.prototype.ineg = function ineg() {
        if (!this.isZero()) {
            this.negative ^= 1;
        }
        return this;
    };
    // Or `num` with `this` in-place
    BN.prototype.iuor = function iuor(num) {
        while(this.length < num.length){
            this.words[this.length++] = 0;
        }
        for(var i = 0; i < num.length; i++){
            this.words[i] = this.words[i] | num.words[i];
        }
        return this.strip();
    };
    BN.prototype.ior = function ior(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuor(num);
    };
    // Or `num` with `this`
    BN.prototype.or = function or(num) {
        if (this.length > num.length) return this.clone().ior(num);
        return num.clone().ior(this);
    };
    BN.prototype.uor = function uor(num) {
        if (this.length > num.length) return this.clone().iuor(num);
        return num.clone().iuor(this);
    };
    // And `num` with `this` in-place
    BN.prototype.iuand = function iuand(num) {
        // b = min-length(num, this)
        var b;
        if (this.length > num.length) {
            b = num;
        } else {
            b = this;
        }
        for(var i = 0; i < b.length; i++){
            this.words[i] = this.words[i] & num.words[i];
        }
        this.length = b.length;
        return this.strip();
    };
    BN.prototype.iand = function iand(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuand(num);
    };
    // And `num` with `this`
    BN.prototype.and = function and(num) {
        if (this.length > num.length) return this.clone().iand(num);
        return num.clone().iand(this);
    };
    BN.prototype.uand = function uand(num) {
        if (this.length > num.length) return this.clone().iuand(num);
        return num.clone().iuand(this);
    };
    // Xor `num` with `this` in-place
    BN.prototype.iuxor = function iuxor(num) {
        // a.length > b.length
        var a;
        var b;
        if (this.length > num.length) {
            a = this;
            b = num;
        } else {
            a = num;
            b = this;
        }
        for(var i = 0; i < b.length; i++){
            this.words[i] = a.words[i] ^ b.words[i];
        }
        if (this !== a) {
            for(; i < a.length; i++){
                this.words[i] = a.words[i];
            }
        }
        this.length = a.length;
        return this.strip();
    };
    BN.prototype.ixor = function ixor(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuxor(num);
    };
    // Xor `num` with `this`
    BN.prototype.xor = function xor(num) {
        if (this.length > num.length) return this.clone().ixor(num);
        return num.clone().ixor(this);
    };
    BN.prototype.uxor = function uxor(num) {
        if (this.length > num.length) return this.clone().iuxor(num);
        return num.clone().iuxor(this);
    };
    // Not ``this`` with ``width`` bitwidth
    BN.prototype.inotn = function inotn(width) {
        assert(typeof width === 'number' && width >= 0);
        var bytesNeeded = Math.ceil(width / 26) | 0;
        var bitsLeft = width % 26;
        // Extend the buffer with leading zeroes
        this._expand(bytesNeeded);
        if (bitsLeft > 0) {
            bytesNeeded--;
        }
        // Handle complete words
        for(var i = 0; i < bytesNeeded; i++){
            this.words[i] = ~this.words[i] & 0x3ffffff;
        }
        // Handle the residue
        if (bitsLeft > 0) {
            this.words[i] = ~this.words[i] & 0x3ffffff >> 26 - bitsLeft;
        }
        // And remove leading zeroes
        return this.strip();
    };
    BN.prototype.notn = function notn(width) {
        return this.clone().inotn(width);
    };
    // Set `bit` of `this`
    BN.prototype.setn = function setn(bit, val) {
        assert(typeof bit === 'number' && bit >= 0);
        var off = bit / 26 | 0;
        var wbit = bit % 26;
        this._expand(off + 1);
        if (val) {
            this.words[off] = this.words[off] | 1 << wbit;
        } else {
            this.words[off] = this.words[off] & ~(1 << wbit);
        }
        return this.strip();
    };
    // Add `num` to `this` in-place
    BN.prototype.iadd = function iadd(num) {
        var r;
        // negative + positive
        if (this.negative !== 0 && num.negative === 0) {
            this.negative = 0;
            r = this.isub(num);
            this.negative ^= 1;
            return this._normSign();
        // positive + negative
        } else if (this.negative === 0 && num.negative !== 0) {
            num.negative = 0;
            r = this.isub(num);
            num.negative = 1;
            return r._normSign();
        }
        // a.length > b.length
        var a, b;
        if (this.length > num.length) {
            a = this;
            b = num;
        } else {
            a = num;
            b = this;
        }
        var carry = 0;
        for(var i = 0; i < b.length; i++){
            r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
        }
        for(; carry !== 0 && i < a.length; i++){
            r = (a.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
        }
        this.length = a.length;
        if (carry !== 0) {
            this.words[this.length] = carry;
            this.length++;
        // Copy the rest of the words
        } else if (a !== this) {
            for(; i < a.length; i++){
                this.words[i] = a.words[i];
            }
        }
        return this;
    };
    // Add `num` to `this`
    BN.prototype.add = function add(num) {
        var res;
        if (num.negative !== 0 && this.negative === 0) {
            num.negative = 0;
            res = this.sub(num);
            num.negative ^= 1;
            return res;
        } else if (num.negative === 0 && this.negative !== 0) {
            this.negative = 0;
            res = num.sub(this);
            this.negative = 1;
            return res;
        }
        if (this.length > num.length) return this.clone().iadd(num);
        return num.clone().iadd(this);
    };
    // Subtract `num` from `this` in-place
    BN.prototype.isub = function isub(num) {
        // this - (-num) = this + num
        if (num.negative !== 0) {
            num.negative = 0;
            var r = this.iadd(num);
            num.negative = 1;
            return r._normSign();
        // -this - num = -(this + num)
        } else if (this.negative !== 0) {
            this.negative = 0;
            this.iadd(num);
            this.negative = 1;
            return this._normSign();
        }
        // At this point both numbers are positive
        var cmp = this.cmp(num);
        // Optimization - zeroify
        if (cmp === 0) {
            this.negative = 0;
            this.length = 1;
            this.words[0] = 0;
            return this;
        }
        // a > b
        var a, b;
        if (cmp > 0) {
            a = this;
            b = num;
        } else {
            a = num;
            b = this;
        }
        var carry = 0;
        for(var i = 0; i < b.length; i++){
            r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
        }
        for(; carry !== 0 && i < a.length; i++){
            r = (a.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
        }
        // Copy rest of the words
        if (carry === 0 && i < a.length && a !== this) {
            for(; i < a.length; i++){
                this.words[i] = a.words[i];
            }
        }
        this.length = Math.max(this.length, i);
        if (a !== this) {
            this.negative = 1;
        }
        return this.strip();
    };
    // Subtract `num` from `this`
    BN.prototype.sub = function sub(num) {
        return this.clone().isub(num);
    };
    function smallMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative;
        var len = self.length + num.length | 0;
        out.length = len;
        len = len - 1 | 0;
        // Peel one iteration (compiler can't do it, because of code complexity)
        var a = self.words[0] | 0;
        var b = num.words[0] | 0;
        var r = a * b;
        var lo = r & 0x3ffffff;
        var carry = r / 0x4000000 | 0;
        out.words[0] = lo;
        for(var k = 1; k < len; k++){
            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
            // note that ncarry could be >= 0x3ffffff
            var ncarry = carry >>> 26;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for(var j = Math.max(0, k - self.length + 1); j <= maxJ; j++){
                var i = k - j | 0;
                a = self.words[i] | 0;
                b = num.words[j] | 0;
                r = a * b + rword;
                ncarry += r / 0x4000000 | 0;
                rword = r & 0x3ffffff;
            }
            out.words[k] = rword | 0;
            carry = ncarry | 0;
        }
        if (carry !== 0) {
            out.words[k] = carry | 0;
        } else {
            out.length--;
        }
        return out.strip();
    }
    // TODO(indutny): it may be reasonable to omit it for users who don't need
    // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
    // multiplication (like elliptic secp256k1).
    var comb10MulTo = function comb10MulTo(self, num, out) {
        var a = self.words;
        var b = num.words;
        var o = out.words;
        var c = 0;
        var lo;
        var mid;
        var hi;
        var a0 = a[0] | 0;
        var al0 = a0 & 0x1fff;
        var ah0 = a0 >>> 13;
        var a1 = a[1] | 0;
        var al1 = a1 & 0x1fff;
        var ah1 = a1 >>> 13;
        var a2 = a[2] | 0;
        var al2 = a2 & 0x1fff;
        var ah2 = a2 >>> 13;
        var a3 = a[3] | 0;
        var al3 = a3 & 0x1fff;
        var ah3 = a3 >>> 13;
        var a4 = a[4] | 0;
        var al4 = a4 & 0x1fff;
        var ah4 = a4 >>> 13;
        var a5 = a[5] | 0;
        var al5 = a5 & 0x1fff;
        var ah5 = a5 >>> 13;
        var a6 = a[6] | 0;
        var al6 = a6 & 0x1fff;
        var ah6 = a6 >>> 13;
        var a7 = a[7] | 0;
        var al7 = a7 & 0x1fff;
        var ah7 = a7 >>> 13;
        var a8 = a[8] | 0;
        var al8 = a8 & 0x1fff;
        var ah8 = a8 >>> 13;
        var a9 = a[9] | 0;
        var al9 = a9 & 0x1fff;
        var ah9 = a9 >>> 13;
        var b0 = b[0] | 0;
        var bl0 = b0 & 0x1fff;
        var bh0 = b0 >>> 13;
        var b1 = b[1] | 0;
        var bl1 = b1 & 0x1fff;
        var bh1 = b1 >>> 13;
        var b2 = b[2] | 0;
        var bl2 = b2 & 0x1fff;
        var bh2 = b2 >>> 13;
        var b3 = b[3] | 0;
        var bl3 = b3 & 0x1fff;
        var bh3 = b3 >>> 13;
        var b4 = b[4] | 0;
        var bl4 = b4 & 0x1fff;
        var bh4 = b4 >>> 13;
        var b5 = b[5] | 0;
        var bl5 = b5 & 0x1fff;
        var bh5 = b5 >>> 13;
        var b6 = b[6] | 0;
        var bl6 = b6 & 0x1fff;
        var bh6 = b6 >>> 13;
        var b7 = b[7] | 0;
        var bl7 = b7 & 0x1fff;
        var bh7 = b7 >>> 13;
        var b8 = b[8] | 0;
        var bl8 = b8 & 0x1fff;
        var bh8 = b8 >>> 13;
        var b9 = b[9] | 0;
        var bl9 = b9 & 0x1fff;
        var bh9 = b9 >>> 13;
        out.negative = self.negative ^ num.negative;
        out.length = 19;
        /* k = 0 */ lo = Math.imul(al0, bl0);
        mid = Math.imul(al0, bh0);
        mid = mid + Math.imul(ah0, bl0) | 0;
        hi = Math.imul(ah0, bh0);
        var w0 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
        w0 &= 0x3ffffff;
        /* k = 1 */ lo = Math.imul(al1, bl0);
        mid = Math.imul(al1, bh0);
        mid = mid + Math.imul(ah1, bl0) | 0;
        hi = Math.imul(ah1, bh0);
        lo = lo + Math.imul(al0, bl1) | 0;
        mid = mid + Math.imul(al0, bh1) | 0;
        mid = mid + Math.imul(ah0, bl1) | 0;
        hi = hi + Math.imul(ah0, bh1) | 0;
        var w1 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
        w1 &= 0x3ffffff;
        /* k = 2 */ lo = Math.imul(al2, bl0);
        mid = Math.imul(al2, bh0);
        mid = mid + Math.imul(ah2, bl0) | 0;
        hi = Math.imul(ah2, bh0);
        lo = lo + Math.imul(al1, bl1) | 0;
        mid = mid + Math.imul(al1, bh1) | 0;
        mid = mid + Math.imul(ah1, bl1) | 0;
        hi = hi + Math.imul(ah1, bh1) | 0;
        lo = lo + Math.imul(al0, bl2) | 0;
        mid = mid + Math.imul(al0, bh2) | 0;
        mid = mid + Math.imul(ah0, bl2) | 0;
        hi = hi + Math.imul(ah0, bh2) | 0;
        var w2 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
        w2 &= 0x3ffffff;
        /* k = 3 */ lo = Math.imul(al3, bl0);
        mid = Math.imul(al3, bh0);
        mid = mid + Math.imul(ah3, bl0) | 0;
        hi = Math.imul(ah3, bh0);
        lo = lo + Math.imul(al2, bl1) | 0;
        mid = mid + Math.imul(al2, bh1) | 0;
        mid = mid + Math.imul(ah2, bl1) | 0;
        hi = hi + Math.imul(ah2, bh1) | 0;
        lo = lo + Math.imul(al1, bl2) | 0;
        mid = mid + Math.imul(al1, bh2) | 0;
        mid = mid + Math.imul(ah1, bl2) | 0;
        hi = hi + Math.imul(ah1, bh2) | 0;
        lo = lo + Math.imul(al0, bl3) | 0;
        mid = mid + Math.imul(al0, bh3) | 0;
        mid = mid + Math.imul(ah0, bl3) | 0;
        hi = hi + Math.imul(ah0, bh3) | 0;
        var w3 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
        w3 &= 0x3ffffff;
        /* k = 4 */ lo = Math.imul(al4, bl0);
        mid = Math.imul(al4, bh0);
        mid = mid + Math.imul(ah4, bl0) | 0;
        hi = Math.imul(ah4, bh0);
        lo = lo + Math.imul(al3, bl1) | 0;
        mid = mid + Math.imul(al3, bh1) | 0;
        mid = mid + Math.imul(ah3, bl1) | 0;
        hi = hi + Math.imul(ah3, bh1) | 0;
        lo = lo + Math.imul(al2, bl2) | 0;
        mid = mid + Math.imul(al2, bh2) | 0;
        mid = mid + Math.imul(ah2, bl2) | 0;
        hi = hi + Math.imul(ah2, bh2) | 0;
        lo = lo + Math.imul(al1, bl3) | 0;
        mid = mid + Math.imul(al1, bh3) | 0;
        mid = mid + Math.imul(ah1, bl3) | 0;
        hi = hi + Math.imul(ah1, bh3) | 0;
        lo = lo + Math.imul(al0, bl4) | 0;
        mid = mid + Math.imul(al0, bh4) | 0;
        mid = mid + Math.imul(ah0, bl4) | 0;
        hi = hi + Math.imul(ah0, bh4) | 0;
        var w4 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
        w4 &= 0x3ffffff;
        /* k = 5 */ lo = Math.imul(al5, bl0);
        mid = Math.imul(al5, bh0);
        mid = mid + Math.imul(ah5, bl0) | 0;
        hi = Math.imul(ah5, bh0);
        lo = lo + Math.imul(al4, bl1) | 0;
        mid = mid + Math.imul(al4, bh1) | 0;
        mid = mid + Math.imul(ah4, bl1) | 0;
        hi = hi + Math.imul(ah4, bh1) | 0;
        lo = lo + Math.imul(al3, bl2) | 0;
        mid = mid + Math.imul(al3, bh2) | 0;
        mid = mid + Math.imul(ah3, bl2) | 0;
        hi = hi + Math.imul(ah3, bh2) | 0;
        lo = lo + Math.imul(al2, bl3) | 0;
        mid = mid + Math.imul(al2, bh3) | 0;
        mid = mid + Math.imul(ah2, bl3) | 0;
        hi = hi + Math.imul(ah2, bh3) | 0;
        lo = lo + Math.imul(al1, bl4) | 0;
        mid = mid + Math.imul(al1, bh4) | 0;
        mid = mid + Math.imul(ah1, bl4) | 0;
        hi = hi + Math.imul(ah1, bh4) | 0;
        lo = lo + Math.imul(al0, bl5) | 0;
        mid = mid + Math.imul(al0, bh5) | 0;
        mid = mid + Math.imul(ah0, bl5) | 0;
        hi = hi + Math.imul(ah0, bh5) | 0;
        var w5 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
        w5 &= 0x3ffffff;
        /* k = 6 */ lo = Math.imul(al6, bl0);
        mid = Math.imul(al6, bh0);
        mid = mid + Math.imul(ah6, bl0) | 0;
        hi = Math.imul(ah6, bh0);
        lo = lo + Math.imul(al5, bl1) | 0;
        mid = mid + Math.imul(al5, bh1) | 0;
        mid = mid + Math.imul(ah5, bl1) | 0;
        hi = hi + Math.imul(ah5, bh1) | 0;
        lo = lo + Math.imul(al4, bl2) | 0;
        mid = mid + Math.imul(al4, bh2) | 0;
        mid = mid + Math.imul(ah4, bl2) | 0;
        hi = hi + Math.imul(ah4, bh2) | 0;
        lo = lo + Math.imul(al3, bl3) | 0;
        mid = mid + Math.imul(al3, bh3) | 0;
        mid = mid + Math.imul(ah3, bl3) | 0;
        hi = hi + Math.imul(ah3, bh3) | 0;
        lo = lo + Math.imul(al2, bl4) | 0;
        mid = mid + Math.imul(al2, bh4) | 0;
        mid = mid + Math.imul(ah2, bl4) | 0;
        hi = hi + Math.imul(ah2, bh4) | 0;
        lo = lo + Math.imul(al1, bl5) | 0;
        mid = mid + Math.imul(al1, bh5) | 0;
        mid = mid + Math.imul(ah1, bl5) | 0;
        hi = hi + Math.imul(ah1, bh5) | 0;
        lo = lo + Math.imul(al0, bl6) | 0;
        mid = mid + Math.imul(al0, bh6) | 0;
        mid = mid + Math.imul(ah0, bl6) | 0;
        hi = hi + Math.imul(ah0, bh6) | 0;
        var w6 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
        w6 &= 0x3ffffff;
        /* k = 7 */ lo = Math.imul(al7, bl0);
        mid = Math.imul(al7, bh0);
        mid = mid + Math.imul(ah7, bl0) | 0;
        hi = Math.imul(ah7, bh0);
        lo = lo + Math.imul(al6, bl1) | 0;
        mid = mid + Math.imul(al6, bh1) | 0;
        mid = mid + Math.imul(ah6, bl1) | 0;
        hi = hi + Math.imul(ah6, bh1) | 0;
        lo = lo + Math.imul(al5, bl2) | 0;
        mid = mid + Math.imul(al5, bh2) | 0;
        mid = mid + Math.imul(ah5, bl2) | 0;
        hi = hi + Math.imul(ah5, bh2) | 0;
        lo = lo + Math.imul(al4, bl3) | 0;
        mid = mid + Math.imul(al4, bh3) | 0;
        mid = mid + Math.imul(ah4, bl3) | 0;
        hi = hi + Math.imul(ah4, bh3) | 0;
        lo = lo + Math.imul(al3, bl4) | 0;
        mid = mid + Math.imul(al3, bh4) | 0;
        mid = mid + Math.imul(ah3, bl4) | 0;
        hi = hi + Math.imul(ah3, bh4) | 0;
        lo = lo + Math.imul(al2, bl5) | 0;
        mid = mid + Math.imul(al2, bh5) | 0;
        mid = mid + Math.imul(ah2, bl5) | 0;
        hi = hi + Math.imul(ah2, bh5) | 0;
        lo = lo + Math.imul(al1, bl6) | 0;
        mid = mid + Math.imul(al1, bh6) | 0;
        mid = mid + Math.imul(ah1, bl6) | 0;
        hi = hi + Math.imul(ah1, bh6) | 0;
        lo = lo + Math.imul(al0, bl7) | 0;
        mid = mid + Math.imul(al0, bh7) | 0;
        mid = mid + Math.imul(ah0, bl7) | 0;
        hi = hi + Math.imul(ah0, bh7) | 0;
        var w7 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
        w7 &= 0x3ffffff;
        /* k = 8 */ lo = Math.imul(al8, bl0);
        mid = Math.imul(al8, bh0);
        mid = mid + Math.imul(ah8, bl0) | 0;
        hi = Math.imul(ah8, bh0);
        lo = lo + Math.imul(al7, bl1) | 0;
        mid = mid + Math.imul(al7, bh1) | 0;
        mid = mid + Math.imul(ah7, bl1) | 0;
        hi = hi + Math.imul(ah7, bh1) | 0;
        lo = lo + Math.imul(al6, bl2) | 0;
        mid = mid + Math.imul(al6, bh2) | 0;
        mid = mid + Math.imul(ah6, bl2) | 0;
        hi = hi + Math.imul(ah6, bh2) | 0;
        lo = lo + Math.imul(al5, bl3) | 0;
        mid = mid + Math.imul(al5, bh3) | 0;
        mid = mid + Math.imul(ah5, bl3) | 0;
        hi = hi + Math.imul(ah5, bh3) | 0;
        lo = lo + Math.imul(al4, bl4) | 0;
        mid = mid + Math.imul(al4, bh4) | 0;
        mid = mid + Math.imul(ah4, bl4) | 0;
        hi = hi + Math.imul(ah4, bh4) | 0;
        lo = lo + Math.imul(al3, bl5) | 0;
        mid = mid + Math.imul(al3, bh5) | 0;
        mid = mid + Math.imul(ah3, bl5) | 0;
        hi = hi + Math.imul(ah3, bh5) | 0;
        lo = lo + Math.imul(al2, bl6) | 0;
        mid = mid + Math.imul(al2, bh6) | 0;
        mid = mid + Math.imul(ah2, bl6) | 0;
        hi = hi + Math.imul(ah2, bh6) | 0;
        lo = lo + Math.imul(al1, bl7) | 0;
        mid = mid + Math.imul(al1, bh7) | 0;
        mid = mid + Math.imul(ah1, bl7) | 0;
        hi = hi + Math.imul(ah1, bh7) | 0;
        lo = lo + Math.imul(al0, bl8) | 0;
        mid = mid + Math.imul(al0, bh8) | 0;
        mid = mid + Math.imul(ah0, bl8) | 0;
        hi = hi + Math.imul(ah0, bh8) | 0;
        var w8 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
        w8 &= 0x3ffffff;
        /* k = 9 */ lo = Math.imul(al9, bl0);
        mid = Math.imul(al9, bh0);
        mid = mid + Math.imul(ah9, bl0) | 0;
        hi = Math.imul(ah9, bh0);
        lo = lo + Math.imul(al8, bl1) | 0;
        mid = mid + Math.imul(al8, bh1) | 0;
        mid = mid + Math.imul(ah8, bl1) | 0;
        hi = hi + Math.imul(ah8, bh1) | 0;
        lo = lo + Math.imul(al7, bl2) | 0;
        mid = mid + Math.imul(al7, bh2) | 0;
        mid = mid + Math.imul(ah7, bl2) | 0;
        hi = hi + Math.imul(ah7, bh2) | 0;
        lo = lo + Math.imul(al6, bl3) | 0;
        mid = mid + Math.imul(al6, bh3) | 0;
        mid = mid + Math.imul(ah6, bl3) | 0;
        hi = hi + Math.imul(ah6, bh3) | 0;
        lo = lo + Math.imul(al5, bl4) | 0;
        mid = mid + Math.imul(al5, bh4) | 0;
        mid = mid + Math.imul(ah5, bl4) | 0;
        hi = hi + Math.imul(ah5, bh4) | 0;
        lo = lo + Math.imul(al4, bl5) | 0;
        mid = mid + Math.imul(al4, bh5) | 0;
        mid = mid + Math.imul(ah4, bl5) | 0;
        hi = hi + Math.imul(ah4, bh5) | 0;
        lo = lo + Math.imul(al3, bl6) | 0;
        mid = mid + Math.imul(al3, bh6) | 0;
        mid = mid + Math.imul(ah3, bl6) | 0;
        hi = hi + Math.imul(ah3, bh6) | 0;
        lo = lo + Math.imul(al2, bl7) | 0;
        mid = mid + Math.imul(al2, bh7) | 0;
        mid = mid + Math.imul(ah2, bl7) | 0;
        hi = hi + Math.imul(ah2, bh7) | 0;
        lo = lo + Math.imul(al1, bl8) | 0;
        mid = mid + Math.imul(al1, bh8) | 0;
        mid = mid + Math.imul(ah1, bl8) | 0;
        hi = hi + Math.imul(ah1, bh8) | 0;
        lo = lo + Math.imul(al0, bl9) | 0;
        mid = mid + Math.imul(al0, bh9) | 0;
        mid = mid + Math.imul(ah0, bl9) | 0;
        hi = hi + Math.imul(ah0, bh9) | 0;
        var w9 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
        w9 &= 0x3ffffff;
        /* k = 10 */ lo = Math.imul(al9, bl1);
        mid = Math.imul(al9, bh1);
        mid = mid + Math.imul(ah9, bl1) | 0;
        hi = Math.imul(ah9, bh1);
        lo = lo + Math.imul(al8, bl2) | 0;
        mid = mid + Math.imul(al8, bh2) | 0;
        mid = mid + Math.imul(ah8, bl2) | 0;
        hi = hi + Math.imul(ah8, bh2) | 0;
        lo = lo + Math.imul(al7, bl3) | 0;
        mid = mid + Math.imul(al7, bh3) | 0;
        mid = mid + Math.imul(ah7, bl3) | 0;
        hi = hi + Math.imul(ah7, bh3) | 0;
        lo = lo + Math.imul(al6, bl4) | 0;
        mid = mid + Math.imul(al6, bh4) | 0;
        mid = mid + Math.imul(ah6, bl4) | 0;
        hi = hi + Math.imul(ah6, bh4) | 0;
        lo = lo + Math.imul(al5, bl5) | 0;
        mid = mid + Math.imul(al5, bh5) | 0;
        mid = mid + Math.imul(ah5, bl5) | 0;
        hi = hi + Math.imul(ah5, bh5) | 0;
        lo = lo + Math.imul(al4, bl6) | 0;
        mid = mid + Math.imul(al4, bh6) | 0;
        mid = mid + Math.imul(ah4, bl6) | 0;
        hi = hi + Math.imul(ah4, bh6) | 0;
        lo = lo + Math.imul(al3, bl7) | 0;
        mid = mid + Math.imul(al3, bh7) | 0;
        mid = mid + Math.imul(ah3, bl7) | 0;
        hi = hi + Math.imul(ah3, bh7) | 0;
        lo = lo + Math.imul(al2, bl8) | 0;
        mid = mid + Math.imul(al2, bh8) | 0;
        mid = mid + Math.imul(ah2, bl8) | 0;
        hi = hi + Math.imul(ah2, bh8) | 0;
        lo = lo + Math.imul(al1, bl9) | 0;
        mid = mid + Math.imul(al1, bh9) | 0;
        mid = mid + Math.imul(ah1, bl9) | 0;
        hi = hi + Math.imul(ah1, bh9) | 0;
        var w10 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
        w10 &= 0x3ffffff;
        /* k = 11 */ lo = Math.imul(al9, bl2);
        mid = Math.imul(al9, bh2);
        mid = mid + Math.imul(ah9, bl2) | 0;
        hi = Math.imul(ah9, bh2);
        lo = lo + Math.imul(al8, bl3) | 0;
        mid = mid + Math.imul(al8, bh3) | 0;
        mid = mid + Math.imul(ah8, bl3) | 0;
        hi = hi + Math.imul(ah8, bh3) | 0;
        lo = lo + Math.imul(al7, bl4) | 0;
        mid = mid + Math.imul(al7, bh4) | 0;
        mid = mid + Math.imul(ah7, bl4) | 0;
        hi = hi + Math.imul(ah7, bh4) | 0;
        lo = lo + Math.imul(al6, bl5) | 0;
        mid = mid + Math.imul(al6, bh5) | 0;
        mid = mid + Math.imul(ah6, bl5) | 0;
        hi = hi + Math.imul(ah6, bh5) | 0;
        lo = lo + Math.imul(al5, bl6) | 0;
        mid = mid + Math.imul(al5, bh6) | 0;
        mid = mid + Math.imul(ah5, bl6) | 0;
        hi = hi + Math.imul(ah5, bh6) | 0;
        lo = lo + Math.imul(al4, bl7) | 0;
        mid = mid + Math.imul(al4, bh7) | 0;
        mid = mid + Math.imul(ah4, bl7) | 0;
        hi = hi + Math.imul(ah4, bh7) | 0;
        lo = lo + Math.imul(al3, bl8) | 0;
        mid = mid + Math.imul(al3, bh8) | 0;
        mid = mid + Math.imul(ah3, bl8) | 0;
        hi = hi + Math.imul(ah3, bh8) | 0;
        lo = lo + Math.imul(al2, bl9) | 0;
        mid = mid + Math.imul(al2, bh9) | 0;
        mid = mid + Math.imul(ah2, bl9) | 0;
        hi = hi + Math.imul(ah2, bh9) | 0;
        var w11 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
        w11 &= 0x3ffffff;
        /* k = 12 */ lo = Math.imul(al9, bl3);
        mid = Math.imul(al9, bh3);
        mid = mid + Math.imul(ah9, bl3) | 0;
        hi = Math.imul(ah9, bh3);
        lo = lo + Math.imul(al8, bl4) | 0;
        mid = mid + Math.imul(al8, bh4) | 0;
        mid = mid + Math.imul(ah8, bl4) | 0;
        hi = hi + Math.imul(ah8, bh4) | 0;
        lo = lo + Math.imul(al7, bl5) | 0;
        mid = mid + Math.imul(al7, bh5) | 0;
        mid = mid + Math.imul(ah7, bl5) | 0;
        hi = hi + Math.imul(ah7, bh5) | 0;
        lo = lo + Math.imul(al6, bl6) | 0;
        mid = mid + Math.imul(al6, bh6) | 0;
        mid = mid + Math.imul(ah6, bl6) | 0;
        hi = hi + Math.imul(ah6, bh6) | 0;
        lo = lo + Math.imul(al5, bl7) | 0;
        mid = mid + Math.imul(al5, bh7) | 0;
        mid = mid + Math.imul(ah5, bl7) | 0;
        hi = hi + Math.imul(ah5, bh7) | 0;
        lo = lo + Math.imul(al4, bl8) | 0;
        mid = mid + Math.imul(al4, bh8) | 0;
        mid = mid + Math.imul(ah4, bl8) | 0;
        hi = hi + Math.imul(ah4, bh8) | 0;
        lo = lo + Math.imul(al3, bl9) | 0;
        mid = mid + Math.imul(al3, bh9) | 0;
        mid = mid + Math.imul(ah3, bl9) | 0;
        hi = hi + Math.imul(ah3, bh9) | 0;
        var w12 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
        w12 &= 0x3ffffff;
        /* k = 13 */ lo = Math.imul(al9, bl4);
        mid = Math.imul(al9, bh4);
        mid = mid + Math.imul(ah9, bl4) | 0;
        hi = Math.imul(ah9, bh4);
        lo = lo + Math.imul(al8, bl5) | 0;
        mid = mid + Math.imul(al8, bh5) | 0;
        mid = mid + Math.imul(ah8, bl5) | 0;
        hi = hi + Math.imul(ah8, bh5) | 0;
        lo = lo + Math.imul(al7, bl6) | 0;
        mid = mid + Math.imul(al7, bh6) | 0;
        mid = mid + Math.imul(ah7, bl6) | 0;
        hi = hi + Math.imul(ah7, bh6) | 0;
        lo = lo + Math.imul(al6, bl7) | 0;
        mid = mid + Math.imul(al6, bh7) | 0;
        mid = mid + Math.imul(ah6, bl7) | 0;
        hi = hi + Math.imul(ah6, bh7) | 0;
        lo = lo + Math.imul(al5, bl8) | 0;
        mid = mid + Math.imul(al5, bh8) | 0;
        mid = mid + Math.imul(ah5, bl8) | 0;
        hi = hi + Math.imul(ah5, bh8) | 0;
        lo = lo + Math.imul(al4, bl9) | 0;
        mid = mid + Math.imul(al4, bh9) | 0;
        mid = mid + Math.imul(ah4, bl9) | 0;
        hi = hi + Math.imul(ah4, bh9) | 0;
        var w13 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
        w13 &= 0x3ffffff;
        /* k = 14 */ lo = Math.imul(al9, bl5);
        mid = Math.imul(al9, bh5);
        mid = mid + Math.imul(ah9, bl5) | 0;
        hi = Math.imul(ah9, bh5);
        lo = lo + Math.imul(al8, bl6) | 0;
        mid = mid + Math.imul(al8, bh6) | 0;
        mid = mid + Math.imul(ah8, bl6) | 0;
        hi = hi + Math.imul(ah8, bh6) | 0;
        lo = lo + Math.imul(al7, bl7) | 0;
        mid = mid + Math.imul(al7, bh7) | 0;
        mid = mid + Math.imul(ah7, bl7) | 0;
        hi = hi + Math.imul(ah7, bh7) | 0;
        lo = lo + Math.imul(al6, bl8) | 0;
        mid = mid + Math.imul(al6, bh8) | 0;
        mid = mid + Math.imul(ah6, bl8) | 0;
        hi = hi + Math.imul(ah6, bh8) | 0;
        lo = lo + Math.imul(al5, bl9) | 0;
        mid = mid + Math.imul(al5, bh9) | 0;
        mid = mid + Math.imul(ah5, bl9) | 0;
        hi = hi + Math.imul(ah5, bh9) | 0;
        var w14 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
        w14 &= 0x3ffffff;
        /* k = 15 */ lo = Math.imul(al9, bl6);
        mid = Math.imul(al9, bh6);
        mid = mid + Math.imul(ah9, bl6) | 0;
        hi = Math.imul(ah9, bh6);
        lo = lo + Math.imul(al8, bl7) | 0;
        mid = mid + Math.imul(al8, bh7) | 0;
        mid = mid + Math.imul(ah8, bl7) | 0;
        hi = hi + Math.imul(ah8, bh7) | 0;
        lo = lo + Math.imul(al7, bl8) | 0;
        mid = mid + Math.imul(al7, bh8) | 0;
        mid = mid + Math.imul(ah7, bl8) | 0;
        hi = hi + Math.imul(ah7, bh8) | 0;
        lo = lo + Math.imul(al6, bl9) | 0;
        mid = mid + Math.imul(al6, bh9) | 0;
        mid = mid + Math.imul(ah6, bl9) | 0;
        hi = hi + Math.imul(ah6, bh9) | 0;
        var w15 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
        w15 &= 0x3ffffff;
        /* k = 16 */ lo = Math.imul(al9, bl7);
        mid = Math.imul(al9, bh7);
        mid = mid + Math.imul(ah9, bl7) | 0;
        hi = Math.imul(ah9, bh7);
        lo = lo + Math.imul(al8, bl8) | 0;
        mid = mid + Math.imul(al8, bh8) | 0;
        mid = mid + Math.imul(ah8, bl8) | 0;
        hi = hi + Math.imul(ah8, bh8) | 0;
        lo = lo + Math.imul(al7, bl9) | 0;
        mid = mid + Math.imul(al7, bh9) | 0;
        mid = mid + Math.imul(ah7, bl9) | 0;
        hi = hi + Math.imul(ah7, bh9) | 0;
        var w16 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
        w16 &= 0x3ffffff;
        /* k = 17 */ lo = Math.imul(al9, bl8);
        mid = Math.imul(al9, bh8);
        mid = mid + Math.imul(ah9, bl8) | 0;
        hi = Math.imul(ah9, bh8);
        lo = lo + Math.imul(al8, bl9) | 0;
        mid = mid + Math.imul(al8, bh9) | 0;
        mid = mid + Math.imul(ah8, bl9) | 0;
        hi = hi + Math.imul(ah8, bh9) | 0;
        var w17 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
        w17 &= 0x3ffffff;
        /* k = 18 */ lo = Math.imul(al9, bl9);
        mid = Math.imul(al9, bh9);
        mid = mid + Math.imul(ah9, bl9) | 0;
        hi = Math.imul(ah9, bh9);
        var w18 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
        w18 &= 0x3ffffff;
        o[0] = w0;
        o[1] = w1;
        o[2] = w2;
        o[3] = w3;
        o[4] = w4;
        o[5] = w5;
        o[6] = w6;
        o[7] = w7;
        o[8] = w8;
        o[9] = w9;
        o[10] = w10;
        o[11] = w11;
        o[12] = w12;
        o[13] = w13;
        o[14] = w14;
        o[15] = w15;
        o[16] = w16;
        o[17] = w17;
        o[18] = w18;
        if (c !== 0) {
            o[19] = c;
            out.length++;
        }
        return out;
    };
    // Polyfill comb
    if (!Math.imul) {
        comb10MulTo = smallMulTo;
    }
    function bigMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative;
        out.length = self.length + num.length;
        var carry = 0;
        var hncarry = 0;
        for(var k = 0; k < out.length - 1; k++){
            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
            // note that ncarry could be >= 0x3ffffff
            var ncarry = hncarry;
            hncarry = 0;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for(var j = Math.max(0, k - self.length + 1); j <= maxJ; j++){
                var i = k - j;
                var a = self.words[i] | 0;
                var b = num.words[j] | 0;
                var r = a * b;
                var lo = r & 0x3ffffff;
                ncarry = ncarry + (r / 0x4000000 | 0) | 0;
                lo = lo + rword | 0;
                rword = lo & 0x3ffffff;
                ncarry = ncarry + (lo >>> 26) | 0;
                hncarry += ncarry >>> 26;
                ncarry &= 0x3ffffff;
            }
            out.words[k] = rword;
            carry = ncarry;
            ncarry = hncarry;
        }
        if (carry !== 0) {
            out.words[k] = carry;
        } else {
            out.length--;
        }
        return out.strip();
    }
    function jumboMulTo(self, num, out) {
        var fftm = new FFTM();
        return fftm.mulp(self, num, out);
    }
    BN.prototype.mulTo = function mulTo(num, out) {
        var res;
        var len = this.length + num.length;
        if (this.length === 10 && num.length === 10) {
            res = comb10MulTo(this, num, out);
        } else if (len < 63) {
            res = smallMulTo(this, num, out);
        } else if (len < 1024) {
            res = bigMulTo(this, num, out);
        } else {
            res = jumboMulTo(this, num, out);
        }
        return res;
    };
    // Cooley-Tukey algorithm for FFT
    // slightly revisited to rely on looping instead of recursion
    function FFTM(x, y) {
        this.x = x;
        this.y = y;
    }
    FFTM.prototype.makeRBT = function makeRBT(N) {
        var t = new Array(N);
        var l = BN.prototype._countBits(N) - 1;
        for(var i = 0; i < N; i++){
            t[i] = this.revBin(i, l, N);
        }
        return t;
    };
    // Returns binary-reversed representation of `x`
    FFTM.prototype.revBin = function revBin(x, l, N) {
        if (x === 0 || x === N - 1) return x;
        var rb = 0;
        for(var i = 0; i < l; i++){
            rb |= (x & 1) << l - i - 1;
            x >>= 1;
        }
        return rb;
    };
    // Performs "tweedling" phase, therefore 'emulating'
    // behaviour of the recursive algorithm
    FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
        for(var i = 0; i < N; i++){
            rtws[i] = rws[rbt[i]];
            itws[i] = iws[rbt[i]];
        }
    };
    FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);
        for(var s = 1; s < N; s <<= 1){
            var l = s << 1;
            var rtwdf = Math.cos(2 * Math.PI / l);
            var itwdf = Math.sin(2 * Math.PI / l);
            for(var p = 0; p < N; p += l){
                var rtwdf_ = rtwdf;
                var itwdf_ = itwdf;
                for(var j = 0; j < s; j++){
                    var re = rtws[p + j];
                    var ie = itws[p + j];
                    var ro = rtws[p + j + s];
                    var io = itws[p + j + s];
                    var rx = rtwdf_ * ro - itwdf_ * io;
                    io = rtwdf_ * io + itwdf_ * ro;
                    ro = rx;
                    rtws[p + j] = re + ro;
                    itws[p + j] = ie + io;
                    rtws[p + j + s] = re - ro;
                    itws[p + j + s] = ie - io;
                    /* jshint maxdepth : false */ if (j !== l) {
                        rx = rtwdf * rtwdf_ - itwdf * itwdf_;
                        itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                        rtwdf_ = rx;
                    }
                }
            }
        }
    };
    FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1;
        var odd = N & 1;
        var i = 0;
        for(N = N / 2 | 0; N; N = N >>> 1){
            i++;
        }
        return 1 << i + 1 + odd;
    };
    FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
        if (N <= 1) return;
        for(var i = 0; i < N / 2; i++){
            var t = rws[i];
            rws[i] = rws[N - i - 1];
            rws[N - i - 1] = t;
            t = iws[i];
            iws[i] = -iws[N - i - 1];
            iws[N - i - 1] = -t;
        }
    };
    FFTM.prototype.normalize13b = function normalize13b(ws, N) {
        var carry = 0;
        for(var i = 0; i < N / 2; i++){
            var w = Math.round(ws[2 * i + 1] / N) * 0x2000 + Math.round(ws[2 * i] / N) + carry;
            ws[i] = w & 0x3ffffff;
            if (w < 0x4000000) {
                carry = 0;
            } else {
                carry = w / 0x4000000 | 0;
            }
        }
        return ws;
    };
    FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
        var carry = 0;
        for(var i = 0; i < len; i++){
            carry = carry + (ws[i] | 0);
            rws[2 * i] = carry & 0x1fff;
            carry = carry >>> 13;
            rws[2 * i + 1] = carry & 0x1fff;
            carry = carry >>> 13;
        }
        // Pad with zeroes
        for(i = 2 * len; i < N; ++i){
            rws[i] = 0;
        }
        assert(carry === 0);
        assert((carry & ~0x1fff) === 0);
    };
    FFTM.prototype.stub = function stub(N) {
        var ph = new Array(N);
        for(var i = 0; i < N; i++){
            ph[i] = 0;
        }
        return ph;
    };
    FFTM.prototype.mulp = function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length);
        var rbt = this.makeRBT(N);
        var _ = this.stub(N);
        var rws = new Array(N);
        var rwst = new Array(N);
        var iwst = new Array(N);
        var nrws = new Array(N);
        var nrwst = new Array(N);
        var niwst = new Array(N);
        var rmws = out.words;
        rmws.length = N;
        this.convert13b(x.words, x.length, rws, N);
        this.convert13b(y.words, y.length, nrws, N);
        this.transform(rws, _, rwst, iwst, N, rbt);
        this.transform(nrws, _, nrwst, niwst, N, rbt);
        for(var i = 0; i < N; i++){
            var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
            iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
            rwst[i] = rx;
        }
        this.conjugate(rwst, iwst, N);
        this.transform(rwst, iwst, rmws, _, N, rbt);
        this.conjugate(rmws, _, N);
        this.normalize13b(rmws, N);
        out.negative = x.negative ^ y.negative;
        out.length = x.length + y.length;
        return out.strip();
    };
    // Multiply `this` by `num`
    BN.prototype.mul = function mul(num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return this.mulTo(num, out);
    };
    // Multiply employing FFT
    BN.prototype.mulf = function mulf(num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return jumboMulTo(this, num, out);
    };
    // In-place Multiplication
    BN.prototype.imul = function imul(num) {
        return this.clone().mulTo(num, this);
    };
    BN.prototype.imuln = function imuln(num) {
        assert(typeof num === 'number');
        assert(num < 0x4000000);
        // Carry
        var carry = 0;
        for(var i = 0; i < this.length; i++){
            var w = (this.words[i] | 0) * num;
            var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
            carry >>= 26;
            carry += w / 0x4000000 | 0;
            // NOTE: lo is 27bit maximum
            carry += lo >>> 26;
            this.words[i] = lo & 0x3ffffff;
        }
        if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
        }
        this.length = num === 0 ? 1 : this.length;
        return this;
    };
    BN.prototype.muln = function muln(num) {
        return this.clone().imuln(num);
    };
    // `this` * `this`
    BN.prototype.sqr = function sqr() {
        return this.mul(this);
    };
    // `this` * `this` in-place
    BN.prototype.isqr = function isqr() {
        return this.imul(this.clone());
    };
    // Math.pow(`this`, `num`)
    BN.prototype.pow = function pow(num) {
        var w = toBitArray(num);
        if (w.length === 0) return new BN(1);
        // Skip leading zeroes
        var res = this;
        for(var i = 0; i < w.length; i++, res = res.sqr()){
            if (w[i] !== 0) break;
        }
        if (++i < w.length) {
            for(var q = res.sqr(); i < w.length; i++, q = q.sqr()){
                if (w[i] === 0) continue;
                res = res.mul(q);
            }
        }
        return res;
    };
    // Shift-left in-place
    BN.prototype.iushln = function iushln(bits) {
        assert(typeof bits === 'number' && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        var carryMask = 0x3ffffff >>> 26 - r << 26 - r;
        var i;
        if (r !== 0) {
            var carry = 0;
            for(i = 0; i < this.length; i++){
                var newCarry = this.words[i] & carryMask;
                var c = (this.words[i] | 0) - newCarry << r;
                this.words[i] = c | carry;
                carry = newCarry >>> 26 - r;
            }
            if (carry) {
                this.words[i] = carry;
                this.length++;
            }
        }
        if (s !== 0) {
            for(i = this.length - 1; i >= 0; i--){
                this.words[i + s] = this.words[i];
            }
            for(i = 0; i < s; i++){
                this.words[i] = 0;
            }
            this.length += s;
        }
        return this.strip();
    };
    BN.prototype.ishln = function ishln(bits) {
        // TODO(indutny): implement me
        assert(this.negative === 0);
        return this.iushln(bits);
    };
    // Shift-right in-place
    // NOTE: `hint` is a lowest bit before trailing zeroes
    // NOTE: if `extended` is present - it will be filled with destroyed bits
    BN.prototype.iushrn = function iushrn(bits, hint, extended) {
        assert(typeof bits === 'number' && bits >= 0);
        var h;
        if (hint) {
            h = (hint - hint % 26) / 26;
        } else {
            h = 0;
        }
        var r = bits % 26;
        var s = Math.min((bits - r) / 26, this.length);
        var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
        var maskedWords = extended;
        h -= s;
        h = Math.max(0, h);
        // Extended mode, copy masked part
        if (maskedWords) {
            for(var i = 0; i < s; i++){
                maskedWords.words[i] = this.words[i];
            }
            maskedWords.length = s;
        }
        if (s === 0) {
        // No-op, we should not move anything at all
        } else if (this.length > s) {
            this.length -= s;
            for(i = 0; i < this.length; i++){
                this.words[i] = this.words[i + s];
            }
        } else {
            this.words[0] = 0;
            this.length = 1;
        }
        var carry = 0;
        for(i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--){
            var word = this.words[i] | 0;
            this.words[i] = carry << 26 - r | word >>> r;
            carry = word & mask;
        }
        // Push carried bits as a mask
        if (maskedWords && carry !== 0) {
            maskedWords.words[maskedWords.length++] = carry;
        }
        if (this.length === 0) {
            this.words[0] = 0;
            this.length = 1;
        }
        return this.strip();
    };
    BN.prototype.ishrn = function ishrn(bits, hint, extended) {
        // TODO(indutny): implement me
        assert(this.negative === 0);
        return this.iushrn(bits, hint, extended);
    };
    // Shift-left
    BN.prototype.shln = function shln(bits) {
        return this.clone().ishln(bits);
    };
    BN.prototype.ushln = function ushln(bits) {
        return this.clone().iushln(bits);
    };
    // Shift-right
    BN.prototype.shrn = function shrn(bits) {
        return this.clone().ishrn(bits);
    };
    BN.prototype.ushrn = function ushrn(bits) {
        return this.clone().iushrn(bits);
    };
    // Test if n bit is set
    BN.prototype.testn = function testn(bit) {
        assert(typeof bit === 'number' && bit >= 0);
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;
        // Fast case: bit is much higher than all existing words
        if (this.length <= s) return false;
        // Check bit and return
        var w = this.words[s];
        return !!(w & q);
    };
    // Return only lowers bits of number (in-place)
    BN.prototype.imaskn = function imaskn(bits) {
        assert(typeof bits === 'number' && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        assert(this.negative === 0, 'imaskn works only with positive numbers');
        if (this.length <= s) {
            return this;
        }
        if (r !== 0) {
            s++;
        }
        this.length = Math.min(s, this.length);
        if (r !== 0) {
            var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
            this.words[this.length - 1] &= mask;
        }
        if (this.length === 0) {
            this.words[0] = 0;
            this.length = 1;
        }
        return this.strip();
    };
    // Return only lowers bits of number
    BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits);
    };
    // Add plain number `num` to `this`
    BN.prototype.iaddn = function iaddn(num) {
        assert(typeof num === 'number');
        assert(num < 0x4000000);
        if (num < 0) return this.isubn(-num);
        // Possible sign change
        if (this.negative !== 0) {
            if (this.length === 1 && (this.words[0] | 0) < num) {
                this.words[0] = num - (this.words[0] | 0);
                this.negative = 0;
                return this;
            }
            this.negative = 0;
            this.isubn(num);
            this.negative = 1;
            return this;
        }
        // Add without checks
        return this._iaddn(num);
    };
    BN.prototype._iaddn = function _iaddn(num) {
        this.words[0] += num;
        // Carry
        for(var i = 0; i < this.length && this.words[i] >= 0x4000000; i++){
            this.words[i] -= 0x4000000;
            if (i === this.length - 1) {
                this.words[i + 1] = 1;
            } else {
                this.words[i + 1]++;
            }
        }
        this.length = Math.max(this.length, i + 1);
        return this;
    };
    // Subtract plain number `num` from `this`
    BN.prototype.isubn = function isubn(num) {
        assert(typeof num === 'number');
        assert(num < 0x4000000);
        if (num < 0) return this.iaddn(-num);
        if (this.negative !== 0) {
            this.negative = 0;
            this.iaddn(num);
            this.negative = 1;
            return this;
        }
        this.words[0] -= num;
        if (this.length === 1 && this.words[0] < 0) {
            this.words[0] = -this.words[0];
            this.negative = 1;
        } else {
            // Carry
            for(var i = 0; i < this.length && this.words[i] < 0; i++){
                this.words[i] += 0x4000000;
                this.words[i + 1] -= 1;
            }
        }
        return this.strip();
    };
    BN.prototype.addn = function addn(num) {
        return this.clone().iaddn(num);
    };
    BN.prototype.subn = function subn(num) {
        return this.clone().isubn(num);
    };
    BN.prototype.iabs = function iabs() {
        this.negative = 0;
        return this;
    };
    BN.prototype.abs = function abs() {
        return this.clone().iabs();
    };
    BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
        var len = num.length + shift;
        var i;
        this._expand(len);
        var w;
        var carry = 0;
        for(i = 0; i < num.length; i++){
            w = (this.words[i + shift] | 0) + carry;
            var right = (num.words[i] | 0) * mul;
            w -= right & 0x3ffffff;
            carry = (w >> 26) - (right / 0x4000000 | 0);
            this.words[i + shift] = w & 0x3ffffff;
        }
        for(; i < this.length - shift; i++){
            w = (this.words[i + shift] | 0) + carry;
            carry = w >> 26;
            this.words[i + shift] = w & 0x3ffffff;
        }
        if (carry === 0) return this.strip();
        // Subtraction overflow
        assert(carry === -1);
        carry = 0;
        for(i = 0; i < this.length; i++){
            w = -(this.words[i] | 0) + carry;
            carry = w >> 26;
            this.words[i] = w & 0x3ffffff;
        }
        this.negative = 1;
        return this.strip();
    };
    BN.prototype._wordDiv = function _wordDiv(num, mode) {
        var shift = this.length - num.length;
        var a = this.clone();
        var b = num;
        // Normalize
        var bhi = b.words[b.length - 1] | 0;
        var bhiBits = this._countBits(bhi);
        shift = 26 - bhiBits;
        if (shift !== 0) {
            b = b.ushln(shift);
            a.iushln(shift);
            bhi = b.words[b.length - 1] | 0;
        }
        // Initialize quotient
        var m = a.length - b.length;
        var q;
        if (mode !== 'mod') {
            q = new BN(null);
            q.length = m + 1;
            q.words = new Array(q.length);
            for(var i = 0; i < q.length; i++){
                q.words[i] = 0;
            }
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
            a = diff;
            if (q) {
                q.words[m] = 1;
            }
        }
        for(var j = m - 1; j >= 0; j--){
            var qj = (a.words[b.length + j] | 0) * 0x4000000 + (a.words[b.length + j - 1] | 0);
            // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
            // (0x7ffffff)
            qj = Math.min(qj / bhi | 0, 0x3ffffff);
            a._ishlnsubmul(b, qj, j);
            while(a.negative !== 0){
                qj--;
                a.negative = 0;
                a._ishlnsubmul(b, 1, j);
                if (!a.isZero()) {
                    a.negative ^= 1;
                }
            }
            if (q) {
                q.words[j] = qj;
            }
        }
        if (q) {
            q.strip();
        }
        a.strip();
        // Denormalize
        if (mode !== 'div' && shift !== 0) {
            a.iushrn(shift);
        }
        return {
            div: q || null,
            mod: a
        };
    };
    // NOTE: 1) `mode` can be set to `mod` to request mod only,
    //       to `div` to request div only, or be absent to
    //       request both div & mod
    //       2) `positive` is true if unsigned mod is requested
    BN.prototype.divmod = function divmod(num, mode, positive) {
        assert(!num.isZero());
        if (this.isZero()) {
            return {
                div: new BN(0),
                mod: new BN(0)
            };
        }
        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
            res = this.neg().divmod(num, mode);
            if (mode !== 'mod') {
                div = res.div.neg();
            }
            if (mode !== 'div') {
                mod = res.mod.neg();
                if (positive && mod.negative !== 0) {
                    mod.iadd(num);
                }
            }
            return {
                div: div,
                mod: mod
            };
        }
        if (this.negative === 0 && num.negative !== 0) {
            res = this.divmod(num.neg(), mode);
            if (mode !== 'mod') {
                div = res.div.neg();
            }
            return {
                div: div,
                mod: res.mod
            };
        }
        if ((this.negative & num.negative) !== 0) {
            res = this.neg().divmod(num.neg(), mode);
            if (mode !== 'div') {
                mod = res.mod.neg();
                if (positive && mod.negative !== 0) {
                    mod.isub(num);
                }
            }
            return {
                div: res.div,
                mod: mod
            };
        }
        // Both numbers are positive at this point
        // Strip both numbers to approximate shift value
        if (num.length > this.length || this.cmp(num) < 0) {
            return {
                div: new BN(0),
                mod: this
            };
        }
        // Very short reduction
        if (num.length === 1) {
            if (mode === 'div') {
                return {
                    div: this.divn(num.words[0]),
                    mod: null
                };
            }
            if (mode === 'mod') {
                return {
                    div: null,
                    mod: new BN(this.modn(num.words[0]))
                };
            }
            return {
                div: this.divn(num.words[0]),
                mod: new BN(this.modn(num.words[0]))
            };
        }
        return this._wordDiv(num, mode);
    };
    // Find `this` / `num`
    BN.prototype.div = function div(num) {
        return this.divmod(num, 'div', false).div;
    };
    // Find `this` % `num`
    BN.prototype.mod = function mod(num) {
        return this.divmod(num, 'mod', false).mod;
    };
    BN.prototype.umod = function umod(num) {
        return this.divmod(num, 'mod', true).mod;
    };
    // Find Round(`this` / `num`)
    BN.prototype.divRound = function divRound(num) {
        var dm = this.divmod(num);
        // Fast case - exact division
        if (dm.mod.isZero()) return dm.div;
        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;
        var half = num.ushrn(1);
        var r2 = num.andln(1);
        var cmp = mod.cmp(half);
        // Round down
        if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;
        // Round up
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
    };
    BN.prototype.modn = function modn(num) {
        assert(num <= 0x3ffffff);
        var p = (1 << 26) % num;
        var acc = 0;
        for(var i = this.length - 1; i >= 0; i--){
            acc = (p * acc + (this.words[i] | 0)) % num;
        }
        return acc;
    };
    // In-place division by number
    BN.prototype.idivn = function idivn(num) {
        assert(num <= 0x3ffffff);
        var carry = 0;
        for(var i = this.length - 1; i >= 0; i--){
            var w = (this.words[i] | 0) + carry * 0x4000000;
            this.words[i] = w / num | 0;
            carry = w % num;
        }
        return this.strip();
    };
    BN.prototype.divn = function divn(num) {
        return this.clone().idivn(num);
    };
    BN.prototype.egcd = function egcd(p) {
        assert(p.negative === 0);
        assert(!p.isZero());
        var x = this;
        var y = p.clone();
        if (x.negative !== 0) {
            x = x.umod(p);
        } else {
            x = x.clone();
        }
        // A * x + B * y = x
        var A = new BN(1);
        var B = new BN(0);
        // C * x + D * y = y
        var C = new BN(0);
        var D = new BN(1);
        var g = 0;
        while(x.isEven() && y.isEven()){
            x.iushrn(1);
            y.iushrn(1);
            ++g;
        }
        var yp = y.clone();
        var xp = x.clone();
        while(!x.isZero()){
            for(var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
            if (i > 0) {
                x.iushrn(i);
                while(i-- > 0){
                    if (A.isOdd() || B.isOdd()) {
                        A.iadd(yp);
                        B.isub(xp);
                    }
                    A.iushrn(1);
                    B.iushrn(1);
                }
            }
            for(var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
            if (j > 0) {
                y.iushrn(j);
                while(j-- > 0){
                    if (C.isOdd() || D.isOdd()) {
                        C.iadd(yp);
                        D.isub(xp);
                    }
                    C.iushrn(1);
                    D.iushrn(1);
                }
            }
            if (x.cmp(y) >= 0) {
                x.isub(y);
                A.isub(C);
                B.isub(D);
            } else {
                y.isub(x);
                C.isub(A);
                D.isub(B);
            }
        }
        return {
            a: C,
            b: D,
            gcd: y.iushln(g)
        };
    };
    // This is reduced incarnation of the binary EEA
    // above, designated to invert members of the
    // _prime_ fields F(p) at a maximal speed
    BN.prototype._invmp = function _invmp(p) {
        assert(p.negative === 0);
        assert(!p.isZero());
        var a = this;
        var b = p.clone();
        if (a.negative !== 0) {
            a = a.umod(p);
        } else {
            a = a.clone();
        }
        var x1 = new BN(1);
        var x2 = new BN(0);
        var delta = b.clone();
        while(a.cmpn(1) > 0 && b.cmpn(1) > 0){
            for(var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
            if (i > 0) {
                a.iushrn(i);
                while(i-- > 0){
                    if (x1.isOdd()) {
                        x1.iadd(delta);
                    }
                    x1.iushrn(1);
                }
            }
            for(var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
            if (j > 0) {
                b.iushrn(j);
                while(j-- > 0){
                    if (x2.isOdd()) {
                        x2.iadd(delta);
                    }
                    x2.iushrn(1);
                }
            }
            if (a.cmp(b) >= 0) {
                a.isub(b);
                x1.isub(x2);
            } else {
                b.isub(a);
                x2.isub(x1);
            }
        }
        var res;
        if (a.cmpn(1) === 0) {
            res = x1;
        } else {
            res = x2;
        }
        if (res.cmpn(0) < 0) {
            res.iadd(p);
        }
        return res;
    };
    BN.prototype.gcd = function gcd(num) {
        if (this.isZero()) return num.abs();
        if (num.isZero()) return this.abs();
        var a = this.clone();
        var b = num.clone();
        a.negative = 0;
        b.negative = 0;
        // Remove common factor of two
        for(var shift = 0; a.isEven() && b.isEven(); shift++){
            a.iushrn(1);
            b.iushrn(1);
        }
        do {
            while(a.isEven()){
                a.iushrn(1);
            }
            while(b.isEven()){
                b.iushrn(1);
            }
            var r = a.cmp(b);
            if (r < 0) {
                // Swap `a` and `b` to make `a` always bigger than `b`
                var t = a;
                a = b;
                b = t;
            } else if (r === 0 || b.cmpn(1) === 0) {
                break;
            }
            a.isub(b);
        }while (true)
        return b.iushln(shift);
    };
    // Invert number in the field F(num)
    BN.prototype.invm = function invm(num) {
        return this.egcd(num).a.umod(num);
    };
    BN.prototype.isEven = function isEven() {
        return (this.words[0] & 1) === 0;
    };
    BN.prototype.isOdd = function isOdd() {
        return (this.words[0] & 1) === 1;
    };
    // And first word and num
    BN.prototype.andln = function andln(num) {
        return this.words[0] & num;
    };
    // Increment at the bit position in-line
    BN.prototype.bincn = function bincn(bit) {
        assert(typeof bit === 'number');
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;
        // Fast case: bit is much higher than all existing words
        if (this.length <= s) {
            this._expand(s + 1);
            this.words[s] |= q;
            return this;
        }
        // Add bit and propagate, if needed
        var carry = q;
        for(var i = s; carry !== 0 && i < this.length; i++){
            var w = this.words[i] | 0;
            w += carry;
            carry = w >>> 26;
            w &= 0x3ffffff;
            this.words[i] = w;
        }
        if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
        }
        return this;
    };
    BN.prototype.isZero = function isZero() {
        return this.length === 1 && this.words[0] === 0;
    };
    BN.prototype.cmpn = function cmpn(num) {
        var negative = num < 0;
        if (this.negative !== 0 && !negative) return -1;
        if (this.negative === 0 && negative) return 1;
        this.strip();
        var res;
        if (this.length > 1) {
            res = 1;
        } else {
            if (negative) {
                num = -num;
            }
            assert(num <= 0x3ffffff, 'Number is too big');
            var w = this.words[0] | 0;
            res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0) return -res | 0;
        return res;
    };
    // Compare two numbers and return:
    // 1 - if `this` > `num`
    // 0 - if `this` == `num`
    // -1 - if `this` < `num`
    BN.prototype.cmp = function cmp(num) {
        if (this.negative !== 0 && num.negative === 0) return -1;
        if (this.negative === 0 && num.negative !== 0) return 1;
        var res = this.ucmp(num);
        if (this.negative !== 0) return -res | 0;
        return res;
    };
    // Unsigned comparison
    BN.prototype.ucmp = function ucmp(num) {
        // At this point both numbers have the same sign
        if (this.length > num.length) return 1;
        if (this.length < num.length) return -1;
        var res = 0;
        for(var i = this.length - 1; i >= 0; i--){
            var a = this.words[i] | 0;
            var b = num.words[i] | 0;
            if (a === b) continue;
            if (a < b) {
                res = -1;
            } else if (a > b) {
                res = 1;
            }
            break;
        }
        return res;
    };
    BN.prototype.gtn = function gtn(num) {
        return this.cmpn(num) === 1;
    };
    BN.prototype.gt = function gt(num) {
        return this.cmp(num) === 1;
    };
    BN.prototype.gten = function gten(num) {
        return this.cmpn(num) >= 0;
    };
    BN.prototype.gte = function gte(num) {
        return this.cmp(num) >= 0;
    };
    BN.prototype.ltn = function ltn(num) {
        return this.cmpn(num) === -1;
    };
    BN.prototype.lt = function lt(num) {
        return this.cmp(num) === -1;
    };
    BN.prototype.lten = function lten(num) {
        return this.cmpn(num) <= 0;
    };
    BN.prototype.lte = function lte(num) {
        return this.cmp(num) <= 0;
    };
    BN.prototype.eqn = function eqn(num) {
        return this.cmpn(num) === 0;
    };
    BN.prototype.eq = function eq(num) {
        return this.cmp(num) === 0;
    };
    //
    // A reduce context, could be using montgomery or something better, depending
    // on the `m` itself.
    //
    BN.red = function red(num) {
        return new Red(num);
    };
    BN.prototype.toRed = function toRed(ctx) {
        assert(!this.red, 'Already a number in reduction context');
        assert(this.negative === 0, 'red works only with positives');
        return ctx.convertTo(this)._forceRed(ctx);
    };
    BN.prototype.fromRed = function fromRed() {
        assert(this.red, 'fromRed works only with numbers in reduction context');
        return this.red.convertFrom(this);
    };
    BN.prototype._forceRed = function _forceRed(ctx) {
        this.red = ctx;
        return this;
    };
    BN.prototype.forceRed = function forceRed(ctx) {
        assert(!this.red, 'Already a number in reduction context');
        return this._forceRed(ctx);
    };
    BN.prototype.redAdd = function redAdd(num) {
        assert(this.red, 'redAdd works only with red numbers');
        return this.red.add(this, num);
    };
    BN.prototype.redIAdd = function redIAdd(num) {
        assert(this.red, 'redIAdd works only with red numbers');
        return this.red.iadd(this, num);
    };
    BN.prototype.redSub = function redSub(num) {
        assert(this.red, 'redSub works only with red numbers');
        return this.red.sub(this, num);
    };
    BN.prototype.redISub = function redISub(num) {
        assert(this.red, 'redISub works only with red numbers');
        return this.red.isub(this, num);
    };
    BN.prototype.redShl = function redShl(num) {
        assert(this.red, 'redShl works only with red numbers');
        return this.red.shl(this, num);
    };
    BN.prototype.redMul = function redMul(num) {
        assert(this.red, 'redMul works only with red numbers');
        this.red._verify2(this, num);
        return this.red.mul(this, num);
    };
    BN.prototype.redIMul = function redIMul(num) {
        assert(this.red, 'redMul works only with red numbers');
        this.red._verify2(this, num);
        return this.red.imul(this, num);
    };
    BN.prototype.redSqr = function redSqr() {
        assert(this.red, 'redSqr works only with red numbers');
        this.red._verify1(this);
        return this.red.sqr(this);
    };
    BN.prototype.redISqr = function redISqr() {
        assert(this.red, 'redISqr works only with red numbers');
        this.red._verify1(this);
        return this.red.isqr(this);
    };
    // Square root over p
    BN.prototype.redSqrt = function redSqrt() {
        assert(this.red, 'redSqrt works only with red numbers');
        this.red._verify1(this);
        return this.red.sqrt(this);
    };
    BN.prototype.redInvm = function redInvm() {
        assert(this.red, 'redInvm works only with red numbers');
        this.red._verify1(this);
        return this.red.invm(this);
    };
    // Return negative clone of `this` % `red modulo`
    BN.prototype.redNeg = function redNeg() {
        assert(this.red, 'redNeg works only with red numbers');
        this.red._verify1(this);
        return this.red.neg(this);
    };
    BN.prototype.redPow = function redPow(num) {
        assert(this.red && !num.red, 'redPow(normalNum)');
        this.red._verify1(this);
        return this.red.pow(this, num);
    };
    // Prime numbers with efficient reduction
    var primes = {
        k256: null,
        p224: null,
        p192: null,
        p25519: null
    };
    // Pseudo-Mersenne prime
    function MPrime(name, p) {
        // P = 2 ^ N - K
        this.name = name;
        this.p = new BN(p, 16);
        this.n = this.p.bitLength();
        this.k = new BN(1).iushln(this.n).isub(this.p);
        this.tmp = this._tmp();
    }
    MPrime.prototype._tmp = function _tmp() {
        var tmp = new BN(null);
        tmp.words = new Array(Math.ceil(this.n / 13));
        return tmp;
    };
    MPrime.prototype.ireduce = function ireduce(num) {
        // Assumes that `num` is less than `P^2`
        // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
        var r = num;
        var rlen;
        do {
            this.split(r, this.tmp);
            r = this.imulK(r);
            r = r.iadd(this.tmp);
            rlen = r.bitLength();
        }while (rlen > this.n)
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0) {
            r.words[0] = 0;
            r.length = 1;
        } else if (cmp > 0) {
            r.isub(this.p);
        } else {
            if (r.strip !== undefined) {
                // r is BN v4 instance
                r.strip();
            } else {
                // r is BN v5 instance
                r._strip();
            }
        }
        return r;
    };
    MPrime.prototype.split = function split(input, out) {
        input.iushrn(this.n, 0, out);
    };
    MPrime.prototype.imulK = function imulK(num) {
        return num.imul(this.k);
    };
    function K256() {
        MPrime.call(this, 'k256', 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
    }
    inherits(K256, MPrime);
    K256.prototype.split = function split(input, output) {
        // 256 = 9 * 26 + 22
        var mask = 0x3fffff;
        var outLen = Math.min(input.length, 9);
        for(var i = 0; i < outLen; i++){
            output.words[i] = input.words[i];
        }
        output.length = outLen;
        if (input.length <= 9) {
            input.words[0] = 0;
            input.length = 1;
            return;
        }
        // Shift by 9 limbs
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;
        for(i = 10; i < input.length; i++){
            var next = input.words[i] | 0;
            input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
            prev = next;
        }
        prev >>>= 22;
        input.words[i - 10] = prev;
        if (prev === 0 && input.length > 10) {
            input.length -= 10;
        } else {
            input.length -= 9;
        }
    };
    K256.prototype.imulK = function imulK(num) {
        // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
        num.words[num.length] = 0;
        num.words[num.length + 1] = 0;
        num.length += 2;
        // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
        var lo = 0;
        for(var i = 0; i < num.length; i++){
            var w = num.words[i] | 0;
            lo += w * 0x3d1;
            num.words[i] = lo & 0x3ffffff;
            lo = w * 0x40 + (lo / 0x4000000 | 0);
        }
        // Fast length reduction
        if (num.words[num.length - 1] === 0) {
            num.length--;
            if (num.words[num.length - 1] === 0) {
                num.length--;
            }
        }
        return num;
    };
    function P224() {
        MPrime.call(this, 'p224', 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
    }
    inherits(P224, MPrime);
    function P192() {
        MPrime.call(this, 'p192', 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
    }
    inherits(P192, MPrime);
    function P25519() {
        // 2 ^ 255 - 19
        MPrime.call(this, '25519', '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
    }
    inherits(P25519, MPrime);
    P25519.prototype.imulK = function imulK(num) {
        // K = 0x13
        var carry = 0;
        for(var i = 0; i < num.length; i++){
            var hi = (num.words[i] | 0) * 0x13 + carry;
            var lo = hi & 0x3ffffff;
            hi >>>= 26;
            num.words[i] = lo;
            carry = hi;
        }
        if (carry !== 0) {
            num.words[num.length++] = carry;
        }
        return num;
    };
    // Exported mostly for testing purposes, use plain name instead
    BN._prime = function prime(name) {
        // Cached version of prime
        if (primes[name]) return primes[name];
        var prime;
        if (name === 'k256') {
            prime = new K256();
        } else if (name === 'p224') {
            prime = new P224();
        } else if (name === 'p192') {
            prime = new P192();
        } else if (name === 'p25519') {
            prime = new P25519();
        } else {
            throw new Error('Unknown prime ' + name);
        }
        primes[name] = prime;
        return prime;
    };
    //
    // Base reduction engine
    //
    function Red(m) {
        if (typeof m === 'string') {
            var prime = BN._prime(m);
            this.m = prime.p;
            this.prime = prime;
        } else {
            assert(m.gtn(1), 'modulus must be greater than 1');
            this.m = m;
            this.prime = null;
        }
    }
    Red.prototype._verify1 = function _verify1(a) {
        assert(a.negative === 0, 'red works only with positives');
        assert(a.red, 'red works only with red numbers');
    };
    Red.prototype._verify2 = function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, 'red works only with positives');
        assert(a.red && a.red === b.red, 'red works only with red numbers');
    };
    Red.prototype.imod = function imod(a) {
        if (this.prime) return this.prime.ireduce(a)._forceRed(this);
        return a.umod(this.m)._forceRed(this);
    };
    Red.prototype.neg = function neg(a) {
        if (a.isZero()) {
            return a.clone();
        }
        return this.m.sub(a)._forceRed(this);
    };
    Red.prototype.add = function add(a, b) {
        this._verify2(a, b);
        var res = a.add(b);
        if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
        }
        return res._forceRed(this);
    };
    Red.prototype.iadd = function iadd(a, b) {
        this._verify2(a, b);
        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
        }
        return res;
    };
    Red.prototype.sub = function sub(a, b) {
        this._verify2(a, b);
        var res = a.sub(b);
        if (res.cmpn(0) < 0) {
            res.iadd(this.m);
        }
        return res._forceRed(this);
    };
    Red.prototype.isub = function isub(a, b) {
        this._verify2(a, b);
        var res = a.isub(b);
        if (res.cmpn(0) < 0) {
            res.iadd(this.m);
        }
        return res;
    };
    Red.prototype.shl = function shl(a, num) {
        this._verify1(a);
        return this.imod(a.ushln(num));
    };
    Red.prototype.imul = function imul(a, b) {
        this._verify2(a, b);
        return this.imod(a.imul(b));
    };
    Red.prototype.mul = function mul(a, b) {
        this._verify2(a, b);
        return this.imod(a.mul(b));
    };
    Red.prototype.isqr = function isqr(a) {
        return this.imul(a, a.clone());
    };
    Red.prototype.sqr = function sqr(a) {
        return this.mul(a, a);
    };
    Red.prototype.sqrt = function sqrt(a) {
        if (a.isZero()) return a.clone();
        var mod3 = this.m.andln(3);
        assert(mod3 % 2 === 1);
        // Fast case
        if (mod3 === 3) {
            var pow = this.m.add(new BN(1)).iushrn(2);
            return this.pow(a, pow);
        }
        // Tonelli-Shanks algorithm (Totally unoptimized and slow)
        //
        // Find Q and S, that Q * 2 ^ S = (P - 1)
        var q = this.m.subn(1);
        var s = 0;
        while(!q.isZero() && q.andln(1) === 0){
            s++;
            q.iushrn(1);
        }
        assert(!q.isZero());
        var one = new BN(1).toRed(this);
        var nOne = one.redNeg();
        // Find quadratic non-residue
        // NOTE: Max is such because of generalized Riemann hypothesis.
        var lpow = this.m.subn(1).iushrn(1);
        var z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);
        while(this.pow(z, lpow).cmp(nOne) !== 0){
            z.redIAdd(nOne);
        }
        var c = this.pow(z, q);
        var r = this.pow(a, q.addn(1).iushrn(1));
        var t = this.pow(a, q);
        var m = s;
        while(t.cmp(one) !== 0){
            var tmp = t;
            for(var i = 0; tmp.cmp(one) !== 0; i++){
                tmp = tmp.redSqr();
            }
            assert(i < m);
            var b = this.pow(c, new BN(1).iushln(m - i - 1));
            r = r.redMul(b);
            c = b.redSqr();
            t = t.redMul(c);
            m = i;
        }
        return r;
    };
    Red.prototype.invm = function invm(a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0) {
            inv.negative = 0;
            return this.imod(inv).redNeg();
        } else {
            return this.imod(inv);
        }
    };
    Red.prototype.pow = function pow(a, num) {
        if (num.isZero()) return new BN(1).toRed(this);
        if (num.cmpn(1) === 0) return a.clone();
        var windowSize = 4;
        var wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this);
        wnd[1] = a;
        for(var i = 2; i < wnd.length; i++){
            wnd[i] = this.mul(wnd[i - 1], a);
        }
        var res = wnd[0];
        var current = 0;
        var currentLen = 0;
        var start = num.bitLength() % 26;
        if (start === 0) {
            start = 26;
        }
        for(i = num.length - 1; i >= 0; i--){
            var word = num.words[i];
            for(var j = start - 1; j >= 0; j--){
                var bit = word >> j & 1;
                if (res !== wnd[0]) {
                    res = this.sqr(res);
                }
                if (bit === 0 && current === 0) {
                    currentLen = 0;
                    continue;
                }
                current <<= 1;
                current |= bit;
                currentLen++;
                if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;
                res = this.mul(res, wnd[current]);
                currentLen = 0;
                current = 0;
            }
            start = 26;
        }
        return res;
    };
    Red.prototype.convertTo = function convertTo(num) {
        var r = num.umod(this.m);
        return r === num ? r.clone() : r;
    };
    Red.prototype.convertFrom = function convertFrom(num) {
        var res = num.clone();
        res.red = null;
        return res;
    };
    //
    // Montgomery method engine
    //
    BN.mont = function mont(num) {
        return new Mont(num);
    };
    function Mont(m) {
        Red.call(this, m);
        this.shift = this.m.bitLength();
        if (this.shift % 26 !== 0) {
            this.shift += 26 - this.shift % 26;
        }
        this.r = new BN(1).iushln(this.shift);
        this.r2 = this.imod(this.r.sqr());
        this.rinv = this.r._invmp(this.m);
        this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
        this.minv = this.minv.umod(this.r);
        this.minv = this.r.sub(this.minv);
    }
    inherits(Mont, Red);
    Mont.prototype.convertTo = function convertTo(num) {
        return this.imod(num.ushln(this.shift));
    };
    Mont.prototype.convertFrom = function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv));
        r.red = null;
        return r;
    };
    Mont.prototype.imul = function imul(a, b) {
        if (a.isZero() || b.isZero()) {
            a.words[0] = 0;
            a.length = 1;
            return a;
        }
        var t = a.imul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
        }
        return res._forceRed(this);
    };
    Mont.prototype.mul = function mul(a, b) {
        if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);
        var t = a.mul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
        }
        return res._forceRed(this);
    };
    Mont.prototype.invm = function invm(a) {
        // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
    };
})(("TURBOPACK compile-time value", "object") === 'undefined' || module, /*TURBOPACK member replacement*/ __turbopack_context__.e);
}),
"[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
                constructor: {
                    value: ctor,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });
        }
    };
} else {
    // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {};
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
        }
    };
}
}),
"[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

try {
    var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
    /* istanbul ignore next */ if (typeof util.inherits !== 'function') throw '';
    module.exports = util.inherits;
} catch (e) {
    /* istanbul ignore next */ module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js [app-route] (ecmascript)");
}
}),
"[project]/node_modules/.pnpm/safer-buffer@2.1.2/node_modules/safer-buffer/safer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable node/no-deprecated-api */ var buffer = __turbopack_context__.r("[externals]/buffer [external] (buffer, cjs)");
var Buffer = buffer.Buffer;
var safer = {};
var key;
for(key in buffer){
    if (!buffer.hasOwnProperty(key)) continue;
    if (key === 'SlowBuffer' || key === 'Buffer') continue;
    safer[key] = buffer[key];
}
var Safer = safer.Buffer = {};
for(key in Buffer){
    if (!Buffer.hasOwnProperty(key)) continue;
    if (key === 'allocUnsafe' || key === 'allocUnsafeSlow') continue;
    Safer[key] = Buffer[key];
}
safer.Buffer.prototype = Buffer.prototype;
if (!Safer.from || Safer.from === Uint8Array.from) {
    Safer.from = function(value, encodingOrOffset, length) {
        if (typeof value === 'number') {
            throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof value);
        }
        if (value && typeof value.length === 'undefined') {
            throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' + typeof value);
        }
        return Buffer(value, encodingOrOffset, length);
    };
}
if (!Safer.alloc) {
    Safer.alloc = function(size, fill, encoding) {
        if (typeof size !== 'number') {
            throw new TypeError('The "size" argument must be of type number. Received type ' + typeof size);
        }
        if (size < 0 || size >= 2 * (1 << 30)) {
            throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
        var buf = Buffer(size);
        if (!fill || fill.length === 0) {
            buf.fill(0);
        } else if (typeof encoding === 'string') {
            buf.fill(fill, encoding);
        } else {
            buf.fill(fill);
        }
        return buf;
    };
}
if (!safer.kStringMaxLength) {
    try {
        safer.kStringMaxLength = process.binding('buffer').kStringMaxLength;
    } catch (e) {
    // we can't determine kStringMaxLength in environments where process.binding
    // is unsupported, so let's not set it
    }
}
if (!safer.constants) {
    safer.constants = {
        MAX_LENGTH: safer.kMaxLength
    };
    if (safer.kStringMaxLength) {
        safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength;
    }
}
module.exports = safer;
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/reporter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const inherits = __turbopack_context__.r("[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js [app-route] (ecmascript)");
function Reporter(options) {
    this._reporterState = {
        obj: null,
        path: [],
        options: options || {},
        errors: []
    };
}
exports.Reporter = Reporter;
Reporter.prototype.isError = function isError(obj) {
    return obj instanceof ReporterError;
};
Reporter.prototype.save = function save() {
    const state = this._reporterState;
    return {
        obj: state.obj,
        pathLen: state.path.length
    };
};
Reporter.prototype.restore = function restore(data) {
    const state = this._reporterState;
    state.obj = data.obj;
    state.path = state.path.slice(0, data.pathLen);
};
Reporter.prototype.enterKey = function enterKey(key) {
    return this._reporterState.path.push(key);
};
Reporter.prototype.exitKey = function exitKey(index) {
    const state = this._reporterState;
    state.path = state.path.slice(0, index - 1);
};
Reporter.prototype.leaveKey = function leaveKey(index, key, value) {
    const state = this._reporterState;
    this.exitKey(index);
    if (state.obj !== null) state.obj[key] = value;
};
Reporter.prototype.path = function path() {
    return this._reporterState.path.join('/');
};
Reporter.prototype.enterObject = function enterObject() {
    const state = this._reporterState;
    const prev = state.obj;
    state.obj = {};
    return prev;
};
Reporter.prototype.leaveObject = function leaveObject(prev) {
    const state = this._reporterState;
    const now = state.obj;
    state.obj = prev;
    return now;
};
Reporter.prototype.error = function error(msg) {
    let err;
    const state = this._reporterState;
    const inherited = msg instanceof ReporterError;
    if (inherited) {
        err = msg;
    } else {
        err = new ReporterError(state.path.map(function(elem) {
            return '[' + JSON.stringify(elem) + ']';
        }).join(''), msg.message || msg, msg.stack);
    }
    if (!state.options.partial) throw err;
    if (!inherited) state.errors.push(err);
    return err;
};
Reporter.prototype.wrapResult = function wrapResult(result) {
    const state = this._reporterState;
    if (!state.options.partial) return result;
    return {
        result: this.isError(result) ? null : result,
        errors: state.errors
    };
};
function ReporterError(path, msg) {
    this.path = path;
    this.rethrow(msg);
}
inherits(ReporterError, Error);
ReporterError.prototype.rethrow = function rethrow(msg) {
    this.message = msg + ' at: ' + (this.path || '(shallow)');
    if (Error.captureStackTrace) Error.captureStackTrace(this, ReporterError);
    if (!this.stack) {
        try {
            // IE only adds stack when thrown
            throw new Error(this.message);
        } catch (e) {
            this.stack = e.stack;
        }
    }
    return this;
};
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/buffer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const inherits = __turbopack_context__.r("[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js [app-route] (ecmascript)");
const Reporter = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/reporter.js [app-route] (ecmascript)").Reporter;
const Buffer = __turbopack_context__.r("[project]/node_modules/.pnpm/safer-buffer@2.1.2/node_modules/safer-buffer/safer.js [app-route] (ecmascript)").Buffer;
function DecoderBuffer(base, options) {
    Reporter.call(this, options);
    if (!Buffer.isBuffer(base)) {
        this.error('Input not Buffer');
        return;
    }
    this.base = base;
    this.offset = 0;
    this.length = base.length;
}
inherits(DecoderBuffer, Reporter);
exports.DecoderBuffer = DecoderBuffer;
DecoderBuffer.isDecoderBuffer = function isDecoderBuffer(data) {
    if (data instanceof DecoderBuffer) {
        return true;
    }
    // Or accept compatible API
    const isCompatible = typeof data === 'object' && Buffer.isBuffer(data.base) && data.constructor.name === 'DecoderBuffer' && typeof data.offset === 'number' && typeof data.length === 'number' && typeof data.save === 'function' && typeof data.restore === 'function' && typeof data.isEmpty === 'function' && typeof data.readUInt8 === 'function' && typeof data.skip === 'function' && typeof data.raw === 'function';
    return isCompatible;
};
DecoderBuffer.prototype.save = function save() {
    return {
        offset: this.offset,
        reporter: Reporter.prototype.save.call(this)
    };
};
DecoderBuffer.prototype.restore = function restore(save) {
    // Return skipped data
    const res = new DecoderBuffer(this.base);
    res.offset = save.offset;
    res.length = this.offset;
    this.offset = save.offset;
    Reporter.prototype.restore.call(this, save.reporter);
    return res;
};
DecoderBuffer.prototype.isEmpty = function isEmpty() {
    return this.offset === this.length;
};
DecoderBuffer.prototype.readUInt8 = function readUInt8(fail) {
    if (this.offset + 1 <= this.length) return this.base.readUInt8(this.offset++, true);
    else return this.error(fail || 'DecoderBuffer overrun');
};
DecoderBuffer.prototype.skip = function skip(bytes, fail) {
    if (!(this.offset + bytes <= this.length)) return this.error(fail || 'DecoderBuffer overrun');
    const res = new DecoderBuffer(this.base);
    // Share reporter state
    res._reporterState = this._reporterState;
    res.offset = this.offset;
    res.length = this.offset + bytes;
    this.offset += bytes;
    return res;
};
DecoderBuffer.prototype.raw = function raw(save) {
    return this.base.slice(save ? save.offset : this.offset, this.length);
};
function EncoderBuffer(value, reporter) {
    if (Array.isArray(value)) {
        this.length = 0;
        this.value = value.map(function(item) {
            if (!EncoderBuffer.isEncoderBuffer(item)) item = new EncoderBuffer(item, reporter);
            this.length += item.length;
            return item;
        }, this);
    } else if (typeof value === 'number') {
        if (!(0 <= value && value <= 0xff)) return reporter.error('non-byte EncoderBuffer value');
        this.value = value;
        this.length = 1;
    } else if (typeof value === 'string') {
        this.value = value;
        this.length = Buffer.byteLength(value);
    } else if (Buffer.isBuffer(value)) {
        this.value = value;
        this.length = value.length;
    } else {
        return reporter.error('Unsupported type: ' + typeof value);
    }
}
exports.EncoderBuffer = EncoderBuffer;
EncoderBuffer.isEncoderBuffer = function isEncoderBuffer(data) {
    if (data instanceof EncoderBuffer) {
        return true;
    }
    // Or accept compatible API
    const isCompatible = typeof data === 'object' && data.constructor.name === 'EncoderBuffer' && typeof data.length === 'number' && typeof data.join === 'function';
    return isCompatible;
};
EncoderBuffer.prototype.join = function join(out, offset) {
    if (!out) out = Buffer.alloc(this.length);
    if (!offset) offset = 0;
    if (this.length === 0) return out;
    if (Array.isArray(this.value)) {
        this.value.forEach(function(item) {
            item.join(out, offset);
            offset += item.length;
        });
    } else {
        if (typeof this.value === 'number') out[offset] = this.value;
        else if (typeof this.value === 'string') out.write(this.value, offset);
        else if (Buffer.isBuffer(this.value)) this.value.copy(out, offset);
        offset += this.length;
    }
    return out;
};
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/node.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Reporter = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/reporter.js [app-route] (ecmascript)").Reporter;
const EncoderBuffer = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/buffer.js [app-route] (ecmascript)").EncoderBuffer;
const DecoderBuffer = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/buffer.js [app-route] (ecmascript)").DecoderBuffer;
const assert = __turbopack_context__.r("[project]/node_modules/.pnpm/minimalistic-assert@1.0.1/node_modules/minimalistic-assert/index.js [app-route] (ecmascript)");
// Supported tags
const tags = [
    'seq',
    'seqof',
    'set',
    'setof',
    'objid',
    'bool',
    'gentime',
    'utctime',
    'null_',
    'enum',
    'int',
    'objDesc',
    'bitstr',
    'bmpstr',
    'charstr',
    'genstr',
    'graphstr',
    'ia5str',
    'iso646str',
    'numstr',
    'octstr',
    'printstr',
    't61str',
    'unistr',
    'utf8str',
    'videostr'
];
// Public methods list
const methods = [
    'key',
    'obj',
    'use',
    'optional',
    'explicit',
    'implicit',
    'def',
    'choice',
    'any',
    'contains'
].concat(tags);
// Overrided methods list
const overrided = [
    '_peekTag',
    '_decodeTag',
    '_use',
    '_decodeStr',
    '_decodeObjid',
    '_decodeTime',
    '_decodeNull',
    '_decodeInt',
    '_decodeBool',
    '_decodeList',
    '_encodeComposite',
    '_encodeStr',
    '_encodeObjid',
    '_encodeTime',
    '_encodeNull',
    '_encodeInt',
    '_encodeBool'
];
function Node(enc, parent, name) {
    const state = {};
    this._baseState = state;
    state.name = name;
    state.enc = enc;
    state.parent = parent || null;
    state.children = null;
    // State
    state.tag = null;
    state.args = null;
    state.reverseArgs = null;
    state.choice = null;
    state.optional = false;
    state.any = false;
    state.obj = false;
    state.use = null;
    state.useDecoder = null;
    state.key = null;
    state['default'] = null;
    state.explicit = null;
    state.implicit = null;
    state.contains = null;
    // Should create new instance on each method
    if (!state.parent) {
        state.children = [];
        this._wrap();
    }
}
module.exports = Node;
const stateProps = [
    'enc',
    'parent',
    'children',
    'tag',
    'args',
    'reverseArgs',
    'choice',
    'optional',
    'any',
    'obj',
    'use',
    'alteredUse',
    'key',
    'default',
    'explicit',
    'implicit',
    'contains'
];
Node.prototype.clone = function clone() {
    const state = this._baseState;
    const cstate = {};
    stateProps.forEach(function(prop) {
        cstate[prop] = state[prop];
    });
    const res = new this.constructor(cstate.parent);
    res._baseState = cstate;
    return res;
};
Node.prototype._wrap = function wrap() {
    const state = this._baseState;
    methods.forEach(function(method) {
        this[method] = function _wrappedMethod() {
            const clone = new this.constructor(this);
            state.children.push(clone);
            return clone[method].apply(clone, arguments);
        };
    }, this);
};
Node.prototype._init = function init(body) {
    const state = this._baseState;
    assert(state.parent === null);
    body.call(this);
    // Filter children
    state.children = state.children.filter(function(child) {
        return child._baseState.parent === this;
    }, this);
    assert.equal(state.children.length, 1, 'Root node can have only one child');
};
Node.prototype._useArgs = function useArgs(args) {
    const state = this._baseState;
    // Filter children and args
    const children = args.filter(function(arg) {
        return arg instanceof this.constructor;
    }, this);
    args = args.filter(function(arg) {
        return !(arg instanceof this.constructor);
    }, this);
    if (children.length !== 0) {
        assert(state.children === null);
        state.children = children;
        // Replace parent to maintain backward link
        children.forEach(function(child) {
            child._baseState.parent = this;
        }, this);
    }
    if (args.length !== 0) {
        assert(state.args === null);
        state.args = args;
        state.reverseArgs = args.map(function(arg) {
            if (typeof arg !== 'object' || arg.constructor !== Object) return arg;
            const res = {};
            Object.keys(arg).forEach(function(key) {
                if (key == (key | 0)) key |= 0;
                const value = arg[key];
                res[value] = key;
            });
            return res;
        });
    }
};
//
// Overrided methods
//
overrided.forEach(function(method) {
    Node.prototype[method] = function _overrided() {
        const state = this._baseState;
        throw new Error(method + ' not implemented for encoding: ' + state.enc);
    };
});
//
// Public methods
//
tags.forEach(function(tag) {
    Node.prototype[tag] = function _tagMethod() {
        const state = this._baseState;
        const args = Array.prototype.slice.call(arguments);
        assert(state.tag === null);
        state.tag = tag;
        this._useArgs(args);
        return this;
    };
});
Node.prototype.use = function use(item) {
    assert(item);
    const state = this._baseState;
    assert(state.use === null);
    state.use = item;
    return this;
};
Node.prototype.optional = function optional() {
    const state = this._baseState;
    state.optional = true;
    return this;
};
Node.prototype.def = function def(val) {
    const state = this._baseState;
    assert(state['default'] === null);
    state['default'] = val;
    state.optional = true;
    return this;
};
Node.prototype.explicit = function explicit(num) {
    const state = this._baseState;
    assert(state.explicit === null && state.implicit === null);
    state.explicit = num;
    return this;
};
Node.prototype.implicit = function implicit(num) {
    const state = this._baseState;
    assert(state.explicit === null && state.implicit === null);
    state.implicit = num;
    return this;
};
Node.prototype.obj = function obj() {
    const state = this._baseState;
    const args = Array.prototype.slice.call(arguments);
    state.obj = true;
    if (args.length !== 0) this._useArgs(args);
    return this;
};
Node.prototype.key = function key(newKey) {
    const state = this._baseState;
    assert(state.key === null);
    state.key = newKey;
    return this;
};
Node.prototype.any = function any() {
    const state = this._baseState;
    state.any = true;
    return this;
};
Node.prototype.choice = function choice(obj) {
    const state = this._baseState;
    assert(state.choice === null);
    state.choice = obj;
    this._useArgs(Object.keys(obj).map(function(key) {
        return obj[key];
    }));
    return this;
};
Node.prototype.contains = function contains(item) {
    const state = this._baseState;
    assert(state.use === null);
    state.contains = item;
    return this;
};
//
// Decoding
//
Node.prototype._decode = function decode(input, options) {
    const state = this._baseState;
    // Decode root node
    if (state.parent === null) return input.wrapResult(state.children[0]._decode(input, options));
    let result = state['default'];
    let present = true;
    let prevKey = null;
    if (state.key !== null) prevKey = input.enterKey(state.key);
    // Check if tag is there
    if (state.optional) {
        let tag = null;
        if (state.explicit !== null) tag = state.explicit;
        else if (state.implicit !== null) tag = state.implicit;
        else if (state.tag !== null) tag = state.tag;
        if (tag === null && !state.any) {
            // Trial and Error
            const save = input.save();
            try {
                if (state.choice === null) this._decodeGeneric(state.tag, input, options);
                else this._decodeChoice(input, options);
                present = true;
            } catch (e) {
                present = false;
            }
            input.restore(save);
        } else {
            present = this._peekTag(input, tag, state.any);
            if (input.isError(present)) return present;
        }
    }
    // Push object on stack
    let prevObj;
    if (state.obj && present) prevObj = input.enterObject();
    if (present) {
        // Unwrap explicit values
        if (state.explicit !== null) {
            const explicit = this._decodeTag(input, state.explicit);
            if (input.isError(explicit)) return explicit;
            input = explicit;
        }
        const start = input.offset;
        // Unwrap implicit and normal values
        if (state.use === null && state.choice === null) {
            let save;
            if (state.any) save = input.save();
            const body = this._decodeTag(input, state.implicit !== null ? state.implicit : state.tag, state.any);
            if (input.isError(body)) return body;
            if (state.any) result = input.raw(save);
            else input = body;
        }
        if (options && options.track && state.tag !== null) options.track(input.path(), start, input.length, 'tagged');
        if (options && options.track && state.tag !== null) options.track(input.path(), input.offset, input.length, 'content');
        // Select proper method for tag
        if (state.any) {
        // no-op
        } else if (state.choice === null) {
            result = this._decodeGeneric(state.tag, input, options);
        } else {
            result = this._decodeChoice(input, options);
        }
        if (input.isError(result)) return result;
        // Decode children
        if (!state.any && state.choice === null && state.children !== null) {
            state.children.forEach(function decodeChildren(child) {
                // NOTE: We are ignoring errors here, to let parser continue with other
                // parts of encoded data
                child._decode(input, options);
            });
        }
        // Decode contained/encoded by schema, only in bit or octet strings
        if (state.contains && (state.tag === 'octstr' || state.tag === 'bitstr')) {
            const data = new DecoderBuffer(result);
            result = this._getUse(state.contains, input._reporterState.obj)._decode(data, options);
        }
    }
    // Pop object
    if (state.obj && present) result = input.leaveObject(prevObj);
    // Set key
    if (state.key !== null && (result !== null || present === true)) input.leaveKey(prevKey, state.key, result);
    else if (prevKey !== null) input.exitKey(prevKey);
    return result;
};
Node.prototype._decodeGeneric = function decodeGeneric(tag, input, options) {
    const state = this._baseState;
    if (tag === 'seq' || tag === 'set') return null;
    if (tag === 'seqof' || tag === 'setof') return this._decodeList(input, tag, state.args[0], options);
    else if (/str$/.test(tag)) return this._decodeStr(input, tag, options);
    else if (tag === 'objid' && state.args) return this._decodeObjid(input, state.args[0], state.args[1], options);
    else if (tag === 'objid') return this._decodeObjid(input, null, null, options);
    else if (tag === 'gentime' || tag === 'utctime') return this._decodeTime(input, tag, options);
    else if (tag === 'null_') return this._decodeNull(input, options);
    else if (tag === 'bool') return this._decodeBool(input, options);
    else if (tag === 'objDesc') return this._decodeStr(input, tag, options);
    else if (tag === 'int' || tag === 'enum') return this._decodeInt(input, state.args && state.args[0], options);
    if (state.use !== null) {
        return this._getUse(state.use, input._reporterState.obj)._decode(input, options);
    } else {
        return input.error('unknown tag: ' + tag);
    }
};
Node.prototype._getUse = function _getUse(entity, obj) {
    const state = this._baseState;
    // Create altered use decoder if implicit is set
    state.useDecoder = this._use(entity, obj);
    assert(state.useDecoder._baseState.parent === null);
    state.useDecoder = state.useDecoder._baseState.children[0];
    if (state.implicit !== state.useDecoder._baseState.implicit) {
        state.useDecoder = state.useDecoder.clone();
        state.useDecoder._baseState.implicit = state.implicit;
    }
    return state.useDecoder;
};
Node.prototype._decodeChoice = function decodeChoice(input, options) {
    const state = this._baseState;
    let result = null;
    let match = false;
    Object.keys(state.choice).some(function(key) {
        const save = input.save();
        const node = state.choice[key];
        try {
            const value = node._decode(input, options);
            if (input.isError(value)) return false;
            result = {
                type: key,
                value: value
            };
            match = true;
        } catch (e) {
            input.restore(save);
            return false;
        }
        return true;
    }, this);
    if (!match) return input.error('Choice not matched');
    return result;
};
//
// Encoding
//
Node.prototype._createEncoderBuffer = function createEncoderBuffer(data) {
    return new EncoderBuffer(data, this.reporter);
};
Node.prototype._encode = function encode(data, reporter, parent) {
    const state = this._baseState;
    if (state['default'] !== null && state['default'] === data) return;
    const result = this._encodeValue(data, reporter, parent);
    if (result === undefined) return;
    if (this._skipDefault(result, reporter, parent)) return;
    return result;
};
Node.prototype._encodeValue = function encode(data, reporter, parent) {
    const state = this._baseState;
    // Decode root node
    if (state.parent === null) return state.children[0]._encode(data, reporter || new Reporter());
    let result = null;
    // Set reporter to share it with a child class
    this.reporter = reporter;
    // Check if data is there
    if (state.optional && data === undefined) {
        if (state['default'] !== null) data = state['default'];
        else return;
    }
    // Encode children first
    let content = null;
    let primitive = false;
    if (state.any) {
        // Anything that was given is translated to buffer
        result = this._createEncoderBuffer(data);
    } else if (state.choice) {
        result = this._encodeChoice(data, reporter);
    } else if (state.contains) {
        content = this._getUse(state.contains, parent)._encode(data, reporter);
        primitive = true;
    } else if (state.children) {
        content = state.children.map(function(child) {
            if (child._baseState.tag === 'null_') return child._encode(null, reporter, data);
            if (child._baseState.key === null) return reporter.error('Child should have a key');
            const prevKey = reporter.enterKey(child._baseState.key);
            if (typeof data !== 'object') return reporter.error('Child expected, but input is not object');
            const res = child._encode(data[child._baseState.key], reporter, data);
            reporter.leaveKey(prevKey);
            return res;
        }, this).filter(function(child) {
            return child;
        });
        content = this._createEncoderBuffer(content);
    } else {
        if (state.tag === 'seqof' || state.tag === 'setof') {
            // TODO(indutny): this should be thrown on DSL level
            if (!(state.args && state.args.length === 1)) return reporter.error('Too many args for : ' + state.tag);
            if (!Array.isArray(data)) return reporter.error('seqof/setof, but data is not Array');
            const child = this.clone();
            child._baseState.implicit = null;
            content = this._createEncoderBuffer(data.map(function(item) {
                const state = this._baseState;
                return this._getUse(state.args[0], data)._encode(item, reporter);
            }, child));
        } else if (state.use !== null) {
            result = this._getUse(state.use, parent)._encode(data, reporter);
        } else {
            content = this._encodePrimitive(state.tag, data);
            primitive = true;
        }
    }
    // Encode data itself
    if (!state.any && state.choice === null) {
        const tag = state.implicit !== null ? state.implicit : state.tag;
        const cls = state.implicit === null ? 'universal' : 'context';
        if (tag === null) {
            if (state.use === null) reporter.error('Tag could be omitted only for .use()');
        } else {
            if (state.use === null) result = this._encodeComposite(tag, primitive, cls, content);
        }
    }
    // Wrap in explicit
    if (state.explicit !== null) result = this._encodeComposite(state.explicit, false, 'context', result);
    return result;
};
Node.prototype._encodeChoice = function encodeChoice(data, reporter) {
    const state = this._baseState;
    const node = state.choice[data.type];
    if (!node) {
        assert(false, data.type + ' not found in ' + JSON.stringify(Object.keys(state.choice)));
    }
    return node._encode(data.value, reporter);
};
Node.prototype._encodePrimitive = function encodePrimitive(tag, data) {
    const state = this._baseState;
    if (/str$/.test(tag)) return this._encodeStr(data, tag);
    else if (tag === 'objid' && state.args) return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
    else if (tag === 'objid') return this._encodeObjid(data, null, null);
    else if (tag === 'gentime' || tag === 'utctime') return this._encodeTime(data, tag);
    else if (tag === 'null_') return this._encodeNull();
    else if (tag === 'int' || tag === 'enum') return this._encodeInt(data, state.args && state.reverseArgs[0]);
    else if (tag === 'bool') return this._encodeBool(data);
    else if (tag === 'objDesc') return this._encodeStr(data, tag);
    else throw new Error('Unsupported tag: ' + tag);
};
Node.prototype._isNumstr = function isNumstr(str) {
    return /^[0-9 ]*$/.test(str);
};
Node.prototype._isPrintstr = function isPrintstr(str) {
    return /^[A-Za-z0-9 '()+,-./:=?]*$/.test(str);
};
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/der.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// Helper
function reverse(map) {
    const res = {};
    Object.keys(map).forEach(function(key) {
        // Convert key to integer if it is stringified
        if ((key | 0) == key) key = key | 0;
        const value = map[key];
        res[value] = key;
    });
    return res;
}
exports.tagClass = {
    0: 'universal',
    1: 'application',
    2: 'context',
    3: 'private'
};
exports.tagClassByName = reverse(exports.tagClass);
exports.tag = {
    0x00: 'end',
    0x01: 'bool',
    0x02: 'int',
    0x03: 'bitstr',
    0x04: 'octstr',
    0x05: 'null_',
    0x06: 'objid',
    0x07: 'objDesc',
    0x08: 'external',
    0x09: 'real',
    0x0a: 'enum',
    0x0b: 'embed',
    0x0c: 'utf8str',
    0x0d: 'relativeOid',
    0x10: 'seq',
    0x11: 'set',
    0x12: 'numstr',
    0x13: 'printstr',
    0x14: 't61str',
    0x15: 'videostr',
    0x16: 'ia5str',
    0x17: 'utctime',
    0x18: 'gentime',
    0x19: 'graphstr',
    0x1a: 'iso646str',
    0x1b: 'genstr',
    0x1c: 'unistr',
    0x1d: 'charstr',
    0x1e: 'bmpstr'
};
exports.tagByName = reverse(exports.tag);
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/der.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const inherits = __turbopack_context__.r("[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js [app-route] (ecmascript)");
const Buffer = __turbopack_context__.r("[project]/node_modules/.pnpm/safer-buffer@2.1.2/node_modules/safer-buffer/safer.js [app-route] (ecmascript)").Buffer;
const Node = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/node.js [app-route] (ecmascript)");
// Import DER constants
const der = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/der.js [app-route] (ecmascript)");
function DEREncoder(entity) {
    this.enc = 'der';
    this.name = entity.name;
    this.entity = entity;
    // Construct base tree
    this.tree = new DERNode();
    this.tree._init(entity.body);
}
module.exports = DEREncoder;
DEREncoder.prototype.encode = function encode(data, reporter) {
    return this.tree._encode(data, reporter).join();
};
// Tree methods
function DERNode(parent) {
    Node.call(this, 'der', parent);
}
inherits(DERNode, Node);
DERNode.prototype._encodeComposite = function encodeComposite(tag, primitive, cls, content) {
    const encodedTag = encodeTag(tag, primitive, cls, this.reporter);
    // Short form
    if (content.length < 0x80) {
        const header = Buffer.alloc(2);
        header[0] = encodedTag;
        header[1] = content.length;
        return this._createEncoderBuffer([
            header,
            content
        ]);
    }
    // Long form
    // Count octets required to store length
    let lenOctets = 1;
    for(let i = content.length; i >= 0x100; i >>= 8)lenOctets++;
    const header = Buffer.alloc(1 + 1 + lenOctets);
    header[0] = encodedTag;
    header[1] = 0x80 | lenOctets;
    for(let i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8)header[i] = j & 0xff;
    return this._createEncoderBuffer([
        header,
        content
    ]);
};
DERNode.prototype._encodeStr = function encodeStr(str, tag) {
    if (tag === 'bitstr') {
        return this._createEncoderBuffer([
            str.unused | 0,
            str.data
        ]);
    } else if (tag === 'bmpstr') {
        const buf = Buffer.alloc(str.length * 2);
        for(let i = 0; i < str.length; i++){
            buf.writeUInt16BE(str.charCodeAt(i), i * 2);
        }
        return this._createEncoderBuffer(buf);
    } else if (tag === 'numstr') {
        if (!this._isNumstr(str)) {
            return this.reporter.error('Encoding of string type: numstr supports ' + 'only digits and space');
        }
        return this._createEncoderBuffer(str);
    } else if (tag === 'printstr') {
        if (!this._isPrintstr(str)) {
            return this.reporter.error('Encoding of string type: printstr supports ' + 'only latin upper and lower case letters, ' + 'digits, space, apostrophe, left and rigth ' + 'parenthesis, plus sign, comma, hyphen, ' + 'dot, slash, colon, equal sign, ' + 'question mark');
        }
        return this._createEncoderBuffer(str);
    } else if (/str$/.test(tag)) {
        return this._createEncoderBuffer(str);
    } else if (tag === 'objDesc') {
        return this._createEncoderBuffer(str);
    } else {
        return this.reporter.error('Encoding of string type: ' + tag + ' unsupported');
    }
};
DERNode.prototype._encodeObjid = function encodeObjid(id, values, relative) {
    if (typeof id === 'string') {
        if (!values) return this.reporter.error('string objid given, but no values map found');
        if (!values.hasOwnProperty(id)) return this.reporter.error('objid not found in values map');
        id = values[id].split(/[\s.]+/g);
        for(let i = 0; i < id.length; i++)id[i] |= 0;
    } else if (Array.isArray(id)) {
        id = id.slice();
        for(let i = 0; i < id.length; i++)id[i] |= 0;
    }
    if (!Array.isArray(id)) {
        return this.reporter.error('objid() should be either array or string, ' + 'got: ' + JSON.stringify(id));
    }
    if (!relative) {
        if (id[1] >= 40) return this.reporter.error('Second objid identifier OOB');
        id.splice(0, 2, id[0] * 40 + id[1]);
    }
    // Count number of octets
    let size = 0;
    for(let i = 0; i < id.length; i++){
        let ident = id[i];
        for(size++; ident >= 0x80; ident >>= 7)size++;
    }
    const objid = Buffer.alloc(size);
    let offset = objid.length - 1;
    for(let i = id.length - 1; i >= 0; i--){
        let ident = id[i];
        objid[offset--] = ident & 0x7f;
        while((ident >>= 7) > 0)objid[offset--] = 0x80 | ident & 0x7f;
    }
    return this._createEncoderBuffer(objid);
};
function two(num) {
    if (num < 10) return '0' + num;
    else return num;
}
DERNode.prototype._encodeTime = function encodeTime(time, tag) {
    let str;
    const date = new Date(time);
    if (tag === 'gentime') {
        str = [
            two(date.getUTCFullYear()),
            two(date.getUTCMonth() + 1),
            two(date.getUTCDate()),
            two(date.getUTCHours()),
            two(date.getUTCMinutes()),
            two(date.getUTCSeconds()),
            'Z'
        ].join('');
    } else if (tag === 'utctime') {
        str = [
            two(date.getUTCFullYear() % 100),
            two(date.getUTCMonth() + 1),
            two(date.getUTCDate()),
            two(date.getUTCHours()),
            two(date.getUTCMinutes()),
            two(date.getUTCSeconds()),
            'Z'
        ].join('');
    } else {
        this.reporter.error('Encoding ' + tag + ' time is not supported yet');
    }
    return this._encodeStr(str, 'octstr');
};
DERNode.prototype._encodeNull = function encodeNull() {
    return this._createEncoderBuffer('');
};
DERNode.prototype._encodeInt = function encodeInt(num, values) {
    if (typeof num === 'string') {
        if (!values) return this.reporter.error('String int or enum given, but no values map');
        if (!values.hasOwnProperty(num)) {
            return this.reporter.error('Values map doesn\'t contain: ' + JSON.stringify(num));
        }
        num = values[num];
    }
    // Bignum, assume big endian
    if (typeof num !== 'number' && !Buffer.isBuffer(num)) {
        const numArray = num.toArray();
        if (!num.sign && numArray[0] & 0x80) {
            numArray.unshift(0);
        }
        num = Buffer.from(numArray);
    }
    if (Buffer.isBuffer(num)) {
        let size = num.length;
        if (num.length === 0) size++;
        const out = Buffer.alloc(size);
        num.copy(out);
        if (num.length === 0) out[0] = 0;
        return this._createEncoderBuffer(out);
    }
    if (num < 0x80) return this._createEncoderBuffer(num);
    if (num < 0x100) return this._createEncoderBuffer([
        0,
        num
    ]);
    let size = 1;
    for(let i = num; i >= 0x100; i >>= 8)size++;
    const out = new Array(size);
    for(let i = out.length - 1; i >= 0; i--){
        out[i] = num & 0xff;
        num >>= 8;
    }
    if (out[0] & 0x80) {
        out.unshift(0);
    }
    return this._createEncoderBuffer(Buffer.from(out));
};
DERNode.prototype._encodeBool = function encodeBool(value) {
    return this._createEncoderBuffer(value ? 0xff : 0);
};
DERNode.prototype._use = function use(entity, obj) {
    if (typeof entity === 'function') entity = entity(obj);
    return entity._getEncoder('der').tree;
};
DERNode.prototype._skipDefault = function skipDefault(dataBuffer, reporter, parent) {
    const state = this._baseState;
    let i;
    if (state['default'] === null) return false;
    const data = dataBuffer.join();
    if (state.defaultBuffer === undefined) state.defaultBuffer = this._encodeValue(state['default'], reporter, parent).join();
    if (data.length !== state.defaultBuffer.length) return false;
    for(i = 0; i < data.length; i++)if (data[i] !== state.defaultBuffer[i]) return false;
    return true;
};
// Utility methods
function encodeTag(tag, primitive, cls, reporter) {
    let res;
    if (tag === 'seqof') tag = 'seq';
    else if (tag === 'setof') tag = 'set';
    if (der.tagByName.hasOwnProperty(tag)) res = der.tagByName[tag];
    else if (typeof tag === 'number' && (tag | 0) === tag) res = tag;
    else return reporter.error('Unknown tag: ' + tag);
    if (res >= 0x1f) return reporter.error('Multi-octet tag encoding unsupported');
    if (!primitive) res |= 0x20;
    res |= der.tagClassByName[cls || 'universal'] << 6;
    return res;
}
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/pem.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const inherits = __turbopack_context__.r("[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js [app-route] (ecmascript)");
const DEREncoder = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/der.js [app-route] (ecmascript)");
function PEMEncoder(entity) {
    DEREncoder.call(this, entity);
    this.enc = 'pem';
}
inherits(PEMEncoder, DEREncoder);
module.exports = PEMEncoder;
PEMEncoder.prototype.encode = function encode(data, options) {
    const buf = DEREncoder.prototype.encode.call(this, data);
    const p = buf.toString('base64');
    const out = [
        '-----BEGIN ' + options.label + '-----'
    ];
    for(let i = 0; i < p.length; i += 64)out.push(p.slice(i, i + 64));
    out.push('-----END ' + options.label + '-----');
    return out.join('\n');
};
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const encoders = exports;
encoders.der = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/der.js [app-route] (ecmascript)");
encoders.pem = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/pem.js [app-route] (ecmascript)");
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/der.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const inherits = __turbopack_context__.r("[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js [app-route] (ecmascript)");
const bignum = __turbopack_context__.r("[project]/node_modules/.pnpm/bn.js@4.12.3/node_modules/bn.js/lib/bn.js [app-route] (ecmascript)");
const DecoderBuffer = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/buffer.js [app-route] (ecmascript)").DecoderBuffer;
const Node = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/node.js [app-route] (ecmascript)");
// Import DER constants
const der = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/der.js [app-route] (ecmascript)");
function DERDecoder(entity) {
    this.enc = 'der';
    this.name = entity.name;
    this.entity = entity;
    // Construct base tree
    this.tree = new DERNode();
    this.tree._init(entity.body);
}
module.exports = DERDecoder;
DERDecoder.prototype.decode = function decode(data, options) {
    if (!DecoderBuffer.isDecoderBuffer(data)) {
        data = new DecoderBuffer(data, options);
    }
    return this.tree._decode(data, options);
};
// Tree methods
function DERNode(parent) {
    Node.call(this, 'der', parent);
}
inherits(DERNode, Node);
DERNode.prototype._peekTag = function peekTag(buffer, tag, any) {
    if (buffer.isEmpty()) return false;
    const state = buffer.save();
    const decodedTag = derDecodeTag(buffer, 'Failed to peek tag: "' + tag + '"');
    if (buffer.isError(decodedTag)) return decodedTag;
    buffer.restore(state);
    return decodedTag.tag === tag || decodedTag.tagStr === tag || decodedTag.tagStr + 'of' === tag || any;
};
DERNode.prototype._decodeTag = function decodeTag(buffer, tag, any) {
    const decodedTag = derDecodeTag(buffer, 'Failed to decode tag of "' + tag + '"');
    if (buffer.isError(decodedTag)) return decodedTag;
    let len = derDecodeLen(buffer, decodedTag.primitive, 'Failed to get length of "' + tag + '"');
    // Failure
    if (buffer.isError(len)) return len;
    if (!any && decodedTag.tag !== tag && decodedTag.tagStr !== tag && decodedTag.tagStr + 'of' !== tag) {
        return buffer.error('Failed to match tag: "' + tag + '"');
    }
    if (decodedTag.primitive || len !== null) return buffer.skip(len, 'Failed to match body of: "' + tag + '"');
    // Indefinite length... find END tag
    const state = buffer.save();
    const res = this._skipUntilEnd(buffer, 'Failed to skip indefinite length body: "' + this.tag + '"');
    if (buffer.isError(res)) return res;
    len = buffer.offset - state.offset;
    buffer.restore(state);
    return buffer.skip(len, 'Failed to match body of: "' + tag + '"');
};
DERNode.prototype._skipUntilEnd = function skipUntilEnd(buffer, fail) {
    for(;;){
        const tag = derDecodeTag(buffer, fail);
        if (buffer.isError(tag)) return tag;
        const len = derDecodeLen(buffer, tag.primitive, fail);
        if (buffer.isError(len)) return len;
        let res;
        if (tag.primitive || len !== null) res = buffer.skip(len);
        else res = this._skipUntilEnd(buffer, fail);
        // Failure
        if (buffer.isError(res)) return res;
        if (tag.tagStr === 'end') break;
    }
};
DERNode.prototype._decodeList = function decodeList(buffer, tag, decoder, options) {
    const result = [];
    while(!buffer.isEmpty()){
        const possibleEnd = this._peekTag(buffer, 'end');
        if (buffer.isError(possibleEnd)) return possibleEnd;
        const res = decoder.decode(buffer, 'der', options);
        if (buffer.isError(res) && possibleEnd) break;
        result.push(res);
    }
    return result;
};
DERNode.prototype._decodeStr = function decodeStr(buffer, tag) {
    if (tag === 'bitstr') {
        const unused = buffer.readUInt8();
        if (buffer.isError(unused)) return unused;
        return {
            unused: unused,
            data: buffer.raw()
        };
    } else if (tag === 'bmpstr') {
        const raw = buffer.raw();
        if (raw.length % 2 === 1) return buffer.error('Decoding of string type: bmpstr length mismatch');
        let str = '';
        for(let i = 0; i < raw.length / 2; i++){
            str += String.fromCharCode(raw.readUInt16BE(i * 2));
        }
        return str;
    } else if (tag === 'numstr') {
        const numstr = buffer.raw().toString('ascii');
        if (!this._isNumstr(numstr)) {
            return buffer.error('Decoding of string type: ' + 'numstr unsupported characters');
        }
        return numstr;
    } else if (tag === 'octstr') {
        return buffer.raw();
    } else if (tag === 'objDesc') {
        return buffer.raw();
    } else if (tag === 'printstr') {
        const printstr = buffer.raw().toString('ascii');
        if (!this._isPrintstr(printstr)) {
            return buffer.error('Decoding of string type: ' + 'printstr unsupported characters');
        }
        return printstr;
    } else if (/str$/.test(tag)) {
        return buffer.raw().toString();
    } else {
        return buffer.error('Decoding of string type: ' + tag + ' unsupported');
    }
};
DERNode.prototype._decodeObjid = function decodeObjid(buffer, values, relative) {
    let result;
    const identifiers = [];
    let ident = 0;
    let subident = 0;
    while(!buffer.isEmpty()){
        subident = buffer.readUInt8();
        ident <<= 7;
        ident |= subident & 0x7f;
        if ((subident & 0x80) === 0) {
            identifiers.push(ident);
            ident = 0;
        }
    }
    if (subident & 0x80) identifiers.push(ident);
    const first = identifiers[0] / 40 | 0;
    const second = identifiers[0] % 40;
    if (relative) result = identifiers;
    else result = [
        first,
        second
    ].concat(identifiers.slice(1));
    if (values) {
        let tmp = values[result.join(' ')];
        if (tmp === undefined) tmp = values[result.join('.')];
        if (tmp !== undefined) result = tmp;
    }
    return result;
};
DERNode.prototype._decodeTime = function decodeTime(buffer, tag) {
    const str = buffer.raw().toString();
    let year;
    let mon;
    let day;
    let hour;
    let min;
    let sec;
    if (tag === 'gentime') {
        year = str.slice(0, 4) | 0;
        mon = str.slice(4, 6) | 0;
        day = str.slice(6, 8) | 0;
        hour = str.slice(8, 10) | 0;
        min = str.slice(10, 12) | 0;
        sec = str.slice(12, 14) | 0;
    } else if (tag === 'utctime') {
        year = str.slice(0, 2) | 0;
        mon = str.slice(2, 4) | 0;
        day = str.slice(4, 6) | 0;
        hour = str.slice(6, 8) | 0;
        min = str.slice(8, 10) | 0;
        sec = str.slice(10, 12) | 0;
        if (year < 70) year = 2000 + year;
        else year = 1900 + year;
    } else {
        return buffer.error('Decoding ' + tag + ' time is not supported yet');
    }
    return Date.UTC(year, mon - 1, day, hour, min, sec, 0);
};
DERNode.prototype._decodeNull = function decodeNull() {
    return null;
};
DERNode.prototype._decodeBool = function decodeBool(buffer) {
    const res = buffer.readUInt8();
    if (buffer.isError(res)) return res;
    else return res !== 0;
};
DERNode.prototype._decodeInt = function decodeInt(buffer, values) {
    // Bigint, return as it is (assume big endian)
    const raw = buffer.raw();
    let res = new bignum(raw);
    if (values) res = values[res.toString(10)] || res;
    return res;
};
DERNode.prototype._use = function use(entity, obj) {
    if (typeof entity === 'function') entity = entity(obj);
    return entity._getDecoder('der').tree;
};
// Utility methods
function derDecodeTag(buf, fail) {
    let tag = buf.readUInt8(fail);
    if (buf.isError(tag)) return tag;
    const cls = der.tagClass[tag >> 6];
    const primitive = (tag & 0x20) === 0;
    // Multi-octet tag - load
    if ((tag & 0x1f) === 0x1f) {
        let oct = tag;
        tag = 0;
        while((oct & 0x80) === 0x80){
            oct = buf.readUInt8(fail);
            if (buf.isError(oct)) return oct;
            tag <<= 7;
            tag |= oct & 0x7f;
        }
    } else {
        tag &= 0x1f;
    }
    const tagStr = der.tag[tag];
    return {
        cls: cls,
        primitive: primitive,
        tag: tag,
        tagStr: tagStr
    };
}
function derDecodeLen(buf, primitive, fail) {
    let len = buf.readUInt8(fail);
    if (buf.isError(len)) return len;
    // Indefinite form
    if (!primitive && len === 0x80) return null;
    // Definite form
    if ((len & 0x80) === 0) {
        // Short form
        return len;
    }
    // Long form
    const num = len & 0x7f;
    if (num > 4) return buf.error('length octect is too long');
    len = 0;
    for(let i = 0; i < num; i++){
        len <<= 8;
        const j = buf.readUInt8(fail);
        if (buf.isError(j)) return j;
        len |= j;
    }
    return len;
}
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/pem.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const inherits = __turbopack_context__.r("[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js [app-route] (ecmascript)");
const Buffer = __turbopack_context__.r("[project]/node_modules/.pnpm/safer-buffer@2.1.2/node_modules/safer-buffer/safer.js [app-route] (ecmascript)").Buffer;
const DERDecoder = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/der.js [app-route] (ecmascript)");
function PEMDecoder(entity) {
    DERDecoder.call(this, entity);
    this.enc = 'pem';
}
inherits(PEMDecoder, DERDecoder);
module.exports = PEMDecoder;
PEMDecoder.prototype.decode = function decode(data, options) {
    const lines = data.toString().split(/[\r\n]+/g);
    const label = options.label.toUpperCase();
    const re = /^-----(BEGIN|END) ([^-]+)-----$/;
    let start = -1;
    let end = -1;
    for(let i = 0; i < lines.length; i++){
        const match = lines[i].match(re);
        if (match === null) continue;
        if (match[2] !== label) continue;
        if (start === -1) {
            if (match[1] !== 'BEGIN') break;
            start = i;
        } else {
            if (match[1] !== 'END') break;
            end = i;
            break;
        }
    }
    if (start === -1 || end === -1) throw new Error('PEM section not found for: ' + label);
    const base64 = lines.slice(start + 1, end).join('');
    // Remove excessive symbols
    base64.replace(/[^a-z0-9+/=]+/gi, '');
    const input = Buffer.from(base64, 'base64');
    return DERDecoder.prototype.decode.call(this, input, options);
};
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const decoders = exports;
decoders.der = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/der.js [app-route] (ecmascript)");
decoders.pem = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/pem.js [app-route] (ecmascript)");
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/api.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const encoders = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/index.js [app-route] (ecmascript)");
const decoders = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/index.js [app-route] (ecmascript)");
const inherits = __turbopack_context__.r("[project]/node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js [app-route] (ecmascript)");
const api = exports;
api.define = function define(name, body) {
    return new Entity(name, body);
};
function Entity(name, body) {
    this.name = name;
    this.body = body;
    this.decoders = {};
    this.encoders = {};
}
Entity.prototype._createNamed = function createNamed(Base) {
    const name = this.name;
    function Generated(entity) {
        this._initNamed(entity, name);
    }
    inherits(Generated, Base);
    Generated.prototype._initNamed = function _initNamed(entity, name) {
        Base.call(this, entity, name);
    };
    return new Generated(this);
};
Entity.prototype._getDecoder = function _getDecoder(enc) {
    enc = enc || 'der';
    // Lazily create decoder
    if (!this.decoders.hasOwnProperty(enc)) this.decoders[enc] = this._createNamed(decoders[enc]);
    return this.decoders[enc];
};
Entity.prototype.decode = function decode(data, enc, options) {
    return this._getDecoder(enc).decode(data, options);
};
Entity.prototype._getEncoder = function _getEncoder(enc) {
    enc = enc || 'der';
    // Lazily create encoder
    if (!this.encoders.hasOwnProperty(enc)) this.encoders[enc] = this._createNamed(encoders[enc]);
    return this.encoders[enc];
};
Entity.prototype.encode = function encode(data, enc, /* internal */ reporter) {
    return this._getEncoder(enc).encode(data, reporter);
};
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const base = exports;
base.Reporter = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/reporter.js [app-route] (ecmascript)").Reporter;
base.DecoderBuffer = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/buffer.js [app-route] (ecmascript)").DecoderBuffer;
base.EncoderBuffer = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/buffer.js [app-route] (ecmascript)").EncoderBuffer;
base.Node = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/node.js [app-route] (ecmascript)");
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const constants = exports;
// Helper
constants._reverse = function reverse(map) {
    const res = {};
    Object.keys(map).forEach(function(key) {
        // Convert key to integer if it is stringified
        if ((key | 0) == key) key = key | 0;
        const value = map[key];
        res[value] = key;
    });
    return res;
};
constants.der = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/der.js [app-route] (ecmascript)");
}),
"[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const asn1 = exports;
asn1.bignum = __turbopack_context__.r("[project]/node_modules/.pnpm/bn.js@4.12.3/node_modules/bn.js/lib/bn.js [app-route] (ecmascript)");
asn1.define = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/api.js [app-route] (ecmascript)").define;
asn1.base = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/index.js [app-route] (ecmascript)");
asn1.constants = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/index.js [app-route] (ecmascript)");
asn1.decoders = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/index.js [app-route] (ecmascript)");
asn1.encoders = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/index.js [app-route] (ecmascript)");
}),
"[project]/node_modules/.pnpm/minimalistic-assert@1.0.1/node_modules/minimalistic-assert/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = assert;
function assert(val, msg) {
    if (!val) throw new Error(msg || 'Assertion failed');
}
assert.equal = function assertEqual(l, r, msg) {
    if (l != r) throw new Error(msg || 'Assertion failed: ' + l + ' != ' + r);
};
}),
"[project]/node_modules/.pnpm/safe-buffer@5.2.1/node_modules/safe-buffer/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */ /* eslint-disable node/no-deprecated-api */ var buffer = __turbopack_context__.r("[externals]/buffer [external] (buffer, cjs)");
var Buffer = buffer.Buffer;
// alternative to using Object.keys for old browsers
function copyProps(src, dst) {
    for(var key in src){
        dst[key] = src[key];
    }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
    module.exports = buffer;
} else {
    // Copy properties from require('buffer')
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
}
function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer(arg, encodingOrOffset, length);
}
SafeBuffer.prototype = Object.create(Buffer.prototype);
// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);
SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
        throw new TypeError('Argument must not be a number');
    }
    return Buffer(arg, encodingOrOffset, length);
};
SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number');
    }
    var buf = Buffer(size);
    if (fill !== undefined) {
        if (typeof encoding === 'string') {
            buf.fill(fill, encoding);
        } else {
            buf.fill(fill);
        }
    } else {
        buf.fill(0);
    }
    return buf;
};
SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number');
    }
    return Buffer(size);
};
SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number');
    }
    return buffer.SlowBuffer(size);
};
}),
"[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/data-stream.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*global module, process*/ var Buffer = __turbopack_context__.r("[project]/node_modules/.pnpm/safe-buffer@5.2.1/node_modules/safe-buffer/index.js [app-route] (ecmascript)").Buffer;
var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)");
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
function DataStream(data) {
    this.buffer = null;
    this.writable = true;
    this.readable = true;
    // No input
    if (!data) {
        this.buffer = Buffer.alloc(0);
        return this;
    }
    // Stream
    if (typeof data.pipe === 'function') {
        this.buffer = Buffer.alloc(0);
        data.pipe(this);
        return this;
    }
    // Buffer or String
    // or Object (assumedly a passworded key)
    if (data.length || typeof data === 'object') {
        this.buffer = data;
        this.writable = false;
        process.nextTick((function() {
            this.emit('end', data);
            this.readable = false;
            this.emit('close');
        }).bind(this));
        return this;
    }
    throw new TypeError('Unexpected data type (' + typeof data + ')');
}
util.inherits(DataStream, Stream);
DataStream.prototype.write = function write(data) {
    this.buffer = Buffer.concat([
        this.buffer,
        Buffer.from(data)
    ]);
    this.emit('data', data);
};
DataStream.prototype.end = function end(data) {
    if (data) this.write(data);
    this.emit('end', data);
    this.emit('close');
    this.writable = false;
    this.readable = false;
};
module.exports = DataStream;
}),
"[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/tostring.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*global module*/ var Buffer = __turbopack_context__.r("[externals]/buffer [external] (buffer, cjs)").Buffer;
module.exports = function toString(obj) {
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number' || Buffer.isBuffer(obj)) return obj.toString();
    return JSON.stringify(obj);
};
}),
"[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/sign-stream.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*global module*/ var Buffer = __turbopack_context__.r("[project]/node_modules/.pnpm/safe-buffer@5.2.1/node_modules/safe-buffer/index.js [app-route] (ecmascript)").Buffer;
var DataStream = __turbopack_context__.r("[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/data-stream.js [app-route] (ecmascript)");
var jwa = __turbopack_context__.r("[project]/node_modules/.pnpm/jwa@2.0.1/node_modules/jwa/index.js [app-route] (ecmascript)");
var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)");
var toString = __turbopack_context__.r("[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/tostring.js [app-route] (ecmascript)");
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
function base64url(string, encoding) {
    return Buffer.from(string, encoding).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function jwsSecuredInput(header, payload, encoding) {
    encoding = encoding || 'utf8';
    var encodedHeader = base64url(toString(header), 'binary');
    var encodedPayload = base64url(toString(payload), encoding);
    return util.format('%s.%s', encodedHeader, encodedPayload);
}
function jwsSign(opts) {
    var header = opts.header;
    var payload = opts.payload;
    var secretOrKey = opts.secret || opts.privateKey;
    var encoding = opts.encoding;
    var algo = jwa(header.alg);
    var securedInput = jwsSecuredInput(header, payload, encoding);
    var signature = algo.sign(securedInput, secretOrKey);
    return util.format('%s.%s', securedInput, signature);
}
function SignStream(opts) {
    var secret = opts.secret;
    secret = secret == null ? opts.privateKey : secret;
    secret = secret == null ? opts.key : secret;
    if (/^hs/i.test(opts.header.alg) === true && secret == null) {
        throw new TypeError('secret must be a string or buffer or a KeyObject');
    }
    var secretStream = new DataStream(secret);
    this.readable = true;
    this.header = opts.header;
    this.encoding = opts.encoding;
    this.secret = this.privateKey = this.key = secretStream;
    this.payload = new DataStream(opts.payload);
    this.secret.once('close', (function() {
        if (!this.payload.writable && this.readable) this.sign();
    }).bind(this));
    this.payload.once('close', (function() {
        if (!this.secret.writable && this.readable) this.sign();
    }).bind(this));
}
util.inherits(SignStream, Stream);
SignStream.prototype.sign = function sign() {
    try {
        var signature = jwsSign({
            header: this.header,
            payload: this.payload.buffer,
            secret: this.secret.buffer,
            encoding: this.encoding
        });
        this.emit('done', signature);
        this.emit('data', signature);
        this.emit('end');
        this.readable = false;
        return signature;
    } catch (e) {
        this.readable = false;
        this.emit('error', e);
        this.emit('close');
    }
};
SignStream.sign = jwsSign;
module.exports = SignStream;
}),
"[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/verify-stream.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*global module*/ var Buffer = __turbopack_context__.r("[project]/node_modules/.pnpm/safe-buffer@5.2.1/node_modules/safe-buffer/index.js [app-route] (ecmascript)").Buffer;
var DataStream = __turbopack_context__.r("[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/data-stream.js [app-route] (ecmascript)");
var jwa = __turbopack_context__.r("[project]/node_modules/.pnpm/jwa@2.0.1/node_modules/jwa/index.js [app-route] (ecmascript)");
var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)");
var toString = __turbopack_context__.r("[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/tostring.js [app-route] (ecmascript)");
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
function isObject(thing) {
    return Object.prototype.toString.call(thing) === '[object Object]';
}
function safeJsonParse(thing) {
    if (isObject(thing)) return thing;
    try {
        return JSON.parse(thing);
    } catch (e) {
        return undefined;
    }
}
function headerFromJWS(jwsSig) {
    var encodedHeader = jwsSig.split('.', 1)[0];
    return safeJsonParse(Buffer.from(encodedHeader, 'base64').toString('binary'));
}
function securedInputFromJWS(jwsSig) {
    return jwsSig.split('.', 2).join('.');
}
function signatureFromJWS(jwsSig) {
    return jwsSig.split('.')[2];
}
function payloadFromJWS(jwsSig, encoding) {
    encoding = encoding || 'utf8';
    var payload = jwsSig.split('.')[1];
    return Buffer.from(payload, 'base64').toString(encoding);
}
function isValidJws(string) {
    return JWS_REGEX.test(string) && !!headerFromJWS(string);
}
function jwsVerify(jwsSig, algorithm, secretOrKey) {
    if (!algorithm) {
        var err = new Error("Missing algorithm parameter for jws.verify");
        err.code = "MISSING_ALGORITHM";
        throw err;
    }
    jwsSig = toString(jwsSig);
    var signature = signatureFromJWS(jwsSig);
    var securedInput = securedInputFromJWS(jwsSig);
    var algo = jwa(algorithm);
    return algo.verify(securedInput, signature, secretOrKey);
}
function jwsDecode(jwsSig, opts) {
    opts = opts || {};
    jwsSig = toString(jwsSig);
    if (!isValidJws(jwsSig)) return null;
    var header = headerFromJWS(jwsSig);
    if (!header) return null;
    var payload = payloadFromJWS(jwsSig);
    if (header.typ === 'JWT' || opts.json) payload = JSON.parse(payload, opts.encoding);
    return {
        header: header,
        payload: payload,
        signature: signatureFromJWS(jwsSig)
    };
}
function VerifyStream(opts) {
    opts = opts || {};
    var secretOrKey = opts.secret;
    secretOrKey = secretOrKey == null ? opts.publicKey : secretOrKey;
    secretOrKey = secretOrKey == null ? opts.key : secretOrKey;
    if (/^hs/i.test(opts.algorithm) === true && secretOrKey == null) {
        throw new TypeError('secret must be a string or buffer or a KeyObject');
    }
    var secretStream = new DataStream(secretOrKey);
    this.readable = true;
    this.algorithm = opts.algorithm;
    this.encoding = opts.encoding;
    this.secret = this.publicKey = this.key = secretStream;
    this.signature = new DataStream(opts.signature);
    this.secret.once('close', (function() {
        if (!this.signature.writable && this.readable) this.verify();
    }).bind(this));
    this.signature.once('close', (function() {
        if (!this.secret.writable && this.readable) this.verify();
    }).bind(this));
}
util.inherits(VerifyStream, Stream);
VerifyStream.prototype.verify = function verify() {
    try {
        var valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
        var obj = jwsDecode(this.signature.buffer, this.encoding);
        this.emit('done', valid, obj);
        this.emit('data', valid);
        this.emit('end');
        this.readable = false;
        return valid;
    } catch (e) {
        this.readable = false;
        this.emit('error', e);
        this.emit('close');
    }
};
VerifyStream.decode = jwsDecode;
VerifyStream.isValid = isValidJws;
VerifyStream.verify = jwsVerify;
module.exports = VerifyStream;
}),
"[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*global exports*/ var SignStream = __turbopack_context__.r("[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/sign-stream.js [app-route] (ecmascript)");
var VerifyStream = __turbopack_context__.r("[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/verify-stream.js [app-route] (ecmascript)");
var ALGORITHMS = [
    'HS256',
    'HS384',
    'HS512',
    'RS256',
    'RS384',
    'RS512',
    'PS256',
    'PS384',
    'PS512',
    'ES256',
    'ES384',
    'ES512'
];
exports.ALGORITHMS = ALGORITHMS;
exports.sign = SignStream.sign;
exports.verify = VerifyStream.verify;
exports.decode = VerifyStream.decode;
exports.isValid = VerifyStream.isValid;
exports.createSign = function createSign(opts) {
    return new SignStream(opts);
};
exports.createVerify = function createVerify(opts) {
    return new VerifyStream(opts);
};
}),
"[project]/node_modules/.pnpm/ecdsa-sig-formatter@1.0.11/node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function getParamSize(keySize) {
    var result = (keySize / 8 | 0) + (keySize % 8 === 0 ? 0 : 1);
    return result;
}
var paramBytesForAlg = {
    ES256: getParamSize(256),
    ES384: getParamSize(384),
    ES512: getParamSize(521)
};
function getParamBytesForAlg(alg) {
    var paramBytes = paramBytesForAlg[alg];
    if (paramBytes) {
        return paramBytes;
    }
    throw new Error('Unknown algorithm "' + alg + '"');
}
module.exports = getParamBytesForAlg;
}),
"[project]/node_modules/.pnpm/ecdsa-sig-formatter@1.0.11/node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var Buffer = __turbopack_context__.r("[project]/node_modules/.pnpm/safe-buffer@5.2.1/node_modules/safe-buffer/index.js [app-route] (ecmascript)").Buffer;
var getParamBytesForAlg = __turbopack_context__.r("[project]/node_modules/.pnpm/ecdsa-sig-formatter@1.0.11/node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js [app-route] (ecmascript)");
var MAX_OCTET = 0x80, CLASS_UNIVERSAL = 0, PRIMITIVE_BIT = 0x20, TAG_SEQ = 0x10, TAG_INT = 0x02, ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | CLASS_UNIVERSAL << 6, ENCODED_TAG_INT = TAG_INT | CLASS_UNIVERSAL << 6;
function base64Url(base64) {
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function signatureAsBuffer(signature) {
    if (Buffer.isBuffer(signature)) {
        return signature;
    } else if ('string' === typeof signature) {
        return Buffer.from(signature, 'base64');
    }
    throw new TypeError('ECDSA signature must be a Base64 string or a Buffer');
}
function derToJose(signature, alg) {
    signature = signatureAsBuffer(signature);
    var paramBytes = getParamBytesForAlg(alg);
    // the DER encoded param should at most be the param size, plus a padding
    // zero, since due to being a signed integer
    var maxEncodedParamLength = paramBytes + 1;
    var inputLength = signature.length;
    var offset = 0;
    if (signature[offset++] !== ENCODED_TAG_SEQ) {
        throw new Error('Could not find expected "seq"');
    }
    var seqLength = signature[offset++];
    if (seqLength === (MAX_OCTET | 1)) {
        seqLength = signature[offset++];
    }
    if (inputLength - offset < seqLength) {
        throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
    }
    if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "r"');
    }
    var rLength = signature[offset++];
    if (inputLength - offset - 2 < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
    }
    if (maxEncodedParamLength < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
    }
    var rOffset = offset;
    offset += rLength;
    if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "s"');
    }
    var sLength = signature[offset++];
    if (inputLength - offset !== sLength) {
        throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
    }
    if (maxEncodedParamLength < sLength) {
        throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
    }
    var sOffset = offset;
    offset += sLength;
    if (offset !== inputLength) {
        throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
    }
    var rPadding = paramBytes - rLength, sPadding = paramBytes - sLength;
    var dst = Buffer.allocUnsafe(rPadding + rLength + sPadding + sLength);
    for(offset = 0; offset < rPadding; ++offset){
        dst[offset] = 0;
    }
    signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);
    offset = paramBytes;
    for(var o = offset; offset < o + sPadding; ++offset){
        dst[offset] = 0;
    }
    signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);
    dst = dst.toString('base64');
    dst = base64Url(dst);
    return dst;
}
function countPadding(buf, start, stop) {
    var padding = 0;
    while(start + padding < stop && buf[start + padding] === 0){
        ++padding;
    }
    var needsSign = buf[start + padding] >= MAX_OCTET;
    if (needsSign) {
        --padding;
    }
    return padding;
}
function joseToDer(signature, alg) {
    signature = signatureAsBuffer(signature);
    var paramBytes = getParamBytesForAlg(alg);
    var signatureBytes = signature.length;
    if (signatureBytes !== paramBytes * 2) {
        throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
    }
    var rPadding = countPadding(signature, 0, paramBytes);
    var sPadding = countPadding(signature, paramBytes, signature.length);
    var rLength = paramBytes - rPadding;
    var sLength = paramBytes - sPadding;
    var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;
    var shortLength = rsBytes < MAX_OCTET;
    var dst = Buffer.allocUnsafe((shortLength ? 2 : 3) + rsBytes);
    var offset = 0;
    dst[offset++] = ENCODED_TAG_SEQ;
    if (shortLength) {
        // Bit 8 has value "0"
        // bits 7-1 give the length.
        dst[offset++] = rsBytes;
    } else {
        // Bit 8 of first octet has value "1"
        // bits 7-1 give the number of additional length octets.
        dst[offset++] = MAX_OCTET | 1;
        // length, base 256
        dst[offset++] = rsBytes & 0xff;
    }
    dst[offset++] = ENCODED_TAG_INT;
    dst[offset++] = rLength;
    if (rPadding < 0) {
        dst[offset++] = 0;
        offset += signature.copy(dst, offset, 0, paramBytes);
    } else {
        offset += signature.copy(dst, offset, rPadding, paramBytes);
    }
    dst[offset++] = ENCODED_TAG_INT;
    dst[offset++] = sLength;
    if (sPadding < 0) {
        dst[offset++] = 0;
        signature.copy(dst, offset, paramBytes);
    } else {
        signature.copy(dst, offset, paramBytes + sPadding);
    }
    return dst;
}
module.exports = {
    derToJose: derToJose,
    joseToDer: joseToDer
};
}),
"[project]/node_modules/.pnpm/buffer-equal-constant-time@1.0.1/node_modules/buffer-equal-constant-time/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*jshint node:true */ var Buffer = __turbopack_context__.r("[externals]/buffer [external] (buffer, cjs)").Buffer; // browserify
var SlowBuffer = __turbopack_context__.r("[externals]/buffer [external] (buffer, cjs)").SlowBuffer;
module.exports = bufferEq;
function bufferEq(a, b) {
    // shortcutting on type is necessary for correctness
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        return false;
    }
    // buffer sizes should be well-known information, so despite this
    // shortcutting, it doesn't leak any information about the *contents* of the
    // buffers.
    if (a.length !== b.length) {
        return false;
    }
    var c = 0;
    for(var i = 0; i < a.length; i++){
        /*jshint bitwise:false */ c |= a[i] ^ b[i]; // XOR
    }
    return c === 0;
}
bufferEq.install = function() {
    Buffer.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
        return bufferEq(this, that);
    };
};
var origBufEqual = Buffer.prototype.equal;
var origSlowBufEqual = SlowBuffer.prototype.equal;
bufferEq.restore = function() {
    Buffer.prototype.equal = origBufEqual;
    SlowBuffer.prototype.equal = origSlowBufEqual;
};
}),
"[project]/node_modules/.pnpm/jwa@2.0.1/node_modules/jwa/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

var Buffer = __turbopack_context__.r("[project]/node_modules/.pnpm/safe-buffer@5.2.1/node_modules/safe-buffer/index.js [app-route] (ecmascript)").Buffer;
var crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
var formatEcdsa = __turbopack_context__.r("[project]/node_modules/.pnpm/ecdsa-sig-formatter@1.0.11/node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js [app-route] (ecmascript)");
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
var MSG_INVALID_SECRET = 'secret must be a string or buffer';
var MSG_INVALID_VERIFIER_KEY = 'key must be a string or a buffer';
var MSG_INVALID_SIGNER_KEY = 'key must be a string, a buffer or an object';
var supportsKeyObjects = typeof crypto.createPublicKey === 'function';
if (supportsKeyObjects) {
    MSG_INVALID_VERIFIER_KEY += ' or a KeyObject';
    MSG_INVALID_SECRET += 'or a KeyObject';
}
function checkIsPublicKey(key) {
    if (Buffer.isBuffer(key)) {
        return;
    }
    if (typeof key === 'string') {
        return;
    }
    if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
    }
    if (typeof key !== 'object') {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
    }
    if (typeof key.type !== 'string') {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
    }
    if (typeof key.asymmetricKeyType !== 'string') {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
    }
    if (typeof key.export !== 'function') {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
    }
}
;
function checkIsPrivateKey(key) {
    if (Buffer.isBuffer(key)) {
        return;
    }
    if (typeof key === 'string') {
        return;
    }
    if (typeof key === 'object') {
        return;
    }
    throw typeError(MSG_INVALID_SIGNER_KEY);
}
;
function checkIsSecretKey(key) {
    if (Buffer.isBuffer(key)) {
        return;
    }
    if (typeof key === 'string') {
        return key;
    }
    if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_SECRET);
    }
    if (typeof key !== 'object') {
        throw typeError(MSG_INVALID_SECRET);
    }
    if (key.type !== 'secret') {
        throw typeError(MSG_INVALID_SECRET);
    }
    if (typeof key.export !== 'function') {
        throw typeError(MSG_INVALID_SECRET);
    }
}
function fromBase64(base64) {
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function toBase64(base64url) {
    base64url = base64url.toString();
    var padding = 4 - base64url.length % 4;
    if (padding !== 4) {
        for(var i = 0; i < padding; ++i){
            base64url += '=';
        }
    }
    return base64url.replace(/\-/g, '+').replace(/_/g, '/');
}
function typeError(template) {
    var args = [].slice.call(arguments, 1);
    var errMsg = util.format.bind(util, template).apply(null, args);
    return new TypeError(errMsg);
}
function bufferOrString(obj) {
    return Buffer.isBuffer(obj) || typeof obj === 'string';
}
function normalizeInput(thing) {
    if (!bufferOrString(thing)) thing = JSON.stringify(thing);
    return thing;
}
function createHmacSigner(bits) {
    return function sign(thing, secret) {
        checkIsSecretKey(secret);
        thing = normalizeInput(thing);
        var hmac = crypto.createHmac('sha' + bits, secret);
        var sig = (hmac.update(thing), hmac.digest('base64'));
        return fromBase64(sig);
    };
}
var bufferEqual;
var timingSafeEqual = 'timingSafeEqual' in crypto ? function timingSafeEqual(a, b) {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    return crypto.timingSafeEqual(a, b);
} : function timingSafeEqual(a, b) {
    if (!bufferEqual) {
        bufferEqual = __turbopack_context__.r("[project]/node_modules/.pnpm/buffer-equal-constant-time@1.0.1/node_modules/buffer-equal-constant-time/index.js [app-route] (ecmascript)");
    }
    return bufferEqual(a, b);
};
function createHmacVerifier(bits) {
    return function verify(thing, signature, secret) {
        var computedSig = createHmacSigner(bits)(thing, secret);
        return timingSafeEqual(Buffer.from(signature), Buffer.from(computedSig));
    };
}
function createKeySigner(bits) {
    return function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        // Even though we are specifying "RSA" here, this works with ECDSA
        // keys as well.
        var signer = crypto.createSign('RSA-SHA' + bits);
        var sig = (signer.update(thing), signer.sign(privateKey, 'base64'));
        return fromBase64(sig);
    };
}
function createKeyVerifier(bits) {
    return function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto.createVerify('RSA-SHA' + bits);
        verifier.update(thing);
        return verifier.verify(publicKey, signature, 'base64');
    };
}
function createPSSKeySigner(bits) {
    return function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto.createSign('RSA-SHA' + bits);
        var sig = (signer.update(thing), signer.sign({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
        }, 'base64'));
        return fromBase64(sig);
    };
}
function createPSSKeyVerifier(bits) {
    return function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto.createVerify('RSA-SHA' + bits);
        verifier.update(thing);
        return verifier.verify({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
        }, signature, 'base64');
    };
}
function createECDSASigner(bits) {
    var inner = createKeySigner(bits);
    return function sign() {
        var signature = inner.apply(null, arguments);
        signature = formatEcdsa.derToJose(signature, 'ES' + bits);
        return signature;
    };
}
function createECDSAVerifer(bits) {
    var inner = createKeyVerifier(bits);
    return function verify(thing, signature, publicKey) {
        signature = formatEcdsa.joseToDer(signature, 'ES' + bits).toString('base64');
        var result = inner(thing, signature, publicKey);
        return result;
    };
}
function createNoneSigner() {
    return function sign() {
        return '';
    };
}
function createNoneVerifier() {
    return function verify(thing, signature) {
        return signature === '';
    };
}
module.exports = function jwa(algorithm) {
    var signerFactories = {
        hs: createHmacSigner,
        rs: createKeySigner,
        ps: createPSSKeySigner,
        es: createECDSASigner,
        none: createNoneSigner
    };
    var verifierFactories = {
        hs: createHmacVerifier,
        rs: createKeyVerifier,
        ps: createPSSKeyVerifier,
        es: createECDSAVerifer,
        none: createNoneVerifier
    };
    var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/);
    if (!match) throw typeError(MSG_INVALID_ALGORITHM, algorithm);
    var algo = (match[1] || match[3]).toLowerCase();
    var bits = match[2];
    return {
        sign: signerFactories[algo](bits),
        verify: verifierFactories[algo](bits)
    };
};
}),
"[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-constants.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const WebPushConstants = {};
WebPushConstants.supportedContentEncodings = {
    AES_GCM: 'aesgcm',
    AES_128_GCM: 'aes128gcm'
};
WebPushConstants.supportedUrgency = {
    VERY_LOW: 'very-low',
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high'
};
module.exports = WebPushConstants;
}),
"[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/urlsafe-base64-helper.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @param {string} base64
 * @returns {boolean}
 */ function validate(base64) {
    return /^[A-Za-z0-9\-_]+$/.test(base64);
}
module.exports = {
    validate: validate
};
}),
"[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/vapid-helper.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
const asn1 = __turbopack_context__.r("[project]/node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1.js [app-route] (ecmascript)");
const jws = __turbopack_context__.r("[project]/node_modules/.pnpm/jws@4.0.1/node_modules/jws/index.js [app-route] (ecmascript)");
const { URL } = __turbopack_context__.r("[externals]/url [external] (url, cjs)");
const WebPushConstants = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-constants.js [app-route] (ecmascript)");
const urlBase64Helper = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/urlsafe-base64-helper.js [app-route] (ecmascript)");
/**
 * DEFAULT_EXPIRATION is set to seconds in 12 hours
 */ const DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;
// Maximum expiration is 24 hours according. (See VAPID spec)
const MAX_EXPIRATION_SECONDS = 24 * 60 * 60;
const ECPrivateKeyASN = asn1.define('ECPrivateKey', function() {
    this.seq().obj(this.key('version').int(), this.key('privateKey').octstr(), this.key('parameters').explicit(0).objid().optional(), this.key('publicKey').explicit(1).bitstr().optional());
});
function toPEM(key) {
    return ECPrivateKeyASN.encode({
        version: 1,
        privateKey: key,
        parameters: [
            1,
            2,
            840,
            10045,
            3,
            1,
            7
        ] // prime256v1
    }, 'pem', {
        label: 'EC PRIVATE KEY'
    });
}
function generateVAPIDKeys() {
    const curve = crypto.createECDH('prime256v1');
    curve.generateKeys();
    let publicKeyBuffer = curve.getPublicKey();
    let privateKeyBuffer = curve.getPrivateKey();
    // Occassionally the keys will not be padded to the correct lengh resulting
    // in errors, hence this padding.
    // See https://github.com/web-push-libs/web-push/issues/295 for history.
    if (privateKeyBuffer.length < 32) {
        const padding = Buffer.alloc(32 - privateKeyBuffer.length);
        padding.fill(0);
        privateKeyBuffer = Buffer.concat([
            padding,
            privateKeyBuffer
        ]);
    }
    if (publicKeyBuffer.length < 65) {
        const padding = Buffer.alloc(65 - publicKeyBuffer.length);
        padding.fill(0);
        publicKeyBuffer = Buffer.concat([
            padding,
            publicKeyBuffer
        ]);
    }
    return {
        publicKey: publicKeyBuffer.toString('base64url'),
        privateKey: privateKeyBuffer.toString('base64url')
    };
}
function validateSubject(subject) {
    if (!subject) {
        throw new Error('No subject set in vapidDetails.subject.');
    }
    if (typeof subject !== 'string' || subject.length === 0) {
        throw new Error('The subject value must be a string containing an https: URL or ' + 'mailto: address. ' + subject);
    }
    let subjectParseResult = null;
    try {
        subjectParseResult = new URL(subject);
    } catch (err) {
        throw new Error('Vapid subject is not a valid URL. ' + subject);
    }
    if (![
        'https:',
        'mailto:'
    ].includes(subjectParseResult.protocol)) {
        throw new Error('Vapid subject is not an https: or mailto: URL. ' + subject);
    }
    if (subjectParseResult.hostname === 'localhost') {
        console.warn('Vapid subject points to a localhost web URI, which is unsupported by ' + 'Apple\'s push notification server and will result in a BadJwtToken error when ' + 'sending notifications.');
    }
}
function validatePublicKey(publicKey) {
    if (!publicKey) {
        throw new Error('No key set vapidDetails.publicKey');
    }
    if (typeof publicKey !== 'string') {
        throw new Error('Vapid public key is must be a URL safe Base 64 ' + 'encoded string.');
    }
    if (!urlBase64Helper.validate(publicKey)) {
        throw new Error('Vapid public key must be a URL safe Base 64 (without "=")');
    }
    publicKey = Buffer.from(publicKey, 'base64url');
    if (publicKey.length !== 65) {
        throw new Error('Vapid public key should be 65 bytes long when decoded.');
    }
}
function validatePrivateKey(privateKey) {
    if (!privateKey) {
        throw new Error('No key set in vapidDetails.privateKey');
    }
    if (typeof privateKey !== 'string') {
        throw new Error('Vapid private key must be a URL safe Base 64 ' + 'encoded string.');
    }
    if (!urlBase64Helper.validate(privateKey)) {
        throw new Error('Vapid private key must be a URL safe Base 64 (without "=")');
    }
    privateKey = Buffer.from(privateKey, 'base64url');
    if (privateKey.length !== 32) {
        throw new Error('Vapid private key should be 32 bytes long when decoded.');
    }
}
/**
 * Given the number of seconds calculates
 * the expiration in the future by adding the passed `numSeconds`
 * with the current seconds from Unix Epoch
 *
 * @param {Number} numSeconds Number of seconds to be added
 * @return {Number} Future expiration in seconds
 */ function getFutureExpirationTimestamp(numSeconds) {
    const futureExp = new Date();
    futureExp.setSeconds(futureExp.getSeconds() + numSeconds);
    return Math.floor(futureExp.getTime() / 1000);
}
/**
 * Validates the Expiration Header based on the VAPID Spec
 * Throws error of type `Error` if the expiration is not validated
 *
 * @param {Number} expiration Expiration seconds from Epoch to be validated
 */ function validateExpiration(expiration) {
    if (!Number.isInteger(expiration)) {
        throw new Error('`expiration` value must be a number');
    }
    if (expiration < 0) {
        throw new Error('`expiration` must be a positive integer');
    }
    // Roughly checks the time of expiration, since the max expiration can be ahead
    // of the time than at the moment the expiration was generated
    const maxExpirationTimestamp = getFutureExpirationTimestamp(MAX_EXPIRATION_SECONDS);
    if (expiration >= maxExpirationTimestamp) {
        throw new Error('`expiration` value is greater than maximum of 24 hours');
    }
}
/**
 * This method takes the required VAPID parameters and returns the required
 * header to be added to a Web Push Protocol Request.
 * @param  {string} audience        This must be the origin of the push service.
 * @param  {string} subject         This should be a URL or a 'mailto:' email
 * address.
 * @param  {string} publicKey       The VAPID public key.
 * @param  {string} privateKey      The VAPID private key.
 * @param  {string} contentEncoding The contentEncoding type.
 * @param  {integer} [expiration]   The expiration of the VAPID JWT.
 * @return {Object}                 Returns an Object with the Authorization and
 * 'Crypto-Key' values to be used as headers.
 */ function getVapidHeaders(audience, subject, publicKey, privateKey, contentEncoding, expiration) {
    if (!audience) {
        throw new Error('No audience could be generated for VAPID.');
    }
    if (typeof audience !== 'string' || audience.length === 0) {
        throw new Error('The audience value must be a string containing the ' + 'origin of a push service. ' + audience);
    }
    try {
        new URL(audience); // eslint-disable-line no-new
    } catch (err) {
        throw new Error('VAPID audience is not a url. ' + audience);
    }
    validateSubject(subject);
    validatePublicKey(publicKey);
    validatePrivateKey(privateKey);
    privateKey = Buffer.from(privateKey, 'base64url');
    if (expiration) {
        validateExpiration(expiration);
    } else {
        expiration = getFutureExpirationTimestamp(DEFAULT_EXPIRATION_SECONDS);
    }
    const header = {
        typ: 'JWT',
        alg: 'ES256'
    };
    const jwtPayload = {
        aud: audience,
        exp: expiration,
        sub: subject
    };
    const jwt = jws.sign({
        header: header,
        payload: jwtPayload,
        privateKey: toPEM(privateKey)
    });
    if (contentEncoding === WebPushConstants.supportedContentEncodings.AES_128_GCM) {
        return {
            Authorization: 'vapid t=' + jwt + ', k=' + publicKey
        };
    }
    if (contentEncoding === WebPushConstants.supportedContentEncodings.AES_GCM) {
        return {
            Authorization: 'WebPush ' + jwt,
            'Crypto-Key': 'p256ecdsa=' + publicKey
        };
    }
    throw new Error('Unsupported encoding type specified.');
}
module.exports = {
    generateVAPIDKeys: generateVAPIDKeys,
    getFutureExpirationTimestamp: getFutureExpirationTimestamp,
    getVapidHeaders: getVapidHeaders,
    validateSubject: validateSubject,
    validatePublicKey: validatePublicKey,
    validatePrivateKey: validatePrivateKey,
    validateExpiration: validateExpiration
};
}),
"[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/encryption-helper.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
const ece = __turbopack_context__.r("[project]/node_modules/.pnpm/http_ece@1.2.0/node_modules/http_ece/ece.js [app-route] (ecmascript)");
const encrypt = function(userPublicKey, userAuth, payload, contentEncoding) {
    if (!userPublicKey) {
        throw new Error('No user public key provided for encryption.');
    }
    if (typeof userPublicKey !== 'string') {
        throw new Error('The subscription p256dh value must be a string.');
    }
    if (Buffer.from(userPublicKey, 'base64url').length !== 65) {
        throw new Error('The subscription p256dh value should be 65 bytes long.');
    }
    if (!userAuth) {
        throw new Error('No user auth provided for encryption.');
    }
    if (typeof userAuth !== 'string') {
        throw new Error('The subscription auth key must be a string.');
    }
    if (Buffer.from(userAuth, 'base64url').length < 16) {
        throw new Error('The subscription auth key should be at least 16 ' + 'bytes long');
    }
    if (typeof payload !== 'string' && !Buffer.isBuffer(payload)) {
        throw new Error('Payload must be either a string or a Node Buffer.');
    }
    if (typeof payload === 'string' || payload instanceof String) {
        payload = Buffer.from(payload);
    }
    const localCurve = crypto.createECDH('prime256v1');
    const localPublicKey = localCurve.generateKeys();
    const salt = crypto.randomBytes(16).toString('base64url');
    const cipherText = ece.encrypt(payload, {
        version: contentEncoding,
        dh: userPublicKey,
        privateKey: localCurve,
        salt: salt,
        authSecret: userAuth
    });
    return {
        localPublicKey: localPublicKey,
        salt: salt,
        cipherText: cipherText
    };
};
module.exports = {
    encrypt: encrypt
};
}),
"[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-error.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function WebPushError(message, statusCode, headers, body, endpoint) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body;
    this.endpoint = endpoint;
}
__turbopack_context__.r("[externals]/util [external] (util, cjs)").inherits(WebPushError, Error);
module.exports = WebPushError;
}),
"[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-lib.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const url = __turbopack_context__.r("[externals]/url [external] (url, cjs)");
const https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
const WebPushError = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-error.js [app-route] (ecmascript)");
const vapidHelper = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/vapid-helper.js [app-route] (ecmascript)");
const encryptionHelper = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/encryption-helper.js [app-route] (ecmascript)");
const webPushConstants = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-constants.js [app-route] (ecmascript)");
const urlBase64Helper = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/urlsafe-base64-helper.js [app-route] (ecmascript)");
// Default TTL is four weeks.
const DEFAULT_TTL = 2419200;
let gcmAPIKey = '';
let vapidDetails;
function WebPushLib() {}
/**
 * When sending messages to a GCM endpoint you need to set the GCM API key
 * by either calling setGMAPIKey() or passing in the API key as an option
 * to sendNotification().
 * @param  {string} apiKey The API key to send with the GCM request.
 */ WebPushLib.prototype.setGCMAPIKey = function(apiKey) {
    if (apiKey === null) {
        gcmAPIKey = null;
        return;
    }
    if (typeof apiKey === 'undefined' || typeof apiKey !== 'string' || apiKey.length === 0) {
        throw new Error('The GCM API Key should be a non-empty string or null.');
    }
    gcmAPIKey = apiKey;
};
/**
 * When making requests where you want to define VAPID details, call this
 * method before sendNotification() or pass in the details and options to
 * sendNotification.
 * @param  {string} subject    This must be either a URL or a 'mailto:'
 * address. For example: 'https://my-site.com/contact' or
 * 'mailto: contact@my-site.com'
 * @param  {string} publicKey  The public VAPID key, a URL safe, base64 encoded string
 * @param  {string} privateKey The private VAPID key, a URL safe, base64 encoded string.
 */ WebPushLib.prototype.setVapidDetails = function(subject, publicKey, privateKey) {
    if (arguments.length === 1 && arguments[0] === null) {
        vapidDetails = null;
        return;
    }
    vapidHelper.validateSubject(subject);
    vapidHelper.validatePublicKey(publicKey);
    vapidHelper.validatePrivateKey(privateKey);
    vapidDetails = {
        subject: subject,
        publicKey: publicKey,
        privateKey: privateKey
    };
};
/**
   * To get the details of a request to trigger a push message, without sending
   * a push notification call this method.
   *
   * This method will throw an error if there is an issue with the input.
   * @param  {PushSubscription} subscription The PushSubscription you wish to
   * send the notification to.
   * @param  {string|Buffer} [payload]       The payload you wish to send to the
   * the user.
   * @param  {Object} [options]              Options for the GCM API key and
   * vapid keys can be passed in if they are unique for each notification you
   * wish to send.
   * @return {Object}                       This method returns an Object which
   * contains 'endpoint', 'method', 'headers' and 'payload'.
   */ WebPushLib.prototype.generateRequestDetails = function(subscription, payload, options) {
    if (!subscription || !subscription.endpoint) {
        throw new Error('You must pass in a subscription with at least ' + 'an endpoint.');
    }
    if (typeof subscription.endpoint !== 'string' || subscription.endpoint.length === 0) {
        throw new Error('The subscription endpoint must be a string with ' + 'a valid URL.');
    }
    if (payload) {
        // Validate the subscription keys
        if (typeof subscription !== 'object' || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
            throw new Error('To send a message with a payload, the ' + 'subscription must have \'auth\' and \'p256dh\' keys.');
        }
    }
    let currentGCMAPIKey = gcmAPIKey;
    let currentVapidDetails = vapidDetails;
    let timeToLive = DEFAULT_TTL;
    let extraHeaders = {};
    let contentEncoding = webPushConstants.supportedContentEncodings.AES_128_GCM;
    let urgency = webPushConstants.supportedUrgency.NORMAL;
    let topic;
    let proxy;
    let agent;
    let timeout;
    if (options) {
        const validOptionKeys = [
            'headers',
            'gcmAPIKey',
            'vapidDetails',
            'TTL',
            'contentEncoding',
            'urgency',
            'topic',
            'proxy',
            'agent',
            'timeout'
        ];
        const optionKeys = Object.keys(options);
        for(let i = 0; i < optionKeys.length; i += 1){
            const optionKey = optionKeys[i];
            if (!validOptionKeys.includes(optionKey)) {
                throw new Error('\'' + optionKey + '\' is an invalid option. ' + 'The valid options are [\'' + validOptionKeys.join('\', \'') + '\'].');
            }
        }
        if (options.headers) {
            extraHeaders = options.headers;
            let duplicates = Object.keys(extraHeaders).filter(function(header) {
                return typeof options[header] !== 'undefined';
            });
            if (duplicates.length > 0) {
                throw new Error('Duplicated headers defined [' + duplicates.join(',') + ']. Please either define the header in the' + 'top level options OR in the \'headers\' key.');
            }
        }
        if (options.gcmAPIKey) {
            currentGCMAPIKey = options.gcmAPIKey;
        }
        // Falsy values are allowed here so one can skip Vapid `else if` below and use FCM
        if (options.vapidDetails !== undefined) {
            currentVapidDetails = options.vapidDetails;
        }
        if (options.TTL !== undefined) {
            timeToLive = Number(options.TTL);
            if (timeToLive < 0) {
                throw new Error('TTL should be a number and should be at least 0');
            }
        }
        if (options.contentEncoding) {
            if (options.contentEncoding === webPushConstants.supportedContentEncodings.AES_128_GCM || options.contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
                contentEncoding = options.contentEncoding;
            } else {
                throw new Error('Unsupported content encoding specified.');
            }
        }
        if (options.urgency) {
            if (options.urgency === webPushConstants.supportedUrgency.VERY_LOW || options.urgency === webPushConstants.supportedUrgency.LOW || options.urgency === webPushConstants.supportedUrgency.NORMAL || options.urgency === webPushConstants.supportedUrgency.HIGH) {
                urgency = options.urgency;
            } else {
                throw new Error('Unsupported urgency specified.');
            }
        }
        if (options.topic) {
            if (!urlBase64Helper.validate(options.topic)) {
                throw new Error('Unsupported characters set use the URL or filename-safe Base64 characters set');
            }
            if (options.topic.length > 32) {
                throw new Error('use maximum of 32 characters from the URL or filename-safe Base64 characters set');
            }
            topic = options.topic;
        }
        if (options.proxy) {
            if (typeof options.proxy === 'string' || typeof options.proxy.host === 'string') {
                proxy = options.proxy;
            } else {
                console.warn('Attempt to use proxy option, but invalid type it should be a string or proxy options object.');
            }
        }
        if (options.agent) {
            if (options.agent instanceof https.Agent) {
                if (proxy) {
                    console.warn('Agent option will be ignored because proxy option is defined.');
                }
                agent = options.agent;
            } else {
                console.warn('Wrong type for the agent option, it should be an instance of https.Agent.');
            }
        }
        if (typeof options.timeout === 'number') {
            timeout = options.timeout;
        }
    }
    if (typeof timeToLive === 'undefined') {
        timeToLive = DEFAULT_TTL;
    }
    const requestDetails = {
        method: 'POST',
        headers: {
            TTL: timeToLive
        }
    };
    Object.keys(extraHeaders).forEach(function(header) {
        requestDetails.headers[header] = extraHeaders[header];
    });
    let requestPayload = null;
    if (payload) {
        const encrypted = encryptionHelper.encrypt(subscription.keys.p256dh, subscription.keys.auth, payload, contentEncoding);
        requestDetails.headers['Content-Length'] = encrypted.cipherText.length;
        requestDetails.headers['Content-Type'] = 'application/octet-stream';
        if (contentEncoding === webPushConstants.supportedContentEncodings.AES_128_GCM) {
            requestDetails.headers['Content-Encoding'] = webPushConstants.supportedContentEncodings.AES_128_GCM;
        } else if (contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
            requestDetails.headers['Content-Encoding'] = webPushConstants.supportedContentEncodings.AES_GCM;
            requestDetails.headers.Encryption = 'salt=' + encrypted.salt;
            requestDetails.headers['Crypto-Key'] = 'dh=' + encrypted.localPublicKey.toString('base64url');
        }
        requestPayload = encrypted.cipherText;
    } else {
        requestDetails.headers['Content-Length'] = 0;
    }
    const isGCM = subscription.endpoint.startsWith('https://android.googleapis.com/gcm/send');
    const isFCM = subscription.endpoint.startsWith('https://fcm.googleapis.com/fcm/send');
    // VAPID isn't supported by GCM hence the if, else if.
    if (isGCM) {
        if (!currentGCMAPIKey) {
            console.warn('Attempt to send push notification to GCM endpoint, ' + 'but no GCM key is defined. Please use setGCMApiKey() or add ' + '\'gcmAPIKey\' as an option.');
        } else {
            requestDetails.headers.Authorization = 'key=' + currentGCMAPIKey;
        }
    } else if (currentVapidDetails) {
        const parsedUrl = url.parse(subscription.endpoint);
        const audience = parsedUrl.protocol + '//' + parsedUrl.host;
        const vapidHeaders = vapidHelper.getVapidHeaders(audience, currentVapidDetails.subject, currentVapidDetails.publicKey, currentVapidDetails.privateKey, contentEncoding);
        requestDetails.headers.Authorization = vapidHeaders.Authorization;
        if (contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
            if (requestDetails.headers['Crypto-Key']) {
                requestDetails.headers['Crypto-Key'] += ';' + vapidHeaders['Crypto-Key'];
            } else {
                requestDetails.headers['Crypto-Key'] = vapidHeaders['Crypto-Key'];
            }
        }
    } else if (isFCM && currentGCMAPIKey) {
        requestDetails.headers.Authorization = 'key=' + currentGCMAPIKey;
    }
    requestDetails.headers.Urgency = urgency;
    if (topic) {
        requestDetails.headers.Topic = topic;
    }
    requestDetails.body = requestPayload;
    requestDetails.endpoint = subscription.endpoint;
    if (proxy) {
        requestDetails.proxy = proxy;
    }
    if (agent) {
        requestDetails.agent = agent;
    }
    if (timeout) {
        requestDetails.timeout = timeout;
    }
    return requestDetails;
};
/**
 * To send a push notification call this method with a subscription, optional
 * payload and any options.
 * @param  {PushSubscription} subscription The PushSubscription you wish to
 * send the notification to.
 * @param  {string|Buffer} [payload]       The payload you wish to send to the
 * the user.
 * @param  {Object} [options]              Options for the GCM API key and
 * vapid keys can be passed in if they are unique for each notification you
 * wish to send.
 * @return {Promise}                       This method returns a Promise which
 * resolves if the sending of the notification was successful, otherwise it
 * rejects.
 */ WebPushLib.prototype.sendNotification = function(subscription, payload, options) {
    let requestDetails;
    try {
        requestDetails = this.generateRequestDetails(subscription, payload, options);
    } catch (err) {
        return Promise.reject(err);
    }
    return new Promise(function(resolve, reject) {
        const httpsOptions = {};
        const urlParts = url.parse(requestDetails.endpoint);
        httpsOptions.hostname = urlParts.hostname;
        httpsOptions.port = urlParts.port;
        httpsOptions.path = urlParts.path;
        httpsOptions.headers = requestDetails.headers;
        httpsOptions.method = requestDetails.method;
        if (requestDetails.timeout) {
            httpsOptions.timeout = requestDetails.timeout;
        }
        if (requestDetails.agent) {
            httpsOptions.agent = requestDetails.agent;
        }
        if (requestDetails.proxy) {
            const { HttpsProxyAgent } = __turbopack_context__.r("[project]/node_modules/.pnpm/https-proxy-agent@7.0.6/node_modules/https-proxy-agent/dist/index.js [app-route] (ecmascript)"); // eslint-disable-line global-require
            httpsOptions.agent = new HttpsProxyAgent(requestDetails.proxy);
        }
        const pushRequest = https.request(httpsOptions, function(pushResponse) {
            let responseText = '';
            pushResponse.on('data', function(chunk) {
                responseText += chunk;
            });
            pushResponse.on('end', function() {
                if (pushResponse.statusCode < 200 || pushResponse.statusCode > 299) {
                    reject(new WebPushError('Received unexpected response code', pushResponse.statusCode, pushResponse.headers, responseText, requestDetails.endpoint));
                } else {
                    resolve({
                        statusCode: pushResponse.statusCode,
                        body: responseText,
                        headers: pushResponse.headers
                    });
                }
            });
        });
        if (requestDetails.timeout) {
            pushRequest.on('timeout', function() {
                pushRequest.destroy(new Error('Socket timeout'));
            });
        }
        pushRequest.on('error', function(e) {
            reject(e);
        });
        if (requestDetails.body) {
            pushRequest.write(requestDetails.body);
        }
        pushRequest.end();
    });
};
module.exports = WebPushLib;
}),
"[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const vapidHelper = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/vapid-helper.js [app-route] (ecmascript)");
const encryptionHelper = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/encryption-helper.js [app-route] (ecmascript)");
const WebPushLib = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-lib.js [app-route] (ecmascript)");
const WebPushError = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-error.js [app-route] (ecmascript)");
const WebPushConstants = __turbopack_context__.r("[project]/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-constants.js [app-route] (ecmascript)");
const webPush = new WebPushLib();
module.exports = {
    WebPushError: WebPushError,
    supportedContentEncodings: WebPushConstants.supportedContentEncodings,
    encrypt: encryptionHelper.encrypt,
    getVapidHeaders: vapidHelper.getVapidHeaders,
    generateVAPIDKeys: vapidHelper.generateVAPIDKeys,
    setGCMAPIKey: webPush.setGCMAPIKey,
    setVapidDetails: webPush.setVapidDetails,
    generateRequestDetails: webPush.generateRequestDetails,
    sendNotification: webPush.sendNotification.bind(webPush)
};
}),
"[project]/node_modules/.pnpm/http_ece@1.2.0/node_modules/http_ece/ece.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Encrypted content coding
 *
 * === Note about versions ===
 *
 * This code supports multiple versions of the draft.  This is selected using
 * the |version| parameter.
 *
 * aes128gcm: The most recent version, the salt, record size and key identifier
 *    are included in a header that is part of the encrypted content coding.
 *
 * aesgcm: The version that is widely deployed with WebPush (as of 2016-11).
 *    This version is selected by default, unless you specify a |padSize| of 1.
 */ var crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
var AES_GCM = 'aes-128-gcm';
var PAD_SIZE = {
    'aes128gcm': 1,
    'aesgcm': 2
};
var TAG_LENGTH = 16;
var KEY_LENGTH = 16;
var NONCE_LENGTH = 12;
var SHA_256_LENGTH = 32;
var MODE_ENCRYPT = 'encrypt';
var MODE_DECRYPT = 'decrypt';
var keylog;
if (process.env.ECE_KEYLOG === '1') {
    keylog = function(m, k) {
        console.warn(m + ' [' + k.length + ']: ' + k.toString('base64url'));
        return k;
    };
} else {
    keylog = function(m, k) {
        return k;
    };
}
/* Optionally base64 decode something. */ function decode(b) {
    if (typeof b === 'string') {
        return Buffer.from(b, 'base64url');
    }
    return b;
}
function HMAC_hash(key, input) {
    var hmac = crypto.createHmac('sha256', key);
    hmac.update(input);
    return hmac.digest();
}
/* HKDF as defined in RFC5869, using SHA-256 */ function HKDF_extract(salt, ikm) {
    keylog('salt', salt);
    keylog('ikm', ikm);
    return keylog('extract', HMAC_hash(salt, ikm));
}
function HKDF_expand(prk, info, l) {
    keylog('prk', prk);
    keylog('info', info);
    var output = Buffer.alloc(0);
    var T = Buffer.alloc(0);
    info = Buffer.from(info, 'ascii');
    var counter = 0;
    var cbuf = Buffer.alloc(1);
    while(output.length < l){
        cbuf.writeUIntBE(++counter, 0, 1);
        T = HMAC_hash(prk, Buffer.concat([
            T,
            info,
            cbuf
        ]));
        output = Buffer.concat([
            output,
            T
        ]);
    }
    return keylog('expand', output.slice(0, l));
}
function HKDF(salt, ikm, info, len) {
    return HKDF_expand(HKDF_extract(salt, ikm), info, len);
}
function info(base, context) {
    var result = Buffer.concat([
        Buffer.from('Content-Encoding: ' + base + '\0', 'ascii'),
        context
    ]);
    keylog('info ' + base, result);
    return result;
}
function lengthPrefix(buffer) {
    var b = Buffer.concat([
        Buffer.alloc(2),
        buffer
    ]);
    b.writeUIntBE(buffer.length, 0, 2);
    return b;
}
function extractDH(header, mode) {
    var key = header.privateKey;
    var senderPubKey, receiverPubKey;
    if (mode === MODE_ENCRYPT) {
        senderPubKey = key.getPublicKey();
        receiverPubKey = header.dh;
    } else if (mode === MODE_DECRYPT) {
        senderPubKey = header.dh;
        receiverPubKey = key.getPublicKey();
    } else {
        throw new Error('Unknown mode only ' + MODE_ENCRYPT + ' and ' + MODE_DECRYPT + ' supported');
    }
    return {
        secret: key.computeSecret(header.dh),
        context: Buffer.concat([
            Buffer.from(header.keylabel, 'ascii'),
            Buffer.from([
                0
            ]),
            lengthPrefix(receiverPubKey),
            lengthPrefix(senderPubKey) // application server
        ])
    };
}
function extractSecretAndContext(header, mode) {
    var result = {
        secret: null,
        context: Buffer.alloc(0)
    };
    if (header.key) {
        result.secret = header.key;
        if (result.secret.length !== KEY_LENGTH) {
            throw new Error('An explicit key must be ' + KEY_LENGTH + ' bytes');
        }
    } else if (header.dh) {
        result = extractDH(header, mode);
    } else if (typeof header.keyid !== undefined) {
        result.secret = header.keymap[header.keyid];
    }
    if (!result.secret) {
        throw new Error('Unable to determine key');
    }
    keylog('secret', result.secret);
    keylog('context', result.context);
    if (header.authSecret) {
        result.secret = HKDF(header.authSecret, result.secret, info('auth', Buffer.alloc(0)), SHA_256_LENGTH);
        keylog('authsecret', result.secret);
    }
    return result;
}
function webpushSecret(header, mode) {
    if (!header.authSecret) {
        throw new Error('No authentication secret for webpush');
    }
    keylog('authsecret', header.authSecret);
    var remotePubKey, senderPubKey, receiverPubKey;
    if (mode === MODE_ENCRYPT) {
        senderPubKey = header.privateKey.getPublicKey();
        remotePubKey = receiverPubKey = header.dh;
    } else if (mode === MODE_DECRYPT) {
        remotePubKey = senderPubKey = header.keyid;
        receiverPubKey = header.privateKey.getPublicKey();
    } else {
        throw new Error('Unknown mode only ' + MODE_ENCRYPT + ' and ' + MODE_DECRYPT + ' supported');
    }
    keylog('remote pubkey', remotePubKey);
    keylog('sender pubkey', senderPubKey);
    keylog('receiver pubkey', receiverPubKey);
    return keylog('secret dh', HKDF(header.authSecret, header.privateKey.computeSecret(remotePubKey), Buffer.concat([
        Buffer.from('WebPush: info\0'),
        receiverPubKey,
        senderPubKey
    ]), SHA_256_LENGTH));
}
function extractSecret(header, mode, keyLookupCallback) {
    if (keyLookupCallback) {
        if (!isFunction(keyLookupCallback)) {
            throw new Error('Callback is not a function');
        }
    }
    if (header.key) {
        if (header.key.length !== KEY_LENGTH) {
            throw new Error('An explicit key must be ' + KEY_LENGTH + ' bytes');
        }
        return keylog('secret key', header.key);
    }
    if (!header.privateKey) {
        // Lookup based on keyid
        if (!keyLookupCallback) {
            var key = header.keymap && header.keymap[header.keyid];
        } else {
            var key = keyLookupCallback(header.keyid);
        }
        if (!key) {
            throw new Error('No saved key (keyid: "' + header.keyid + '")');
        }
        return key;
    }
    return webpushSecret(header, mode);
}
function deriveKeyAndNonce(header, mode, lookupKeyCallback) {
    if (!header.salt) {
        throw new Error('must include a salt parameter for ' + header.version);
    }
    var keyInfo;
    var nonceInfo;
    var secret;
    if (header.version === 'aesgcm') {
        // old
        var s = extractSecretAndContext(header, mode, lookupKeyCallback);
        keyInfo = info('aesgcm', s.context);
        nonceInfo = info('nonce', s.context);
        secret = s.secret;
    } else if (header.version === 'aes128gcm') {
        // latest
        keyInfo = Buffer.from('Content-Encoding: aes128gcm\0');
        nonceInfo = Buffer.from('Content-Encoding: nonce\0');
        secret = extractSecret(header, mode, lookupKeyCallback);
    } else {
        throw new Error('Unable to set context for mode ' + header.version);
    }
    var prk = HKDF_extract(header.salt, secret);
    var result = {
        key: HKDF_expand(prk, keyInfo, KEY_LENGTH),
        nonce: HKDF_expand(prk, nonceInfo, NONCE_LENGTH)
    };
    keylog('key', result.key);
    keylog('nonce base', result.nonce);
    return result;
}
/* Parse command-line arguments. */ function parseParams(params) {
    var header = {};
    header.version = params.version || 'aes128gcm';
    header.rs = parseInt(params.rs, 10);
    if (isNaN(header.rs)) {
        header.rs = 4096;
    }
    var overhead = PAD_SIZE[header.version];
    if (header.version === 'aes128gcm') {
        overhead += TAG_LENGTH;
    }
    if (header.rs <= overhead) {
        throw new Error('The rs parameter has to be greater than ' + overhead);
    }
    if (params.salt) {
        header.salt = decode(params.salt);
        if (header.salt.length !== KEY_LENGTH) {
            throw new Error('The salt parameter must be ' + KEY_LENGTH + ' bytes');
        }
    }
    header.keyid = params.keyid;
    if (params.key) {
        header.key = decode(params.key);
    } else {
        header.privateKey = params.privateKey;
        if (!header.privateKey) {
            header.keymap = params.keymap;
        }
        if (header.version !== 'aes128gcm') {
            header.keylabel = params.keylabel || 'P-256';
        }
        if (params.dh) {
            header.dh = decode(params.dh);
        }
    }
    if (params.authSecret) {
        header.authSecret = decode(params.authSecret);
    }
    return header;
}
function generateNonce(base, counter) {
    var nonce = Buffer.from(base);
    var m = nonce.readUIntBE(nonce.length - 6, 6);
    var x = ((m ^ counter) & 0xffffff) + ((m / 0x1000000 ^ counter / 0x1000000) & 0xffffff) * 0x1000000;
    nonce.writeUIntBE(x, nonce.length - 6, 6);
    keylog('nonce' + counter, nonce);
    return nonce;
}
/* Used when decrypting aes128gcm to populate the header values. Modifies the
 * header values in place and returns the size of the header. */ function readHeader(buffer, header) {
    var idsz = buffer.readUIntBE(20, 1);
    header.salt = buffer.slice(0, KEY_LENGTH);
    header.rs = buffer.readUIntBE(KEY_LENGTH, 4);
    header.keyid = buffer.slice(21, 21 + idsz);
    return 21 + idsz;
}
function unpadLegacy(data, version) {
    var padSize = PAD_SIZE[version];
    var pad = data.readUIntBE(0, padSize);
    if (pad + padSize > data.length) {
        throw new Error('padding exceeds block size');
    }
    keylog('padding', data.slice(0, padSize + pad));
    var padCheck = Buffer.alloc(pad);
    padCheck.fill(0);
    if (padCheck.compare(data.slice(padSize, padSize + pad)) !== 0) {
        throw new Error('invalid padding');
    }
    return data.slice(padSize + pad);
}
function unpad(data, last) {
    var i = data.length - 1;
    while(i >= 0){
        if (data[i]) {
            if (last) {
                if (data[i] !== 2) {
                    throw new Error('last record needs to start padding with a 2');
                }
            } else {
                if (data[i] !== 1) {
                    throw new Error('last record needs to start padding with a 2');
                }
            }
            return data.slice(0, i);
        }
        --i;
    }
    throw new Error('all zero plaintext');
}
function decryptRecord(key, counter, buffer, header, last) {
    keylog('decrypt', buffer);
    var nonce = generateNonce(key.nonce, counter);
    var gcm = crypto.createDecipheriv(AES_GCM, key.key, nonce);
    gcm.setAuthTag(buffer.slice(buffer.length - TAG_LENGTH));
    var data = gcm.update(buffer.slice(0, buffer.length - TAG_LENGTH));
    data = Buffer.concat([
        data,
        gcm.final()
    ]);
    keylog('decrypted', data);
    if (header.version !== 'aes128gcm') {
        return unpadLegacy(data, header.version);
    }
    return unpad(data, last);
}
/**
 * Decrypt some bytes.  This uses the parameters to determine the key and block
 * size, which are described in the draft.  Binary values are base64url encoded.
 *
 * |params.version| contains the version of encoding to use: aes128gcm is the latest,
 * but aesgcm is also accepted (though the latter might
 * disappear in a future release).  If omitted, assume aes128gcm.
 *
 * If |params.key| is specified, that value is used as the key.
 *
 * If the version is aes128gcm, the keyid is extracted from the header and used
 * as the ECDH public key of the sender.  For version aesgcm ,
 * |params.dh| needs to be provided with the public key of the sender.
 *
 * The |params.privateKey| includes the private key of the receiver.
 */ function decrypt(buffer, params, keyLookupCallback) {
    var header = parseParams(params);
    if (header.version === 'aes128gcm') {
        var headerLength = readHeader(buffer, header);
        buffer = buffer.slice(headerLength);
    }
    var key = deriveKeyAndNonce(header, MODE_DECRYPT, keyLookupCallback);
    var start = 0;
    var result = Buffer.alloc(0);
    var chunkSize = header.rs;
    if (header.version !== 'aes128gcm') {
        chunkSize += TAG_LENGTH;
    }
    for(var i = 0; start < buffer.length; ++i){
        var end = start + chunkSize;
        if (header.version !== 'aes128gcm' && end === buffer.length) {
            throw new Error('Truncated payload');
        }
        end = Math.min(end, buffer.length);
        if (end - start <= TAG_LENGTH) {
            throw new Error('Invalid block: too small at ' + i);
        }
        var block = decryptRecord(key, i, buffer.slice(start, end), header, end >= buffer.length);
        result = Buffer.concat([
            result,
            block
        ]);
        start = end;
    }
    return result;
}
function encryptRecord(key, counter, buffer, pad, header, last) {
    keylog('encrypt', buffer);
    pad = pad || 0;
    var nonce = generateNonce(key.nonce, counter);
    var gcm = crypto.createCipheriv(AES_GCM, key.key, nonce);
    var ciphertext = [];
    var padSize = PAD_SIZE[header.version];
    var padding = Buffer.alloc(pad + padSize);
    padding.fill(0);
    if (header.version !== 'aes128gcm') {
        padding.writeUIntBE(pad, 0, padSize);
        keylog('padding', padding);
        ciphertext.push(gcm.update(padding));
        ciphertext.push(gcm.update(buffer));
        if (!last && padding.length + buffer.length < header.rs) {
            throw new Error('Unable to pad to record size');
        }
    } else {
        ciphertext.push(gcm.update(buffer));
        padding.writeUIntBE(last ? 2 : 1, 0, 1);
        keylog('padding', padding);
        ciphertext.push(gcm.update(padding));
    }
    gcm.final();
    var tag = gcm.getAuthTag();
    if (tag.length !== TAG_LENGTH) {
        throw new Error('invalid tag generated');
    }
    ciphertext.push(tag);
    return keylog('encrypted', Buffer.concat(ciphertext));
}
function writeHeader(header) {
    var ints = Buffer.alloc(5);
    var keyid = Buffer.from(header.keyid || []);
    if (keyid.length > 255) {
        throw new Error('keyid is too large');
    }
    ints.writeUIntBE(header.rs, 0, 4);
    ints.writeUIntBE(keyid.length, 4, 1);
    return Buffer.concat([
        header.salt,
        ints,
        keyid
    ]);
}
/**
 * Encrypt some bytes.  This uses the parameters to determine the key and block
 * size, which are described in the draft.
 *
 * |params.version| contains the version of encoding to use: aes128gcm is the latest,
 * but aesgcm is also accepted (though the latter two might
 * disappear in a future release).  If omitted, assume aes128gcm.
 *
 * If |params.key| is specified, that value is used as the key.
 *
 * For Diffie-Hellman (WebPush), |params.dh| includes the public key of the
 * receiver.  |params.privateKey| is used to establish a shared secret.  Key
 * pairs can be created using |crypto.createECDH()|.
 */ function encrypt(buffer, params, keyLookupCallback) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('buffer argument must be a Buffer');
    }
    var header = parseParams(params);
    if (!header.salt) {
        header.salt = crypto.randomBytes(KEY_LENGTH);
    }
    var result;
    if (header.version === 'aes128gcm') {
        // Save the DH public key in the header unless keyid is set.
        if (header.privateKey && !header.keyid) {
            header.keyid = header.privateKey.getPublicKey();
        }
        result = writeHeader(header);
    } else {
        // No header on other versions
        result = Buffer.alloc(0);
    }
    var key = deriveKeyAndNonce(header, MODE_ENCRYPT, keyLookupCallback);
    var start = 0;
    var padSize = PAD_SIZE[header.version];
    var overhead = padSize;
    if (header.version === 'aes128gcm') {
        overhead += TAG_LENGTH;
    }
    var pad = isNaN(parseInt(params.pad, 10)) ? 0 : parseInt(params.pad, 10);
    var counter = 0;
    var last = false;
    while(!last){
        // Pad so that at least one data byte is in a block.
        var recordPad = Math.min(header.rs - overhead - 1, pad);
        if (header.version !== 'aes128gcm') {
            recordPad = Math.min((1 << padSize * 8) - 1, recordPad);
        }
        if (pad > 0 && recordPad === 0) {
            ++recordPad; // Deal with perverse case of rs=overhead+1 with padding.
        }
        pad -= recordPad;
        var end = start + header.rs - overhead - recordPad;
        if (header.version !== 'aes128gcm') {
            // The > here ensures that we write out a padding-only block at the end
            // of a buffer.
            last = end > buffer.length;
        } else {
            last = end >= buffer.length;
        }
        last = last && pad <= 0;
        var block = encryptRecord(key, counter, buffer.slice(start, end), recordPad, header, last);
        result = Buffer.concat([
            result,
            block
        ]);
        start = end;
        ++counter;
    }
    return result;
}
function isFunction(object) {
    return typeof object === 'function';
}
module.exports = {
    decrypt: decrypt,
    encrypt: encrypt
};
}),
"[project]/node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Helpers.
 */ var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */ module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
        return parse(val);
    } else if (type === 'number' && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};
/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */ function parse(str) {
    str = String(str);
    if (str.length > 100) {
        return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch(type){
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            return undefined;
    }
}
/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return Math.round(ms / d) + 'd';
    }
    if (msAbs >= h) {
        return Math.round(ms / h) + 'h';
    }
    if (msAbs >= m) {
        return Math.round(ms / m) + 'm';
    }
    if (msAbs >= s) {
        return Math.round(ms / s) + 's';
    }
    return ms + 'ms';
}
/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return ms + ' ms';
}
/**
 * Pluralization helper.
 */ function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}
}),
"[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/common.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */ function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = __turbopack_context__.r("[project]/node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js [app-route] (ecmascript)");
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key)=>{
        createDebug[key] = env[key];
    });
    /**
	* The currently active debug mode names, and names to skip.
	*/ createDebug.names = [];
    createDebug.skips = [];
    /**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/ createDebug.formatters = {};
    /**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/ function selectColor(namespace) {
        let hash = 0;
        for(let i = 0; i < namespace.length; i++){
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    /**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/ function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
            // Disabled?
            if (!debug.enabled) {
                return;
            }
            const self = debug;
            // Set `diff` timestamp
            const curr = Number(new Date());
            const ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;
            args[0] = createDebug.coerce(args[0]);
            if (typeof args[0] !== 'string') {
                // Anything else let's inspect with %O
                args.unshift('%O');
            }
            // Apply any `formatters` transformations
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format)=>{
                // If we encounter an escaped % then don't increase the array index
                if (match === '%%') {
                    return '%';
                }
                index++;
                const formatter = createDebug.formatters[format];
                if (typeof formatter === 'function') {
                    const val = args[index];
                    match = formatter.call(self, val);
                    // Now we need to remove `args[index]` since it's inlined in the `format`
                    args.splice(index, 1);
                    index--;
                }
                return match;
            });
            // Apply env-specific formatting (colors, etc.)
            createDebug.formatArgs.call(self, args);
            const logFn = self.log || createDebug.log;
            logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.
        Object.defineProperty(debug, 'enabled', {
            enumerable: true,
            configurable: false,
            get: ()=>{
                if (enableOverride !== null) {
                    return enableOverride;
                }
                if (namespacesCache !== createDebug.namespaces) {
                    namespacesCache = createDebug.namespaces;
                    enabledCache = createDebug.enabled(namespace);
                }
                return enabledCache;
            },
            set: (v)=>{
                enableOverride = v;
            }
        });
        // Env-specific initialization logic for debug instances
        if (typeof createDebug.init === 'function') {
            createDebug.init(debug);
        }
        return debug;
    }
    function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
    }
    /**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/ function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === 'string' ? namespaces : '').trim().replace(/\s+/g, ',').split(',').filter(Boolean);
        for (const ns of split){
            if (ns[0] === '-') {
                createDebug.skips.push(ns.slice(1));
            } else {
                createDebug.names.push(ns);
            }
        }
    }
    /**
	 * Checks if the given string matches a namespace template, honoring
	 * asterisks as wildcards.
	 *
	 * @param {String} search
	 * @param {String} template
	 * @return {Boolean}
	 */ function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while(searchIndex < search.length){
            if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
                // Match character or proceed with wildcard
                if (template[templateIndex] === '*') {
                    starIndex = templateIndex;
                    matchIndex = searchIndex;
                    templateIndex++; // Skip the '*'
                } else {
                    searchIndex++;
                    templateIndex++;
                }
            } else if (starIndex !== -1) {
                // Backtrack to the last '*' and try to match more characters
                templateIndex = starIndex + 1;
                matchIndex++;
                searchIndex = matchIndex;
            } else {
                return false; // No match
            }
        }
        // Handle trailing '*' in template
        while(templateIndex < template.length && template[templateIndex] === '*'){
            templateIndex++;
        }
        return templateIndex === template.length;
    }
    /**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/ function disable() {
        const namespaces = [
            ...createDebug.names,
            ...createDebug.skips.map((namespace)=>'-' + namespace)
        ].join(',');
        createDebug.enable('');
        return namespaces;
    }
    /**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/ function enabled(name) {
        for (const skip of createDebug.skips){
            if (matchesTemplate(name, skip)) {
                return false;
            }
        }
        for (const ns of createDebug.names){
            if (matchesTemplate(name, ns)) {
                return true;
            }
        }
        return false;
    }
    /**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/ function coerce(val) {
        if (val instanceof Error) {
            return val.stack || val.message;
        }
        return val;
    }
    /**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/ function destroy() {
        console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    }
    createDebug.enable(createDebug.load());
    return createDebug;
}
module.exports = setup;
}),
"[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/node.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Module dependencies.
 */ const tty = __turbopack_context__.r("[externals]/tty [external] (tty, cjs)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/**
 * This is the Node.js implementation of `debug()`.
 */ exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(()=>{}, 'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
/**
 * Colors.
 */ exports.colors = [
    6,
    2,
    3,
    4,
    5,
    1
];
try {
    // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
    // eslint-disable-next-line import/no-extraneous-dependencies
    const supportsColor = __turbopack_context__.r("[project]/node_modules/.pnpm/supports-color@7.2.0/node_modules/supports-color/index.js [app-route] (ecmascript)");
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
            20,
            21,
            26,
            27,
            32,
            33,
            38,
            39,
            40,
            41,
            42,
            43,
            44,
            45,
            56,
            57,
            62,
            63,
            68,
            69,
            74,
            75,
            76,
            77,
            78,
            79,
            80,
            81,
            92,
            93,
            98,
            99,
            112,
            113,
            128,
            129,
            134,
            135,
            148,
            149,
            160,
            161,
            162,
            163,
            164,
            165,
            166,
            167,
            168,
            169,
            170,
            171,
            172,
            173,
            178,
            179,
            184,
            185,
            196,
            197,
            198,
            199,
            200,
            201,
            202,
            203,
            204,
            205,
            206,
            207,
            208,
            209,
            214,
            215,
            220,
            221
        ];
    }
} catch (error) {
// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}
/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */ exports.inspectOpts = Object.keys(process.env).filter((key)=>{
    return /^debug_/i.test(key);
}).reduce((obj, key)=>{
    // Camel-case
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k)=>{
        return k.toUpperCase();
    });
    // Coerce string value into JS value
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
    } else if (val === 'null') {
        val = null;
    } else {
        val = Number(val);
    }
    obj[prop] = val;
    return obj;
}, {});
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */ function useColors() {
    return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
}
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    const { namespace: name, useColors } = this;
    if (useColors) {
        const c = this.color;
        const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
        const prefix = `  ${colorCode};1m${name} \u001B[0m`;
        args[0] = prefix + args[0].split('\n').join('\n' + prefix);
        args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
    } else {
        args[0] = getDate() + name + ' ' + args[0];
    }
}
function getDate() {
    if (exports.inspectOpts.hideDate) {
        return '';
    }
    return new Date().toISOString() + ' ';
}
/**
 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
 */ function log(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    if (namespaces) {
        process.env.DEBUG = namespaces;
    } else {
        // If you set a process.env field to null or undefined, it gets cast to the
        // string 'null' or 'undefined'. Just delete instead.
        delete process.env.DEBUG;
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    return process.env.DEBUG;
}
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */ function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for(let i = 0; i < keys.length; i++){
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
}
module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/common.js [app-route] (ecmascript)")(exports);
const { formatters } = module.exports;
/**
 * Map %o to `util.inspect()`, all on a single line.
 */ formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split('\n').map((str)=>str.trim()).join(' ');
};
/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */ formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
};
}),
"[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/browser.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/* eslint-env browser */ /**
 * This is the web browser implementation of `debug()`.
 */ exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (()=>{
    let warned = false;
    return ()=>{
        if (!warned) {
            warned = true;
            console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
        }
    };
})();
/**
 * Colors.
 */ exports.colors = [
    '#0000CC',
    '#0000FF',
    '#0033CC',
    '#0033FF',
    '#0066CC',
    '#0066FF',
    '#0099CC',
    '#0099FF',
    '#00CC00',
    '#00CC33',
    '#00CC66',
    '#00CC99',
    '#00CCCC',
    '#00CCFF',
    '#3300CC',
    '#3300FF',
    '#3333CC',
    '#3333FF',
    '#3366CC',
    '#3366FF',
    '#3399CC',
    '#3399FF',
    '#33CC00',
    '#33CC33',
    '#33CC66',
    '#33CC99',
    '#33CCCC',
    '#33CCFF',
    '#6600CC',
    '#6600FF',
    '#6633CC',
    '#6633FF',
    '#66CC00',
    '#66CC33',
    '#9900CC',
    '#9900FF',
    '#9933CC',
    '#9933FF',
    '#99CC00',
    '#99CC33',
    '#CC0000',
    '#CC0033',
    '#CC0066',
    '#CC0099',
    '#CC00CC',
    '#CC00FF',
    '#CC3300',
    '#CC3333',
    '#CC3366',
    '#CC3399',
    '#CC33CC',
    '#CC33FF',
    '#CC6600',
    '#CC6633',
    '#CC9900',
    '#CC9933',
    '#CCCC00',
    '#CCCC33',
    '#FF0000',
    '#FF0033',
    '#FF0066',
    '#FF0099',
    '#FF00CC',
    '#FF00FF',
    '#FF3300',
    '#FF3333',
    '#FF3366',
    '#FF3399',
    '#FF33CC',
    '#FF33FF',
    '#FF6600',
    '#FF6633',
    '#FF9900',
    '#FF9933',
    '#FFCC00',
    '#FFCC33'
];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */ // eslint-disable-next-line complexity
function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
    }
    let m;
    // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    // eslint-disable-next-line no-return-assign
    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || ("TURBOPACK compile-time value", "undefined") !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);
    if (!this.useColors) {
        return;
    }
    const c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit');
    // The final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match)=>{
        if (match === '%%') {
            return;
        }
        index++;
        if (match === '%c') {
            // We only are interested in the *last* %c
            // (the user may have provided their own)
            lastC = index;
        }
    });
    args.splice(lastC, 0, c);
}
/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */ exports.log = console.debug || console.log || (()=>{});
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    try {
        if (namespaces) {
            exports.storage.setItem('debug', namespaces);
        } else {
            exports.storage.removeItem('debug');
        }
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    let r;
    try {
        r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG');
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
        r = process.env.DEBUG;
    }
    return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */ function localstorage() {
    try {
        // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
        // The Browser also has localStorage in the global context.
        return localStorage;
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/common.js [app-route] (ecmascript)")(exports);
const { formatters } = module.exports;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */ formatters.j = function(v) {
    try {
        return JSON.stringify(v);
    } catch (error) {
        return '[UnexpectedJSONParseError]: ' + error.message;
    }
};
}),
"[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */ if (typeof process === 'undefined' || process.type === 'renderer' || ("TURBOPACK compile-time value", false) === true || process.__nwjs) {
    module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/browser.js [app-route] (ecmascript)");
} else {
    module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/node.js [app-route] (ecmascript)");
}
}),
"[project]/node_modules/.pnpm/has-flag@4.0.0/node_modules/has-flag/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = (flag, argv = process.argv)=>{
    const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf('--');
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};
}),
"[project]/node_modules/.pnpm/supports-color@7.2.0/node_modules/supports-color/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const os = __turbopack_context__.r("[externals]/os [external] (os, cjs)");
const tty = __turbopack_context__.r("[externals]/tty [external] (tty, cjs)");
const hasFlag = __turbopack_context__.r("[project]/node_modules/.pnpm/has-flag@4.0.0/node_modules/has-flag/index.js [app-route] (ecmascript)");
const { env } = process;
let forceColor;
if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false') || hasFlag('color=never')) {
    forceColor = 0;
} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true') || hasFlag('color=always')) {
    forceColor = 1;
}
if ('FORCE_COLOR' in env) {
    if (env.FORCE_COLOR === 'true') {
        forceColor = 1;
    } else if (env.FORCE_COLOR === 'false') {
        forceColor = 0;
    } else {
        forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
}
function translateLevel(level) {
    if (level === 0) {
        return false;
    }
    return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
    };
}
function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
        return 0;
    }
    if (hasFlag('color=16m') || hasFlag('color=full') || hasFlag('color=truecolor')) {
        return 3;
    }
    if (hasFlag('color=256')) {
        return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === undefined) {
        return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === 'dumb') {
        return min;
    }
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ('CI' in env) {
        if ([
            'TRAVIS',
            'CIRCLECI',
            'APPVEYOR',
            'GITLAB_CI',
            'GITHUB_ACTIONS',
            'BUILDKITE'
        ].some((sign)=>sign in env) || env.CI_NAME === 'codeship') {
            return 1;
        }
        return min;
    }
    if ('TEAMCITY_VERSION' in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === 'truecolor') {
        return 3;
    }
    if ('TERM_PROGRAM' in env) {
        const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);
        switch(env.TERM_PROGRAM){
            case 'iTerm.app':
                return version >= 3 ? 3 : 2;
            case 'Apple_Terminal':
                return 2;
        }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
    }
    if ('COLORTERM' in env) {
        return 1;
    }
    return min;
}
function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
}
module.exports = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};
}),
"[project]/node_modules/.pnpm/agent-base@7.1.4/node_modules/agent-base/dist/helpers.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.req = exports.json = exports.toBuffer = void 0;
const http = __importStar(__turbopack_context__.r("[externals]/http [external] (http, cjs)"));
const https = __importStar(__turbopack_context__.r("[externals]/https [external] (https, cjs)"));
async function toBuffer(stream) {
    let length = 0;
    const chunks = [];
    for await (const chunk of stream){
        length += chunk.length;
        chunks.push(chunk);
    }
    return Buffer.concat(chunks, length);
}
exports.toBuffer = toBuffer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(stream) {
    const buf = await toBuffer(stream);
    const str = buf.toString('utf8');
    try {
        return JSON.parse(str);
    } catch (_err) {
        const err = _err;
        err.message += ` (input: ${str})`;
        throw err;
    }
}
exports.json = json;
function req(url, opts = {}) {
    const href = typeof url === 'string' ? url : url.href;
    const req1 = (href.startsWith('https:') ? https : http).request(url, opts);
    const promise = new Promise((resolve, reject)=>{
        req1.once('response', resolve).once('error', reject).end();
    });
    req1.then = promise.then.bind(promise);
    return req1;
}
exports.req = req; //# sourceMappingURL=helpers.js.map
}),
"[project]/node_modules/.pnpm/agent-base@7.1.4/node_modules/agent-base/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Agent = void 0;
const net = __importStar(__turbopack_context__.r("[externals]/net [external] (net, cjs)"));
const http = __importStar(__turbopack_context__.r("[externals]/http [external] (http, cjs)"));
const https_1 = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
__exportStar(__turbopack_context__.r("[project]/node_modules/.pnpm/agent-base@7.1.4/node_modules/agent-base/dist/helpers.js [app-route] (ecmascript)"), exports);
const INTERNAL = Symbol('AgentBaseInternalState');
class Agent extends http.Agent {
    constructor(opts){
        super(opts);
        this[INTERNAL] = {};
    }
    /**
     * Determine whether this is an `http` or `https` request.
     */ isSecureEndpoint(options) {
        if (options) {
            // First check the `secureEndpoint` property explicitly, since this
            // means that a parent `Agent` is "passing through" to this instance.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof options.secureEndpoint === 'boolean') {
                return options.secureEndpoint;
            }
            // If no explicit `secure` endpoint, check if `protocol` property is
            // set. This will usually be the case since using a full string URL
            // or `URL` instance should be the most common usage.
            if (typeof options.protocol === 'string') {
                return options.protocol === 'https:';
            }
        }
        // Finally, if no `protocol` property was set, then fall back to
        // checking the stack trace of the current call stack, and try to
        // detect the "https" module.
        const { stack } = new Error();
        if (typeof stack !== 'string') return false;
        return stack.split('\n').some((l)=>l.indexOf('(https.js:') !== -1 || l.indexOf('node:https:') !== -1);
    }
    // In order to support async signatures in `connect()` and Node's native
    // connection pooling in `http.Agent`, the array of sockets for each origin
    // has to be updated synchronously. This is so the length of the array is
    // accurate when `addRequest()` is next called. We achieve this by creating a
    // fake socket and adding it to `sockets[origin]` and incrementing
    // `totalSocketCount`.
    incrementSockets(name) {
        // If `maxSockets` and `maxTotalSockets` are both Infinity then there is no
        // need to create a fake socket because Node.js native connection pooling
        // will never be invoked.
        if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
            return null;
        }
        // All instances of `sockets` are expected TypeScript errors. The
        // alternative is to add it as a private property of this class but that
        // will break TypeScript subclassing.
        if (!this.sockets[name]) {
            // @ts-expect-error `sockets` is readonly in `@types/node`
            this.sockets[name] = [];
        }
        const fakeSocket = new net.Socket({
            writable: false
        });
        this.sockets[name].push(fakeSocket);
        // @ts-expect-error `totalSocketCount` isn't defined in `@types/node`
        this.totalSocketCount++;
        return fakeSocket;
    }
    decrementSockets(name, socket) {
        if (!this.sockets[name] || socket === null) {
            return;
        }
        const sockets = this.sockets[name];
        const index = sockets.indexOf(socket);
        if (index !== -1) {
            sockets.splice(index, 1);
            // @ts-expect-error  `totalSocketCount` isn't defined in `@types/node`
            this.totalSocketCount--;
            if (sockets.length === 0) {
                // @ts-expect-error `sockets` is readonly in `@types/node`
                delete this.sockets[name];
            }
        }
    }
    // In order to properly update the socket pool, we need to call `getName()` on
    // the core `https.Agent` if it is a secureEndpoint.
    getName(options) {
        const secureEndpoint = this.isSecureEndpoint(options);
        if (secureEndpoint) {
            // @ts-expect-error `getName()` isn't defined in `@types/node`
            return https_1.Agent.prototype.getName.call(this, options);
        }
        // @ts-expect-error `getName()` isn't defined in `@types/node`
        return super.getName(options);
    }
    createSocket(req, options, cb) {
        const connectOpts = {
            ...options,
            secureEndpoint: this.isSecureEndpoint(options)
        };
        const name = this.getName(connectOpts);
        const fakeSocket = this.incrementSockets(name);
        Promise.resolve().then(()=>this.connect(req, connectOpts)).then((socket)=>{
            this.decrementSockets(name, fakeSocket);
            if (socket instanceof http.Agent) {
                try {
                    // @ts-expect-error `addRequest()` isn't defined in `@types/node`
                    return socket.addRequest(req, connectOpts);
                } catch (err) {
                    return cb(err);
                }
            }
            this[INTERNAL].currentSocket = socket;
            // @ts-expect-error `createSocket()` isn't defined in `@types/node`
            super.createSocket(req, options, cb);
        }, (err)=>{
            this.decrementSockets(name, fakeSocket);
            cb(err);
        });
    }
    createConnection() {
        const socket = this[INTERNAL].currentSocket;
        this[INTERNAL].currentSocket = undefined;
        if (!socket) {
            throw new Error('No socket was returned in the `connect()` function');
        }
        return socket;
    }
    get defaultPort() {
        return this[INTERNAL].defaultPort ?? (this.protocol === 'https:' ? 443 : 80);
    }
    set defaultPort(v) {
        if (this[INTERNAL]) {
            this[INTERNAL].defaultPort = v;
        }
    }
    get protocol() {
        return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? 'https:' : 'http:');
    }
    set protocol(v) {
        if (this[INTERNAL]) {
            this[INTERNAL].protocol = v;
        }
    }
}
exports.Agent = Agent; //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/https-proxy-agent@7.0.6/node_modules/https-proxy-agent/dist/parse-proxy-response.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseProxyResponse = void 0;
const debug_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/index.js [app-route] (ecmascript)"));
const debug = (0, debug_1.default)('https-proxy-agent:parse-proxy-response');
function parseProxyResponse(socket) {
    return new Promise((resolve, reject)=>{
        // we need to buffer any HTTP traffic that happens with the proxy before we get
        // the CONNECT response, so that if the response is anything other than an "200"
        // response code, then we can re-play the "data" events on the socket once the
        // HTTP parser is hooked up...
        let buffersLength = 0;
        const buffers = [];
        function read() {
            const b = socket.read();
            if (b) ondata(b);
            else socket.once('readable', read);
        }
        function cleanup() {
            socket.removeListener('end', onend);
            socket.removeListener('error', onerror);
            socket.removeListener('readable', read);
        }
        function onend() {
            cleanup();
            debug('onend');
            reject(new Error('Proxy connection ended before receiving CONNECT response'));
        }
        function onerror(err) {
            cleanup();
            debug('onerror %o', err);
            reject(err);
        }
        function ondata(b) {
            buffers.push(b);
            buffersLength += b.length;
            const buffered = Buffer.concat(buffers, buffersLength);
            const endOfHeaders = buffered.indexOf('\r\n\r\n');
            if (endOfHeaders === -1) {
                // keep buffering
                debug('have not received end of HTTP headers yet...');
                read();
                return;
            }
            const headerParts = buffered.slice(0, endOfHeaders).toString('ascii').split('\r\n');
            const firstLine = headerParts.shift();
            if (!firstLine) {
                socket.destroy();
                return reject(new Error('No header received from proxy CONNECT response'));
            }
            const firstLineParts = firstLine.split(' ');
            const statusCode = +firstLineParts[1];
            const statusText = firstLineParts.slice(2).join(' ');
            const headers = {};
            for (const header of headerParts){
                if (!header) continue;
                const firstColon = header.indexOf(':');
                if (firstColon === -1) {
                    socket.destroy();
                    return reject(new Error(`Invalid header from proxy CONNECT response: "${header}"`));
                }
                const key = header.slice(0, firstColon).toLowerCase();
                const value = header.slice(firstColon + 1).trimStart();
                const current = headers[key];
                if (typeof current === 'string') {
                    headers[key] = [
                        current,
                        value
                    ];
                } else if (Array.isArray(current)) {
                    current.push(value);
                } else {
                    headers[key] = value;
                }
            }
            debug('got proxy server response: %o %o', firstLine, headers);
            cleanup();
            resolve({
                connect: {
                    statusCode,
                    statusText,
                    headers
                },
                buffered
            });
        }
        socket.on('error', onerror);
        socket.on('end', onend);
        read();
    });
}
exports.parseProxyResponse = parseProxyResponse; //# sourceMappingURL=parse-proxy-response.js.map
}),
"[project]/node_modules/.pnpm/https-proxy-agent@7.0.6/node_modules/https-proxy-agent/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        "default": mod
    };
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpsProxyAgent = void 0;
const net = __importStar(__turbopack_context__.r("[externals]/net [external] (net, cjs)"));
const tls = __importStar(__turbopack_context__.r("[externals]/tls [external] (tls, cjs)"));
const assert_1 = __importDefault(__turbopack_context__.r("[externals]/assert [external] (assert, cjs)"));
const debug_1 = __importDefault(__turbopack_context__.r("[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/index.js [app-route] (ecmascript)"));
const agent_base_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/agent-base@7.1.4/node_modules/agent-base/dist/index.js [app-route] (ecmascript)");
const url_1 = __turbopack_context__.r("[externals]/url [external] (url, cjs)");
const parse_proxy_response_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/https-proxy-agent@7.0.6/node_modules/https-proxy-agent/dist/parse-proxy-response.js [app-route] (ecmascript)");
const debug = (0, debug_1.default)('https-proxy-agent');
const setServernameFromNonIpHost = (options)=>{
    if (options.servername === undefined && options.host && !net.isIP(options.host)) {
        return {
            ...options,
            servername: options.host
        };
    }
    return options;
};
/**
 * The `HttpsProxyAgent` implements an HTTP Agent subclass that connects to
 * the specified "HTTP(s) proxy server" in order to proxy HTTPS requests.
 *
 * Outgoing HTTP requests are first tunneled through the proxy server using the
 * `CONNECT` HTTP request method to establish a connection to the proxy server,
 * and then the proxy server connects to the destination target and issues the
 * HTTP request from the proxy server.
 *
 * `https:` requests have their socket connection upgraded to TLS once
 * the connection to the proxy server has been established.
 */ class HttpsProxyAgent extends agent_base_1.Agent {
    constructor(proxy, opts){
        super(opts);
        this.options = {
            path: undefined
        };
        this.proxy = typeof proxy === 'string' ? new url_1.URL(proxy) : proxy;
        this.proxyHeaders = opts?.headers ?? {};
        debug('Creating new HttpsProxyAgent instance: %o', this.proxy.href);
        // Trim off the brackets from IPv6 addresses
        const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, '');
        const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === 'https:' ? 443 : 80;
        this.connectOpts = {
            // Attempt to negotiate http/1.1 for proxy servers that support http/2
            ALPNProtocols: [
                'http/1.1'
            ],
            ...opts ? omit(opts, 'headers') : null,
            host,
            port
        };
    }
    /**
     * Called when the node-core HTTP client library is creating a
     * new HTTP request.
     */ async connect(req, opts) {
        const { proxy } = this;
        if (!opts.host) {
            throw new TypeError('No "host" provided');
        }
        // Create a socket connection to the proxy server.
        let socket;
        if (proxy.protocol === 'https:') {
            debug('Creating `tls.Socket`: %o', this.connectOpts);
            socket = tls.connect(setServernameFromNonIpHost(this.connectOpts));
        } else {
            debug('Creating `net.Socket`: %o', this.connectOpts);
            socket = net.connect(this.connectOpts);
        }
        const headers = typeof this.proxyHeaders === 'function' ? this.proxyHeaders() : {
            ...this.proxyHeaders
        };
        const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
        let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r\n`;
        // Inject the `Proxy-Authorization` header if necessary.
        if (proxy.username || proxy.password) {
            const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
            headers['Proxy-Authorization'] = `Basic ${Buffer.from(auth).toString('base64')}`;
        }
        headers.Host = `${host}:${opts.port}`;
        if (!headers['Proxy-Connection']) {
            headers['Proxy-Connection'] = this.keepAlive ? 'Keep-Alive' : 'close';
        }
        for (const name of Object.keys(headers)){
            payload += `${name}: ${headers[name]}\r\n`;
        }
        const proxyResponsePromise = (0, parse_proxy_response_1.parseProxyResponse)(socket);
        socket.write(`${payload}\r\n`);
        const { connect, buffered } = await proxyResponsePromise;
        req.emit('proxyConnect', connect);
        this.emit('proxyConnect', connect, req);
        if (connect.statusCode === 200) {
            req.once('socket', resume);
            if (opts.secureEndpoint) {
                // The proxy is connecting to a TLS server, so upgrade
                // this socket connection to a TLS connection.
                debug('Upgrading socket connection to TLS');
                return tls.connect({
                    ...omit(setServernameFromNonIpHost(opts), 'host', 'path', 'port'),
                    socket
                });
            }
            return socket;
        }
        // Some other status code that's not 200... need to re-play the HTTP
        // header "data" events onto the socket once the HTTP machinery is
        // attached so that the node core `http` can parse and handle the
        // error status code.
        // Close the original socket, and a new "fake" socket is returned
        // instead, so that the proxy doesn't get the HTTP request
        // written to it (which may contain `Authorization` headers or other
        // sensitive data).
        //
        // See: https://hackerone.com/reports/541502
        socket.destroy();
        const fakeSocket = new net.Socket({
            writable: false
        });
        fakeSocket.readable = true;
        // Need to wait for the "socket" event to re-play the "data" events.
        req.once('socket', (s)=>{
            debug('Replaying proxy buffer for failed request');
            (0, assert_1.default)(s.listenerCount('data') > 0);
            // Replay the "buffered" Buffer onto the fake `socket`, since at
            // this point the HTTP module machinery has been hooked up for
            // the user.
            s.push(buffered);
            s.push(null);
        });
        return fakeSocket;
    }
}
HttpsProxyAgent.protocols = [
    'http',
    'https'
];
exports.HttpsProxyAgent = HttpsProxyAgent;
function resume(socket) {
    socket.resume();
}
function omit(obj, ...keys) {
    const ret = {};
    let key;
    for(key in obj){
        if (!keys.includes(key)) {
            ret[key] = obj[key];
        }
    }
    return ret;
} //# sourceMappingURL=index.js.map
}),
"[externals]/nodemailer [external] (nodemailer, cjs, [project]/node_modules/.pnpm/nodemailer@8.0.1/node_modules/nodemailer)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("nodemailer-8da78a9bc7f4fe06", () => require("nodemailer-8da78a9bc7f4fe06"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f11f4c03._.js.map