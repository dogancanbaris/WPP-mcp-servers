/**
 * Export Templates Panel Component
 *
 * Save and manage export configuration templates
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useExportTemplates } from '@/lib/export/use-enhanced-export';
import {
  Bookmark,
  Plus,
  Trash2,
  FileDown,
  Calendar,
  Mail,
  Filter,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ExportOptions } from '@/lib/export/enhanced-export';

// ============================================================================
// Template Card Component
// ============================================================================

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description?: string;
    options: Partial<ExportOptions>;
    createdAt: Date;
    updatedAt: Date;
  };
  onUse: () => void;
  onDelete: () => void;
}

function TemplateCard({ template, onUse, onDelete }: TemplateCardProps) {
  const { options } = template;

  return (
    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{template.name}</div>
          {template.description && (
            <div className="text-sm text-muted-foreground mt-1">{template.description}</div>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onUse}>
            <FileDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.format && (
          <Badge variant="secondary" className="text-xs">
            {options.format.toUpperCase()}
          </Badge>
        )}

        {options.scheduled && options.frequency && (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {options.frequency}
          </Badge>
        )}

        {options.emailDelivery?.enabled && (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Email
          </Badge>
        )}

        {options.filters && options.filters.length > 0 && (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {options.filters.length} filter(s)
          </Badge>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Created {formatDistanceToNow(template.createdAt, { addSuffix: true })}
      </div>
    </div>
  );
}

// ============================================================================
// Save Template Dialog
// ============================================================================

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string, options: Partial<ExportOptions>) => void;
  currentOptions?: Partial<ExportOptions>;
}

function SaveTemplateDialog({
  open,
  onOpenChange,
  onSave,
  currentOptions,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, description, currentOptions || {});
      setName('');
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Export Template</DialogTitle>
          <DialogDescription>
            Save your current export configuration as a reusable template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              placeholder="e.g., Monthly Report PDF"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateDescription">Description (optional)</Label>
            <Input
              id="templateDescription"
              placeholder="e.g., PDF export with charts and email delivery"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {currentOptions && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="text-sm font-medium">Template Configuration:</div>
              <div className="text-xs text-muted-foreground space-y-1">
                {currentOptions.format && <div>Format: {currentOptions.format.toUpperCase()}</div>}
                {currentOptions.scheduled && (
                  <div>Scheduled: {currentOptions.frequency}</div>
                )}
                {currentOptions.emailDelivery?.enabled && (
                  <div>Email: {currentOptions.emailDelivery.recipients.length} recipient(s)</div>
                )}
                {currentOptions.filters && currentOptions.filters.length > 0 && (
                  <div>Filters: {currentOptions.filters.length}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Bookmark className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ExportTemplatesPanel() {
  const { templates, save, remove, refresh } = useExportTemplates();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleUseTemplate = (templateId: string) => {
    // This would typically trigger an export with the template options
    console.log('Using template:', templateId);
    // In a real implementation, this would open the export dialog with pre-filled options
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      remove(templateId);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Export Templates
              </CardTitle>
              <CardDescription>Save and reuse export configurations</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No templates saved yet</p>
              <p className="text-sm">Create a template to reuse export settings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={() => handleUseTemplate(template.id)}
                  onDelete={() => handleDeleteTemplate(template.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SaveTemplateDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={save}
      />
    </>
  );
}
