/**
 * Safety Features Test Suite
 * Tests for all safety infrastructure components
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ApprovalEnforcer, DryRunResultBuilder } from '../src/shared/approval-enforcer';
import { SnapshotManager } from '../src/shared/snapshot-manager';
import { FinancialImpactCalculator } from '../src/shared/financial-impact-calculator';
import { VaguenessDetector, VagueRequestError } from '../src/shared/vagueness-detector';
import { PatternMatcher, TooManyMatchesError } from '../src/shared/pattern-matcher';
import { validateBudgetChange } from '../src/shared/interceptor';

describe('Approval Workflow Enforcer', () => {
  let approvalEnforcer: ApprovalEnforcer;

  beforeEach(() => {
    approvalEnforcer = new ApprovalEnforcer();
  });

  it('should generate confirmation token for dry-run', async () => {
    const { confirmationToken } = await approvalEnforcer.createDryRun(
      'test_operation',
      'Test API',
      'account123',
      { param: 'value' }
    );

    expect(confirmationToken).toBeDefined();
    expect(typeof confirmationToken).toBe('string');
    expect(confirmationToken.length).toBeGreaterThan(0);
  });

  it('should validate and execute operation with valid token', async () => {
    // Create dry-run
    const dryRunBuilder = new DryRunResultBuilder('test_op', 'Test API', 'account123');
    dryRunBuilder.addChange({
      resource: 'Test Resource',
      resourceId: '123',
      field: 'status',
      currentValue: 'PAUSED',
      newValue: 'ENABLED',
      changeType: 'update',
    });
    const dryRun = dryRunBuilder.build();

    const { confirmationToken } = await approvalEnforcer.createDryRun(
      'test_op',
      'Test API',
      'account123',
      {}
    );

    // Execute with token
    const executeCallback = jest.fn().mockResolvedValue({ success: true });
    const result = await approvalEnforcer.validateAndExecute(
      confirmationToken,
      dryRun,
      executeCallback
    );

    expect(executeCallback).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('should reject invalid confirmation token', async () => {
    const dryRunBuilder = new DryRunResultBuilder('test_op', 'Test API', 'account123');
    const dryRun = dryRunBuilder.build();

    const executeCallback = jest.fn();

    await expect(
      approvalEnforcer.validateAndExecute('invalid_token_12345', dryRun, executeCallback)
    ).rejects.toThrow('Invalid or expired confirmation token');

    expect(executeCallback).not.toHaveBeenCalled();
  });

  it('should format dry-run result for display', () => {
    const dryRunBuilder = new DryRunResultBuilder('update_budget', 'Google Ads', 'account123');

    dryRunBuilder.addChange({
      resource: 'Campaign Budget',
      resourceId: 'budget_456',
      field: 'daily_amount',
      currentValue: '$50/day',
      newValue: '$100/day',
      changeType: 'update',
    });

    dryRunBuilder.setFinancialImpact({
      currentDailySpend: 50,
      estimatedNewDailySpend: 100,
      dailyDifference: 50,
      monthlyDifference: 1520,
      percentageChange: 100,
    });

    dryRunBuilder.addRisk('Large budget increase may cause delivery fluctuations');
    dryRunBuilder.addRecommendation('Consider increasing in smaller steps');

    const dryRun = dryRunBuilder.build();
    const formatted = approvalEnforcer.formatDryRunForDisplay(dryRun);

    expect(formatted).toContain('PREVIEW');
    expect(formatted).toContain('update_budget');
    expect(formatted).toContain('CHANGES');
    expect(formatted).toContain('FINANCIAL IMPACT');
    expect(formatted).toContain('RISKS');
    expect(formatted).toContain('RECOMMENDATIONS');
    expect(formatted).toContain('60 seconds');
  });
});

describe('Snapshot Manager', () => {
  let snapshotManager: SnapshotManager;

  beforeEach(() => {
    snapshotManager = new SnapshotManager();
  });

  it('should create snapshot before operation', async () => {
    const snapshotId = await snapshotManager.createSnapshot({
      operation: 'update_budget',
      api: 'Google Ads',
      accountId: 'account123',
      userId: 'user@example.com',
      resourceType: 'Campaign Budget',
      resourceId: 'budget_456',
      beforeState: { daily_amount: 50 },
    });

    expect(snapshotId).toBeDefined();
    expect(snapshotId).toContain('snap_');

    const snapshot = await snapshotManager.getSnapshot(snapshotId);
    expect(snapshot).toBeDefined();
    expect(snapshot?.operation).toBe('update_budget');
    expect(snapshot?.beforeState).toEqual({ daily_amount: 50 });
  });

  it('should record execution after operation', async () => {
    const snapshotId = await snapshotManager.createSnapshot({
      operation: 'update_budget',
      api: 'Google Ads',
      accountId: 'account123',
      userId: 'user@example.com',
      resourceType: 'Campaign Budget',
      resourceId: 'budget_456',
      beforeState: { daily_amount: 50 },
    });

    await snapshotManager.recordExecution(snapshotId, { daily_amount: 100 });

    const snapshot = await snapshotManager.getSnapshot(snapshotId);
    expect(snapshot?.afterState).toEqual({ daily_amount: 100 });
    expect(snapshot?.executedAt).toBeDefined();
  });

  it('should get snapshots for account', async () => {
    await snapshotManager.createSnapshot({
      operation: 'update_budget',
      api: 'Google Ads',
      accountId: 'account123',
      userId: 'user@example.com',
      resourceType: 'Campaign Budget',
      resourceId: 'budget_1',
      beforeState: { amount: 50 },
    });

    await snapshotManager.createSnapshot({
      operation: 'update_campaign_status',
      api: 'Google Ads',
      accountId: 'account123',
      userId: 'user@example.com',
      resourceType: 'Campaign',
      resourceId: 'campaign_1',
      beforeState: { status: 'PAUSED' },
    });

    const snapshots = await snapshotManager.getSnapshotsForAccount('account123');
    expect(snapshots.length).toBe(2);
  });

  it('should generate comparison report', () => {
    const snapshot = {
      snapshotId: 'snap_123',
      operation: 'update_budget',
      api: 'Google Ads',
      accountId: 'account123',
      userId: 'user@example.com',
      timestamp: new Date(),
      resourceType: 'Campaign Budget',
      resourceId: 'budget_456',
      beforeState: { daily_amount: 50 },
      afterState: { daily_amount: 100 },
      executedAt: new Date(),
    };

    const report = snapshotManager.generateComparisonReport(snapshot);

    expect(report).toContain('SNAPSHOT');
    expect(report).toContain('update_budget');
    expect(report).toContain('BEFORE STATE');
    expect(report).toContain('AFTER STATE');
  });
});

describe('Vagueness Detector', () => {
  let detector: VaguenessDetector;

  beforeEach(() => {
    detector = new VaguenessDetector();
  });

  it('should detect vague quantifiers', () => {
    const result = detector.detect({
      operation: 'update_budgets',
      inputText: 'update all campaigns',
      inputParams: {},
    });

    expect(result.isVague).toBe(true);
    expect(result.vagueTerms).toContain('all');
    expect(result.requiredClarifications.length).toBeGreaterThan(0);
  });

  it('should detect relative terms without numbers', () => {
    const result = detector.detect({
      operation: 'update_budget',
      inputText: 'increase budget to high',
      inputParams: { budgetId: '123' },
    });

    expect(result.isVague).toBe(true);
    expect(result.vagueTerms).toContain('high');
  });

  it('should detect indefinite references', () => {
    const result = detector.detect({
      operation: 'pause_campaigns',
      inputText: 'pause them',
      inputParams: {},
    });

    expect(result.isVague).toBe(true);
    expect(result.vagueTerms).toContain('them');
  });

  it('should not flag specific requests', () => {
    const result = detector.detect({
      operation: 'update_budget',
      inputText: 'update budget 123 to $100/day',
      inputParams: { customerId: '123', budgetId: '456', dailyAmountDollars: 100 },
    });

    expect(result.isVague).toBe(false);
  });

  it('should enforce vagueness check and throw for vague requests', () => {
    expect(() => {
      detector.enforce({
        operation: 'update_campaigns',
        inputText: 'update all campaigns',
        inputParams: {},
      });
    }).toThrow(VagueRequestError);
  });

  it('should format detection result', () => {
    const result = detector.detect({
      operation: 'pause_campaigns',
      inputText: 'pause some campaigns',
      inputParams: {},
    });

    const formatted = detector.formatDetectionResult(result);

    expect(formatted).toContain('VAGUE REQUEST DETECTED');
    expect(formatted).toContain('Vagueness Score');
    expect(formatted).toContain('Required clarifications');
  });
});

describe('Pattern Matcher', () => {
  let matcher: PatternMatcher;

  beforeEach(() => {
    matcher = new PatternMatcher();
  });

  it('should match campaigns by pattern', () => {
    const campaigns = [
      { id: '1', name: 'Test Campaign 1', status: 'ENABLED' },
      { id: '2', name: 'Test Campaign 2', status: 'PAUSED' },
      { id: '3', name: 'Prod Campaign 1', status: 'ENABLED' },
    ];

    const result = matcher.matchCampaigns({
      pattern: 'Test',
      campaigns,
    });

    expect(result.totalMatched).toBe(2);
    expect(result.matchedItems.length).toBe(2);
    expect(result.requiresConfirmation).toBe(true);
  });

  it('should throw error if >20 matches', () => {
    const campaigns = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Test Campaign ${i}`,
      status: 'ENABLED',
    }));

    expect(() => {
      matcher.matchCampaigns({
        pattern: 'Test',
        campaigns,
      });
    }).toThrow(TooManyMatchesError);
  });

  it('should create bulk operation with confirmation', () => {
    const campaigns = [
      { id: '1', name: 'Test 1', status: 'ENABLED' },
      { id: '2', name: 'Test 2', status: 'ENABLED' },
    ];

    const bulkOp = matcher.createBulkOperation({
      operation: 'pause_campaigns',
      pattern: 'Test',
      matchedItems: campaigns,
      formatFn: (c) => `${c.name} (${c.id})`,
    });

    expect(bulkOp.requiresConfirmation).toBe(true);
    expect(bulkOp.confirmationMessage).toContain('BULK OPERATION');
    expect(bulkOp.confirmationMessage).toContain('2');
    expect(bulkOp.itemsToConfirm).toEqual(campaigns);
  });

  it('should enforce max bulk items limit', () => {
    expect(matcher.getMaxBulkItems()).toBe(20);
  });
});

describe('Budget Cap Validation', () => {
  it('should allow budget changes <500%', async () => {
    const currentMicros = 50 * 1000000; // $50
    const newMicros = 200 * 1000000; // $200 (300% increase)

    const result = await validateBudgetChange(currentMicros, newMicros);

    expect(result.allowed).toBe(true);
    expect(result.percentChange).toBe(300);
  });

  it('should warn for budget changes >100%', async () => {
    const currentMicros = 50 * 1000000;
    const newMicros = 150 * 1000000; // 200% increase

    const result = await validateBudgetChange(currentMicros, newMicros);

    expect(result.allowed).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should block budget changes >500%', async () => {
    const currentMicros = 50 * 1000000;
    const newMicros = 400 * 1000000; // 700% increase

    await expect(validateBudgetChange(currentMicros, newMicros)).rejects.toThrow(
      'exceeds maximum allowed (500%)'
    );
  });
});

describe('DryRunResultBuilder', () => {
  it('should build complete dry-run result', () => {
    const builder = new DryRunResultBuilder('test_op', 'Test API', 'account123');

    builder.addChange({
      resource: 'Test Resource',
      resourceId: '123',
      field: 'value',
      currentValue: 'old',
      newValue: 'new',
      changeType: 'update',
    });

    builder.setFinancialImpact({
      currentDailySpend: 50,
      estimatedNewDailySpend: 100,
      dailyDifference: 50,
      monthlyDifference: 1520,
      percentageChange: 100,
    });

    builder.addRisk('Test risk');
    builder.addRecommendation('Test recommendation');

    const result = builder.build();

    expect(result.operation).toBe('test_op');
    expect(result.api).toBe('Test API');
    expect(result.accountId).toBe('account123');
    expect(result.changes.length).toBe(1);
    expect(result.risks).toContain('Test risk');
    expect(result.recommendations).toContain('Test recommendation');
    expect(result.estimatedImpact).toBeDefined();
  });
});

describe('Integration: Complete Approval Workflow', () => {
  it('should execute full preview → confirm → execute cycle', async () => {
    const approvalEnforcer = new ApprovalEnforcer();
    const snapshotManager = new SnapshotManager();

    // Step 1: Create dry-run preview
    const dryRunBuilder = new DryRunResultBuilder('update_budget', 'Google Ads', 'account123');

    dryRunBuilder.addChange({
      resource: 'Campaign Budget',
      resourceId: 'budget_456',
      field: 'daily_amount',
      currentValue: '$50/day',
      newValue: '$100/day',
      changeType: 'update',
    });

    dryRunBuilder.setFinancialImpact({
      currentDailySpend: 50,
      estimatedNewDailySpend: 100,
      dailyDifference: 50,
      monthlyDifference: 1520,
      percentageChange: 100,
    });

    const dryRun = dryRunBuilder.build();

    // Step 2: Get confirmation token
    const { confirmationToken } = await approvalEnforcer.createDryRun(
      'update_budget',
      'Google Ads',
      'account123',
      { budgetId: 'budget_456', newAmount: 100 }
    );

    expect(confirmationToken).toBeDefined();

    // Step 3: Create snapshot
    const snapshotId = await snapshotManager.createSnapshot({
      operation: 'update_budget',
      api: 'Google Ads',
      accountId: 'account123',
      userId: 'user@example.com',
      resourceType: 'Campaign Budget',
      resourceId: 'budget_456',
      beforeState: { daily_amount: 50 },
    });

    // Step 4: Execute with confirmation
    const mockExecute = jest.fn().mockResolvedValue({ daily_amount: 100 });

    const result = await approvalEnforcer.validateAndExecute(
      confirmationToken,
      dryRun,
      mockExecute
    );

    expect(mockExecute).toHaveBeenCalled();
    expect(result).toEqual({ daily_amount: 100 });

    // Step 5: Record execution in snapshot
    await snapshotManager.recordExecution(snapshotId, result);

    const snapshot = await snapshotManager.getSnapshot(snapshotId);
    expect(snapshot?.afterState).toEqual({ daily_amount: 100 });
    expect(snapshot?.executedAt).toBeDefined();
  });
});
