export class SslWirelessClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    async post(path, body) {
        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }
    static generateCsmsId(prefix = "") {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
        return prefix ? `${prefix}-${date}-${rand}` : `${date}-${rand}`;
    }
    async sendSingleSms(apiToken, sid, msisdn, sms, csmsId) {
        const payload = {
            api_token: apiToken,
            sid,
            msisdn,
            sms,
            csms_id: csmsId ?? SslWirelessClient.generateCsmsId(),
        };
        return this.post("/api/v3/send-sms", payload);
    }
    async sendOtpSms(apiToken, sid, msisdn, sms, csmsId) {
        const payload = {
            api_token: apiToken,
            sid,
            msisdn,
            sms,
            csms_id: csmsId ?? SslWirelessClient.generateCsmsId("OTP"),
        };
        return this.post("/api/v3/send-otp-sms", payload);
    }
    async sendBulkSms(apiToken, sid, msisdns, sms, batchCsmsId) {
        if (msisdns.length > 100) {
            throw new Error("Bulk SMS supports a maximum of 100 recipients per request");
        }
        const payload = {
            api_token: apiToken,
            sid,
            msisdn: msisdns,
            sms,
            batch_csms_id: batchCsmsId ?? SslWirelessClient.generateCsmsId("BULK"),
        };
        return this.post("/api/v3/send-sms/bulk", payload);
    }
    async sendDynamicSms(apiToken, sid, messages) {
        if (messages.length > 100) {
            throw new Error("Dynamic SMS supports a maximum of 100 messages per request");
        }
        const payload = {
            api_token: apiToken,
            sid,
            sms: messages,
        };
        return this.post("/api/v3/send-sms/dynamic", payload);
    }
}
//# sourceMappingURL=sslwireless.js.map