import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { mockPatients } from '@/data/mockData';
import { Send, TestTube, User, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LabTestRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  // Optional dynamic inputs
  patients?: { id: string; name: string }[];
  categories?: TestCategory[];
  // Called with selected tests grouped by category labels
  onSubmit?: (data: {
    patientId: string;
    priority: 'normal' | 'urgent';
    clinicalNotes: string;
    selected: Record<string, string[]>;
  }) => Promise<void> | void;
}

interface TestCategory {
  name: string;
  tests: string[];
}

const defaultTestCategories: TestCategory[] = [
  {
    name: 'Hematology',
    tests: [
      'WBC',
      'Diff N',
      'Hgb',
      'Hct',
      'ESR',
      'RBC',
      'Platelet',
      'Blood Group',
      'Blood Film',
      'Stool Test',
      'Consistency',
      'O/P',
      'Occult Blood',
    ],
  },
  {
    name: 'Urinalysis',
    tests: [
      'Colour',
      'Appearance',
      'PH',
      'SG',
      'Protein',
      'Sugar',
      'Ketone',
      'Bilirubin',
      'Nitrate',
      'Urobilinogen',
      'Leukocyte',
      'Blood',
      'Microscopy',
      'Epit Cells',
      'WBC',
      'RBC',
      'Casts',
      'HCG Test',
      'Others',
    ],
  },
  {
    name: 'Chemistry',
    tests: [
      'Colour',
      'FBS/RBS',
      'SGOT',
      'SGPT',
      'ALK Phos',
      'Bilirubin (T)',
      'Bilirubin (D)',
      'BUN',
      'Urea',
      'Creatinine',
      'Uric Acid',
      'T. Protein',
      'Triglycerides',
      'Cholesterol',
      'HDL-C',
      'LDL-C',
      'Sodium',
      'Potassium',
      'VCT',
    ],
  },
  {
    name: 'Serology',
    tests: [
      'VDRL',
      'Widal H',
      'Widal O',
      'Well Felix',
      'H. Pylori',
      'ASO Titer',
      'R/F',
      'HVC',
      'Bacteriology',
      'Sample',
      'KOH',
      'Gram Staining',
      'Wet AFB',
      'AFB',
      'RF',
      'Others',
    ],
  },
];

const categoryColors: Record<string, string> = {
  Hematology: 'bg-destructive/10 text-destructive border-destructive/20',
  Urinalysis: 'bg-warning/10 text-warning border-warning/20',
  Chemistry: 'bg-info/10 text-info border-info/20',
  Serology: 'bg-success/10 text-success border-success/20',
};

