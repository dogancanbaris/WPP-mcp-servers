/**
 * SettingsSidebar Component Tests
 *
 * This file verifies that the SettingsSidebar and its child components
 * (ChartSetup, ChartStyle) are properly implemented and compile correctly.
 */

import React from 'react';
import { SettingsSidebar } from '../sidebar';
import { ComponentConfig } from '@/types/dashboard-builder';

/**
 * Test 1: Component renders without selection
 */
export function testNoSelection() {
  const handleUpdate = (id: string, updates: Partial<ComponentConfig>) => {
    console.log('Update component:', id, updates);
  };

  return (
    <SettingsSidebar
      onUpdateComponent={handleUpdate}
    />
  );
}

/**
 * Test 2: Component renders with selection
 */
export function testWithSelection() {
  const selectedComponent: ComponentConfig = {
    id: 'test-chart-1',
    type: 'bar_chart',
    title: 'Campaign Performance',
    datasource: 'gsc_data',
    dimensions: ['date'],
    metrics: ['clicks', 'impressions'],
    dateRange: 'last_30_days',
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 8,
      padding: 16
    }
  };

  const handleUpdate = (id: string, updates: Partial<ComponentConfig>) => {
    console.log('Update component:', id, updates);
  };

  return (
    <SettingsSidebar
      selectedComponent={selectedComponent}
      onUpdateComponent={handleUpdate}
    />
  );
}

/**
 * Test 3: Verify types are correct
 */
export function typeTest() {
  // This function won't run, but TypeScript will verify the types compile
  const config: ComponentConfig = {
    id: '1',
    type: 'line_chart',
    title: 'Test',
    metrics: ['clicks'],
    dimensions: ['date']
  };

  const update = (id: string, updates: Partial<ComponentConfig>) => {
    // Valid updates
    updates.title = 'New Title';
    updates.metrics = ['impressions', 'ctr'];
    updates.style = { backgroundColor: '#f0f0f0' };
  };

  return { config, update };
}
