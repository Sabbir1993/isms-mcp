export const BASE_URL = "https://smsplus.sslwireless.com";

export const ENDPOINTS = {
  single_sms: {
    id: "single_sms",
    name: "Single SMS",
    path: "/api/v3/send-sms",
    methods: ["GET", "POST"],
    description: "Send one SMS message to one recipient.",
    max_message_length: 1000,
    params: [
      { name: "api_token", type: "string", max_length: 50, required: true, description: "Authentication token issued by SSL Wireless" },
      { name: "sid",       type: "string", max_length: 20, required: true, description: "Sender ID / masking name allocated to your account" },
      { name: "msisdn",    type: "string", max_length: 16, required: true, description: "Recipient phone number (numeric, e.g. 8801XXXXXXXXX)" },
      { name: "sms",       type: "string", max_length: 1000, required: true, description: "Message body (English or Bengali Unicode)" },
      { name: "csms_id",  type: "string", max_length: 20, required: true, description: "Unique reference ID for this message — must be unique per day" },
    ],
  },
  otp_sms: {
    id: "otp_sms",
    name: "Single OTP SMS",
    path: "/api/v3/send-otp-sms",
    methods: ["GET", "POST"],
    description: "Send a One-Time Password (OTP) SMS to one recipient. Use this for authentication codes and verification flows.",
    max_message_length: 1000,
    params: [
      { name: "api_token", type: "string", max_length: 50, required: true, description: "Authentication token issued by SSL Wireless" },
      { name: "sid",       type: "string", max_length: 20, required: true, description: "Sender ID / masking name allocated to your account" },
      { name: "msisdn",    type: "string", max_length: 16, required: true, description: "Recipient phone number (numeric, e.g. 8801XXXXXXXXX)" },
      { name: "sms",       type: "string", max_length: 1000, required: true, description: "OTP message body" },
      { name: "csms_id",  type: "string", max_length: 20, required: true, description: "Unique reference ID — must be unique per day" },
    ],
  },
  bulk_sms: {
    id: "bulk_sms",
    name: "Bulk SMS",
    path: "/api/v3/send-sms/bulk",
    methods: ["POST"],
    description: "Send the same message to up to 100 recipients in one request.",
    max_recipients: 100,
    max_message_length: 1000,
    params: [
      { name: "api_token",      type: "string",   max_length: 50,   required: true,  description: "Authentication token issued by SSL Wireless" },
      { name: "sid",            type: "string",   max_length: 20,   required: true,  description: "Sender ID / masking name" },
      { name: "msisdn",         type: "string[]", max_length: null, required: true,  description: "Array of recipient phone numbers (max 100)" },
      { name: "sms",            type: "string",   max_length: 1000, required: true,  description: "Message body sent to all recipients" },
      { name: "batch_csms_id", type: "string",   max_length: 20,   required: true,  description: "Single unique reference ID for the entire batch — must be unique per day" },
    ],
  },
  dynamic_sms: {
    id: "dynamic_sms",
    name: "Dynamic SMS",
    path: "/api/v3/send-sms/dynamic",
    methods: ["POST"],
    description: "Send different messages to different recipients (up to 100 messages) in one request.",
    max_messages: 100,
    max_message_length: 1000,
    params: [
      { name: "api_token", type: "string", max_length: 50,   required: true, description: "Authentication token issued by SSL Wireless" },
      { name: "sid",       type: "string", max_length: 20,   required: true, description: "Sender ID / masking name" },
      { name: "sms",       type: "object[]", max_length: null, required: true, description: "Array of message objects, each with: text (string), msisdn (string), csms_id (string, unique per day)" },
    ],
  },
} as const;

export type EndpointId = keyof typeof ENDPOINTS;

