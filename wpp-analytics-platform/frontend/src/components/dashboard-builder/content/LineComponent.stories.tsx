import type { Meta, StoryObj } from '@storybook/react';
import {
  LineComponent,
  LineDivider,
  LineSeparator,
  SectionDivider,
  SubtleDivider,
  AccentDivider,
} from './LineComponent';

/**
 * LineComponent is a flexible divider/separator component that supports:
 * - Horizontal and vertical orientations
 * - Custom thickness, color, and style (solid/dashed/dotted)
 * - Adjustable length and spacing
 * - Opacity control
 * - Pre-configured variants for common use cases
 */
const meta = {
  title: 'Dashboard Builder/Content/LineComponent',
  component: LineComponent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A versatile line component for creating dividers and separators in dashboard layouts. Fully accessible with ARIA attributes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the line',
      table: {
        defaultValue: { summary: 'horizontal' },
      },
    },
    thickness: {
      control: { type: 'range', min: 1, max: 20, step: 1 },
      description: 'Thickness of the line in pixels',
      table: {
        defaultValue: { summary: 1 },
      },
    },
    color: {
      control: 'color',
      description: 'Color of the line (CSS color value)',
      table: {
        defaultValue: { summary: '#e5e7eb' },
      },
    },
    style: {
      control: 'radio',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Line style',
      table: {
        defaultValue: { summary: 'solid' },
      },
    },
    length: {
      control: 'text',
      description: 'Length of the line (e.g., "100%", "200px", "50vw")',
      table: {
        defaultValue: { summary: '100%' },
      },
    },
    margin: {
      control: 'text',
      description: 'Margin around the line (CSS margin value)',
      table: {
        defaultValue: { summary: '16px 0 (horizontal) or 0 16px (vertical)' },
      },
    },
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: 'Opacity of the line (0-1)',
      table: {
        defaultValue: { summary: 1 },
      },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label for screen readers',
      table: {
        defaultValue: { summary: 'Divider' },
      },
    },
  },
} satisfies Meta<typeof LineComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default horizontal divider with standard styling
 */
export const Default: Story = {
  args: {
    orientation: 'horizontal',
    thickness: 1,
    color: '#e5e7eb',
    style: 'solid',
    length: '100%',
    opacity: 1,
  },
};

/**
 * Thick horizontal divider
 */
export const ThickLine: Story = {
  args: {
    thickness: 5,
    color: '#3b82f6',
  },
};

/**
 * Dashed style divider
 */
export const DashedLine: Story = {
  args: {
    style: 'dashed',
    thickness: 2,
    color: '#6366f1',
  },
};

/**
 * Dotted style divider
 */
export const DottedLine: Story = {
  args: {
    style: 'dotted',
    thickness: 3,
    color: '#8b5cf6',
  },
};

/**
 * Partial width divider (50%)
 */
export const PartialWidth: Story = {
  args: {
    length: '50%',
    thickness: 2,
    color: '#10b981',
  },
};

/**
 * Vertical separator
 */
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    length: '200px',
    thickness: 2,
    color: '#3b82f6',
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', height: '250px' }}>
        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          Column 1
        </div>
        <Story />
        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          Column 2
        </div>
      </div>
    ),
  ],
};

/**
 * Semi-transparent divider
 */
export const SemiTransparent: Story = {
  args: {
    thickness: 2,
    color: '#3b82f6',
    opacity: 0.5,
  },
};

/**
 * Custom margin spacing
 */
export const CustomMargin: Story = {
  args: {
    margin: '48px 0',
    thickness: 2,
    color: '#10b981',
  },
};

/**
 * LineDivider variant - pre-configured for horizontal use
 */
export const LineDividerVariant: Story = {
  render: () => (
    <div>
      <p>Content above divider</p>
      <LineDivider />
      <p>Content below divider</p>
    </div>
  ),
};

/**
 * LineSeparator variant - pre-configured for vertical use
 */
export const LineSeparatorVariant: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100px' }}>
      <span>Left content</span>
      <LineSeparator length="60px" />
      <span>Right content</span>
    </div>
  ),
};

/**
 * SectionDivider variant - thicker line with more spacing
 */
