import React, { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlobalFilters } from '../../GlobalFilters';
import { ThemeEditor } from '../../ThemeEditor';
import { ThemeManager, type Theme } from '@/lib/themes';

export const GlobalPanel: React.FC = () => {
  const [showTheme, setShowTheme] = useState(false);
  const activeTheme = useMemo<Theme>(() => ThemeManager.getActiveTheme(), []);
  const [primary, setPrimary] = useState(activeTheme.colors.primary);
  const [background, setBackground] = useState(activeTheme.colors.background);
  const [text, setText] = useState(activeTheme.colors.text);
  const isHex = (c?: string) => (c ? /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c) : false);

  return (
    <div className="p-4">
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="filters" className="text-xs">Filters</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs">Theme</TabsTrigger>
          <TabsTrigger value="defaults" className="text-xs">Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Global Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <GlobalFilters showAddButton={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Theme Tweaks</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 items-end">
              <div>
                <Label className="text-xs">Primary</Label>
                <div className="flex gap-2 items-center">
                  <Input type="color" value={primary} onChange={(e)=> setPrimary(e.target.value)} className="h-8 w-12 p-0" />
                  <Input value={primary} onChange={(e)=> setPrimary(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Background</Label>
                <div className="flex gap-2 items-center">
                  <Input type="color" value={background} onChange={(e)=> setBackground(e.target.value)} className="h-8 w-12 p-0" />
                  <Input value={background} onChange={(e)=> setBackground(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Text</Label>
                <div className="flex gap-2 items-center">
                  <Input type="color" value={text} onChange={(e)=> setText(e.target.value)} className="h-8 w-12 p-0" />
                  <Input value={text} onChange={(e)=> setText(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <div className="col-span-3 flex gap-2">
                <Button
                  size="sm"
                  disabled={!isHex(primary) || !isHex(background) || !isHex(text)}
                  onClick={() => {
                    const base = ThemeManager.getActiveTheme();
                    const updated: Theme = {
                      ...base,
                      id: base.isCustom ? base.id : `custom-inline-${Date.now()}`,
                      isCustom: true,
                      colors: {
                        ...base.colors,
                        primary,
                        background,
                        text,
                      },
                      updatedAt: new Date().toISOString(),
                    } as Theme;
                    ThemeManager.saveTheme(updated);
                    ThemeManager.setActiveTheme(updated.id);
                    ThemeManager.applyThemeToDom(updated);
                  }}
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Report Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Open the Theme Editor to customize colors, typography, spacing and effects.</p>
              <Button size="sm" onClick={() => setShowTheme(true)}>Open Theme Editor</Button>
            </CardContent>
          </Card>
          {showTheme && (
            <div className="fixed inset-0 z-50 bg-black/50 flex">
              <div className="bg-background w-full h-full">
                <ThemeEditor onClose={() => setShowTheme(false)} />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="defaults" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Defaults</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Optional: Define default styles for new components (future).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalPanel;
