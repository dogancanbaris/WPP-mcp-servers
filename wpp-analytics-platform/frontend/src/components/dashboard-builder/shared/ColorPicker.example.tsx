"use client"

/**
 * ColorPicker Usage Examples
 *
 * This file demonstrates various use cases for the ColorPicker component
 * in the WPP Analytics Dashboard Builder.
 */

import React, { useState } from 'react'
import { ColorPicker } from './ColorPicker'
import { AccordionSection } from './AccordionSection'

/**
 * Example 1: Basic Color Picker
 */
export function BasicColorPickerExample() {
  const [textColor, setTextColor] = useState('#1A73E8')

  return (
    <div className="p-4 space-y-4 bg-background">
      <h3 className="text-lg font-semibold">Basic Color Picker</h3>

      <ColorPicker
        label="Text Color"
        value={textColor}
        onChange={setTextColor}
      />

      <div className="p-4 border rounded-md">
        <p style={{ color: textColor }}>
          This text uses the selected color: {textColor}
        </p>
      </div>
    </div>
  )
}

/**
 * Example 2: Multiple Color Pickers for Chart Styling
 */
export function ChartStyleExample() {
  const [titleColor, setTitleColor] = useState('#1A73E8')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [borderColor, setBorderColor] = useState('#E5E7EB')

  return (
    <div className="p-4 space-y-4 bg-background">
      <h3 className="text-lg font-semibold">Chart Style Settings</h3>

      <div className="space-y-4">
        <ColorPicker
          label="Title Color"
          value={titleColor}
          onChange={setTitleColor}
        />

        <ColorPicker
          label="Background Color"
          value={backgroundColor}
          onChange={setBackgroundColor}
        />

        <ColorPicker
          label="Border Color"
          value={borderColor}
          onChange={setBorderColor}
        />
      </div>

      {/* Preview */}
      <div
        className="p-4 rounded-md border-2"
        style={{
          backgroundColor: backgroundColor,
          borderColor: borderColor,
        }}
      >
        <h4 style={{ color: titleColor }} className="font-semibold text-lg">
          Chart Title Preview
        </h4>
        <p className="text-sm text-muted-foreground mt-2">
          This is how your chart will look with the selected colors.
        </p>
      </div>
    </div>
  )
}

/**
 * Example 3: With Custom Brand Presets
 */
export function BrandColorPickerExample() {
  const [primaryColor, setPrimaryColor] = useState('#1A73E8')

  // Custom brand colors for WPP
  const WPP_BRAND_COLORS = [
    '#1A73E8', // Primary Blue
    '#EA4335', // Red
    '#FBBC04', // Yellow
    '#34A853', // Green
    '#000000', // Black
    '#FFFFFF', // White
    '#4285F4', // Light Blue
    '#9E9E9E', // Gray
  ]

  return (
    <div className="p-4 space-y-4 bg-background">
      <h3 className="text-lg font-semibold">Brand Color Picker</h3>

      <ColorPicker
        label="Primary Brand Color"
        value={primaryColor}
        onChange={setPrimaryColor}
        presets={WPP_BRAND_COLORS}
      />

      <div className="p-4 border rounded-md">
        <div
          className="w-full h-20 rounded-md"
          style={{ backgroundColor: primaryColor }}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Selected: {primaryColor}
        </p>
      </div>
    </div>
  )
}

/**
 * Example 4: In Accordion Section (Real-world usage)
 */
