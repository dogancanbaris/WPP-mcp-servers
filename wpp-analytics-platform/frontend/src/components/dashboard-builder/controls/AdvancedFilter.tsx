import React, { useState, useCallback } from 'react';
import {
  Plus,
  X,
  GripVertical,
  ChevronDown,
  Filter,
  Trash2,
  Copy,
} from 'lucide-react';

// Types
export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'regex_match';

export type FilterDataType = 'string' | 'number' | 'date' | 'boolean';

export type LogicalOperator = 'AND' | 'OR';

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  dataType: FilterDataType;
  enabled: boolean;
}

export interface FilterGroup {
  id: string;
  operator: LogicalOperator;
  conditions: FilterCondition[];
  groups: FilterGroup[];
  enabled: boolean;
}

export interface AdvancedFilterProps {
  value: FilterGroup;
  onChange: (value: FilterGroup) => void;
  availableFields: Array<{
    name: string;
    label: string;
    dataType: FilterDataType;
    values?: any[]; // Optional predefined values for dropdown
  }>;
  className?: string;
  maxDepth?: number;
}

// Operator definitions by data type
const OPERATORS_BY_TYPE: Record<FilterDataType, FilterOperator[]> = {
  string: [
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'in',
    'not_in',
    'is_null',
    'is_not_null',
    'regex_match',
  ],
  number: [
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
    'between',
    'in',
    'not_in',
    'is_null',
    'is_not_null',
  ],
  date: [
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
    'between',
    'is_null',
    'is_not_null',
  ],
  boolean: ['equals', 'not_equals', 'is_null', 'is_not_null'],
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  not_equals: 'Does not equal',
  contains: 'Contains',
  not_contains: 'Does not contain',
  starts_with: 'Starts with',
  ends_with: 'Ends with',
  greater_than: 'Greater than',
  greater_than_or_equal: 'Greater than or equal',
  less_than: 'Less than',
  less_than_or_equal: 'Less than or equal',
  between: 'Between',
  in: 'In',
  not_in: 'Not in',
  is_null: 'Is null',
  is_not_null: 'Is not null',
  regex_match: 'Regex match',
};

// Helper to check if operator needs value input
const operatorNeedsValue = (operator: FilterOperator): boolean => {
  return !['is_null', 'is_not_null'].includes(operator);
};

// Helper to check if operator needs two values (e.g., between)
const operatorNeedsTwoValues = (operator: FilterOperator): boolean => {
  return operator === 'between';
};

// Helper to check if operator needs array input (e.g., in, not_in)
const operatorNeedsArrayValue = (operator: FilterOperator): boolean => {
  return ['in', 'not_in'].includes(operator);
};

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create default condition
const createDefaultCondition = (
  availableFields: AdvancedFilterProps['availableFields']
): FilterCondition => {
  const firstField = availableFields[0];
  return {
    id: generateId(),
    field: firstField?.name || '',
    operator: 'equals',
    value: '',
    dataType: firstField?.dataType || 'string',
    enabled: true,
  };
};

