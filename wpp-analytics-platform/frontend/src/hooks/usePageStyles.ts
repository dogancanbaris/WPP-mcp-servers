import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { getMergedStyles, toCSSVariables } from '@/lib/utils/style-cascade';
import type { ComponentConfig } from '@/types/dashboard-builder';

export interface UsePageStylesOptions {
  pageId?: string;
  componentConfig?: ComponentConfig;
}

export function usePageStyles(options: UsePageStylesOptions = {}) {
  const { pageId, componentConfig } = options;

  const config = useDashboardStore((state) => state.config);
  const globalTheme = config?.theme;

  const page = config?.pages?.find(p => p.id === pageId);
  const pageStyles = page?.pageStyles;

  // Merge styles from all levels
  const mergedStyles = useMemo(
    () => getMergedStyles(globalTheme, pageStyles, componentConfig),
    [globalTheme, pageStyles, componentConfig]
  );

  // Convert to CSS variables
  const cssVariables = useMemo(
    () => toCSSVariables(mergedStyles),
    [mergedStyles]
  );

  return {
    styles: mergedStyles,
    cssVariables,
    globalTheme,
    pageStyles,
  };
}
