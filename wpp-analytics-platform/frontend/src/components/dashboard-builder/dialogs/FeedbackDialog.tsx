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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

type FeedbackType = 'positive' | 'negative' | 'suggestion' | 'question';

interface FormState {
  feedbackType: FeedbackType;
  message: string;
  email: string;
  context: string;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    feedbackType: 'suggestion',
    message: '',
    email: '',
    context: '',
  });

  // Auto-fill context when dialog opens
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      const pageUrl = window.location.pathname;
      const pageName = pageUrl.includes('builder') ? 'Dashboard Builder' : 'Dashboard';
      setFormState((prev) => ({
        ...prev,
        context: `${pageName} - ${pageUrl}`,
      }));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formState.message.trim()) {
      toast.error('Please enter your feedback message');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save feedback to Supabase
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: formState.feedbackType,
          message: formState.message,
          email: formState.email || null,
          context: formState.context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success('Feedback submitted successfully!', {
        description: 'Thank you for helping us improve.',
        icon: <CheckCircle className="w-4 h-4" />,
      });

      // Reset form
      setFormState({
        feedbackType: 'suggestion',
        message: '',
        email: '',
        context: window.location.pathname,
      });

      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback', {
        description: 'Please try again or contact support.',
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Send Feedback
          </DialogTitle>
          <DialogDescription>
            Share your thoughts, suggestions, or questions about the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Feedback Type */}
          <div className="space-y-3">
            <Label>Feedback Type *</Label>
            <RadioGroup
              value={formState.feedbackType}
              onValueChange={(value: FeedbackType) =>
                setFormState((prev) => ({ ...prev, feedbackType: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="positive" id="positive" />
                <Label htmlFor="positive" className="font-normal cursor-pointer">
                  😊 Positive - Something you love
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="negative" id="negative" />
                <Label htmlFor="negative" className="font-normal cursor-pointer">
                  😞 Negative - Something that needs improvement
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suggestion" id="suggestion" />
                <Label htmlFor="suggestion" className="font-normal cursor-pointer">
                  💡 Suggestion - An idea for a new feature
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="question" id="question" />
                <Label htmlFor="question" className="font-normal cursor-pointer">
                  ❓ Question - Something you need help with
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Your Message *</Label>
            <Textarea
              id="feedback-message"
              placeholder="Tell us what you think..."
              rows={6}
              value={formState.message}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, message: e.target.value }))
              }
              required
            />
          </div>

          {/* Email (optional) */}
          <div className="space-y-2">
            <Label htmlFor="feedback-email">Email (optional)</Label>
            <Input
              id="feedback-email"
              type="email"
              placeholder="your.email@example.com"
              value={formState.email}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Provide your email if you'd like us to follow up with you
            </p>
          </div>

          {/* Context (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="feedback-context">Current Page</Label>
            <Input
              id="feedback-context"
              value={formState.context}
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
                  Sending...
                </>
              ) : (
                'Send Feedback'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
