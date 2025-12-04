import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useVerificationTasks, type VerificationResult } from '@/hooks/useVerificationTasks';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, XCircle, AlertCircle, MapPin, Calendar, User, 
  Shield, FileText, Link2, Clock, Eye, Target, Users, Camera
} from 'lucide-react';
import { VerificationChecklist } from './verification/VerificationChecklist';
import { EvidenceReview } from './verification/EvidenceReview';
import { SourceCredibility } from './verification/SourceCredibility';
import { CrossReferencePanel } from './verification/CrossReferencePanel';
import { VerificationTimeline } from './verification/VerificationTimeline';
import { RiskAssessment } from './verification/RiskAssessment';

const verificationSchema = z.object({
  verdict: z.enum(['verified', 'rejected', 'needs_more_info', 'escalated']),
  confidence_score: z.number().min(0).max(100),
  notes: z.string().min(20, 'Please provide detailed notes (minimum 20 characters)'),
  recommended_action: z.string().optional(),
  escalation_reason: z.string().optional(),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface VerificationTaskDetailProps {
  task: any;
  onClose: () => void;
}

export const VerificationTaskDetail = ({ task, onClose }: VerificationTaskDetailProps) => {
  const { completeVerification, isCompleting } = useVerificationTasks();
  const [confidenceScore, setConfidenceScore] = useState(50);
  const [checklistProgress, setChecklistProgress] = useState(0);
  const [completedChecklist, setCompletedChecklist] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verdict: 'verified',
      confidence_score: 50,
      notes: '',
      recommended_action: '',
      escalation_reason: '',
    },
  });

  const watchVerdict = form.watch('verdict');

  const onSubmit = (values: VerificationFormValues) => {
    if (checklistProgress < 100) {
      return;
    }
    
    completeVerification({
      taskId: task.id,
      verdict: values.verdict,
      confidence_score: values.confidence_score,
      notes: values.notes,
      recommended_action: values.recommended_action,
    } as VerificationResult);
    onClose();
  };

  const handleEvidenceVerify = (id: string, status: 'verified' | 'suspicious' | 'flagged') => {
    console.log('Evidence verification:', id, status);
  };

  const report = task.citizen_reports;

  const canSubmit = checklistProgress === 100;

  return (
    <div className="space-y-6">
      {/* Report Summary Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="outline">{report?.category}</Badge>
                <Badge className={
                  task.priority === 'critical' ? 'bg-red-500' :
                  task.priority === 'high' ? 'bg-orange-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }>
                  {task.priority} priority
                </Badge>
                {report?.ai_threat_level && (
                  <Badge variant="destructive">{report.ai_threat_level}</Badge>
                )}
                <Badge variant="secondary">
                  {report?.is_anonymous ? 'Anonymous' : 'Identified'}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold">{report?.title}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(report?.created_at).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {report?.location_name}, {report?.location_country}
                </span>
                {report?.witness_count && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {report.witness_count} witnesses
                  </span>
                )}
                {report?.credibility_score && (
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    AI Credibility: {report.credibility_score}%
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Checklist Progress</div>
              <div className={`text-3xl font-bold ${checklistProgress === 100 ? 'text-green-500' : 'text-orange-500'}`}>
                {checklistProgress}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-1">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="evidence" className="gap-1">
            <Camera className="w-4 h-4" />
            <span className="hidden md:inline">Evidence</span>
          </TabsTrigger>
          <TabsTrigger value="source" className="gap-1">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Source</span>
          </TabsTrigger>
          <TabsTrigger value="crossref" className="gap-1">
            <Link2 className="w-4 h-4" />
            <span className="hidden md:inline">Cross-Ref</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="gap-1">
            <AlertCircle className="w-4 h-4" />
            <span className="hidden md:inline">Risk</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1">
            <Clock className="w-4 h-4" />
            <span className="hidden md:inline">Timeline</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {/* Left Column - Tab Content */}
          <div className="lg:col-span-2">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Report Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {report?.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Category</div>
                        <div className="font-medium">{report?.category}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Severity</div>
                        <div className="font-medium">{report?.severity_level || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">People Affected</div>
                        <div className="font-medium">{report?.estimated_people_affected || 'Unknown'}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Location</div>
                        <div className="font-medium">{report?.location_name}</div>
                        {report?.location_latitude && (
                          <div className="text-xs text-muted-foreground">
                            {report.location_latitude.toFixed(4)}, {report.location_longitude.toFixed(4)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">AI Sentiment</div>
                        <div className="font-medium capitalize">{report?.ai_sentiment || 'Not analyzed'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Witnesses</div>
                        <div className="font-medium">{report?.witness_count || 0} reported</div>
                      </div>
                    </div>
                  </div>

                  {report?.tags && report.tags.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {report.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">#{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.ai_recommendation && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        AI Analysis Recommendation:
                      </p>
                      <p className="text-sm text-muted-foreground">{task.ai_recommendation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="mt-0">
              <EvidenceReview 
                evidence={[]} 
                onEvidenceVerify={handleEvidenceVerify}
              />
            </TabsContent>

            <TabsContent value="source" className="mt-0">
              <SourceCredibility reporter={{
                id: report?.reporter_id || 'unknown',
                username: 'peace_advocate_ke',
                displayName: 'Peace Advocate',
                isAnonymous: report?.is_anonymous || false,
                joinedAt: '2023-06-15T00:00:00Z',
                verifiedReports: 12,
                totalReports: 15,
                rejectedReports: 1,
                accuracyScore: report?.credibility_score || 75,
                trustLevel: report?.is_anonymous ? 'anonymous' : 'trusted',
                badges: ['First Report', 'Accurate Reporter'],
                recentActivity: [],
              }} />
            </TabsContent>

            <TabsContent value="crossref" className="mt-0">
              <CrossReferencePanel
                reportId={report?.id}
                location={{ 
                  lat: report?.location_latitude || 0, 
                  lng: report?.location_longitude || 0,
                  name: report?.location_name || ''
                }}
                date={report?.created_at}
                category={report?.category}
              />
            </TabsContent>

            <TabsContent value="risk" className="mt-0">
              <RiskAssessment
                overallRisk={72}
                threatLevel={task.priority === 'critical' ? 'critical' : task.priority === 'high' ? 'high' : 'medium'}
                escalationProbability={45}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <VerificationTimeline reportId={report?.id} />
            </TabsContent>
          </div>

          {/* Right Column - Checklist & Decision Form */}
          <div className="space-y-4">
            <VerificationChecklist
              onProgressChange={setChecklistProgress}
              onCompletedItemsChange={setCompletedChecklist}
            />

            {/* Verification Decision Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Verification Decision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="verdict"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Decision *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select verdict" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="verified">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  Verified
                                </div>
                              </SelectItem>
                              <SelectItem value="rejected">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  Rejected
                                </div>
                              </SelectItem>
                              <SelectItem value="needs_more_info">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                                  Needs More Info
                                </div>
                              </SelectItem>
                              <SelectItem value="escalated">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  Escalate
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confidence_score"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confidence: {confidenceScore}%</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={5}
                              value={[confidenceScore]}
                              onValueChange={(value) => {
                                setConfidenceScore(value[0]);
                                field.onChange(value[0]);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Notes *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain your reasoning..."
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Min 20 characters required
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchVerdict === 'escalated' && (
                      <FormField
                        control={form.control}
                        name="escalation_reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Escalation Reason</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Why does this need escalation?"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="recommended_action"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recommended Action</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Suggest next steps..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!canSubmit && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Complete all required checklist items before submitting
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button 
                        type="submit" 
                        disabled={isCompleting || !canSubmit} 
                        className="flex-1"
                      >
                        {isCompleting ? 'Submitting...' : 'Submit Verification'}
                      </Button>
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
};
