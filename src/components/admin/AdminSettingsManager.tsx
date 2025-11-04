import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Settings, Globe, Shield, Bell, Lock, Filter, FileCheck, Trophy, Code, Database, Shield as PrivacyIcon, ToggleLeft, HardDrive } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Platform Settings</h2>
          <p className="text-muted-foreground mt-1">Configure all aspects of your platform</p>
        </div>
        <Button onClick={handleSave} size="lg">
          Save All Changes
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['general', 'security', 'moderation']} className="space-y-4">

        <AccordionItem value="general">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardDescription>Configure basic platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.allowedFileTypes}
                    onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="maintenance" className="font-medium">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Put site in maintenance mode</p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="registration" className="font-medium">User Registration</Label>
                      <p className="text-sm text-muted-foreground">Allow new user signups</p>
                    </div>
                    <Switch
                      id="registration"
                      checked={settings.registrationEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="security">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security & Authentication
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardDescription>Manage security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
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
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="2fa" className="font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Switch
                      id="2fa"
                      checked={settings.twoFactorEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, twoFactorEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="emailVerification" className="font-medium">Email Verification</Label>
                      <p className="text-sm text-muted-foreground">Require email verification</p>
                    </div>
                    <Switch
                      id="emailVerification"
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="moderation">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Content Moderation
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardDescription>Configure content moderation rules and filters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="contentMod" className="font-medium">Content Moderation</Label>
                      <p className="text-sm text-muted-foreground">Enable content review</p>
                    </div>
                    <Switch
                      id="contentMod"
                      checked={settings.contentModeration}
                      onCheckedChange={(checked) => setSettings({ ...settings, contentModeration: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="autoApprove" className="font-medium">Auto-Approve</Label>
                      <p className="text-sm text-muted-foreground">Auto-approve content</p>
                    </div>
                    <Switch
                      id="autoApprove"
                      checked={settings.autoApproveContent}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoApproveContent: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="aiModeration" className="font-medium">AI Moderation</Label>
                      <p className="text-sm text-muted-foreground">Use AI for content review</p>
                    </div>
                    <Switch
                      id="aiModeration"
                      checked={settings.aiModerationEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, aiModerationEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="profanityFilter" className="font-medium">Profanity Filter</Label>
                      <p className="text-sm text-muted-foreground">Filter inappropriate language</p>
                    </div>
                    <Switch
                      id="profanityFilter"
                      checked={settings.profanityFilterEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, profanityFilterEnabled: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="proposals">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Proposal Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardDescription>Configure proposal and voting rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
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
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="anonymousProposals" className="font-medium">Anonymous Proposals</Label>
                      <p className="text-sm text-muted-foreground">Allow anonymous proposals</p>
                    </div>
                    <Switch
                      id="anonymousProposals"
                      checked={settings.allowAnonymousProposals}
                      onCheckedChange={(checked) => setSettings({ ...settings, allowAnonymousProposals: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="proposalModeration" className="font-medium">Proposal Moderation</Label>
                      <p className="text-sm text-muted-foreground">Require moderation</p>
                    </div>
                    <Switch
                      id="proposalModeration"
                      checked={settings.requireProposalModeration}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireProposalModeration: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gamification">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Gamification & Points
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardDescription>Configure points and rewards system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="pointsPerStory">Points Per Story</Label>
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
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="streakBonus" className="font-medium">Streak Bonuses</Label>
                    <p className="text-sm text-muted-foreground">Enable streak bonuses</p>
                  </div>
                  <Switch
                    id="streakBonus"
                    checked={settings.streakBonusEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, streakBonusEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="api">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API & Rate Limiting
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardDescription>Configure API access and rate limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
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
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="enableCors" className="font-medium">CORS</Label>
                    <p className="text-sm text-muted-foreground">Enable Cross-Origin Resource Sharing</p>
                  </div>
                  <Switch
                    id="enableCors"
                    checked={settings.enableCors}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableCors: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="privacy">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <PrivacyIcon className="h-5 w-5" />
              Privacy & Data Management
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardDescription>Configure data retention and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention Period (Days)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="cookieConsent" className="font-medium">Cookie Consent</Label>
                      <p className="text-sm text-muted-foreground">Require cookie consent</p>
                    </div>
                    <Switch
                      id="cookieConsent"
                      checked={settings.cookieConsentRequired}
                      onCheckedChange={(checked) => setSettings({ ...settings, cookieConsentRequired: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="analytics" className="font-medium">Analytics</Label>
                      <p className="text-sm text-muted-foreground">Enable analytics tracking</p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={settings.analyticsEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="shareData" className="font-medium">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share with partners</p>
                    </div>
                    <Switch
                      id="shareData"
                      checked={settings.shareUserDataWithPartners}
                      onCheckedChange={(checked) => setSettings({ ...settings, shareUserDataWithPartners: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-5 w-5" />
              Platform Features
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="voiceStories" className="font-medium">Voice Stories</Label>
                      <p className="text-sm text-muted-foreground">Enable voice recordings</p>
                    </div>
                    <Switch
                      id="voiceStories"
                      checked={settings.voiceStoriesEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, voiceStoriesEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="radio" className="font-medium">Radio</Label>
                      <p className="text-sm text-muted-foreground">Enable radio feature</p>
                    </div>
                    <Switch
                      id="radio"
                      checked={settings.radioEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, radioEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="challenges" className="font-medium">Challenges</Label>
                      <p className="text-sm text-muted-foreground">Enable challenges</p>
                    </div>
                    <Switch
                      id="challenges"
                      checked={settings.challengesEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, challengesEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="safeSpaces" className="font-medium">Safe Spaces</Label>
                      <p className="text-sm text-muted-foreground">Enable safe spaces</p>
                    </div>
                    <Switch
                      id="safeSpaces"
                      checked={settings.safeSpacesEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, safeSpacesEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="rewardStore" className="font-medium">Reward Store</Label>
                      <p className="text-sm text-muted-foreground">Enable reward store</p>
                    </div>
                    <Switch
                      id="rewardStore"
                      checked={settings.rewardStoreEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, rewardStoreEnabled: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="backups">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backups & Export
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardDescription>Configure automatic backups and data export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <select
                      id="backupFrequency"
                      className="w-full p-2 border rounded-md bg-background"
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
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="autoBackup" className="font-medium">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Enable scheduled backups</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={settings.autoBackupEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoBackupEnabled: checked })}
                  />
                </div>
                <Button variant="outline" className="w-full">Export All Data</Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