// Create default group
const createDefaultGroup = (
  operator: LogicalOperator = 'AND',
  availableFields: AdvancedFilterProps['availableFields']
): FilterGroup => ({
  id: generateId(),
  operator,
  conditions: [createDefaultCondition(availableFields)],
  groups: [],
  enabled: true,
});

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  value,
  onChange,
  availableFields,
  className = '',
  maxDepth = 3,
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Update group
  const updateGroup = useCallback(
    (groupId: string, updates: Partial<FilterGroup>, parentGroup?: FilterGroup) => {
      const updateRecursive = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return { ...group, ...updates };
        }
        return {
          ...group,
          groups: group.groups.map(updateRecursive),
        };
      };

      onChange(updateRecursive(parentGroup || value));
    },
    [value, onChange]
  );

  // Add condition to group
  const addCondition = useCallback(
    (groupId: string) => {
      const addToGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: [...group.conditions, createDefaultCondition(availableFields)],
          };
        }
        return {
          ...group,
          groups: group.groups.map(addToGroup),
        };
      };

      onChange(addToGroup(value));
    },
    [value, onChange, availableFields]
  );

  // Remove condition from group
  const removeCondition = useCallback(
    (groupId: string, conditionId: string) => {
      const removeFromGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.filter((c) => c.id !== conditionId),
          };
        }
        return {
          ...group,
          groups: group.groups.map(removeFromGroup),
        };
      };

      onChange(removeFromGroup(value));
    },
    [value, onChange]
  );

  // Update condition
  const updateCondition = useCallback(
    (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => {
      const updateInGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.map((c) =>
              c.id === conditionId ? { ...c, ...updates } : c
            ),
          };
        }
        return {
          ...group,
          groups: group.groups.map(updateInGroup),
        };
      };

      onChange(updateInGroup(value));
    },
    [value, onChange]
  );

  // Duplicate condition
  const duplicateCondition = useCallback(
    (groupId: string, condition: FilterCondition) => {
      const duplicateInGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          const newCondition = { ...condition, id: generateId() };
          const index = group.conditions.findIndex((c) => c.id === condition.id);
          const newConditions = [...group.conditions];
          newConditions.splice(index + 1, 0, newCondition);
          return { ...group, conditions: newConditions };
        }
        return {
          ...group,
          groups: group.groups.map(duplicateInGroup),
        };
      };

      onChange(duplicateInGroup(value));
    },
    [value, onChange]
  );

  // Add nested group
  const addGroup = useCallback(
    (parentGroupId: string, depth: number) => {
      if (depth >= maxDepth) return;

      const addToGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === parentGroupId) {
          return {
            ...group,
            groups: [...group.groups, createDefaultGroup('AND', availableFields)],
          };
        }
        return {
          ...group,
          groups: group.groups.map(addToGroup),
        };
      };

      onChange(addToGroup(value));
    },
    [value, onChange, availableFields, maxDepth]
  );

  // Remove group
  const removeGroup = useCallback(
    (parentGroupId: string, groupId: string) => {
      const removeFromGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === parentGroupId) {
          return {
            ...group,
            groups: group.groups.filter((g) => g.id !== groupId),
          };
        }
        return {
          ...group,
          groups: group.groups.map(removeFromGroup),
        };
      };

      onChange(removeFromGroup(value));
    },
    [value, onChange]
  );

  // Toggle group operator (AND/OR)
  const toggleGroupOperator = useCallback(
    (groupId: string) => {
      const toggleInGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            operator: group.operator === 'AND' ? 'OR' : 'AND',
          };
        }
        return {
          ...group,
          groups: group.groups.map(toggleInGroup),
        };
      };

      onChange(toggleInGroup(value));
    },
    [value, onChange]
  );

  return (
    <div className={`advanced-filter ${className}`}>
      <div className="advanced-filter-header">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="text-sm font-semibold">Advanced Filters</h3>
        </div>
      </div>

      <FilterGroupComponent
        group={value}
        depth={0}
        maxDepth={maxDepth}
        availableFields={availableFields}
        onUpdateGroup={updateGroup}
        onAddCondition={addCondition}
        onRemoveCondition={removeCondition}
        onUpdateCondition={updateCondition}
        onDuplicateCondition={duplicateCondition}
        onAddGroup={addGroup}
        onRemoveGroup={removeGroup}
        onToggleOperator={toggleGroupOperator}
        draggedItem={draggedItem}
        setDraggedItem={setDraggedItem}
        isRoot={true}
      />
    </div>
  );
};

// FilterGroup Component
interface FilterGroupComponentProps {
  group: FilterGroup;
  depth: number;
  maxDepth: number;
  availableFields: AdvancedFilterProps['availableFields'];
  onUpdateGroup: (groupId: string, updates: Partial<FilterGroup>) => void;
  onAddCondition: (groupId: string) => void;
  onRemoveCondition: (groupId: string, conditionId: string) => void;
  onUpdateCondition: (
    groupId: string,
    conditionId: string,
    updates: Partial<FilterCondition>
  ) => void;
  onDuplicateCondition: (groupId: string, condition: FilterCondition) => void;
  onAddGroup: (groupId: string, depth: number) => void;
  onRemoveGroup: (parentGroupId: string, groupId: string) => void;
  onToggleOperator: (groupId: string) => void;
  draggedItem: string | null;
  setDraggedItem: (id: string | null) => void;
  isRoot?: boolean;
  parentGroupId?: string;
}

