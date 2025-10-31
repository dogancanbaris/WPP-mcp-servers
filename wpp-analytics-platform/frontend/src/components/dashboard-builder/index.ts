// Core Builder Components
export { EditorTopbar } from './topbar';
export { DashboardCanvas } from './DashboardCanvas';
export { SettingsSidebar } from './sidebar';

// Layout Components (Row/Column deprecated - using Canvas mode now)
// export { Row } from './Row';
// export { Column } from './Column';

// Component Utilities
export { ComponentPlaceholder } from './ComponentPlaceholder';
export { ComponentPicker } from './dialogs/ComponentPicker';
export { ChartWrapper } from './ChartWrapper';

// Settings Components
export { ChartSetup } from './sidebar/setup';
export { ChartStyle } from './sidebar/style';

// Theme System
export { ThemeEditor } from './ThemeEditor';
export {
  StandaloneThemeEditor,
  ModalThemeEditor,
  AppWithTheme,
  ThemeSwitcher,
  ProgrammaticThemeExample,
  ThemeImportExport,
  ThemedComponent,
} from './ThemeEditorExample';

// Re-export theme utilities for convenience
export {
  type Theme,
  type ColorPalette,
  type TypographyScale,
  type SpacingScale,
  ThemeManager,
  COLOR_PALETTES,
  FONT_FAMILIES,
  SPACING_PRESETS,
  DEFAULT_THEMES,
} from '../../lib/themes';

// Re-export types for convenience
export type {
  ColumnWidth,
  ComponentType,
  ComponentConfig,
  ColumnConfig,
  RowConfig,
  DashboardLayout
} from '@/types/dashboard-builder';