import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Phone, Plus, Trash2, Edit2, Shield, Heart, 
  Building, AlertTriangle, Save, Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  country: string;
  category: 'emergency' | 'medical' | 'police' | 'humanitarian' | 'other';
  isDefault?: boolean;
}

const AFRICAN_COUNTRIES = [
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251' },
  { code: 'GH', name: 'Ghana', dialCode: '+233' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250' },
  { code: 'SN', name: 'Senegal', dialCode: '+221' },
  { code: 'CD', name: 'DR Congo', dialCode: '+243' },
  { code: 'ALL', name: 'All Countries', dialCode: '' }
];

const CATEGORY_ICONS = {
  emergency: AlertTriangle,
  medical: Heart,
  police: Shield,
  humanitarian: Globe,
  other: Phone
};

const CATEGORY_COLORS = {
  emergency: 'bg-red-500/20 text-red-600 border-red-500/30',
  medical: 'bg-pink-500/20 text-pink-600 border-pink-500/30',
  police: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  humanitarian: 'bg-green-500/20 text-green-600 border-green-500/30',
  other: 'bg-gray-500/20 text-gray-600 border-gray-500/30'
};

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: 'default-1', name: 'Emergency Services', number: '112', country: 'ALL', category: 'emergency', isDefault: true },
  { id: 'default-2', name: 'Red Cross Kenya', number: '0800-723-253', country: 'KE', category: 'humanitarian', isDefault: true },
  { id: 'default-3', name: 'UNHCR Hotline', number: '0800-727-253', country: 'KE', category: 'humanitarian', isDefault: true },
  { id: 'default-4', name: 'Police Emergency', number: '999', country: 'KE', category: 'police', isDefault: true },
  { id: 'default-5', name: 'Ambulance Kenya', number: '114', country: 'KE', category: 'medical', isDefault: true },
  { id: 'default-6', name: 'Nigeria Emergency', number: '112', country: 'NG', category: 'emergency', isDefault: true },
  { id: 'default-7', name: 'NEMA Nigeria', number: '0800-2255-6362', country: 'NG', category: 'emergency', isDefault: true },
  { id: 'default-8', name: 'Ethiopia Police', number: '991', country: 'ET', category: 'police', isDefault: true },
  { id: 'default-9', name: 'South Africa Emergency', number: '10111', country: 'ZA', category: 'police', isDefault: true },
  { id: 'default-10', name: 'Ghana Emergency', number: '999', country: 'GH', category: 'emergency', isDefault: true }
];

const STORAGE_KEY = 'peaceverse_emergency_contacts';

const EmergencyContactsManager = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    country: 'ALL',
    category: 'other' as EmergencyContact['category']
  });

  // Load contacts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      // Initialize with default contacts
      setContacts(DEFAULT_CONTACTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTACTS));
    }
  }, []);

  // Save contacts to localStorage
  const saveContacts = (newContacts: EmergencyContact[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
    setContacts(newContacts);
  };

  // Filter contacts by country
  const filteredContacts = contacts.filter(
    c => selectedCountry === 'ALL' || c.country === selectedCountry || c.country === 'ALL'
  );

  const handleAddContact = () => {
    if (!formData.name || !formData.number) {
      toast.error('Name and number are required');
      return;
    }

    if (editingContact) {
      // Update existing
      const updated = contacts.map(c => 
        c.id === editingContact.id 
          ? { ...formData, id: c.id, isDefault: c.isDefault } 
          : c
      );
      saveContacts(updated);
      toast.success('Contact updated');
    } else {
      // Add new
      const newContact: EmergencyContact = {
        ...formData,
        id: `custom-${Date.now()}`,
        isDefault: false
      };
      saveContacts([...contacts, newContact]);
      toast.success('Contact added');
    }

    setIsDialogOpen(false);
    setEditingContact(null);
    setFormData({ name: '', number: '', country: 'ALL', category: 'other' });
  };

  const handleDeleteContact = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (contact?.isDefault) {
      toast.error('Cannot delete default contacts');
      return;
    }
    saveContacts(contacts.filter(c => c.id !== id));
    toast.success('Contact deleted');
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      number: contact.number,
      country: contact.country,
      category: contact.category
    });
    setIsDialogOpen(true);
  };

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Emergency Contacts
            </CardTitle>
            <CardDescription>
              Quick access to emergency services by country
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setEditingContact(null);
                setFormData({ name: '', number: '', country: 'ALL', category: 'other' });
              }}>
                <Plus className="w-4 h-4 mr-1" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Emergency Contact'}</DialogTitle>
                <DialogDescription>
                  Add important emergency numbers for quick access offline
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    placeholder="e.g., Local Police"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="e.g., +254 700 123456"
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={v => setFormData({ ...formData, country: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AFRICAN_COUNTRIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name} {c.dialCode && `(${c.dialCode})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={v => setFormData({ ...formData, category: v as EmergencyContact['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency Services</SelectItem>
                      <SelectItem value="medical">Medical/Ambulance</SelectItem>
                      <SelectItem value="police">Police/Security</SelectItem>
                      <SelectItem value="humanitarian">Humanitarian Aid</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddContact}>
                  <Save className="w-4 h-4 mr-1" />
                  {editingContact ? 'Update' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Country Filter */}
        <div className="mb-4">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              {AFRICAN_COUNTRIES.map(c => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contacts List */}
        <ScrollArea className="h-[350px]">
          <div className="space-y-2">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No contacts for this country</p>
              </div>
            ) : (
              filteredContacts.map(contact => {
                const CategoryIcon = CATEGORY_ICONS[contact.category];
                const colorClass = CATEGORY_COLORS[contact.category];
                
                return (
                  <div 
                    key={contact.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{contact.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-primary font-mono">{contact.number}</span>
                          {contact.isDefault && (
                            <Badge variant="outline" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!contact.isDefault && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditContact(contact)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleCall(contact.number)}
                        className="ml-2"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Offline Note */}
        <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-600">
            Emergency contacts are stored locally and available offline
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyContactsManager;
