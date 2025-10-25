/**
 * Content Components
 *
 * Rich content components for dashboard building:
 * - TitleComponent: Editable rich text headings with H1-H6 levels
 * - LineComponent: Flexible dividers/separators with horizontal/vertical orientation
 * - Future: TextComponent, ImageComponent, VideoComponent, etc.
 */

export { TitleComponent, TitlePresets } from './TitleComponent';
export type { TitleComponentProps } from './TitleComponent';

export {
  LineComponent,
  LineDivider,
  LineSeparator,
  SectionDivider,
  SubtleDivider,
  AccentDivider,
} from './LineComponent';
export type {
  LineComponentProps,
  LineOrientation,
  LineStyle,
} from './LineComponent';
