import React, { useState, useMemo, useCallback } from 'react';
import { Check, Search, X } from 'lucide-react';

export interface ListFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface ListFilterProps {
  /** Unique identifier for the filter */
  id: string;
  /** Display title for the filter */
  title: string;
  /** Available options to filter */
  options: ListFilterOption[];
  /** Currently selected values */
  selectedValues: string[];
  /** Callback when selection changes */
  onSelectionChange: (values: string[]) => void;
  /** Height of the scrollable list in pixels */
  height?: number;
  /** Maximum number of items to show before scrolling */
  maxVisibleItems?: number;
  /** Enable search/filter functionality */
  searchable?: boolean;
  /** Show item counts */
  showCounts?: boolean;
  /** Allow select all / deselect all */
  showSelectAll?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom placeholder for search */
  searchPlaceholder?: string;
  /** Custom empty state message */
  emptyMessage?: string;
}

/**
 * ListFilter Component
 *
 * Fixed-size scrollable list with multi-select checkboxes.
 * Applies global filters to dashboard data.
 *
 * Features:
 * - Multi-select with checkboxes
 * - Fixed-height scrollable container
 * - Optional search/filter
 * - Select all/deselect all
 * - Item counts display
 * - Loading and disabled states
 * - Keyboard navigation
 *
 * @example
 * ```tsx
 * <ListFilter
 *   id="campaign-filter"
 *   title="Campaigns"
 *   options={campaigns}
 *   selectedValues={selectedCampaigns}
 *   onSelectionChange={setSelectedCampaigns}
 *   searchable
 *   showCounts
 *   showSelectAll
 * />
 * ```
 */
