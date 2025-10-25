import React, { useState } from 'react';
import {
  LineComponent,
  LineDivider,
  LineSeparator,
  SectionDivider,
  SubtleDivider,
  AccentDivider,
  type LineOrientation,
  type LineStyle,
} from './LineComponent';

/**
 * Interactive demo for LineComponent
 * This component provides a visual playground for testing all features
 */
export const LineComponentDemo: React.FC = () => {
  const [orientation, setOrientation] = useState<LineOrientation>('horizontal');
  const [thickness, setThickness] = useState(2);
  const [color, setColor] = useState('#3b82f6');
  const [lineStyle, setLineStyle] = useState<LineStyle>('solid');
  const [length, setLength] = useState('100%');
  const [opacity, setOpacity] = useState(1);
  const [margin, setMargin] = useState('16px 0');

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '8px' }}>LineComponent Interactive Demo</h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Explore all features of the flexible divider/separator component
      </p>

      <SectionDivider />

      {/* Interactive Playground */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '48px' }}>
        {/* Controls */}
        <div>
          <h2 style={{ marginBottom: '24px' }}>Controls</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Orientation */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Orientation
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label>
                  <input
                    type="radio"
                    value="horizontal"
                    checked={orientation === 'horizontal'}
                    onChange={(e) => setOrientation(e.target.value as LineOrientation)}
                  />
                  {' '}Horizontal
                </label>
                <label>
                  <input
                    type="radio"
                    value="vertical"
                    checked={orientation === 'vertical'}
                    onChange={(e) => setOrientation(e.target.value as LineOrientation)}
                  />
                  {' '}Vertical
                </label>
              </div>
            </div>

            {/* Thickness */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Thickness: {thickness}px
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Color */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Color: {color}
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: '60px', height: '40px' }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Style */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Line Style
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label>
                  <input
                    type="radio"
                    value="solid"
                    checked={lineStyle === 'solid'}
                    onChange={(e) => setLineStyle(e.target.value as LineStyle)}
                  />
                  {' '}Solid
                </label>
                <label>
                  <input
                    type="radio"
                    value="dashed"
                    checked={lineStyle === 'dashed'}
                    onChange={(e) => setLineStyle(e.target.value as LineStyle)}
                  />
                  {' '}Dashed
                </label>
                <label>
                  <input
                    type="radio"
                    value="dotted"
                    checked={lineStyle === 'dotted'}
                    onChange={(e) => setLineStyle(e.target.value as LineStyle)}
                  />
                  {' '}Dotted
                </label>
              </div>
            </div>

            {/* Length */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Length
              </label>
              <input
                type="text"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="e.g., 100%, 200px, 50vw"
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
              />
            </div>

            {/* Opacity */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Opacity: {opacity.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Margin */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Margin
              </label>
              <input
                type="text"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="e.g., 16px 0, 32px auto"
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setOrientation('horizontal');
                setThickness(2);
                setColor('#3b82f6');
                setLineStyle('solid');
                setLength('100%');
                setOpacity(1);
                setMargin('16px 0');
              }}
              style={{
                padding: '12px 24px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h2 style={{ marginBottom: '24px' }}>Live Preview</h2>

          <div
            style={{
              padding: '40px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              minHeight: orientation === 'vertical' ? '400px' : '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {orientation === 'horizontal' ? (
              <div style={{ width: '100%' }}>
                <p style={{ textAlign: 'center', marginBottom: '16px', color: '#6b7280' }}>
                  Content above line
                </p>
                <LineComponent
                  orientation={orientation}
                  thickness={thickness}
                  color={color}
                  style={lineStyle}
                  length={length}
                  opacity={opacity}
                  margin={margin}
                />
                <p style={{ textAlign: 'center', marginTop: '16px', color: '#6b7280' }}>
                  Content below line
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', height: '100%' }}>
                <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
                  Left content
                </div>
                <LineComponent
                  orientation={orientation}
                  thickness={thickness}
                  color={color}
                  style={lineStyle}
                  length={length}
                  opacity={opacity}
                  margin={margin}
                />
                <div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
                  Right content
                </div>
              </div>
            )}
          </div>

          {/* Generated Code */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Generated Code</h3>
            <pre
              style={{
                padding: '16px',
                background: '#1e293b',
                color: '#e2e8f0',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
{`<LineComponent
  orientation="${orientation}"
  thickness={${thickness}}
  color="${color}"
  style="${lineStyle}"
  length="${length}"
  opacity={${opacity}}
  margin="${margin}"
/>`}
            </pre>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Pre-configured Variants Showcase */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '24px' }}>Pre-configured Variants</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
          {/* LineDivider */}
          <div style={{ padding: '24px', background: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '8px' }}>LineDivider</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Basic horizontal divider
            </p>
            <div>
              <p>Content above</p>
              <LineDivider />
              <p>Content below</p>
            </div>
            <pre style={{ marginTop: '16px', fontSize: '12px', background: '#1e293b', color: '#e2e8f0', padding: '8px', borderRadius: '4px' }}>
              &lt;LineDivider /&gt;
            </pre>
          </div>

          {/* SectionDivider */}
          <div style={{ padding: '24px', background: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '8px' }}>SectionDivider</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Thicker line with more spacing
            </p>
            <div>
              <p>Section 1</p>
              <SectionDivider />
              <p>Section 2</p>
            </div>
            <pre style={{ marginTop: '16px', fontSize: '12px', background: '#1e293b', color: '#e2e8f0', padding: '8px', borderRadius: '4px' }}>
              &lt;SectionDivider /&gt;
            </pre>
          </div>

          {/* SubtleDivider */}
          <div style={{ padding: '24px', background: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '8px' }}>SubtleDivider</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Lighter, less prominent
            </p>
            <div>
              <p>Paragraph 1</p>
              <SubtleDivider />
              <p>Paragraph 2</p>
            </div>
            <pre style={{ marginTop: '16px', fontSize: '12px', background: '#1e293b', color: '#e2e8f0', padding: '8px', borderRadius: '4px' }}>
              &lt;SubtleDivider /&gt;
            </pre>
          </div>

          {/* AccentDivider */}
          <div style={{ padding: '24px', background: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '8px' }}>AccentDivider</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Brand color emphasis
            </p>
            <div>
              <p>Important section</p>
              <AccentDivider />
              <p>Featured content</p>
            </div>
            <pre style={{ marginTop: '16px', fontSize: '12px', background: '#1e293b', color: '#e2e8f0', padding: '8px', borderRadius: '4px' }}>
              &lt;AccentDivider /&gt;
            </pre>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Real-World Example */}
      <div>
        <h2 style={{ marginBottom: '24px' }}>Real-World Example: Dashboard Card</h2>

        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '32px',
            background: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
              Campaign Performance Dashboard
            </h3>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
              Last 30 days • Updated 5 minutes ago
            </p>
          </div>

          <SectionDivider />

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Impressions', value: '1.2M', change: '+12.5%', positive: true },
              { label: 'Clicks', value: '45.2K', change: '+8.3%', positive: true },
              { label: 'CTR', value: '3.77%', change: '-2.1%', positive: false },
              { label: 'Cost', value: '$8,520', change: '+15.2%', positive: false },
            ].map((kpi, i) => (
              <div key={i} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>{kpi.label}</p>
                <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' }}>{kpi.value}</p>
                <p style={{ margin: 0, fontSize: '12px', color: kpi.positive ? '#10b981' : '#ef4444' }}>
                  {kpi.change}
                </p>
              </div>
            ))}
          </div>

          <SubtleDivider />

          {/* Chart Placeholder */}
          <div style={{ padding: '48px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#6b7280', fontSize: '18px' }}>📊 Chart Component</p>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>Performance trends over time</p>
          </div>

          <SubtleDivider />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                Export CSV
              </button>
              <button style={{ padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                Share
              </button>
            </div>
            <button style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
              View Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineComponentDemo;