export const SectionDividerVariant: Story = {
  render: () => (
    <div>
      <h3>Section 1</h3>
      <p>Content for section 1</p>
      <SectionDivider />
      <h3>Section 2</h3>
      <p>Content for section 2</p>
    </div>
  ),
};

/**
 * SubtleDivider variant - lighter and less prominent
 */
export const SubtleDividerVariant: Story = {
  render: () => (
    <div>
      <p>First paragraph</p>
      <SubtleDivider />
      <p>Second paragraph</p>
      <SubtleDivider />
      <p>Third paragraph</p>
    </div>
  ),
};

/**
 * AccentDivider variant - brand color emphasis
 */
export const AccentDividerVariant: Story = {
  render: () => (
    <div>
      <h2>Important Section</h2>
      <AccentDivider />
      <p>This section is highlighted with an accent divider</p>
    </div>
  ),
};

/**
 * Dashboard card layout with multiple dividers
 */
export const DashboardCard: Story = {
  render: () => (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
          Campaign Performance
        </h3>
        <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Last 30 days</p>
      </div>

      <SectionDivider />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Impressions</p>
          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>1.2M</p>
        </div>
        <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Clicks</p>
          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>45.2K</p>
        </div>
      </div>

      <SubtleDivider />

      <div style={{ padding: '24px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#6b7280' }}>Chart Component</p>
      </div>
    </div>
  ),
};

/**
 * Multi-column layout with vertical separators
 */
export const MultiColumn: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div style={{ flex: 1, padding: '24px', background: '#fef3c7', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 12px 0' }}>Column 1</h4>
        <p style={{ margin: 0, fontSize: '14px' }}>Content for the first column</p>
      </div>

      <LineSeparator length="120px" thickness={2} color="#f59e0b" />

      <div style={{ flex: 1, padding: '24px', background: '#dbeafe', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 12px 0' }}>Column 2</h4>
        <p style={{ margin: 0, fontSize: '14px' }}>Content for the second column</p>
      </div>

      <LineSeparator length="120px" thickness={2} color="#3b82f6" />

      <div style={{ flex: 1, padding: '24px', background: '#d1fae5', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 12px 0' }}>Column 3</h4>
        <p style={{ margin: 0, fontSize: '14px' }}>Content for the third column</p>
      </div>
    </div>
  ),
};

/**
 * All line styles comparison
 */
export const StyleComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Solid</p>
        <LineComponent style="solid" thickness={2} color="#3b82f6" />
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Dashed</p>
        <LineComponent style="dashed" thickness={2} color="#3b82f6" />
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Dotted</p>
        <LineComponent style="dotted" thickness={3} color="#3b82f6" />
      </div>
    </div>
  ),
};

/**
 * Opacity variations
 */
export const OpacityVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ marginBottom: '8px' }}>100% Opacity</p>
        <LineComponent opacity={1} thickness={2} color="#3b82f6" />
      </div>
      <div>
        <p style={{ marginBottom: '8px' }}>75% Opacity</p>
        <LineComponent opacity={0.75} thickness={2} color="#3b82f6" />
      </div>
      <div>
        <p style={{ marginBottom: '8px' }}>50% Opacity</p>
        <LineComponent opacity={0.5} thickness={2} color="#3b82f6" />
      </div>
      <div>
        <p style={{ marginBottom: '8px' }}>25% Opacity</p>
        <LineComponent opacity={0.25} thickness={2} color="#3b82f6" />
      </div>
    </div>
  ),
};

/**
 * Different colors
 */
export const ColorVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <LineComponent thickness={3} color="#ef4444" />
      <LineComponent thickness={3} color="#f59e0b" />
      <LineComponent thickness={3} color="#10b981" />
      <LineComponent thickness={3} color="#3b82f6" />
      <LineComponent thickness={3} color="#8b5cf6" />
      <LineComponent thickness={3} color="#ec4899" />
    </div>
  ),
};

/**
 * Playground for interactive testing
 */
export const Playground: Story = {
  args: {
    orientation: 'horizontal',
    thickness: 2,
    color: '#3b82f6',
    style: 'solid',
    length: '100%',
    margin: '16px 0',
    opacity: 1,
    ariaLabel: 'Interactive divider',
  },
};
