import type { ApiResponse, DynamicSmsItem } from "../types.js";
export declare class SslWirelessClient {
    private readonly baseUrl;
    constructor(baseUrl: string);
    private post;
    static generateCsmsId(prefix?: string): string;
    sendSingleSms(apiToken: string, sid: string, msisdn: string, sms: string, csmsId?: string): Promise<ApiResponse>;
    sendOtpSms(apiToken: string, sid: string, msisdn: string, sms: string, csmsId?: string): Promise<ApiResponse>;
    sendBulkSms(apiToken: string, sid: string, msisdns: string[], sms: string, batchCsmsId?: string): Promise<ApiResponse>;
    sendDynamicSms(apiToken: string, sid: string, messages: DynamicSmsItem[]): Promise<ApiResponse>;
}
//# sourceMappingURL=sslwireless.d.ts.map