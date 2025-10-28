'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ReportIssueDialogProps {
  open: boolean;
  onClose: () => void;
}

type IssueCategory = 'Bug' | 'Feature Request' | 'Question' | 'Documentation';
type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

interface FormState {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  browserInfo: string;
}

export const ReportIssueDialog: React.FC<ReportIssueDialogProps> = ({
  open,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    category: 'Bug',
    priority: 'Medium',
    browserInfo: '',
  });

  // Auto-fill browser info when dialog opens
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      setFormState((prev) => ({
        ...prev,
        browserInfo: navigator.userAgent,
      }));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formState.title.trim()) {
      toast.error('Please enter an issue title');
      return;
    }

    if (!formState.description.trim()) {
      toast.error('Please enter an issue description');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create issue in Linear via MCP tool
      const response = await fetch('/api/mcp/linear/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formState.title,
          description: `${formState.description}\n\n---\n**Browser:** ${formState.browserInfo}\n**Category:** ${formState.category}\n**Priority:** ${formState.priority}`,
          team: 'wpp-analytics', // Default team
          priority: getPriorityNumber(formState.priority),
          labels: [formState.category.toLowerCase().replace(' ', '-')],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create issue');
      }

      const result = await response.json();

      toast.success('Issue reported successfully!', {
        description: `Issue #${result.issueId || ''} created in Linear`,
        icon: <CheckCircle className="w-4 h-4" />,
      });

      // Reset form
      setFormState({
        title: '',
        description: '',
        category: 'Bug',
        priority: 'Medium',
        browserInfo: navigator.userAgent,
      });

      onClose();
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue', {
        description: 'Please try again or contact support.',
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityNumber = (priority: IssuePriority): number => {
    const priorityMap: Record<IssuePriority, number> = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };
    return priorityMap[priority];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Help us improve by reporting bugs, requesting features, or asking questions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Issue Title */}
          <div className="space-y-2">
            <Label htmlFor="issue-title">Issue Title *</Label>
            <Input
              id="issue-title"
              placeholder="Brief description of the issue"
              value={formState.title}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          {/* Issue Description */}
          <div className="space-y-2">
            <Label htmlFor="issue-description">Description *</Label>
            <Textarea
              id="issue-description"
              placeholder="Provide details about the issue, including steps to reproduce..."
              rows={6}
              value={formState.description}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, description: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="issue-category">Category</Label>
              <Select
                value={formState.category}
                onValueChange={(value: IssueCategory) =>
                  setFormState((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger id="issue-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="Question">Question</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="issue-priority">Priority</Label>
              <Select
                value={formState.priority}
                onValueChange={(value: IssuePriority) =>
                  setFormState((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger id="issue-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Browser Info (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="browser-info">Browser Information</Label>
            <Input
              id="browser-info"
              value={formState.browserInfo}
              readOnly
              className="text-xs text-muted-foreground bg-muted/50"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Issue'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
