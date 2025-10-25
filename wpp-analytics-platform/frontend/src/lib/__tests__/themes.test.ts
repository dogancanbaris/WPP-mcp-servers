/**
 * Theme System Test Suite
 * Tests for theme management, storage, and application
 */

import { Theme, ThemeManager, COLOR_PALETTES, DEFAULT_THEMES, FONT_FAMILIES } from '../themes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Theme System', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('ThemeManager.getAllThemes', () => {
    it('should return default themes when no custom themes exist', () => {
      const themes = ThemeManager.getAllThemes();
      expect(themes.length).toBeGreaterThanOrEqual(2); // At least wpp-default and dark-mode
      expect(themes.some(t => t.id === 'wpp-default')).toBe(true);
      expect(themes.some(t => t.id === 'dark-mode')).toBe(true);
    });

    it('should include custom themes when they exist', () => {
      const customTheme: Theme = {
        ...DEFAULT_THEMES['wpp-default'],
        id: 'custom-123',
        name: 'Custom Theme',
        isCustom: true,
      };

      ThemeManager.saveTheme(customTheme);
      const themes = ThemeManager.getAllThemes();

      expect(themes.some(t => t.id === 'custom-123')).toBe(true);
    });
  });

  describe('ThemeManager.getTheme', () => {
    it('should return a default theme by ID', () => {
      const theme = ThemeManager.getTheme('wpp-default');
      expect(theme).not.toBeNull();
      expect(theme?.name).toBe('WPP Default');
    });

    it('should return null for non-existent theme', () => {
      const theme = ThemeManager.getTheme('non-existent');
      expect(theme).toBeNull();
    });

    it('should return custom theme by ID', () => {
      const customTheme: Theme = {
        ...DEFAULT_THEMES['wpp-default'],
        id: 'custom-456',
        name: 'Test Theme',
        isCustom: true,
      };

      ThemeManager.saveTheme(customTheme);
      const retrieved = ThemeManager.getTheme('custom-456');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Test Theme');
    });
  });

  describe('ThemeManager.saveTheme', () => {
    it('should save a new custom theme', () => {
      const theme: Theme = {
        ...DEFAULT_THEMES['wpp-default'],
        id: 'custom-789',
        name: 'New Theme',
      };

      ThemeManager.saveTheme(theme);
      const saved = ThemeManager.getTheme('custom-789');

      expect(saved).not.toBeNull();
      expect(saved?.isCustom).toBe(true);
      expect(saved?.createdAt).toBeDefined();
    });

    it('should update existing theme', () => {
      const theme: Theme = {
        ...DEFAULT_THEMES['wpp-default'],
        id: 'custom-update',
        name: 'Original Name',
      };

      ThemeManager.saveTheme(theme);

      const updated = {
        ...theme,
        name: 'Updated Name',
      };

      ThemeManager.saveTheme(updated);
      const saved = ThemeManager.getTheme('custom-update');

      expect(saved?.name).toBe('Updated Name');
    });

    it('should set timestamps on save', () => {
      const theme: Theme = {
        ...DEFAULT_THEMES['wpp-default'],
        id: 'custom-timestamp',
        name: 'Timestamp Test',
      };

      ThemeManager.saveTheme(theme);
      const saved = ThemeManager.getTheme('custom-timestamp');

      expect(saved?.createdAt).toBeDefined();
      expect(saved?.updatedAt).toBeDefined();
    });
  });

  describe('ThemeManager.deleteTheme', () => {
    it('should delete a custom theme', () => {
      const theme: Theme = {
        ...DEFAULT_THEMES['wpp-default'],
        id: 'custom-delete',
        name: 'Delete Me',
      };

      ThemeManager.saveTheme(theme);
      expect(ThemeManager.getTheme('custom-delete')).not.toBeNull();

      ThemeManager.deleteTheme('custom-delete');
      expect(ThemeManager.getTheme('custom-delete')).toBeNull();
    });

    it('should not throw when deleting non-existent theme', () => {
      expect(() => {
        ThemeManager.deleteTheme('non-existent');
      }).not.toThrow();
    });
  });

  describe('ThemeManager.getActiveTheme', () => {
    it('should return default theme when no active theme is set', () => {
      const theme = ThemeManager.getActiveTheme();
      expect(theme.id).toBe('wpp-default');
    });

    it('should return active theme when set', () => {
      ThemeManager.setActiveTheme('dark-mode');
      const theme = ThemeManager.getActiveTheme();
      expect(theme.id).toBe('dark-mode');
    });

    it('should return default theme when active theme is deleted', () => {
      const customTheme: Theme = {
        ...DEFAULT_THEMES['wpp-default'],
        id: 'custom-active',
        name: 'Active Theme',
      };

      ThemeManager.saveTheme(customTheme);
      ThemeManager.setActiveTheme('custom-active');
      ThemeManager.deleteTheme('custom-active');

      const theme = ThemeManager.getActiveTheme();
      expect(theme.id).toBe('wpp-default');
    });
  });

  describe('ThemeManager.exportTheme', () => {
    it('should export theme as JSON string', () => {
      const theme = DEFAULT_THEMES['wpp-default'];
      const json = ThemeManager.exportTheme(theme);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed.id).toBe('wpp-default');
      expect(parsed.name).toBe('WPP Default');
    });

    it('should export all theme properties', () => {
      const theme = DEFAULT_THEMES['wpp-default'];
      const json = ThemeManager.exportTheme(theme);
      const parsed = JSON.parse(json);

      expect(parsed.colors).toBeDefined();
      expect(parsed.typography).toBeDefined();
      expect(parsed.spacing).toBeDefined();
      expect(parsed.borderRadius).toBeDefined();
      expect(parsed.shadows).toBeDefined();
    });
  });

  describe('ThemeManager.importTheme', () => {
    it('should import valid theme JSON', () => {
      const theme = DEFAULT_THEMES['wpp-default'];
      const json = ThemeManager.exportTheme(theme);
      const imported = ThemeManager.importTheme(json);

      expect(imported.id).toBe(theme.id);
      expect(imported.name).toBe(theme.name);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        ThemeManager.importTheme('invalid json');
      }).toThrow();
    });

    it('should throw error for incomplete theme', () => {
      const incomplete = JSON.stringify({ id: 'test', name: 'Test' });
      expect(() => {
        ThemeManager.importTheme(incomplete);
      }).toThrow('Invalid theme format');
    });
  });

  describe('ThemeManager.duplicateTheme', () => {
    it('should create a copy with new ID', () => {
      const original = DEFAULT_THEMES['wpp-default'];
      const duplicate = ThemeManager.duplicateTheme(original, 'Copy of WPP Default');

      expect(duplicate.id).not.toBe(original.id);
      expect(duplicate.name).toBe('Copy of WPP Default');
      expect(duplicate.isCustom).toBe(true);
    });

    it('should copy all theme properties', () => {
      const original = DEFAULT_THEMES['wpp-default'];
      const duplicate = ThemeManager.duplicateTheme(original, 'Copy');

      expect(duplicate.colors).toEqual(original.colors);
      expect(duplicate.typography).toEqual(original.typography);
      expect(duplicate.spacing).toEqual(original.spacing);
    });

    it('should set timestamps', () => {
      const original = DEFAULT_THEMES['wpp-default'];
      const duplicate = ThemeManager.duplicateTheme(original, 'Copy');

      expect(duplicate.createdAt).toBeDefined();
      expect(duplicate.updatedAt).toBeDefined();
    });
  });

  describe('ThemeManager.generateThemeId', () => {
    it('should generate unique IDs', () => {
      const id1 = ThemeManager.generateThemeId();
      const id2 = ThemeManager.generateThemeId();

      expect(id1).not.toBe(id2);
    });

    it('should start with "custom-"', () => {
      const id = ThemeManager.generateThemeId();
      expect(id.startsWith('custom-')).toBe(true);
    });
  });

  describe('Color Palettes', () => {
    it('should have all required color keys', () => {
      const requiredKeys = [
        'primary',
        'primaryHover',
        'primaryActive',
        'secondary',
        'secondaryHover',
        'accent',
        'background',
        'surface',
        'surfaceHover',
        'border',
        'text',
        'textSecondary',
        'textMuted',
        'success',
        'warning',
        'error',
        'info',
        'chart',
      ];

      Object.values(COLOR_PALETTES).forEach((palette) => {
        requiredKeys.forEach((key) => {
          expect(palette).toHaveProperty(key);
        });
      });
    });

    it('should have 8 chart colors', () => {
      Object.values(COLOR_PALETTES).forEach((palette) => {
        expect(palette.chart).toHaveLength(8);
      });
    });

    it('should have valid hex color format', () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;

      Object.values(COLOR_PALETTES).forEach((palette) => {
        expect(palette.primary).toMatch(hexRegex);
        expect(palette.secondary).toMatch(hexRegex);
        palette.chart.forEach((color) => {
          expect(color).toMatch(hexRegex);
        });
      });
    });
  });

  describe('Font Families', () => {
    it('should have name and value properties', () => {
      Object.values(FONT_FAMILIES).forEach((font) => {
        expect(font).toHaveProperty('name');
        expect(font).toHaveProperty('value');
      });
    });

    it('should include fallback fonts', () => {
      Object.values(FONT_FAMILIES).forEach((font) => {
        expect(font.value).toContain('sans-serif');
      });
    });
  });

  describe('Default Themes', () => {
    it('should have required themes', () => {
      expect(DEFAULT_THEMES).toHaveProperty('wpp-default');
      expect(DEFAULT_THEMES).toHaveProperty('dark-mode');
    });

    it('should have complete theme structure', () => {
      Object.values(DEFAULT_THEMES).forEach((theme) => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('colors');
        expect(theme).toHaveProperty('typography');
        expect(theme).toHaveProperty('spacing');
        expect(theme).toHaveProperty('borderRadius');
        expect(theme).toHaveProperty('shadows');
      });
    });
  });

  describe('Storage Errors', () => {
    it('should handle localStorage quota exceeded', () => {
      const originalSetItem = localStorageMock.setItem;

      localStorageMock.setItem = () => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };

      const theme: Theme = {
        ...DEFAULT_THEMES['wpp-default'],
        id: 'custom-quota',
        name: 'Quota Test',
      };

      expect(() => {
        ThemeManager.saveTheme(theme);
      }).toThrow();

      localStorageMock.setItem = originalSetItem;
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('wpp-dashboard-themes', 'corrupted data');
      const themes = ThemeManager.getCustomThemes();
      expect(themes).toEqual([]);
    });
  });

  describe('Theme Application', () => {
    it('should apply theme to DOM', () => {
      const theme = DEFAULT_THEMES['wpp-default'];
      const root = document.documentElement;

      ThemeManager.applyThemeToDom(theme);

      expect(root.style.getPropertyValue('--color-primary')).toBe(theme.colors.primary);
      expect(root.style.getPropertyValue('--font-family')).toBe(theme.typography.fontFamily);
      expect(root.style.getPropertyValue('--spacing-md')).toBe(theme.spacing.md);
    });

    it('should update CSS variables when theme changes', () => {
      const root = document.documentElement;

      ThemeManager.applyThemeToDom(DEFAULT_THEMES['wpp-default']);
      const primary1 = root.style.getPropertyValue('--color-primary');

      ThemeManager.applyThemeToDom(DEFAULT_THEMES['dark-mode']);
      const primary2 = root.style.getPropertyValue('--color-primary');

      expect(primary1).not.toBe(primary2);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete theme lifecycle', () => {
      // Create
      const theme: Theme = {
        ...DEFAULT_THEMES['wpp-default'],
        id: ThemeManager.generateThemeId(),
        name: 'Lifecycle Test',
      };

      ThemeManager.saveTheme(theme);

      // Read
      let saved = ThemeManager.getTheme(theme.id);
      expect(saved).not.toBeNull();

      // Update
      const updated = { ...theme, name: 'Updated Lifecycle Test' };
      ThemeManager.saveTheme(updated);
      saved = ThemeManager.getTheme(theme.id);
      expect(saved?.name).toBe('Updated Lifecycle Test');

      // Delete
      ThemeManager.deleteTheme(theme.id);
      saved = ThemeManager.getTheme(theme.id);
      expect(saved).toBeNull();
    });

    it('should handle export/import workflow', () => {
      const original = DEFAULT_THEMES['wpp-default'];
      const json = ThemeManager.exportTheme(original);
      const imported = ThemeManager.importTheme(json);

      ThemeManager.saveTheme(imported);
      const saved = ThemeManager.getTheme(imported.id);

      expect(saved?.name).toBe(original.name);
      expect(saved?.colors).toEqual(original.colors);
    });

    it('should handle duplicate/modify workflow', () => {
      const original = DEFAULT_THEMES['wpp-default'];
      const duplicate = ThemeManager.duplicateTheme(original, 'My Custom Theme');

      duplicate.colors.primary = '#FF0000';
      ThemeManager.saveTheme(duplicate);

      const saved = ThemeManager.getTheme(duplicate.id);
      expect(saved?.colors.primary).toBe('#FF0000');
      expect(original.colors.primary).not.toBe('#FF0000');
    });
  });
});
