'use client';

// Dashboard List Page - Shows real dashboards from Supabase
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, BarChart3, LineChart, PieChart, MoreVertical, Copy, Trash2, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { listDashboards, saveDashboard, deleteDashboard, type DashboardConfig } from '@/lib/supabase/dashboard-service';
import { formatDistanceToNow } from 'date-fns';
import { UserProfile } from '@/components/user-profile';

export default function DashboardListPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    dataSource: '',
    template: 'blank'
  });

  // Load dashboards from Supabase
  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    setIsLoading(true);
    const result = await listDashboards();
    if (result.success && result.data) {
      setDashboards(result.data);
    }
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!newDashboard.name || !newDashboard.dataSource) return;

    const dashboardId = crypto.randomUUID();

    // Get template config
    let initialCharts: Array<{
      id: string;
      type: 'kpi' | 'line' | 'pie' | 'table';
      measure: string;
      dimension?: string;
      title: string;
      size: { w: number; h: number };
    }> = [];
    if (newDashboard.template === 'gsc_standard') {
      initialCharts = [
        {
          id: '1',
          type: 'kpi' as const,
          measure: 'GscPerformance7days.clicks',
          title: 'Total Clicks',
          size: { w: 3, h: 2 }
        },
        {
          id: '2',
          type: 'kpi' as const,
          measure: 'GscPerformance7days.impressions',
          title: 'Total Impressions',
          size: { w: 3, h: 2 }
        },
        {
          id: '3',
          type: 'kpi' as const,
          measure: 'GscPerformance7days.avgCtr',
          title: 'Average CTR',
          size: { w: 3, h: 2 }
        },
        {
          id: '4',
          type: 'kpi' as const,
          measure: 'GscPerformance7days.avgPosition',
          title: 'Average Position',
          size: { w: 3, h: 2 }
        },
        {
          id: '5',
          type: 'line' as const,
          measure: 'GscPerformance7days.clicks',
          dimension: 'GscPerformance7days.date',
          title: 'Daily Clicks Trend',
          size: { w: 12, h: 6 }
        },
        {
          id: '6',
          type: 'pie' as const,
          measure: 'GscPerformance7days.clicks',
          dimension: 'GscPerformance7days.device',
          title: 'Clicks by Device',
          size: { w: 6, h: 6 }
        }
      ];
    }

    const result = await saveDashboard(dashboardId, {
      name: newDashboard.name,
      description: `Dashboard for ${newDashboard.dataSource}`,
      datasource: newDashboard.dataSource,
      charts: initialCharts,
      filters: []
    });

    if (result.success) {
      setIsCreating(false);
      router.push(`/dashboard/${dashboardId}/builder`);
    } else {
      alert(`Error creating dashboard: ${result.error}`);
    }
  };

  const handleDuplicate = async (dashboard: DashboardConfig) => {
    const newId = crypto.randomUUID();

    const result = await saveDashboard(newId, {
      name: `${dashboard.name} (Copy)`,
      description: dashboard.description,
      datasource: dashboard.datasource,
      charts: dashboard.charts,
      filters: dashboard.filters
    });

    if (result.success) {
      loadDashboards();
    } else {
      alert(`Error duplicating dashboard: ${result.error}`);
    }
  };

  const handleDelete = async (dashboardId: string) => {
    if (!confirm('Are you sure you want to delete this dashboard? This cannot be undone.')) {
      return;
    }

    const result = await deleteDashboard(dashboardId);

    if (result.success) {
      loadDashboards();
    } else {
      alert(`Error deleting dashboard: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboards</h1>
            <p className="text-muted-foreground mt-1">
              {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-2">
            <UserProfile />

            <Button variant="outline" onClick={loadDashboards} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  New Dashboard
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Dashboard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dashboard Name</label>
                    <Input
                      placeholder="e.g., Nike GSC Performance"
                      value={newDashboard.name}
                      onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Source</label>
                    <Select
                      value={newDashboard.dataSource}
                      onValueChange={(value) => setNewDashboard({ ...newDashboard, dataSource: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select BigQuery table" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gsc_performance_7days">GSC Performance (7 Days)</SelectItem>
                        <SelectItem value="ads_performance_7days">Google Ads Performance (7 Days)</SelectItem>
                        <SelectItem value="analytics_sessions_7days">Analytics Sessions (7 Days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template</label>
                    <Select
                      value={newDashboard.template}
                      onValueChange={(value) => setNewDashboard({ ...newDashboard, template: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blank">Blank Dashboard</SelectItem>
                        <SelectItem value="gsc_standard">GSC Standard (4 KPIs + Charts)</SelectItem>
                        <SelectItem value="ads_standard">Ads Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleCreate}
                    disabled={!newDashboard.name || !newDashboard.dataSource}
                  >
                    Create Dashboard
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && dashboards.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No dashboards yet</h3>
                <p className="text-muted-foreground mt-1">
                  Create your first dashboard to start visualizing data
                </p>
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Dashboard
              </Button>
            </div>
          </Card>
        )}

        {/* Dashboard Grid */}
        {!isLoading && dashboards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <Card
                key={dashboard.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group relative"
              >
                {/* Dashboard Content - Click to open */}
                <div onClick={() => router.push(`/dashboard/${dashboard.id}/builder`)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg line-clamp-1">{dashboard.name}</h3>
                      {dashboard.updated_at && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDistanceToNow(new Date(dashboard.updated_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Source: {dashboard.datasource}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {dashboard.charts.filter(c => c.type === 'kpi').length} KPIs
                      </span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {dashboard.charts.length - dashboard.charts.filter(c => c.type === 'kpi').length} Charts
                      </span>
                      {dashboard.filters.length > 0 && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {dashboard.filters.length} Filters
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Menu - Click stops propagation */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/${dashboard.id}/builder`);
                      }}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(dashboard);
                      }}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dashboard.id) handleDelete(dashboard.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}

            {/* Create New Card */}
            <Card
              className="p-6 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setIsCreating(true)}
            >
              <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-muted-foreground">
                <Plus className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Create New Dashboard</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
