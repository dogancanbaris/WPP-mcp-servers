import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Palette } from 'lucide-react';

interface ThemeConfig {
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  description: string;
}

interface ThemePresetsAccordionProps {
  onThemeSelected: (theme: ThemeConfig) => void;
  currentTheme?: ThemeConfig;
}

const THEME_PRESETS: ThemeConfig[] = [
  {
    name: 'Light Professional',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#3b82f6',
    borderColor: '#e5e7eb',
    description: 'Clean white background with professional blue accent',
  },
  {
    name: 'Dark Modern',
    backgroundColor: '#1f2937',
    textColor: '#f3f4f6',
    accentColor: '#60a5fa',
    borderColor: '#374151',
    description: 'Dark gray background with light accents',
  },
  {
    name: 'WPP Branding',
    backgroundColor: '#f8f9fa',
    textColor: '#191d63',
    accentColor: '#191d63',
    borderColor: '#dee2e6',
    description: 'Official WPP branding colors',
  },
  {
    name: 'Minimalist',
    backgroundColor: '#fafafa',
    textColor: '#222222',
    accentColor: '#000000',
    borderColor: '#cccccc',
    description: 'Minimal black and white palette',
  },
  {
    name: 'Ocean',
    backgroundColor: '#e0f2fe',
    textColor: '#0c4a6e',
    accentColor: '#0284c7',
    borderColor: '#0ea5e9',
    description: 'Cool ocean-inspired palette',
  },
  {
    name: 'Forest',
    backgroundColor: '#dcfce7',
    textColor: '#15803d',
    accentColor: '#22c55e',
    borderColor: '#4ade80',
    description: 'Natural green palette',
  },
];

/**
 * ThemePresetsAccordion - Pre-built theme selector
 *
 * Provides quick access to professional theme presets
 * with live preview capabilities.
 *
 * Agent MCP: Can be called with theme name to apply
 */
export const ThemePresetsAccordion: React.FC<ThemePresetsAccordionProps> = ({
  onThemeSelected,
  currentTheme,
}) => {
  return (
    <AccordionItem value="theme-presets">
      <AccordionTrigger className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="text-sm font-medium">Theme Presets</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Select a pre-configured theme or customize individual colors
        </p>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-2">
          {THEME_PRESETS.map((theme) => (
            <Button
              key={theme.name}
              variant={currentTheme?.name === theme.name ? 'default' : 'outline'}
              onClick={() => onThemeSelected(theme)}
              className="h-auto p-2 flex flex-col items-start justify-start text-left"
            >
              {/* Theme Preview */}
              <div className="flex gap-1 mb-1 w-full">
                <div
                  className="h-5 w-5 rounded border"
                  style={{ backgroundColor: theme.backgroundColor }}
                />
                <div
                  className="h-5 w-5 rounded border"
                  style={{ backgroundColor: theme.accentColor }}
                />
              </div>

              {/* Theme Name */}
              <span className="text-xs font-semibold line-clamp-2">{theme.name}</span>

              {/* Description */}
              <span className="text-xs text-muted-foreground line-clamp-1">
                {theme.description}
              </span>
            </Button>
          ))}
        </div>

        {/* Current Theme Details */}
        {currentTheme && (
          <Card className="p-3 bg-muted/50">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold">{currentTheme.name} Colors</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: currentTheme.backgroundColor }}
                  />
                  <span>Background</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: currentTheme.textColor }}
                  />
                  <span>Text</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: currentTheme.accentColor }}
                  />
                  <span>Accent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: currentTheme.borderColor }}
                  />
                  <span>Border</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
