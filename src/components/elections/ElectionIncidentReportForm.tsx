import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Calendar,
  Upload,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  useIncidentCategories, 
  useSubmitElectionIncident,
  type Election,
  type IncidentSeverity
} from '@/hooks/useElections';

interface ElectionIncidentReportFormProps {
  elections: Election[];
}

export default function ElectionIncidentReportForm({ elections }: ElectionIncidentReportFormProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCode, setSubmittedCode] = useState('');
  
  const [formData, setFormData] = useState({
    election_id: '',
    title: '',
    description: '',
    category: '',
    sub_category: '',
    severity: 'moderate' as IncidentSeverity,
    country_code: '',
    region: '',
    district: '',
    location_address: '',
    incident_datetime: new Date().toISOString().slice(0, 16),
    is_anonymous: false,
    voting_disrupted: false,
    requires_immediate_action: false,
    has_witnesses: false,
    witness_count: 0,
    evidence_description: '',
  });

  const { data: categories } = useIncidentCategories();
  const submitIncident = useSubmitElectionIncident();

  const activeElections = elections.filter(e => 
    ['voting', 'counting', 'verification', 'scheduled', 'campaigning'].includes(e.status)
  );

  const selectedElection = elections.find(e => e.id === formData.election_id);
  const selectedCategory = categories?.find(c => c.name === formData.category);

  const handleSubmit = async () => {
    const result = await submitIncident.mutateAsync({
      ...formData,
      country_code: selectedElection?.country_code || '',
    });
    
    setSubmittedCode(result?.incident_code || 'UNKNOWN');
    setSubmitted(true);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Report Submitted Successfully</h2>
          <p className="text-muted-foreground mb-4">
            Your election incident report has been submitted for verification.
          </p>
          <div className="bg-muted p-4 rounded-lg inline-block mb-6">
            <p className="text-sm text-muted-foreground">Reference Code</p>
            <p className="text-2xl font-mono font-bold">{submittedCode}</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => { setSubmitted(false); setStep(1); setFormData({...formData, title: '', description: ''}); }}>
              Submit Another Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <CardTitle>Report Election Incident</CardTitle>
            <CardDescription>
              Document incidents to ensure election integrity and transparency
            </CardDescription>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mt-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              <p className={`text-xs mt-1 ${s <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Basic Info' : s === 2 ? 'Details' : 'Review'}
              </p>
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {step === 1 && (
          <>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Select Election *</Label>
                <Select 
                  value={formData.election_id} 
                  onValueChange={(value) => updateField('election_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the election this incident relates to" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeElections.map(election => (
                      <SelectItem key={election.id} value={election.id}>
                        <div className="flex items-center gap-2">
                          <span>{election.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {election.country_name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Incident Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Brief description of what happened"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => updateField('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCategory && selectedCategory.sub_categories.length > 0 && (
                  <div className="grid gap-2">
                    <Label>Sub-Category</Label>
                    <Select 
                      value={formData.sub_category} 
                      onValueChange={(value) => updateField('sub_category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.sub_categories.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Severity Level *</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(value: IncidentSeverity) => updateField('severity', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400" />
                        Minor - No impact on voting process
                      </div>
                    </SelectItem>
                    <SelectItem value="moderate">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        Moderate - Limited impact
                      </div>
                    </SelectItem>
                    <SelectItem value="serious">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        Serious - Significant disruption
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        Critical - Major disruption
                      </div>
                    </SelectItem>
                    <SelectItem value="emergency">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-700" />
                        Emergency - Immediate response required
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={() => setStep(2)}
              disabled={!formData.election_id || !formData.title || !formData.category}
            >
              Continue to Details
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Detailed Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Provide a detailed account of what happened. Include who was involved, what you witnessed, and any relevant circumstances."
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Region
                  </Label>
                  <Input
                    value={formData.region}
                    onChange={(e) => updateField('region', e.target.value)}
                    placeholder="e.g., Nairobi"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>District/Constituency</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    placeholder="e.g., Westlands"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Specific Address/Location</Label>
                <Input
                  value={formData.location_address}
                  onChange={(e) => updateField('location_address', e.target.value)}
                  placeholder="Polling station name or specific location"
                />
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  When did this happen? *
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.incident_datetime}
                  onChange={(e) => updateField('incident_datetime', e.target.value)}
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Impact & Witnesses
                </h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Did this disrupt voting?</Label>
                    <p className="text-xs text-muted-foreground">The incident prevented or delayed voting</p>
                  </div>
                  <Switch
                    checked={formData.voting_disrupted}
                    onCheckedChange={(checked) => updateField('voting_disrupted', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requires Immediate Action?</Label>
                    <p className="text-xs text-muted-foreground">Flag for urgent response</p>
                  </div>
                  <Switch
                    checked={formData.requires_immediate_action}
                    onCheckedChange={(checked) => updateField('requires_immediate_action', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Are there witnesses?</Label>
                    <p className="text-xs text-muted-foreground">Other people saw what happened</p>
                  </div>
                  <Switch
                    checked={formData.has_witnesses}
                    onCheckedChange={(checked) => updateField('has_witnesses', checked)}
                  />
                </div>

                {formData.has_witnesses && (
                  <div className="grid gap-2">
                    <Label>Approximate number of witnesses</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.witness_count}
                      onChange={(e) => updateField('witness_count', parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => setStep(3)}
                disabled={!formData.description}
              >
                Review & Submit
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Election</span>
                  <span className="font-medium">{selectedElection?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{formData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity</span>
                  <Badge className={`${
                    formData.severity === 'critical' || formData.severity === 'emergency' 
                      ? 'bg-red-500' 
                      : formData.severity === 'serious' 
                        ? 'bg-orange-500' 
                        : 'bg-yellow-500'
                  } text-white`}>
                    {formData.severity}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>{formData.region || 'Not specified'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{formData.title}</h4>
                <p className="text-sm text-muted-foreground">{formData.description}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {formData.is_anonymous ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <Label>Submit Anonymously</Label>
                      <p className="text-xs text-muted-foreground">Your identity will be protected</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_anonymous}
                    onCheckedChange={(checked) => updateField('is_anonymous', checked)}
                  />
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Verification Notice</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      All reports are verified before publication. False reporting may result in account suspension.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSubmit}
                disabled={submitIncident.isPending}
              >
                {submitIncident.isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
