import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Clock, User, AlertTriangle, CheckCircle, Shield, 
  FileText, Users, Building, Phone, Mail, Eye, Share2,
  Calendar, Activity, Brain, Flag, MessageSquare, History
} from 'lucide-react';
import { format } from 'date-fns';
import { IncidentTimelineDetail } from './IncidentTimelineDetail';

interface ReportDetailDialogProps {
  report: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportDetailDialog = ({ report, open, onOpenChange }: ReportDetailDialogProps) => {
  if (!report) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-black';
      case 'under_review': return 'bg-blue-500 text-white';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      case 'resolved': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PP');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <AlertTriangle className="w-6 h-6 text-primary" />
            <span className="flex-1">{report.title}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Status Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {report.severity_level && (
                <Badge className={getSeverityColor(report.severity_level)}>
                  {report.severity_level.toUpperCase()}
                </Badge>
              )}
              <Badge className={getStatusColor(report.status)}>
                {report.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
              </Badge>
              <Badge className={getStatusColor(report.verification_status)}>
                {report.verification_status?.toUpperCase() || 'UNVERIFIED'}
              </Badge>
              <Badge variant="outline">{report.category}</Badge>
              {report.sub_category && (
                <Badge variant="secondary">{report.sub_category}</Badge>
              )}
              {report.is_anonymous && (
                <Badge variant="outline" className="gap-1">
                  <Eye className="w-3 h-3" />
                  Anonymous
                </Badge>
              )}
            </div>

            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="timeline" className="gap-1">
                  <History className="w-3 h-3" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-4">
                <IncidentTimelineDetail 
                  incidentId={report.id} 
                  incidentTitle={report.title}
                />
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {report.description}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Incident Date & Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{formatShortDate(report.incident_date)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time:</span>
                        <span>{report.incident_time || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{report.duration_minutes ? `${report.duration_minutes} mins` : 'Not specified'}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Report Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reported:</span>
                        <span>{formatDate(report.created_at)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{formatDate(report.updated_at)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Source:</span>
                        <span>{report.source || 'citizen_report'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {report.urgency_level && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Flag className="w-4 h-4" />
                        Urgency & Priority
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">Urgency: {report.urgency_level}</Badge>
                        {report.recurring_issue && (
                          <Badge variant="destructive">Recurring Issue</Badge>
                        )}
                        {report.first_occurrence === false && (
                          <Badge variant="secondary">Not First Occurrence</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Perpetrator Information */}
                {(report.perpetrator_type || report.perpetrator_description) && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Perpetrator Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {report.perpetrator_type && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{report.perpetrator_type}</span>
                        </div>
                      )}
                      {report.perpetrator_description && (
                        <p className="text-sm mt-2">{report.perpetrator_description}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Location Tab */}
              <TabsContent value="location" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {report.location_name && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Name:</span>
                            <span>{report.location_name}</span>
                          </div>
                        )}
                        {report.location_address && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Address:</span>
                            <span>{report.location_address}</span>
                          </div>
                        )}
                        {report.location_city && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">City:</span>
                            <span>{report.location_city}</span>
                          </div>
                        )}
                        {report.location_region && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Region:</span>
                            <span>{report.location_region}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {report.location_country && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Country:</span>
                            <span>{report.location_country}</span>
                          </div>
                        )}
                        {report.location_postal_code && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Postal Code:</span>
                            <span>{report.location_postal_code}</span>
                          </div>
                        )}
                        {report.location_type && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{report.location_type}</span>
                          </div>
                        )}
                        {report.location_accuracy && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Accuracy:</span>
                            <span>{report.location_accuracy}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {(report.location_latitude && report.location_longitude) && (
                      <>
                        <Separator />
                        <div className="text-sm">
                          <span className="text-muted-foreground">Coordinates: </span>
                          <span className="font-mono">
                            {report.location_latitude}, {report.location_longitude}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Impact Tab */}
              <TabsContent value="impact" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        People Affected
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Affected:</span>
                        <span>{report.estimated_people_affected || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Casualties:</span>
                        <span>{report.casualties_reported || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Injuries:</span>
                        <span>{report.injuries_reported || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Children Involved:</span>
                        <span>{report.children_involved ? 'Yes' : 'No'}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Community Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Impact Level:</span>
                        <span>{report.community_impact_level || 'Not assessed'}</span>
                      </div>
                      {report.economic_impact_estimate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Economic Impact:</span>
                          <span>${report.economic_impact_estimate.toLocaleString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {report.vulnerable_groups_affected && report.vulnerable_groups_affected.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Vulnerable Groups Affected</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {report.vulnerable_groups_affected.map((group: string, idx: number) => (
                          <Badge key={idx} variant="outline">{group}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {report.infrastructure_damage && report.infrastructure_damage.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Infrastructure Damage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {report.infrastructure_damage.map((item: string, idx: number) => (
                          <Badge key={idx} variant="destructive">{item}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {report.services_disrupted && report.services_disrupted.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Services Disrupted</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {report.services_disrupted.map((service: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{service}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {report.immediate_needs && report.immediate_needs.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Immediate Needs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {report.immediate_needs.map((need: string, idx: number) => (
                          <Badge key={idx} className="bg-orange-500 text-white">{need}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Evidence Tab */}
              <TabsContent value="evidence" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Witnesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Has Witnesses:</span>
                      <span>{report.has_witnesses ? 'Yes' : 'No'}</span>
                    </div>
                    {report.witness_count && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Witness Count:</span>
                        <span>{report.witness_count}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Physical Evidence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Has Physical Evidence:</span>
                      <span>{report.has_physical_evidence ? 'Yes' : 'No'}</span>
                    </div>
                    {report.evidence_description && (
                      <p className="text-sm mt-2">{report.evidence_description}</p>
                    )}
                  </CardContent>
                </Card>

                {report.media_urls && report.media_urls.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Media Attachments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {report.media_urls.map((url: string, idx: number) => (
                          <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline truncate"
                          >
                            Attachment {idx + 1}
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="analysis" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Threat Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={getSeverityColor(report.ai_threat_level)}>
                        {report.ai_threat_level || 'Not analyzed'}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Sentiment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline">
                        {report.ai_sentiment || 'Not analyzed'}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Credibility Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold">
                        {report.credibility_score ? `${(report.credibility_score * 100).toFixed(0)}%` : 'N/A'}
                      </span>
                    </CardContent>
                  </Card>
                </div>

                {report.ai_key_entities && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Key Entities Detected</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
                        {JSON.stringify(report.ai_key_entities, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Verification Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Verification Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(report.verification_status)}>
                        {report.verification_status || 'Unverified'}
                      </Badge>
                    </div>
                    {report.verified_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Verified At:</span>
                        <span>{formatDate(report.verified_at)}</span>
                      </div>
                    )}
                    {report.verification_notes && (
                      <>
                        <Separator />
                        <p className="text-sm">{report.verification_notes}</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Engagement Stats */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{report.view_count || 0}</div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{report.share_count || 0}</div>
                        <div className="text-xs text-muted-foreground">Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{report.engagement_score || 0}</div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
