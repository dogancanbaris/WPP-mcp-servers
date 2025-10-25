import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TitleComponent, TitlePresets } from './TitleComponent';

describe('TitleComponent', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<TitleComponent />);
      const heading = screen.getByRole('textbox');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Add title here...');
    });

    it('renders with custom text', () => {
      render(<TitleComponent text="Custom Title" />);
      const heading = screen.getByText('Custom Title');
      expect(heading).toBeInTheDocument();
    });

    it('renders correct heading level', () => {
      const { container } = render(
        <TitleComponent text="Test" headingLevel="h3" />
      );
      const h3 = container.querySelector('h3');
      expect(h3).toBeInTheDocument();
      expect(h3).toHaveTextContent('Test');
    });

    it('renders all heading levels correctly', () => {
      const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

      levels.forEach((level) => {
        const { container } = render(
          <TitleComponent text={`${level} text`} headingLevel={level} />
        );
        const heading = container.querySelector(level);
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(`${level} text`);
      });
    });

    it('applies placeholder when text is empty', () => {
      render(
        <TitleComponent text="" placeholder="Enter title here" editable={true} />
      );
      const heading = screen.getByText('Enter title here');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('opacity-60');
    });
  });

  describe('Styling', () => {
    it('applies font size correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" fontSize="32" />
      );
      const heading = container.querySelector('h2');
      expect(heading).toHaveStyle({ fontSize: '32px' });
    });

    it('applies font weight correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" fontWeight="700" />
      );
      const heading = container.querySelector('h2');
      expect(heading).toHaveStyle({ fontWeight: '700' });
    });

    it('applies color correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" color="#FF0000" />
      );
      const heading = container.querySelector('h2');
      expect(heading).toHaveStyle({ color: '#FF0000' });
    });

    it('applies text alignment correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" alignment="center" />
      );
      const heading = container.querySelector('h2');
      expect(heading).toHaveStyle({ textAlign: 'center' });
    });

    it('applies font family correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" fontFamily="Georgia, serif" />
      );
      const heading = container.querySelector('h2');
      expect(heading).toHaveStyle({ fontFamily: 'Georgia, serif' });
    });

    it('applies background color correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" backgroundColor="#F0F0F0" />
      );
      const wrapper = container.querySelector('div');
      expect(wrapper).toHaveStyle({ backgroundColor: '#F0F0F0' });
    });

    it('applies border when showBorder is true', () => {
      const { container } = render(
        <TitleComponent
          text="Test"
          showBorder={true}
          borderColor="#000000"
          borderWidth={2}
        />
      );
      const wrapper = container.querySelector('div');
      expect(wrapper).toHaveStyle({ border: '2px solid #000000' });
    });

    it('does not apply border when showBorder is false', () => {
      const { container } = render(
        <TitleComponent text="Test" showBorder={false} />
      );
      const wrapper = container.querySelector('div');
      expect(wrapper).toHaveStyle({ border: 'none' });
    });

    it('applies border radius correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" borderRadius={8} />
      );
      const wrapper = container.querySelector('div');
      expect(wrapper).toHaveStyle({ borderRadius: '8px' });
    });

    it('applies padding correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" padding={16} />
      );
      const wrapper = container.querySelector('div');
      expect(wrapper).toHaveStyle({ padding: '16px' });
    });

    it('applies shadow when showShadow is true', () => {
      const { container } = render(
        <TitleComponent
          text="Test"
          showShadow={true}
          shadowColor="#000000"
          shadowBlur={10}
        />
      );
      const wrapper = container.querySelector('div');
      expect(wrapper).toHaveStyle({ boxShadow: '0 0 10px #000000' });
    });
  });

  describe('Editing', () => {
    it('enters edit mode on click when editable', async () => {
      const user = userEvent.setup();
      render(<TitleComponent text="Edit me" editable={true} />);

      const heading = screen.getByText('Edit me');
      await user.click(heading);

      expect(heading).toHaveAttribute('contenteditable', 'true');
    });

    it('does not enter edit mode when not editable', async () => {
      const user = userEvent.setup();
      render(<TitleComponent text="No edit" editable={false} />);

      const heading = screen.getByText('No edit');
      await user.click(heading);

      expect(heading).not.toHaveAttribute('contenteditable');
    });

    it('calls onTextChange when text is edited and saved', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(
        <TitleComponent
          text="Original"
          editable={true}
          onTextChange={handleChange}
        />
      );

      const heading = screen.getByText('Original');
      await user.click(heading);

      // Simulate text input
      fireEvent.input(heading, { target: { textContent: 'Modified' } });

      // Press Enter to save
      fireEvent.keyDown(heading, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('Modified');
      });
    });

    it('saves on Enter key press', async () => {
      const handleChange = jest.fn();
      render(
        <TitleComponent
          text="Test"
          editable={true}
          onTextChange={handleChange}
        />
      );

      const heading = screen.getByRole('textbox');
      fireEvent.click(heading);
      fireEvent.input(heading, { target: { textContent: 'New text' } });
      fireEvent.keyDown(heading, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('New text');
      });
    });

    it('cancels on Escape key press', async () => {
      const handleChange = jest.fn();
      const { container } = render(
        <TitleComponent
          text="Original"
          editable={true}
          onTextChange={handleChange}
        />
      );

      const heading = container.querySelector('h2');
      if (heading) {
        fireEvent.click(heading);
        fireEvent.input(heading, { target: { textContent: 'Modified' } });
        fireEvent.keyDown(heading, { key: 'Escape' });
      }

      expect(handleChange).not.toHaveBeenCalled();
      expect(heading).toHaveTextContent('Original');
    });

    it('displays editing hint when in edit mode', async () => {
      const user = userEvent.setup();
      render(<TitleComponent text="Test" editable={true} />);

      const heading = screen.getByText('Test');
      await user.click(heading);

      expect(screen.getByText(/Press Enter to save/i)).toBeInTheDocument();
    });

    it('hides editing hint when not in edit mode', () => {
      render(<TitleComponent text="Test" editable={true} />);
      expect(screen.queryByText(/Press Enter to save/i)).not.toBeInTheDocument();
    });
  });

  describe('Presets', () => {
    it('applies pageHeader preset correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" {...TitlePresets.pageHeader} />
      );
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveStyle({
        fontSize: '32px',
        fontWeight: '700',
        textAlign: 'left',
      });
    });

    it('applies sectionTitle preset correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" {...TitlePresets.sectionTitle} />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveStyle({
        fontSize: '24px',
        fontWeight: '600',
      });
    });

    it('applies centeredHero preset correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" {...TitlePresets.centeredHero} />
      );
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveStyle({
        fontSize: '48px',
        fontWeight: '800',
        textAlign: 'center',
      });
    });

    it('applies highlight preset correctly', () => {
      const { container } = render(
        <TitleComponent text="Test" {...TitlePresets.highlight} />
      );
      const heading = container.querySelector('h2');
      const wrapper = container.querySelector('div');

      expect(heading).toHaveStyle({
        fontSize: '28px',
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
      });

      expect(wrapper).toHaveStyle({
        backgroundColor: '#1A73E8',
        borderRadius: '8px',
        padding: '16px',
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role when editable', () => {
      render(<TitleComponent text="Test" editable={true} />);
      const heading = screen.getByRole('textbox');
      expect(heading).toBeInTheDocument();
    });

    it('has correct ARIA label when editable', () => {
      render(<TitleComponent text="Test" editable={true} />);
      const heading = screen.getByLabelText('Editable title');
      expect(heading).toBeInTheDocument();
    });

    it('does not have textbox role when not editable', () => {
      render(<TitleComponent text="Test" editable={false} />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('uses semantic HTML heading tags', () => {
      const { container } = render(
        <TitleComponent text="Test" headingLevel="h1" />
      );
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1?.tagName).toBe('H1');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty text with placeholder', () => {
      render(
        <TitleComponent
          text=""
          placeholder="Custom placeholder"
          editable={true}
        />
      );
      expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
    });

    it('handles very long text', () => {
      const longText = 'A'.repeat(1000);
      const { container } = render(<TitleComponent text={longText} />);
      const heading = container.querySelector('h2');
      expect(heading).toHaveTextContent(longText);
      expect(heading).toHaveStyle({ wordWrap: 'break-word' });
    });

    it('handles special characters in text', () => {
      const specialText = '<script>alert("xss")</script>';
      render(<TitleComponent text={specialText} />);
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('trims whitespace on save', async () => {
      const handleChange = jest.fn();
      const { container } = render(
        <TitleComponent
          text="Test"
          editable={true}
          onTextChange={handleChange}
        />
      );

      const heading = container.querySelector('h2');
      if (heading) {
        fireEvent.click(heading);
        fireEvent.input(heading, { target: { textContent: '  Trimmed  ' } });
        fireEvent.keyDown(heading, { key: 'Enter' });
      }

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('Trimmed');
      });
    });

    it('uses placeholder when text becomes empty', () => {
      const { container } = render(
        <TitleComponent
          text=""
          placeholder="Empty state"
          editable={true}
        />
      );

      const heading = container.querySelector('h2');
      expect(heading).toHaveTextContent('Empty state');
    });
  });

  describe('Display Name', () => {
    it('has correct display name for debugging', () => {
      expect(TitleComponent.displayName).toBe('TitleComponent');
    });
  });
});
