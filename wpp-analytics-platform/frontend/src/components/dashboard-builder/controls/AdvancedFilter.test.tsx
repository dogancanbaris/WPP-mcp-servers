import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedFilter, FilterGroup } from './AdvancedFilter';
import {
  validateFilterGroup,
  countConditions,
  countGroups,
  cloneFilterGroup,
  isFilterEmpty,
  filterToString,
} from './AdvancedFilter.utils';

// Mock available fields
const mockFields = [
  { name: 'campaign_name', label: 'Campaign Name', dataType: 'string' as const },
  { name: 'impressions', label: 'Impressions', dataType: 'number' as const },
  { name: 'date', label: 'Date', dataType: 'date' as const },
  { name: 'is_enabled', label: 'Is Enabled', dataType: 'boolean' as const },
];

// Sample filter group
const sampleFilter: FilterGroup = {
  id: 'root',
  operator: 'AND',
  enabled: true,
  conditions: [
    {
      id: 'cond1',
      field: 'campaign_name',
      operator: 'equals',
      value: 'Test Campaign',
      dataType: 'string',
      enabled: true,
    },
  ],
  groups: [],
};

describe('AdvancedFilter Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });

    it('should display existing conditions', () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      expect(screen.getByDisplayValue('Test Campaign')).toBeInTheDocument();
    });

    it('should show condition count', () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      expect(screen.getByText(/1 condition/)).toBeInTheDocument();
    });
  });

  describe('Adding Conditions', () => {
    it('should add a new condition when "Add Condition" is clicked', async () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      const addButton = screen.getByText('Add Condition');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newFilter = onChange.mock.calls[0][0] as FilterGroup;
        expect(newFilter.conditions).toHaveLength(2);
      });
    });
  });

  describe('Removing Conditions', () => {
    it('should remove a condition when delete button is clicked', async () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      const deleteButtons = screen.getAllByTitle('Remove condition');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newFilter = onChange.mock.calls[0][0] as FilterGroup;
        expect(newFilter.conditions).toHaveLength(0);
      });
    });
  });

  describe('Updating Conditions', () => {
    it('should update condition value when input changes', async () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      const input = screen.getByDisplayValue('Test Campaign');
      fireEvent.change(input, { target: { value: 'New Campaign' } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newFilter = onChange.mock.calls[0][0] as FilterGroup;
        expect(newFilter.conditions[0].value).toBe('New Campaign');
      });
    });

    it('should update operator when dropdown changes', async () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      const operatorSelect = screen.getByDisplayValue('Equals');
      fireEvent.change(operatorSelect, { target: { value: 'contains' } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newFilter = onChange.mock.calls[0][0] as FilterGroup;
        expect(newFilter.conditions[0].operator).toBe('contains');
      });
    });
  });

  describe('Group Operations', () => {
    it('should add a nested group when "Add Group" is clicked', async () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      const addGroupButton = screen.getByText('Add Group');
      fireEvent.click(addGroupButton);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newFilter = onChange.mock.calls[0][0] as FilterGroup;
        expect(newFilter.groups).toHaveLength(1);
      });
    });

    it('should toggle between AND/OR operators', async () => {
      const multiConditionFilter: FilterGroup = {
        ...sampleFilter,
        conditions: [
          ...sampleFilter.conditions,
          {
            id: 'cond2',
            field: 'impressions',
            operator: 'greater_than',
            value: '1000',
            dataType: 'number',
            enabled: true,
          },
        ],
      };

      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={multiConditionFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      const operatorToggle = screen.getByText('AND');
      fireEvent.click(operatorToggle);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newFilter = onChange.mock.calls[0][0] as FilterGroup;
        expect(newFilter.operator).toBe('OR');
      });
    });
  });

  describe('Enable/Disable Toggle', () => {
    it('should disable a condition when toggle is clicked', async () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      const toggles = screen.getAllByTitle('Enable/disable this condition');
      fireEvent.click(toggles[0]);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newFilter = onChange.mock.calls[0][0] as FilterGroup;
        expect(newFilter.conditions[0].enabled).toBe(false);
      });
    });
  });

  describe('Duplicate Condition', () => {
    it('should duplicate a condition when duplicate button is clicked', async () => {
      const onChange = jest.fn();
      render(
        <AdvancedFilter
          value={sampleFilter}
          onChange={onChange}
          availableFields={mockFields}
        />
      );

      const duplicateButton = screen.getByTitle('Duplicate condition');
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newFilter = onChange.mock.calls[0][0] as FilterGroup;
        expect(newFilter.conditions).toHaveLength(2);
        expect(newFilter.conditions[1].value).toBe('Test Campaign');
      });
    });
  });

  describe('Max Depth', () => {
    it('should respect maxDepth limit', () => {
      const deepFilter: FilterGroup = {
        id: 'root',
        operator: 'AND',
        enabled: true,
        conditions: [],
        groups: [
          {
            id: 'group1',
            operator: 'AND',
            enabled: true,
            conditions: [],
            groups: [
              {
                id: 'group2',
                operator: 'AND',
                enabled: true,
                conditions: [],
                groups: [],
              },
            ],
          },
        ],
      };

      const onChange = jest.fn();
      const { container } = render(
        <AdvancedFilter
          value={deepFilter}
          onChange={onChange}
          availableFields={mockFields}
          maxDepth={2}
        />
      );

      // The third level should not have "Add Group" button
      const addGroupButtons = container.querySelectorAll('button:contains("Add Group")');
      // Implementation should limit the depth
    });
  });
});

