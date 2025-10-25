import { MetricStyleConfig } from '@/types/dashboard-builder';
import gscMetadata from '../metadata/platforms/gsc.json';

// Platform metadata (statically imported, no fs needed)
const PLATFORM_METADATA: Record<string, any> = {
  'gsc': gscMetadata,
  // google_ads and analytics will be added here when available
};

function loadPlatformMetadata(platform: string) {
  return PLATFORM_METADATA[platform] || null;
}

/**
 * Format a metric value based on its configuration and platform metadata
 */
export function formatMetricValue(
  value: number | null | undefined,
  metricId: string,
  metricsConfig: MetricStyleConfig[] = [],
  platform: string = 'gsc' // Default to GSC for now
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  // First check if there's explicit config passed in
  const metricConfig = metricsConfig.find(m => m.id === metricId || m.name === metricId);

  // If no explicit config, try to load from platform metadata
  let format = metricConfig?.format;
  let decimals = metricConfig?.decimals;

  if (!format || decimals === undefined) {
    const platformMeta = loadPlatformMetadata(platform);
    const metricDef = platformMeta?.metrics?.find((m: any) => m.id === metricId);

    if (metricDef) {
      format = format || metricDef.format;
      decimals = decimals !== undefined ? decimals : metricDef.decimals;
    }
  }

  // Apply formatting based on type
  if (format === 'percentage') {
    // Value is already a decimal (e.g., 0.0066 for 0.66%)
    const percentValue = value * 100;
    return `${percentValue.toFixed(decimals || 2)}%`;
  }

  if (format === 'number') {
    // Standard number with optional decimals
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals !== undefined ? decimals : 2
    });
  }

  // Fallback to metricConfig logic if present
  if (!metricConfig) {
    // Default formatting
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  let formatted: string;

  // Apply number format
  if (metricConfig.format === 'currency') {
    formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: metricConfig.decimals || 0,
      maximumFractionDigits: metricConfig.decimals || 0
    }).format(value);
  } else if (metricConfig.format === 'percent') {
    // Assume value is already a percentage (e.g., 0.15 = 15%)
    const percentValue = value;
    formatted = `${percentValue.toFixed(metricConfig.decimals || 1)}%`;
  } else if (metricConfig.format === 'duration') {
    // Format as HH:MM:SS
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);
    formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else if (metricConfig.compact && Math.abs(value) >= 1000) {
    // Compact number format (1.2K, 3.4M, etc.)
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.floor(Math.log10(Math.abs(value)) / 3);
    const suffix = suffixes[Math.min(tier, suffixes.length - 1)];
    const scaled = value / Math.pow(10, tier * 3);
    formatted = scaled.toFixed(metricConfig.decimals || 1) + suffix;
  } else {
    // Standard number format
    formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: metricConfig.decimals || 0,
      maximumFractionDigits: metricConfig.decimals || 0
    });
  }

  return formatted;
}

/**
 * Get style object for a metric value based on its configuration
 */
export function getMetricStyle(
  metricId: string,
  metricsConfig: MetricStyleConfig[] = []
): React.CSSProperties {
  const metricConfig = metricsConfig.find(m => m.id === metricId || m.name === metricId);

  if (!metricConfig) {
    return {};
  }

  return {
    color: metricConfig.textColor,
    fontWeight: metricConfig.fontWeight,
    textAlign: metricConfig.alignment
  };
}
