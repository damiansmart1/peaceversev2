import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Handshake, Building2, Globe, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-typed';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const partnerSchema = z.object({
  organization_name: z.string().trim().min(2, 'Organization name is required').max(200),
  contact_name: z.string().trim().min(2, 'Contact name is required').max(100),
  contact_email: z.string().trim().email('Valid email is required').max(255),
  contact_phone: z.string().trim().max(30).optional().or(z.literal('')),
  organization_type: z.string().min(1, 'Please select organization type'),
  partnership_tier: z.string().min(1, 'Please select partnership tier'),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  website_url: z.string().trim().url('Please enter a valid URL').max(500).optional().or(z.literal('')),
  message: z.string().trim().min(20, 'Please provide at least 20 characters').max(2000),
});

type PartnerForm = z.infer<typeof partnerSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BecomePartnerDialog = ({ open, onOpenChange }: Props) => {
  const [form, setForm] = useState<PartnerForm>({
    organization_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    organization_type: '',
    partnership_tier: '',
    country: '',
    website_url: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof PartnerForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = partnerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = { ...result.data };
      if (!payload.contact_phone) delete payload.contact_phone;
      if (!payload.country) delete payload.country;
      if (!payload.website_url) delete payload.website_url;

      const { error } = await supabase.from('partnership_inquiries').insert(payload);
      if (error) throw error;
      setSubmitted(true);
      toast({ title: 'Partnership inquiry submitted', description: 'We will review your application and get back to you shortly.' });
    } catch {
      toast({ title: 'Submission failed', description: 'Please try again later.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSubmitted(false);
      setForm({ organization_name: '', contact_name: '', contact_email: '', contact_phone: '', organization_type: '', partnership_tier: '', country: '', website_url: '', message: '' });
      setErrors({});
    }
    onOpenChange(val);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex flex-col items-center py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Application Received</h3>
            <p className="text-muted-foreground max-w-sm">
              Thank you for your interest in partnering with Peaceverse. Our partnerships team will review your application and respond within 5 business days.
            </p>
            <Button onClick={() => handleClose(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Handshake className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Become a Partner</DialogTitle>
              <DialogDescription>Join our coalition for African peace and security</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Organization Info */}
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs mb-2"><Building2 className="w-3 h-3 mr-1" />Organization Details</Badge>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="org_name">Organization Name *</Label>
                <Input id="org_name" value={form.organization_name} onChange={e => updateField('organization_name', e.target.value)} placeholder="e.g. African Union" />
                {errors.organization_name && <p className="text-xs text-destructive">{errors.organization_name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org_type">Organization Type *</Label>
                <Select value={form.organization_type} onValueChange={v => updateField('organization_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="international_org">International Organization</SelectItem>
                    <SelectItem value="government">Government Agency</SelectItem>
                    <SelectItem value="ngo">NGO / Civil Society</SelectItem>
                    <SelectItem value="academic">Academic / Research</SelectItem>
                    <SelectItem value="tech">Technology Company</SelectItem>
                    <SelectItem value="media">Media Organization</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.organization_type && <p className="text-xs text-destructive">{errors.organization_type}</p>}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={e => updateField('country', e.target.value)} placeholder="e.g. Kenya" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={form.website_url} onChange={e => updateField('website_url', e.target.value)} placeholder="https://..." />
                {errors.website_url && <p className="text-xs text-destructive">{errors.website_url}</p>}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs mb-2"><Globe className="w-3 h-3 mr-1" />Contact Information</Badge>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Contact Person *</Label>
                <Input id="contact_name" value={form.contact_name} onChange={e => updateField('contact_name', e.target.value)} placeholder="Full name" />
                {errors.contact_name && <p className="text-xs text-destructive">{errors.contact_name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_email">Email Address *</Label>
                <Input id="contact_email" type="email" value={form.contact_email} onChange={e => updateField('contact_email', e.target.value)} placeholder="email@organization.org" />
                {errors.contact_email && <p className="text-xs text-destructive">{errors.contact_email}</p>}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact_phone">Phone (Optional)</Label>
                <Input id="contact_phone" value={form.contact_phone} onChange={e => updateField('contact_phone', e.target.value)} placeholder="+254..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tier">Partnership Tier *</Label>
                <Select value={form.partnership_tier} onValueChange={v => updateField('partnership_tier', v)}>
                  <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community">Community Partner ($1K–$10K)</SelectItem>
                    <SelectItem value="regional">Regional Partner ($10K–$50K)</SelectItem>
                    <SelectItem value="strategic">Strategic Partner ($50K+)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.partnership_tier && <p className="text-xs text-destructive">{errors.partnership_tier}</p>}
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message">How would you like to partner with Peaceverse? *</Label>
            <Textarea id="message" rows={4} value={form.message} onChange={e => updateField('message', e.target.value)} placeholder="Describe your organization's interest in partnering, areas of expertise, and how you envision contributing to peacebuilding in Africa..." />
            {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Handshake className="w-4 h-4 mr-2" />Submit Application</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BecomePartnerDialog;
