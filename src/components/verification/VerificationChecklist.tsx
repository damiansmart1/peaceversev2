import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, AlertTriangle, FileText, MapPin, Users, 
  Camera, Clock, Shield, Scale, Eye
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  category: string;
  required: boolean;
  icon: React.ReactNode;
}

const VERIFICATION_CHECKLIST: ChecklistItem[] = [
  {
    id: 'source_identity',
    label: 'Source Identity Verified',
    description: 'Confirm reporter identity through profile history or anonymous legitimacy indicators',
    category: 'Source Verification',
    required: true,
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: 'location_accuracy',
    label: 'Location Accuracy Confirmed',
    description: 'Cross-reference reported location with known landmarks, GPS data, or local knowledge',
    category: 'Geographic Verification',
    required: true,
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    id: 'timeline_consistency',
    label: 'Timeline Consistency',
    description: 'Verify dates and times are consistent and plausible for the incident type',
    category: 'Temporal Verification',
    required: true,
    icon: <Clock className="w-4 h-4" />,
  },
  {
    id: 'evidence_reviewed',
    label: 'Evidence Materials Reviewed',
    description: 'Examine all attached photos, videos, or documents for authenticity',
    category: 'Evidence Analysis',
    required: true,
    icon: <Camera className="w-4 h-4" />,
  },
  {
    id: 'cross_reference',
    label: 'Cross-Referenced with Other Reports',
    description: 'Check for corroborating or contradicting reports from the same area/time',
    category: 'Cross-Reference',
    required: true,
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: 'witness_statements',
    label: 'Witness Statements Considered',
    description: 'Review any witness information provided or noted',
    category: 'Witness Verification',
    required: false,
    icon: <Eye className="w-4 h-4" />,
  },
  {
    id: 'bias_assessment',
    label: 'Bias Assessment Complete',
    description: 'Evaluate report for potential political, ethnic, or personal bias',
    category: 'Objectivity Check',
    required: true,
    icon: <Scale className="w-4 h-4" />,
  },
  {
    id: 'severity_confirmed',
    label: 'Severity Level Confirmed',
    description: 'Validate the reported severity matches the incident details',
    category: 'Risk Assessment',
    required: true,
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    id: 'no_manipulation',
    label: 'No Evidence Manipulation Detected',
    description: 'Confirm media files show no signs of tampering or AI generation',
    category: 'Authenticity Check',
    required: true,
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 'final_review',
    label: 'Final Verification Review',
    description: 'Complete comprehensive review of all verification criteria',
    category: 'Final Review',
    required: true,
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

interface VerificationChecklistProps {
  onProgressChange: (progress: number) => void;
  onCompletedItemsChange: (items: string[]) => void;
}

export const VerificationChecklist = ({ onProgressChange, onCompletedItemsChange }: VerificationChecklistProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const requiredItems = VERIFICATION_CHECKLIST.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => checkedItems.has(item.id));
  const progress = Math.round((completedRequired.length / requiredItems.length) * 100);

  const handleCheckChange = (itemId: string, checked: boolean) => {
    const newChecked = new Set(checkedItems);
    if (checked) {
      newChecked.add(itemId);
    } else {
      newChecked.delete(itemId);
    }
    setCheckedItems(newChecked);
    
    const newRequiredCompleted = requiredItems.filter(item => newChecked.has(item.id));
    onProgressChange(Math.round((newRequiredCompleted.length / requiredItems.length) * 100));
    onCompletedItemsChange(Array.from(newChecked));
  };

  const groupedItems = VERIFICATION_CHECKLIST.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Verification Checklist
          </CardTitle>
          <Badge variant={progress === 100 ? "default" : "secondary"}>
            {completedRequired.length}/{requiredItems.length} Required
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  checkedItems.has(item.id) ? 'bg-green-500/10 border-green-500/30' : 'bg-card'
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={checkedItems.has(item.id)}
                  onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor={item.id} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    {item.icon}
                    {item.label}
                    {item.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
