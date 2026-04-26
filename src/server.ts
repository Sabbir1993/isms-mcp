import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  ENDPOINTS,
  ERROR_CODES,
  SMS_STATUS_CODES,
  RESPONSE_SCHEMA,
  INTEGRATION_CHECKLIST,
  BASE_URL,
} from "./knowledge/api-spec.js";
import { generateCode, type Language } from "./knowledge/code-templates.js";
import { answerQuestion } from "./knowledge/qa-engine.js";
import type { EndpointId } from "./knowledge/api-spec.js";

const ENDPOINT_IDS = ["single_sms", "otp_sms", "bulk_sms", "dynamic_sms"] as const;
const LANGUAGES    = ["javascript", "python", "php", "java", "curl"] as const;

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "isms-integration-assistant",
    version: "1.0.0",
  });

  // ── Tool 1: List all endpoints ──────────────────────────────────────────────
  server.tool(
    "list_endpoints",
    "List all available SSL Wireless ISMSPLUS API v3 endpoints with a brief description of each.",
    {},
    async () => {
      const lines = [
        `SSL Wireless ISMSPLUS API v3 — Base URL: ${BASE_URL}`,
        "",
        ...Object.values(ENDPOINTS).map((ep) =>
          `• ${ep.name} [${ep.methods.join("/")}] ${ep.path}\n  ${ep.description}`
        ),
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ── Tool 2: Get full endpoint spec ─────────────────────────────────────────
  server.tool(
    "get_endpoint_spec",
    "Get the full parameter specification, constraints, and response schema for a specific ISMSPLUS API endpoint.",
    {
      endpoint: z
        .enum(ENDPOINT_IDS)
        .describe("Endpoint to describe: single_sms | otp_sms | bulk_sms | dynamic_sms"),
    },
    async ({ endpoint }) => {
      const ep = ENDPOINTS[endpoint as EndpointId];
      const lines = [
        `## ${ep.name}`,
        `URL:     ${BASE_URL}${ep.path}`,
        `Methods: ${ep.methods.join(", ")}`,
        ``,
        ep.description,
        ``,
        `### Parameters`,
        ...ep.params.map(
          (p) =>
            `  ${p.required ? "[required]" : "[optional]"} ${p.name} (${p.type})` +
            (p.max_length ? `, max ${p.max_length} chars` : "") +
            `\n    ${p.description}`
        ),
        ``,
        `### Response`,
        JSON.stringify(RESPONSE_SCHEMA, null, 2),
        ``,
        `### Per-message status values (smsinfo[].sms_status)`,
        ...Object.entries(SMS_STATUS_CODES).map(([k, v]) => `  ${k}: ${v}`),
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ── Tool 3: Generate integration code ──────────────────────────────────────
  server.tool(
    "generate_integration_code",
    "Generate a ready-to-adapt code snippet for integrating a specific ISMSPLUS endpoint in your chosen programming language.",
    {
      endpoint: z
        .enum(ENDPOINT_IDS)
        .describe("Which endpoint to generate code for: single_sms | otp_sms | bulk_sms | dynamic_sms"),
      language: z
        .enum(LANGUAGES)
        .describe("Programming language: javascript | python | php | java | curl"),
    },
    async ({ endpoint, language }) => {
      const ep   = ENDPOINTS[endpoint as EndpointId];
      const code = generateCode(endpoint as EndpointId, language as Language);
      const text = [
        `## ${ep.name} — ${language} example`,
        ``,
        `Replace YOUR_API_TOKEN and YOUR_SENDER_ID with your actual credentials.`,
        ``,
        "```" + (language === "curl" ? "bash" : language),
        code,
        "```",
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool 4: Explain error code ─────────────────────────────────────────────
  server.tool(
    "explain_error_code",
    "Explain an ISMSPLUS API error or SMS-level status code and how to fix it.",
    {
      code: z
        .number()
        .int()
        .describe("Numeric API error code (e.g. 4001, 4023, 5000) or use 200 for success"),
    },
    async ({ code }) => {
      const entry = ERROR_CODES[code];
      if (!entry) {
        return {
          content: [{ type: "text", text: `Unknown error code: ${code}.\n\nKnown codes: ${Object.keys(ERROR_CODES).join(", ")}` }],
        };
      }
      const text = [
        `## Error Code ${code} — ${entry.status}`,
        ``,
        `**Meaning:** ${entry.meaning}`,
        ``,
        `**How to fix:** ${entry.fix}`,
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool 5: Get sample request/response payload ────────────────────────────
  server.tool(
    "get_sample_payload",
    "Get a sample JSON request body and the expected response payload for a specific ISMSPLUS endpoint.",
    {
      endpoint: z
        .enum(ENDPOINT_IDS)
        .describe("Endpoint: single_sms | otp_sms | bulk_sms | dynamic_sms"),
    },
    async ({ endpoint }) => {
      const requestMap: Record<string, object> = {
        single_sms: {
          api_token: "YOUR_API_TOKEN",
          sid:       "YOUR_SENDER_ID",
          msisdn:    "8801711000001",
          sms:       "Your verification code is 482910. Valid for 5 minutes.",
          csms_id:   "MYAPP-20240427-A1B2C",
        },
        otp_sms: {
          api_token: "YOUR_API_TOKEN",
          sid:       "YOUR_SENDER_ID",
          msisdn:    "8801811000002",
          sms:       "Your OTP is 391847. Do not share it with anyone.",
          csms_id:   "OTP-20240427-D3E4F",
        },
        bulk_sms: {
          api_token:     "YOUR_API_TOKEN",
          sid:           "YOUR_SENDER_ID",
          msisdn:        ["8801711000001", "8801811000002", "8801911000003"],
          sms:           "Dear Customer, your invoice is ready. Login to view.",
          batch_csms_id: "BATCH-20240427-XYZ99",
        },
        dynamic_sms: {
          api_token: "YOUR_API_TOKEN",
          sid:       "YOUR_SENDER_ID",
          sms: [
            { msisdn: "8801711000001", text: "Hello Alice, your order #1001 is shipped!", csms_id: "ORD-1001-20240427" },
            { msisdn: "8801811000002", text: "Hello Bob, your order #1002 is shipped!",   csms_id: "ORD-1002-20240427" },
          ],
        },
      };

      const sampleResponse = {
        status:        "SUCCESS",
        status_code:   200,
        error_message: "",
        smsinfo: [
          {
            sms_status:     "SUCCESS",
            status_message: "",
            msisdn:         "8801711000001",
            sms_type:       "EN",
            sms_body:       "Your verification code is 482910. Valid for 5 minutes.",
            csms_id:        "MYAPP-20240427-A1B2C",
            reference_id:   "SSLW-REF-7839201",
          },
        ],
      };

      const ep = ENDPOINTS[endpoint as EndpointId];
      const text = [
        `## ${ep.name} — Sample Payload`,
        ``,
        `### Request (POST ${BASE_URL}${ep.path})`,
        "```json",
        JSON.stringify(requestMap[endpoint], null, 2),
        "```",
        ``,
        `### Response`,
        "```json",
        JSON.stringify(sampleResponse, null, 2),
        "```",
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  // ── Tool 6: Validate MSISDN format ────────────────────────────────────────
  server.tool(
    "validate_msisdn",
    "Validate and normalise a Bangladesh mobile phone number to the format required by the ISMSPLUS API (no API call is made).",
    {
      number: z
        .string()
        .describe("Phone number to validate (any common format: 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX)"),
    },
    async ({ number }) => {
      const digits = number.replace(/\D/g, "");

      let normalised = digits;
      if (digits.startsWith("0") && digits.length === 11) {
        normalised = "88" + digits;
      } else if (digits.startsWith("1") && digits.length === 10) {
        normalised = "880" + digits;
      }

      const valid = /^\d{11,16}$/.test(normalised);
      const bdPattern = /^8801[3-9]\d{8}$/.test(normalised);

      const lines = [
        `Input:      ${number}`,
        `Normalised: ${normalised}`,
        `Length:     ${normalised.length} digits`,
        ``,
        valid
          ? `✓ Valid for ISMSPLUS API (length 11–16 digits)`
          : `✗ Invalid — must be 11–16 numeric digits`,
        bdPattern
          ? `✓ Recognised as a valid Bangladesh mobile number (880 1[3-9]XXXXXXXX)`
          : `⚠ Does not match Bangladesh mobile pattern — verify the number is correct`,
        ``,
        `Use in API request: "msisdn": "${normalised}"`,
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ── Tool 7: Integration checklist ─────────────────────────────────────────
  server.tool(
    "get_integration_checklist",
    "Get a step-by-step checklist for integrating the SSL Wireless ISMSPLUS API into your application.",
    {},
    async () => {
      const lines = [
        "## ISMSPLUS API Integration Checklist",
        "",
        ...INTEGRATION_CHECKLIST.map(
          (item) => `${item.step}. **${item.title}**\n   ${item.detail}`
        ),
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  // ── Tool 8: ask_isms ──────────────────────────────────────────────────────
  server.tool(
    "ask_isms",
    "Ask any free-form question about the SSL Wireless ISMSPLUS API. Returns only what is available and supported — no speculation.",
    {
      question: z
        .string()
        .min(1)
        .describe("Your question or menu selection — e.g. 'How do I send bulk SMS?', 'What does error 4023 mean?', or just '2' / 'bulk' to pick a type."),
    },
    async ({ question }) => {
      const answer = answerQuestion(question);
      return { content: [{ type: "text", text: answer }] };
    }
  );

  return server;
}
