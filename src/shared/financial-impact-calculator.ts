/**
 * Financial Impact Calculator
 * Calculates actual financial impact during error periods using Google Ads API
 */

import { getGoogleAdsClient } from '../ads/client.js';
import { getLogger } from './logger.js';

const logger = getLogger('shared.financial-impact-calculator');

/**
 * Financial impact result
 */
export interface FinancialImpactResult {
  totalCost: number;
  dailyBreakdown: Array<{ date: string; cost: number; clicks: number; impressions: number }>;
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
export class FinancialImpactCalculator {
  /**
   * Calculate financial impact for a period
   */
  async calculateImpact(params: {
    customerId: string;
    campaignId?: string;
    startDate: Date;
    endDate: Date;
    baselineDailyCost?: number;
  }): Promise<FinancialImpactResult> {
    logger.info('Calculating financial impact', {
      customerId: params.customerId,
      campaignId: params.campaignId,
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });

    const client = getGoogleAdsClient();

    // Format dates for Google Ads API (YYYY-MM-DD)
    const startDateStr = this.formatDate(params.startDate);
    const endDateStr = this.formatDate(params.endDate);

    // Query Google Ads for performance during period
    const query = `
      SELECT
        segments.date,
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions
      FROM campaign
      WHERE segments.date BETWEEN '${startDateStr}' AND '${endDateStr}'
      ${params.campaignId ? `AND campaign.id = ${params.campaignId}` : ''}
      ORDER BY segments.date ASC
    `;

    let totalCost = 0;
    const dailyBreakdown: Array<{
      date: string;
      cost: number;
      clicks: number;
      impressions: number;
    }> = [];

    try {
      const customer = client.getCustomer(params.customerId);
      const results = await customer.query(query);

      for (const row of results) {
        const date = row.segments?.date || '';
        const costMicros = parseInt(String(row.metrics?.cost_micros || 0));
        const cost = costMicros / 1000000;
        const clicks = parseInt(String(row.metrics?.clicks || 0));
        const impressions = parseInt(String(row.metrics?.impressions || 0));

        totalCost += cost;

        dailyBreakdown.push({
          date,
          cost,
          clicks,
          impressions,
        });
      }

      // Calculate days affected
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysAffected = Math.ceil(
        (params.endDate.getTime() - params.startDate.getTime()) / msPerDay
      );

      const averageDailyCost = daysAffected > 0 ? totalCost / daysAffected : 0;

      const result: FinancialImpactResult = {
        totalCost,
        dailyBreakdown,
        errorPeriodStart: params.startDate,
        errorPeriodEnd: params.endDate,
        daysAffected,
        averageDailyCost,
      };

      // Calculate comparison to baseline if provided
      if (params.baselineDailyCost !== undefined && params.baselineDailyCost > 0) {
        const expectedCost = params.baselineDailyCost * daysAffected;
        const excessCost = totalCost - expectedCost;
        const excessPercentage = (excessCost / expectedCost) * 100;

        result.comparisonToBaseline = {
          baselineDailyCost: params.baselineDailyCost,
          excessCost,
          excessPercentage,
        };
      }

      logger.info('Financial impact calculated', {
        totalCost: totalCost.toFixed(2),
        daysAffected,
        averageDailyCost: averageDailyCost.toFixed(2),
      });

      return result;
    } catch (error) {
      logger.error('Failed to calculate financial impact', error as Error);
      throw new Error(`Failed to calculate financial impact: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate baseline cost from historical data
   */
  async calculateBaselineCost(params: {
    customerId: string;
    campaignId?: string;
    daysToAnalyze?: number;
  }): Promise<number> {
    const daysToAnalyze = params.daysToAnalyze || 30;

    // Get historical data from last N days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    const impact = await this.calculateImpact({
      customerId: params.customerId,
      campaignId: params.campaignId,
      startDate,
      endDate,
    });

    return impact.averageDailyCost;
  }

  /**
   * Format financial impact as readable report
   */
  formatImpactReport(impact: FinancialImpactResult): string {
    let report = '\n💰 FINANCIAL IMPACT REPORT\n\n';

    report += `📅 Error Period:\n`;
    report += `   From: ${impact.errorPeriodStart.toISOString()}\n`;
    report += `   To: ${impact.errorPeriodEnd.toISOString()}\n`;
    report += `   Days affected: ${impact.daysAffected}\n\n`;

    report += `💸 Total Cost: $${impact.totalCost.toFixed(2)}\n`;
    report += `📊 Average daily cost: $${impact.averageDailyCost.toFixed(2)}\n\n`;

    // Comparison to baseline
    if (impact.comparisonToBaseline) {
      const comparison = impact.comparisonToBaseline;
      report += `📈 COMPARISON TO BASELINE:\n`;
      report += `   Baseline daily cost: $${comparison.baselineDailyCost.toFixed(2)}\n`;
      report += `   Expected cost: $${(comparison.baselineDailyCost * impact.daysAffected).toFixed(2)}\n`;
      report += `   Excess cost: ${comparison.excessCost >= 0 ? '+' : ''}$${comparison.excessCost.toFixed(2)}\n`;
      report += `   Excess percentage: ${comparison.excessPercentage >= 0 ? '+' : ''}${comparison.excessPercentage.toFixed(1)}%\n\n`;
    }

    // Daily breakdown
    if (impact.dailyBreakdown.length > 0) {
      report += `📋 DAILY BREAKDOWN:\n`;
      impact.dailyBreakdown.forEach((day) => {
        report += `   ${day.date}: $${day.cost.toFixed(2)} (${day.clicks} clicks, ${day.impressions} impressions)\n`;
      });
    }

    return report;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// Singleton instance
let financialImpactCalculatorInstance: FinancialImpactCalculator | null = null;

/**
 * Get financial impact calculator instance
 */
export function getFinancialImpactCalculator(): FinancialImpactCalculator {
  if (!financialImpactCalculatorInstance) {
    financialImpactCalculatorInstance = new FinancialImpactCalculator();
  }
  return financialImpactCalculatorInstance;
}

/**
 * Helper to calculate and format financial impact
 */
export async function calculateAndFormatFinancialImpact(params: {
  customerId: string;
  campaignId?: string;
  startDate: Date;
  endDate: Date;
  baselineDailyCost?: number;
}): Promise<{ impact: FinancialImpactResult; report: string }> {
  const calculator = getFinancialImpactCalculator();

  const impact = await calculator.calculateImpact(params);
  const report = calculator.formatImpactReport(impact);

  return { impact, report };
}
