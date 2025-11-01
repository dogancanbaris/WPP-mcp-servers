/**
 * Dry-Run Builder Utility
 *
 * Provides a fluent API for building dry-run previews for write operations.
 * Simplifies the creation of approval workflows with impact analysis.
 */

import { formatDryRunPreview } from './interactive-workflow.js';
import { randomBytes } from 'crypto';

/**
 * DryRunBuilder - Fluent API for creating dry-run previews
 *
 * @example
 * ```typescript
 * const builder = new DryRunBuilder('BUDGET UPDATE', 'Modify campaign budget');
 * builder.addChange(`Budget: ${budgetName}`);
 * builder.addChange(`Current: $${oldAmount}/day`);
 * builder.addChange(`New: $${newAmount}/day`);
 * builder.addRisk('Large increase may impact performance');
 * builder.addRecommendation('Monitor performance over next 7 days');
 * const preview = builder.build('3/4');
 * ```
 */
export class DryRunBuilder {
    // @ts-expect-error - operation extracted for this.operation assignment
  private title: string;
  private operation: string;
  private changes: string[] = [];
  private risks: string[] = [];
  private recommendations: string[] = [];
  private confirmationToken: string;

  /**
   * Create a new DryRunBuilder
   *
   * @param title - Title of the dry-run preview (e.g., "BUDGET UPDATE")
   * @param operation - Brief description of operation (e.g., "Modify campaign budget")
   */
  constructor(title: string, operation: string) {
    this.title = title;
    this.operation = operation;
    this.confirmationToken = this.generateConfirmationToken();
  }

  /**
   * Add a change to the preview
   *
   * @param change - Description of a change (e.g., "Budget: $50/day → $75/day")
   * @returns This builder for chaining
   */
  addChange(change: string): this {
    this.changes.push(change);
    return this;
  }

  /**
   * Add a risk warning
   *
   * @param risk - Risk description (e.g., "Large increase may impact performance")
   * @returns This builder for chaining
   */
  addRisk(risk: string): this {
    this.risks.push(risk);
    return this;
  }

  /**
   * Add a recommendation
   *
   * @param recommendation - Best practice recommendation
   * @returns This builder for chaining
   */
  addRecommendation(recommendation: string): this {
    this.recommendations.push(recommendation);
    return this;
  }

  /**
   * Build the formatted dry-run preview text
   *
   * @param step - Step indicator (e.g., "3/4")
   * @returns Formatted preview text
   */
  build(step: string): string {
    return formatDryRunPreview(this.title, step, this.changes, this.risks, this.recommendations);
  }

  /**
   * Get the confirmation token for this dry-run
   *
   * @returns Confirmation token (used to verify user approval)
   */
  getConfirmationToken(): string {
    return this.confirmationToken;
  }

  /**
   * Generate a unique confirmation token
   *
   * @returns Random hex string
   */
  private generateConfirmationToken(): string {
    return randomBytes(16).toString('hex');
  }
}
