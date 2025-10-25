'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  Share2,
  Eye,
  Save,
  User,
  Loader2,
  Check,
  Clock,
  Link2,
  Code,
  Mail,
  Settings,
  LogOut,
  ChevronDown,
  History,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { VersionHistory } from '@/components/dashboard-builder/VersionHistory';
import type { DashboardVersion } from '@/lib/version-history';

interface ActionButtonsProps {
  dashboardId: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ dashboardId }) => {
  const { isDirty, isSaving, save, config, loadDashboard } = useDashboardStore();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const handleSave = async () => {
    try {
      await save(dashboardId);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    }
  };

  const handleShare = (method: 'link' | 'embed' | 'email') => {
    switch (method) {
      case 'link':
        // TODO: Copy dashboard link to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/dashboard/${dashboardId}`);
        console.log('Link copied to clipboard');
        break;
      case 'embed':
        // TODO: Generate embed code
        const embedCode = `<iframe src="${window.location.origin}/dashboard/${dashboardId}/embed" width="100%" height="600"></iframe>`;
        navigator.clipboard.writeText(embedCode);
        console.log('Embed code copied to clipboard');
        break;
      case 'email':
        // TODO: Open email share dialog
        console.log('Share via email');
        break;
    }
  };

  const handleToggleView = () => {
    setViewMode(viewMode === 'edit' ? 'preview' : 'edit');
  };

  const handleAgentAssist = () => {
    // TODO: Send prompt to AI agent
    console.log('Agent prompt:', agentPrompt);
    setShowAgentDialog(false);
    setAgentPrompt('');
  };

  const handleUserAction = (action: 'settings' | 'logout') => {
    switch (action) {
      case 'settings':
        // TODO: Navigate to settings
        console.log('Open settings');
        break;
      case 'logout':
        // TODO: Logout user
        console.log('Logout');
        break;
    }
  };

  const handleVersionRestore = async (version: DashboardVersion) => {
    // Reload the dashboard to reflect the restored version
    await loadDashboard(dashboardId);
    setShowVersionHistory(false);
    setLastSaved(new Date());
  };

  const formatLastSaved = (date: Date | null): string => {
    if (!date) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 10) return 'just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Agent Assistant Button (NEW) */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAgentDialog(true)}
          title="AI Agent Assistant"
          className="h-8 px-3 text-xs gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 border-violet-300 dark:border-violet-700"
        >
          <Bot className="h-4 w-4" />
          Agent
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Share Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              title="Share Dashboard"
              className="h-8 px-2 text-xs gap-1"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleShare('link')}>
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('embed')}>
              <Code className="h-4 w-4 mr-2" />
              Copy Embed Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('email')}>
              <Mail className="h-4 w-4 mr-2" />
              Share via Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View/Preview Toggle */}
        <Button
          size="sm"
          variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
          onClick={handleToggleView}
          title={viewMode === 'edit' ? 'Preview Mode' : 'Edit Mode'}
          className="h-8 px-2 text-xs gap-1"
        >
          <Eye className="h-4 w-4" />
          {viewMode === 'edit' ? 'Preview' : 'Edit'}
        </Button>

        {/* Version History Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowVersionHistory(true)}
          title="Version History"
          className="h-8 px-2 text-xs gap-1"
        >
          <History className="h-4 w-4" />
          History
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Save Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-[120px]">
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isDirty ? (
            <>
              <Clock className="h-3.5 w-3.5" />
              <span>Unsaved</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span>{formatLastSaved(lastSaved)}</span>
            </>
          ) : null}
        </div>

        {/* Save Button */}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          title="Save (Ctrl+S)"
          className="h-8 px-3 text-xs gap-1"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full"
              title="User Menu"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                U
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm">
              <div className="font-medium">User Name</div>
              <div className="text-xs text-muted-foreground">user@example.com</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleUserAction('settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleUserAction('logout')}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Agent Assistant Dialog */}
      <Dialog open={showAgentDialog} onOpenChange={setShowAgentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-violet-600" />
              AI Agent Assistant
            </DialogTitle>
            <DialogDescription>
              Describe what you'd like to create or modify, and the AI agent will help you build it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="agent-prompt" className="text-sm font-medium">
                What would you like to do?
              </label>
              <Textarea
                id="agent-prompt"
                placeholder="E.g., 'Create a dashboard showing Google Ads performance with 4 scorecards and a time series chart'"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                The agent will analyze your request and create components automatically.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAgentDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAgentAssist}
                  disabled={!agentPrompt.trim()}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <VersionHistory
        dashboardId={dashboardId}
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
        onRestore={handleVersionRestore}
      />
    </>
  );
};
