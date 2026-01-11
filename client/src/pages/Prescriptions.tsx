import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPrescriptions, createPrescription, updatePrescriptionStatus } from '@/services/prescriptions';
import { listPatients } from '@/services/patients';
import { listInventory } from '@/services/inventory';

export default function Prescriptions() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['prescriptions', { q: searchTerm }],
    queryFn: () => listPrescriptions({ q: searchTerm }),
  });
  const [createOpen, setCreateOpen] = useState(false);

  const getStatusColor = (status: Prescription['status']) => {
    const colors = {
      'pending': 'bg-warning/10 text-warning border-warning/20',
      'dispensed': 'bg-success/10 text-success border-success/20',
      'partially-dispensed': 'bg-info/10 text-info border-info/20',
    };
    return colors[status];
  };

  const filteredPrescriptions = items.filter(rx =>
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

  const markDispensed = useMutation({
    mutationFn: (id: string) => updatePrescriptionStatus(id, 'dispensed'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prescriptions'] }); toast.success('Marked as dispensed'); setSelectedPrescription(null); },
    onError: (e: any) => toast.error(e?.message || 'Failed to update'),
  });
  const handleDispense = (prescription: any) => { markDispensed.mutate(prescription._id || prescription.id); };

  // Create Prescription state
  const [patientName, setPatientName] = useState('');
  const [sex, setSex] = useState<'male'|'female'|'other'|''>('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [inpatient, setInpatient] = useState<'inpatient'|'outpatient'|''>('');
  const [diagnosis, setDiagnosis] = useState('');
  const [meds, setMeds] = useState<Array<{ name: string; strength: string; dosageForm: string; frequency: string; duration: string; quantity: string; instructions: string }>>([
    { name: '', strength: '', dosageForm: '', frequency: '', duration: '', quantity: '', instructions: '' },
  ]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', { q: patientSearch }],
    queryFn: () => listPatients({ q: patientSearch, limit: 50 }),
  });
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const { data: storeItems = [] } = useQuery({
    queryKey: ['inventory', { location: 'central' }],
    queryFn: () => listInventory({ location: 'central' }),
  });
  const [storeSearch, setStoreSearch] = useState('');
  const filteredStore = useMemo(() => {
    const q = storeSearch.toLowerCase();
    return storeItems.filter((it: any) => it.name.toLowerCase().includes(q));
  }, [storeItems, storeSearch]);

  const addMedRow = () => {};
  const removeMedRow = (idx: number) => setMeds((m) => m.filter((_, i) => i !== idx));
  const updateMed = (idx: number, key: keyof typeof meds[number], value: string) => {
    setMeds((m) => m.map((row, i) => i === idx ? { ...row, [key]: value } : row));
  };

  const createRx = useMutation({
    mutationFn: (body: any) => createPrescription(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prescriptions'] }); toast.success('Prescription created'); setCreateOpen(false); resetCreate(); },
    onError: (e: any) => toast.error(e?.message || 'Failed to create prescription'),
  });

  const resetCreate = () => {
    setPatientName(''); setSex(''); setAge(''); setWeight(''); setInpatient(''); setDiagnosis(''); setMeds([{ name: '', strength: '', dosageForm: '', frequency: '', duration: '', quantity: '', instructions: '' }]);
  };

  const handleCreate = () => {
    if (!selectedPatient) {
      toast.error('Select a patient');
      return;
    }
    if (!sex || !age || !inpatient) {
      toast.error('Please fill required patient fields');
      return;
    }
    const validMeds = meds.filter(m => m.name && m.frequency && m.duration && m.quantity);
    if (validMeds.length === 0) {
      toast.error('Add at least one medication');
      return;
    }
    const payload = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: 'OPD',
      doctorName: 'OPD Doctor',
      medications: validMeds.map((m, idx) => ({
        id: `M${idx + 1}`,
        name: `${m.name}${m.strength ? ' ' + m.strength : ''}${m.dosageForm ? ' ' + m.dosageForm : ''}`,
        dosage: m.strength || '-',
        frequency: m.frequency,
        duration: m.duration,
        quantity: Number(m.quantity) || 0,
        instructions: m.instructions,
      })),
      notes: diagnosis,
    };
    createRx.mutate(payload);
  };

  // Preselect patient / open create from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('patientId');
    const open = params.get('create');
    if (pid) setSelectedPatientId(pid);
    if (open === '1') setCreateOpen(true);
  }, []);

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
        {/* Search + Actions */}
        <div className="flex gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient or prescription ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {user?.role === 'opd' && (
            <Button onClick={() => setCreateOpen(true)}>Create Prescription</Button>
          )}
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
                  {selectedPrescription.status !== 'dispensed' && (user?.role === 'injection' || user?.role === 'opd') && (
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

        {/* Create Prescription Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Prescription</DialogTitle>
              <DialogDescription>Enter patient details and medications to send to Injection Room</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-2">
              {/* Patient Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1 col-span-2">
                  <Label>Search Patient</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={patientSearch} onChange={(e)=>setPatientSearch(e.target.value)} className="pl-9" placeholder="Name, ID, phone" />
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Select Patient</Label>
                  <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={selectedPatientId} onChange={(e)=>setSelectedPatientId(e.target.value)}>
                    <option value="">Choose patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Sex</Label>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <Button variant={sex==='male'? 'default':'outline'} onClick={()=>setSex('male')}>Male</Button>
                    <Button variant={sex==='female'? 'default':'outline'} onClick={()=>setSex('female')}>Female</Button>
                    <Button variant={sex==='other'? 'default':'outline'} onClick={()=>setSex('other')}>Other</Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Age</Label>
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years" />
                </div>
                <div className="space-y-1">
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="kg" />
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <Label>Patient Type</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Button variant={inpatient==='outpatient'? 'default':'outline'} onClick={()=>setInpatient('outpatient')}>Outpatient</Button>
                    <Button variant={inpatient==='inpatient'? 'default':'outline'} onClick={()=>setInpatient('inpatient')}>Inpatient</Button>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-3 space-y-1">
                  <Label>Diagnosis (if not ICD)</Label>
                  <Textarea value={diagnosis} onChange={(e)=>setDiagnosis(e.target.value)} placeholder="Free-text diagnosis" />
                </div>
              </div>

              {/* Medications Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-medium">Medications</h4>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Search store..." value={storeSearch} onChange={(e)=>setStoreSearch(e.target.value)} className="h-9 max-w-[240px]" />
                    <select className="h-9 rounded-md border bg-background px-2 text-sm min-w-[260px]" onChange={(e)=>{
                      const id = e.target.value; if(!id) return; const it = filteredStore.find((x:any)=> (x._id||x.id)===id); if(!it) return;
                      setMeds((m)=>[...m, { name: it.name, strength: '', dosageForm: it.unit||'', frequency: '', duration: '', quantity: '', instructions: '' }]);
                      e.currentTarget.selectedIndex = 0;
                    }}>
                      <option value="">Add from Drug Store...</option>
                      {filteredStore.map((it:any)=> (
                        <option key={it._id||it.id} value={it._id||it.id}>{it.name} — {it.quantity} {it.unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="rounded-lg border border-border overflow-auto">
                  <div className="grid grid-cols-12 gap-2 p-3 text-xs text-muted-foreground font-medium bg-muted/50">
                    <div className="col-span-2">Drug name</div>
                    <div className="col-span-1">Strength</div>
                    <div className="col-span-2">Dosage form</div>
                    <div className="col-span-2">Frequency</div>
                    <div className="col-span-1">Duration</div>
                    <div className="col-span-1">Quantity</div>
                    <div className="col-span-3">How to use / other info</div>
                    <div className="col-span-0" />
                  </div>
                  <div className="p-3 space-y-2">
                    {meds.map((m, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-2"><Input value={m.name} disabled readOnly placeholder="Drug name" /></div>
                        <div className="col-span-1"><Input value={m.strength} disabled readOnly placeholder="—" /></div>
                        <div className="col-span-2"><Input value={m.dosageForm} disabled readOnly placeholder="—" /></div>
                        <div className="col-span-2"><Input value={m.frequency} onChange={(e)=>updateMed(idx,'frequency',e.target.value)} placeholder="3x/day" /></div>
                        <div className="col-span-1"><Input value={m.duration} onChange={(e)=>updateMed(idx,'duration',e.target.value)} placeholder="5d" /></div>
                        <div className="col-span-1"><Input type="number" value={m.quantity} onChange={(e)=>updateMed(idx,'quantity',e.target.value)} placeholder="10" /></div>
                        <div className="col-span-3"><Input value={m.instructions} onChange={(e)=>updateMed(idx,'instructions',e.target.value)} placeholder="After meals, etc." /></div>
                        <div className="col-span-12 md:col-span-1 flex justify-end">
                          <Button size="sm" variant="ghost" onClick={()=>removeMedRow(idx)}>Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create Prescription</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
