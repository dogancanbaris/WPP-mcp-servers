import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import {
  RefreshCw,
  Download,
  ExternalLink,
  Filter,
  Calendar,
  Mail,
  Share2,
  Printer,
  FileText,
  Database,
  Play,
  Pause,
  Settings,
  Copy,
  Trash2,
  Edit,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ButtonControl Component
 *
 * Configurable button with custom action triggers for dashboard interactions.
 * Supports multiple action types including refresh, export, navigation, and more.
 *
 * @example
 * ```tsx
 * // Simple refresh button
 * <ButtonControl
 *   label="Refresh Data"
 *   action="refresh"
 *   onAction={(action, params) => console.log('Refreshing...', params)}
 * />
 *
 * // Export button with multiple formats
 * <ButtonControl
 *   label="Export"
 *   action="export"
 *   variant="secondary"
 *   icon={<Download />}
 *   actionParams={{ formats: ['csv', 'xlsx', 'pdf'] }}
 *   onAction={(action, params) => handleExport(params.format)}
 * />
 *
 * // Navigation button
 * <ButtonControl
 *   label="View Details"
 *   action="navigate"
 *   actionParams={{ url: '/campaigns/123' }}
 *   onAction={(action, params) => router.push(params.url)}
 * />
 *
 * // Custom action with confirmation
 * <ButtonControl
 *   label="Delete Campaign"
 *   action="custom"
 *   variant="destructive"
 *   requiresConfirmation
 *   confirmationMessage="Are you sure you want to delete this campaign?"
 *   onAction={async () => await deleteCampaign()}
 * />
 * ```
 */

export type ButtonAction =
  | 'refresh'
  | 'export'
  | 'navigate'
  | 'filter'
  | 'dateRange'
  | 'share'
  | 'print'
  | 'email'
  | 'copy'
  | 'download'
  | 'sync'
  | 'play'
  | 'pause'
  | 'edit'
  | 'delete'
  | 'settings'
  | 'custom';

export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ActionParams {
  // Export action params
  format?: 'csv' | 'xlsx' | 'pdf' | 'json';
  formats?: Array<'csv' | 'xlsx' | 'pdf' | 'json'>;
  filename?: string;

  // Navigate action params
  url?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';

  // Date range action params
  dateRange?: { start: Date; end: Date };

  // Filter action params
  filters?: Record<string, any>;

  // Share action params
  shareMethod?: 'link' | 'email' | 'embed';

  // Custom params
  [key: string]: any;
}

export interface ButtonControlProps {
  /** Button label text */
  label: string;

  /** Primary action type */
  action: ButtonAction;

  /** Button variant style */
  variant?: ButtonVariant;

  /** Button size */
  size?: ButtonSize;

  /** Custom icon component */
  icon?: React.ReactNode;

  /** Show icon position */
  iconPosition?: 'left' | 'right';

  /** Additional action parameters */
  actionParams?: ActionParams;

  /** Callback when action is triggered */
  onAction: (action: ButtonAction, params: ActionParams) => void | Promise<void>;

  /** Whether button is disabled */
  disabled?: boolean;

  /** Whether button is in loading state */
  loading?: boolean;

  /** Loading text to show when loading */
  loadingText?: string;

  /** Whether action requires confirmation */
  requiresConfirmation?: boolean;

  /** Confirmation dialog message */
  confirmationMessage?: string;

  /** Whether to show dropdown menu for multiple actions */
  showDropdown?: boolean;

  /** Dropdown menu items */
  dropdownItems?: Array<{
    label: string;
    action: ButtonAction;
    icon?: React.ReactNode;
    params?: ActionParams;
    disabled?: boolean;
  }>;

  /** Show badge with count or status */
  badge?: string | number;

  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';

  /** Tooltip text */
  tooltip?: string;

  /** Whether button takes full width */
  fullWidth?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Accessibility label */
  ariaLabel?: string;

  /** Keyboard shortcut hint */
  shortcut?: string;
}

const actionIcons: Record<ButtonAction, React.ReactNode> = {
  refresh: <RefreshCw className="h-4 w-4" />,
  export: <Download className="h-4 w-4" />,
  navigate: <ExternalLink className="h-4 w-4" />,
  filter: <Filter className="h-4 w-4" />,
  dateRange: <Calendar className="h-4 w-4" />,
  share: <Share2 className="h-4 w-4" />,
  print: <Printer className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  copy: <Copy className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
  sync: <Database className="h-4 w-4" />,
  play: <Play className="h-4 w-4" />,
  pause: <Pause className="h-4 w-4" />,
  edit: <Edit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  custom: <FileText className="h-4 w-4" />,
};

export const ButtonControl: React.FC<ButtonControlProps> = ({
  label,
  action,
  variant = 'default',
  size = 'default',
  icon,
  iconPosition = 'left',
  actionParams = {},
  onAction,
  disabled = false,
  loading = false,
  loadingText,
  requiresConfirmation = false,
  confirmationMessage = 'Are you sure you want to perform this action?',
  showDropdown = false,
  dropdownItems = [],
  badge,
  badgeVariant = 'default',
  tooltip,
  fullWidth = false,
  className,
  ariaLabel,
  shortcut,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get default icon for action if not provided
  const defaultIcon = actionIcons[action];
  const displayIcon = icon || defaultIcon;

  // Handle button click
  const handleClick = async () => {
    if (disabled || isLoading || loading) return;

    // Show confirmation dialog if required
    if (requiresConfirmation && !showConfirmation) {
      const confirmed = window.confirm(confirmationMessage);
      if (!confirmed) return;
    }

    try {
      setIsLoading(true);
      const result = onAction(action, actionParams);

      // Handle async actions
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error(`ButtonControl action "${action}" failed:`, error);
      throw error;
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  // Handle dropdown item click
  const handleDropdownItemClick = async (
    itemAction: ButtonAction,
    itemParams: ActionParams = {}
  ) => {
    if (disabled || isLoading || loading) return;

    try {
      setIsLoading(true);
      const result = onAction(itemAction, { ...actionParams, ...itemParams });

      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error(`ButtonControl dropdown action "${itemAction}" failed:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if button should show loading state
  const isButtonLoading = loading || isLoading;

  // Build button content
  const buttonContent = (
    <>
      {isButtonLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </>
      ) : (
        <>
          {displayIcon && iconPosition === 'left' && (
            <span className="mr-2">{displayIcon}</span>
          )}
          <span>{label}</span>
          {displayIcon && iconPosition === 'right' && (
            <span className="ml-2">{displayIcon}</span>
          )}
          {badge !== undefined && (
            <Badge variant={badgeVariant} className="ml-2">
              {badge}
            </Badge>
          )}
          {shortcut && (
            <kbd className="ml-2 hidden pointer-events-none sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              {shortcut}
            </kbd>
          )}
        </>
      )}
    </>
  );

  // Render with dropdown menu
  if (showDropdown && dropdownItems.length > 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled || isButtonLoading}
            className={cn(fullWidth && 'w-full', className)}
            aria-label={ariaLabel || label}
            title={tooltip}
          >
            {buttonContent}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {dropdownItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleDropdownItemClick(item.action, item.params)}
              disabled={item.disabled || isButtonLoading}
              className="cursor-pointer"
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Render simple button
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isButtonLoading}
      className={cn(fullWidth && 'w-full', className)}
      aria-label={ariaLabel || label}
      title={tooltip}
    >
      {buttonContent}
    </Button>
  );
};

/**
 * ButtonGroup Component
 *
 * Groups multiple ButtonControl components together with consistent spacing.
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'normal',
  align = 'start',
  className,
}) => {
  const spacingClasses = {
    tight: orientation === 'horizontal' ? 'gap-1' : 'gap-1',
    normal: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    loose: orientation === 'horizontal' ? 'gap-4' : 'gap-4',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        spacingClasses[spacing],
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Common Button Presets
 */

export const RefreshButton: React.FC<
  Omit<ButtonControlProps, 'action' | 'label'>
> = (props) => (
  <ButtonControl
    label="Refresh"
    action="refresh"
    variant="outline"
    size="sm"
    tooltip="Refresh data"
    shortcut="⌘R"
    {...props}
  />
);

export const ExportButton: React.FC<
  Omit<ButtonControlProps, 'action' | 'label'>
> = (props) => (
  <ButtonControl
    label="Export"
    action="export"
    variant="outline"
    size="sm"
    showDropdown
    dropdownItems={[
      {
        label: 'Export as CSV',
        action: 'export',
        icon: <FileText className="h-4 w-4" />,
        params: { format: 'csv' },
      },
      {
        label: 'Export as Excel',
        action: 'export',
        icon: <FileText className="h-4 w-4" />,
        params: { format: 'xlsx' },
      },
      {
        label: 'Export as PDF',
        action: 'export',
        icon: <FileText className="h-4 w-4" />,
        params: { format: 'pdf' },
      },
      {
        label: 'Export as JSON',
        action: 'export',
        icon: <FileText className="h-4 w-4" />,
        params: { format: 'json' },
      },
    ]}
    tooltip="Export data"
    {...props}
  />
);

export const ShareButton: React.FC<
  Omit<ButtonControlProps, 'action' | 'label'>
> = (props) => (
  <ButtonControl
    label="Share"
    action="share"
    variant="secondary"
    size="sm"
    showDropdown
    dropdownItems={[
      {
        label: 'Copy Link',
        action: 'copy',
        icon: <Copy className="h-4 w-4" />,
        params: { shareMethod: 'link' },
      },
      {
        label: 'Email',
        action: 'email',
        icon: <Mail className="h-4 w-4" />,
        params: { shareMethod: 'email' },
      },
      {
        label: 'Embed Code',
        action: 'copy',
        icon: <Copy className="h-4 w-4" />,
        params: { shareMethod: 'embed' },
      },
    ]}
    tooltip="Share dashboard"
    {...props}
  />
);

export const FilterButton: React.FC<
  Omit<ButtonControlProps, 'action' | 'label'>
> = (props) => (
  <ButtonControl
    label="Filter"
    action="filter"
    variant="outline"
    size="sm"
    tooltip="Apply filters"
    {...props}
  />
);

export const DateRangeButton: React.FC<
  Omit<ButtonControlProps, 'action' | 'label'>
> = (props) => (
  <ButtonControl
    label="Date Range"
    action="dateRange"
    variant="outline"
    size="sm"
    tooltip="Select date range"
    {...props}
  />
);

export default ButtonControl;
