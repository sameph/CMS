import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockPrescriptions } from '@/data/mockData';
import { Prescription } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Search, FileText, Clock, CheckCircle, Pill, User, Calendar, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Prescriptions() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const getStatusColor = (status: Prescription['status']) => {
    const colors = {
      'pending': 'bg-warning/10 text-warning border-warning/20',
      'dispensed': 'bg-success/10 text-success border-success/20',
      'partially-dispensed': 'bg-info/10 text-info border-info/20',
    };
    return colors[status];
  };

  const filteredPrescriptions = mockPrescriptions.filter(rx =>
    rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPrescriptions = filteredPrescriptions.filter(rx => rx.status === 'pending');
  const dispensedPrescriptions = filteredPrescriptions.filter(rx => rx.status === 'dispensed');
  const partialPrescriptions = filteredPrescriptions.filter(rx => rx.status === 'partially-dispensed');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDispense = (prescription: Prescription) => {
    toast.success(`Prescription ${prescription.id} marked as dispensed`);
    setSelectedPrescription(null);
  };

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => (
    <div 
      className="rounded-xl border border-border bg-card shadow-card p-4 hover:shadow-card-hover transition-all cursor-pointer hover-lift"
      onClick={() => setSelectedPrescription(prescription)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-mono text-sm text-primary">{prescription.id}</p>
            <p className="font-medium">{prescription.patientName}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn('capitalize', getStatusColor(prescription.status))}>
          {prescription.status.replace('-', ' ')}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Stethoscope className="h-4 w-4" />
          <span>{prescription.doctorName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(prescription.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Pill className="h-4 w-4" />
          <span>{prescription.medications.length} medication(s)</span>
        </div>
      </div>

      {prescription.notes && (
        <p className="mt-3 text-sm text-muted-foreground italic border-t border-border pt-2">
          {prescription.notes}
        </p>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Prescriptions" subtitle="Manage and dispense patient prescriptions">
      <div className="space-y-6">
        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient or prescription ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingPrescriptions.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
          <div className="rounded-xl border border-info/20 bg-info/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Pill className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{partialPrescriptions.length}</p>
              <p className="text-sm text-muted-foreground">Partially Dispensed</p>
            </div>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{dispensedPrescriptions.length}</p>
              <p className="text-sm text-muted-foreground">Dispensed</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingPrescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="partial" className="gap-2">
              <Pill className="h-4 w-4" />
              Partial ({partialPrescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="dispensed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Dispensed ({dispensedPrescriptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
            {pendingPrescriptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border border-border bg-card">
                <Clock className="h-12 w-12 mb-3 opacity-50" />
                <p>No pending prescriptions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="partial">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partialPrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
            {partialPrescriptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border border-border bg-card">
                <Pill className="h-12 w-12 mb-3 opacity-50" />
                <p>No partially dispensed prescriptions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dispensed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dispensedPrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
            {dispensedPrescriptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground rounded-xl border border-border bg-card">
                <CheckCircle className="h-12 w-12 mb-3 opacity-50" />
                <p>No dispensed prescriptions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Prescription Detail Dialog */}
        <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
          <DialogContent className="max-w-2xl">
            {selectedPrescription && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span>Prescription {selectedPrescription.id}</span>
                      <p className="text-sm font-normal text-muted-foreground">
                        Issued on {formatDate(selectedPrescription.date)}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Patient & Doctor Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Patient</span>
                      </div>
                      <p className="font-medium">{selectedPrescription.patientName}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Prescribing Doctor</span>
                      </div>
                      <p className="font-medium">{selectedPrescription.doctorName}</p>
                    </div>
                  </div>

                  {/* Medications */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Medications
                    </h4>
                    <div className="space-y-3">
                      {selectedPrescription.medications.map((med, index) => (
                        <div 
                          key={med.id} 
                          className="rounded-lg border border-border p-4 bg-card"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{med.name}</p>
                              <p className="text-sm text-muted-foreground">{med.dosage}</p>
                            </div>
                            <Badge variant="secondary">Qty: {med.quantity}</Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Frequency: </span>
                              <span>{med.frequency}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration: </span>
                              <span>{med.duration}</span>
                            </div>
                          </div>
                          {med.instructions && (
                            <p className="mt-2 text-sm text-muted-foreground italic">
                              Note: {med.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPrescription.notes && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground mb-1">Additional Notes</p>
                      <p className="text-sm">{selectedPrescription.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedPrescription(null)}>
                    Close
                  </Button>
                  {selectedPrescription.status !== 'dispensed' && user?.role === 'injection' && (
                    <Button onClick={() => handleDispense(selectedPrescription)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Dispensed
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
