import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Keyboard,
  Search,
  RotateCcw,
  Edit,
  Check,
  X,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  ShortcutConfig,
  ShortcutBinding,
  ShortcutCategory,
  formatShortcut,
  getPrimaryModifier,
} from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: (ShortcutConfig & { binding: ShortcutBinding; isCustomized: boolean })[];
  onCustomizeShortcut: (description: string, binding: ShortcutBinding) => void;
  onResetShortcut: (description: string) => void;
  onResetAllShortcuts: () => void;
}

/**
 * Component for recording keyboard input
 */
const KeyRecorder: React.FC<{
  onRecord: (binding: ShortcutBinding) => void;
  onCancel: () => void;
  currentBinding?: ShortcutBinding;
}> = ({ onRecord, onCancel, currentBinding }) => {
  const [recording, setRecording] = useState(false);
  const [recordedBinding, setRecordedBinding] = useState<ShortcutBinding | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // Ignore modifier keys alone
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
        return;
      }

      // Validate shortcut
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
      if (!hasModifier && event.key.length === 1) {
        setError('Shortcuts must include at least one modifier key (Ctrl, Alt, Shift)');
        return;
      }

      const binding: ShortcutBinding = {
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
      };

      setRecordedBinding(binding);
      setError(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recording]);

  const startRecording = () => {
    setRecording(true);
    setRecordedBinding(null);
    setError(null);
  };

  const confirmBinding = () => {
    if (recordedBinding) {
      onRecord(recordedBinding);
    }
  };

  const cancelRecording = () => {
    setRecording(false);
    setRecordedBinding(null);
    setError(null);
    onCancel();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {!recording ? (
          <Button
            onClick={startRecording}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Customize
          </Button>
        ) : (
          <>
            <div className="flex-1 p-3 border-2 border-primary rounded-lg bg-primary/5 text-center">
              {recordedBinding ? (
                <span className="font-mono font-semibold text-lg">
                  {formatShortcut(recordedBinding)}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Press your desired key combination...
                </span>
              )}
            </div>
            {recordedBinding && (
              <Button
                onClick={confirmBinding}
                size="sm"
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Confirm
              </Button>
            )}
            <Button
              onClick={cancelRecording}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {currentBinding && !recording && (
        <div className="text-xs text-muted-foreground">
          Current: <span className="font-mono">{formatShortcut(currentBinding)}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Keyboard shortcuts help dialog
 */
export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  open,
  onOpenChange,
  shortcuts,
  onCustomizeShortcut,
  onResetShortcut,
  onResetAllShortcuts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Group shortcuts by category
  const categorizedShortcuts = useMemo(() => {
    if (!shortcuts || !Array.isArray(shortcuts)) return {};

    const categories: Record<string, typeof shortcuts> = {};

    shortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push(shortcut);
    });

    return categories;
  }, [shortcuts]);

  // Filter shortcuts based on search query
  const filteredShortcuts = useMemo(() => {
    if (!searchQuery) return categorizedShortcuts;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof shortcuts> = {};

    Object.entries(categorizedShortcuts).forEach(([category, categoryShortcuts]) => {
      const matches = categoryShortcuts.filter(shortcut =>
        shortcut.description.toLowerCase().includes(query) ||
        formatShortcut(shortcut.binding).toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        filtered[category] = matches;
      }
    });

    return filtered;
  }, [categorizedShortcuts, searchQuery]);

  // Get shortcuts for active category
  const displayShortcuts = useMemo(() => {
    if (activeCategory === 'all') {
      return filteredShortcuts;
    }
    return {
      [activeCategory]: filteredShortcuts[activeCategory] || [],
    };
  }, [filteredShortcuts, activeCategory]);

  // Handle shortcut customization
  const handleCustomize = useCallback((description: string, binding: ShortcutBinding) => {
    onCustomizeShortcut(description, binding);
    setEditingShortcut(null);
  }, [onCustomizeShortcut]);

  // Handle reset
  const handleReset = useCallback((description: string) => {
    onResetShortcut(description);
    setEditingShortcut(null);
  }, [onResetShortcut]);

  // Count customized shortcuts
  const customizedCount = useMemo(() => {
    return shortcuts.filter(s => s.isCustomized).length;
  }, [shortcuts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Keyboard className="h-6 w-6" />
              <div>
                <DialogTitle>Keyboard Shortcuts</DialogTitle>
                <DialogDescription>
                  View and customize keyboard shortcuts
                  {customizedCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {customizedCount} customized
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </div>
            {customizedCount > 0 && (
              <Button
                onClick={onResetAllShortcuts}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset All
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Shortcuts work globally across the dashboard. Press{' '}
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
              {getPrimaryModifier() === 'metaKey' ? 'Cmd' : 'Ctrl'}+/
            </kbd>{' '}
            anytime to open this dialog.
          </AlertDescription>
        </Alert>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.keys(categorizedShortcuts).map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
                <Badge variant="secondary" className="ml-2">
                  {categorizedShortcuts[category].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {Object.entries(displayShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category} className="mb-6 last:mb-0">
                {activeCategory === 'all' && (
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                    {category}
                  </h3>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Action</TableHead>
                        <TableHead className="w-[30%]">Shortcut</TableHead>
                        <TableHead className="w-[30%]">Customize</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryShortcuts.map((shortcut) => (
                        <TableRow key={shortcut.description}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {shortcut.description}
                              {shortcut.isCustomized && (
                                <Badge variant="outline" className="text-xs">
                                  Custom
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <kbd
                              className={cn(
                                "px-3 py-1.5 text-sm font-mono font-semibold rounded",
                                "bg-muted border border-border",
                                shortcut.isCustomized && "bg-primary/10 border-primary"
                              )}
                            >
                              {formatShortcut(shortcut.binding)}
                            </kbd>
                          </TableCell>
                          <TableCell>
                            {editingShortcut === shortcut.description ? (
                              <KeyRecorder
                                onRecord={(binding) => handleCustomize(shortcut.description, binding)}
                                onCancel={() => setEditingShortcut(null)}
                                currentBinding={shortcut.binding}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => setEditingShortcut(shortcut.description)}
                                  variant="ghost"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Edit className="h-3 w-3" />
                                  Edit
                                </Button>
                                {shortcut.isCustomized && (
                                  <Button
                                    onClick={() => handleReset(shortcut.description)}
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                    Reset
                                  </Button>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {shortcuts.length} shortcuts available
          </div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Compact keyboard shortcut display component
 */
export const KeyboardShortcut: React.FC<{
  binding: ShortcutBinding;
  className?: string;
}> = ({ binding, className }) => {
  return (
    <kbd
      className={cn(
        "px-2 py-1 text-xs font-mono font-semibold rounded",
        "bg-muted border border-border inline-block",
        className
      )}
    >
      {formatShortcut(binding)}
    </kbd>
  );
};

/**
 * Inline shortcut hint component
 */
export const ShortcutHint: React.FC<{
  binding: ShortcutBinding;
  description: string;
  className?: string;
}> = ({ binding, description, className }) => {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span>{description}</span>
      <KeyboardShortcut binding={binding} />
    </div>
  );
};

/**
 * Example usage component showing how to integrate with dashboard builder
 */
export const KeyboardShortcutsExample: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);

  // This would come from your actual keyboard shortcuts hook
  const mockShortcuts = [
    {
      key: 's',
      ctrlKey: true,
      description: 'Save dashboard',
      category: ShortcutCategory.GENERAL,
      handler: () => console.log('Save'),
      binding: { key: 's', ctrlKey: true },
      isCustomized: false,
    },
    {
      key: 'z',
      ctrlKey: true,
      description: 'Undo',
      category: ShortcutCategory.EDITING,
      handler: () => console.log('Undo'),
      binding: { key: 'z', ctrlKey: true },
      isCustomized: false,
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <Button onClick={() => setShowDialog(true)}>
        Show Keyboard Shortcuts
      </Button>

      <div className="space-y-2">
        <ShortcutHint
          binding={{ key: 's', ctrlKey: true }}
          description="Press"
        />
        <ShortcutHint
          binding={{ key: '/', ctrlKey: true }}
          description="Show all shortcuts"
        />
      </div>

      <KeyboardShortcutsDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        shortcuts={mockShortcuts}
        onCustomizeShortcut={(desc, binding) => console.log('Customize:', desc, binding)}
        onResetShortcut={(desc) => console.log('Reset:', desc)}
        onResetAllShortcuts={() => console.log('Reset all')}
      />
    </div>
  );
};
