'use client';

import React, { useState, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Upload, Link2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ComponentConfig } from '@/types/dashboard-builder';

interface InsertImageDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (component: ComponentConfig) => void;
}

type SizeMode = 'original' | 'fit' | 'fill' | 'custom';

export const InsertImageDialog: React.FC<InsertImageDialogProps> = ({
  open,
  onClose,
  onInsert,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [altText, setAltText] = useState('');
  const [sizeMode, setSizeMode] = useState<SizeMode>('fit');
  const [customWidth, setCustomWidth] = useState('400');
  const [customHeight, setCustomHeight] = useState('300');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation
  const currentImageSrc = activeTab === 'upload' ? uploadedImage : imageUrl;
  const isValid = !!currentImageSrc && altText.trim().length > 0;

  const handleFileSelect = (file: File) => {
    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setUploadedFileName(file.name);
      // Auto-generate alt text from filename
      if (!altText) {
        setAltText(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setError('');

    // Auto-generate alt text from URL
    if (!altText && url) {
      const filename = url.split('/').pop()?.split('?')[0] || '';
      setAltText(filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleInsert = () => {
    if (!isValid) return;

    const imageComponent: ComponentConfig = {
      id: `image-${Date.now()}`,
      type: 'image',
      title: altText,
      showTitle: false,
      // Store image data in component config
      text: currentImageSrc, // Use text field to store image URL/data
      // Store size settings
      fontFamily: sizeMode, // Reuse fontFamily field for size mode
      fontSize: customWidth,
      fontWeight: customHeight,
    };

    onInsert(imageComponent);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setActiveTab('upload');
    setImageUrl('');
    setUploadedImage(null);
    setUploadedFileName('');
    setAltText('');
    setSizeMode('fit');
    setCustomWidth('400');
    setCustomHeight('300');
    setError('');
    setIsDragging(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Upload an image file or provide an image URL
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tabs: Upload or URL */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="url">
                <Link2 className="h-4 w-4 mr-2" />
                Image URL
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8',
                    'flex flex-col items-center justify-center gap-4',
                    'transition-colors cursor-pointer',
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drop image here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF, WebP up to 5MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
                {uploadedFileName && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {uploadedFileName}
                  </p>
                )}
              </div>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a publicly accessible image URL
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">
              Alt Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
            <p className="text-xs text-muted-foreground">
              Required for accessibility. Describe what the image shows.
            </p>
          </div>

          {/* Size Options */}
          <div className="space-y-3">
            <Label>Size Options</Label>
            <RadioGroup value={sizeMode} onValueChange={(v) => setSizeMode(v as SizeMode)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="original" id="size-original" />
                <Label htmlFor="size-original" className="font-normal cursor-pointer">
                  Original size
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fit" id="size-fit" />
                <Label htmlFor="size-fit" className="font-normal cursor-pointer">
                  Fit to container (maintain aspect ratio)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fill" id="size-fill" />
                <Label htmlFor="size-fill" className="font-normal cursor-pointer">
                  Fill container (may crop)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="size-custom" />
                <Label htmlFor="size-custom" className="font-normal cursor-pointer">
                  Custom size
                </Label>
              </div>
            </RadioGroup>

            {/* Custom Size Inputs */}
            {sizeMode === 'custom' && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="custom-width">Width (px)</Label>
                  <Input
                    id="custom-width"
                    type="number"
                    min="50"
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
                    min="50"
                    max="2000"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image Preview */}
          {currentImageSrc && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center min-h-[200px]">
                <img
                  src={currentImageSrc}
                  alt={altText || 'Preview'}
                  className={cn(
                    'max-w-full',
                    sizeMode === 'original' && 'w-auto h-auto',
                    sizeMode === 'fit' && 'max-h-[300px] object-contain',
                    sizeMode === 'fill' && 'w-full h-[300px] object-cover',
                    sizeMode === 'custom' && 'object-contain'
                  )}
                  style={
                    sizeMode === 'custom'
                      ? { width: `${customWidth}px`, height: `${customHeight}px` }
                      : undefined
                  }
                  onError={() => setError('Failed to load image')}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!isValid}>
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
