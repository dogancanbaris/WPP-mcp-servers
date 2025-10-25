import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  Star,
  StarOff,
  ChevronDown,
  Trash2,
  Edit,
  Copy,
  Check,
  X,
  Filter,
  Clock,
  MoreVertical,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * PresetFilter Component
 *
 * Save, load, and quickly apply filter combinations for WPP Analytics Platform.
 * Supports multiple filter types, favorites, and local storage persistence.
 *
 * @example
 * ```tsx
 * <PresetFilter
 *   currentFilters={{
 *     dimensions: ['GoogleAds.campaignName'],
 *     filters: [{ field: 'GoogleAds.status', operator: 'equals', value: 'ENABLED' }],
 *     dateRange: { type: 'preset', preset: 'last_30_days' }
 *   }}
 *   onApplyPreset={(preset) => applyFiltersToChart(preset.filters)}
 *   storageKey="dashboard-filter-presets"
 * />
 * ```
 */

export interface FilterCombination {
  /** Dimension filters */
  dimensions?: string[];

  /** Metric selections */
  metrics?: string[];

  /** Field filters */
  filters?: Array<{
    field: string;
    operator: string;
    value: string | string[];
  }>;

  /** Date range configuration */
  dateRange?: {
    type: 'preset' | 'custom';
    preset?: string;
    startDate?: string;
    endDate?: string;
  };

  /** Data source ID */
  dataSource?: string;

  /** Additional custom properties */
  [key: string]: unknown;
}

export interface FilterPreset {
  /** Unique preset ID */
  id: string;

  /** Preset name */
  name: string;

  /** Optional description */
  description?: string;

  /** Filter combination */
  filters: FilterCombination;

  /** Favorite status */
  isFavorite: boolean;

  /** Creation timestamp */
  createdAt: string;

  /** Last modified timestamp */
  updatedAt: string;

  /** Number of times applied */
  usageCount: number;
}

export interface PresetFilterProps {
  /** Current active filters */
  currentFilters: FilterCombination;

  /** Callback when preset is applied */
  onApplyPreset: (preset: FilterPreset) => void;

  /** Local storage key for persistence */
  storageKey?: string;

  /** Show favorites only by default */
  showFavoritesOnly?: boolean;

  /** Allow editing of presets */
  allowEdit?: boolean;

  /** Allow deleting of presets */
  allowDelete?: boolean;

  /** Maximum number of presets */
  maxPresets?: number;

  /** Custom CSS class */
  className?: string;
}

