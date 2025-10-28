import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GlobalFilters } from '../../GlobalFilters';
import { ThemeEditor } from '../../ThemeEditor';

export const GlobalPanel: React.FC = () => {
  const [showTheme, setShowTheme] = useState(false);

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