export const ERROR_CODES: Record<number, { status: string; meaning: string; fix: string }> = {
  200:  { status: "SUCCESS", meaning: "Request processed successfully.", fix: "No action needed." },
  4001: { status: "FAILED",  meaning: "Unauthorized — invalid API token.", fix: "Verify your api_token value. Obtain it from the SSL Wireless client portal or contact service.operation@sslwireless.com." },
  4002: { status: "FAILED",  meaning: "SID/Stakeholder not permitted.", fix: "Ensure the sid value matches exactly what SSL Wireless allocated to your account. It may be a masking name that needs to be approved first." },
  4003: { status: "FAILED",  meaning: "IP address is blacklisted.", fix: "Your server's outbound IP is not whitelisted. Contact SSL Wireless to whitelist your IP." },
  4004: { status: "FAILED",  meaning: "Invalid endpoint URL.", fix: "Double-check the request URL. Use https://smsplus.sslwireless.com as the base domain." },
  4005: { status: "FAILED",  meaning: "Invalid request format.", fix: "Ensure Content-Type is application/json and the body is valid JSON." },
  4020: { status: "FAILED",  meaning: "Invalid CSMS ID.", fix: "csms_id must be alphanumeric, max 20 characters, and unique per day." },
  4022: { status: "FAILED",  meaning: "Required parameter is missing.", fix: "Check that all required fields (api_token, sid, msisdn, sms, csms_id) are present in the request body." },
  4023: { status: "FAILED",  meaning: "Duplicate CSMS ID.", fix: "csms_id must be unique per day. Use a timestamp or UUID-based approach to generate it, and do not re-use IDs within the same calendar day." },
  4025: { status: "FAILED",  meaning: "Invalid MSISDN (phone number).", fix: "Phone numbers must be numeric only, 11–16 digits. For Bangladesh use the format 8801XXXXXXXXX (country code 880 + operator code + 8-digit number). Strip spaces, dashes, and the leading +." },
  4026: { status: "FAILED",  meaning: "MSISDN is blocked.", fix: "The recipient number has been blocked from receiving SMS. Remove it from your send list." },
  4027: { status: "FAILED",  meaning: "Message length exceeded.", fix: "Maximum SMS body length is 1000 characters. Truncate or split your message." },
  4028: { status: "FAILED",  meaning: "Invalid message data.", fix: "Check the sms field. For Bengali/Unicode messages ensure encoding is UTF-8." },
  4029: { status: "FAILED",  meaning: "Too many requests (rate limit hit).", fix: "Implement exponential backoff and retry logic. Reduce request frequency or contact SSL Wireless to increase your rate limit." },
  4030: { status: "FAILED",  meaning: "Account limit exceeded.", fix: "Your account's daily/monthly SMS quota is exhausted. Contact SSL Wireless to top up or increase limit." },
  4031: { status: "FAILED",  meaning: "TPS (Transactions Per Second) limit exceeded.", fix: "Slow down your request rate. Queue outgoing requests and throttle to stay within your allocated TPS." },
  5000: { status: "FAILED",  meaning: "Unknown server error.", fix: "Retry with exponential backoff. If the error persists, contact SSL Wireless support at service.operation@sslwireless.com." },
};

export const SMS_STATUS_CODES = {
  SUCCESS:   "Message accepted and queued for delivery.",
  INVALID:   "Invalid MSISDN, message length exceeded, or invalid CSMS ID.",
  DUPLICATE: "Duplicate CSMS ID used in the same day, or duplicate MSISDN in the same bulk request.",
};

export const RESPONSE_SCHEMA = {
  status:        "SUCCESS | FAIL",
  status_code:   "number (see error codes)",
  error_message: "string — human-readable error detail",
  smsinfo: [
    {
      sms_status:     "SUCCESS | INVALID | DUPLICATE",
      status_message: "string",
      msisdn:         "string — the recipient number",
      sms_type:       "EN | BN — detected as English or Bengali",
      sms_body:       "string — echo of the message sent",
      csms_id:        "string — your reference ID",
      reference_id:   "string — SSL Wireless internal tracking ID",
    },
  ],
};

export const INTEGRATION_CHECKLIST = [
  { step: 1, title: "Obtain credentials", detail: "Get your api_token and sid (Sender ID) from SSL Wireless. Contact service.operation@sslwireless.com if you don't have them yet." },
  { step: 2, title: "Whitelist your server IP", detail: "Ask SSL Wireless to whitelist your server's outbound IP address. Requests from non-whitelisted IPs return error 4003." },
  { step: 3, title: "Choose your endpoint", detail: "Use /send-sms for single messages, /send-otp-sms for OTPs, /send-sms/bulk for same message to many, /send-sms/dynamic for personalised messages to many." },
  { step: 4, title: "Design your CSMS ID strategy", detail: "csms_id must be unique per day (max 20 chars, alphanumeric). A good pattern: {yourPrefix}-{YYYYMMDD}-{random5}. Store it in your DB so you can correlate delivery reports." },
  { step: 5, title: "Validate phone numbers before sending", detail: "Strip all non-numeric characters. Prepend 880 for Bangladeshi numbers starting with 0 (e.g. 01XXXXXXXXX → 8801XXXXXXXXX). Ensure 11–16 digit length." },
  { step: 6, title: "Set Content-Type header", detail: "All POST requests must include Content-Type: application/json." },
  { step: 7, title: "Handle both API-level and SMS-level responses", detail: "Check status_code first. Even if the API call succeeds (200), individual numbers in smsinfo may have INVALID or DUPLICATE status." },
  { step: 8, title: "Implement retry with backoff", detail: "Retry on 4029, 4031, or 5000 using exponential backoff (e.g. 1s, 2s, 4s). Do NOT retry on 4001–4005 (configuration errors) or 4023 (duplicate CSMS ID)." },
  { step: 9, title: "Store reference_id for tracking", detail: "Save the reference_id returned per message in smsinfo. This is SSL Wireless's internal ID, useful for raising support tickets about specific messages." },
  { step: 10, title: "Test in staging first", detail: "Confirm the integration with a test phone number before sending to real users. Verify both SUCCESS and error-handling paths." },
];