const FilterGroupComponent: React.FC<FilterGroupComponentProps> = ({
  group,
  depth,
  maxDepth,
  availableFields,
  onUpdateGroup,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
  onDuplicateCondition,
  onAddGroup,
  onRemoveGroup,
  onToggleOperator,
  draggedItem,
  setDraggedItem,
  isRoot = false,
  parentGroupId,
}) => {
  const hasMultipleItems = group.conditions.length + group.groups.length > 1;

  return (
    <div
      className={`filter-group depth-${depth} ${!group.enabled ? 'disabled' : ''}`}
      style={{ marginLeft: depth > 0 ? '24px' : '0' }}
    >
      {/* Group Header */}
      <div className="filter-group-header">
        <div className="flex items-center gap-2 flex-1">
          {!isRoot && (
            <button
              className="drag-handle"
              draggable
              onDragStart={() => setDraggedItem(group.id)}
              onDragEnd={() => setDraggedItem(null)}
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}

          {/* Operator Toggle */}
          {hasMultipleItems && (
            <button
              className={`operator-toggle ${group.operator.toLowerCase()}`}
              onClick={() => onToggleOperator(group.id)}
              title="Click to toggle between AND/OR"
            >
              {group.operator}
            </button>
          )}

          {/* Group Label */}
          <span className="text-xs text-gray-500">
            {group.conditions.length} condition{group.conditions.length !== 1 ? 's' : ''}
            {group.groups.length > 0 &&
              `, ${group.groups.length} group${group.groups.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Enable/Disable Toggle */}
          <label className="toggle-switch" title="Enable/disable this group">
            <input
              type="checkbox"
              checked={group.enabled}
              onChange={(e) => onUpdateGroup(group.id, { enabled: e.target.checked })}
            />
            <span className="toggle-slider"></span>
          </label>

          {/* Remove Group */}
          {!isRoot && parentGroupId && (
            <button
              className="icon-button danger"
              onClick={() => onRemoveGroup(parentGroupId, group.id)}
              title="Remove group"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="filter-conditions">
        {group.conditions.map((condition, index) => (
          <React.Fragment key={condition.id}>
            {index > 0 && hasMultipleItems && (
              <div className="operator-divider">
                <span className={`operator-badge ${group.operator.toLowerCase()}`}>
                  {group.operator}
                </span>
              </div>
            )}
            <FilterConditionComponent
              condition={condition}
              groupId={group.id}
              availableFields={availableFields}
              onUpdate={onUpdateCondition}
              onRemove={onRemoveCondition}
              onDuplicate={onDuplicateCondition}
              draggedItem={draggedItem}
              setDraggedItem={setDraggedItem}
            />
          </React.Fragment>
        ))}

        {/* Nested Groups */}
        {group.groups.map((nestedGroup, index) => (
          <React.Fragment key={nestedGroup.id}>
            {(group.conditions.length > 0 || index > 0) && hasMultipleItems && (
              <div className="operator-divider">
                <span className={`operator-badge ${group.operator.toLowerCase()}`}>
                  {group.operator}
                </span>
              </div>
            )}
            <FilterGroupComponent
              group={nestedGroup}
              depth={depth + 1}
              maxDepth={maxDepth}
              availableFields={availableFields}
              onUpdateGroup={onUpdateGroup}
              onAddCondition={onAddCondition}
              onRemoveCondition={onRemoveCondition}
              onUpdateCondition={onUpdateCondition}
              onDuplicateCondition={onDuplicateCondition}
              onAddGroup={onAddGroup}
              onRemoveGroup={onRemoveGroup}
              onToggleOperator={onToggleOperator}
              draggedItem={draggedItem}
              setDraggedItem={setDraggedItem}
              parentGroupId={group.id}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="filter-group-actions">
        <button
          className="action-button primary"
          onClick={() => onAddCondition(group.id)}
        >
          <Plus className="w-4 h-4" />
          Add Condition
        </button>

        {depth < maxDepth - 1 && (
          <button
            className="action-button secondary"
            onClick={() => onAddGroup(group.id, depth)}
          >
            <Plus className="w-4 h-4" />
            Add Group
          </button>
        )}
      </div>
    </div>
  );
};

// FilterCondition Component
interface FilterConditionComponentProps {
  condition: FilterCondition;
  groupId: string;
  availableFields: AdvancedFilterProps['availableFields'];
  onUpdate: (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => void;
  onRemove: (groupId: string, conditionId: string) => void;
  onDuplicate: (groupId: string, condition: FilterCondition) => void;
  draggedItem: string | null;
  setDraggedItem: (id: string | null) => void;
}

const FilterConditionComponent: React.FC<FilterConditionComponentProps> = ({
  condition,
  groupId,
  availableFields,
  onUpdate,
  onRemove,
  onDuplicate,
  draggedItem,
  setDraggedItem,
}) => {
  const selectedField = availableFields.find((f) => f.name === condition.field);
  const availableOperators = OPERATORS_BY_TYPE[condition.dataType] || [];
  const needsValue = operatorNeedsValue(condition.operator);
  const needsTwoValues = operatorNeedsTwoValues(condition.operator);
  const needsArrayValue = operatorNeedsArrayValue(condition.operator);

  // Handle field change
  const handleFieldChange = (fieldName: string) => {
    const field = availableFields.find((f) => f.name === fieldName);
    if (field) {
      const newOperators = OPERATORS_BY_TYPE[field.dataType];
      const newOperator = newOperators.includes(condition.operator)
        ? condition.operator
        : newOperators[0];

      onUpdate(groupId, condition.id, {
        field: fieldName,
        dataType: field.dataType,
        operator: newOperator,
        value: '',
      });
    }
  };

  // Handle operator change
  const handleOperatorChange = (operator: FilterOperator) => {
    const updates: Partial<FilterCondition> = { operator };

    // Reset value if operator doesn't need it
    if (!operatorNeedsValue(operator)) {
      updates.value = null;
    } else if (operatorNeedsTwoValues(operator)) {
      updates.value = Array.isArray(condition.value) ? condition.value : ['', ''];
    } else if (operatorNeedsArrayValue(operator)) {
      updates.value = Array.isArray(condition.value) ? condition.value : [];
    } else if (Array.isArray(condition.value)) {
      updates.value = '';
    }

    onUpdate(groupId, condition.id, updates);
  };

  // Render value input
  const renderValueInput = () => {
    if (!needsValue) return null;

    if (needsTwoValues) {
      const values = Array.isArray(condition.value) ? condition.value : ['', ''];
      return (
        <div className="flex items-center gap-2">
          <input
            type={condition.dataType === 'number' ? 'number' : condition.dataType === 'date' ? 'date' : 'text'}
            value={values[0] || ''}
            onChange={(e) =>
              onUpdate(groupId, condition.id, {
                value: [e.target.value, values[1]],
              })
            }
            placeholder="From"
            className="value-input flex-1"
          />
          <span className="text-xs text-gray-500">and</span>
          <input
            type={condition.dataType === 'number' ? 'number' : condition.dataType === 'date' ? 'date' : 'text'}
            value={values[1] || ''}
            onChange={(e) =>
              onUpdate(groupId, condition.id, {
                value: [values[0], e.target.value],
              })
            }
            placeholder="To"
            className="value-input flex-1"
          />
        </div>
      );
    }

    if (needsArrayValue) {
      const values = Array.isArray(condition.value) ? condition.value : [];
      return (
        <div className="array-value-input">
          <input
            type="text"
            value={values.join(', ')}
            onChange={(e) =>
              onUpdate(groupId, condition.id, {
                value: e.target.value.split(',').map((v) => v.trim()),
              })
            }
            placeholder="Enter comma-separated values"
            className="value-input"
          />
        </div>
      );
    }

    if (condition.dataType === 'boolean') {
      return (
        <select
          value={String(condition.value)}
          onChange={(e) =>
            onUpdate(groupId, condition.id, { value: e.target.value === 'true' })
          }
          className="value-input"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    if (selectedField?.values) {
      return (
        <select
          value={condition.value}
          onChange={(e) => onUpdate(groupId, condition.id, { value: e.target.value })}
          className="value-input"
        >
          <option value="">Select value...</option>
          {selectedField.values.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={condition.dataType === 'number' ? 'number' : condition.dataType === 'date' ? 'date' : 'text'}
        value={condition.value || ''}
        onChange={(e) => onUpdate(groupId, condition.id, { value: e.target.value })}
        placeholder="Enter value..."
        className="value-input"
      />
    );
  };

  return (
    <div
      className={`filter-condition ${!condition.enabled ? 'disabled' : ''} ${
        draggedItem === condition.id ? 'dragging' : ''
      }`}
    >
      <div className="filter-condition-content">
        {/* Drag Handle */}
        <button
          className="drag-handle"
          draggable
          onDragStart={() => setDraggedItem(condition.id)}
          onDragEnd={() => setDraggedItem(null)}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Field Selector */}
        <select
          value={condition.field}
          onChange={(e) => handleFieldChange(e.target.value)}
          className="field-select"
        >
          {availableFields.map((field) => (
            <option key={field.name} value={field.name}>
              {field.label}
            </option>
          ))}
        </select>

        {/* Operator Selector */}
        <select
          value={condition.operator}
          onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
          className="operator-select"
        >
          {availableOperators.map((op) => (
            <option key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </option>
          ))}
        </select>

        {/* Value Input */}
        {renderValueInput()}

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Enable/Disable */}
          <label className="toggle-switch" title="Enable/disable this condition">
            <input
              type="checkbox"
              checked={condition.enabled}
              onChange={(e) =>
                onUpdate(groupId, condition.id, { enabled: e.target.checked })
              }
            />
            <span className="toggle-slider"></span>
          </label>

          {/* Duplicate */}
          <button
            className="icon-button"
            onClick={() => onDuplicate(groupId, condition)}
            title="Duplicate condition"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Remove */}
          <button
            className="icon-button danger"
            onClick={() => onRemove(groupId, condition.id)}
            title="Remove condition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilter;
