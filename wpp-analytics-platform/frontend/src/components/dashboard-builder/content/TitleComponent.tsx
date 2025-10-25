'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME } from '@/lib/themes/dashboard-theme';

export interface TitleComponentProps {
  // Text content
  text?: string;
  onTextChange?: (text: string) => void;

  // Heading level
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  // Font styling
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';

  // Background & Border props
  backgroundColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  showShadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  padding?: number;

  // Interaction
  editable?: boolean;
  placeholder?: string;
}

/**
 * TitleComponent - Rich Text Heading Component
 *
 * A fully customizable heading component with rich text editing capabilities.
 * Perfect for dashboard section titles, page headers, and text content.
 *
 * Features:
 * - Editable text with inline editing (contentEditable)
 * - H1-H6 semantic heading levels
 * - Font styling: size, weight, color, family
 * - Text alignment: left, center, right, justify
 * - Customizable background and borders (via ComponentConfig)
 * - Keyboard shortcuts: Enter to finish editing, Escape to cancel
 * - Click outside to save changes
 * - Placeholder text for empty state
 *
 * @example
 * ```tsx
 * <TitleComponent
 *   text="Dashboard Overview"
 *   headingLevel="h1"
 *   fontSize="32"
 *   fontWeight="700"
 *   color="#1A73E8"
 *   alignment="center"
 *   editable={true}
 *   onTextChange={(newText) => console.log(newText)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With background and border styling
 * <TitleComponent
 *   text="Campaign Performance"
 *   headingLevel="h2"
 *   fontSize="24"
 *   fontWeight="600"
 *   color="#333333"
 *   alignment="left"
 *   backgroundColor="#F5F5F5"
 *   showBorder={true}
 *   borderColor="#E0E0E0"
 *   borderWidth={1}
 *   borderRadius={8}
 *   padding={16}
 * />
 * ```
 */
