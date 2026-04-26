/**
 * Answer a free-form question about the ISMSPLUS API.
 *
 * Resolution order:
 *   1. Short type-selection reply  (e.g. "1", "bulk", "otp")
 *   2. Vague send-SMS question     → show the type menu
 *   3. Keyword-matched knowledge   → return relevant sections
 *   4. No match                    → show topics list
 */
export declare function answerQuestion(question: string): string;
//# sourceMappingURL=qa-engine.d.ts.map