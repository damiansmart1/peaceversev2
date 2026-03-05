import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-typed';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const contactSchema = z.object({
  full_name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Valid email is required').max(255),
  subject: z.string().min(1, 'Please select a subject'),
  organization: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please provide at least 10 characters').max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactUsDialog = ({ open, onOpenChange }: Props) => {
  const [form, setForm] = useState<ContactForm>({
    full_name: '', email: '', subject: '', organization: '', message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
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
      if (!payload.organization) delete payload.organization;

      const { error } = await supabase.from('contact_messages').insert(payload);
      if (error) throw error;
      setSubmitted(true);
      toast({ title: 'Message sent', description: 'We will get back to you shortly.' });
    } catch {
      toast({ title: 'Failed to send', description: 'Please try again later.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSubmitted(false);
      setForm({ full_name: '', email: '', subject: '', organization: '', message: '' });
      setErrors({});
    }
    onOpenChange(val);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Message Sent</h3>
            <p className="text-muted-foreground max-w-sm">
              Thank you for reaching out. Our team will respond within 2 business days.
            </p>
            <Button onClick={() => handleClose(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Contact Us</DialogTitle>
              <DialogDescription>Get in touch with the Peaceverse team</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="c_name">Full Name *</Label>
              <Input id="c_name" value={form.full_name} onChange={e => updateField('full_name', e.target.value)} placeholder="Your name" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c_email">Email Address *</Label>
              <Input id="c_email" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="c_subject">Subject *</Label>
              <Select value={form.subject} onValueChange={v => updateField('subject', v)}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="media">Media & Press</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c_org">Organization (Optional)</Label>
              <Input id="c_org" value={form.organization} onChange={e => updateField('organization', e.target.value)} placeholder="Your organization" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c_message">Message *</Label>
            <Textarea id="c_message" rows={4} value={form.message} onChange={e => updateField('message', e.target.value)} placeholder="How can we help you?" />
            {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Send Message</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactUsDialog;
