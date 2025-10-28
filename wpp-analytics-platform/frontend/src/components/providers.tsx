'use client';

// Client-side providers wrapper
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { useState, useEffect } from 'react';
import { initPageCacheManager } from '@/lib/cache/page-cache-manager';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance (per-session to avoid shared state)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Data fresh for 1 minute
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (replaces deprecated cacheTime)
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  }));

  // Initialize PageCacheManager on mount
  useEffect(() => {
    initPageCacheManager(queryClient);
  }, [queryClient]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
