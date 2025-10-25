/**
 * Data Formatting Utilities
 *
 * Standardizes data values for consistent display across all dashboards.
 * Handles country codes, device names, and other dimension value formatting.
 */

// Country code to full name mapping
const COUNTRY_NAMES: Record<string, string> = {
  // Top countries
  'usa': 'USA',
  'gbr': 'United Kingdom',
  'can': 'Canada',
  'aus': 'Australia',
  'ind': 'India',
  'deu': 'Germany',
  'fra': 'France',
  'ita': 'Italy',
  'esp': 'Spain',
  'nld': 'Netherlands',
  'bra': 'Brazil',
  'mex': 'Mexico',
  'jpn': 'Japan',
  'kor': 'South Korea',
  'chn': 'China',
  'tur': 'Turkey',
  'irl': 'Ireland',
  'tha': 'Thailand',
  'sgp': 'Singapore',
  'nzl': 'New Zealand',
  'swe': 'Sweden',
  'nor': 'Norway',
  'dnk': 'Denmark',
  'fin': 'Finland',
  'pol': 'Poland',
  'che': 'Switzerland',
  'aut': 'Austria',
  'bel': 'Belgium',
  'prt': 'Portugal',
  'rus': 'Russia',
  'are': 'UAE',
  'sau': 'Saudi Arabia',
  'zaf': 'South Africa',
  'arg': 'Argentina',
  'chl': 'Chile',
  'col': 'Colombia',
  'idn': 'Indonesia',
  'mys': 'Malaysia',
  'phl': 'Philippines',
  'vnm': 'Vietnam',
  'egy': 'Egypt',
  'mar': 'Morocco',
  'nga': 'Nigeria',
  'ken': 'Kenya',
  // Add more as needed
};

/**
 * Standardize dimension values for display
 */
export function standardizeDimensionValue(
  value: string | number | null | undefined,
  dimensionType: string
): string {
  if (value === null || value === undefined) {
    return '-';
  }

  const stringValue = String(value);

  switch (dimensionType) {
    case 'country':
      // Convert 3-letter codes to full names
      const lowerCode = stringValue.toLowerCase();
      return COUNTRY_NAMES[lowerCode] || stringValue.toUpperCase();

    case 'device':
      // Convert MOBILE/DESKTOP/TABLET to Title Case
      return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();

    case 'page':
      // Truncate long URLs for display
      if (stringValue.length > 60) {
        return stringValue.substring(0, 57) + '...';
      }
      return stringValue;

    case 'query':
      // Keep as-is
      return stringValue;

    case 'date':
      // Format dates nicely
      try {
        const date = new Date(stringValue);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return stringValue;
      }

    default:
      return stringValue;
  }
}

/**
 * Standardize multiple rows of data
 */
export function standardizeDataRows(
  rows: any[],
  dimensionField: string | null
): any[] {
  if (!dimensionField || rows.length === 0) {
    return rows;
  }

  return rows.map(row => ({
    ...row,
    [dimensionField]: standardizeDimensionValue(row[dimensionField], dimensionField)
  }));
}
