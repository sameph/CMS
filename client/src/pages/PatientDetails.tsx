import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getPatient } from '@/services/patients';
import { listConsultations } from '@/services/consultations';
import { listPrescriptions } from '@/services/prescriptions';
import { listOpdRequests } from '@/services/labRequests';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Calendar, Stethoscope, Pill, TestTube2, User } from 'lucide-react';

export default function PatientDetails() {
  const { id = '' } = useParams();

  const { data: patient } = useQuery({ queryKey: ['patient', id], queryFn: () => getPatient(id), enabled: !!id });
  const { data: consults = [] } = useQuery({ queryKey: ['consultations', { patientId: id }], queryFn: () => listConsultations({ patientId: id }), enabled: !!id });
  const { data: prescriptions = [] } = useQuery({ queryKey: ['prescriptions', { patientId: id }], queryFn: () => listPrescriptions({ patientId: id }), enabled: !!id });
  const { data: labRequests = [] } = useQuery({ queryKey: ['opd-lab-requests', { patientId: id }], queryFn: () => listOpdRequests({ patientId: id }), enabled: !!id });

  const stats = useMemo(() => ({
    consults: consults.length,
    prescriptions: prescriptions.length,
    labs: labRequests.length,
  }), [consults, prescriptions, labRequests]);

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '-';

  return (
    <DashboardLayout title={patient ? patient.name : 'Patient'} subtitle="Consultation and treatment history">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <User className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <div className="text-xl font-semibold">{patient?.name}</div>
              <div className="text-sm text-muted-foreground">ID: {patient?.id} • DoB: {fmtDate(patient?.dateOfBirth)}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">Consultations: {stats.consults}</Badge>
            <Badge variant="secondary">Prescriptions: {stats.prescriptions}</Badge>
            <Badge variant="secondary">Lab Requests: {stats.labs}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 lg:col-span-1">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Stethoscope className="h-4 w-4"/>Consultations</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Diagnosis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consults.map((c: any) => (
                    <TableRow key={c._id}>
                      <TableCell className="text-sm flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />{fmtDate(c.createdAt)}</TableCell>
                      <TableCell className="text-sm">{c.diagnosis || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {consults.length === 0 && (
                <div className="text-sm text-muted-foreground p-4">No consultations found.</div>
              )}
            </div>
          </Card>

          <Card className="p-4 lg:col-span-1">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Pill className="h-4 w-4"/>Prescriptions</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((rx: any) => (
                    <TableRow key={rx._id || rx.id}>
                      <TableCell className="font-mono text-sm text-primary">{rx._id || rx.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{rx.status?.replace('-', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(rx.date || rx.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {prescriptions.length === 0 && (
                <div className="text-sm text-muted-foreground p-4">No prescriptions found.</div>
              )}
            </div>
          </Card>

          <Card className="p-4 lg:col-span-1">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><TestTube2 className="h-4 w-4"/>Lab Requests</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labRequests.map((lr: any) => (
                    <TableRow key={lr._id || lr.id}>
                      <TableCell className="font-mono text-sm text-primary">{lr._id || lr.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{(lr.status || '').replace('_','-')}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(lr.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {labRequests.length === 0 && (
                <div className="text-sm text-muted-foreground p-4">No lab requests found.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Link to={`/consultations?patientId=${encodeURIComponent(id)}`} className="text-sm underline">Open Consultations</Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
