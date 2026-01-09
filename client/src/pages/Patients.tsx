import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockPatients } from '@/data/mockData';
import { Patient } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

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
                  <Input id="name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 234-567-8900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" type="email" placeholder="patient@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <select id="bloodType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                  <Input id="address" placeholder="Enter full address" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="allergies">Allergies (comma separated)</Label>
                  <Input id="allergies" placeholder="e.g., Penicillin, Aspirin" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsNewPatientOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsNewPatientOpen(false)}>Register Patient</Button>
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
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPatients.length === 0 && (
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
                  <Button>Schedule Appointment</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
