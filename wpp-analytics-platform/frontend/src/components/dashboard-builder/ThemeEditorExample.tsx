/**
 * Theme Editor Usage Example
 * Demonstrates how to integrate the ThemeEditor component
 */

import React, { useState } from 'react';
import { ThemeEditor } from './ThemeEditor';
import { Theme, ThemeManager } from '../../lib/themes';

/**
 * Example 1: Standalone Theme Editor
 */
export const StandaloneThemeEditor: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ThemeEditor
        onThemeChange={(theme) => {
          console.log('Theme changed:', theme);
        }}
      />
    </div>
  );
};

/**
 * Example 2: Theme Editor as Modal
 */
export const ModalThemeEditor: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(ThemeManager.getActiveTheme());

  return (
    <div>
      <div style={{ padding: '2rem' }}>
        <h1>My Dashboard</h1>
        <button
          onClick={() => setShowEditor(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: currentTheme.colors.primary,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Customize Theme
        </button>

        <div style={{ marginTop: '2rem' }}>
          <p>Current theme: {currentTheme.name}</p>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            {currentTheme.colors.chart.map((color, idx) => (
              <div
                key={idx}
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: color,
                  borderRadius: '0.5rem',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {showEditor && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 1000,
          }}
        >
          <ThemeEditor
            onThemeChange={(theme) => {
              setCurrentTheme(theme);
              console.log('Theme updated:', theme);
            }}
            onClose={() => setShowEditor(false)}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Example 3: Apply Theme on App Mount
 */
export const AppWithTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    // Apply saved theme on mount
    const savedTheme = ThemeManager.getActiveTheme();
    ThemeManager.applyThemeToDom(savedTheme);

    console.log('Applied theme:', savedTheme.name);
  }, []);

  return <>{children}</>;
};

/**
 * Example 4: Theme Switcher Dropdown
 */
export const ThemeSwitcher: React.FC = () => {
  const [themes] = useState<Theme[]>(ThemeManager.getAllThemes());
  const [activeTheme, setActiveTheme] = useState<Theme>(ThemeManager.getActiveTheme());

  const handleThemeChange = (themeId: string) => {
    const theme = ThemeManager.getTheme(themeId);
    if (theme) {
      ThemeManager.setActiveTheme(themeId);
      ThemeManager.applyThemeToDom(theme);
      setActiveTheme(theme);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        Select Theme:
      </label>
      <select
        value={activeTheme.id}
        onChange={(e) => handleThemeChange(e.target.value)}
        style={{
          padding: '0.625rem',
          fontSize: '0.875rem',
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          cursor: 'pointer',
          minWidth: '200px',
        }}
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name} {theme.isCustom ? '(Custom)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Example 5: Programmatic Theme Creation
 */
export const ProgrammaticThemeExample: React.FC = () => {
  const createBrandTheme = () => {
    const brandTheme: Theme = {
      id: ThemeManager.generateThemeId(),
      name: 'My Brand Theme',
      description: 'Custom theme matching brand guidelines',
      colors: {
        primary: '#FF6B35',
        primaryHover: '#E55A2B',
        primaryActive: '#CC4A21',
        secondary: '#4ECDC4',
        secondaryHover: '#3DB3AA',
        accent: '#FFE66D',
        background: '#FFFFFF',
        surface: '#F7F7F7',
        surfaceHover: '#EFEFEF',
        border: '#E0E0E0',
        text: '#2D3142',
        textSecondary: '#4F5D75',
        textMuted: '#8B95A8',
        success: '#06D6A0',
        warning: '#FFB627',
        error: '#EF476F',
        info: '#118AB2',
        chart: ['#FF6B35', '#4ECDC4', '#FFE66D', '#06D6A0', '#118AB2', '#EF476F', '#FFB627', '#9C89B8'],
      },
      typography: {
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
        headingFamily: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        weights: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeights: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '4rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      isCustom: true,
    };

    ThemeManager.saveTheme(brandTheme);
    ThemeManager.setActiveTheme(brandTheme.id);
    ThemeManager.applyThemeToDom(brandTheme);

    alert('Brand theme created and applied!');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button
        onClick={createBrandTheme}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#FF6B35',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 500,
        }}
      >
        Create Brand Theme
      </button>
    </div>
  );
};

/**
 * Example 6: Theme Export/Import
 */
export const ThemeImportExport: React.FC = () => {
  const handleExport = () => {
    const theme = ThemeManager.getActiveTheme();
    const json = ThemeManager.exportTheme(theme);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const theme = ThemeManager.importTheme(json);
        ThemeManager.saveTheme(theme);
        ThemeManager.setActiveTheme(theme.id);
        ThemeManager.applyThemeToDom(theme);
        alert(`Imported theme: ${theme.name}`);
      } catch (error) {
        alert('Invalid theme file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', gap: '1rem' }}>
      <button
        onClick={handleExport}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
        }}
      >
        Export Current Theme
      </button>
      <label
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--color-secondary)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          display: 'inline-block',
        }}
      >
        Import Theme
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

/**
 * Example 7: CSS Custom Properties Usage
 * After theme is applied, you can use CSS variables in your components
 */
export const ThemedComponent: React.FC = () => {
  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <h2
        style={{
          color: 'var(--color-primary)',
          marginBottom: 'var(--spacing-md)',
          fontFamily: 'var(--font-family-heading)',
        }}
      >
        Campaign Performance
      </h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Your campaigns are performing well this week.
      </p>
      <button
        style={{
          marginTop: 'var(--spacing-md)',
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
        }}
      >
        View Details
      </button>
    </div>
  );
};
