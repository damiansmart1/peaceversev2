import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, Globe, Shield, Bell } from 'lucide-react';

export const AdminSettingsManager = () => {
  const [settings, setSettings] = useState({
    siteName: 'PeaceVerse',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    contentModeration: true,
    autoApproveContent: false,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Settings</h2>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure basic platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance">Maintenance Mode</Label>
                <Switch
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="registration">Enable User Registration</Label>
                <Switch
                  id="registration"
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Configure 2FA for admin accounts</p>
                <Button variant="outline">Configure 2FA</Button>
              </div>
              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Input type="number" placeholder="Minutes" defaultValue="60" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotif">Email Notifications</Label>
                <Switch
                  id="emailNotif"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Content Moderation
              </CardTitle>
              <CardDescription>Configure content moderation rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="contentMod">Enable Content Moderation</Label>
                <Switch
                  id="contentMod"
                  checked={settings.contentModeration}
                  onCheckedChange={(checked) => setSettings({ ...settings, contentModeration: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoApprove">Auto-Approve Content</Label>
                <Switch
                  id="autoApprove"
                  checked={settings.autoApproveContent}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApproveContent: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save All Settings
        </Button>
      </div>
    </div>
  );
};