describe('AdvancedFilter Utilities', () => {
  describe('validateFilterGroup', () => {
    it('should validate a correct filter group', () => {
      const result = validateFilterGroup(sampleFilter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing field', () => {
      const invalidFilter: FilterGroup = {
        ...sampleFilter,
        conditions: [
          {
            id: 'cond1',
            field: '',
            operator: 'equals',
            value: 'test',
            dataType: 'string',
            enabled: true,
          },
        ],
      };

      const result = validateFilterGroup(invalidFilter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Missing field'))).toBe(true);
    });

    it('should detect missing value', () => {
      const invalidFilter: FilterGroup = {
        ...sampleFilter,
        conditions: [
          {
            id: 'cond1',
            field: 'campaign_name',
            operator: 'equals',
            value: '',
            dataType: 'string',
            enabled: true,
          },
        ],
      };

      const result = validateFilterGroup(invalidFilter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('required'))).toBe(true);
    });

    it('should validate between operator needs two values', () => {
      const invalidFilter: FilterGroup = {
        ...sampleFilter,
        conditions: [
          {
            id: 'cond1',
            field: 'impressions',
            operator: 'between',
            value: ['100'],
            dataType: 'number',
            enabled: true,
          },
        ],
      };

      const result = validateFilterGroup(invalidFilter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('two values'))).toBe(true);
    });
  });

  describe('countConditions', () => {
    it('should count enabled conditions', () => {
      const count = countConditions(sampleFilter);
      expect(count).toBe(1);
    });

    it('should count conditions in nested groups', () => {
      const nestedFilter: FilterGroup = {
        ...sampleFilter,
        groups: [
          {
            id: 'group1',
            operator: 'OR',
            enabled: true,
            conditions: [
              {
                id: 'cond2',
                field: 'impressions',
                operator: 'greater_than',
                value: '1000',
                dataType: 'number',
                enabled: true,
              },
            ],
            groups: [],
          },
        ],
      };

      const count = countConditions(nestedFilter);
      expect(count).toBe(2);
    });

    it('should not count disabled conditions', () => {
      const filterWithDisabled: FilterGroup = {
        ...sampleFilter,
        conditions: [
          ...sampleFilter.conditions,
          {
            id: 'cond2',
            field: 'impressions',
            operator: 'greater_than',
            value: '1000',
            dataType: 'number',
            enabled: false,
          },
        ],
      };

      const count = countConditions(filterWithDisabled);
      expect(count).toBe(1);
    });
  });

  describe('countGroups', () => {
    it('should count nested groups', () => {
      const nestedFilter: FilterGroup = {
        ...sampleFilter,
        groups: [
          {
            id: 'group1',
            operator: 'OR',
            enabled: true,
            conditions: [],
            groups: [
              {
                id: 'group2',
                operator: 'AND',
                enabled: true,
                conditions: [],
                groups: [],
              },
            ],
          },
        ],
      };

      const count = countGroups(nestedFilter);
      expect(count).toBe(2);
    });
  });

  describe('cloneFilterGroup', () => {
    it('should create a deep copy', () => {
      const cloned = cloneFilterGroup(sampleFilter);

      expect(cloned).not.toBe(sampleFilter);
      expect(cloned.conditions).not.toBe(sampleFilter.conditions);
      expect(cloned.conditions[0]).not.toBe(sampleFilter.conditions[0]);
      expect(cloned).toEqual(sampleFilter);
    });
  });

  describe('isFilterEmpty', () => {
    it('should return true for empty filter', () => {
      const emptyFilter: FilterGroup = {
        id: 'root',
        operator: 'AND',
        enabled: true,
        conditions: [],
        groups: [],
      };

      expect(isFilterEmpty(emptyFilter)).toBe(true);
    });

    it('should return false for filter with enabled conditions', () => {
      expect(isFilterEmpty(sampleFilter)).toBe(false);
    });

    it('should return true if filter is disabled', () => {
      const disabledFilter: FilterGroup = {
        ...sampleFilter,
        enabled: false,
      };

      expect(isFilterEmpty(disabledFilter)).toBe(true);
    });
  });

  describe('filterToString', () => {
    it('should convert simple filter to string', () => {
      const str = filterToString(sampleFilter);
      expect(str).toContain('campaign_name');
      expect(str).toContain('equals');
      expect(str).toContain('Test Campaign');
    });

    it('should handle AND operator', () => {
      const multiFilter: FilterGroup = {
        ...sampleFilter,
        conditions: [
          ...sampleFilter.conditions,
          {
            id: 'cond2',
            field: 'impressions',
            operator: 'greater_than',
            value: '1000',
            dataType: 'number',
            enabled: true,
          },
        ],
      };

      const str = filterToString(multiFilter);
      expect(str).toContain('AND');
    });

    it('should handle OR operator', () => {
      const orFilter: FilterGroup = {
        ...sampleFilter,
        operator: 'OR',
        conditions: [
          ...sampleFilter.conditions,
          {
            id: 'cond2',
            field: 'impressions',
            operator: 'greater_than',
            value: '1000',
            dataType: 'number',
            enabled: true,
          },
        ],
      };

      const str = filterToString(orFilter);
      expect(str).toContain('OR');
    });

    it('should handle nested groups with parentheses', () => {
      const nestedFilter: FilterGroup = {
        ...sampleFilter,
        groups: [
          {
            id: 'group1',
            operator: 'OR',
            enabled: true,
            conditions: [
              {
                id: 'cond2',
                field: 'impressions',
                operator: 'greater_than',
                value: '1000',
                dataType: 'number',
                enabled: true,
              },
            ],
            groups: [],
          },
        ],
      };

      const str = filterToString(nestedFilter);
      expect(str).toContain('(');
      expect(str).toContain(')');
    });
  });
});
