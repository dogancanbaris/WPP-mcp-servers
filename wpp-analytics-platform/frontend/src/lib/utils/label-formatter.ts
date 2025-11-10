/**
 * Label Formatter Utility
 *
 * Formats metric/dimension labels for professional display in charts.
 * Applies proper case formatting, handles acronyms, and converts
 * snake_case/camelCase to readable text.
 *
 * Used in: Legends, Tooltips, Axis Labels, Data Labels
 */

/**
 * Format label for display in charts (legends, tooltips, axes)
 * Converts metric/dimension names to proper display format
 *
 * Examples:
 * - "clicks" → "Clicks"
 * - "ctr" → "CTR"
 * - "cost_per_click" → "Cost Per Click"
 * - "session_duration" → "Session Duration"
 * - "totalRevenue" → "Total Revenue"
 * - "meditation tools for beginners" → "Meditation Tools For..."
 */
interface FormatLabelOptions {
  preserveCase?: boolean;
  detectWebLike?: boolean;
}

export function formatChartLabel(label: string, maxLength?: number, options?: FormatLabelOptions): string {
  if (!label) return '';

  // Known acronyms - keep uppercase
  const acronyms = [
    'ctr', 'cpc', 'cpm', 'roas', 'roi', 'kpi', 'url', 'seo', 'sem',
    'api', 'http', 'https', 'ssl', 'tls', 'dns', 'cdn', 'html', 'css',
    'js', 'json', 'xml', 'csv', 'pdf', 'sms', 'mms', 'id', 'uuid'
  ];

  const lowerLabel = label.toLowerCase();

  if (options?.preserveCase) {
    if (maxLength && label.length > maxLength) {
      return label.substring(0, maxLength - 3) + '...';
    }
    return label;
  }

  const shouldDetectWebLike = options?.detectWebLike !== false;
  if (shouldDetectWebLike) {
    const hasUrlMarkers =
      lowerLabel.startsWith('http://') ||
      lowerLabel.startsWith('https://') ||
      lowerLabel.startsWith('www.');
    const hasDomainPattern = /\.[a-z]{2,}(\/|$)/i.test(label);
    if (hasUrlMarkers || hasDomainPattern) {
      if (maxLength && label.length > maxLength) {
        return label.substring(0, maxLength - 3) + '...';
      }
      return label;
    }
  }

  // Check if entire label is an acronym
  if (acronyms.includes(lowerLabel)) {
    return label.toUpperCase();
  }

  // Split by underscore, dash, or camelCase
  const words = label
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → camel Case
    .split(/[_\s-]+/)  // Split by underscore, space, or dash
    .map(word => {
      const lowerWord = word.toLowerCase();
      // Check if individual word is an acronym
      if (acronyms.includes(lowerWord)) {
        return word.toUpperCase();
      }
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

  const formatted = words.join(' ');

  // Apply truncation if maxLength specified
  if (maxLength && formatted.length > maxLength) {
    return formatted.substring(0, maxLength - 3) + '...';
  }

  return formatted;
}

/**
 * Format multiple labels (for multi-series charts)
 */
export function formatChartLabels(labels: string[]): string[] {
  return labels.map(formatChartLabel);
}

/**
 * Truncate label for axis display (prevents overlap/cutoff)
 *
 * Examples:
 * - "meditation tools for beginners" → "Meditation Tools..."
 * - "https://example.com/very/long/path" → "Https://Example.Com..."
 */
export function truncateAxisLabel(label: string, maxLength: number = 25): string {
  const formatted = formatChartLabel(label);
  if (formatted.length <= maxLength) return formatted;
  return formatted.substring(0, maxLength - 3) + '...';
}

/**
 * Format column header (adds special handling for comparison columns)
 *
 * Examples:
 * - "clicks" → "Clicks"
 * - "clicks_prev" → "Clicks (Previous)"
 * - "ctr_change" → "CTR Change"
 */
export function formatColumnHeader(column: string): string {
  // Handle comparison columns
  if (column.endsWith('_prev')) {
    const baseMetric = column.replace('_prev', '');
    return `${formatChartLabel(baseMetric)} (Previous)`;
  }

  if (column.endsWith('_change')) {
    const baseMetric = column.replace('_change', '');
    return `${formatChartLabel(baseMetric)} Δ`;
  }

  return formatChartLabel(column);
}
