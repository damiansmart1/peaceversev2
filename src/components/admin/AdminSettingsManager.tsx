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
    // General
    siteName: 'PeaceVerse',
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: 50,
    allowedFileTypes: 'image/*, video/*, audio/*',
    
    // Security
    emailNotifications: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    requireEmailVerification: true,
    twoFactorEnabled: false,
    
    // Content Moderation
    contentModeration: true,
    autoApproveContent: false,
    aiModerationEnabled: true,
    profanityFilterEnabled: true,
    
    // Proposals
    minSignaturesRequired: 100,
    defaultProposalDuration: 30,
    allowAnonymousProposals: true,
    requireProposalModeration: false,
    
    // Gamification
    pointsPerStory: 10,
    pointsPerComment: 2,
    pointsPerVote: 1,
    pointsPerShare: 5,
    dailyLoginBonus: 5,
    streakBonusEnabled: true,
    
    // API & Rate Limiting
    apiRateLimit: 100,
    apiRateLimitWindow: 60,
    enableCors: true,
    
    // Privacy & Data
    dataRetentionDays: 365,
    cookieConsentRequired: true,
    analyticsEnabled: true,
    shareUserDataWithPartners: false,
    
    // Features
    voiceStoriesEnabled: true,
    radioEnabled: true,
    challengesEnabled: true,
    safeSpacesEnabled: true,
    rewardStoreEnabled: true,
    
    // Backups
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupRetentionDays: 30,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Settings</h2>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max Upload File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
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
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  id="2fa"
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorEnabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailVerification">Require Email Verification</Label>
                <Switch
                  id="emailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="aiModeration">AI-Powered Moderation</Label>
                <Switch
                  id="aiModeration"
                  checked={settings.aiModerationEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, aiModerationEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="profanityFilter">Profanity Filter</Label>
                <Switch
                  id="profanityFilter"
                  checked={settings.profanityFilterEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, profanityFilterEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Proposal Settings
              </CardTitle>
              <CardDescription>Configure proposal and voting rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minSignatures">Minimum Signatures Required</Label>
                <Input
                  id="minSignatures"
                  type="number"
                  value={settings.minSignaturesRequired}
                  onChange={(e) => setSettings({ ...settings, minSignaturesRequired: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposalDuration">Default Proposal Duration (Days)</Label>
                <Input
                  id="proposalDuration"
                  type="number"
                  value={settings.defaultProposalDuration}
                  onChange={(e) => setSettings({ ...settings, defaultProposalDuration: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="anonymousProposals">Allow Anonymous Proposals</Label>
                <Switch
                  id="anonymousProposals"
                  checked={settings.allowAnonymousProposals}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowAnonymousProposals: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="proposalModeration">Require Proposal Moderation</Label>
                <Switch
                  id="proposalModeration"
                  checked={settings.requireProposalModeration}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireProposalModeration: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gamification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gamification & Points
              </CardTitle>
              <CardDescription>Configure points and rewards system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pointsPerStory">Points Per Story Shared</Label>
                <Input
                  id="pointsPerStory"
                  type="number"
                  value={settings.pointsPerStory}
                  onChange={(e) => setSettings({ ...settings, pointsPerStory: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pointsPerComment">Points Per Comment</Label>
                <Input
                  id="pointsPerComment"
                  type="number"
                  value={settings.pointsPerComment}
                  onChange={(e) => setSettings({ ...settings, pointsPerComment: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pointsPerVote">Points Per Vote</Label>
                <Input
                  id="pointsPerVote"
                  type="number"
                  value={settings.pointsPerVote}
                  onChange={(e) => setSettings({ ...settings, pointsPerVote: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pointsPerShare">Points Per Share</Label>
                <Input
                  id="pointsPerShare"
                  type="number"
                  value={settings.pointsPerShare}
                  onChange={(e) => setSettings({ ...settings, pointsPerShare: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyLoginBonus">Daily Login Bonus</Label>
                <Input
                  id="dailyLoginBonus"
                  type="number"
                  value={settings.dailyLoginBonus}
                  onChange={(e) => setSettings({ ...settings, dailyLoginBonus: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="streakBonus">Enable Streak Bonuses</Label>
                <Switch
                  id="streakBonus"
                  checked={settings.streakBonusEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, streakBonusEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API & Rate Limiting
              </CardTitle>
              <CardDescription>Configure API access and rate limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">API Rate Limit (Requests)</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiRateLimitWindow">Rate Limit Window (Seconds)</Label>
                <Input
                  id="apiRateLimitWindow"
                  type="number"
                  value={settings.apiRateLimitWindow}
                  onChange={(e) => setSettings({ ...settings, apiRateLimitWindow: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enableCors">Enable CORS</Label>
                <Switch
                  id="enableCors"
                  checked={settings.enableCors}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableCors: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data Management
              </CardTitle>
              <CardDescription>Configure data retention and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataRetention">Data Retention Period (Days)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cookieConsent">Require Cookie Consent</Label>
                <Switch
                  id="cookieConsent"
                  checked={settings.cookieConsentRequired}
                  onCheckedChange={(checked) => setSettings({ ...settings, cookieConsentRequired: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Enable Analytics</Label>
                <Switch
                  id="analytics"
                  checked={settings.analyticsEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="shareData">Share Data with Partners</Label>
                <Switch
                  id="shareData"
                  checked={settings.shareUserDataWithPartners}
                  onCheckedChange={(checked) => setSettings({ ...settings, shareUserDataWithPartners: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Features
              </CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="voiceStories">Voice Stories</Label>
                <Switch
                  id="voiceStories"
                  checked={settings.voiceStoriesEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, voiceStoriesEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="radio">Radio</Label>
                <Switch
                  id="radio"
                  checked={settings.radioEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, radioEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="challenges">Challenges</Label>
                <Switch
                  id="challenges"
                  checked={settings.challengesEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, challengesEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="safeSpaces">Safe Spaces</Label>
                <Switch
                  id="safeSpaces"
                  checked={settings.safeSpacesEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, safeSpacesEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="rewardStore">Reward Store</Label>
                <Switch
                  id="rewardStore"
                  checked={settings.rewardStoreEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, rewardStoreEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Backups & Export
              </CardTitle>
              <CardDescription>Configure automatic backups and data export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackupEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoBackupEnabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <select
                  id="backupFrequency"
                  className="w-full p-2 border rounded-md"
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupRetention">Backup Retention (Days)</Label>
                <Input
                  id="backupRetention"
                  type="number"
                  value={settings.backupRetentionDays}
                  onChange={(e) => setSettings({ ...settings, backupRetentionDays: parseInt(e.target.value) })}
                />
              </div>
              <Button variant="outline" className="w-full">Export All Data</Button>
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
