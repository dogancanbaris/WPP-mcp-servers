import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';

export type InputBoxOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith';

export interface InputBoxFilterProps {
  /**
   * Field name to filter on
   */
  field: string;

  /**
   * Current filter value
   */
  value?: string;

  /**
   * Current operator
   */
  operator?: InputBoxOperator;

  /**
   * Callback when filter changes
   */
  onChange: (value: string, operator: InputBoxOperator) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;

  /**
   * Whether to show operator selector
   * @default true
   */
  showOperator?: boolean;

  /**
   * Available operators
   * @default ['contains', 'equals', 'startsWith', 'endsWith']
   */
  operators?: InputBoxOperator[];

  /**
   * Label for the filter
   */
  label?: string;

  /**
   * Whether the filter is disabled
   */
  disabled?: boolean;

  /**
   * Custom CSS class
   */
  className?: string;

  /**
   * Whether to show clear button
   * @default true
   */
  showClear?: boolean;

  /**
   * Minimum characters before triggering search
   * @default 0
   */
  minChars?: number;

  /**
   * Callback when input is cleared
   */
  onClear?: () => void;
}

const operatorLabels: Record<InputBoxOperator, string> = {
  contains: 'Contains',
  equals: 'Equals',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
};

const operatorIcons: Record<InputBoxOperator, string> = {
  contains: '⊃',
  equals: '=',
  startsWith: '⊢',
  endsWith: '⊣',
};

/**
 * InputBoxFilter - Text search filter with operators and debounced search
 *
 * Features:
 * - Multiple search operators (contains, equals, starts with, ends with)
 * - Debounced input to avoid excessive API calls
 * - Clear button for easy reset
 * - Accessible keyboard navigation
 * - Minimum character threshold
 *
 * @example
 * ```tsx
 * <InputBoxFilter
 *   field="campaign_name"
 *   value={searchTerm}
 *   operator="contains"
 *   onChange={(value, operator) => {
 *     setSearchTerm(value);
 *     setOperator(operator);
 *   }}
 *   placeholder="Search campaigns..."
 *   debounceMs={500}
 * />
 * ```
 */