export const PresetFilter: React.FC<PresetFilterProps> = ({
  currentFilters,
  onApplyPreset,
  storageKey = 'wpp-filter-presets',
  showFavoritesOnly: initialShowFavoritesOnly = false,
  allowEdit = true,
  allowDelete = true,
  maxPresets = 50,
  className = '',
}) => {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(initialShowFavoritesOnly);
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);

  // Dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<FilterPreset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<FilterPreset | null>(null);

  // Form states
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  /**
   * Load presets from localStorage on mount
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPresets(parsed);
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
    }
  }, [storageKey]);

  /**
   * Save presets to localStorage whenever they change
   */
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(presets));
    } catch (error) {
      console.error('Failed to save filter presets:', error);
    }
  }, [presets, storageKey]);

  /**
   * Get filtered presets based on favorites toggle
   */
  const filteredPresets = showFavoritesOnly
    ? presets.filter((p) => p.isFavorite)
    : presets;

  /**
   * Sort presets by favorites, then by usage count, then by date
   */
  const sortedPresets = [...filteredPresets].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    if (a.usageCount !== b.usageCount) {
      return b.usageCount - a.usageCount;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  /**
   * Save current filters as new preset
   */
  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;

    if (presets.length >= maxPresets) {
      alert(`Maximum of ${maxPresets} presets reached. Please delete some presets first.`);
      return;
    }

    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: presetName.trim(),
      description: presetDescription.trim() || undefined,
      filters: { ...currentFilters },
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    setPresets((prev) => [...prev, newPreset]);
    setPresetName('');
    setPresetDescription('');
    setSaveDialogOpen(false);
  }, [presetName, presetDescription, currentFilters, presets.length, maxPresets]);

  /**
   * Update existing preset
   */
  const handleUpdatePreset = useCallback(() => {
    if (!editingPreset || !presetName.trim()) return;

    setPresets((prev) =>
      prev.map((p) =>
        p.id === editingPreset.id
          ? {
              ...p,
              name: presetName.trim(),
              description: presetDescription.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    setEditingPreset(null);
    setPresetName('');
    setPresetDescription('');
  }, [editingPreset, presetName, presetDescription]);

  /**
   * Apply preset to dashboard
   */
  const handleApplyPreset = useCallback(
    (preset: FilterPreset) => {
      // Increment usage count
      setPresets((prev) =>
        prev.map((p) =>
          p.id === preset.id
            ? {
                ...p,
                usageCount: p.usageCount + 1,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );

      setAppliedPresetId(preset.id);
      onApplyPreset(preset);
    },
    [onApplyPreset]
  );

  /**
   * Toggle favorite status
   */
  const handleToggleFavorite = useCallback((presetId: string) => {
    setPresets((prev) =>
      prev.map((p) =>
        p.id === presetId
          ? {
              ...p,
              isFavorite: !p.isFavorite,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  }, []);

  /**
   * Duplicate preset
   */
  const handleDuplicatePreset = useCallback((preset: FilterPreset) => {
    const duplicated: FilterPreset = {
      ...preset,
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${preset.name} (Copy)`,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    setPresets((prev) => [...prev, duplicated]);
  }, []);

  /**
   * Delete preset
   */
  const handleDeletePreset = useCallback(() => {
    if (!presetToDelete) return;

    setPresets((prev) => prev.filter((p) => p.id !== presetToDelete.id));

    if (appliedPresetId === presetToDelete.id) {
      setAppliedPresetId(null);
    }

    setPresetToDelete(null);
    setDeleteDialogOpen(false);
  }, [presetToDelete, appliedPresetId]);

  /**
   * Open edit dialog
   */
  const handleEditPreset = useCallback((preset: FilterPreset) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setPresetDescription(preset.description || '');
  }, []);

  /**
   * Count active filters
   */
  const getFilterCount = (filters: FilterCombination): number => {
    let count = 0;
    if (filters.dimensions?.length) count += filters.dimensions.length;
    if (filters.metrics?.length) count += filters.metrics.length;
    if (filters.filters?.length) count += filters.filters.length;
    if (filters.dateRange) count += 1;
    return count;
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Presets
            </CardTitle>
            <CardDescription>
              Save and quickly apply filter combinations
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              {showFavoritesOnly ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Filter Preset</DialogTitle>
                  <DialogDescription>
                    Create a preset from your current filter configuration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="preset-name">Preset Name *</Label>
                    <Input
                      id="preset-name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="e.g., High-performing campaigns"
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preset-description">
                      Description (Optional)
                    </Label>
                    <Input
                      id="preset-description"
                      value={presetDescription}
                      onChange={(e) => setPresetDescription(e.target.value)}
                      placeholder="e.g., Campaigns with ROI > 300% in last 30 days"
                      maxLength={150}
                    />
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      Current Filters:
                    </div>
                    <Badge variant="secondary">
                      {getFilterCount(currentFilters)} filter(s)
                    </Badge>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSaveDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Preset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        {sortedPresets.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {showFavoritesOnly
                ? 'No favorite presets yet'
                : 'No saved presets yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Configure filters and click Save Current to create a preset
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPresets.map((preset) => (
              <div
                key={preset.id}
                className={`group relative border rounded-lg p-3 hover:border-blue-300 transition-colors ${
                  appliedPresetId === preset.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Favorite Star */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleToggleFavorite(preset.id)}
                          className="mt-1"
                        >
                          {preset.isFavorite ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-4 w-4 text-gray-400 group-hover:text-yellow-400" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {preset.isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Preset Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {preset.name}
                      </h4>
                      {appliedPresetId === preset.id && (
                        <Badge variant="default" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Applied
                        </Badge>
                      )}
                    </div>
                    {preset.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {preset.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Filter className="h-3 w-3" />
                        {getFilterCount(preset.filters)} filters
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(preset.updatedAt)}
                      </span>
                      {preset.usageCount > 0 && (
                        <span>Used {preset.usageCount}x</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApplyPreset(preset)}
                      className="h-8"
                    >
                      Apply
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {allowEdit && (
                          <DropdownMenuItem
                            onClick={() => handleEditPreset(preset)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDuplicatePreset(preset)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {allowDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setPresetToDelete(preset);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="justify-between text-xs text-muted-foreground pt-4">
        <span>
          {presets.length} / {maxPresets} presets
        </span>
        {presets.filter((p) => p.isFavorite).length > 0 && (
          <span>{presets.filter((p) => p.isFavorite).length} favorites</span>
        )}
      </CardFooter>

      {/* Edit Preset Dialog */}
      <Dialog
        open={editingPreset !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPreset(null);
            setPresetName('');
            setPresetDescription('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Preset</DialogTitle>
            <DialogDescription>
              Update the name and description of this preset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-preset-name">Preset Name *</Label>
              <Input
                id="edit-preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-preset-description">
                Description (Optional)
              </Label>
              <Input
                id="edit-preset-description"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Preset description"
                maxLength={150}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingPreset(null);
                setPresetName('');
                setPresetDescription('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePreset} disabled={!presetName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{presetToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePreset}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

/**
 * Hook for managing filter presets
 *
 * @example
 * ```tsx
 * const {
 *   presets,
 *   savePreset,
 *   applyPreset,
 *   deletePreset,
 *   toggleFavorite,
 * } = useFilterPresets('my-dashboard-presets');
 *
 * // Save current filters
 * savePreset('High ROI Campaigns', currentFilters);
 *
 * // Apply a preset
 * const preset = presets.find(p => p.name === 'High ROI Campaigns');
 * if (preset) applyPreset(preset);
 * ```
 */
export const useFilterPresets = (storageKey: string = 'wpp-filter-presets') => {
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(presets));
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  }, [presets, storageKey]);

  const savePreset = useCallback(
    (name: string, filters: FilterCombination, description?: string) => {
      const newPreset: FilterPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        filters,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      };
      setPresets((prev) => [...prev, newPreset]);
      return newPreset;
    },
    []
  );

  const applyPreset = useCallback((preset: FilterPreset) => {
    setPresets((prev) =>
      prev.map((p) =>
        p.id === preset.id
          ? {
              ...p,
              usageCount: p.usageCount + 1,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    return preset.filters;
  }, []);

  const deletePreset = useCallback((presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
  }, []);

  const toggleFavorite = useCallback((presetId: string) => {
    setPresets((prev) =>
      prev.map((p) =>
        p.id === presetId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  }, []);

  const updatePreset = useCallback(
    (presetId: string, updates: Partial<Omit<FilterPreset, 'id'>>) => {
      setPresets((prev) =>
        prev.map((p) =>
          p.id === presetId
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    []
  );

  return {
    presets,
    savePreset,
    applyPreset,
    deletePreset,
    toggleFavorite,
    updatePreset,
  };
};

export default PresetFilter;