export const ListFilter: React.FC<ListFilterProps> = ({
  id,
  title,
  options,
  selectedValues,
  onSelectionChange,
  height = 300,
  maxVisibleItems = 10,
  searchable = false,
  showCounts = false,
  showSelectAll = false,
  isLoading = false,
  disabled = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options available',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }

    const query = searchQuery.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Calculate selection state
  const isAllSelected = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every((option) =>
      selectedValues.includes(option.value)
    );
  }, [filteredOptions, selectedValues]);

  const isIndeterminate = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    const selectedCount = filteredOptions.filter((option) =>
      selectedValues.includes(option.value)
    ).length;
    return selectedCount > 0 && selectedCount < filteredOptions.length;
  }, [filteredOptions, selectedValues]);

  // Handle individual checkbox toggle
  const handleToggle = useCallback(
    (value: string) => {
      if (disabled) return;

      const newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];

      onSelectionChange(newValues);
    },
    [selectedValues, onSelectionChange, disabled]
  );

  // Handle select all / deselect all
  const handleSelectAll = useCallback(() => {
    if (disabled) return;

    if (isAllSelected) {
      // Deselect all filtered options
      const filteredValues = new Set(filteredOptions.map((o) => o.value));
      const newValues = selectedValues.filter((v) => !filteredValues.has(v));
      onSelectionChange(newValues);
    } else {
      // Select all filtered options
      const filteredValues = filteredOptions.map((o) => o.value);
      const newValues = Array.from(
        new Set([...selectedValues, ...filteredValues])
      );
      onSelectionChange(newValues);
    }
  }, [
    filteredOptions,
    selectedValues,
    onSelectionChange,
    isAllSelected,
    disabled,
  ]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Calculate dynamic height based on items
  const calculatedHeight = useMemo(() => {
    const itemHeight = 40; // px per item
    const maxHeight = maxVisibleItems * itemHeight;
    const contentHeight = filteredOptions.length * itemHeight;
    return Math.min(height, maxHeight, contentHeight);
  }, [height, maxVisibleItems, filteredOptions.length]);

  return (
    <div
      className="list-filter"
      data-filter-id={id}
      aria-label={`${title} filter`}
      role="group"
    >
      {/* Header */}
      <div className="list-filter__header">
        <h3 className="list-filter__title">{title}</h3>
        {selectedValues.length > 0 && (
          <span className="list-filter__count">
            {selectedValues.length} selected
          </span>
        )}
      </div>

      {/* Search */}
      {searchable && (
        <div className="list-filter__search">
          <Search className="list-filter__search-icon" size={16} />
          <input
            type="text"
            className="list-filter__search-input"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled || isLoading}
            aria-label={`Search ${title}`}
          />
          {searchQuery && (
            <button
              className="list-filter__search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Select All */}
      {showSelectAll && filteredOptions.length > 0 && (
        <div className="list-filter__select-all">
          <label className="list-filter__option">
            <input
              type="checkbox"
              className="list-filter__checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isIndeterminate;
                }
              }}
              onChange={handleSelectAll}
              disabled={disabled || isLoading}
              aria-label="Select all"
            />
            <span className="list-filter__checkbox-custom">
              {isAllSelected && <Check size={14} />}
              {isIndeterminate && (
                <span className="list-filter__checkbox-indeterminate" />
              )}
            </span>
            <span className="list-filter__label">
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </span>
          </label>
        </div>
      )}

      {/* Options List */}
      <div
        className="list-filter__list"
        style={{ height: `${calculatedHeight}px` }}
        role="listbox"
        aria-multiselectable="true"
        aria-label={`${title} options`}
      >
        {isLoading ? (
          <div className="list-filter__loading">
            <div className="list-filter__spinner" />
            <p>Loading options...</p>
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="list-filter__empty">
            <p>{searchQuery ? `No results for "${searchQuery}"` : emptyMessage}</p>
          </div>
        ) : (
          <div className="list-filter__options">
            {filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`list-filter__option ${
                    isSelected ? 'list-filter__option--selected' : ''
                  } ${disabled ? 'list-filter__option--disabled' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <input
                    type="checkbox"
                    className="list-filter__checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(option.value)}
                    disabled={disabled || isLoading}
                    aria-label={option.label}
                  />
                  <span className="list-filter__checkbox-custom">
                    {isSelected && <Check size={14} />}
                  </span>
                  <span className="list-filter__label" title={option.label}>
                    {option.label}
                  </span>
                  {showCounts && option.count !== undefined && (
                    <span className="list-filter__item-count">
                      ({option.count.toLocaleString()})
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {filteredOptions.length > 0 && (
        <div className="list-filter__footer">
          <span className="list-filter__info">
            {filteredOptions.length} {filteredOptions.length === 1 ? 'option' : 'options'}
            {searchQuery && ` (filtered)`}
          </span>
        </div>
      )}

      <style jsx>{`
        .list-filter {
          display: flex;
          flex-direction: column;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .list-filter__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
          background: var(--color-surface-secondary, #f9fafb);
        }

        .list-filter__title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary, #111827);
        }

        .list-filter__count {
          font-size: 12px;
          color: var(--color-text-secondary, #6b7280);
          background: var(--color-primary-light, #dbeafe);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .list-filter__search {
          position: relative;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
        }

        .list-filter__search-icon {
          position: absolute;
          left: 28px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary, #9ca3af);
          pointer-events: none;
        }

        .list-filter__search-input {
          width: 100%;
          padding: 8px 32px 8px 36px;
          border: 1px solid var(--color-border, #d1d5db);
          border-radius: 6px;
          font-size: 14px;
          background: var(--color-surface, #ffffff);
          color: var(--color-text-primary, #111827);
          transition: border-color 0.2s;
        }

        .list-filter__search-input:focus {
          outline: none;
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .list-filter__search-input:disabled {
          background: var(--color-surface-disabled, #f3f4f6);
          cursor: not-allowed;
        }

        .list-filter__search-clear {
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          border: none;
          background: none;
          color: var(--color-text-tertiary, #9ca3af);
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .list-filter__search-clear:hover {
          background: var(--color-surface-hover, #f3f4f6);
          color: var(--color-text-secondary, #6b7280);
        }

        .list-filter__select-all {
          padding: 8px 16px;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
          background: var(--color-surface-secondary, #f9fafb);
        }

        .list-filter__list {
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        .list-filter__list::-webkit-scrollbar {
          width: 8px;
        }

        .list-filter__list::-webkit-scrollbar-track {
          background: var(--color-surface-secondary, #f9fafb);
        }

        .list-filter__list::-webkit-scrollbar-thumb {
          background: var(--color-border, #d1d5db);
          border-radius: 4px;
        }

        .list-filter__list::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-tertiary, #9ca3af);
        }

        .list-filter__options {
          padding: 4px 0;
        }

        .list-filter__option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          cursor: pointer;
          transition: background-color 0.15s;
          user-select: none;
        }

        .list-filter__option:hover {
          background: var(--color-surface-hover, #f3f4f6);
        }

        .list-filter__option--selected {
          background: var(--color-primary-light, #eff6ff);
        }

        .list-filter__option--selected:hover {
          background: var(--color-primary-light-hover, #dbeafe);
        }

        .list-filter__option--disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .list-filter__checkbox {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .list-filter__checkbox-custom {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border: 2px solid var(--color-border, #d1d5db);
          border-radius: 4px;
          background: var(--color-surface, #ffffff);
          color: var(--color-surface, #ffffff);
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .list-filter__checkbox:checked + .list-filter__checkbox-custom {
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
        }

        .list-filter__checkbox:focus + .list-filter__checkbox-custom {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .list-filter__checkbox-indeterminate {
          width: 10px;
          height: 2px;
          background: var(--color-surface, #ffffff);
          border-radius: 1px;
        }

        .list-filter__checkbox:indeterminate + .list-filter__checkbox-custom {
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
        }

        .list-filter__label {
          flex: 1;
          font-size: 14px;
          color: var(--color-text-primary, #374151);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .list-filter__item-count {
          font-size: 12px;
          color: var(--color-text-tertiary, #9ca3af);
          flex-shrink: 0;
        }

        .list-filter__loading,
        .list-filter__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 32px 16px;
          color: var(--color-text-secondary, #6b7280);
          font-size: 14px;
        }

        .list-filter__spinner {
          width: 24px;
          height: 24px;
          border: 3px solid var(--color-border, #e5e7eb);
          border-top-color: var(--color-primary, #3b82f6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .list-filter__footer {
          padding: 8px 16px;
          border-top: 1px solid var(--color-border, #e5e7eb);
          background: var(--color-surface-secondary, #f9fafb);
        }

        .list-filter__info {
          font-size: 12px;
          color: var(--color-text-tertiary, #9ca3af);
        }
      `}</style>
    </div>
  );
};

export default ListFilter;
