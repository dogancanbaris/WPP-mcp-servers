import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  LineComponent,
  LineDivider,
  LineSeparator,
  SectionDivider,
  SubtleDivider,
  AccentDivider,
} from './LineComponent';

describe('LineComponent', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<LineComponent />);
      const line = screen.getByRole('separator');
      expect(line).toBeInTheDocument();
      expect(line).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('renders with custom aria-label', () => {
      render(<LineComponent ariaLabel="Custom divider" />);
      const line = screen.getByLabelText('Custom divider');
      expect(line).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<LineComponent className="custom-class" />);
      const line = screen.getByRole('separator');
      expect(line).toHaveClass('line-component', 'custom-class');
    });
  });

  describe('Horizontal Lines', () => {
    it('renders horizontal line with default styles', () => {
      render(<LineComponent />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        width: '100%',
        height: '1px',
        borderTop: '1px solid #e5e7eb',
        margin: '16px 0',
        opacity: 1,
      });
    });

    it('renders horizontal line with custom thickness', () => {
      render(<LineComponent thickness={5} />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        height: '5px',
        borderTop: '5px solid #e5e7eb',
      });
    });

    it('renders horizontal line with custom color', () => {
      render(<LineComponent color="#3b82f6" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        borderTop: '1px solid #3b82f6',
      });
    });

    it('renders horizontal line with custom length', () => {
      render(<LineComponent length="50%" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        width: '50%',
      });
    });

    it('renders horizontal line with numeric length', () => {
      render(<LineComponent length={200} />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        width: '200px',
      });
    });
  });

  describe('Vertical Lines', () => {
    it('renders vertical line with default styles', () => {
      render(<LineComponent orientation="vertical" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveAttribute('aria-orientation', 'vertical');
      expect(line).toHaveStyle({
        width: '1px',
        height: '100%',
        borderLeft: '1px solid #e5e7eb',
        margin: '0 16px',
        opacity: 1,
      });
    });

    it('renders vertical line with custom thickness', () => {
      render(<LineComponent orientation="vertical" thickness={3} />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        width: '3px',
        borderLeft: '3px solid #e5e7eb',
      });
    });

    it('renders vertical line with custom length', () => {
      render(<LineComponent orientation="vertical" length="200px" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        height: '200px',
      });
    });
  });

  describe('Line Styles', () => {
    it('renders solid line style', () => {
      render(<LineComponent style="solid" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        borderTop: '1px solid #e5e7eb',
      });
    });

    it('renders dashed line style', () => {
      render(<LineComponent style="dashed" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        borderTop: '1px dashed #e5e7eb',
      });
    });

    it('renders dotted line style', () => {
      render(<LineComponent style="dotted" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        borderTop: '1px dotted #e5e7eb',
      });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom margin', () => {
      render(<LineComponent margin="32px 0" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        margin: '32px 0',
      });
    });

    it('applies custom opacity', () => {
      render(<LineComponent opacity={0.5} />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        opacity: 0.5,
      });
    });

    it('combines multiple custom styles', () => {
      render(
        <LineComponent
          orientation="horizontal"
          thickness={3}
          color="#10b981"
          style="dashed"
          length="75%"
          margin="24px 0"
          opacity={0.8}
        />
      );
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        width: '75%',
        height: '3px',
        borderTop: '3px dashed #10b981',
        margin: '24px 0',
        opacity: 0.8,
      });
    });
  });

  describe('Pre-configured Variants', () => {
    it('renders LineDivider as horizontal', () => {
      render(<LineDivider />);
      const line = screen.getByRole('separator');

      expect(line).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('renders LineSeparator as vertical', () => {
      render(<LineSeparator />);
      const line = screen.getByRole('separator');

      expect(line).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('renders SectionDivider with thicker line and more spacing', () => {
      render(<SectionDivider />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        height: '2px',
        borderTop: '2px solid #e5e7eb',
        margin: '32px 0',
      });
    });

    it('renders SubtleDivider with lighter color and less spacing', () => {
      render(<SubtleDivider />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        borderTop: '1px solid #f3f4f6',
        margin: '8px 0',
        opacity: 0.6,
      });
    });

    it('renders AccentDivider with brand color', () => {
      render(<AccentDivider />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        height: '2px',
        borderTop: '2px solid #3b82f6',
      });
    });

    it('allows variant props to be overridden', () => {
      render(<SectionDivider color="#ff0000" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        borderTop: '2px solid #ff0000',
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(<LineComponent />);
      const line = screen.getByRole('separator');

      expect(line).toHaveAttribute('role', 'separator');
    });

    it('has correct aria-orientation for horizontal', () => {
      render(<LineComponent orientation="horizontal" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('has correct aria-orientation for vertical', () => {
      render(<LineComponent orientation="vertical" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('has default aria-label', () => {
      render(<LineComponent />);
      const line = screen.getByLabelText('Divider');

      expect(line).toBeInTheDocument();
    });

    it('accepts custom aria-label', () => {
      render(<LineComponent ariaLabel="Section separator" />);
      const line = screen.getByLabelText('Section separator');

      expect(line).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero thickness gracefully', () => {
      render(<LineComponent thickness={0} />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        height: '0px',
        borderTop: '0px solid #e5e7eb',
      });
    });

    it('handles very large thickness', () => {
      render(<LineComponent thickness={100} />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        height: '100px',
        borderTop: '100px solid #e5e7eb',
      });
    });

    it('handles zero opacity', () => {
      render(<LineComponent opacity={0} />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        opacity: 0,
      });
    });

    it('handles CSS color names', () => {
      render(<LineComponent color="red" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        borderTop: '1px solid red',
      });
    });

    it('handles RGB color values', () => {
      render(<LineComponent color="rgb(255, 0, 0)" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        borderTop: '1px solid rgb(255, 0, 0)',
      });
    });

    it('handles RGBA color values', () => {
      render(<LineComponent color="rgba(255, 0, 0, 0.5)" />);
      const line = screen.getByRole('separator');

      expect(line).toHaveStyle({
        borderTop: '1px solid rgba(255, 0, 0, 0.5)',
      });
    });
  });
});