export const InputBoxFilter: React.FC<InputBoxFilterProps> = ({
  field,
  value = '',
  operator = 'contains',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  showOperator = true,
  operators = ['contains', 'equals', 'startsWith', 'endsWith'],
  label,
  disabled = false,
  className = '',
  showClear = true,
  minChars = 0,
  onClear,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [currentOperator, setCurrentOperator] = useState<InputBoxOperator>(operator);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Sync external operator changes
  useEffect(() => {
    setCurrentOperator(operator);
  }, [operator]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't trigger if below minimum characters
    if (inputValue.length > 0 && inputValue.length < minChars) {
      return;
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onChange(inputValue, currentOperator);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, currentOperator, onChange, debounceMs, minChars]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('', currentOperator);
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  }, [onChange, currentOperator, onClear]);

  const handleOperatorChange = useCallback((newOperator: InputBoxOperator) => {
    setCurrentOperator(newOperator);
    setIsDropdownOpen(false);
    onChange(inputValue, newOperator);
    inputRef.current?.focus();
  }, [inputValue, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (inputValue) {
        handleClear();
      } else {
        inputRef.current?.blur();
      }
    } else if (e.key === 'Enter') {
      // Force immediate search on Enter
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onChange(inputValue, currentOperator);
    }
  }, [inputValue, currentOperator, onChange, handleClear]);

  const showMinCharsWarning = inputValue.length > 0 && inputValue.length < minChars;

  return (
    <div className={`input-box-filter ${className}`}>
      {label && (
        <label
          htmlFor={`input-box-filter-${field}`}
          className="input-box-filter__label"
        >
          {label}
        </label>
      )}

      <div className="input-box-filter__container">
        {/* Operator Selector */}
        {showOperator && (
          <div className="input-box-filter__operator" ref={dropdownRef}>
            <button
              type="button"
              className="input-box-filter__operator-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={disabled}
              aria-label="Select search operator"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <span className="input-box-filter__operator-icon">
                {operatorIcons[currentOperator]}
              </span>
              <span className="input-box-filter__operator-label">
                {operatorLabels[currentOperator]}
              </span>
              <span className="input-box-filter__operator-arrow">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="input-box-filter__dropdown">
                {operators.map((op) => (
                  <button
                    key={op}
                    type="button"
                    className={`input-box-filter__dropdown-item ${
                      op === currentOperator ? 'active' : ''
                    }`}
                    onClick={() => handleOperatorChange(op)}
                  >
                    <span className="input-box-filter__dropdown-icon">
                      {operatorIcons[op]}
                    </span>
                    <span className="input-box-filter__dropdown-label">
                      {operatorLabels[op]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Input */}
        <div className="input-box-filter__input-wrapper">
          <Search
            className="input-box-filter__search-icon"
            size={18}
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            id={`input-box-filter-${field}`}
            type="text"
            className="input-box-filter__input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={label || `Search ${field}`}
            aria-describedby={
              showMinCharsWarning ? `input-box-filter-${field}-hint` : undefined
            }
          />

          {/* Clear Button */}
          {showClear && inputValue && !disabled && (
            <button
              type="button"
              className="input-box-filter__clear-button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Minimum Characters Warning */}
      {showMinCharsWarning && (
        <div
          id={`input-box-filter-${field}-hint`}
          className="input-box-filter__hint"
          role="status"
          aria-live="polite"
        >
          Enter at least {minChars} characters to search
        </div>
      )}

      <style jsx>{`
        .input-box-filter {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .input-box-filter__label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .input-box-filter__container {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .input-box-filter__operator {
          position: relative;
          flex-shrink: 0;
        }

        .input-box-filter__operator-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          height: 38px;
        }

        .input-box-filter__operator-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .input-box-filter__operator-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-box-filter__operator-icon {
          font-size: 16px;
          font-weight: 600;
          color: #6b7280;
        }

        .input-box-filter__operator-label {
          font-size: 13px;
          font-weight: 500;
        }

        .input-box-filter__operator-arrow {
          font-size: 10px;
          color: #9ca3af;
          margin-left: -2px;
        }

        .input-box-filter__dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          z-index: 1000;
          min-width: 160px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 4px;
          animation: dropdown-enter 0.15s ease;
        }

        @keyframes dropdown-enter {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .input-box-filter__dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: background 0.1s ease;
          text-align: left;
        }

        .input-box-filter__dropdown-item:hover {
          background: #f3f4f6;
        }

        .input-box-filter__dropdown-item.active {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .input-box-filter__dropdown-icon {
          font-size: 16px;
          font-weight: 600;
          color: #6b7280;
          width: 20px;
          text-align: center;
        }

        .input-box-filter__dropdown-item.active .input-box-filter__dropdown-icon {
          color: #1d4ed8;
        }

        .input-box-filter__input-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .input-box-filter__search-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
          pointer-events: none;
        }

        .input-box-filter__input {
          width: 100%;
          padding: 8px 36px 8px 40px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #111827;
          background: white;
          transition: all 0.15s ease;
          height: 38px;
        }

        .input-box-filter__input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-box-filter__input:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .input-box-filter__input::placeholder {
          color: #9ca3af;
        }

        .input-box-filter__clear-button {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: none;
          border: none;
          border-radius: 4px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.1s ease;
        }

        .input-box-filter__clear-button:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .input-box-filter__clear-button:active {
          transform: scale(0.95);
        }

        .input-box-filter__hint {
          font-size: 12px;
          color: #f59e0b;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .input-box-filter__operator-label {
            display: none;
          }

          .input-box-filter__operator-button {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default InputBoxFilter;
