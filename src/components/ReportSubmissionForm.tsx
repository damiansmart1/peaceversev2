import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Upload, AlertTriangle, FileText, Users, Clock, Phone, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCitizenReports } from '@/hooks/useCitizenReports';

const reportSchema = z.object({
  // Basic Information
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(10000),
  category: z.enum(['violence', 'displacement', 'human_rights', 'infrastructure', 'health', 'education', 'security', 'environmental', 'economic', 'social', 'other']),
  sub_category: z.string().optional(),
  
  // Incident Details
  incident_date: z.string().optional(),
  incident_time: z.string().optional(),
  duration_minutes: z.number().min(0).optional(),
  severity_level: z.enum(['low', 'medium', 'high', 'critical', 'emergency']).optional(),
  urgency_level: z.enum(['routine', 'priority', 'urgent', 'immediate']).optional(),
  
  // People Involved
  estimated_people_affected: z.number().min(0).optional(),
  casualties_reported: z.number().min(0).optional(),
  injuries_reported: z.number().min(0).optional(),
  children_involved: z.boolean().default(false),
  vulnerable_groups: z.array(z.string()).optional(),
  
  // Perpetrator Information
  perpetrator_type: z.enum(['individual', 'group', 'organization', 'government', 'militia', 'unknown', 'other']).optional(),
  perpetrator_description: z.string().optional(),
  
  // Witness Information
  has_witnesses: z.boolean().default(false),
  witness_count: z.number().min(0).optional(),
  
  // Contact Information
  reporter_contact_phone: z.string().optional(),
  reporter_contact_email: z.string().email().optional().or(z.literal('')),
  preferred_contact_method: z.enum(['email', 'phone', 'none']).default('none'),
  
  // Location
  location_address: z.string().optional(),
  location_city: z.string().optional(),
  location_region: z.string().optional(),
  location_country: z.string().optional(),
  location_postal_code: z.string().optional(),
  location_accuracy: z.enum(['exact', 'approximate', 'general_area', 'unknown']).default('approximate'),
  location_type: z.enum(['public_space', 'residential', 'commercial', 'institutional', 'rural', 'urban', 'other']).optional(),
  
  // Evidence
  evidence_description: z.string().optional(),
  has_physical_evidence: z.boolean().default(false),
  
  // Impact
  immediate_needs: z.array(z.string()).optional(),
  community_impact_level: z.enum(['minimal', 'moderate', 'significant', 'severe', 'catastrophic']).optional(),
  services_disrupted: z.array(z.string()).optional(),
  infrastructure_damage: z.array(z.string()).optional(),
  economic_impact_estimate: z.number().min(0).optional(),
  community_response: z.string().optional(),
  immediate_actions_taken: z.array(z.string()).optional(),
  
  // Assistance
  assistance_received: z.boolean().default(false),
  assistance_type: z.array(z.string()).optional(),
  assistance_provider: z.string().optional(),
  
  // Context
  historical_context: z.string().optional(),
  recurring_issue: z.boolean().default(false),
  first_occurrence: z.boolean().default(true),
  previous_reports_filed: z.boolean().default(false),
  related_incidents: z.string().optional(),
  
  // Authorities
  authorities_notified: z.boolean().default(false),
  authorities_responded: z.boolean().default(false),
  authority_response_details: z.string().optional(),
  
  // Follow-up
  follow_up_contact_consent: z.boolean().default(false),
  
  // Metadata
  tags: z.string().optional(),
  is_anonymous: z.boolean().default(false),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const CATEGORIES = [
  { value: 'violence', label: 'Violence & Conflict', icon: AlertTriangle },
  { value: 'displacement', label: 'Displacement & Migration', icon: Users },
  { value: 'human_rights', label: 'Human Rights Violations', icon: FileText },
  { value: 'infrastructure', label: 'Infrastructure Damage', icon: AlertCircle },
  { value: 'health', label: 'Health & Safety', icon: AlertTriangle },
  { value: 'education', label: 'Education Access', icon: FileText },
  { value: 'security', label: 'Security Issues', icon: AlertTriangle },
  { value: 'environmental', label: 'Environmental', icon: AlertCircle },
  { value: 'economic', label: 'Economic Issues', icon: AlertCircle },
  { value: 'social', label: 'Social Issues', icon: Users },
  { value: 'other', label: 'Other', icon: FileText },
];

const VULNERABLE_GROUPS = ['children', 'elderly', 'disabled', 'women', 'minorities'];
const IMMEDIATE_NEEDS = ['medical', 'shelter', 'food', 'water', 'security', 'legal', 'psychosocial'];
const SERVICES_DISRUPTED = ['water', 'electricity', 'healthcare', 'education', 'transportation', 'communication'];
const INFRASTRUCTURE_DAMAGE = ['roads', 'bridges', 'buildings', 'utilities', 'telecommunications', 'public_facilities'];
const IMMEDIATE_ACTIONS = ['evacuation', 'first_aid', 'contacted_authorities', 'secured_area', 'documented_evidence', 'assisted_victims'];
const ASSISTANCE_TYPES = ['medical', 'food', 'shelter', 'financial', 'legal', 'counseling', 'protection'];
const PERPETRATOR_TYPES = ['individual', 'group', 'organization', 'government', 'militia', 'unknown', 'other'];

export const ReportSubmissionForm = () => {
  const { submitReport, isSubmitting } = useCitizenReports();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      is_anonymous: false,
      severity_level: 'medium',
      urgency_level: 'routine',
      children_involved: false,
      has_witnesses: false,
      location_accuracy: 'approximate',
      has_physical_evidence: false,
      recurring_issue: false,
      first_occurrence: true,
      previous_reports_filed: false,
      authorities_notified: false,
      authorities_responded: false,
      assistance_received: false,
      follow_up_contact_consent: false,
      preferred_contact_method: 'none',
    },
  });

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setGettingLocation(false);
        }
      );
    } else {
      setGettingLocation(false);
    }
  };

  const onSubmit = (values: ReportFormValues) => {
    const tags = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    submitReport({
      title: values.title,
      description: values.description,
      category: values.category,
      sub_category: values.sub_category,
      
      // Incident details
      incident_date: values.incident_date,
      incident_time: values.incident_time,
      duration_minutes: values.duration_minutes,
      severity_level: values.severity_level,
      urgency_level: values.urgency_level,
      
      // People involved
      estimated_people_affected: values.estimated_people_affected,
      casualties_reported: values.casualties_reported,
      injuries_reported: values.injuries_reported,
      children_involved: values.children_involved,
      vulnerable_groups_affected: values.vulnerable_groups,
      
      // Perpetrator
      perpetrator_type: values.perpetrator_type,
      perpetrator_description: values.perpetrator_description,
      
      // Witnesses
      has_witnesses: values.has_witnesses,
      witness_count: values.witness_count,
      
      // Contact
      reporter_contact_phone: values.reporter_contact_phone,
      reporter_contact_email: values.reporter_contact_email,
      preferred_contact_method: values.preferred_contact_method,
      
      // Location
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        address: values.location_address,
        city: values.location_city,
        region: values.location_region,
        country: values.location_country,
        postal_code: values.location_postal_code,
        accuracy: values.location_accuracy,
        type: values.location_type,
      } : undefined,
      
      // Evidence
      evidence_description: values.evidence_description,
      has_physical_evidence: values.has_physical_evidence,
      
      // Impact
      immediate_needs: values.immediate_needs,
      community_impact_level: values.community_impact_level,
      services_disrupted: values.services_disrupted,
      infrastructure_damage: values.infrastructure_damage,
      economic_impact_estimate: values.economic_impact_estimate,
      community_response: values.community_response,
      immediate_actions_taken: values.immediate_actions_taken,
      
      // Assistance
      assistance_received: values.assistance_received,
      assistance_type: values.assistance_type,
      assistance_provider: values.assistance_provider,
      
      // Context
      historical_context: values.historical_context,
      recurring_issue: values.recurring_issue,
      first_occurrence: values.first_occurrence,
      previous_reports_filed: values.previous_reports_filed,
      related_incidents: values.related_incidents,
      
      // Authorities
      authorities_notified: values.authorities_notified,
      authorities_responded: values.authorities_responded,
      authority_response_details: values.authority_response_details,
      
      // Follow-up
      follow_up_contact_consent: values.follow_up_contact_consent,
      
      // Metadata
      is_anonymous: values.is_anonymous,
      tags,
    });

    form.reset();
    setLocation(null);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Comprehensive Incident Report
        </CardTitle>
        <CardDescription>
          Provide detailed information to facilitate accurate verification and response. Fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief summary of the incident" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, concise title (5-200 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sub_category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-category</FormLabel>
                        <FormControl>
                          <Input placeholder="Specific type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide comprehensive details: What happened? When? Where? Who was involved? What did you witness?"
                          className="min-h-40"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 20 characters. Be as detailed as possible for accurate verification.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="severity_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urgency_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="immediate">Immediate</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="incident_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incident_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">People Affected</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="estimated_people_affected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated People Affected</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="casualties_reported"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Casualties</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="injuries_reported"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Injuries</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="vulnerable_groups"
                  render={() => (
                    <FormItem>
                      <FormLabel>Vulnerable Groups Affected</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {VULNERABLE_GROUPS.map((group) => (
                          <FormField
                            key={group}
                            control={form.control}
                            name="vulnerable_groups"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(group)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        checked
                                          ? [...current, group]
                                          : current.filter((v) => v !== group)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal capitalize">{group}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="children_involved"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Children were involved in this incident</FormLabel>
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Perpetrator Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="perpetrator_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Perpetrator Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PERPETRATOR_TYPES.map((type) => (
                                <SelectItem key={type} value={type} className="capitalize">
                                  {type.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="perpetrator_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perpetrator Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the individuals or groups responsible, if known..."
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Immediate Actions Taken</h4>
                  <FormField
                    control={form.control}
                    name="immediate_actions_taken"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-3 gap-2">
                          {IMMEDIATE_ACTIONS.map((action) => (
                            <FormField
                              key={action}
                              control={form.control}
                              name="immediate_actions_taken"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(action)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        field.onChange(
                                          checked
                                            ? [...current, action]
                                            : current.filter((v) => v !== action)
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal capitalize text-xs">
                                    {action.replace('_', ' ')}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Witness Information</h4>
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="has_witnesses"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Were there witnesses?</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="witness_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="Number of witnesses"
                              className="w-40"
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Authorities Response</h4>
                  <FormField
                    control={form.control}
                    name="authorities_notified"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Were authorities notified?</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authorities_responded"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Did authorities respond?</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authority_response_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authority Response Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the response from authorities..."
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">GPS Coordinates</h4>
                    <p className="text-sm text-muted-foreground">Capture your current location</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {location ? 'Update Location' : 'Get Location'}
                  </Button>
                </div>

                {location && (
                  <Badge variant="secondary" className="gap-2">
                    <MapPin className="w-3 h-3" />
                    Location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Badge>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street, building, landmark" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Town</FormLabel>
                        <FormControl>
                          <Input placeholder="City name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location_region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region/County</FormLabel>
                        <FormControl>
                          <Input placeholder="Region or county" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location_postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal/ZIP code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location_accuracy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Accuracy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="exact">Exact Location</SelectItem>
                            <SelectItem value="approximate">Approximate</SelectItem>
                            <SelectItem value="general_area">General Area</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public_space">Public Space</SelectItem>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="institutional">Institutional</SelectItem>
                            <SelectItem value="rural">Rural</SelectItem>
                            <SelectItem value="urban">Urban</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="evidence_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe any photos, videos, documents, or physical evidence..."
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="has_physical_evidence"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">I have physical evidence available</FormLabel>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="impact" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="community_impact_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Impact Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select impact level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="significant">Significant</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                          <SelectItem value="catastrophic">Catastrophic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="immediate_needs"
                  render={() => (
                    <FormItem>
                      <FormLabel>Immediate Needs</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {IMMEDIATE_NEEDS.map((need) => (
                          <FormField
                            key={need}
                            control={form.control}
                            name="immediate_needs"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(need)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        checked
                                          ? [...current, need]
                                          : current.filter((v) => v !== need)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal capitalize">{need}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services_disrupted"
                  render={() => (
                    <FormItem>
                      <FormLabel>Services Disrupted</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {SERVICES_DISRUPTED.map((service) => (
                          <FormField
                            key={service}
                            control={form.control}
                            name="services_disrupted"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        checked
                                          ? [...current, service]
                                          : current.filter((v) => v !== service)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal capitalize">{service}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="historical_context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Context</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Has this type of incident occurred before? Provide background information..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="infrastructure_damage"
                  render={() => (
                    <FormItem>
                      <FormLabel>Infrastructure Damage</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {INFRASTRUCTURE_DAMAGE.map((damage) => (
                          <FormField
                            key={damage}
                            control={form.control}
                            name="infrastructure_damage"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(damage)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        checked
                                          ? [...current, damage]
                                          : current.filter((v) => v !== damage)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal capitalize text-xs">
                                  {damage.replace('_', ' ')}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="economic_impact_estimate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Economic Impact Estimate (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="Estimated financial damage"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Rough estimate of economic/financial damage caused
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="community_response"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Response</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How did the community respond to this incident?"
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Assistance Information</h4>
                  <FormField
                    control={form.control}
                    name="assistance_received"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Assistance was received</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assistance_type"
                    render={() => (
                      <FormItem>
                        <FormLabel>Types of Assistance</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {ASSISTANCE_TYPES.map((type) => (
                            <FormField
                              key={type}
                              control={form.control}
                              name="assistance_type"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(type)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        field.onChange(
                                          checked
                                            ? [...current, type]
                                            : current.filter((v) => v !== type)
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal capitalize text-xs">{type}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assistance_provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assistance Provider</FormLabel>
                        <FormControl>
                          <Input placeholder="Organization or agency that provided assistance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="related_incidents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Incidents</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe any related incidents or provide incident IDs if known..."
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="recurring_issue"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">This is a recurring issue</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="first_occurrence"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">First time occurrence</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previous_reports_filed"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Previous reports filed</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Contact information is optional and will only be used for follow-up verification if needed.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="preferred_contact_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Do not contact me</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reporter_contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reporter_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+254..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="follow_up_contact_consent"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        I consent to be contacted for follow-up verification and additional information
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., urgent, civilian, witness, peacekeeping" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags to help categorize your report
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_anonymous"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Submit Anonymously</FormLabel>
                        <FormDescription>
                          Your identity will be completely hidden. No personal information will be stored.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Comprehensive Report'}
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};