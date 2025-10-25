/**
 * Utility functions for the AdvancedFilter component
 *
 * These utilities help with:
 * - Filter validation
 * - Filter serialization/deserialization
 * - Converting filters to various query formats
 * - Filter cloning and manipulation
 */

import {
  FilterGroup,
  FilterCondition,
  FilterOperator,
  FilterDataType,
  LogicalOperator,
} from './AdvancedFilter';

/**
 * Validate a filter group and its nested conditions
 */
export function validateFilterGroup(group: FilterGroup): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate group structure
  if (!group.id) {
    errors.push('Filter group is missing an ID');
  }

  if (!['AND', 'OR'].includes(group.operator)) {
    errors.push(`Invalid group operator: ${group.operator}`);
  }

  // Validate conditions
  for (const condition of group.conditions) {
    const conditionErrors = validateCondition(condition);
    errors.push(...conditionErrors);
  }

  // Validate nested groups recursively
  for (const nestedGroup of group.groups) {
    const { errors: nestedErrors } = validateFilterGroup(nestedGroup);
    errors.push(...nestedErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a single filter condition
 */
export function validateCondition(condition: FilterCondition): string[] {
  const errors: string[] = [];

  if (!condition.id) {
    errors.push('Condition is missing an ID');
  }

  if (!condition.field) {
    errors.push(`Condition ${condition.id}: Missing field`);
  }

  if (!condition.operator) {
    errors.push(`Condition ${condition.id}: Missing operator`);
  }

  // Validate value based on operator
  const needsValue = !['is_null', 'is_not_null'].includes(condition.operator);
  if (needsValue) {
    if (condition.operator === 'between') {
      if (!Array.isArray(condition.value) || condition.value.length !== 2) {
        errors.push(`Condition ${condition.id}: 'between' operator requires two values`);
      } else if (condition.value.some(v => v === '' || v === null || v === undefined)) {
        errors.push(`Condition ${condition.id}: 'between' values cannot be empty`);
      }
    } else if (['in', 'not_in'].includes(condition.operator)) {
      if (!Array.isArray(condition.value) || condition.value.length === 0) {
        errors.push(`Condition ${condition.id}: '${condition.operator}' requires at least one value`);
      }
    } else {
      if (condition.value === '' || condition.value === null || condition.value === undefined) {
        errors.push(`Condition ${condition.id}: Value is required for operator '${condition.operator}'`);
      }
    }
  }

  // Validate data type specific constraints
  if (condition.dataType === 'number') {
    const values = Array.isArray(condition.value) ? condition.value : [condition.value];
    for (const val of values) {
      if (val !== '' && val !== null && isNaN(Number(val))) {
        errors.push(`Condition ${condition.id}: Invalid number value '${val}'`);
      }
    }
  }

  if (condition.dataType === 'date') {
    const values = Array.isArray(condition.value) ? condition.value : [condition.value];
    for (const val of values) {
      if (val && isNaN(Date.parse(val))) {
        errors.push(`Condition ${condition.id}: Invalid date value '${val}'`);
      }
    }
  }

  return errors;
}

/**
 * Count total conditions in a filter group (including nested)
 */
export function countConditions(group: FilterGroup): number {
  let count = group.conditions.filter(c => c.enabled).length;

  for (const nestedGroup of group.groups) {
    if (nestedGroup.enabled) {
      count += countConditions(nestedGroup);
    }
  }

  return count;
}

/**
 * Count total groups in a filter (including nested)
 */
export function countGroups(group: FilterGroup): number {
  let count = group.groups.filter(g => g.enabled).length;

  for (const nestedGroup of group.groups) {
    if (nestedGroup.enabled) {
      count += countGroups(nestedGroup);
    }
  }

  return count;
}

/**
 * Get maximum depth of nested groups
 */
export function getMaxDepth(group: FilterGroup, currentDepth: number = 0): number {
  if (group.groups.length === 0) {
    return currentDepth;
  }

  const depths = group.groups.map(g => getMaxDepth(g, currentDepth + 1));
  return Math.max(...depths);
}

/**
 * Clone a filter group (deep copy)
 */
export function cloneFilterGroup(group: FilterGroup): FilterGroup {
  return {
    ...group,
    conditions: group.conditions.map(c => ({ ...c })),
    groups: group.groups.map(g => cloneFilterGroup(g)),
  };
}

/**
 * Find a condition by ID in a filter group (recursive)
 */
export function findCondition(
  group: FilterGroup,
  conditionId: string
): { condition: FilterCondition; groupId: string } | null {
  // Check conditions in this group
  const condition = group.conditions.find(c => c.id === conditionId);
  if (condition) {
    return { condition, groupId: group.id };
  }

  // Check nested groups
  for (const nestedGroup of group.groups) {
    const result = findCondition(nestedGroup, conditionId);
    if (result) return result;
  }

  return null;
}

/**
 * Find a group by ID in a filter group (recursive)
 */
export function findGroup(
  group: FilterGroup,
  groupId: string
): FilterGroup | null {
  if (group.id === groupId) return group;

  for (const nestedGroup of group.groups) {
    const result = findGroup(nestedGroup, groupId);
    if (result) return result;
  }

  return null;
}

/**
 * Remove empty groups (groups with no conditions and no nested groups)
 */
export function removeEmptyGroups(group: FilterGroup): FilterGroup {
  return {
    ...group,
    groups: group.groups
      .filter(g => g.conditions.length > 0 || g.groups.length > 0)
      .map(g => removeEmptyGroups(g)),
  };
}

/**
 * Flatten a filter group into a list of all conditions
 */
export function flattenConditions(group: FilterGroup): FilterCondition[] {
  const conditions: FilterCondition[] = [...group.conditions];

  for (const nestedGroup of group.groups) {
    conditions.push(...flattenConditions(nestedGroup));
  }

  return conditions;
}

/**
 * Convert filter group to a readable string representation
 */
export function filterToString(group: FilterGroup): string {
  if (!group.enabled) return '(disabled)';

  const parts: string[] = [];

  // Add conditions
  for (const condition of group.conditions) {
    if (!condition.enabled) continue;
    parts.push(conditionToString(condition));
  }

  // Add nested groups
  for (const nestedGroup of group.groups) {
    if (!nestedGroup.enabled) continue;
    const nestedStr = filterToString(nestedGroup);
    if (nestedStr) {
      parts.push(`(${nestedStr})`);
    }
  }

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];

  return parts.join(` ${group.operator} `);
}

/**
 * Convert a single condition to a readable string
 */
export function conditionToString(condition: FilterCondition): string {
  let valueStr = '';

  switch (condition.operator) {
    case 'between':
      const [from, to] = Array.isArray(condition.value) ? condition.value : ['', ''];
      valueStr = `${from} and ${to}`;
      break;
    case 'in':
    case 'not_in':
      valueStr = Array.isArray(condition.value)
        ? condition.value.join(', ')
        : String(condition.value);
      break;
    case 'is_null':
    case 'is_not_null':
      valueStr = '';
      break;
    default:
      valueStr = String(condition.value);
  }

  const operatorStr = condition.operator.replace(/_/g, ' ');

  return valueStr
    ? `${condition.field} ${operatorStr} ${valueStr}`
    : `${condition.field} ${operatorStr}`;
}

/**
 * Serialize filter group to JSON string
 */
export function serializeFilter(group: FilterGroup): string {
  return JSON.stringify(group);
}

/**
 * Deserialize filter group from JSON string
 */
export function deserializeFilter(json: string): FilterGroup | null {
  try {
    const parsed = JSON.parse(json);
    const { isValid } = validateFilterGroup(parsed);
    return isValid ? parsed : null;
  } catch (error) {
    console.error('Failed to deserialize filter:', error);
    return null;
  }
}

/**
 * Compress filter group for URL parameters
 */
export function compressFilter(group: FilterGroup): string {
  const json = serializeFilter(group);
  // In a real implementation, you might use LZ-string or similar compression
  return btoa(json);
}

/**
 * Decompress filter group from URL parameters
 */
export function decompressFilter(compressed: string): FilterGroup | null {
  try {
    const json = atob(compressed);
    return deserializeFilter(json);
  } catch (error) {
    console.error('Failed to decompress filter:', error);
    return null;
  }
}

/**
 * Get all unique fields used in a filter group
 */
export function getUsedFields(group: FilterGroup): string[] {
  const fields = new Set<string>();

  for (const condition of group.conditions) {
    if (condition.enabled) {
      fields.add(condition.field);
    }
  }

  for (const nestedGroup of group.groups) {
    if (nestedGroup.enabled) {
      const nestedFields = getUsedFields(nestedGroup);
      nestedFields.forEach(f => fields.add(f));
    }
  }

  return Array.from(fields);
}

/**
 * Check if filter group is empty (no enabled conditions)
 */
export function isFilterEmpty(group: FilterGroup): boolean {
  if (!group.enabled) return true;

  const hasEnabledConditions = group.conditions.some(c => c.enabled);
  if (hasEnabledConditions) return false;

  const hasEnabledGroups = group.groups.some(g => g.enabled && !isFilterEmpty(g));
  return !hasEnabledGroups;
}

/**
 * Simplify filter group by combining redundant conditions
 * (e.g., multiple "equals" on same field with OR operator → convert to "in")
 */
export function simplifyFilter(group: FilterGroup): FilterGroup {
  const simplified = cloneFilterGroup(group);

  // Group conditions by field
  const conditionsByField = new Map<string, FilterCondition[]>();

  for (const condition of simplified.conditions) {
    if (!condition.enabled) continue;

    const existing = conditionsByField.get(condition.field) || [];
    existing.push(condition);
    conditionsByField.set(condition.field, existing);
  }

  // Simplify OR groups with multiple "equals" on same field
  if (group.operator === 'OR') {
    const newConditions: FilterCondition[] = [];

    for (const [field, conditions] of conditionsByField.entries()) {
      const equalsConditions = conditions.filter(c => c.operator === 'equals');

      if (equalsConditions.length > 1) {
        // Convert to "in" operator
        newConditions.push({
          ...equalsConditions[0],
          operator: 'in',
          value: equalsConditions.map(c => c.value),
        });

        // Keep other operators
        const otherConditions = conditions.filter(c => c.operator !== 'equals');
        newConditions.push(...otherConditions);
      } else {
        newConditions.push(...conditions);
      }
    }

    simplified.conditions = newConditions;
  }

  // Recursively simplify nested groups
  simplified.groups = simplified.groups.map(g => simplifyFilter(g));

  return simplified;
}

/**
 * Convert filter to MongoDB query format
 */
export function convertFilterToMongoDB(group: FilterGroup): any {
  if (!group.enabled) return {};

  const conditions = group.conditions
    .filter(c => c.enabled)
    .map(c => convertConditionToMongoDB(c));

  const nestedQueries = group.groups
    .filter(g => g.enabled)
    .map(g => convertFilterToMongoDB(g));

  const allQueries = [...conditions, ...nestedQueries];

  if (allQueries.length === 0) return {};
  if (allQueries.length === 1) return allQueries[0];

  const operator = group.operator === 'AND' ? '$and' : '$or';
  return { [operator]: allQueries };
}

/**
 * Convert a single condition to MongoDB query format
 */
function convertConditionToMongoDB(condition: FilterCondition): any {
  const { field, operator, value } = condition;

  switch (operator) {
    case 'equals':
      return { [field]: value };
    case 'not_equals':
      return { [field]: { $ne: value } };
    case 'contains':
      return { [field]: { $regex: value, $options: 'i' } };
    case 'not_contains':
      return { [field]: { $not: { $regex: value, $options: 'i' } } };
    case 'starts_with':
      return { [field]: { $regex: `^${value}`, $options: 'i' } };
    case 'ends_with':
      return { [field]: { $regex: `${value}$`, $options: 'i' } };
    case 'greater_than':
      return { [field]: { $gt: value } };
    case 'greater_than_or_equal':
      return { [field]: { $gte: value } };
    case 'less_than':
      return { [field]: { $lt: value } };
    case 'less_than_or_equal':
      return { [field]: { $lte: value } };
    case 'between':
      const [from, to] = Array.isArray(value) ? value : [value, value];
      return { [field]: { $gte: from, $lte: to } };
    case 'in':
      return { [field]: { $in: Array.isArray(value) ? value : [value] } };
    case 'not_in':
      return { [field]: { $nin: Array.isArray(value) ? value : [value] } };
    case 'is_null':
      return { [field]: null };
    case 'is_not_null':
      return { [field]: { $ne: null } };
    case 'regex_match':
      return { [field]: { $regex: value } };
    default:
      return {};
  }
}

/**
 * Generate a human-readable summary of the filter
 */
export function getFilterSummary(group: FilterGroup): string {
  const conditionCount = countConditions(group);
  const groupCount = countGroups(group);

  if (conditionCount === 0) {
    return 'No filters applied';
  }

  const parts: string[] = [];

  if (conditionCount > 0) {
    parts.push(`${conditionCount} condition${conditionCount !== 1 ? 's' : ''}`);
  }

  if (groupCount > 0) {
    parts.push(`${groupCount} group${groupCount !== 1 ? 's' : ''}`);
  }

  return parts.join(', ');
}

export default {
  validateFilterGroup,
  validateCondition,
  countConditions,
  countGroups,
  getMaxDepth,
  cloneFilterGroup,
  findCondition,
  findGroup,
  removeEmptyGroups,
  flattenConditions,
  filterToString,
  conditionToString,
  serializeFilter,
  deserializeFilter,
  compressFilter,
  decompressFilter,
  getUsedFields,
  isFilterEmpty,
  simplifyFilter,
  convertFilterToMongoDB,
  getFilterSummary,
};
