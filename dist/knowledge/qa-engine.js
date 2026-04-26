import { ENDPOINTS, ERROR_CODES, SMS_STATUS_CODES, RESPONSE_SCHEMA, INTEGRATION_CHECKLIST, BASE_URL, } from "./api-spec.js";
const KNOWLEDGE = [
    {
        keywords: ["endpoint", "api", "route", "url", "path", "available", "what can", "support", "feature", "function"],
        answer: () => {
            const lines = [
                "ISMSPLUS API v3 supports 4 endpoints:",
                "",
                ...Object.values(ENDPOINTS).map((ep) => `• ${ep.name}: ${BASE_URL}${ep.path}  [${ep.methods.join("/")}]\n  ${ep.description}`),
            ];
            return lines.join("\n");
        },
    },
    {
        keywords: ["auth", "token", "api_token", "credential", "login", "key", "secret", "authenticate"],
        answer: () => [
            "Authentication uses a static API token (no OAuth/sessions).",
            "",
            "• Parameter name: api_token",
            "• Max length: 50 characters",
            "• Required on every request",
            "• Obtain it from SSL Wireless — contact service.operation@sslwireless.com",
            "",
            "Your token is sent in the JSON request body, not in a header.",
        ].join("\n"),
    },
    {
        keywords: ["sender", "sid", "masking", "mask", "name", "from"],
        answer: () => [
            "The Sender ID (SID) is the name or number that appears as the message sender.",
            "",
            "• Parameter name: sid",
            "• Max length: 20 characters",
            "• Must be a masking name pre-approved and allocated to your account by SSL Wireless",
            "• Required on every request",
            "• Using an unauthorised SID returns error 4002",
        ].join("\n"),
    },
    {
        keywords: ["phone", "msisdn", "number", "mobile", "format", "digit", "recipient", "Bangladesh", "bd", "880"],
        answer: () => [
            "MSISDN (phone number) requirements:",
            "",
            "• Format: numeric only, no spaces or dashes",
            "• Length: 11–16 digits",
            "• Bangladesh format: 8801XXXXXXXXX (country code 880 + operator prefix 1[3-9] + 8 digits)",
            "• Strip the leading + if present: +8801711000001 → 8801711000001",
            "• Convert local format: 01711000001 → 8801711000001",
            "",
            "Common operator prefixes: 011 (Teletalk), 013/014 (Banglalink), 015 (Robi/Airtel), 016 (Airtel), 017 (Grameenphone), 018 (Robi), 019 (Banglalink)",
        ].join("\n"),
    },
    {
        keywords: ["bulk", "multiple", "many", "batch", "recipients", "group", "mass", "broadcast"],
        answer: () => {
            const ep = ENDPOINTS.bulk_sms;
            return [
                "Bulk SMS — same message to many recipients:",
                "",
                `• Endpoint: ${BASE_URL}${ep.path}`,
                "• Method: POST only",
                "• Max recipients per request: 100",
                "• Use batch_csms_id (one unique ID for the whole batch, max 20 chars)",
                "• All recipients receive the identical message body",
                "",
                "For different messages per recipient, use Dynamic SMS instead.",
            ].join("\n");
        },
    },
    {
        keywords: ["dynamic", "personalise", "personalize", "different message", "individual", "custom message", "per recipient"],
        answer: () => {
            const ep = ENDPOINTS.dynamic_sms;
            return [
                "Dynamic SMS — different message per recipient:",
                "",
                `• Endpoint: ${BASE_URL}${ep.path}`,
                "• Method: POST only",
                "• Max messages per request: 100",
                "• Each message object requires: msisdn, text, csms_id",
                "• Every csms_id in the array must be unique per day",
                "",
                "Use this for personalised messages (names, order numbers, amounts, etc.).",
            ].join("\n");
        },
    },
    {
        keywords: ["otp", "one-time", "one time", "verification", "verify", "code", "2fa", "two factor"],
        answer: () => {
            const ep = ENDPOINTS.otp_sms;
            return [
                "OTP SMS — for authentication codes and time-sensitive verification:",
                "",
                `• Endpoint: ${BASE_URL}${ep.path}`,
                "• Method: GET or POST",
                "• Parameters: same as Single SMS (api_token, sid, msisdn, sms, csms_id)",
                "• Max message length: 1000 characters",
                "",
                "Use this endpoint specifically for OTP delivery — it may have priority routing.",
            ].join("\n");
        },
    },
    {
        keywords: ["single", "one sms", "one message", "send sms", "send message"],
        answer: () => {
            const ep = ENDPOINTS.single_sms;
            return [
                "Single SMS — one message to one recipient:",
                "",
                `• Endpoint: ${BASE_URL}${ep.path}`,
                "• Methods: GET or POST",
                "• Parameters: api_token, sid, msisdn, sms, csms_id",
                "• Max message length: 1000 characters",
            ].join("\n");
        },
    },
    {
        keywords: ["csms", "csms_id", "reference", "unique", "duplicate", "id", "tracking", "idempotent"],
        answer: () => [
            "CSMS ID — your unique reference ID per message:",
            "",
            "• Parameter name: csms_id  (bulk uses batch_csms_id)",
            "• Max length: 20 characters, alphanumeric",
            "• Must be unique per day — reuse returns error 4023",
            "• Resets at midnight (Bangladesh time)",
            "",
            "Recommended generation pattern: {PREFIX}-{YYYYMMDD}-{RANDOM5}",
            "Example: MYAPP-20240427-A1B2C",
            "",
            "• Store csms_id in your database so you can correlate SSL Wireless's reference_id back to your records.",
        ].join("\n"),
    },
    {
        keywords: ["message", "sms body", "content", "length", "character", "limit", "size", "text"],
        answer: () => [
            "Message content rules:",
            "",
            "• Maximum length: 1000 characters per message",
            "• English (Latin) messages: detected as sms_type: EN",
            "• Bengali / Unicode messages: detected as sms_type: BN",
            "• Encoding must be UTF-8",
            "• Exceeding 1000 characters returns error 4027",
        ].join("\n"),
    },
    {
        keywords: ["language", "bengali", "unicode", "english", "bangla", "utf", "encoding"],
        answer: () => [
            "Supported message languages:",
            "",
            "• English (Latin): sms_type returned as EN",
            "• Bengali (Unicode/Bangla): sms_type returned as BN",
            "• Encoding: UTF-8 required for Bengali",
            "• The API auto-detects the language — you do not need to specify it",
            "• Max length is 1000 characters for both languages",
        ].join("\n"),
    },
    {
        keywords: ["error", "code", "status", "fail", "failed", "4001", "4002", "4003", "4004", "4005", "4020", "4022", "4023", "4025", "4026", "4027", "4028", "4029", "4030", "4031", "5000"],
        answer: () => {
            const lines = [
                "API-level error codes:",
                "",
                ...Object.entries(ERROR_CODES).map(([code, e]) => `  ${code}  ${e.status.padEnd(8)} ${e.meaning}\n           Fix: ${e.fix}`),
                "",
                "SMS-level status (per message in smsinfo[]):",
                ...Object.entries(SMS_STATUS_CODES).map(([k, v]) => `  ${k}: ${v}`),
            ];
            return lines.join("\n");
        },
    },
    {
        keywords: ["response", "json", "return", "output", "result", "smsinfo", "reference_id"],
        answer: () => [
            "API response structure (all endpoints):",
            "",
            JSON.stringify(RESPONSE_SCHEMA, null, 2),
            "",
            "Key fields:",
            "• status_code 200 = accepted; anything else = failed",
            "• smsinfo[].sms_status: SUCCESS | INVALID | DUPLICATE (per individual number)",
            "• smsinfo[].reference_id: SSL Wireless internal tracking ID — save this for support queries",
            "• smsinfo[].sms_type: EN or BN (auto-detected)",
        ].join("\n"),
    },
    {
        keywords: ["rate", "limit", "tps", "throttle", "quota", "too many", "slow", "speed", "request per"],
        answer: () => [
            "Rate limiting and quotas:",
            "",
            "• Error 4029: Too many requests — general rate limit exceeded",
            "• Error 4030: Account limit exceeded (daily/monthly quota)",
            "• Error 4031: TPS (Transactions Per Second) limit exceeded",
            "",
            "Handling advice:",
            "• Implement exponential backoff: retry after 1s, 2s, 4s…",
            "• Queue and throttle outgoing requests",
            "• Contact SSL Wireless to increase your TPS or quota allocation",
            "• Do NOT retry on 4001–4005 or 4023 (those are configuration/logic errors)",
        ].join("\n"),
    },
    {
        keywords: ["retry", "backoff", "resilient", "resilience", "failure", "recover"],
        answer: () => [
            "Retry strategy for ISMSPLUS API:",
            "",
            "Retry with exponential backoff on:",
            "  4029 — Too many requests",
            "  4031 — TPS exceeded",
            "  5000 — Unknown server error",
            "",
            "Do NOT retry on:",
            "  4001–4005 — Configuration errors (wrong token, SID, IP, URL, format)",
            "  4023 — Duplicate CSMS ID (retrying with same ID will fail again)",
            "  4025/4026 — Invalid/blocked number (permanent)",
            "",
            "Recommended pattern: 3 attempts, delays of 1s → 2s → 4s",
        ].join("\n"),
    },
    {
        keywords: ["ip", "whitelist", "allowlist", "firewall", "blacklist", "blocked ip", "4003"],
        answer: () => [
            "IP whitelisting is required for the ISMSPLUS API:",
            "",
            "• Your server's outbound IP must be pre-approved by SSL Wireless",
            "• Requests from non-whitelisted IPs return error 4003 (IP Blacklisted)",
            "• Contact service.operation@sslwireless.com to request whitelisting",
            "• If you move servers or change IPs, you must update the whitelist",
        ].join("\n"),
    },
    {
        keywords: ["method", "http", "get", "post", "rest", "content-type", "header"],
        answer: () => [
            "HTTP method and header requirements:",
            "",
            "• Single SMS and OTP SMS: GET or POST supported",
            "• Bulk SMS and Dynamic SMS: POST only",
            "• Content-Type header: application/json (required for POST requests)",
            "• Base URL: " + BASE_URL,
            "",
            "For GET requests: pass parameters as query string (single/OTP only).",
            "For POST requests: send a JSON body with Content-Type: application/json.",
        ].join("\n"),
    },
    {
        keywords: ["contact", "support", "help", "email", "address", "ssl wireless", "sslwireless", "company"],
        answer: () => [
            "SSL Wireless contact information:",
            "",
            "• Support email: service.operation@sslwireless.com",
            "• Address: 93 B New Eskaton Road, Dhaka 1000, Bangladesh",
            "• API base URL: " + BASE_URL,
            "",
            "Contact for: API token, SID allocation, IP whitelisting, quota increase, billing.",
        ].join("\n"),
    },
    {
        keywords: ["checklist", "step", "start", "begin", "integrate", "integration", "how to", "setup", "get started"],
        answer: () => [
            "Integration steps:",
            "",
            ...INTEGRATION_CHECKLIST.map((item) => `${item.step}. ${item.title}: ${item.detail}`),
        ].join("\n"),
    },
];
// ── SMS type menu ─────────────────────────────────────────────────────────────
const SMS_TYPES = [
    {
        number: 1,
        id: "single_sms",
        label: "Single SMS",
        summary: "Send one message to one recipient",
        aliases: ["single", "one", "1"],
    },
    {
        number: 2,
        id: "otp_sms",
        label: "OTP SMS",
        summary: "Send a One-Time Password / verification code to one recipient",
        aliases: ["otp", "one-time", "one time", "verify", "verification", "2fa", "2"],
    },
    {
        number: 3,
        id: "bulk_sms",
        label: "Bulk SMS",
        summary: "Send the same message to up to 100 recipients at once",
        aliases: ["bulk", "many", "multiple", "batch", "broadcast", "mass", "3"],
    },
    {
        number: 4,
        id: "dynamic_sms",
        label: "Dynamic SMS",
        summary: "Send different personalised messages to up to 100 recipients",
        aliases: ["dynamic", "personalise", "personalize", "individual", "custom", "different", "4"],
    },
];
const SMS_MENU = [
    "ISMSPLUS supports the following SMS sending services. Which type do you need?",
    "",
    ...SMS_TYPES.map((t) => `  ${t.number}. ${t.label}\n     ${t.summary}`),
    "",
    "Reply with the number (1–4) or type name (e.g. 'bulk', 'otp', 'dynamic').",
].join("\n");
/** Detects vague send-SMS intent with no specific type specified. */
function isVagueSendQuestion(q) {
    const sendWords = ["send", "sending", "how to send", "how do i send", "how can i send", "submit", "deliver", "dispatch", "push"];
    const smsWords = ["sms", "message", "text", "notification", "alert", "it"];
    const specificType = SMS_TYPES.flatMap((t) => t.aliases);
    const hasSend = sendWords.some((w) => q.includes(w));
    const hasSms = smsWords.some((w) => q.includes(w));
    const hasSpecific = specificType.some((a) => q.includes(a));
    return hasSend && hasSms && !hasSpecific;
}
/** Matches a short follow-up reply to a specific SMS type (number or name). */
function resolveTypeSelection(q) {
    const trimmed = q.trim().toLowerCase();
    return SMS_TYPES.find((t) => t.aliases.some((a) => trimmed === a || trimmed === String(t.number))) ?? null;
}
function smsTypeDetail(type) {
    const ep = ENDPOINTS[type.id];
    const lines = [
        `## ${ep.name}`,
        `URL:     ${BASE_URL}${ep.path}`,
        `Methods: ${ep.methods.join(", ")}`,
        "",
        ep.description,
        "",
        "### Parameters",
        ...ep.params.map((p) => `  ${p.required ? "[required]" : "[optional]"} ${p.name} (${p.type})` +
            (p.max_length ? `, max ${p.max_length} chars` : "") +
            `\n    ${p.description}`),
        "",
        "### Quick tips",
    ];
    if (type.id === "single_sms") {
        lines.push("• csms_id must be unique per day (max 20 chars)", "• Supports GET or POST", "• Use for transactional messages (invoices, alerts, confirmations)");
    }
    else if (type.id === "otp_sms") {
        lines.push("• Same parameters as Single SMS — different endpoint for priority routing", "• csms_id must be unique per day", "• Keep OTP messages short and time-bounded in the text");
    }
    else if (type.id === "bulk_sms") {
        lines.push("• Max 100 recipients per request", "• Use batch_csms_id (one ID for the entire batch, unique per day)", "• All recipients get the identical message — use Dynamic SMS for personalised content");
    }
    else if (type.id === "dynamic_sms") {
        lines.push("• Max 100 messages per request", "• Each message object needs its own csms_id (unique per day)", "• Ideal for order updates, personalised alerts, per-user notifications");
    }
    lines.push("", `Ask 'generate code for ${type.label}' to get a ready-to-use code snippet.`);
    return lines.join("\n");
}
// ── Scoring + answer ──────────────────────────────────────────────────────────
/** Score a question against a knowledge entry by counting keyword hits. */
function score(question, entry) {
    const q = question.toLowerCase();
    return entry.keywords.reduce((n, kw) => (q.includes(kw.toLowerCase()) ? n + 1 : n), 0);
}
/**
 * Answer a free-form question about the ISMSPLUS API.
 *
 * Resolution order:
 *   1. Short type-selection reply  (e.g. "1", "bulk", "otp")
 *   2. Vague send-SMS question     → show the type menu
 *   3. Keyword-matched knowledge   → return relevant sections
 *   4. No match                    → show topics list
 */
