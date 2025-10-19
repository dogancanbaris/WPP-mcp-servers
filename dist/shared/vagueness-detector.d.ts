/**
 * Vagueness Detector
 * Detects vague requests and forces clarification before execution
 */
/**
 * Vagueness detection result
 */
export interface VaguenessDetectionResult {
    isVague: boolean;
    vaguenessScore: number;
    vagueTerms: string[];
    requiredClarifications: string[];
    suggestions: string[];
}
/**
 * Vagueness detector
 */
export declare class VaguenessDetector {
    /**
     * Detect vagueness in operation request
     */
    detect(params: {
        operation: string;
        inputText: string;
        inputParams: Record<string, any>;
    }): VaguenessDetectionResult;
    /**
     * Check for missing specific values in params
     */
    private checkMissingSpecifics;
    /**
     * Format vagueness detection result for display
     */
    formatDetectionResult(result: VaguenessDetectionResult): string;
    /**
     * Enforce vagueness check (throws if vague)
     */
    enforce(params: {
        operation: string;
        inputText: string;
        inputParams: Record<string, any>;
    }): void;
}
/**
 * Vague request error
 */
export declare class VagueRequestError extends Error {
    constructor(message: string);
}
/**
 * Get vagueness detector instance
 */
export declare function getVaguenessDetector(): VaguenessDetector;
/**
 * Helper to detect and enforce vagueness check
 */
export declare function detectAndEnforceVagueness(params: {
    operation: string;
    inputText: string;
    inputParams: Record<string, any>;
}): void;
//# sourceMappingURL=vagueness-detector.d.ts.map