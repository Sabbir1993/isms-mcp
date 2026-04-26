export declare const BASE_URL = "https://smsplus.sslwireless.com";
export declare const ENDPOINTS: {
    readonly single_sms: {
        readonly id: "single_sms";
        readonly name: "Single SMS";
        readonly path: "/api/v3/send-sms";
        readonly methods: readonly ["GET", "POST"];
        readonly description: "Send one SMS message to one recipient.";
        readonly max_message_length: 1000;
        readonly params: readonly [{
            readonly name: "api_token";
            readonly type: "string";
            readonly max_length: 50;
            readonly required: true;
            readonly description: "Authentication token issued by SSL Wireless";
        }, {
            readonly name: "sid";
            readonly type: "string";
            readonly max_length: 20;
            readonly required: true;
            readonly description: "Sender ID / masking name allocated to your account";
        }, {
            readonly name: "msisdn";
            readonly type: "string";
            readonly max_length: 16;
            readonly required: true;
            readonly description: "Recipient phone number (numeric, e.g. 8801XXXXXXXXX)";
        }, {
            readonly name: "sms";
            readonly type: "string";
            readonly max_length: 1000;
            readonly required: true;
            readonly description: "Message body (English or Bengali Unicode)";
        }, {
            readonly name: "csms_id";
            readonly type: "string";
            readonly max_length: 20;
            readonly required: true;
            readonly description: "Unique reference ID for this message — must be unique per day";
        }];
    };
    readonly otp_sms: {
        readonly id: "otp_sms";
        readonly name: "Single OTP SMS";
        readonly path: "/api/v3/send-otp-sms";
        readonly methods: readonly ["GET", "POST"];
        readonly description: "Send a One-Time Password (OTP) SMS to one recipient. Use this for authentication codes and verification flows.";
        readonly max_message_length: 1000;
        readonly params: readonly [{
            readonly name: "api_token";
            readonly type: "string";
            readonly max_length: 50;
            readonly required: true;
            readonly description: "Authentication token issued by SSL Wireless";
        }, {
            readonly name: "sid";
            readonly type: "string";
            readonly max_length: 20;
            readonly required: true;
            readonly description: "Sender ID / masking name allocated to your account";
        }, {
            readonly name: "msisdn";
            readonly type: "string";
            readonly max_length: 16;
            readonly required: true;
            readonly description: "Recipient phone number (numeric, e.g. 8801XXXXXXXXX)";
        }, {
            readonly name: "sms";
            readonly type: "string";
            readonly max_length: 1000;
            readonly required: true;
            readonly description: "OTP message body";
        }, {
            readonly name: "csms_id";
            readonly type: "string";
            readonly max_length: 20;
            readonly required: true;
            readonly description: "Unique reference ID — must be unique per day";
        }];
    };
    readonly bulk_sms: {
        readonly id: "bulk_sms";
        readonly name: "Bulk SMS";
        readonly path: "/api/v3/send-sms/bulk";
        readonly methods: readonly ["POST"];
        readonly description: "Send the same message to up to 100 recipients in one request.";
        readonly max_recipients: 100;
        readonly max_message_length: 1000;
        readonly params: readonly [{
            readonly name: "api_token";
            readonly type: "string";
            readonly max_length: 50;
            readonly required: true;
            readonly description: "Authentication token issued by SSL Wireless";
        }, {
            readonly name: "sid";
            readonly type: "string";
            readonly max_length: 20;
            readonly required: true;
            readonly description: "Sender ID / masking name";
        }, {
            readonly name: "msisdn";
            readonly type: "string[]";
            readonly max_length: null;
            readonly required: true;
            readonly description: "Array of recipient phone numbers (max 100)";
        }, {
            readonly name: "sms";
            readonly type: "string";
            readonly max_length: 1000;
            readonly required: true;
            readonly description: "Message body sent to all recipients";
        }, {
            readonly name: "batch_csms_id";
            readonly type: "string";
            readonly max_length: 20;
            readonly required: true;
            readonly description: "Single unique reference ID for the entire batch — must be unique per day";
        }];
    };
    readonly dynamic_sms: {
        readonly id: "dynamic_sms";
        readonly name: "Dynamic SMS";
        readonly path: "/api/v3/send-sms/dynamic";
        readonly methods: readonly ["POST"];
        readonly description: "Send different messages to different recipients (up to 100 messages) in one request.";
        readonly max_messages: 100;
        readonly max_message_length: 1000;
        readonly params: readonly [{
            readonly name: "api_token";
            readonly type: "string";
            readonly max_length: 50;
            readonly required: true;
            readonly description: "Authentication token issued by SSL Wireless";
        }, {
            readonly name: "sid";
            readonly type: "string";
            readonly max_length: 20;
            readonly required: true;
            readonly description: "Sender ID / masking name";
        }, {
            readonly name: "sms";
            readonly type: "object[]";
            readonly max_length: null;
            readonly required: true;
            readonly description: "Array of message objects, each with: text (string), msisdn (string), csms_id (string, unique per day)";
        }];
    };
};
export type EndpointId = keyof typeof ENDPOINTS;
export declare const ERROR_CODES: Record<number, {
    status: string;
    meaning: string;
    fix: string;
}>;
export declare const SMS_STATUS_CODES: {
    SUCCESS: string;
    INVALID: string;
    DUPLICATE: string;
};
export declare const RESPONSE_SCHEMA: {
    status: string;
    status_code: string;
    error_message: string;
    smsinfo: {
        sms_status: string;
        status_message: string;
        msisdn: string;
        sms_type: string;
        sms_body: string;
        csms_id: string;
        reference_id: string;
    }[];
};
export declare const INTEGRATION_CHECKLIST: {
    step: number;
    title: string;
    detail: string;
}[];
//# sourceMappingURL=api-spec.d.ts.map