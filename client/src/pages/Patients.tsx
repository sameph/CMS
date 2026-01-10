import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Patient } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPatients as apiListPatients, createPatient as apiCreatePatient, updatePatient as apiUpdatePatient } from '@/services/patients';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, User, Phone, Mail, Calendar, Droplets, AlertCircle, Eye, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    bloodType: '',
    allergies: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    bloodType: '',
    allergies: '',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => apiUpdatePatient(id, body),
    onSuccess: () => {
      toast.success('Patient updated');
      setIsEditOpen(false);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to update patient'),
  });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', { q: searchTerm }],
    queryFn: () => apiListPatients({ q: searchTerm, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: apiCreatePatient,
    onSuccess: () => {
      toast.success('Patient registered');
      setIsNewPatientOpen(false);
      setForm({ name: '', dateOfBirth: '', gender: '', phone: '', email: '', address: '', bloodType: '', allergies: '' });
      qc.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to register patient'),
  });

  const filteredPatients = patients;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout title="Patients" subtitle="Manage patient records and registration">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
                <DialogDescription>Enter patient details to create a new record</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={form.dateOfBirth} onChange={(e)=>setForm(f=>({...f,dateOfBirth:e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.gender} onChange={(e)=>setForm(f=>({...f,gender:e.target.value}))}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 234-567-8900" value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" type="email" placeholder="patient@email.com" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <select id="bloodType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.bloodType} onChange={(e)=>setForm(f=>({...f,bloodType:e.target.value}))}>
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Enter full address" value={form.address} onChange={(e)=>setForm(f=>({...f,address:e.target.value}))} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="allergies">Allergies (comma separated)</Label>
                  <Input id="allergies" placeholder="e.g., Penicillin, Aspirin" value={form.allergies} onChange={(e)=>setForm(f=>({...f,allergies:e.target.value}))} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsNewPatientOpen(false)}>Cancel</Button>
                <Button onClick={() => createMutation.mutate({
                  name: form.name,
                  dateOfBirth: form.dateOfBirth,
                  gender: form.gender as any,
                  phone: form.phone,
                  email: form.email || undefined,
                  address: form.address,
                  bloodType: form.bloodType || undefined,
                  allergies: form.allergies ? form.allergies.split(',').map(s=>s.trim()).filter(Boolean) : []
                })} disabled={createMutation.isPending}>Register Patient</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Patients Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-accent/50">
                  <TableCell className="font-mono text-sm text-primary">{patient.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        {patient.allergies && patient.allergies.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            <span>Allergies</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>{calculateAge(patient.dateOfBirth)} yrs</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="capitalize">{patient.gender}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.bloodType ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        <Droplets className="h-3 w-3 mr-1" />
                        {patient.bloodType}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.lastVisit ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(patient.lastVisit)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditing(patient);
                        setEditForm({
                          name: patient.name,
                          dateOfBirth: patient.dateOfBirth.slice(0,10),
                          gender: patient.gender,
                          phone: patient.phone,
                          email: patient.email || '',
                          address: patient.address,
                          bloodType: patient.bloodType || '',
                          allergies: (patient.allergies || []).join(', '),
                        });
                        setIsEditOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!isLoading && filteredPatients.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mb-3 opacity-50" />
              <p>No patients found</p>
            </div>
          )}
        </div>

        {/* Patient Details Dialog */}
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-2xl">
            {selectedPatient && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <span>{selectedPatient.name}</span>
                      <p className="text-sm font-normal text-muted-foreground">{selectedPatient.id}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{formatDate(selectedPatient.dateOfBirth)} ({calculateAge(selectedPatient.dateOfBirth)} years)</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Type</p>
                      <p className="font-medium">{selectedPatient.bloodType || 'Not recorded'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedPatient.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedPatient.address}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">Allergies</p>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No known allergies</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedPatient(null)}>Close</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Patient Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>Update patient information</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="e_name">Full Name</Label>
                <Input id="e_name" value={editForm.name} onChange={(e)=>setEditForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_dob">Date of Birth</Label>
                <Input id="e_dob" type="date" value={editForm.dateOfBirth} onChange={(e)=>setEditForm(f=>({...f,dateOfBirth:e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_gender">Gender</Label>
                <select id="e_gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.gender} onChange={(e)=>setEditForm(f=>({...f,gender:e.target.value}))}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_phone">Phone</Label>
                <Input id="e_phone" value={editForm.phone} onChange={(e)=>setEditForm(f=>({...f,phone:e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_email">Email</Label>
                <Input id="e_email" type="email" value={editForm.email} onChange={(e)=>setEditForm(f=>({...f,email:e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_blood">Blood Type</Label>
                <select id="e_blood" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.bloodType} onChange={(e)=>setEditForm(f=>({...f,bloodType:e.target.value}))}>
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="e_address">Address</Label>
                <Input id="e_address" value={editForm.address} onChange={(e)=>setEditForm(f=>({...f,address:e.target.value}))} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="e_allergies">Allergies (comma separated)</Label>
                <Input id="e_allergies" value={editForm.allergies} onChange={(e)=>setEditForm(f=>({...f,allergies:e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!editing) return;
                updateMutation.mutate({
                  id: editing.id,
                  body: {
                    name: editForm.name,
                    dateOfBirth: editForm.dateOfBirth,
                    gender: editForm.gender as any,
                    phone: editForm.phone,
                    email: editForm.email || undefined,
                    address: editForm.address,
                    bloodType: editForm.bloodType || undefined,
                    allergies: editForm.allergies ? editForm.allergies.split(',').map(s=>s.trim()).filter(Boolean) : [],
                  }
                });
              }} disabled={updateMutation.isPending}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
