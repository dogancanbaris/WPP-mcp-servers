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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Square, Circle as CircleIcon, Minus } from 'lucide-react';
import type { ComponentConfig } from '@/types/dashboard-builder';

interface InsertShapeDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (component: ComponentConfig) => void;
}

type ShapeType = 'rectangle' | 'circle' | 'line';

export const InsertShapeDialog: React.FC<InsertShapeDialogProps> = ({
  open,
  onClose,
  onInsert,
}) => {
  const [shapeType, setShapeType] = useState<ShapeType>('rectangle');
  const [width, setWidth] = useState('200');
  const [height, setHeight] = useState('100');
  const [fillColor, setFillColor] = useState('#191D63'); // WPP Blue
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState('2');

  // Validation
  const widthNum = parseInt(width, 10);
  const heightNum = parseInt(height, 10);
  const borderWidthNum = parseInt(borderWidth, 10);
  const isValid =
    widthNum > 0 &&
    widthNum <= 2000 &&
    heightNum > 0 &&
    heightNum <= 2000 &&
    borderWidthNum >= 0 &&
    borderWidthNum <= 10;

  const handleInsert = () => {
    if (!isValid) return;

    const shapeComponent: ComponentConfig = {
      id: `${shapeType}-${Date.now()}`,
      type: shapeType,
      title: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
      showTitle: false,
      // Store shape properties using existing fields
      fontSize: width,
      fontWeight: height,
      color: fillColor,
      borderColor,
      borderWidth: borderWidthNum,
      showBorder: borderWidthNum > 0,
    };

    onInsert(shapeComponent);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setShapeType('rectangle');
    setWidth('200');
    setHeight('100');
    setFillColor('#191D63');
    setBorderColor('#000000');
    setBorderWidth('2');
    onClose();
  };

  // Render shape preview
  const renderShapePreview = () => {
    const previewScale = 0.5; // Scale down for preview
    const previewWidth = Math.min(widthNum * previewScale, 200);
    const previewHeight = Math.min(heightNum * previewScale, 200);

    switch (shapeType) {
      case 'rectangle':
        return (
          <div
            style={{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              backgroundColor: fillColor,
              border: `${borderWidthNum}px solid ${borderColor}`,
            }}
          />
        );
      case 'circle':
        const size = Math.min(previewWidth, previewHeight);
        return (
          <div
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: fillColor,
              border: `${borderWidthNum}px solid ${borderColor}`,
              borderRadius: '50%',
            }}
          />
        );
      case 'line':
        return (
          <div
            style={{
              width: `${previewWidth}px`,
              height: `${borderWidthNum}px`,
              backgroundColor: borderColor,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Shape</DialogTitle>
          <DialogDescription>
            Add a geometric shape to your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Shape Type Tabs */}
          <div className="space-y-2">
            <Label>Shape Type</Label>
            <Tabs value={shapeType} onValueChange={(v) => setShapeType(v as ShapeType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rectangle">
                  <Square className="h-4 w-4 mr-2" />
                  Rectangle
                </TabsTrigger>
                <TabsTrigger value="circle">
                  <CircleIcon className="h-4 w-4 mr-2" />
                  Circle
                </TabsTrigger>
                <TabsTrigger value="line">
                  <Minus className="h-4 w-4 mr-2" />
                  Line
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Size Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shape-width">
                {shapeType === 'line' ? 'Length' : shapeType === 'circle' ? 'Diameter' : 'Width'} (px)
              </Label>
              <Input
                id="shape-width"
                type="number"
                min="10"
                max="2000"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>

            {shapeType !== 'line' && (
              <div className="space-y-2">
                <Label htmlFor="shape-height">
                  {shapeType === 'circle' ? 'Diameter' : 'Height'} (px)
                </Label>
                <Input
                  id="shape-height"
                  type="number"
                  min="10"
                  max="2000"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  disabled={shapeType === 'circle'} // Circle uses same value for width/height
                />
              </div>
            )}
          </div>

          {/* Fill Color (not for lines) */}
          {shapeType !== 'line' && (
            <div className="space-y-2">
              <Label htmlFor="fill-color">Fill Color</Label>
              <div className="flex gap-2">
                <Input
                  id="fill-color"
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  placeholder="#191D63"
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* Border/Line Color */}
          <div className="space-y-2">
            <Label htmlFor="border-color">
              {shapeType === 'line' ? 'Line Color' : 'Border Color'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="border-color"
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          {/* Border Width */}
          <div className="space-y-2">
            <Label htmlFor="border-width">
              {shapeType === 'line' ? 'Line Thickness' : 'Border Width'} (px)
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="border-width"
                type="range"
                min="0"
                max="10"
                value={borderWidth}
                onChange={(e) => setBorderWidth(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                min="0"
                max="10"
                value={borderWidth}
                onChange={(e) => setBorderWidth(e.target.value)}
                className="w-20"
              />
            </div>
          </div>

          {/* Shape Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className={cn(
                'min-h-[200px] p-8 rounded-lg border-2 border-dashed',
                'bg-muted/30 flex items-center justify-center'
              )}
            >
              {renderShapePreview()}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Preview scaled to 50%
            </p>
          </div>

          {/* Validation Messages */}
          {!isValid && (
            <div className="text-sm text-destructive space-y-1">
              {(widthNum <= 0 || widthNum > 2000) && (
                <p>Width must be between 1 and 2000 pixels</p>
              )}
              {(heightNum <= 0 || heightNum > 2000) && (
                <p>Height must be between 1 and 2000 pixels</p>
              )}
              {(borderWidthNum < 0 || borderWidthNum > 10) && (
                <p>Border width must be between 0 and 10 pixels</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!isValid}>
            Insert Shape
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
