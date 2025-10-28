import React from 'react';
import { usePageStyles } from '@/hooks/usePageStyles';
import type { PageConfig } from '@/types/page-config';

interface PageCanvasProps {
  page: PageConfig;
  children: React.ReactNode;
}

export function PageCanvas({ page, children }: PageCanvasProps) {
  const { cssVariables } = usePageStyles({ pageId: page.id });

  return (
    <div
      className="page-wrapper"
      data-page-id={page.id}
      style={cssVariables as React.CSSProperties}
    >
      <div className="page-canvas">
        {children}
      </div>
    </div>
  );
}
