/**
 * Test suite for the ISMS Integration Assistant MCP Server.
 * Run: npm run build && npm test   (server must be running: npm start)
 */

import "dotenv/config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const SERVER_URL = process.env.TEST_SERVER_URL ?? "http://localhost:3000/mcp";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else           { console.error(`  ✗ ${label}`); failed++; }
}

function assertIncludes(text: string, needle: string, label: string): void {
  assert(text.toLowerCase().includes(needle.toLowerCase()), label);
}

// ── MCP Protocol Tests ────────────────────────────────────────────────────────

let mcpClient: Client | undefined;

try {
  mcpClient = new Client({ name: "isms-test-client", version: "1.0.0" });
  await mcpClient.connect(
    new StreamableHTTPClientTransport(new URL(SERVER_URL))
  );
  console.log(`Connected to ${SERVER_URL}\n`);

  // [1] Tool discovery
  console.log("[1] Tool discovery");
  const { tools } = await mcpClient.listTools();
  const names = tools.map((t) => t.name);
  console.log(`    Tools: ${names.join(", ")}`);
  assert(names.includes("list_endpoints"),           "list_endpoints registered");
  assert(names.includes("get_endpoint_spec"),        "get_endpoint_spec registered");
  assert(names.includes("generate_integration_code"),"generate_integration_code registered");
  assert(names.includes("explain_error_code"),       "explain_error_code registered");
  assert(names.includes("get_sample_payload"),       "get_sample_payload registered");
  assert(names.includes("validate_msisdn"),          "validate_msisdn registered");
  assert(names.includes("get_integration_checklist"),"get_integration_checklist registered");
  assert(tools.length === 8,                         `Exactly 8 tools (got ${tools.length})`);

  // [2] list_endpoints
  console.log("\n[2] list_endpoints");
  const r2 = await mcpClient.callTool({ name: "list_endpoints", arguments: {} });
  const t2  = (r2.content as [{text:string}])[0].text;
  assertIncludes(t2, "single sms",    "Contains Single SMS");
  assertIncludes(t2, "bulk sms",      "Contains Bulk SMS");
  assertIncludes(t2, "dynamic sms",   "Contains Dynamic SMS");
  assertIncludes(t2, "otp",           "Contains OTP SMS");
  assertIncludes(t2, "/api/v3",       "Contains endpoint paths");

  // [3] get_endpoint_spec
  console.log("\n[3] get_endpoint_spec — bulk_sms");
  const r3 = await mcpClient.callTool({ name: "get_endpoint_spec", arguments: { endpoint: "bulk_sms" } });
  const t3  = (r3.content as [{text:string}])[0].text;
  assertIncludes(t3, "batch_csms_id", "bulk_sms spec contains batch_csms_id");
  assertIncludes(t3, "100",           "bulk_sms spec mentions 100 recipient limit");
  assertIncludes(t3, "api_token",     "bulk_sms spec contains api_token");

  // [4] generate_integration_code — JS single_sms
  console.log("\n[4] generate_integration_code — javascript / single_sms");
  const r4 = await mcpClient.callTool({
    name: "generate_integration_code",
    arguments: { endpoint: "single_sms", language: "javascript" },
  });
  const t4 = (r4.content as [{text:string}])[0].text;
  assertIncludes(t4, "axios",               "JS snippet uses axios / fetch");
  assertIncludes(t4, "YOUR_API_TOKEN",      "Contains token placeholder");
  assertIncludes(t4, "/api/v3/send-sms",    "Contains correct endpoint path");
  assert(r4.isError !== true,               "No error flag");

  // [5] generate_integration_code — python / dynamic_sms
  console.log("\n[5] generate_integration_code — python / dynamic_sms");
  const r5 = await mcpClient.callTool({
    name: "generate_integration_code",
    arguments: { endpoint: "dynamic_sms", language: "python" },
  });
  const t5 = (r5.content as [{text:string}])[0].text;
  assertIncludes(t5, "requests.post",         "Python snippet uses requests.post");
  assertIncludes(t5, "/api/v3/send-sms/dynamic", "Contains dynamic endpoint path");

  // [6] generate_integration_code — php / bulk_sms
  console.log("\n[6] generate_integration_code — php / bulk_sms");
  const r6 = await mcpClient.callTool({
    name: "generate_integration_code",
    arguments: { endpoint: "bulk_sms", language: "php" },
  });
  const t6 = (r6.content as [{text:string}])[0].text;
  assertIncludes(t6, "curl_init",    "PHP snippet uses curl");
  assertIncludes(t6, "batch_csms_id","PHP bulk snippet includes batch_csms_id");

  // [7] explain_error_code — known code
  console.log("\n[7] explain_error_code — 4023 (duplicate CSMS ID)");
  const r7 = await mcpClient.callTool({ name: "explain_error_code", arguments: { code: 4023 } });
  const t7  = (r7.content as [{text:string}])[0].text;
  assertIncludes(t7, "duplicate",  "Explains duplicate CSMS ID");
  assertIncludes(t7, "unique",     "Mentions uniqueness requirement");
  assertIncludes(t7, "how to fix", "Includes fix guidance");

  // [8] explain_error_code — unknown code
  console.log("\n[8] explain_error_code — unknown code 9999");
  const r8 = await mcpClient.callTool({ name: "explain_error_code", arguments: { code: 9999 } });
  const t8  = (r8.content as [{text:string}])[0].text;
  assertIncludes(t8, "unknown", "Handles unknown error code gracefully");

  // [9] get_sample_payload
  console.log("\n[9] get_sample_payload — dynamic_sms");
  const r9 = await mcpClient.callTool({ name: "get_sample_payload", arguments: { endpoint: "dynamic_sms" } });
  const t9  = (r9.content as [{text:string}])[0].text;
  assertIncludes(t9, "csms_id",          "Sample contains csms_id");
  assertIncludes(t9, "YOUR_API_TOKEN",   "Sample uses token placeholder");
  assertIncludes(t9, "reference_id",     "Response sample includes reference_id");

  // [10] validate_msisdn — various formats
  console.log("\n[10] validate_msisdn");
  const cases: [string, string, boolean][] = [
    ["01711000001",   "8801711000001", true],   // local format → normalised
    ["+8801811000002","8801811000002", true],   // international with +
    ["8801911000003", "8801911000003", true],   // already normalised
    ["INVALID",       "",              false],  // not numeric
  ];
  for (const [input, expected, shouldBeValid] of cases) {
    const rx = await mcpClient.callTool({ name: "validate_msisdn", arguments: { number: input } });
    const tx  = (rx.content as [{text:string}])[0].text;
    if (shouldBeValid) {
      assertIncludes(tx, expected,  `"${input}" normalises to ${expected}`);
      assertIncludes(tx, "✓ valid", `"${input}" marked valid`);
    } else {
      assertIncludes(tx, "✗",       `"${input}" marked invalid`);
    }
  }

  // [11] get_integration_checklist
  console.log("\n[11] get_integration_checklist");
  const r11 = await mcpClient.callTool({ name: "get_integration_checklist", arguments: {} });
  const t11  = (r11.content as [{text:string}])[0].text;
  assertIncludes(t11, "credentials",  "Checklist mentions credentials");
  assertIncludes(t11, "whitelist",    "Checklist mentions IP whitelisting");
  assertIncludes(t11, "csms_id",     "Checklist covers CSMS ID strategy");
  assertIncludes(t11, "retry",       "Checklist covers retry logic");

  // [12] ask_isms — Q&A tool
  console.log("\n[12] ask_isms — free-form Q&A");
  const qaTests: [string, string[]][] = [
    ["What endpoints are available?",          ["single sms", "bulk sms", "dynamic", "/api/v3"]],
    ["How do I authenticate?",                 ["api_token", "token", "ssl wireless"]],
    ["What does error 4023 mean?",             ["duplicate", "csms_id", "unique"]],
    ["How many recipients can I send bulk to?",["100", "bulk"]],
    ["What phone number format should I use?", ["8801", "880", "msisdn"]],
    ["What is a CSMS ID?",                     ["csms_id", "unique", "20"]],
    ["Do you support Bengali?",                ["bn", "bengali", "unicode"]],
    ["How do I handle rate limits?",           ["4029", "4031", "backoff"]],
    ["Something totally unrelated xyz123",     ["no matching", "topics covered"]],
  ];

  for (const [question, mustContain] of qaTests) {
    const rq = await mcpClient.callTool({ name: "ask_isms", arguments: { question } });
    const tq  = (rq.content as [{text:string}])[0].text.toLowerCase();
    for (const needle of mustContain) {
      assertIncludes(tq, needle, `"${question.slice(0, 40)}" → contains "${needle}"`);
    }
    assert(rq.isError !== true, `"${question.slice(0, 40)}" — no error flag`);
  }

  // [13] Health check
  console.log("\n[13] Health check endpoint");
  const health = await fetch(SERVER_URL.replace("/mcp", "/health"));
  const hj = await health.json() as { status: string; server: string };
  assert(health.ok,                               `Returns 200 (got ${health.status})`);
  assert(hj.status === "ok",                      `Status is "ok"`);
  assert(hj.server === "isms-integration-assistant", `Correct server name`);

} catch (err: unknown) {
  const msg = (err as Error).message ?? "";
  if (msg.includes("ECONNREFUSED") || msg.includes("fetch")) {
    console.warn(`\n⚠  Could not connect to ${SERVER_URL}`);
    console.warn("   Start the server first: npm start\n");
  } else {
    console.error(`Unexpected error: ${msg}`);
    failed++;
  }
} finally {
  await mcpClient?.close?.();
}

console.log(`\n${"=".repeat(45)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log("All tests passed!");
else { console.error(`${failed} test(s) failed.`); process.exit(1); }
