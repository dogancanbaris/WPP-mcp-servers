'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ToolbarButton as ToolbarButtonType,
  ToolbarDropdown,
  ToolbarAvatar,
  ToolbarSeparator,
  ToolbarItem,
  DropdownItem,
} from './toolbar-definitions';

interface ToolbarSectionProps {
  items: ToolbarItem[];
}

/**
 * Renders a section of toolbar buttons (left, center, or right)
 * Groups items with proper spacing: gap-1 for tight groups, gap-2 for sections
 */
export const ToolbarSection: React.FC<ToolbarSectionProps> = ({ items }) => {
  return (
    <div className="flex items-center gap-2">
      {items.map((item, index) => (
        <ToolbarItemRenderer key={`toolbar-${index}`} item={item} />
      ))}
    </div>
  );
};

function ToolbarItemRenderer({ item }: { item: ToolbarItem }) {
  // Separator - Use shadcn/ui Separator component
  if ('type' in item && item.type === 'separator') {
    return <Separator orientation="vertical" className="h-6" />;
  }

  // Avatar with dropdown
  if ('type' in item && item.type === 'avatar') {
    return <AvatarDropdown item={item as ToolbarAvatar} />;
  }

  // Dropdown button
  if ('type' in item && item.type === 'dropdown') {
    return <DropdownButton item={item as ToolbarDropdown} />;
  }

  // Regular button
  return <RegularButton item={item as ToolbarButtonType} />;
}

function RegularButton({ item }: { item: ToolbarButtonType }) {
  const Icon = item.icon;
  const hasLabel = !!item.label;

  // Determine button variant based on purpose
  // Primary actions (Add Chart, Save): variant="default"
  // Secondary actions (Undo, Redo): variant="outline"
  // Utility actions (Zoom, View): variant="ghost"
  const buttonVariant = item.variant || (hasLabel ? 'default' : 'outline');
  const buttonSize = hasLabel ? 'sm' : 'icon';

  const button = (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      disabled={item.disabled}
      onClick={item.action}
      className={cn(
        // Consistent height for toolbar buttons
        'h-9',
        // Icon-only buttons - fixed width
        !hasLabel && 'w-9',
        // Text buttons with icon - proper spacing
        hasLabel && 'gap-2 px-3',
        // Active state for toggle buttons
        item.active && 'bg-accent text-accent-foreground border-accent-foreground/20',
        // Enhanced hover states
        !item.disabled && 'hover:shadow-sm',
        // Smooth transitions
        'transition-all duration-200',
        // Focus ring
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        // Disabled state
        item.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {Icon && <Icon className={cn('h-4 w-4', hasLabel && 'shrink-0')} />}
      {hasLabel && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
    </Button>
  );

  // Always wrap buttons with tooltips
  // Icon-only buttons: always show tooltip
  // Text buttons: show tooltip only if explicitly provided
  if (!hasLabel || item.tooltip) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="text-xs font-medium px-3 py-1.5 bg-popover text-popover-foreground border shadow-md"
            sideOffset={8}
          >
            <p>{item.tooltip || item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

function DropdownButton({ item }: { item: ToolbarDropdown }) {
  const Icon = item.icon;
  const hasLabel = !!item.label;
  const buttonVariant = item.variant || 'outline';

  const trigger = (
    <Button
      variant={buttonVariant}
      size={hasLabel ? 'sm' : 'icon'}
      disabled={item.disabled}
      className={cn(
        'h-9',
        hasLabel ? 'gap-2 px-3 pr-2' : 'w-9',
        // Enhanced hover states
        !item.disabled && 'hover:shadow-sm',
        // Smooth transitions
        'transition-all duration-200',
        // Focus ring
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        // Disabled state
        item.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {Icon && <Icon className={cn('h-4 w-4', hasLabel && 'shrink-0')} />}
      {hasLabel && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
      <ChevronDown className={cn('h-3.5 w-3.5 opacity-70', hasLabel ? 'ml-1' : '-ml-0.5')} />
    </Button>
  );

  // FIXED: Only wrap icon-only buttons with tooltip to avoid nested asChild conflicts
  // Dropdown buttons with labels don't need tooltips since the label is self-explanatory
  const wrappedTrigger =
    !hasLabel && item.tooltip ? (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="text-xs font-medium px-3 py-1.5 bg-popover text-popover-foreground border shadow-md"
            sideOffset={8}
          >
            <p>{item.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      trigger
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{wrappedTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[220px] max-w-[280px] shadow-lg border bg-popover"
        sideOffset={8}
      >
        {item.items.map((dropdownItem, index) =>
          renderDropdownItem(dropdownItem, index)
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AvatarDropdown({ item }: { item: ToolbarAvatar }) {
  const trigger = (
    <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all duration-200">
      {item.image && <AvatarImage src={item.image} alt="User" />}
      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
        {item.fallback || 'U'}
      </AvatarFallback>
    </Avatar>
  );

  const wrappedTrigger = item.tooltip ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="text-xs font-medium px-3 py-1.5 bg-popover text-popover-foreground border shadow-md"
          sideOffset={8}
        >
          <p>{item.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    trigger
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{wrappedTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[200px] shadow-lg border bg-popover"
        sideOffset={8}
      >
        {item.dropdown.map((dropdownItem, index) =>
          renderDropdownItem(dropdownItem, index)
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function renderDropdownItem(item: DropdownItem, index: number) {
  if ('type' in item && item.type === 'separator') {
    return <DropdownMenuSeparator key={`sep-${index}`} className="my-1" />;
  }

  const Icon = item.icon;
  return (
    <DropdownMenuItem
      key={`item-${index}`}
      onClick={item.action}
      disabled={item.disabled}
      className={cn(
        'cursor-pointer',
        'px-3 py-2',
        'focus:bg-accent focus:text-accent-foreground',
        'transition-colors duration-150',
        // Icon spacing
        Icon && 'gap-3',
        // Disabled state
        item.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
      <span className="text-sm font-normal">{item.label}</span>
    </DropdownMenuItem>
  );
}
