import { useMemo, useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPatients } from '@/services/patients';
import { listConsultations, createConsultation } from '@/services/consultations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { HeartPulse, Thermometer, Activity, Stethoscope, Search, TestTube, FileText, CheckCircle } from 'lucide-react';
import { updateAppointmentStatus } from '@/services/appointments';

interface LocalConsultationPreview {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  vitals: {
    temperature?: string;
    pulse?: string;
    bloodPressure?: string;
    respiratoryRate?: string;
    spo2?: string;
    weight?: string;
  };
  examination?: string;
  diagnosis?: string;
  plan?: string;
  medicationsText?: string;
  labsText?: string;
}

const defaultVitals = { temperature: '', pulse: '', bloodPressure: '', respiratoryRate: '', spo2: '', weight: '' };

export default function Consultations() {
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [vitals, setVitals] = useState(defaultVitals);
  const [examination, setExamination] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  const [labsText, setLabsText] = useState<string>('');
  const [medicationsText, setMedicationsText] = useState<string>('');
  const [recent, setRecent] = useState<LocalConsultationPreview[]>([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');

  const qc = useQueryClient();
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', { q: search }],
    queryFn: () => listPatients({ q: search, limit: 50 }),
  });

  const completeApptMutation = useMutation({
    mutationFn: (id: string) => updateAppointmentStatus(id, 'completed' as any),
    onSuccess: () => {
      toast.success('Appointment marked as completed. Reception notified.');
      setAppointmentId('');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to complete appointment'),
  });
  const filtered = useMemo(() => patients, [patients]);
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const { data: consults = [] } = useQuery({
    queryKey: ['consultations', { patientId: selectedPatientId || undefined }],
    queryFn: () => selectedPatientId ? listConsultations({ patientId: selectedPatientId }) : listConsultations({}),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => createConsultation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('Consultation saved');
      setOpenPreview(true);
      if (appointmentId) {
        completeApptMutation.mutate(appointmentId);
        qc.invalidateQueries({ queryKey: ['appointments'] });
      }
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to save consultation'),
  });

  const saveConsultation = () => {
    if (!selectedPatient) {
      toast.error('Select a patient to continue');
      return;
    }
    const item: LocalConsultationPreview = {
      id: `C${String(Date.now()).slice(-6)}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date: new Date().toISOString(),
      vitals,
      examination: examination.trim(),
      diagnosis: diagnosis.trim(),
      plan: plan.trim(),
      medicationsText: medicationsText.trim(),
      labsText: labsText.trim(),
    };
    setRecent(prev => [item, ...prev].slice(0, 20));
    createMutation.mutate({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      vitals,
      examination: examination.trim(),
      diagnosis: diagnosis.trim(),
      plan: plan.trim(),
      medicationsText: medicationsText.trim(),
      labsText: labsText.trim(),
    });
  };

  const clearForm = () => {
    setVitals(defaultVitals);
    setExamination('');
    setDiagnosis('');
    setPlan('');
    setLabsText('');
    setMedicationsText('');
  };

  // Preselect from URL params: ?patientId=...&appointmentId=...
  // This improves flow from Appointments and Patient History pages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('patientId') || '';
    const apptId = params.get('appointmentId') || '';
    if (pid) setSelectedPatientId(pid);
    if (apptId) setAppointmentId(apptId);
  }, []);

  return (
    <DashboardLayout title="Consultations" subtitle="Record comprehensive patient history and plans">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Patient selector */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
              <div className="flex-1">
                <Label>Search Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-9" placeholder="Name, ID, phone" />
                </div>
              </div>
              <div className="flex-1">
                <Label>Select</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={selectedPatientId}
                  onChange={(e)=>setSelectedPatientId(e.target.value)}
                >
                  <option value="">Choose patient...</option>
                  {filtered.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>
              {selectedPatient && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedPatient.gender}</Badge>
                  <Badge variant="outline">DoB: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Simple one-page form */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <Label className="flex items-center gap-2"><Thermometer className="h-4 w-4"/>Temp (°C)</Label>
                <Input value={vitals.temperature} onChange={(e)=>setVitals(v=>({...v, temperature:e.target.value}))} />
              </div>
              <div>
                <Label className="flex items-center gap-2"><Activity className="h-4 w-4"/>Pulse (bpm)</Label>
                <Input value={vitals.pulse} onChange={(e)=>setVitals(v=>({...v, pulse:e.target.value}))} />
              </div>
              <div>
                <Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4"/>BP (mmHg)</Label>
                <Input value={vitals.bloodPressure} onChange={(e)=>setVitals(v=>({...v, bloodPressure:e.target.value}))} />
              </div>
              <div>
                <Label>RR (/min)</Label>
                <Input value={vitals.respiratoryRate} onChange={(e)=>setVitals(v=>({...v, respiratoryRate:e.target.value}))} />
              </div>
              <div>
                <Label>SpO2 (%)</Label>
                <Input value={vitals.spo2} onChange={(e)=>setVitals(v=>({...v, spo2:e.target.value}))} />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input value={vitals.weight} onChange={(e)=>setVitals(v=>({...v, weight:e.target.value}))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Examination</Label>
                <Textarea value={examination} onChange={(e)=>setExamination(e.target.value)} placeholder="General, HEENT, Chest, CVS, Abdomen, Neuro, MSK" rows={6} />
              </div>
              <div className="space-y-1">
                <Label>Diagnosis</Label>
                <Textarea value={diagnosis} onChange={(e)=>setDiagnosis(e.target.value)} placeholder="Primary diagnosis" rows={6} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="flex items-center gap-2"><FileText className="h-4 w-4"/>Medications (free-text)</Label>
                <Textarea value={medicationsText} onChange={(e)=>setMedicationsText(e.target.value)} placeholder="Example: Paracetamol 1g TID 3d" rows={4} />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-2"><TestTube className="h-4 w-4"/>Lab Orders</Label>
                <Textarea value={labsText} onChange={(e)=>setLabsText(e.target.value)} placeholder="Comma-separated lab tests" rows={4} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Plan</Label>
              <Textarea value={plan} onChange={(e)=>setPlan(e.target.value)} placeholder="Treatment, counseling, follow-up" rows={5} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 max-w-sm w-full">
                <Input placeholder="Appointment ID (optional)" value={appointmentId} onChange={(e)=>setAppointmentId(e.target.value)} />
                <Button variant="outline" disabled={!appointmentId || completeApptMutation.isPending} onClick={()=>completeApptMutation.mutate(appointmentId)}>
                  <CheckCircle className="h-4 w-4 mr-2" />Complete
                </Button>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <Button variant="outline" onClick={clearForm}>Clear</Button>
                <Button onClick={saveConsultation} disabled={!selectedPatientId || createMutation.isPending}>
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Save Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: recent consultations */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Recent Consultations</h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {consults.length === 0 && recent.length === 0 && (
                <p className="text-sm text-muted-foreground">No consultations yet. Fill the form and click Save.</p>
              )}
              {consults.map(item => (
                <div key={item._id} className="rounded-lg border p-3 hover:bg-accent/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{item.patientName}</div>
                    <Badge variant="secondary">{new Date(item.createdAt).toLocaleDateString()}</Badge>
                  </div>
                  {item.diagnosis && <div className="text-sm mt-1"><span className="text-muted-foreground">Dx:</span> {item.diagnosis}</div>}
                </div>
              ))}
              {recent.map(item => (
                <div key={item.id} className="rounded-lg border p-3 hover:bg-accent/50 transition cursor-pointer" onClick={()=>setOpenPreview(true)}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{item.patientName}</div>
                    <Badge variant="secondary">{new Date(item.date).toLocaleDateString()}</Badge>
                  </div>
                  {item.diagnosis && <div className="text-sm mt-1"><span className="text-muted-foreground">Dx:</span> {item.diagnosis}</div>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Preview dialog */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Consultation Saved</DialogTitle>
            <DialogDescription>Summary of the encounter</DialogDescription>
          </DialogHeader>
          {recent[0] && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {recent[0].patientName}</div>
                <div><span className="text-muted-foreground">Date:</span> {new Date(recent[0].date).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Diagnosis</Label>
                  <div className="text-sm">{recent[0].diagnosis || '-'}</div>
                </div>
                <div className="space-y-1">
                  <Label>Vitals</Label>
                  <div className="text-sm grid grid-cols-2 gap-1">
                    {Object.entries(recent[0].vitals).map(([k,v]) => v ? (<div key={k}><span className="text-muted-foreground capitalize">{k}:</span> {v}</div>) : null)}
                  </div>
                </div>
              </div>
              {recent[0].plan && (
                <div className="space-y-1">
                  <Label>Plan</Label>
                  <div className="text-sm">{recent[0].plan}</div>
                </div>
              )}
              {(recent[0].labsText || recent[0].medicationsText) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Lab Orders</Label>
                    <div className="text-sm">{recent[0].labsText}</div>
                  </div>
                  <div className="space-y-1">
                    <Label>Medications</Label>
                    <div className="text-sm">{recent[0].medicationsText}</div>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={()=>setOpenPreview(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
