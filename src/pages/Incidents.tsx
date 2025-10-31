import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, Plus, MapPin } from 'lucide-react';
import { useIncidents } from '@/hooks/useIncidents';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateIncident } from '@/hooks/useIncidents';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';

const Incidents = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_type: 'conflict',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    location_name: '',
    country_code: '',
    is_anonymous: false,
  });

  const { data: allIncidents, isLoading } = useIncidents();
  const { data: reportedIncidents } = useIncidents({ status: 'reported' });
  const { data: verifiedIncidents } = useIncidents({ status: 'verified' });
  const { data: resolvedIncidents } = useIncidents({ status: 'resolved' });
  
  const createIncident = useCreateIncident();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    await createIncident.mutateAsync(formData);
    setIsCreateOpen(false);
    setFormData({
      title: '',
      description: '',
      incident_type: 'conflict',
      severity: 'medium',
      location_name: '',
      country_code: '',
      is_anonymous: false,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      case 'verified': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const IncidentCard = ({ incident }: { incident: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{incident.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="w-3 h-3" />
              {incident.location_name || 'Location not specified'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={getSeverityColor(incident.severity)}>
              {incident.severity}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {getStatusIcon(incident.status)}
              {incident.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {incident.description}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Type: {incident.incident_type}</span>
          <span>{new Date(incident.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader
            badge="Response System"
            title="Incident Tracking"
            subtitle="Monitor, verify, and respond to peace incidents"
            icon={<AlertCircle className="w-4 h-4" />}
          />
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report New Incident</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Incident Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Detailed Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select value={formData.incident_type} onValueChange={(value) => setFormData({ ...formData, incident_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Incident Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conflict">Conflict</SelectItem>
                      <SelectItem value="displacement">Displacement</SelectItem>
                      <SelectItem value="violence">Violence</SelectItem>
                      <SelectItem value="tension">Tension</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Location"
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  />
                  <Input
                    placeholder="Country Code (e.g., KE)"
                    value={formData.country_code}
                    onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  />
                  <label htmlFor="anonymous" className="text-sm">
                    Report anonymously (for your safety)
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={createIncident.isPending}>
                  {createIncident.isPending ? 'Reporting...' : 'Submit Report'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">
                  All ({allIncidents?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="reported">
                  Reported ({reportedIncidents?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="verified">
                  Verified ({verifiedIncidents?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="resolved">
                  Resolved ({resolvedIncidents?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {allIncidents?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allIncidents.map(incident => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No incidents reported yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reported" className="space-y-4">
                {reportedIncidents?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportedIncidents.map(incident => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No reported incidents</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="verified" className="space-y-4">
                {verifiedIncidents?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {verifiedIncidents.map(incident => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No verified incidents</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resolved" className="space-y-4">
                {resolvedIncidents?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resolvedIncidents.map(incident => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No resolved incidents</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Incidents;