'use client';

// Dashboard List Page - Shows real dashboards from Supabase
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, BarChart3, MoreVertical, Copy, Trash2, Calendar, Loader2, RefreshCw, Search, SortAsc } from 'lucide-react';
import { listDashboards, deleteDashboard, type DashboardConfig } from '@/lib/supabase/dashboard-service';
import { formatDistanceToNow } from 'date-fns';
import { UserProfile } from '@/components/user-profile';
import { NewDashboardDialog } from '@/components/dashboard-builder/dialogs/NewDashboardDialog';

type SortOption = 'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest';

export default function DashboardListPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');

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

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Reload dashboards to show newly created one
    loadDashboards();
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

  // Filter and sort dashboards
  const filteredAndSortedDashboards = dashboards
    .filter((dashboard) =>
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-newest':
          return new Date(b.updated_at || b.created_at || 0).getTime() -
                 new Date(a.updated_at || a.created_at || 0).getTime();
        case 'date-oldest':
          return new Date(a.updated_at || a.created_at || 0).getTime() -
                 new Date(b.updated_at || b.created_at || 0).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboards</h1>
            <p className="text-muted-foreground mt-1">
              {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''} {searchQuery && `(${filteredAndSortedDashboards.length} found)`}
            </p>
          </div>

          <div className="flex gap-2">
            <UserProfile />

            <Button variant="outline" onClick={loadDashboards} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button size="lg" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Dashboard
            </Button>
          </div>
        </div>

        {/* Search and Sort Controls */}
        {!isLoading && dashboards.length > 0 && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-newest">Newest First</SelectItem>
                <SelectItem value="date-oldest">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* No Results State */}
        {!isLoading && dashboards.length > 0 && filteredAndSortedDashboards.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Search className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No dashboards found</h3>
                <p className="text-muted-foreground mt-1">
                  No dashboards match "{searchQuery}". Try adjusting your search.
                </p>
              </div>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          </Card>
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
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Dashboard
              </Button>
            </div>
          </Card>
        )}

        {/* Dashboard Grid */}
        {!isLoading && filteredAndSortedDashboards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDashboards.map((dashboard) => {
              // Count KPIs (scorecards and gauges) from rows structure
              const kpiCount = dashboard.rows?.reduce((count, row) => {
                return count + row.columns.filter(col =>
                  col.component?.type === 'scorecard' ||
                  col.component?.type === 'gauge'
                ).length;
              }, 0) || 0;

              // Count Charts (all components except KPIs and filters)
              const chartCount = dashboard.rows?.reduce((count, row) => {
                return count + row.columns.filter(col => {
                  const type = col.component?.type;
                  return type &&
                    type !== 'scorecard' &&
                    type !== 'gauge' &&
                    type !== 'date_filter' &&
                    type !== 'date_range_filter';
                }).length;
              }, 0) || 0;

              return (
                <Card
                  key={dashboard.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer group relative"
                >
                  {/* Dashboard Content - Click to open */}
                  <div onClick={() => router.push(`/dashboard/${dashboard.id}/builder`)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{dashboard.name || dashboard.title}</h3>
                        {dashboard.updatedAt && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDistanceToNow(new Date(dashboard.updatedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {kpiCount > 0 && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {kpiCount} KPI{kpiCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {chartCount > 0 && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {chartCount} Chart{chartCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {kpiCount === 0 && chartCount === 0 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                          Empty Dashboard
                        </span>
                      )}
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
              );
            })}

            {/* Create New Card */}
            <Card
              className="p-6 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setIsDialogOpen(true)}
            >
              <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-muted-foreground">
                <Plus className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Create New Dashboard</p>
              </div>
            </Card>
          </div>
        )}

        {/* New Dashboard Dialog */}
        <NewDashboardDialog
          open={isDialogOpen}
          onClose={handleDialogClose}
        />
      </div>
    </div>
  );
}
