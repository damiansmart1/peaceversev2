import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Settings, Globe, Shield, Bell, Lock, MessageSquare, FileCheck, Gamepad2, Zap, Database, Eye, Package } from 'lucide-react';

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
          <h2 className="text-2xl font-bold">Platform Settings</h2>
          <p className="text-muted-foreground">Configure and customize your platform</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Settings className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['general', 'security']} className="space-y-4">
        {/* General Settings */}
        <AccordionItem value="general">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">General Settings</h3>
                <p className="text-sm text-muted-foreground">Configure basic platform settings</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable site access</p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registration">Enable User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                  </div>
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
          </AccordionContent>
        </AccordionItem>

        {/* Security Settings */}
        <AccordionItem value="security">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Security Settings</h3>
                <p className="text-sm text-muted-foreground">Manage security and access controls</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
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
                  <div>
                    <Label htmlFor="emailVerification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Users must verify email to access platform</p>
                  </div>
                  <Switch
                    id="emailVerification"
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Moderation Settings */}
        <AccordionItem value="moderation">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <MessageSquare className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Content Moderation</h3>
                <p className="text-sm text-muted-foreground">Configure content moderation rules</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="contentMod">Enable Content Moderation</Label>
                    <p className="text-sm text-muted-foreground">Review content before publishing</p>
                  </div>
                  <Switch
                    id="contentMod"
                    checked={settings.contentModeration}
                    onCheckedChange={(checked) => setSettings({ ...settings, contentModeration: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoApprove">Auto-Approve Content</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve trusted users' content</p>
                  </div>
                  <Switch
                    id="autoApprove"
                    checked={settings.autoApproveContent}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoApproveContent: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiModeration">AI-Powered Moderation</Label>
                    <p className="text-sm text-muted-foreground">Use AI to detect harmful content</p>
                  </div>
                  <Switch
                    id="aiModeration"
                    checked={settings.aiModerationEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, aiModerationEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profanityFilter">Profanity Filter</Label>
                    <p className="text-sm text-muted-foreground">Filter offensive language</p>
                  </div>
                  <Switch
                    id="profanityFilter"
                    checked={settings.profanityFilterEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, profanityFilterEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Proposals Settings */}
        <AccordionItem value="proposals">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileCheck className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Proposal Settings</h3>
                <p className="text-sm text-muted-foreground">Configure proposal and voting rules</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
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
                  <div>
                    <Label htmlFor="anonymousProposals">Allow Anonymous Proposals</Label>
                    <p className="text-sm text-muted-foreground">Users can submit proposals anonymously</p>
                  </div>
                  <Switch
                    id="anonymousProposals"
                    checked={settings.allowAnonymousProposals}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowAnonymousProposals: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="proposalModeration">Require Proposal Moderation</Label>
                    <p className="text-sm text-muted-foreground">Review proposals before publishing</p>
                  </div>
                  <Switch
                    id="proposalModeration"
                    checked={settings.requireProposalModeration}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireProposalModeration: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Gamification Settings */}
        <AccordionItem value="gamification">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Gamepad2 className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Gamification & Points</h3>
                <p className="text-sm text-muted-foreground">Configure points and rewards system</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="streakBonus">Enable Streak Bonuses</Label>
                    <p className="text-sm text-muted-foreground">Reward consecutive daily logins</p>
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

        {/* API Settings */}
        <AccordionItem value="api">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">API & Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">Configure API access and rate limits</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
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
                  <div>
                    <Label htmlFor="enableCors">Enable CORS</Label>
                    <p className="text-sm text-muted-foreground">Allow cross-origin requests</p>
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

        {/* Privacy Settings */}
        <AccordionItem value="privacy">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Eye className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Privacy & Data Management</h3>
                <p className="text-sm text-muted-foreground">Configure data retention and privacy</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
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
                  <div>
                    <Label htmlFor="cookieConsent">Require Cookie Consent</Label>
                    <p className="text-sm text-muted-foreground">Show cookie consent banner</p>
                  </div>
                  <Switch
                    id="cookieConsent"
                    checked={settings.cookieConsentRequired}
                    onCheckedChange={(checked) => setSettings({ ...settings, cookieConsentRequired: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Enable Analytics</Label>
                    <p className="text-sm text-muted-foreground">Track usage statistics</p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.analyticsEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Features Settings */}
        <AccordionItem value="features">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Package className="h-5 w-5 text-cyan-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Platform Features</h3>
                <p className="text-sm text-muted-foreground">Enable or disable platform features</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voiceStories">Voice Stories</Label>
                  <Switch
                    id="voiceStories"
                    checked={settings.voiceStoriesEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, voiceStoriesEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="radio">Community Radio</Label>
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
          </AccordionContent>
        </AccordionItem>

        {/* Backups Settings */}
        <AccordionItem value="backups">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <Database className="h-5 w-5 text-teal-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Backup Configuration</h3>
                <p className="text-sm text-muted-foreground">Manage automated backups</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Enable Auto Backups</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup data</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={settings.autoBackupEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoBackupEnabled: checked })}
                  />
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
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