export function LabTestRequestForm({ open, onOpenChange, patientId, patients, categories, onSubmit }: LabTestRequestFormProps) {
  const [selectedPatient, setSelectedPatient] = useState(patientId || '');
  const [selectedTests, setSelectedTests] = useState<Record<string, string[]>>({
    Hematology: [],
    Urinalysis: [],
    Chemistry: [],
    Serology: [],
  });
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  const categoriesToUse = categories || defaultTestCategories;
  const patientOptions = patients || mockPatients.map(p => ({ id: p.id, name: p.name }));

  const handleTestToggle = (category: string, test: string) => {
    setSelectedTests(prev => {
      const categoryTests = prev[category] || [];
      if (categoryTests.includes(test)) {
        return {
          ...prev,
          [category]: categoryTests.filter(t => t !== test),
        };
      } else {
        return {
          ...prev,
          [category]: [...categoryTests, test],
        };
      }
    });
  };

  const handleSelectAll = (category: string) => {
    const categoryData = categoriesToUse.find(c => c.name === category);
    if (!categoryData) return;

    setSelectedTests(prev => {
      const allSelected = categoryData.tests.every(t => prev[category]?.includes(t));
      return {
        ...prev,
        [category]: allSelected ? [] : [...categoryData.tests],
      };
    });
  };

  const getTotalSelectedTests = () => {
    return Object.values(selectedTests).reduce((sum, tests) => sum + tests.length, 0);
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    if (getTotalSelectedTests() === 0) {
      toast.error('Please select at least one test');
      return;
    }

    if (onSubmit) {
      await onSubmit({
        patientId: selectedPatient,
        priority,
        clinicalNotes,
        selected: selectedTests,
      });
      // Reset after successful submit
      setSelectedTests({ Hematology: [], Urinalysis: [], Chemistry: [], Serology: [] });
      setClinicalNotes('');
      setPriority('normal');
      onOpenChange(false);
      return;
    }

    // Fallback demo toast if no onSubmit provided
    const patient = mockPatients.find(p => p.id === selectedPatient);
    toast.success(`Lab request sent for ${patient?.name}`, { description: `${getTotalSelectedTests()} tests requested` });
    setSelectedTests({ Hematology: [], Urinalysis: [], Chemistry: [], Serology: [] });
    setClinicalNotes('');
    setPriority('normal');
    onOpenChange(false);
  };

  const handleClearCategory = (category: string) => {
    setSelectedTests(prev => ({
      ...prev,
      [category]: [],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-primary" />
            Laboratory Test Request Form
          </DialogTitle>
          <DialogDescription>
            Select tests to request from the laboratory. Check the boxes for required tests.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Patient Selection & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patientOptions.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {patient.name} ({patient.id})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v: 'normal' | 'urgent') => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Selected Tests</Label>
              <div className="flex h-10 items-center rounded-lg border border-border bg-muted/50 px-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {getTotalSelectedTests()} tests selected
                </Badge>
              </div>
            </div>
          </div>

          {/* Test Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoriesToUse.map(category => {
              const selectedCount = selectedTests[category.name]?.length || 0;
              const allSelected = category.tests.every(t => selectedTests[category.name]?.includes(t));

              return (
                <div
                  key={category.name}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Category Header */}
                  <div className={cn(
                    'flex items-center justify-between p-3 border-b',
                    categoryColors[category.name]?.replace('text-', 'bg-').split(' ')[0]
                  )}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => handleSelectAll(category.name)}
                        className="border-current"
                      />
                      <span className="font-semibold text-foreground">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={cn('text-xs', categoryColors[category.name])}>
                        {selectedCount}/{category.tests.length}
                      </Badge>
                      {selectedCount > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleClearCategory(category.name)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tests List */}
                  <div className="p-2 max-h-64 overflow-y-auto">
                    <div className="space-y-1">
                      {category.tests.map(test => {
                        const isSelected = selectedTests[category.name]?.includes(test);
                        return (
                          <label
                            key={test}
                            className={cn(
                              'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                              isSelected
                                ? 'bg-primary/10 text-foreground'
                                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleTestToggle(category.name, test)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{test}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result & Normal Value Columns Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Result</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Results will be filled by the laboratory after testing is complete.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Normal Value</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Reference ranges (positive/negative) will be provided with results.
              </p>
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes / Reason for Test</Label>
            <Textarea
              id="notes"
              placeholder="Enter clinical notes, symptoms, or reason for requesting these tests..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Selected Tests Summary */}
          {getTotalSelectedTests() > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h4 className="font-medium mb-3 text-foreground">Selected Tests Summary</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedTests).map(([category, tests]) =>
                  tests.map(test => (
                    <Badge
                      key={`${category}-${test}`}
                      variant="outline"
                      className={cn('gap-1', categoryColors[category])}
                    >
                      <span className="text-xs opacity-70">{category}:</span>
                      {test}
                      <button
                        onClick={() => handleTestToggle(category, test)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {priority === 'urgent' && (
              <Badge variant="destructive" className="animate-pulse">
                URGENT REQUEST
              </Badge>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Send className="h-4 w-4" />
              Send to Laboratory
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
