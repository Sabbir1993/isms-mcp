import type { EndpointId } from "./api-spec.js";

export type Language = "javascript" | "python" | "php" | "java" | "curl";

const PLACEHOLDER_TOKEN = "YOUR_API_TOKEN";
const PLACEHOLDER_SID   = "YOUR_SENDER_ID";

function singleJs(endpoint: string): string {
  return `const axios = require('axios'); // or use fetch

async function sendSms(msisdn, message, csmsId) {
  const response = await axios.post('https://smsplus.sslwireless.com${endpoint}', {
    api_token: '${PLACEHOLDER_TOKEN}',
    sid:       '${PLACEHOLDER_SID}',
    msisdn,
    sms:       message,
    csms_id:   csmsId, // unique per day, max 20 chars
  }, {
    headers: { 'Content-Type': 'application/json' },
  });

  const { status_code, smsinfo } = response.data;
  if (status_code !== 200) {
    throw new Error(\`SMS API error \${status_code}\`);
  }
  return smsinfo;
}`;
}

function bulkJs(): string {
  return `const axios = require('axios');

async function sendBulkSms(msisdns, message, batchCsmsId) {
  // msisdns: string[] — max 100 numbers
  const response = await axios.post('https://smsplus.sslwireless.com/api/v3/send-sms/bulk', {
    api_token:     '${PLACEHOLDER_TOKEN}',
    sid:           '${PLACEHOLDER_SID}',
    msisdn:        msisdns,
    sms:           message,
    batch_csms_id: batchCsmsId, // one ID for the whole batch, unique per day
  }, {
    headers: { 'Content-Type': 'application/json' },
  });

  const { status_code, smsinfo } = response.data;
  if (status_code !== 200) throw new Error(\`SMS API error \${status_code}\`);
  return smsinfo;
}`;
}

function dynamicJs(): string {
  return `const axios = require('axios');

async function sendDynamicSms(messages) {
  // messages: Array<{ msisdn: string, text: string, csms_id: string }>
  // Each csms_id must be unique per day. Max 100 messages per request.
  const response = await axios.post('https://smsplus.sslwireless.com/api/v3/send-sms/dynamic', {
    api_token: '${PLACEHOLDER_TOKEN}',
    sid:       '${PLACEHOLDER_SID}',
    sms:       messages.map(m => ({
      msisdn:   m.msisdn,
      text:     m.text,
      csms_id:  m.csms_id,
    })),
  }, {
    headers: { 'Content-Type': 'application/json' },
  });

  const { status_code, smsinfo } = response.data;
  if (status_code !== 200) throw new Error(\`SMS API error \${status_code}\`);
  return smsinfo;
}`;
}

function singlePython(endpoint: string): string {
  return `import requests

def send_sms(msisdn: str, message: str, csms_id: str) -> dict:
    payload = {
        "api_token": "${PLACEHOLDER_TOKEN}",
        "sid":       "${PLACEHOLDER_SID}",
        "msisdn":    msisdn,
        "sms":       message,
        "csms_id":   csms_id,  # unique per day, max 20 chars
    }
    response = requests.post(
        "https://smsplus.sslwireless.com${endpoint}",
        json=payload,
    )
    response.raise_for_status()
    data = response.json()

    if data["status_code"] != 200:
        raise Exception(f"SMS API error {data['status_code']}: {data.get('error_message')}")

    return data["smsinfo"]`;
}

function bulkPython(): string {
  return `import requests

def send_bulk_sms(msisdns: list[str], message: str, batch_csms_id: str) -> dict:
    # msisdns: list of phone numbers — max 100
    payload = {
        "api_token":     "${PLACEHOLDER_TOKEN}",
        "sid":           "${PLACEHOLDER_SID}",
        "msisdn":        msisdns,
        "sms":           message,
        "batch_csms_id": batch_csms_id,  # unique per day, max 20 chars
    }
    response = requests.post(
        "https://smsplus.sslwireless.com/api/v3/send-sms/bulk",
        json=payload,
    )
    response.raise_for_status()
    data = response.json()

    if data["status_code"] != 200:
        raise Exception(f"SMS API error {data['status_code']}: {data.get('error_message')}")

    return data["smsinfo"]`;
}

function dynamicPython(): string {
  return `import requests

def send_dynamic_sms(messages: list[dict]) -> list:
    # messages: [{"msisdn": "...", "text": "...", "csms_id": "..."}]
    # Each csms_id must be unique per day. Max 100 messages per request.
    payload = {
        "api_token": "${PLACEHOLDER_TOKEN}",
        "sid":       "${PLACEHOLDER_SID}",
        "sms":       messages,
    }
    response = requests.post(
        "https://smsplus.sslwireless.com/api/v3/send-sms/dynamic",
        json=payload,
    )
    response.raise_for_status()
    data = response.json()

    if data["status_code"] != 200:
        raise Exception(f"SMS API error {data['status_code']}: {data.get('error_message')}")

    return data["smsinfo"]`;
}

function singlePhp(endpoint: string): string {
  return `<?php
function sendSms(string $msisdn, string $message, string $csmsId): array {
    $payload = json_encode([
        'api_token' => '${PLACEHOLDER_TOKEN}',
        'sid'       => '${PLACEHOLDER_SID}',
        'msisdn'    => $msisdn,
        'sms'       => $message,
        'csms_id'   => $csmsId, // unique per day, max 20 chars
    ]);

    $ch = curl_init('https://smsplus.sslwireless.com${endpoint}');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    ]);

    $response = json_decode(curl_exec($ch), true);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || $response['status_code'] !== 200) {
        throw new RuntimeException("SMS API error {$response['status_code']}: {$response['error_message']}");
    }

    return $response['smsinfo'];
}`;
}

