import React, { useState } from 'react';
import { ComponentConfig } from '@/types/dashboard-builder';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import {
  TitleStyleAccordion,
  TableStyleAccordion,
  TableHeaderAccordion,
  TableBodyAccordion,
  ConditionalFormattingAccordion,
  DimensionStyleAccordion,
  MetricStyleAccordion,
  BackgroundBorderAccordion,
  HeaderFooterAccordion,
} from '.';
import { ThemePresetsAccordion } from './ThemePresetsAccordion';
import { CustomCSSAccordion } from './CustomCSSAccordion';
import { getComponentBehavior } from '../component-behavior';
import { TextStylePanel } from './TextStylePanel';
import { MediaStylePanel } from './MediaStylePanel';
import { ShapeStylePanel } from './ShapeStylePanel';
import { ControlStylePanel } from './ControlStylePanel';

interface ChartStyleProps {
  config: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

/**
 * ChartStyle Component - Enhanced Version
 *
 * Comprehensive style tab matching Looker Studio capabilities.
 * Uses accordion sections for organized, scalable styling options.
 *
 * Sections:
 * 1. Chart Title - Text, font, color, alignment
 * 2. Table Options - Display density, row numbers, borders, pagination
 * 3. Table Header - Header styling and formatting
 * 4. Table Body & Rows - Body text, colors, padding
 * 5. Conditional Formatting - Rule-based cell formatting
 * 6. Dimension Styles - Per-dimension styling
 * 7. Metric Styles - Per-metric formatting (number format, bars, comparison)
 * 8. Background & Border - Background, border, shadow, padding
 * 9. Header & Footer - Chart header/footer configuration
 *
 * @param config - Current component configuration
 * @param onUpdate - Callback to update component properties
 */
export const ChartStyle: React.FC<ChartStyleProps> = ({ config, onUpdate }) => {
  const behavior = getComponentBehavior(config.type);

  if (behavior.styleVariant === 'text') {
    return <TextStylePanel config={config} onUpdate={onUpdate} />;
  }

  if (behavior.styleVariant === 'media') {
    return <MediaStylePanel config={config} onUpdate={onUpdate} />;
  }

  if (behavior.styleVariant === 'shape') {
    return <ShapeStylePanel config={config} onUpdate={onUpdate} />;
  }

  if (behavior.styleVariant === 'control') {
    return <ControlStylePanel config={config} onUpdate={onUpdate} />;
  }

  if (behavior.styleVariant === 'none') {
    return (
      <div className="text-sm text-muted-foreground">
        No additional styling options available for this component.
      </div>
    );
  }

  // Initialize style configs with defaults
  const [titleConfig, setTitleConfig] = useState({
    text: config.title || '',
    show: true,
    fontSize: '16',
    fontFamily: 'roboto',
    fontWeight: '600',
    color: '#000000',
    alignment: 'left' as const,
  });

  const [tableConfig, setTableConfig] = useState({
    showRowNumbers: false,
    showBorder: true,
    density: 'comfortable' as const,
    alternateRowColors: true,
    hoverHighlight: true,
    sortable: true,
    pagination: false,
    pageSize: 25,
  });

  const [tableHeaderConfig, setTableHeaderConfig] = useState({
    fontSize: '14',
    fontWeight: '600',
    textColor: '#1f2937',
    backgroundColor: '#f3f4f6',
    alignment: 'left' as const,
  });

  const [tableBodyConfig, setTableBodyConfig] = useState({
    fontSize: '14',
    textColor: '#374151',
    backgroundColor: '#ffffff',
    alternateRowColor: '#f9fafb',
    borderColor: '#e5e7eb',
    rowPadding: '8',
  });

  const [conditionalFormattingConfig, setConditionalFormattingConfig] = useState({
    rules: [] as any[],
  });

  const [dimensionStyleConfig, setDimensionStyleConfig] = useState({
    dimensions: (config.dimensions || []).map((dim: any, idx: number) => ({
      id: dim.id || `dim-${idx}`,
      name: dim.name || dim.field || `Dimension ${idx + 1}`,
      alignment: 'left' as const,
      fontSize: '14',
      fontWeight: '400',
      textColor: '#374151',
    })),
  });

  const [metricStyleConfig, setMetricStyleConfig] = useState({
    metrics: (config.metrics || []).map((metric: any, idx: number) => ({
      id: metric.id || `metric-${idx}`,
      name: metric.name || metric.field || `Metric ${idx + 1}`,
      format: 'auto' as const,
      decimals: 0,
      compact: false,
      alignment: 'right' as const,
      textColor: '#374151',
      fontWeight: '400',
      showComparison: false,
      compareVs: 'previous' as const,
      showBars: false,
      barColor: '#3b82f6',
    })),
  });

  const [backgroundBorderConfig, setBackgroundBorderConfig] = useState({
    backgroundColor: config.style?.backgroundColor || '#ffffff',
    showBorder: true,
    borderColor: config.style?.borderColor || '#e5e7eb',
    borderWidth: config.style?.borderWidth ?? 1,
    borderRadius: config.style?.borderRadius ?? 8,
    showShadow: false,
    shadowColor: '#00000020',
    shadowBlur: 10,
    padding: config.style?.padding ?? 16,
  });

  const [headerFooterConfig, setHeaderFooterConfig] = useState({
    showHeader: false,
    headerText: '',
    headerFontSize: '12',
    headerColor: '#6b7280',
    headerAlignment: 'left' as const,
    showFooter: false,
    footerText: '',
    footerFontSize: '10',
    footerColor: '#9ca3af',
    footerAlignment: 'left' as const,
  });

  const [customCSS, setCustomCSS] = useState(config.customCSS || '');

  const [currentTheme, setCurrentTheme] = useState<any>({
    name: 'Light Professional',
    backgroundColor: config.style?.backgroundColor || '#ffffff',
    textColor: '#1f2937',
    accentColor: '#3b82f6',
    borderColor: config.style?.borderColor || '#e5e7eb',
  });

  /**
   * Sync local config changes back to parent component
   */
  const syncToConfig = () => {
    onUpdate({
      title: titleConfig.text,
      style: {
        ...config.style,
        backgroundColor: backgroundBorderConfig.backgroundColor,
        borderColor: backgroundBorderConfig.borderColor,
        borderWidth: backgroundBorderConfig.borderWidth,
        borderRadius: backgroundBorderConfig.borderRadius,
        padding: backgroundBorderConfig.padding,
      },
      customCSS,
      // Store all style configs in a custom property
      styleConfigs: {
        title: titleConfig,
        table: tableConfig,
        tableHeader: tableHeaderConfig,
        tableBody: tableBodyConfig,
        conditionalFormatting: conditionalFormattingConfig,
        dimensions: dimensionStyleConfig,
        metrics: metricStyleConfig,
        backgroundBorder: backgroundBorderConfig,
        headerFooter: headerFooterConfig,
        theme: currentTheme,
      },
    });
  };

  // Sync whenever any config changes
  React.useEffect(() => {
    syncToConfig();
  }, [
    titleConfig,
    tableConfig,
    tableHeaderConfig,
    tableBodyConfig,
    conditionalFormattingConfig,
    dimensionStyleConfig,
    metricStyleConfig,
    backgroundBorderConfig,
    headerFooterConfig,
    customCSS,
    currentTheme,
  ]);

  /**
   * Reset all styles to defaults
   */
  const resetToDefaults = () => {
    setTitleConfig({
      text: '',
      show: true,
      fontSize: '16',
      fontFamily: 'roboto',
      fontWeight: '600',
      color: '#000000',
      alignment: 'left',
    });

    setTableConfig({
      showRowNumbers: false,
      showBorder: true,
      density: 'comfortable',
      alternateRowColors: true,
      hoverHighlight: true,
      sortable: true,
      pagination: false,
      pageSize: 25,
    });

    setTableHeaderConfig({
      fontSize: '14',
      fontWeight: '600',
      textColor: '#1f2937',
      backgroundColor: '#f3f4f6',
      alignment: 'left',
    });

    setTableBodyConfig({
      fontSize: '14',
      textColor: '#374151',
      backgroundColor: '#ffffff',
      alternateRowColor: '#f9fafb',
      borderColor: '#e5e7eb',
      rowPadding: '8',
    });

    setConditionalFormattingConfig({
      rules: [],
    });

    setBackgroundBorderConfig({
      backgroundColor: '#ffffff',
      showBorder: true,
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 8,
      showShadow: false,
      shadowColor: '#00000020',
      shadowBlur: 10,
      padding: 16,
    });

    setHeaderFooterConfig({
      showHeader: false,
      headerText: '',
      headerFontSize: '12',
      headerColor: '#6b7280',
      headerAlignment: 'left',
      showFooter: false,
      footerText: '',
      footerFontSize: '10',
      footerColor: '#9ca3af',
      footerAlignment: 'left',
    });

    setCustomCSS('');
    setCurrentTheme({
      name: 'Light Professional',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#3b82f6',
      borderColor: '#e5e7eb',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable accordion area */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" className="w-full">
          {/* 0. Theme Presets */}
          <ThemePresetsAccordion
            onThemeSelected={(theme) => {
              setCurrentTheme(theme);
              setBackgroundBorderConfig(prev => ({
                ...prev,
                backgroundColor: theme.backgroundColor,
                borderColor: theme.borderColor,
              }));
            }}
            currentTheme={currentTheme}
          />

          {/* 1. Chart Title */}
          <TitleStyleAccordion config={titleConfig} onChange={setTitleConfig} />

          {/* 2. Table Options */}
          <TableStyleAccordion config={tableConfig} onChange={setTableConfig} />

          {/* 3. Table Header */}
          <TableHeaderAccordion config={tableHeaderConfig} onChange={setTableHeaderConfig} />

          {/* 4. Table Body & Rows */}
          <TableBodyAccordion config={tableBodyConfig} onChange={setTableBodyConfig} />

          {/* 5. Conditional Formatting */}
          <ConditionalFormattingAccordion
            config={conditionalFormattingConfig}
            metrics={(config.metrics || []).map((m: any, idx: number) => ({
              id: m.id || `metric-${idx}`,
              name: m.name || m.field || `Metric ${idx + 1}`,
            }))}
            onChange={setConditionalFormattingConfig}
          />

          {/* 6. Dimension Styles */}
          <DimensionStyleAccordion config={dimensionStyleConfig} onChange={setDimensionStyleConfig} />

          {/* 7. Metric Styles - The comprehensive one! */}
          <MetricStyleAccordion config={metricStyleConfig} onChange={setMetricStyleConfig} />

          {/* 8. Background & Border */}
          <BackgroundBorderAccordion config={backgroundBorderConfig} onChange={setBackgroundBorderConfig} />

          {/* 9. Header & Footer */}
          <HeaderFooterAccordion config={headerFooterConfig} onChange={setHeaderFooterConfig} />

          {/* 10. Custom CSS */}
          <CustomCSSAccordion customCSS={customCSS} onUpdate={setCustomCSS} />
        </Accordion>
      </div>

      {/* Fixed reset button at bottom */}
      <div className="border-t p-4 bg-background">
        <Button onClick={resetToDefaults} variant="outline" className="w-full">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
