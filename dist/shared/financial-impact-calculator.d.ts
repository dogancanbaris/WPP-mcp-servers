/**
 * Financial Impact Calculator
 * Calculates actual financial impact during error periods using Google Ads API
 */
/**
 * Financial impact result
 */
export interface FinancialImpactResult {
    totalCost: number;
    dailyBreakdown: Array<{
        date: string;
        cost: number;
        clicks: number;
        impressions: number;
    }>;
    errorPeriodStart: Date;
    errorPeriodEnd: Date;
    daysAffected: number;
    averageDailyCost: number;
    comparisonToBaseline?: {
        baselineDailyCost: number;
        excessCost: number;
        excessPercentage: number;
    };
}
/**
 * Financial impact calculator
 */
export declare class FinancialImpactCalculator {
    /**
     * Calculate financial impact for a period
     */
    calculateImpact(params: {
        customerId: string;
        campaignId?: string;
        startDate: Date;
        endDate: Date;
        baselineDailyCost?: number;
    }): Promise<FinancialImpactResult>;
    /**
     * Calculate baseline cost from historical data
     */
    calculateBaselineCost(params: {
        customerId: string;
        campaignId?: string;
        daysToAnalyze?: number;
    }): Promise<number>;
    /**
     * Format financial impact as readable report
     */
    formatImpactReport(impact: FinancialImpactResult): string;
    /**
     * Format date as YYYY-MM-DD
     */
    private formatDate;
}
/**
 * Get financial impact calculator instance
 */
export declare function getFinancialImpactCalculator(): FinancialImpactCalculator;
/**
 * Helper to calculate and format financial impact
 */
export declare function calculateAndFormatFinancialImpact(params: {
    customerId: string;
    campaignId?: string;
    startDate: Date;
    endDate: Date;
    baselineDailyCost?: number;
}): Promise<{
    impact: FinancialImpactResult;
    report: string;
}>;
//# sourceMappingURL=financial-impact-calculator.d.ts.map