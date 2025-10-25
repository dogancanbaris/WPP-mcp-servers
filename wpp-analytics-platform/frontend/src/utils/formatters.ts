/**
 * Utility functions for formatting data in charts and tables
 */

/**
 * Format number as currency
 */
export const formatCurrency = (value: number, currency = 'USD', locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format number as percentage
 */
export const formatPercent = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export const formatCompactNumber = (value: number, decimals = 1): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
  }
  return `${sign}${absValue.toFixed(decimals)}`;
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (value: number, decimals = 0, locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format date
 */
export const formatDate = (date: Date | string | number, format = 'short', locale = 'en-US'): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (format === 'short') {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  }

  if (format === 'long') {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  return dateObj.toLocaleDateString(locale);
};

/**
 * Format duration in milliseconds to human readable
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Format bytes to human readable size
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format value based on type
 */
export const formatValue = (
  value: number | string | Date,
  type: 'number' | 'currency' | 'percent' | 'date' | 'duration' | 'bytes' = 'number',
  options?: {
    decimals?: number;
    currency?: string;
    locale?: string;
  }
): string => {
  const { decimals = 2, currency = 'USD', locale = 'en-US' } = options || {};

  if (typeof value === 'string') return value;

  switch (type) {
    case 'currency':
      return formatCurrency(value as number, currency, locale);
    case 'percent':
      return formatPercent(value as number, decimals);
    case 'date':
      return formatDate(value, 'short', locale);
    case 'duration':
      return formatDuration(value as number);
    case 'bytes':
      return formatBytes(value as number, decimals);
    default:
      return formatNumber(value as number, decimals, locale);
  }
};
