'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface DashboardSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  dashboardId: string;
  onSave: (settings: DashboardSettings) => void;
  initialSettings?: DashboardSettings;
}

export interface DashboardSettings {
  name: string;
  description: string;
  tags: string[];
  defaultDateRange: string;
  refreshInterval: string;
  accessLevel: 'private' | 'team' | 'public';
  displayOptions: {
    showToolbar: boolean;
    showFilters: boolean;
    autoRefresh: boolean;
  };
}

const DEFAULT_SETTINGS: DashboardSettings = {
  name: '',
  description: '',
  tags: [],
  defaultDateRange: 'last30days',
  refreshInterval: 'manual',
  accessLevel: 'private',
  displayOptions: {
    showToolbar: true,
    showFilters: true,
    autoRefresh: false,
  },
};

export const DashboardSettingsDialog: React.FC<DashboardSettingsDialogProps> = ({
  open,
  onClose,
  dashboardId,
  onSave,
  initialSettings = DEFAULT_SETTINGS,
}) => {
  const [settings, setSettings] = useState<DashboardSettings>(initialSettings);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !settings.tags.includes(trimmedTag)) {
      setSettings({
        ...settings,
        tags: [...settings.tags, trimmedTag],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSettings({
      ...settings,
      tags: settings.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
          <DialogDescription>
            Configure dashboard properties, access, and display options
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="access">Access & Sharing</TabsTrigger>
            <TabsTrigger value="display">Display Options</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">Dashboard Name</Label>
              <Input
                id="dashboard-name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Enter dashboard name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboard-description">Description</Label>
              <Textarea
                id="dashboard-description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Add a description for this dashboard"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboard-tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="dashboard-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tags (press Enter)"
                />
                <Button onClick={handleAddTag} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              {settings.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-date-range">Default Date Range</Label>
              <Select
                value={settings.defaultDateRange}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultDateRange: value })
                }
              >
                <SelectTrigger id="default-date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last90days">Last 90 days</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                  <SelectItem value="lastMonth">Last month</SelectItem>
                  <SelectItem value="thisQuarter">This quarter</SelectItem>
                  <SelectItem value="thisYear">This year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refresh-interval">Refresh Interval</Label>
              <Select
                value={settings.refreshInterval}
                onValueChange={(value) =>
                  setSettings({ ...settings, refreshInterval: value })
                }
              >
                <SelectTrigger id="refresh-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="hourly">Every hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Access & Sharing Tab */}
          <TabsContent value="access" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label>Access Level</Label>
              <RadioGroup
                value={settings.accessLevel}
                onValueChange={(value: 'private' | 'team' | 'public') =>
                  setSettings({ ...settings, accessLevel: value })
                }
              >
                <div className="flex items-start space-x-3 p-3 border rounded-md hover:bg-accent">
                  <RadioGroupItem value="private" id="private" />
                  <div className="flex-1">
                    <Label htmlFor="private" className="font-medium cursor-pointer">
                      Private
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Only you can view and edit this dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-md hover:bg-accent">
                  <RadioGroupItem value="team" id="team" />
                  <div className="flex-1">
                    <Label htmlFor="team" className="font-medium cursor-pointer">
                      Team
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone in your team can view this dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-md hover:bg-accent">
                  <RadioGroupItem value="public" id="public" />
                  <div className="flex-1">
                    <Label htmlFor="public" className="font-medium cursor-pointer">
                      Public
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone with the link can view this dashboard
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-muted border rounded-lg p-4 mt-4">
              <h4 className="text-sm font-medium mb-2">Sharing Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Dashboard ID: {dashboardId}</p>
                <p>• Current access level: <span className="capitalize font-medium text-foreground">{settings.accessLevel}</span></p>
                <p>• Created: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </TabsContent>

          {/* Display Options Tab */}
          <TabsContent value="display" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label>Display Options</Label>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 border rounded-md">
                  <Checkbox
                    id="show-toolbar"
                    checked={settings.displayOptions.showToolbar}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        displayOptions: {
                          ...settings.displayOptions,
                          showToolbar: checked === true,
                        },
                      })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="show-toolbar" className="font-medium cursor-pointer">
                      Show Toolbar
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display the editing toolbar at the top of the dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-md">
                  <Checkbox
                    id="show-filters"
                    checked={settings.displayOptions.showFilters}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        displayOptions: {
                          ...settings.displayOptions,
                          showFilters: checked === true,
                        },
                      })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="show-filters" className="font-medium cursor-pointer">
                      Show Filters
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display filter controls for viewers
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-md">
                  <Checkbox
                    id="auto-refresh"
                    checked={settings.displayOptions.autoRefresh}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        displayOptions: {
                          ...settings.displayOptions,
                          autoRefresh: checked === true,
                        },
                      })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="auto-refresh" className="font-medium cursor-pointer">
                      Auto-refresh Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically refresh data based on the refresh interval
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Display Preview
              </h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• Toolbar: {settings.displayOptions.showToolbar ? 'Visible' : 'Hidden'}</p>
                <p>• Filters: {settings.displayOptions.showFilters ? 'Visible' : 'Hidden'}</p>
                <p>• Auto-refresh: {settings.displayOptions.autoRefresh ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
