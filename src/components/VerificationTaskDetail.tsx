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
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, MapPin, Calendar, User } from 'lucide-react';

const verificationSchema = z.object({
  verdict: z.enum(['verified', 'rejected', 'needs_more_info']),
  confidence_score: z.number().min(0).max(100),
  notes: z.string().min(10, 'Please provide detailed notes (minimum 10 characters)'),
  recommended_action: z.string().optional(),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface VerificationTaskDetailProps {
  task: any;
  onClose: () => void;
}

export const VerificationTaskDetail = ({ task, onClose }: VerificationTaskDetailProps) => {
  const { completeVerification, isCompleting } = useVerificationTasks();
  const [confidenceScore, setConfidenceScore] = useState(50);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verdict: 'verified',
      confidence_score: 50,
      notes: '',
      recommended_action: '',
    },
  });

  const onSubmit = (values: VerificationFormValues) => {
    completeVerification({
      taskId: task.id,
      verdict: values.verdict,
      confidence_score: values.confidence_score,
      notes: values.notes,
      recommended_action: values.recommended_action,
    } as VerificationResult);
    onClose();
  };

  const report = task.citizen_reports;

  return (
    <div className="space-y-6">
      {/* Report Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{report.category}</Badge>
                {report.threat_level && (
                  <Badge variant="destructive">{report.threat_level}</Badge>
                )}
                <Badge variant="secondary">
                  {report.is_anonymous ? 'Anonymous' : 'Identified'}
                </Badge>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reported:</span>
                <span>{new Date(report.created_at).toLocaleString()}</span>
              </div>
              {report.location_name && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span>{report.location_name}</span>
                </div>
              )}
              {!report.is_anonymous && report.profiles && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Reporter:</span>
                  <span>{report.profiles.display_name || report.profiles.username}</span>
                </div>
              )}
              {report.ai_credibility_score && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">AI Credibility:</span>
                  <span>{report.ai_credibility_score}%</span>
                </div>
              )}
            </div>

            {report.tags && report.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {report.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {task.ai_recommendation && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">AI Analysis Recommendation:</p>
                <p className="text-sm text-muted-foreground">{task.ai_recommendation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Form */}
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="verdict"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Decision *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your verdict" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="verified">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Verified - Report is accurate and credible
                          </div>
                        </SelectItem>
                        <SelectItem value="rejected">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            Rejected - Report cannot be verified
                          </div>
                        </SelectItem>
                        <SelectItem value="needs_more_info">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            Needs More Information
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
                    <FormLabel>Confidence Level: {confidenceScore}%</FormLabel>
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
                    <FormDescription>
                      How confident are you in your verification decision?
                    </FormDescription>
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
                        placeholder="Explain your reasoning, evidence reviewed, and any concerns..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed notes help maintain audit trails and improve future verifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recommended_action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommended Action (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Suggest any follow-up actions, escalations, or next steps..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={isCompleting} className="flex-1">
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
  );
};
