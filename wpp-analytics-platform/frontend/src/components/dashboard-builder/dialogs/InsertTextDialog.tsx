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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentConfig } from '@/types/dashboard-builder';

interface InsertTextDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (component: ComponentConfig) => void;
}

const FONT_FAMILIES = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'arial', label: 'Arial' },
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times', label: 'Times New Roman' },
];

const FONT_SIZES = Array.from({ length: 31 }, (_, i) => (i + 1) * 2 + 10); // 12-72px

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
];

export const InsertTextDialog: React.FC<InsertTextDialogProps> = ({
  open,
  onClose,
  onInsert,
}) => {
  const [text, setText] = useState('Enter your text here');
  const [fontFamily, setFontFamily] = useState('roboto');
  const [fontSize, setFontSize] = useState('16');
  const [fontWeight, setFontWeight] = useState('400');
  const [color, setColor] = useState('#111827');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  // Validation
  const isValid = text.trim().length > 0;

  const handleInsert = () => {
    if (!isValid) return;

    const textComponent: ComponentConfig = {
      id: `text-${Date.now()}`,
      type: 'text',
      text,
      fontFamily,
      fontSize,
      fontWeight,
      color,
      alignment,
      // Set title properties same as text properties for consistency
      title: text.split('\n')[0].substring(0, 50), // First line as title
      showTitle: false, // Hide default title since we're showing custom text
    };

    onInsert(textComponent);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setText('Enter your text here');
    setFontFamily('roboto');
    setFontSize('16');
    setFontWeight('400');
    setColor('#111827');
    setAlignment('left');
    onClose();
  };

  // Live preview style
  const previewStyle = useMemo(
    () => ({
      fontFamily: fontFamily === 'times' ? '"Times New Roman", serif' : fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      color,
      textAlign: alignment,
    }),
    [fontFamily, fontSize, fontWeight, color, alignment]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Text</DialogTitle>
          <DialogDescription>
            Add formatted text content to your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Text Content */}
          <div className="space-y-2">
            <Label htmlFor="text-content">Text Content</Label>
            <Textarea
              id="text-content"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here..."
              rows={4}
              className="resize-none"
            />
            {!isValid && (
              <p className="text-sm text-destructive">Text content is required</p>
            )}
          </div>

          {/* Font Settings */}
          <div className="grid grid-cols-2 gap-4">
            {/* Font Family */}
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger id="font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {FONT_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <Label htmlFor="font-weight">Font Weight</Label>
              <Select value={fontWeight} onValueChange={setFontWeight}>
                <SelectTrigger id="font-weight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <ToggleGroup
              type="single"
              value={alignment}
              onValueChange={(value) => value && setAlignment(value as typeof alignment)}
              className="justify-start"
            >
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="justify" aria-label="Justify">
                <AlignJustify className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className={cn(
                'min-h-[100px] p-4 rounded-lg border-2 border-dashed',
                'bg-muted/30 overflow-auto'
              )}
            >
              <div style={previewStyle} className="whitespace-pre-wrap break-words">
                {text || 'Enter your text here'}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!isValid}>
            Insert Text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
