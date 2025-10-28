'use client';

import React, { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Globe, Youtube, Film, FileSpreadsheet, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import type { ComponentConfig } from '@/types/dashboard-builder';

interface InsertEmbedDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (component: ComponentConfig) => void;
}

type EmbedType = 'youtube' | 'vimeo' | 'google-sheets' | 'google-docs' | 'website';
type EmbedSize = 'small' | 'medium' | 'large' | 'custom';

interface EmbedSizeConfig {
  width: number;
  height: number;
}

const EMBED_SIZES: Record<Exclude<EmbedSize, 'custom'>, EmbedSizeConfig> = {
  small: { width: 400, height: 300 },
  medium: { width: 600, height: 400 },
  large: { width: 800, height: 600 },
};

export const InsertEmbedDialog: React.FC<InsertEmbedDialogProps> = ({
  open,
  onClose,
  onInsert,
}) => {
  const [embedUrl, setEmbedUrl] = useState('');
  const [sizeMode, setSizeMode] = useState<EmbedSize>('medium');
  const [customWidth, setCustomWidth] = useState('600');
  const [customHeight, setCustomHeight] = useState('400');
  const [allowFullscreen, setAllowFullscreen] = useState(true);

  // Auto-detect embed type from URL
  const detectedType = useMemo((): { type: EmbedType; embedUrl: string; icon: React.ReactNode } => {
    if (!embedUrl) {
      return { type: 'website', embedUrl: '', icon: <Globe className="h-5 w-5" /> };
    }

    const url = embedUrl.toLowerCase();

    // YouTube detection
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch')) {
        const match = embedUrl.match(/[?&]v=([^&]+)/);
        videoId = match?.[1] || '';
      } else if (url.includes('youtu.be/')) {
        const match = embedUrl.match(/youtu\.be\/([^?]+)/);
        videoId = match?.[1] || '';
      }
      return {
        type: 'youtube',
        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : embedUrl,
        icon: <Youtube className="h-5 w-5" />,
      };
    }

    // Vimeo detection
    if (url.includes('vimeo.com')) {
      const match = embedUrl.match(/vimeo\.com\/(\d+)/);
      const videoId = match?.[1] || '';
      return {
        type: 'vimeo',
        embedUrl: videoId ? `https://player.vimeo.com/video/${videoId}` : embedUrl,
        icon: <Film className="h-5 w-5" />,
      };
    }

    // Google Sheets detection
    if (url.includes('docs.google.com/spreadsheets')) {
      let sheetUrl = embedUrl;
      if (!url.includes('/embed')) {
        sheetUrl = embedUrl.replace('/edit', '/embed');
      }
      return {
        type: 'google-sheets',
        embedUrl: sheetUrl,
        icon: <FileSpreadsheet className="h-5 w-5" />,
      };
    }

    // Google Docs detection
    if (url.includes('docs.google.com/document')) {
      let docUrl = embedUrl;
      if (!url.includes('/embed')) {
        docUrl = embedUrl.replace('/edit', '/preview');
      }
      return {
        type: 'google-docs',
        embedUrl: docUrl,
        icon: <FileText className="h-5 w-5" />,
      };
    }

    // Generic website
    return {
      type: 'website',
      embedUrl: embedUrl,
      icon: <Globe className="h-5 w-5" />,
    };
  }, [embedUrl]);

  // Get embed dimensions
  const embedDimensions = useMemo(() => {
    if (sizeMode === 'custom') {
      return {
        width: parseInt(customWidth, 10) || 600,
        height: parseInt(customHeight, 10) || 400,
      };
    }
    return EMBED_SIZES[sizeMode];
  }, [sizeMode, customWidth, customHeight]);

  // Validation
  const isValidUrl = useMemo(() => {
    if (!embedUrl) return false;
    try {
      new URL(embedUrl);
      return true;
    } catch {
      return false;
    }
  }, [embedUrl]);

  const isValid =
    isValidUrl &&
    embedDimensions.width > 0 &&
    embedDimensions.width <= 2000 &&
    embedDimensions.height > 0 &&
    embedDimensions.height <= 2000;

  const handleInsert = () => {
    if (!isValid) return;

    const embedComponent: ComponentConfig = {
      id: `iframe-${Date.now()}`,
      type: 'iframe',
      title: `Embedded Content`,
      showTitle: false,
      // Store embed URL and settings
      text: detectedType.embedUrl || embedUrl,
      fontSize: embedDimensions.width.toString(),
      fontWeight: embedDimensions.height.toString(),
      fontFamily: allowFullscreen ? 'fullscreen' : 'no-fullscreen',
    };

    onInsert(embedComponent);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setEmbedUrl('');
    setSizeMode('medium');
    setCustomWidth('600');
    setCustomHeight('400');
    setAllowFullscreen(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Embedded Content</DialogTitle>
          <DialogDescription>
            Embed videos, documents, or websites using an iframe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Embed URL */}
          <div className="space-y-2">
            <Label htmlFor="embed-url">
              Content URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="embed-url"
              type="url"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {!isValidUrl && embedUrl && (
              <p className="text-sm text-destructive">Please enter a valid URL</p>
            )}
          </div>

          {/* Detected Type */}
          {embedUrl && isValidUrl && (
            <Alert>
              <div className="flex items-center gap-2">
                {detectedType.icon}
                <AlertDescription>
                  <span className="font-medium">Detected: </span>
                  {detectedType.type === 'youtube' && 'YouTube Video'}
                  {detectedType.type === 'vimeo' && 'Vimeo Video'}
                  {detectedType.type === 'google-sheets' && 'Google Sheets'}
                  {detectedType.type === 'google-docs' && 'Google Docs'}
                  {detectedType.type === 'website' && 'Generic Website'}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Size Options */}
          <div className="space-y-3">
            <Label htmlFor="size-mode">Size</Label>
            <Select value={sizeMode} onValueChange={(v) => setSizeMode(v as EmbedSize)}>
              <SelectTrigger id="size-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (400 × 300)</SelectItem>
                <SelectItem value="medium">Medium (600 × 400)</SelectItem>
                <SelectItem value="large">Large (800 × 600)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Size Inputs */}
          {sizeMode === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custom-width">Width (px)</Label>
                <Input
                  id="custom-width"
                  type="number"
                  min="200"
                  max="2000"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-height">Height (px)</Label>
                <Input
                  id="custom-height"
                  type="number"
                  min="150"
                  max="2000"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Allow Fullscreen */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allow-fullscreen"
              checked={allowFullscreen}
              onCheckedChange={(checked) => setAllowFullscreen(checked as boolean)}
            />
            <Label
              htmlFor="allow-fullscreen"
              className="font-normal cursor-pointer"
            >
              Allow fullscreen mode
            </Label>
          </div>

          {/* Preview */}
          {embedUrl && isValidUrl && detectedType.embedUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Preview</Label>
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Open in new tab
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div
                className={cn(
                  'rounded-lg border-2 border-dashed overflow-hidden',
                  'bg-muted/30'
                )}
              >
                <iframe
                  src={detectedType.embedUrl}
                  width="100%"
                  height="300"
                  style={{ border: 'none' }}
                  allow={allowFullscreen ? 'fullscreen' : ''}
                  title="Embed preview"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Preview may not display correctly for some websites due to security restrictions.
                The embed will work properly in your dashboard.
              </p>
            </div>
          )}

          {/* Supported Platforms */}
          <div className="space-y-2">
            <Label>Supported Platforms</Label>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
              </div>
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Vimeo
              </div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Google Sheets
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Google Docs
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Any Website
              </div>
            </div>
          </div>

          {/* Warning */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some websites may block embedding. If the content doesn't display, the website
              owner has disabled iframe embedding.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!isValid}>
            Insert Embed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
