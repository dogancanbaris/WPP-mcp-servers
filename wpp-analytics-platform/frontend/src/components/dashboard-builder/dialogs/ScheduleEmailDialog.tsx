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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Mail, Clock, Info } from 'lucide-react';

interface ScheduleEmailDialogProps {
  open: boolean;
  onClose: () => void;
  dashboardId: string;
  dashboardTitle: string;
  onSchedule: (schedule: EmailSchedule) => void;
}

export interface EmailSchedule {
  id?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  recipients: string[];
  time: string; // Format: "HH:00" (e.g., "09:00")
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  subject: string;
  body: string;
  enabled: boolean;
}

const DEFAULT_SCHEDULE: EmailSchedule = {
  frequency: 'daily',
  recipients: [],
  time: '09:00',
  subject: 'Dashboard Report: {{dashboard_name}}',
  body: 'Here is your scheduled dashboard report for {{date}}.\n\nView the full dashboard: {{dashboard_url}}',
  enabled: true,
};

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const TEMPLATE_VARIABLES = [
  { var: '{{dashboard_name}}', desc: 'Dashboard title' },
  { var: '{{dashboard_url}}', desc: 'Dashboard link' },
  { var: '{{date}}', desc: 'Current date' },
  { var: '{{time}}', desc: 'Current time' },
];

export const ScheduleEmailDialog: React.FC<ScheduleEmailDialogProps> = ({
  open,
  onClose,
  dashboardId,
  dashboardTitle,
  onSchedule,
}) => {
  const [schedule, setSchedule] = useState<EmailSchedule>({
    ...DEFAULT_SCHEDULE,
    subject: `Dashboard Report: ${dashboardTitle}`,
  });
  const [emailInput, setEmailInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleAddRecipient = () => {
    const email = emailInput.trim();
    if (email && isValidEmail(email) && !schedule.recipients.includes(email)) {
      setSchedule({
        ...schedule,
        recipients: [...schedule.recipients, email],
      });
      setEmailInput('');
    }
  };

  const handleRemoveRecipient = (emailToRemove: string) => {
    setSchedule({
      ...schedule,
      recipients: schedule.recipients.filter((email) => email !== emailToRemove),
    });
  };

  const handleEmailInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = schedule.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();
    setSchedule({ ...schedule, daysOfWeek: newDays });
  };

  const handleSchedule = () => {
    // Validation
    if (schedule.recipients.length === 0) {
      alert('Please add at least one recipient');
      return;
    }

    if (schedule.frequency === 'weekly' && (!schedule.daysOfWeek || schedule.daysOfWeek.length === 0)) {
      alert('Please select at least one day of the week');
      return;
    }

    if (schedule.frequency === 'monthly' && !schedule.dayOfMonth) {
      alert('Please select a day of the month');
      return;
    }

    // Save to localStorage (backend integration later)
    const scheduleId = `schedule-${dashboardId}-${Date.now()}`;
    const scheduleWithId = { ...schedule, id: scheduleId };

    // Get existing schedules
    const existingSchedules = JSON.parse(localStorage.getItem('emailSchedules') || '[]');
    localStorage.setItem('emailSchedules', JSON.stringify([...existingSchedules, scheduleWithId]));

    onSchedule(scheduleWithId);
    onClose();
  };

  const previewSubject = schedule.subject
    .replace('{{dashboard_name}}', dashboardTitle)
    .replace('{{date}}', new Date().toLocaleDateString())
    .replace('{{time}}', new Date().toLocaleTimeString());

  const previewBody = schedule.body
    .replace('{{dashboard_name}}', dashboardTitle)
    .replace('{{dashboard_url}}', `${window.location.origin}/dashboard/${dashboardId}`)
    .replace('{{date}}', new Date().toLocaleDateString())
    .replace('{{time}}', new Date().toLocaleTimeString());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule Email Delivery
          </DialogTitle>
          <DialogDescription>
            Set up automatic email delivery for "{dashboardTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Delivery Frequency</Label>
            <Select
              value={schedule.frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') =>
                setSchedule({ ...schedule, frequency: value })
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time picker */}
          <div className="space-y-2">
            <Label htmlFor="time">Delivery Time</Label>
            <Select
              value={schedule.time}
              onValueChange={(value) => setSchedule({ ...schedule, time: value })}
            >
              <SelectTrigger id="time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {`${hour}:00`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Days of week (for weekly) */}
          {schedule.frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={`
                      p-2 text-sm font-medium rounded-md border transition-colors
                      ${
                        schedule.daysOfWeek?.includes(day.value)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of month (for monthly) */}
          {schedule.frequency === 'monthly' && (
            <div className="space-y-2">
              <Label htmlFor="day-of-month">Day of Month</Label>
              <Select
                value={schedule.dayOfMonth?.toString() || ''}
                onValueChange={(value) =>
                  setSchedule({ ...schedule, dayOfMonth: parseInt(value) })
                }
              >
                <SelectTrigger id="day-of-month">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients</Label>
            <div className="flex gap-2">
              <Input
                id="recipients"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailInputKeyDown}
                placeholder="Enter email address (press Enter)"
              />
              <Button onClick={handleAddRecipient} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {schedule.recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {schedule.recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {email}
                    <button
                      onClick={() => handleRemoveRecipient(email)}
                      className="hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Email Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={schedule.subject}
              onChange={(e) => setSchedule({ ...schedule, subject: e.target.value })}
              placeholder="Enter email subject"
            />
          </div>

          {/* Email Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              value={schedule.body}
              onChange={(e) => setSchedule({ ...schedule, body: e.target.value })}
              placeholder="Enter email body"
              rows={6}
            />
          </div>

          {/* Template Variables */}
          <div className="bg-muted border rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Template Variables</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {TEMPLATE_VARIABLES.map((tv) => (
                    <div key={tv.var}>
                      <code className="bg-background px-1 py-0.5 rounded">{tv.var}</code> - {tv.desc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-preview"
              checked={showPreview}
              onCheckedChange={(checked) => setShowPreview(checked === true)}
            />
            <Label htmlFor="show-preview" className="cursor-pointer">
              Show preview
            </Label>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
              <h4 className="text-sm font-medium">Email Preview</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                  <p className="text-sm font-medium">{previewSubject}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Body:</p>
                  <p className="text-sm whitespace-pre-wrap">{previewBody}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>
            <Clock className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
