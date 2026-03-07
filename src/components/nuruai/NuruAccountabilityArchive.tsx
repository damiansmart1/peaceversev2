import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, MessageSquare, Clock, Send, Loader2, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useCivicQuestions, useInstitutionalResponses, useSubmitResponse } from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const NuruAccountabilityArchive = () => {
  const { data: questions, isLoading } = useCivicQuestions();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const { data: responses } = useInstitutionalResponses(selectedQuestion || '');
  const submitResponse = useSubmitResponse();
  const { user } = useAuth();

  const handleSubmitResponse = () => {
    if (!selectedQuestion || !responseText.trim() || !institutionName.trim()) return;
    submitResponse.mutate({ questionId: selectedQuestion, institutionName, responseText }, {
      onSuccess: () => { setResponseText(''); },
    });
  };

  const answeredQuestions = questions?.filter(q => q.status === 'answered') || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Questions Archive */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />Public Accountability Archive
          </CardTitle>
          <p className="text-sm text-muted-foreground">Track how institutions respond to civic questions</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : answeredQuestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No civic interactions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {answeredQuestions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedQuestion(q.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedQuestion === q.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/20'}`}
                >
                  <p className="text-sm font-medium line-clamp-2">{q.question_text}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(q.created_at), 'MMM d, yyyy HH:mm')}
                    <Badge variant={q.ai_answer ? 'secondary' : 'outline'} className="text-xs ml-auto">
                      {q.ai_answer ? 'AI Answered' : 'Pending'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Thread */}
      <div className="space-y-4">
        {selectedQuestion ? (
          <>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Institutional Responses</CardTitle>
              </CardHeader>
              <CardContent>
                {responses?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No institutional responses yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {responses?.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">{r.institution_name}</span>
                          <Badge variant="secondary" className="text-xs ml-auto gap-1"><CheckCircle className="h-3 w-3" />Official</Badge>
                        </div>
                        <p className="text-sm text-foreground">{r.response_text}</p>
                        <p className="text-xs text-muted-foreground mt-2">{format(new Date(r.created_at), 'MMM d, yyyy HH:mm')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {user && (
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Submit Institutional Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Institution name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
                  <Textarea placeholder="Write the official response..." rows={4} value={responseText} onChange={(e) => setResponseText(e.target.value)} />
                  <Button onClick={handleSubmitResponse} disabled={submitResponse.isPending} className="w-full gap-2">
                    {submitResponse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Publish Response
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">Select a question to view institutional responses</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NuruAccountabilityArchive;
