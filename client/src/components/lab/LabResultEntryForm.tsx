import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, User, Clock, Stethoscope, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LabResultEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: LabTestRequest | null;
  onSubmit?: (results: Record<string, TestResult>) => Promise<void> | void;
}

// Mock request structure - matches what OPD sends
export interface LabTestRequest {
  id: string;
  patientId: string;
  patientName: string;
  requestedBy: string;
  requestDate: string;
  priority: 'normal' | 'urgent';
  clinicalNotes?: string;
  status: 'pending' | 'in-progress' | 'completed';
  tests: {
    category: string;
    items: string[];
  }[];
}

interface TestResult {
  test: string;
  result: string;
  normalValue: string;
  status: 'normal' | 'abnormal' | 'critical' | '';
}

const normalValues: Record<string, string> = {
  'WBC': '4,500-11,000 /μL',
  'Hgb': 'M: 13.5-17.5, F: 12-16 g/dL',
  'Hct': 'M: 38-50%, F: 36-44%',
  'RBC': 'M: 4.5-5.5, F: 4.0-5.0 M/μL',
  'Platelet': '150,000-400,000 /μL',
  'ESR': 'M: 0-15, F: 0-20 mm/hr',
  'FBS/RBS': '70-100 mg/dL (fasting)',
  'Creatinine': '0.7-1.3 mg/dL',
  'BUN': '7-20 mg/dL',
  'SGOT': '8-33 U/L',
  'SGPT': '7-56 U/L',
  'Cholesterol': '<200 mg/dL',
  'Triglycerides': '<150 mg/dL',
  'HDL-C': '>40 mg/dL',
  'LDL-C': '<100 mg/dL',
  'PH': '4.5-8.0',
  'Protein': 'Negative',
  'Sugar': 'Negative',
  'Blood': 'Negative',
  'HCG Test': 'Negative/Positive',
  'VDRL': 'Non-reactive',
  'Widal H': '<1:80',
  'Widal O': '<1:80',
  'H. Pylori': 'Negative',
  'Blood Group': 'A/B/AB/O +/-',
};

const categoryColors: Record<string, string> = {
  Hematology: 'bg-destructive/10 text-destructive border-destructive/20',
  Urinalysis: 'bg-warning/10 text-warning border-warning/20',
  Chemistry: 'bg-info/10 text-info border-info/20',
  Serology: 'bg-success/10 text-success border-success/20',
};

export function LabResultEntryForm({ open, onOpenChange, request, onSubmit }: LabResultEntryFormProps) {
  const [results, setResults] = useState<Record<string, TestResult>>({});

  const handleResultChange = (category: string, test: string, field: keyof TestResult, value: string) => {
    const key = `${category}-${test}`;
    setResults(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        test,
        [field]: value,
        normalValue: prev[key]?.normalValue || normalValues[test] || '',
      },
    }));
  };

  const handleSubmit = async () => {
    const filledResults = Object.values(results).filter(r => r.result);
    if (filledResults.length === 0) {
      toast.error('Please enter at least one test result');
      return;
    }

    if (onSubmit) {
      await onSubmit(results);
    }
    toast.success('Results uploaded successfully', { description: `${filledResults.length} test results saved for ${request?.patientName}` });
    setResults({});
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Enter Lab Results
          </DialogTitle>
          <DialogDescription>
            Fill in test results and normal values for each requested test
          </DialogDescription>
        </DialogHeader>

        {/* Request Info Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Patient</p>
              <p className="font-medium text-sm">{request.patientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Requested By</p>
              <p className="font-medium text-sm">{request.requestedBy}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Request Date</p>
              <p className="font-medium text-sm">{formatDate(request.requestDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {request.priority === 'urgent' && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                URGENT
              </Badge>
            )}
            {request.priority === 'normal' && (
              <Badge variant="secondary">Normal Priority</Badge>
            )}
          </div>
        </div>

        {request.clinicalNotes && (
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
            <p className="text-xs text-muted-foreground mb-1">Clinical Notes:</p>
            <p className="text-sm">{request.clinicalNotes}</p>
          </div>
        )}

        {/* Results Entry */}
        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="space-y-4">
            {request.tests.map(category => (
              <div key={category.category} className="rounded-xl border border-border overflow-hidden">
                <div className={cn(
                  'px-4 py-2 font-semibold border-b',
                  categoryColors[category.category]?.split(' ')[0] || 'bg-muted'
                )}>
                  <span className="text-foreground">{category.category}</span>
                  <Badge variant="outline" className="ml-2">
                    {category.items.length} tests
                  </Badge>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-3">Test</div>
                    <div className="col-span-4">Result</div>
                    <div className="col-span-3">Normal Value</div>
                    <div className="col-span-2">Status</div>
                  </div>
                  
                  <div className="space-y-2">
                    {category.items.map(test => {
                      const key = `${category.category}-${test}`;
                      const result = results[key] || { test, result: '', normalValue: normalValues[test] || '', status: '' };
                      
                      return (
                        <div key={test} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-3">
                            <Label className="text-sm font-medium">{test}</Label>
                          </div>
                          <div className="col-span-4">
                            <Input
                              placeholder="Enter result..."
                              value={result.result}
                              onChange={(e) => handleResultChange(category.category, test, 'result', e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              placeholder="Normal range"
                              value={result.normalValue}
                              onChange={(e) => handleResultChange(category.category, test, 'normalValue', e.target.value)}
                              className="h-9 text-muted-foreground"
                            />
                          </div>
                          <div className="col-span-2">
                            <Select
                              value={result.status}
                              onValueChange={(v) => handleResultChange(category.category, test, 'status', v)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="—" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="abnormal">Abnormal</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Upload className="h-4 w-4" />
            Submit Results
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
