import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Appointment } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Clock, User, CalendarDays, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAppointments as apiListAppointments, createAppointment as apiCreateAppointment, checkInAppointment } from '@/services/appointments';
import { getPatients as getPatientOptions } from '@/services/labRequests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const qc = useQueryClient();
  const { user } = useAuth();

  const [form, setForm] = useState({
    patientId: '',
    patientName: '',
    type: '' as Appointment['type'] | '',
    date: '',
    time: '',
    notes: '',
  });

  const { data: patientOptions = [] } = useQuery({
    queryKey: ['patient-options'],
    queryFn: getPatientOptions,
  });

  const { data: appts = [], isLoading } = useQuery({
    queryKey: ['appointments', { date: 'today' }],
    queryFn: () => apiListAppointments({ date: 'today' }),
  });

  const createMutation = useMutation({
    mutationFn: apiCreateAppointment,
    onSuccess: () => {
      toast.success('Appointment scheduled');
      setIsNewAppointmentOpen(false);
      setForm({ patientId: '', patientName: '', type: '', date: '', time: '', notes: '' });
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to schedule appointment'),
  });

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      'scheduled': 'bg-secondary text-secondary-foreground',
      'waiting': 'bg-warning/10 text-warning border-warning/20',
      'in-progress': 'bg-primary/10 text-primary border-primary/20',
      'completed': 'bg-success/10 text-success border-success/20',
      'cancelled': 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors[status];
  };

  const getTypeColor = (type: Appointment['type']) => {
    const colors = {
      'consultation': 'bg-info/10 text-info border-info/20',
      'follow-up': 'bg-primary/10 text-primary border-primary/20',
      'emergency': 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors[type];
  };

  const filteredAppointments = appts.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  return (
    <DashboardLayout title="Appointments" subtitle="Schedule and manage patient appointments">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card shadow-card p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
            />
            
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="font-medium mb-3">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Today</span>
                  <span className="font-medium">{appts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-success">
                    {appts.filter(a => a.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Waiting</span>
                  <span className="font-medium text-warning">
                    {appts.filter(a => a.status === 'waiting').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span className="font-medium text-destructive">
                    {appts.filter(a => a.status === 'cancelled').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Appointment</DialogTitle>
                  <DialogDescription>Create a new appointment for a patient</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Patient</Label>
                    <Select value={form.patientId} onValueChange={(v)=>{
                      const opt = patientOptions.find(p=>p.id===v);
                      setForm(f=>({...f, patientId:v, patientName: opt?.name || '' }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patientOptions.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Appointment Type</Label>
                    <Select value={form.type} onValueChange={(v)=>setForm(f=>({...f,type:v as any}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={(e)=>setForm(f=>({...f,date:e.target.value}))} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Time Slot</Label>
                    <Select value={form.time} onValueChange={(v)=>setForm(f=>({...f,time:v}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(slot => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Input placeholder="Reason for visit..." value={form.notes} onChange={(e)=>setForm(f=>({...f,notes:e.target.value}))} />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>Cancel</Button>
                  <Button onClick={() => createMutation.mutate({
                    patientId: form.patientId,
                    patientName: form.patientName,
                    date: form.date,
                    time: form.time,
                    type: form.type as any,
                    notes: form.notes || undefined,
                  })} disabled={createMutation.isPending}>Schedule</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Appointments Grid */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">
                  {selectedDate?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>
            </div>

            <div className="divide-y divide-border">
              {filteredAppointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className={cn(
                    'flex items-center gap-4 p-4 transition-all hover:bg-accent/50 animate-fade-in',
                    appointment.status === 'in-progress' && 'bg-primary/5'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Time */}
                  <div className="flex flex-col items-center w-16 shrink-0">
                    <div className="flex items-center gap-1 text-lg font-semibold text-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {appointment.time}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-12 bg-border" />

                  {/* Patient Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary shrink-0">
                      <User className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{appointment.patientName}</p>
                      {appointment.doctorName ? (
                        <p className="text-sm text-muted-foreground">Dr. {appointment.doctorName.replace('Dr. ', '')}</p>
                      ) : null}
                    </div>
                  </div>

                  {/* Type Badge */}
                  <Badge variant="outline" className={cn('capitalize shrink-0', getTypeColor(appointment.type))}>
                    {appointment.type}
                  </Badge>

                  {/* Status Badge */}
                  <Badge variant="outline" className={cn('capitalize shrink-0', getStatusColor(appointment.status))}>
                    {appointment.status.replace('-', ' ')}
                  </Badge>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm">View</Button>
                    {appointment.status === 'scheduled' && (
                      <Button variant="outline" size="sm" onClick={async ()=>{
                        try {
                          await checkInAppointment(appointment.id);
                          toast.success('Patient checked in');
                          qc.invalidateQueries({ queryKey: ['appointments'] });
                        } catch (e:any) {
                          toast.error(e?.message || 'Failed to check-in');
                        }
                      }}>Check In</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredAppointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mb-3 opacity-50" />
                <p>No appointments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
