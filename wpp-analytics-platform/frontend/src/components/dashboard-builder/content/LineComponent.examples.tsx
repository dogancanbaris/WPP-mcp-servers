import React from 'react';
import {
  LineComponent,
  LineDivider,
  LineSeparator,
  SectionDivider,
  SubtleDivider,
  AccentDivider,
} from './LineComponent';

/**
 * Example usage of LineComponent and its variants
 */
export const LineComponentExamples: React.FC = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>LineComponent Examples</h1>

      {/* Basic Horizontal Lines */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Basic Horizontal Lines</h2>

        <div style={{ marginBottom: '24px' }}>
          <p>Default (1px solid gray)</p>
          <LineComponent />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>Thick (5px)</p>
          <LineComponent thickness={5} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>Custom color (blue)</p>
          <LineComponent color="#3b82f6" thickness={2} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>Custom length (50%)</p>
          <LineComponent length="50%" thickness={2} color="#10b981" />
        </div>
      </section>

      {/* Line Styles */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Line Styles</h2>

        <div style={{ marginBottom: '24px' }}>
          <p>Solid</p>
          <LineComponent style="solid" thickness={2} color="#6366f1" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>Dashed</p>
          <LineComponent style="dashed" thickness={2} color="#6366f1" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>Dotted</p>
          <LineComponent style="dotted" thickness={3} color="#6366f1" />
        </div>
      </section>

      {/* Vertical Lines */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Vertical Lines</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <p>Column 1</p>
          </div>

          <LineComponent orientation="vertical" length="100px" thickness={1} />

          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <p>Column 2</p>
          </div>

          <LineComponent orientation="vertical" length="100px" thickness={2} color="#3b82f6" style="dashed" />

          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <p>Column 3</p>
          </div>
        </div>
      </section>

      {/* Pre-configured Variants */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Pre-configured Variants</h2>

        <div style={{ marginBottom: '24px' }}>
          <p>LineDivider (default horizontal)</p>
          <LineDivider />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>SectionDivider (thicker, more spacing)</p>
          <SectionDivider />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>SubtleDivider (lighter, less spacing)</p>
          <SubtleDivider />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>AccentDivider (brand color)</p>
          <AccentDivider />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>LineSeparator</span>
          <LineSeparator length="60px" />
          <span>Vertical variant</span>
        </div>
      </section>

      {/* Dashboard Layout Example */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Dashboard Layout Example</h2>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' }}>
          {/* Header */}
          <div>
            <h3 style={{ margin: '0 0 8px 0' }}>Campaign Performance</h3>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Last 30 days</p>
          </div>

          <SectionDivider />

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Impressions</p>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>1.2M</p>
            </div>
            <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Clicks</p>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>45.2K</p>
            </div>
            <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>CTR</p>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>3.77%</p>
            </div>
            <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Cost</p>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>$8,520</p>
            </div>
          </div>

          <SubtleDivider />

          {/* Chart Area */}
          <div style={{ padding: '24px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>Chart Component</p>
          </div>

          <SubtleDivider />

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
              Export
            </button>
            <button style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>
              View Details
            </button>
          </div>
        </div>
      </section>

      {/* Opacity and Custom Margin */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Opacity and Custom Margin</h2>

        <div style={{ marginBottom: '24px' }}>
          <p>Full opacity (1.0)</p>
          <LineComponent opacity={1} thickness={2} color="#3b82f6" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>75% opacity (0.75)</p>
          <LineComponent opacity={0.75} thickness={2} color="#3b82f6" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>50% opacity (0.5)</p>
          <LineComponent opacity={0.5} thickness={2} color="#3b82f6" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>25% opacity (0.25)</p>
          <LineComponent opacity={0.25} thickness={2} color="#3b82f6" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>Custom margin (64px top/bottom)</p>
          <LineComponent margin="64px 0" thickness={2} color="#10b981" />
        </div>
      </section>

      {/* Multi-column Layout with Separators */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Multi-column Layout</h2>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1, padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Section 1</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>Content for section 1</p>
          </div>

          <LineSeparator length="100px" thickness={2} color="#f59e0b" />

          <div style={{ flex: 1, padding: '16px', background: '#dbeafe', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Section 2</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>Content for section 2</p>
          </div>

          <LineSeparator length="100px" thickness={2} color="#3b82f6" />

          <div style={{ flex: 1, padding: '16px', background: '#d1fae5', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Section 3</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>Content for section 3</p>
          </div>
        </div>
      </section>

      {/* Creative Uses */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Creative Uses</h2>

        <div style={{ marginBottom: '24px' }}>
          <p>Double line divider</p>
          <div>
            <LineComponent thickness={1} color="#3b82f6" margin="8px 0" />
            <LineComponent thickness={1} color="#3b82f6" margin="0" />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>Progress bar style</p>
          <div style={{ position: 'relative', width: '100%', height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
            <div style={{ position: 'absolute', width: '60%', height: '100%', background: '#10b981', borderRadius: '2px' }} />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p>Gradient divider effect (using opacity)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <LineComponent opacity={0.2} thickness={1} color="#3b82f6" margin="0" />
            <LineComponent opacity={0.5} thickness={1} color="#3b82f6" margin="0" />
            <LineComponent opacity={1} thickness={2} color="#3b82f6" margin="0" />
            <LineComponent opacity={0.5} thickness={1} color="#3b82f6" margin="0" />
            <LineComponent opacity={0.2} thickness={1} color="#3b82f6" margin="0" />
          </div>
        </div>
      </section>

      {/* Accessibility Note */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px' }}>Accessibility</h2>
        <div style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#166534' }}>Accessibility Features:</p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534' }}>
            <li>Uses semantic <code>role="separator"</code></li>
            <li>Includes <code>aria-orientation</code> attribute</li>
            <li>Customizable <code>aria-label</code> for screen readers</li>
            <li>Follows WCAG 2.1 AA guidelines</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default LineComponentExamples;