export function AccordionColorPickerExample() {
  const [chartColors, setChartColors] = useState({
    title: '#1A73E8',
    subtitle: '#5F6368',
    background: '#FFFFFF',
    grid: '#E5E7EB',
  })

  const updateColor = (key: keyof typeof chartColors, color: string) => {
    setChartColors(prev => ({ ...prev, [key]: color }))
  }

  return (
    <div className="p-4 space-y-2 bg-background">
      <h3 className="text-lg font-semibold mb-4">Chart Style Panel</h3>

      <AccordionSection title="Text Colors" defaultExpanded>
        <div className="space-y-4">
          <ColorPicker
            label="Title Color"
            value={chartColors.title}
            onChange={(color) => updateColor('title', color)}
          />

          <ColorPicker
            label="Subtitle Color"
            value={chartColors.subtitle}
            onChange={(color) => updateColor('subtitle', color)}
          />
        </div>
      </AccordionSection>

      <AccordionSection title="Background & Grid">
        <div className="space-y-4">
          <ColorPicker
            label="Background Color"
            value={chartColors.background}
            onChange={(color) => updateColor('background', color)}
          />

          <ColorPicker
            label="Grid Line Color"
            value={chartColors.grid}
            onChange={(color) => updateColor('grid', color)}
          />
        </div>
      </AccordionSection>

      {/* Live Preview */}
      <div className="mt-6 p-4 border rounded-md">
        <h4 className="text-sm font-medium mb-3">Preview</h4>
        <div
          className="p-4 rounded"
          style={{ backgroundColor: chartColors.background }}
        >
          <h5 style={{ color: chartColors.title }} className="text-lg font-bold">
            Chart Title
          </h5>
          <p style={{ color: chartColors.subtitle }} className="text-sm mt-1">
            Chart subtitle text
          </p>
          <div
            className="mt-4 h-px"
            style={{ backgroundColor: chartColors.grid }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Example 5: Series Colors for Multiple Data Series
 */
export function SeriesColorPickerExample() {
  const [series, setSeries] = useState([
    { id: 1, name: 'Clicks', color: '#1A73E8' },
    { id: 2, name: 'Impressions', color: '#EA4335' },
    { id: 3, name: 'CTR', color: '#34A853' },
  ])

  const updateSeriesColor = (id: number, color: string) => {
    setSeries(prev =>
      prev.map(s => (s.id === id ? { ...s, color } : s))
    )
  }

  return (
    <div className="p-4 space-y-4 bg-background">
      <h3 className="text-lg font-semibold">Data Series Colors</h3>

      <div className="space-y-4">
        {series.map(s => (
          <ColorPicker
            key={s.id}
            label={`${s.name} Color`}
            value={s.color}
            onChange={(color) => updateSeriesColor(s.id, color)}
          />
        ))}
      </div>

      {/* Legend Preview */}
      <div className="p-4 border rounded-md">
        <h4 className="text-sm font-medium mb-2">Chart Legend</h4>
        <div className="flex flex-wrap gap-4">
          {series.map(s => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-sm">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Example 6: Complete Form with State Management
 */
export function CompleteFormExample() {
  const [config, setConfig] = useState({
    chart: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
    },
    title: {
      color: '#1A73E8',
      align: 'left' as const,
    },
    series: [
      { color: '#1A73E8' },
      { color: '#EA4335' },
    ],
  })

  return (
    <div className="p-4 space-y-2 bg-background max-w-md">
      <h3 className="text-lg font-semibold mb-4">Complete Chart Configuration</h3>

      <AccordionSection title="Chart" defaultExpanded>
        <div className="space-y-4">
          <ColorPicker
            label="Background"
            value={config.chart.backgroundColor}
            onChange={(color) =>
              setConfig(prev => ({
                ...prev,
                chart: { ...prev.chart, backgroundColor: color },
              }))
            }
          />
          <ColorPicker
            label="Border"
            value={config.chart.borderColor}
            onChange={(color) =>
              setConfig(prev => ({
                ...prev,
                chart: { ...prev.chart, borderColor: color },
              }))
            }
          />
        </div>
      </AccordionSection>

      <AccordionSection title="Title">
        <ColorPicker
          label="Title Color"
          value={config.title.color}
          onChange={(color) =>
            setConfig(prev => ({
              ...prev,
              title: { ...prev.title, color },
            }))
          }
        />
      </AccordionSection>

      <AccordionSection title="Series">
        <div className="space-y-4">
          {config.series.map((series, idx) => (
            <ColorPicker
              key={idx}
              label={`Series ${idx + 1}`}
              value={series.color}
              onChange={(color) =>
                setConfig(prev => ({
                  ...prev,
                  series: prev.series.map((s, i) =>
                    i === idx ? { ...s, color } : s
                  ),
                }))
              }
            />
          ))}
        </div>
      </AccordionSection>

      {/* Configuration JSON Preview */}
      <div className="mt-6 p-4 border rounded-md bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Configuration JSON</h4>
        <pre className="text-xs overflow-auto max-h-48">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  )
}