export function answerQuestion(question) {
    const q = question.trim().toLowerCase();
    // 1. Follow-up: user picked a type from the menu
    const selected = resolveTypeSelection(q);
    if (selected)
        return smsTypeDetail(selected);
    // 2. Vague send intent — show the menu
    if (isVagueSendQuestion(q))
        return SMS_MENU;
    // 3. Keyword scoring
    const scored = KNOWLEDGE.map((entry) => ({ entry, s: score(question, entry) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s);
    if (scored.length === 0) {
        return [
            "No matching information found for that question.",
            "",
            "Topics covered by this assistant:",
            "  • SMS sending types (single, OTP, bulk, dynamic)",
            "  • Authentication (api_token, sid)",
            "  • Phone number format (MSISDN)",
            "  • CSMS ID uniqueness rules",
            "  • Message length and language (English/Bengali)",
            "  • API and SMS-level error codes",
            "  • Response structure",
            "  • Rate limits and retry strategy",
            "  • IP whitelisting",
            "  • HTTP methods and headers",
            "  • Integration checklist",
            "  • SSL Wireless contact information",
        ].join("\n");
    }
    const topScore = scored[0].s;
    const topMatches = scored.filter((x) => x.s === topScore);
    const rest = scored.filter((x) => x.s < topScore).slice(0, 2);
    return [
        ...topMatches.map((x) => x.entry.answer()),
        ...(rest.length ? ["", "--- Related ---", ...rest.map((x) => x.entry.answer())] : []),
    ].join("\n\n");
}
//# sourceMappingURL=qa-engine.js.map