function bulkPhp(): string {
  return `<?php
function sendBulkSms(array $msisdns, string $message, string $batchCsmsId): array {
    // $msisdns: array of phone number strings — max 100
    $payload = json_encode([
        'api_token'     => '${PLACEHOLDER_TOKEN}',
        'sid'           => '${PLACEHOLDER_SID}',
        'msisdn'        => $msisdns,
        'sms'           => $message,
        'batch_csms_id' => $batchCsmsId, // unique per day, max 20 chars
    ]);

    $ch = curl_init('https://smsplus.sslwireless.com/api/v3/send-sms/bulk');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    ]);

    $response = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if ($response['status_code'] !== 200) {
        throw new RuntimeException("SMS API error {$response['status_code']}");
    }
    return $response['smsinfo'];
}`;
}

function dynamicPhp(): string {
  return `<?php
function sendDynamicSms(array $messages): array {
    // $messages: array of ['msisdn'=>'...','text'=>'...','csms_id'=>'...']
    // Each csms_id must be unique per day. Max 100 messages per request.
    $payload = json_encode([
        'api_token' => '${PLACEHOLDER_TOKEN}',
        'sid'       => '${PLACEHOLDER_SID}',
        'sms'       => $messages,
    ]);

    $ch = curl_init('https://smsplus.sslwireless.com/api/v3/send-sms/dynamic');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    ]);

    $response = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if ($response['status_code'] !== 200) {
        throw new RuntimeException("SMS API error {$response['status_code']}");
    }
    return $response['smsinfo'];
}`;
}

function singleJava(endpoint: string): string {
  return `import java.net.http.*;
import java.net.URI;

public class SmsClient {
    private static final String API_TOKEN = "${PLACEHOLDER_TOKEN}";
    private static final String SID       = "${PLACEHOLDER_SID}";
    private static final String BASE_URL  = "https://smsplus.sslwireless.com";

    public String sendSms(String msisdn, String message, String csmsId) throws Exception {
        String body = String.format(
            "{\\"api_token\\":\\"%s\\",\\"sid\\":\\"%s\\",\\"msisdn\\":\\"%s\\",\\"sms\\":\\"%s\\",\\"csms_id\\":\\"%s\\"}",
            API_TOKEN, SID, msisdn, message, csmsId
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "${endpoint}"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        // Parse response.body() with your preferred JSON library (Gson, Jackson, etc.)
        return response.body();
    }
}`;
}

function singleCurl(endpoint: string): string {
  return `curl -X POST https://smsplus.sslwireless.com${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_token": "${PLACEHOLDER_TOKEN}",
    "sid":       "${PLACEHOLDER_SID}",
    "msisdn":    "8801XXXXXXXXX",
    "sms":       "Your message here",
    "csms_id":   "MYAPP-20240427-ABC12"
  }'`;
}

function bulkCurl(): string {
  return `curl -X POST https://smsplus.sslwireless.com/api/v3/send-sms/bulk \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_token":     "${PLACEHOLDER_TOKEN}",
    "sid":           "${PLACEHOLDER_SID}",
    "msisdn":        ["8801XXXXXXXXX", "8801YYYYYYYYY"],
    "sms":           "Your message here",
    "batch_csms_id": "BATCH-20240427-XYZ99"
  }'`;
}

function dynamicCurl(): string {
  return `curl -X POST https://smsplus.sslwireless.com/api/v3/send-sms/dynamic \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_token": "${PLACEHOLDER_TOKEN}",
    "sid":       "${PLACEHOLDER_SID}",
    "sms": [
      { "msisdn": "8801XXXXXXXXX", "text": "Hello Alice!", "csms_id": "MSG-001-20240427" },
      { "msisdn": "8801YYYYYYYYY", "text": "Hello Bob!",   "csms_id": "MSG-002-20240427" }
    ]
  }'`;
}

export function generateCode(endpointId: EndpointId, language: Language): string {
  const pathMap: Record<EndpointId, string> = {
    single_sms:  "/api/v3/send-sms",
    otp_sms:     "/api/v3/send-otp-sms",
    bulk_sms:    "/api/v3/send-sms/bulk",
    dynamic_sms: "/api/v3/send-sms/dynamic",
  };
  const path = pathMap[endpointId];

  const isBulk    = endpointId === "bulk_sms";
  const isDynamic = endpointId === "dynamic_sms";

  switch (language) {
    case "javascript":
      return isBulk ? bulkJs() : isDynamic ? dynamicJs() : singleJs(path);
    case "python":
      return isBulk ? bulkPython() : isDynamic ? dynamicPython() : singlePython(path);
    case "php":
      return isBulk ? bulkPhp() : isDynamic ? dynamicPhp() : singlePhp(path);
    case "java":
      return isBulk || isDynamic
        ? "// Java example shown for single/OTP. Adapt the JSON body for bulk/dynamic using the parameter reference above."
        : singleJava(path);
    case "curl":
      return isBulk ? bulkCurl() : isDynamic ? dynamicCurl() : singleCurl(path);
  }
}
