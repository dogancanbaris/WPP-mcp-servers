/**
 * Theme System for Dashboard Builder
 * Provides color palettes, typography, spacing, and theme management
 */

export interface ColorPalette {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  background: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  chart: string[];
}

export interface TypographyScale {
  fontFamily: string;
  headingFamily?: string;
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  weights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

// Predefined Color Palettes
export const COLOR_PALETTES: Record<string, ColorPalette> = {
  'wpp-default': {
    primary: '#0066CC',
    primaryHover: '#0052A3',
    primaryActive: '#003D7A',
    secondary: '#6B7280',
    secondaryHover: '#4B5563',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceHover: '#F3F4F6',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    chart: ['#0066CC', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'],
  },
  'dark-mode': {
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryActive: '#1D4ED8',
    secondary: '#9CA3AF',
    secondaryHover: '#6B7280',
    accent: '#10B981',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceHover: '#334155',
    border: '#334155',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    chart: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#A78BFA', '#F472B6', '#2DD4BF', '#FB923C'],
  },
  'ocean-breeze': {
    primary: '#0891B2',
    primaryHover: '#0E7490',
    primaryActive: '#155E75',
    secondary: '#64748B',
    secondaryHover: '#475569',
    accent: '#06B6D4',
    background: '#F0F9FF',
    surface: '#FFFFFF',
    surfaceHover: '#E0F2FE',
    border: '#BAE6FD',
    text: '#0C4A6E',
    textSecondary: '#075985',
    textMuted: '#0369A1',
    success: '#14B8A6',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#0284C7',
    chart: ['#0891B2', '#14B8A6', '#06B6D4', '#0284C7', '#7DD3FC', '#22D3EE', '#67E8F9', '#A5F3FC'],
  },
  'forest-green': {
    primary: '#059669',
    primaryHover: '#047857',
    primaryActive: '#065F46',
    secondary: '#6B7280',
    secondaryHover: '#4B5563',
    accent: '#10B981',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    surfaceHover: '#DCFCE7',
    border: '#BBF7D0',
    text: '#064E3B',
    textSecondary: '#065F46',
    textMuted: '#047857',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
    chart: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#14B8A6', '#2DD4BF', '#5EEAD4'],
  },
  'sunset-orange': {
    primary: '#EA580C',
    primaryHover: '#C2410C',
    primaryActive: '#9A3412',
    secondary: '#78716C',
    secondaryHover: '#57534E',
    accent: '#F97316',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    surfaceHover: '#FFEDD5',
    border: '#FED7AA',
    text: '#7C2D12',
    textSecondary: '#9A3412',
    textMuted: '#C2410C',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
    chart: ['#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#EF4444', '#F87171', '#FCA5A5'],
  },
  'purple-haze': {
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    primaryActive: '#5B21B6',
    secondary: '#6B7280',
    secondaryHover: '#4B5563',
    accent: '#A78BFA',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    surfaceHover: '#F3E8FF',
    border: '#E9D5FF',
    text: '#4C1D95',
    textSecondary: '#5B21B6',
    textMuted: '#6D28D9',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
    chart: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EC4899', '#F472B6', '#F9A8D4'],
  },
};

// Font Families
export const FONT_FAMILIES = {
  system: {
    name: 'System Default',
    value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  inter: {
    name: 'Inter',
    value: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  roboto: {
    name: 'Roboto',
    value: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  'open-sans': {
    name: 'Open Sans',
    value: '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  lato: {
    name: 'Lato',
    value: '"Lato", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  montserrat: {
    name: 'Montserrat',
    value: '"Montserrat", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  poppins: {
    name: 'Poppins',
    value: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  'source-sans': {
    name: 'Source Sans Pro',
    value: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
  },
};

// Spacing Presets
export const SPACING_PRESETS: Record<string, SpacingScale> = {
  compact: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '2.5rem',
  },
  comfortable: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
  },
  spacious: {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '5rem',
  },
};

// Default Themes
export const DEFAULT_THEMES: Record<string, Theme> = {
  'wpp-default': {
    id: 'wpp-default',
    name: 'WPP Default',
    description: 'Clean and professional theme with WPP brand colors',
    colors: COLOR_PALETTES['wpp-default'],
    typography: {
      fontFamily: FONT_FAMILIES.inter.value,
      headingFamily: FONT_FAMILIES.inter.value,
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
    spacing: SPACING_PRESETS.comfortable,
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },
  'dark-mode': {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Modern dark theme for reduced eye strain',
    colors: COLOR_PALETTES['dark-mode'],
    typography: {
      fontFamily: FONT_FAMILIES.inter.value,
      headingFamily: FONT_FAMILIES.inter.value,
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
    spacing: SPACING_PRESETS.comfortable,
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    },
  },
};

// Theme Storage Keys
const THEME_STORAGE_KEY = 'wpp-dashboard-themes';
const ACTIVE_THEME_KEY = 'wpp-active-theme';

// Theme Management Functions
export class ThemeManager {
  /**
   * Get all themes (default + custom)
   */
  static getAllThemes(): Theme[] {
    const customThemes = this.getCustomThemes();
    const defaultThemes = Object.values(DEFAULT_THEMES);
    return [...defaultThemes, ...customThemes];
  }

  /**
   * Get custom themes from localStorage
   */
  static getCustomThemes(): Theme[] {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load custom themes:', error);
      return [];
    }
  }

  /**
   * Save a custom theme
   */
  static saveTheme(theme: Theme): void {
    try {
      const customThemes = this.getCustomThemes();
      const existingIndex = customThemes.findIndex((t) => t.id === theme.id);

      const updatedTheme = {
        ...theme,
        isCustom: true,
        updatedAt: new Date().toISOString(),
        createdAt: theme.createdAt || new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        customThemes[existingIndex] = updatedTheme;
      } else {
        customThemes.push(updatedTheme);
      }

      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(customThemes));
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw new Error('Failed to save theme');
    }
  }

  /**
   * Delete a custom theme
   */
  static deleteTheme(themeId: string): void {
    try {
      const customThemes = this.getCustomThemes();
      const filtered = customThemes.filter((t) => t.id !== themeId);
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete theme:', error);
      throw new Error('Failed to delete theme');
    }
  }

  /**
   * Get theme by ID
   */
  static getTheme(themeId: string): Theme | null {
    const allThemes = this.getAllThemes();
    return allThemes.find((t) => t.id === themeId) || null;
  }

  /**
   * Set active theme
   */
  static setActiveTheme(themeId: string): void {
    try {
      localStorage.setItem(ACTIVE_THEME_KEY, themeId);
      const theme = this.getTheme(themeId);
      if (theme) {
        this.applyThemeToDom(theme);
      }
    } catch (error) {
      console.error('Failed to set active theme:', error);
    }
  }

  /**
   * Get active theme
   */
  static getActiveTheme(): Theme {
    try {
      const themeId = localStorage.getItem(ACTIVE_THEME_KEY);
      if (themeId) {
        const theme = this.getTheme(themeId);
        if (theme) return theme;
      }
    } catch (error) {
      console.error('Failed to get active theme:', error);
    }
    return DEFAULT_THEMES['wpp-default'];
  }

  /**
   * Apply theme to DOM (CSS custom properties)
   */
  static applyThemeToDom(theme: Theme): void {
    const root = document.documentElement;

    // Colors
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
    root.style.setProperty('--color-primary-active', theme.colors.primaryActive);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-secondary-hover', theme.colors.secondaryHover);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-surface-hover', theme.colors.surfaceHover);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-info', theme.colors.info);

    // Typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-family-heading', theme.typography.headingFamily || theme.typography.fontFamily);

    // Spacing
    root.style.setProperty('--spacing-xs', theme.spacing.xs);
    root.style.setProperty('--spacing-sm', theme.spacing.sm);
    root.style.setProperty('--spacing-md', theme.spacing.md);
    root.style.setProperty('--spacing-lg', theme.spacing.lg);
    root.style.setProperty('--spacing-xl', theme.spacing.xl);

    // Border Radius
    root.style.setProperty('--radius-sm', theme.borderRadius.sm);
    root.style.setProperty('--radius-md', theme.borderRadius.md);
    root.style.setProperty('--radius-lg', theme.borderRadius.lg);
    root.style.setProperty('--radius-xl', theme.borderRadius.xl);

    // Shadows
    root.style.setProperty('--shadow-sm', theme.shadows.sm);
    root.style.setProperty('--shadow-md', theme.shadows.md);
    root.style.setProperty('--shadow-lg', theme.shadows.lg);
    root.style.setProperty('--shadow-xl', theme.shadows.xl);
  }

  /**
   * Export theme as JSON
   */
  static exportTheme(theme: Theme): string {
    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme from JSON
   */
  static importTheme(jsonString: string): Theme {
    try {
      const theme = JSON.parse(jsonString);
      // Validate theme structure
      if (!theme.id || !theme.name || !theme.colors || !theme.typography || !theme.spacing) {
        throw new Error('Invalid theme format');
      }
      return theme;
    } catch (error) {
      console.error('Failed to import theme:', error);
      throw new Error('Invalid theme JSON');
    }
  }

  /**
   * Duplicate theme with new ID
   */
  static duplicateTheme(theme: Theme, newName: string): Theme {
    return {
      ...theme,
      id: `custom-${Date.now()}`,
      name: newName,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate theme ID
   */
  static generateThemeId(): string {
    return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
