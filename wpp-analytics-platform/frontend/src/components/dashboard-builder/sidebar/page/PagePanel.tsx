import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardStore, usePages, useCurrentPageId } from '@/store/dashboardStore';
import type { FilterConfig, PageStyles } from '@/types/dashboard-builder';
import { getAvailableFields, type Field, type FieldsResponse } from '@/lib/api/dashboards';

type DimFilter = { id: string; field: string; operator: string; value: string };

const mapOperator = (op: string): string => {
  switch (op) {
    case 'not_equals': return 'notEquals';
    case 'greater_than': return 'gt';
    case 'less_than': return 'lt';
    case 'greater_or_equal': return 'gte';
    case 'less_or_equal': return 'lte';
    case 'starts_with': return 'startsWith';
    case 'ends_with': return 'endsWith';
    default: return op;
  }
};

export const PagePanel: React.FC = () => {
  const currentPageId = useCurrentPageId();
  const pages = usePages();
  const page = useMemo(() => pages?.find(p => p.id === currentPageId), [pages, currentPageId]);
  const { setPageFilters, setPageStyles, updatePage, duplicatePage, removePage } = useDashboardStore();

  const [filters, setFilters] = useState<DimFilter[]>(
    (page?.filters || []).map((f, i) => ({ id: `pf-${i}`, field: f.field, operator: f.operator as string, value: (f.values?.[0] as string) || '' }))
  );

  const [availableFields, setAvailableFields] = useState<Field[]>([]);
  // Dimensions de-duplicated by name to avoid duplicate React keys and confusing options
  const dimensionFields = useMemo(() => {
    const dims = availableFields.filter(f => f.type === 'dimension');
    const seen = new Set<string>();
    const unique: Field[] = [];
    for (const f of dims) {
      const key = (f.name || f.id).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(f);
    }
    return unique;
  }, [availableFields]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: FieldsResponse = await getAvailableFields();
        if (!mounted) return;
        const fields = data.sources.flatMap(s => s.fields);
        setAvailableFields(fields);
      } catch (e) {
        setAvailableFields([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const [styles, setStyles] = useState<PageStyles>({
    backgroundColor: page?.pageStyles?.backgroundColor || undefined,
    padding: page?.pageStyles?.padding || undefined,
    gap: page?.pageStyles?.gap || undefined,
  });

  if (!page || !currentPageId) {
    return (
      <div className="p-4 text-xs text-muted-foreground">No page selected.</div>
    );
  }

  const applyFilters = () => {
    const mapped: FilterConfig[] = filters
      .filter(f => f.field && String(f.value).trim().length > 0)
      .map(f => ({
        field: f.field,
        operator: mapOperator(f.operator),
        values: [f.value],
        enabled: true,
      }));
    setPageFilters(currentPageId, mapped);
  };

  const applyStyles = () => {
    const clamp = (n: number | undefined, min: number, max: number) =>
      typeof n === 'number' ? Math.min(max, Math.max(min, Math.round(n))) : undefined;
    const isHex = (c?: string) => (c ? /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c) : true);

    const next: PageStyles = {
      backgroundColor: isHex(styles.backgroundColor) ? styles.backgroundColor : undefined,
      padding: clamp(styles.padding, 0, 64),
      gap: clamp(styles.gap, 0, 64),
    };
    setPageStyles(currentPageId, next);
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="filters" className="text-xs">Page Filters</TabsTrigger>
          <TabsTrigger value="styles" className="text-xs">Page Styles</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filters ({page.filters?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filters.length === 0 && (
                <p className="text-xs text-muted-foreground">No page filters added.</p>
              )}
              {filters.map((f) => (
                <div key={f.id} className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <Label className="text-xs">Field</Label>
                    <Select value={f.field} onValueChange={(v)=> setFilters(prev => prev.map(x => x.id===f.id?{...x, field: v}:x))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select field" /></SelectTrigger>
                      <SelectContent>
                        {dimensionFields.map(d => (
                          <SelectItem key={`dim-${d.name}`} value={d.name}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Operator</Label>
                    <Select value={f.operator} onValueChange={(v)=> setFilters(prev => prev.map(x => x.id===f.id?{...x, operator: v}:x))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="starts_with">Starts With</SelectItem>
                        <SelectItem value="ends_with">Ends With</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Value</Label>
                    <Input value={f.value} onChange={(e) => setFilters(prev => prev.map(x => x.id===f.id?{...x, value: e.target.value}:x))} className="h-8 text-xs" />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setFilters(prev => [...prev, { id: `pf-${Date.now()}`, field: '', operator: 'equals', value: '' }])}>Add Filter</Button>
                <Button size="sm" onClick={applyFilters}>Apply</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="styles" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Page Styles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Background Color</Label>
                <Input placeholder="#ffffff" value={styles.backgroundColor || ''} onChange={(e)=> setStyles(prev => ({...prev, backgroundColor: e.target.value || undefined}))} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Padding</Label>
                <Input type="number" value={styles.padding ?? ''} onChange={(e)=> setStyles(prev => ({...prev, padding: e.target.value? Number(e.target.value): undefined}))} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Gap</Label>
                <Input type="number" value={styles.gap ?? ''} onChange={(e)=> setStyles(prev => ({...prev, gap: e.target.value? Number(e.target.value): undefined}))} className="h-8 text-xs" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={applyStyles}>Apply</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Page Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2 items-center">
                <Input defaultValue={page.name} className="h-8 text-xs" onBlur={(e)=> updatePage(currentPageId, { name: e.target.value || page.name })} />
                <Button size="sm" variant="outline" onClick={()=> duplicatePage(currentPageId)}>Duplicate</Button>
                <Button size="sm" variant="destructive" onClick={()=> { if((pages?.length||0) > 1 && confirm('Delete current page?')) removePage(currentPageId); }}>Delete</Button>
              </div>
              <p className="text-xs text-muted-foreground">Reorder pages via the tabs above the canvas.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PagePanel;
