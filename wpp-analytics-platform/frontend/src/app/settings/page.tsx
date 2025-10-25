'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, User, Bell, Database, Palette } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: workspace } = await supabase
          .from('workspaces')
          .select('name')
          .eq('user_id', user.id)
          .single();

        if (workspace) {
          setWorkspaceName(workspace.name);
        }
      }
    };

    loadUser();
  }, []);

  const updateWorkspaceName = async () => {
    if (!user || !workspaceName) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('workspaces')
      .update({ name: workspaceName })
      .eq('user_id', user.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert('Workspace name updated!');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>
        </div>

        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          <Separator className="mb-4" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={user?.user_metadata?.full_name || ''}
                disabled
                placeholder="Managed by Google OAuth"
              />
            </div>

            <div className="space-y-2">
              <Label>Workspace Name</Label>
              <div className="flex gap-2">
                <Input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                />
                <Button onClick={updateWorkspaceName}>Update</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          <Separator className="mb-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <Separator className="mb-4" />

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Email notifications coming soon
            </p>
          </div>
        </Card>

        {/* Data Sources Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Data Sources</h2>
          </div>
          <Separator className="mb-4" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Connected BigQuery Project</Label>
              <Input value="mcp-servers-475317" disabled />
            </div>

            <div className="space-y-2">
              <Label>Available Tables</Label>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  gsc_performance_7days
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  ads_performance_7days
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  analytics_sessions_7days
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
          <Separator className="mb-4" />

          <div className="space-y-4">
            <div>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will permanently delete your account and all dashboards
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
