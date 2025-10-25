/**
 * Theme Editor Component
 * Provides visual interface for customizing dashboard themes
 */

import React, { useState, useEffect } from 'react';
import {
  Theme,
  ThemeManager,
  COLOR_PALETTES,
  FONT_FAMILIES,
  SPACING_PRESETS,
  DEFAULT_THEMES,
} from '../../lib/themes';

interface ThemeEditorProps {
  onThemeChange?: (theme: Theme) => void;
  onClose?: () => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ onThemeChange, onClose }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(ThemeManager.getActiveTheme());
  const [allThemes, setAllThemes] = useState<Theme[]>(ThemeManager.getAllThemes());
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'effects'>('colors');
  const [themeName, setThemeName] = useState(currentTheme.name);
  const [themeDescription, setThemeDescription] = useState(currentTheme.description);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    ThemeManager.applyThemeToDom(currentTheme);
  }, [currentTheme]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleColorChange = (colorKey: keyof Theme['colors'], value: string) => {
    setCurrentTheme({
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        [colorKey]: value,
      },
    });
  };

  const handlePaletteSelect = (paletteKey: string) => {
    setCurrentTheme({
      ...currentTheme,
      colors: COLOR_PALETTES[paletteKey],
    });
  };

  const handleFontFamilyChange = (fontKey: string) => {
    const font = FONT_FAMILIES[fontKey as keyof typeof FONT_FAMILIES];
    setCurrentTheme({
      ...currentTheme,
      typography: {
        ...currentTheme.typography,
        fontFamily: font.value,
        headingFamily: font.value,
      },
    });
  };

  const handleSpacingPresetChange = (presetKey: string) => {
    setCurrentTheme({
      ...currentTheme,
      spacing: SPACING_PRESETS[presetKey],
    });
  };

  const handleBorderRadiusChange = (key: keyof Theme['borderRadius'], value: string) => {
    setCurrentTheme({
      ...currentTheme,
      borderRadius: {
        ...currentTheme.borderRadius,
        [key]: value,
      },
    });
  };

  const handleSaveTheme = () => {
    try {
      const themeToSave: Theme = {
        ...currentTheme,
        id: currentTheme.isCustom ? currentTheme.id : ThemeManager.generateThemeId(),
        name: themeName,
        description: themeDescription,
      };

      ThemeManager.saveTheme(themeToSave);
      ThemeManager.setActiveTheme(themeToSave.id);
      setAllThemes(ThemeManager.getAllThemes());
      setShowSaveDialog(false);
      showMessage('success', 'Theme saved successfully!');
      onThemeChange?.(themeToSave);
    } catch (error) {
      showMessage('error', 'Failed to save theme');
    }
  };

  const handleLoadTheme = (themeId: string) => {
    const theme = ThemeManager.getTheme(themeId);
    if (theme) {
      setCurrentTheme(theme);
      setThemeName(theme.name);
      setThemeDescription(theme.description);
      ThemeManager.setActiveTheme(themeId);
      showMessage('success', `Loaded theme: ${theme.name}`);
      onThemeChange?.(theme);
    }
  };

  const handleDeleteTheme = (themeId: string) => {
    if (window.confirm('Are you sure you want to delete this theme?')) {
      try {
        ThemeManager.deleteTheme(themeId);
        setAllThemes(ThemeManager.getAllThemes());
        showMessage('success', 'Theme deleted successfully');
      } catch (error) {
        showMessage('error', 'Failed to delete theme');
      }
    }
  };

  const handleExportTheme = () => {
    const json = ThemeManager.exportTheme(currentTheme);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('success', 'Theme exported successfully');
  };

  const handleImportTheme = () => {
    try {
      const theme = ThemeManager.importTheme(importJson);
      setCurrentTheme(theme);
      setThemeName(theme.name);
      setThemeDescription(theme.description);
      setShowImportDialog(false);
      setImportJson('');
      showMessage('success', 'Theme imported successfully');
    } catch (error) {
      showMessage('error', 'Invalid theme JSON');
    }
  };

  const handleDuplicateTheme = () => {
    const duplicated = ThemeManager.duplicateTheme(currentTheme, `${currentTheme.name} Copy`);
    setCurrentTheme(duplicated);
    setThemeName(duplicated.name);
    setThemeDescription(duplicated.description);
    showMessage('success', 'Theme duplicated');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset to default WPP theme? Unsaved changes will be lost.')) {
      const defaultTheme = DEFAULT_THEMES['wpp-default'];
      setCurrentTheme(defaultTheme);
      setThemeName(defaultTheme.name);
      setThemeDescription(defaultTheme.description);
      showMessage('success', 'Reset to default theme');
    }
  };

  return (
    <div className="theme-editor" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Theme Editor</h2>
          <p style={styles.subtitle}>Customize your dashboard appearance</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={handleExportTheme} style={styles.secondaryButton}>
            Export
          </button>
          <button onClick={() => setShowImportDialog(true)} style={styles.secondaryButton}>
            Import
          </button>
          <button onClick={() => setShowSaveDialog(true)} style={styles.primaryButton}>
            Save Theme
          </button>
          {onClose && (
            <button onClick={onClose} style={styles.closeButton}>
              Close
            </button>
          )}
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          style={{
            ...styles.message,
            backgroundColor: message.type === 'success' ? '#10B981' : '#EF4444',
          }}
        >
          {message.text}
        </div>
      )}

      <div style={styles.content}>
        {/* Sidebar - Theme List */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Themes</h3>
          <div style={styles.themeList}>
            {allThemes.map((theme) => (
              <div
                key={theme.id}
                style={{
                  ...styles.themeItem,
                  backgroundColor:
                    currentTheme.id === theme.id ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: currentTheme.id === theme.id ? '#FFFFFF' : 'var(--color-text)',
                }}
                onClick={() => handleLoadTheme(theme.id)}
              >
                <div style={styles.themeItemContent}>
                  <div style={styles.themeItemName}>{theme.name}</div>
                  {theme.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTheme(theme.id);
                      }}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div style={styles.colorPreview}>
                  {theme.colors.chart.slice(0, 5).map((color, idx) => (
                    <div
                      key={idx}
                      style={{
                        ...styles.colorPreviewSwatch,
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={styles.sidebarActions}>
            <button onClick={handleDuplicateTheme} style={styles.sidebarButton}>
              Duplicate Current
            </button>
            <button onClick={handleResetToDefault} style={styles.sidebarButton}>
              Reset to Default
            </button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div style={styles.editor}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {(['colors', 'typography', 'spacing', 'effects'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.tab,
                  backgroundColor: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab ? '#FFFFFF' : 'var(--color-text)',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            {activeTab === 'colors' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Color Palette</h3>

                {/* Preset Palettes */}
                <div style={styles.subsection}>
                  <label style={styles.label}>Preset Palettes</label>
                  <div style={styles.paletteGrid}>
                    {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
                      <div
                        key={key}
                        onClick={() => handlePaletteSelect(key)}
                        style={{
                          ...styles.paletteCard,
                          border:
                            currentTheme.colors.primary === palette.primary
                              ? '2px solid var(--color-primary)'
                              : '1px solid var(--color-border)',
                        }}
                      >
                        <div style={styles.paletteName}>
                          {key
                            .split('-')
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ')}
                        </div>
                        <div style={styles.paletteColors}>
                          {palette.chart.slice(0, 6).map((color, idx) => (
                            <div
                              key={idx}
                              style={{
                                ...styles.paletteSwatch,
                                backgroundColor: color,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Colors */}
                <div style={styles.subsection}>
                  <label style={styles.label}>Custom Colors</label>
                  <div style={styles.colorGrid}>
                    {Object.entries(currentTheme.colors)
                      .filter(([key]) => !key.startsWith('chart'))
                      .map(([key, value]) => (
                        <div key={key} style={styles.colorInput}>
                          <label style={styles.colorLabel}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <div style={styles.colorInputWrapper}>
                            <input
                              type="color"
                              value={value as string}
                              onChange={(e) =>
                                handleColorChange(key as keyof Theme['colors'], e.target.value)
                              }
                              style={styles.colorPicker}
                            />
                            <input
                              type="text"
                              value={value as string}
                              onChange={(e) =>
                                handleColorChange(key as keyof Theme['colors'], e.target.value)
                              }
                              style={styles.colorHex}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Typography</h3>

                {/* Font Family */}
                <div style={styles.subsection}>
                  <label style={styles.label}>Font Family</label>
                  <div style={styles.fontGrid}>
                    {Object.entries(FONT_FAMILIES).map(([key, font]) => (
                      <button
                        key={key}
                        onClick={() => handleFontFamilyChange(key)}
                        style={{
                          ...styles.fontCard,
                          border:
                            currentTheme.typography.fontFamily === font.value
                              ? '2px solid var(--color-primary)'
                              : '1px solid var(--color-border)',
                        }}
                      >
                        <div style={{ fontFamily: font.value, fontSize: '1.125rem' }}>
                          {font.name}
                        </div>
                        <div
                          style={{
                            fontFamily: font.value,
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          The quick brown fox
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div style={styles.subsection}>
                  <label style={styles.label}>Preview</label>
                  <div style={styles.typographyPreview}>
                    <h1 style={{ fontSize: currentTheme.typography.sizes['4xl'] }}>
                      Heading 1 - Dashboard Performance
                    </h1>
                    <h2 style={{ fontSize: currentTheme.typography.sizes['3xl'] }}>
                      Heading 2 - Key Metrics Overview
                    </h2>
                    <h3 style={{ fontSize: currentTheme.typography.sizes['2xl'] }}>
                      Heading 3 - Campaign Analysis
                    </h3>
                    <p style={{ fontSize: currentTheme.typography.sizes.base }}>
                      Body text - This is how your regular content will appear in the dashboard.
                      It should be easy to read and comfortable for extended viewing sessions.
                    </p>
                    <p
                      style={{
                        fontSize: currentTheme.typography.sizes.sm,
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Small text - Additional information and metadata
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'spacing' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Spacing</h3>

                {/* Spacing Presets */}
                <div style={styles.subsection}>
                  <label style={styles.label}>Spacing Preset</label>
                  <div style={styles.presetGrid}>
                    {Object.entries(SPACING_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        onClick={() => handleSpacingPresetChange(key)}
                        style={{
                          ...styles.presetCard,
                          border:
                            currentTheme.spacing.md === preset.md
                              ? '2px solid var(--color-primary)'
                              : '1px solid var(--color-border)',
                        }}
                      >
                        <div style={styles.presetName}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </div>
                        <div style={styles.spacingVisual}>
                          <div
                            style={{
                              width: '100%',
                              height: '8px',
                              backgroundColor: 'var(--color-primary)',
                              marginBottom: preset.sm,
                            }}
                          />
                          <div
                            style={{
                              width: '100%',
                              height: '8px',
                              backgroundColor: 'var(--color-primary)',
                              marginBottom: preset.md,
                            }}
                          />
                          <div
                            style={{
                              width: '100%',
                              height: '8px',
                              backgroundColor: 'var(--color-primary)',
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div style={styles.subsection}>
                  <label style={styles.label}>Border Radius</label>
                  <div style={styles.radiusGrid}>
                    {Object.entries(currentTheme.borderRadius).map(([key, value]) => (
                      <div key={key} style={styles.radiusInput}>
                        <label style={styles.colorLabel}>{key}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleBorderRadiusChange(
                              key as keyof Theme['borderRadius'],
                              e.target.value
                            )
                          }
                          style={styles.input}
                        />
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: 'var(--color-primary)',
                            borderRadius: value,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'effects' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Effects & Shadows</h3>

                {/* Shadow Preview */}
                <div style={styles.subsection}>
                  <label style={styles.label}>Shadow Levels</label>
                  <div style={styles.shadowGrid}>
                    {Object.entries(currentTheme.shadows).map(([key, value]) => (
                      <div key={key} style={styles.shadowCard}>
                        <div
                          style={{
                            ...styles.shadowPreview,
                            boxShadow: value,
                          }}
                        >
                          {key.toUpperCase()}
                        </div>
                        <code style={styles.shadowValue}>{value}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Cards */}
                <div style={styles.subsection}>
                  <label style={styles.label}>Component Preview</label>
                  <div style={styles.componentPreview}>
                    <div style={styles.previewCard}>
                      <h4>Dashboard Card</h4>
                      <p>Total Revenue: $125,432</p>
                      <button style={styles.previewButton}>View Details</button>
                    </div>
                    <div style={styles.previewCard}>
                      <h4>Campaign Stats</h4>
                      <p>Impressions: 1.2M</p>
                      <button style={styles.previewButton}>Analyze</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Save Theme</h3>
            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Theme Name</label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  style={styles.input}
                  placeholder="My Custom Theme"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                  style={{ ...styles.input, minHeight: '80px' }}
                  placeholder="A brief description of your theme..."
                />
              </div>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowSaveDialog(false)} style={styles.secondaryButton}>
                Cancel
              </button>
              <button onClick={handleSaveTheme} style={styles.primaryButton}>
                Save Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Import Theme</h3>
            <div style={styles.modalBody}>
              <label style={styles.label}>Paste Theme JSON</label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                style={{ ...styles.input, minHeight: '200px', fontFamily: 'monospace' }}
                placeholder='{"id": "custom-theme", "name": "My Theme", ...}'
              />
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowImportDialog(false)} style={styles.secondaryButton}>
                Cancel
              </button>
              <button onClick={handleImportTheme} style={styles.primaryButton}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background)',
    fontFamily: 'var(--font-family)',
    position: 'relative',
  },
  header: {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface)',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  subtitle: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  primaryButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'var(--color-primary)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  closeButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  sidebar: {
    width: '280px',
    borderRight: '1px solid var(--color-border)',
    padding: '1.5rem',
    overflowY: 'auto',
    backgroundColor: 'var(--color-surface)',
  },
  sidebarTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  themeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  themeItem: {
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  themeItemContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  themeItemName: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  deleteButton: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  },
  colorPreview: {
    display: 'flex',
    gap: '2px',
  },
  colorPreviewSwatch: {
    width: '24px',
    height: '4px',
    borderRadius: '2px',
  },
  sidebarActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sidebarButton: {
    padding: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  editor: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem 2rem 0 2rem',
    borderBottom: '1px solid var(--color-border)',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: 'none',
    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabContent: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
  section: {
    maxWidth: '1200px',
  },
  sectionTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  subsection: {
    marginBottom: '2rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  paletteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  paletteCard: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'var(--color-surface)',
  },
  paletteName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '0.75rem',
    color: 'var(--color-text)',
  },
  paletteColors: {
    display: 'flex',
    gap: '4px',
  },
  paletteSwatch: {
    flex: 1,
    height: '32px',
    borderRadius: 'var(--radius-sm)',
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  colorInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  colorLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textTransform: 'capitalize',
  },
  colorInputWrapper: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  colorPicker: {
    width: '48px',
    height: '48px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
  },
  colorHex: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '0.875rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'monospace',
  },
  fontGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  fontCard: {
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'var(--color-surface)',
    textAlign: 'left',
  },
  typographyPreview: {
    padding: '2rem',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  presetCard: {
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'var(--color-surface)',
  },
  presetName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '1rem',
    color: 'var(--color-text)',
  },
  spacingVisual: {
    display: 'flex',
    flexDirection: 'column',
  },
  radiusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  radiusInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },
  input: {
    padding: '0.625rem',
    fontSize: '0.875rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  },
  shadowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  shadowCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  shadowPreview: {
    padding: '2rem',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  shadowValue: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  componentPreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  previewCard: {
    padding: '1.5rem',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--color-border)',
  },
  previewButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--color-primary)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: 'var(--shadow-xl)',
  },
  modalTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  modalBody: {
    marginBottom: '1.5rem',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  message: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    padding: '1rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    color: '#FFFFFF',
    fontWeight: 500,
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1001,
    animation: 'slideIn 0.3s ease-out',
  },
};

export default ThemeEditor;
