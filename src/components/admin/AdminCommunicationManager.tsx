import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useChannels, useBroadcastAlerts, useOCHADocuments, useFieldReports, useCreateChannel, useCreateBroadcast, useActivateBroadcast, useCreateOCHADocument, AlertSeverityLevel, ChannelType, DocumentType } from '@/hooks/useCommunication';
import { Radio, Send, FileText, AlertTriangle, Users, MessageSquare, Clock, CheckCircle, XCircle, Plus, Eye, Edit, Trash2, Bell, Globe, Shield, Zap, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function AdminCommunicationManager() {
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const { data: broadcasts, isLoading: broadcastsLoading } = useBroadcastAlerts();
  const { data: documents, isLoading: documentsLoading } = useOCHADocuments();
  const { data: fieldReports, isLoading: fieldReportsLoading } = useFieldReports();

  const createChannel = useCreateChannel();
  const createBroadcast = useCreateBroadcast();
  const activateBroadcast = useActivateBroadcast();
  const createDocument = useCreateOCHADocument();

  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);

  // Channel form state
  const [channelForm, setChannelForm] = useState({
    name: '',
    description: '',
    channel_type: 'coordination' as ChannelType,
    is_emergency: false,
    allowed_roles: [] as string[],
  });

  // Broadcast form state
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    severity: 'green' as AlertSeverityLevel,
    alert_type: 'general',
    requires_acknowledgment: false,
    target_roles: [] as string[],
  });

  // Document form state
  const [documentForm, setDocumentForm] = useState({
    document_type: 'sitrep' as DocumentType,
    title: '',
    summary: '',
    severity_level: 'green' as AlertSeverityLevel,
    country: '',
    region: '',
  });

  const handleCreateChannel = async () => {
    try {
      await createChannel.mutateAsync(channelForm);
      setShowChannelDialog(false);
      setChannelForm({
        name: '',
        description: '',
        channel_type: 'coordination',
        is_emergency: false,
        allowed_roles: [],
      });
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const handleCreateBroadcast = async () => {
    try {
      await createBroadcast.mutateAsync(broadcastForm);
      setShowBroadcastDialog(false);
      setBroadcastForm({
        title: '',
        message: '',
        severity: 'green',
        alert_type: 'general',
        requires_acknowledgment: false,
        target_roles: [],
      });
    } catch (error) {
      console.error('Failed to create broadcast:', error);
    }
  };

  const handleCreateDocument = async () => {
    try {
      await createDocument.mutateAsync({
        ...documentForm,
        content: {},
      });
      setShowDocumentDialog(false);
      setDocumentForm({
        document_type: 'sitrep',
        title: '',
        summary: '',
        severity_level: 'green',
        country: '',
        region: '',
      });
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleActivateBroadcast = async (id: string) => {
    try {
      await activateBroadcast.mutateAsync(id);
    } catch (error) {
      console.error('Failed to activate broadcast:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500">Active</Badge>;
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      case 'sent': return <Badge className="bg-blue-500">Sent</Badge>;
      case 'published': return <Badge className="bg-green-500">Published</Badge>;
      case 'submitted': return <Badge className="bg-yellow-500">Submitted</Badge>;
      case 'reviewed': return <Badge className="bg-blue-500">Reviewed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'broadcast': return <Radio className="h-4 w-4 text-blue-500" />;
      case 'coordination': return <Users className="h-4 w-4 text-green-500" />;
      case 'field_report': return <FileText className="h-4 w-4 text-orange-500" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Hub Management</h2>
          <p className="text-muted-foreground">OCHA-aligned inter-agency coordination system</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Globe className="h-3 w-3" />
            UN Standards Compliant
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Secure Channels
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              Active Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{channels?.filter(c => c.is_active).length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {channels?.filter(c => c.is_emergency).length || 0} emergency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-500" />
              Active Broadcasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{broadcasts?.filter(b => b.status === 'active').length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {broadcasts?.filter(b => b.status === 'draft').length || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              OCHA Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {documents?.filter(d => d.status === 'published').length || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Field Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldReports?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {fieldReports?.filter(r => r.status === 'submitted').length || 0} pending review
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="field-reports">Field Reports</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Rules</TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Communication Channels</h3>
            <Dialog open={showChannelDialog} onOpenChange={setShowChannelDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Channel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Communication Channel</DialogTitle>
                  <DialogDescription>Set up a new inter-agency coordination channel</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Channel Name</Label>
                    <Input
                      value={channelForm.name}
                      onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                      placeholder="e.g., East Africa Coordination"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={channelForm.description}
                      onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                      placeholder="Channel purpose and scope..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Channel Type</Label>
                    <Select
                      value={channelForm.channel_type}
                      onValueChange={(v) => setChannelForm({ ...channelForm, channel_type: v as ChannelType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coordination">Coordination Hub</SelectItem>
                        <SelectItem value="broadcast">Broadcast</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="field_report">Field Reporting</SelectItem>
                        <SelectItem value="direct">Direct Messaging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={channelForm.is_emergency}
                      onCheckedChange={(v) => setChannelForm({ ...channelForm, is_emergency: v })}
                    />
                    <Label>Emergency Channel</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowChannelDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateChannel} disabled={createChannel.isPending}>
                    {createChannel.isPending ? 'Creating...' : 'Create Channel'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channelsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : channels?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No channels found. Create your first channel to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  channels?.map((channel) => (
                    <TableRow key={channel.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelTypeIcon(channel.channel_type)}
                          <div>
                            <p className="font-medium">{channel.name}</p>
                            <p className="text-xs text-muted-foreground">{channel.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {channel.channel_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {channel.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {channel.is_emergency && (
                          <Badge className="bg-red-500 ml-1">Emergency</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(channel.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Broadcast Alerts</h3>
            <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Broadcast
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Broadcast Alert</DialogTitle>
                  <DialogDescription>Send an alert to targeted recipients across the network</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Alert Title</Label>
                    <Input
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      placeholder="e.g., Flash Flood Warning - Eastern Region"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={broadcastForm.message}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      placeholder="Detailed alert message..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Severity Level</Label>
                    <Select
                      value={broadcastForm.severity}
                      onValueChange={(v) => setBroadcastForm({ ...broadcastForm, severity: v as AlertSeverityLevel })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green - Informational</SelectItem>
                        <SelectItem value="yellow">Yellow - Watch</SelectItem>
                        <SelectItem value="orange">Orange - Warning</SelectItem>
                        <SelectItem value="red">Red - Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Alert Type</Label>
                    <Select
                      value={broadcastForm.alert_type}
                      onValueChange={(v) => setBroadcastForm({ ...broadcastForm, alert_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="humanitarian">Humanitarian</SelectItem>
                        <SelectItem value="weather">Weather</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Switch
                      checked={broadcastForm.requires_acknowledgment}
                      onCheckedChange={(v) => setBroadcastForm({ ...broadcastForm, requires_acknowledgment: v })}
                    />
                    <Label>Require Acknowledgment</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBroadcastDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateBroadcast} disabled={createBroadcast.isPending}>
                    {createBroadcast.isPending ? 'Creating...' : 'Create Broadcast'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcastsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : broadcasts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No broadcasts found. Create your first broadcast alert.
                    </TableCell>
                  </TableRow>
                ) : (
                  broadcasts?.map((broadcast) => (
                    <TableRow key={broadcast.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{broadcast.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{broadcast.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(broadcast.severity)}`} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{broadcast.alert_type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(broadcast.status)}</TableCell>
                      <TableCell>
                        {format(new Date(broadcast.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        {broadcast.status === 'draft' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleActivateBroadcast(broadcast.id)}
                            disabled={activateBroadcast.isPending}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">OCHA Documents</h3>
            <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create OCHA Document</DialogTitle>
                  <DialogDescription>Create standardized humanitarian documents</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select
                      value={documentForm.document_type}
                      onValueChange={(v) => setDocumentForm({ ...documentForm, document_type: v as DocumentType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sitrep">SITREP</SelectItem>
                        <SelectItem value="flash_update">Flash Update</SelectItem>
                        <SelectItem value="bulletin">Information Bulletin</SelectItem>
                        <SelectItem value="3w_report">3W Report (Who-What-Where)</SelectItem>
                        <SelectItem value="meeting_notes">Meeting Notes</SelectItem>
                        <SelectItem value="action_tracker">Action Tracker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity Level</Label>
                    <Select
                      value={documentForm.severity_level}
                      onValueChange={(v) => setDocumentForm({ ...documentForm, severity_level: v as AlertSeverityLevel })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green - Normal</SelectItem>
                        <SelectItem value="yellow">Yellow - Elevated</SelectItem>
                        <SelectItem value="orange">Orange - High</SelectItem>
                        <SelectItem value="red">Red - Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={documentForm.title}
                      onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                      placeholder="e.g., Kenya Flash Update #3 - Flooding Response"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Summary</Label>
                    <Textarea
                      value={documentForm.summary}
                      onChange={(e) => setDocumentForm({ ...documentForm, summary: e.target.value })}
                      placeholder="Executive summary..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={documentForm.country}
                      onChange={(e) => setDocumentForm({ ...documentForm, country: e.target.value })}
                      placeholder="e.g., Kenya"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Input
                      value={documentForm.region}
                      onChange={(e) => setDocumentForm({ ...documentForm, region: e.target.value })}
                      placeholder="e.g., East Africa"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateDocument} disabled={createDocument.isPending}>
                    {createDocument.isPending ? 'Creating...' : 'Create Document'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Country/Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : documents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No documents found. Create your first OCHA document.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents?.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{doc.summary}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {doc.document_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(doc.severity_level)}`} />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{doc.country || '-'}</p>
                        <p className="text-xs text-muted-foreground">{doc.region || '-'}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Field Reports Tab */}
        <TabsContent value="field-reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Field Reports</h3>
            <Badge variant="outline">
              {fieldReports?.filter(r => r.status === 'submitted').length || 0} pending review
            </Badge>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldReportsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : fieldReports?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No field reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  fieldReports?.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{report.content}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{report.report_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{report.location_country || '-'}</p>
                        <p className="text-xs text-muted-foreground">{report.location_region || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(report.severity)}`} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.priority <= 3 ? 'destructive' : 'secondary'}>
                          P{report.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        {format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Escalation Rules Tab */}
        <TabsContent value="escalation" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Escalation Rules</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tiered Alert Levels</CardTitle>
                <CardDescription>Automatic escalation based on severity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-medium">Green - Informational</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Standard routing</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="font-medium">Yellow - Watch</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Team leads notified</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="font-medium">Orange - Warning</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Management escalation</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="font-medium">Red - Emergency</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Immediate all-hands</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role-based Routing</CardTitle>
                <CardDescription>Automatic message routing by user role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">Admin</span>
                  </div>
                  <Badge>All alerts</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Government</span>
                  </div>
                  <Badge variant="outline">Critical + Security</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Partner</span>
                  </div>
                  <Badge variant="outline">Humanitarian + Field</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Verifier</span>
                  </div>
                  <Badge variant="outline">Verification requests</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Acknowledgment Tracking</CardTitle>
                <CardDescription>SLA monitoring and escalation triggers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="font-bold text-2xl">15 min</p>
                    <p className="text-sm text-muted-foreground">First response SLA</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="font-bold text-2xl">1 hour</p>
                    <p className="text-sm text-muted-foreground">Full acknowledgment</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="font-bold text-2xl">4 hours</p>
                    <p className="text-sm text-muted-foreground">Auto-escalation trigger</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