export const TitleComponent: React.FC<TitleComponentProps> = (props) => {
  // Detect role from props to determine which theme to apply
  const componentRole = (props as any).componentRole || 'default';

  // Apply theme based on role
  const themeDefaults = componentRole === 'header'
    ? DASHBOARD_THEME.header
    : componentRole === 'description'
    ? DASHBOARD_THEME.description
    : {};

  // Merge props with theme defaults (props override theme)
  const {
    text = 'Add title here...',
    onTextChange,
    headingLevel = 'h2',
    fontFamily = themeDefaults.fontFamily || 'Inter, system-ui, sans-serif',
    fontSize = themeDefaults.fontSize || '24',
    fontWeight = themeDefaults.fontWeight || '600',
    color = themeDefaults.textColor || themeDefaults.color || '#1F2937',
    alignment = themeDefaults.textAlign || 'left',
    editable = true,
    placeholder = 'Click to edit title...',
    backgroundColor = themeDefaults.backgroundColor || 'transparent',
    showBorder = themeDefaults.border ? true : false,
    borderColor = themeDefaults.borderColor || '#E5E7EB',
    borderWidth = themeDefaults.border ? parseInt(themeDefaults.border.split(' ')[0]) : 1,
    borderRadius = themeDefaults.borderRadius ? parseInt(themeDefaults.borderRadius) : 0,
    showShadow = false,
    shadowColor = '#000000',
    shadowBlur = 10,
    padding = themeDefaults.padding ? parseInt(themeDefaults.padding) : 0,
    ...rest
  } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const [originalText, setOriginalText] = useState(text);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync external text changes
  useEffect(() => {
    setCurrentText(text);
    setOriginalText(text);
  }, [text]);

  // Focus the content when entering edit mode
  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      // Select all text
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Handle click outside to save
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, currentText]);

  const handleClick = () => {
    if (editable && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || '';
    setCurrentText(newText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    const finalText = currentText.trim() || placeholder;
    setCurrentText(finalText);
    setOriginalText(finalText);

    if (onTextChange) {
      onTextChange(finalText);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentText(originalText);
    if (contentRef.current) {
      contentRef.current.textContent = originalText;
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    border: showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    boxShadow: showShadow ? `0 0 ${shadowBlur}px ${shadowColor}` : 'none',
    minHeight: componentRole === 'header' ? '60px' : '40px',
    position: 'relative',
    // Center vertically for headers
    display: componentRole === 'header' ? 'flex' : 'block',
    alignItems: componentRole === 'header' ? 'center' : 'flex-start',
    justifyContent: componentRole === 'header' ? 'center' : 'flex-start',
  };

  const textStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    color,
    textAlign: (themeDefaults.textAlign as any) || alignment, // Use theme alignment (center for headers)
    outline: 'none',
    width: '100%',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-line', // Changed from 'pre-wrap' to properly render \n as line breaks
    cursor: editable ? 'text' : 'default',
    minHeight: '1em',
    lineHeight: themeDefaults.lineHeight || '1.5',
  };

  // Dynamic heading tag based on headingLevel prop
  const HeadingTag = headingLevel;

  // Show placeholder styling when empty and not editing
  const isEmpty = !currentText || currentText.trim() === '';
  const showPlaceholder = isEmpty && !isEditing;

  const editableProps = editable ? {
    contentEditable: isEditing,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onKeyDown: handleKeyDown,
  } : {};

  return (
    <div
      className={cn(
        'w-full h-full transition-all',
        editable && 'hover:ring-2 hover:ring-blue-200 hover:ring-opacity-50 rounded-sm',
        isEditing && 'ring-2 ring-blue-500 ring-opacity-50'
      )}
      style={containerStyle}
      onClick={handleClick}
    >
      <HeadingTag
        ref={contentRef}
        className={cn(
          'focus:outline-none',
          showPlaceholder && 'text-muted-foreground opacity-60'
        )}
        style={textStyle}
        role={editable ? 'textbox' : undefined}
        aria-label={editable ? 'Editable title' : 'Title'}
        aria-multiline="false"
        {...editableProps}
      >
        {showPlaceholder ? placeholder : currentText}
      </HeadingTag>

      {/* Edit hint */}
      {editable && !isEditing && (
        <div
          className="absolute top-0 right-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
          style={{ padding: '4px 8px' }}
        >
          <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
            Click to edit
          </span>
        </div>
      )}

      {/* Editing hint */}
      {isEditing && (
        <div
          className="absolute -bottom-6 left-0 right-0 text-center"
          style={{ pointerEvents: 'none' }}
        >
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
            Press Enter to save, Esc to cancel
          </span>
        </div>
      )}
    </div>
  );
};

// Export with display name for debugging
TitleComponent.displayName = 'TitleComponent';

/**
 * Preset configurations for common title styles
 */
export const TitlePresets = {
  pageHeader: {
    headingLevel: 'h1' as const,
    fontSize: '32',
    fontWeight: '700',
    color: '#1F2937',
    alignment: 'left' as const,
  },
  sectionTitle: {
    headingLevel: 'h2' as const,
    fontSize: '24',
    fontWeight: '600',
    color: '#374151',
    alignment: 'left' as const,
  },
  subsectionTitle: {
    headingLevel: 'h3' as const,
    fontSize: '18',
    fontWeight: '600',
    color: '#4B5563',
    alignment: 'left' as const,
  },
  cardTitle: {
    headingLevel: 'h4' as const,
    fontSize: '16',
    fontWeight: '600',
    color: '#6B7280',
    alignment: 'left' as const,
  },
  centeredHero: {
    headingLevel: 'h1' as const,
    fontSize: '48',
    fontWeight: '800',
    color: '#1A73E8',
    alignment: 'center' as const,
    padding: 32,
  },
  highlight: {
    headingLevel: 'h2' as const,
    fontSize: '28',
    fontWeight: '700',
    color: '#FFFFFF',
    alignment: 'center' as const,
    backgroundColor: '#1A73E8',
    borderRadius: 8,
    padding: 16,
  },
} as const;
