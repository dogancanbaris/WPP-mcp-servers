'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItem } from './menu-definitions';

interface MenuButtonProps {
  label: string;
  items: MenuItem[];
}

/**
 * Professional SaaS-style menu button
 * Uses shadcn/ui Button with ghost variant and consistent styling
 */
export const MenuButton: React.FC<MenuButtonProps> = ({ label, items }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-10 px-3 text-sm font-medium',
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0'
          )}
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[240px] shadow-lg border"
        sideOffset={4}
      >
        {items.map((item, index) =>
          renderMenuItem(item, index, `${label}-${index}`)
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function renderMenuItem(
  item: MenuItem,
  index: number,
  key: string
): React.ReactNode {
  // Separator
  if ('type' in item && item.type === 'separator') {
    return <DropdownMenuSeparator key={key} />;
  }

  // Checkbox item
  if ('type' in item && item.type === 'checkbox') {
    const Icon = item.icon;
    return (
      <DropdownMenuCheckboxItem
        key={key}
        checked={item.checked}
        onCheckedChange={item.action}
        disabled={item.disabled}
        className="cursor-pointer"
      >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        <span>{item.label}</span>
        {item.shortcut && (
          <span className="ml-auto text-xs text-muted-foreground">
            {item.shortcut}
          </span>
        )}
      </DropdownMenuCheckboxItem>
    );
  }

  // Submenu item
  if ('submenu' in item && item.submenu) {
    const Icon = item.icon;
    return (
      <DropdownMenuSub key={key}>
        <DropdownMenuSubTrigger className="cursor-pointer">
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          <span>{item.label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-[200px]">
          {item.submenu.map((subItem, subIndex) =>
            renderMenuItem(subItem, subIndex, `${key}-sub-${subIndex}`)
          )}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  // Regular menu item
  const Icon = item.icon;
  return (
    <DropdownMenuItem
      key={key}
      onClick={item.action}
      disabled={item.disabled}
      className={cn(
        'cursor-pointer',
        item.variant === 'destructive' &&
          'text-destructive focus:text-destructive'
      )}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span className="flex-1">{item.label}</span>
      {item.shortcut && (
        <span className="ml-auto text-xs text-muted-foreground pl-4">
          {item.shortcut}
        </span>
      )}
    </DropdownMenuItem>
  );
}
