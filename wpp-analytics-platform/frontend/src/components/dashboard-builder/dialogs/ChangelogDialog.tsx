'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sparkles, X } from 'lucide-react';

interface ChangelogDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ChangelogEntry {
  type: 'Feature' | 'Fix' | 'Improvement';
  description: string;
}

interface ChangelogVersion {
  version: string;
  date: string;
  changes: ChangelogEntry[];
}

// Hardcoded changelog data (can be replaced with API call later)
const CHANGELOG_DATA: ChangelogVersion[] = [
  {
    version: 'v0.2.0',
    date: 'October 26, 2025',
    changes: [
      {
        type: 'Feature',
        description: 'Added File > New dialog with data source selection',
      },
      {
        type: 'Feature',
        description: 'Connected Version History and Keyboard Shortcuts dialogs',
      },
      {
        type: 'Feature',
        description: 'Added Help menu with Report Issue, Send Feedback, and What\'s New',
      },
      {
        type: 'Fix',
        description: 'Fixed File > New route error when creating dashboards',
      },
      {
        type: 'Improvement',
        description: 'Enhanced dashboard creation UX with step-by-step wizard',
      },
      {
        type: 'Improvement',
        description: 'Improved topbar menu organization and consistency',
      },
    ],
  },
  {
    version: 'v0.1.5',
    date: 'October 23, 2025',
    changes: [
      {
        type: 'Feature',
        description: 'Added 13 new chart types (Funnel, Radar, Sankey, Treemap, etc.)',
      },
      {
        type: 'Feature',
        description: 'Implemented global filter bar with date range picker',
      },
      {
        type: 'Fix',
        description: 'Fixed chart refresh issues when changing date ranges',
      },
      {
        type: 'Improvement',
        description: 'Optimized BigQuery query performance for large datasets',
      },
    ],
  },
  {
    version: 'v0.1.0',
    date: 'October 21, 2025',
    changes: [
      {
        type: 'Feature',
        description: 'Initial dashboard builder with drag-and-drop layout',
      },
      {
        type: 'Feature',
        description: 'Added 34 chart types for data visualization',
      },
      {
        type: 'Feature',
        description: 'Implemented Zustand state management with undo/redo',
      },
      {
        type: 'Feature',
        description: 'Created component picker with category-based navigation',
      },
      {
        type: 'Feature',
        description: 'Built responsive sidebar with Setup, Style, and Dashboard tabs',
      },
    ],
  },
];

const getBadgeVariant = (
  type: ChangelogEntry['type']
): 'default' | 'secondary' | 'destructive' => {
  switch (type) {
    case 'Feature':
      return 'default';
    case 'Fix':
      return 'destructive';
    case 'Improvement':
      return 'secondary';
  }
};

export const ChangelogDialog: React.FC<ChangelogDialogProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              What's New
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            Latest updates and improvements to the WPP Analytics Platform
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {CHANGELOG_DATA.map((version, versionIdx) => (
              <div key={version.version}>
                {/* Version Header */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{version.version}</h3>
                    {versionIdx === 0 && (
                      <Badge variant="default" className="text-xs">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{version.date}</p>
                </div>

                {/* Changes List */}
                <div className="space-y-3 mb-6">
                  {version.changes.map((change, changeIdx) => (
                    <div
                      key={changeIdx}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Badge
                        variant={getBadgeVariant(change.type)}
                        className="mt-0.5 shrink-0"
                      >
                        {change.type}
                      </Badge>
                      <p className="flex-1 leading-relaxed">
                        {change.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Separator between versions */}
                {versionIdx < CHANGELOG_DATA.length - 1 && (
                  <Separator className="my-6" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            View full changelog on{' '}
            <a
              href="/docs/changelog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Documentation
            </a>
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
