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
    /**
     * Create a new DryRunBuilder
     *
     * @param title - Title of the dry-run preview (e.g., "BUDGET UPDATE")
     * @param operation - Brief description of operation (e.g., "Modify campaign budget")
     */
    constructor(title, operation) {
        this.changes = [];
        this.risks = [];
        this.recommendations = [];
        this.title = title;
        this.operation = operation; // Reserved for future enhancement
        this.confirmationToken = this.generateConfirmationToken();
        void this.operation; // Suppress unused warning
    }
    /**
     * Add a change to the preview
     *
     * @param change - Description of a change (e.g., "Budget: $50/day → $75/day")
     * @returns This builder for chaining
     */
    addChange(change) {
        this.changes.push(change);
        return this;
    }
    /**
     * Add a risk warning
     *
     * @param risk - Risk description (e.g., "Large increase may impact performance")
     * @returns This builder for chaining
     */
    addRisk(risk) {
        this.risks.push(risk);
        return this;
    }
    /**
     * Add a recommendation
     *
     * @param recommendation - Best practice recommendation
     * @returns This builder for chaining
     */
    addRecommendation(recommendation) {
        this.recommendations.push(recommendation);
        return this;
    }
    /**
     * Build the formatted dry-run preview text
     *
     * @param step - Step indicator (e.g., "3/4")
     * @returns Formatted preview text
     */
    build(step) {
        return formatDryRunPreview(this.title, step, this.changes, this.risks, this.recommendations);
    }
    /**
     * Get the confirmation token for this dry-run
     *
     * @returns Confirmation token (used to verify user approval)
     */
    getConfirmationToken() {
        return this.confirmationToken;
    }
    /**
     * Generate a unique confirmation token
     *
     * @returns Random hex string
     */
    generateConfirmationToken() {
        return randomBytes(16).toString('hex');
    }
}
//# sourceMappingURL=dry-run-builder.js.map