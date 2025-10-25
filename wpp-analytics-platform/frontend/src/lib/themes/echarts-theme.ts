// ECharts Theme System - Connects to CSS Variables
// Allows global theme changes by modifying CSS only

export function getEChartsTheme(mode: 'light' | 'dark' = 'light') {
  if (typeof window === 'undefined') {
    // Server-side: return default theme
    return getDefaultTheme(mode);
  }

  // Client-side: read CSS variables
  const root = document.documentElement;
  const getColor = (varName: string) => {
    const value = getComputedStyle(root).getPropertyValue(varName).trim();
    // Convert oklch to rgb for ECharts
    if (value.startsWith('oklch')) {
      return `hsl(${varName.replace('--', '')})`; // Fallback
    }
    return value.startsWith('oklch') ? `oklch(${value})` : `hsl(${value})`;
  };

  return {
    color: [
      getColor('--chart-1'),
      getColor('--chart-2'),
      getColor('--chart-3'),
      getColor('--chart-4'),
      getColor('--chart-5'),
      getColor('--chart-6'),
      getColor('--chart-7'),
      getColor('--chart-8'),
      getColor('--chart-9'),
      getColor('--chart-10')
    ],
    backgroundColor: getColor('--background'),
    textStyle: {
      color: getColor('--foreground'),
      fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif'
    },
    title: {
      textStyle: {
        color: getColor('--foreground')
      },
      subtextStyle: {
        color: getColor('--muted-foreground')
      }
    },
    legend: {
      textStyle: {
        color: getColor('--foreground')
      }
    },
    tooltip: {
      backgroundColor: getColor('--popover'),
      borderColor: getColor('--border'),
      textStyle: {
        color: getColor('--popover-foreground')
      }
    }
  };
}

function getDefaultTheme(mode: 'light' | 'dark') {
  const colors = mode === 'light' ? {
    chart1: '#2563EB',
    chart2: '#10B981',
    chart3: '#8B5CF6',
    chart4: '#F59E0B',
    chart5: '#EF4444'
  } : {
    chart1: '#60A5FA',
    chart2: '#34D399',
    chart3: '#A78BFA',
    chart4: '#FBBF24',
    chart5: '#F87171'
  };

  return {
    color: Object.values(colors),
    backgroundColor: mode === 'light' ? '#FFFFFF' : '#1F2937',
    textStyle: { color: mode === 'light' ? '#111827' : '#F3F4F6' }
  };
}
