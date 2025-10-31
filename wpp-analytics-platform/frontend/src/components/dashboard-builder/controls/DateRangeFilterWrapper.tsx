'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DateRangeFilter, DateRangeFilterValue, DatasetTimeDimension } from './DateRangeFilter';
import { usePageLevelControl } from '@/hooks/usePageLevelControl';
import type { ComponentConfig } from '@/types/dashboard-builder';
import { useDashboardStore } from '@/store/dashboardStore';

export const DateRangeFilterWrapper: React.FC<ComponentConfig> = (config) => {
  const { isOnPage } = usePageLevelControl(config.id || 'date-filter');
  const currentPageId = useDashboardStore((s) => s.currentPageId);
  const setPageFilters = useDashboardStore((s) => s.setPageFilters);
  const pages = useDashboardStore((s) => s.config.pages || []);
  const initializedRef = useRef(false);

  const [value, setValue] = useState<DateRangeFilterValue>({
    range: {
      type: 'preset',
      preset: 'last30Days'
    },
    comparison: { enabled: false }
  });

  const handleChange = (newValue: DateRangeFilterValue) => {
    setValue(newValue);
  };

  // Hydrate from existing page filter or initialize a default on first mount
  useEffect(() => {
    if (!currentPageId || initializedRef.current) return;
    const page = pages.find((p) => p.id === currentPageId);
    const dim = (config.dimension as string) || 'date';
    const existing = page?.filters?.find((f) => f.field === dim && f.operator === 'inDateRange');

    const toDate = (s?: string) => (s ? new Date(s) : undefined);

    if (existing && Array.isArray(existing.values) && existing.values.length >= 2) {
      setValue({
        range: {
          type: 'custom',
          preset: 'custom',
          startDate: toDate(existing.values[0]),
          endDate: toDate(existing.values[1]),
        },
        comparison: {
          enabled: !!(existing as any).comparisonEnabled,
          type: (existing as any).comparisonType,
          comparisonStartDate: toDate((existing as any).comparisonValues?.[0]),
          comparisonEndDate: toDate((existing as any).comparisonValues?.[1]),
        },
      });
      initializedRef.current = true;
      return;
    }

    // No existing date filter: create one (Last 30 Days) and hydrate
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const start = new Date(yesterday);
    start.setDate(start.getDate() - 29);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    // Write default filter to page with de-duplication by field/operator
    const cleaned = (page?.filters || []).filter((f) => !(f.field === dim && f.operator === 'inDateRange'));
    setPageFilters(currentPageId, [
      ...cleaned,
      {
        id: `date-control-${config?.id || 'default'}`,
        field: dim,
        operator: 'inDateRange',
        values: [fmt(start), fmt(yesterday)],
        enabled: true,
      } as any,
    ]);

    setValue({
      range: {
        type: 'custom',
        preset: 'custom',
        startDate: start,
        endDate: yesterday,
      },
      comparison: { enabled: false },
    });
    initializedRef.current = true;
  }, [currentPageId, pages, setPageFilters, config?.id, config?.dimension]);

  if (!isOnPage) {
    return <div className="p-4 text-sm text-muted-foreground">Date control requires an active page</div>;
  }

  return (
    <DateRangeFilter
      {...config}
      value={value}
      onChange={handleChange}
      // DateRangeFilter updates page filters internally on Apply; wrapper doesn't re-emit
      dimension={config.dimension || 'date'}
      showComparison={true}
    />
  );
};
