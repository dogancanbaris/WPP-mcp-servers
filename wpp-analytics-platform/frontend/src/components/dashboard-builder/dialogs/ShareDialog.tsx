'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Link2,
  Code,
  Mail,
  Clock,
  Users,
  Copy,
  Check,
} from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  dashboardId: string;
  dashboardTitle: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  dashboardId,
  dashboardTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'embed' | 'email' | 'schedule'>('link');
  const [copied, setCopied] = useState(false);

  // Generate share link
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dashboard/${dashboardId}`
    : `https://app.example.com/dashboard/${dashboardId}`;

  // Generate embed code
  const embedCode = `<iframe src="${shareUrl}?embed=true" width="100%" height="600" frameborder="0"></iframe>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Dashboard</DialogTitle>
          <DialogDescription>
            Share "{dashboardTitle}" with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('link')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'link'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Link2 className="w-4 h-4" />
              Get Link
            </button>
            <button
              onClick={() => setActiveTab('embed')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'embed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Code className="w-4 h-4" />
              Embed
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'email'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'schedule'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Clock className="w-4 h-4" />
              Schedule
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-4">
            {activeTab === 'link' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="share-link">Dashboard URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="share-link"
                      value={shareUrl}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleCopy(shareUrl)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Share Settings
                  </h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      Anyone with the link can view
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Allow viewers to make a copy
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Require authentication
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'embed' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="embed-code">Embed Code</Label>
                  <div className="mt-2">
                    <textarea
                      id="embed-code"
                      value={embedCode}
                      readOnly
                      rows={4}
                      className="w-full px-3 py-2 text-sm font-mono border rounded-md bg-gray-50"
                    />
                  </div>
                  <Button
                    onClick={() => handleCopy(embedCode)}
                    variant="outline"
                    size="sm"
                    className="mt-2 flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Embed Options</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Responsive iframe that adapts to container width</p>
                    <p>• Filters and controls enabled by default</p>
                    <p>• Auto-refresh interval: 5 minutes</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email-recipients">Recipients</Label>
                  <Input
                    id="email-recipients"
                    type="email"
                    placeholder="Enter email addresses (comma-separated)"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email-message">Message (optional)</Label>
                  <textarea
                    id="email-message"
                    placeholder="Add a personal message..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border rounded-md mt-2"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Email sharing coming soon! Recipients will receive a link to view this dashboard.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button disabled>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="schedule-frequency">Delivery Frequency</Label>
                  <select
                    id="schedule-frequency"
                    className="w-full px-3 py-2 text-sm border rounded-md mt-2"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="schedule-recipients">Recipients</Label>
                  <Input
                    id="schedule-recipients"
                    type="email"
                    placeholder="Enter email addresses"
                    className="mt-2"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Scheduled delivery coming soon! Automatically send dashboard snapshots on a recurring schedule.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button disabled>
                    <Clock className="w-4 h-4 mr-2" />
                    Create Schedule
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Manage Access Section */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => console.log('Manage access')}
            >
              <Users className="w-4 h-4" />
              Manage Access Permissions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
