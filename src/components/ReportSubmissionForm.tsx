import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Upload, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useCitizenReports } from '@/hooks/useCitizenReports';

const reportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description must be less than 5000 characters'),
  category: z.enum(['violence', 'displacement', 'human_rights', 'infrastructure', 'health', 'education', 'other']),
  location_address: z.string().optional(),
  is_anonymous: z.boolean().default(false),
  tags: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const CATEGORIES = [
  { value: 'violence', label: 'Violence & Conflict', icon: AlertTriangle },
  { value: 'displacement', label: 'Displacement & Migration', icon: MapPin },
  { value: 'human_rights', label: 'Human Rights Violations', icon: FileText },
  { value: 'infrastructure', label: 'Infrastructure Damage', icon: AlertTriangle },
  { value: 'health', label: 'Health & Safety', icon: AlertTriangle },
  { value: 'education', label: 'Education Access', icon: FileText },
  { value: 'other', label: 'Other', icon: FileText },
];

export const ReportSubmissionForm = () => {
  const { submitReport, isSubmitting } = useCitizenReports();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      is_anonymous: false,
      location_address: '',
      tags: '',
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
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        address: values.location_address,
      } : undefined,
      is_anonymous: values.is_anonymous,
      tags,
    });

    form.reset();
    setLocation(null);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Submit Citizen Report
        </CardTitle>
        <CardDescription>
          Share your experience to help build peace and accountability. All reports are reviewed by our verification team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                          </div>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide as much detail as possible about what happened, when, where, and who was involved..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 20 characters, maximum 5000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Location Information</h4>
                  <p className="text-sm text-muted-foreground">Help us map the incident</p>
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
                  Location captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Badge>
              )}

              <FormField
                control={form.control}
                name="location_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="City, district, or landmark" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., urgent, civilian, witness" {...field} />
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
                      Your identity will be hidden from the public and other users
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

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
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
