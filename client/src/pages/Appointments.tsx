import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockAppointments, mockPatients } from '@/data/mockData';
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

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

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

  const filteredAppointments = mockAppointments.filter(appointment => {
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
                  <span className="font-medium">{mockAppointments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-success">
                    {mockAppointments.filter(a => a.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Waiting</span>
                  <span className="font-medium text-warning">
                    {mockAppointments.filter(a => a.status === 'waiting').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span className="font-medium text-destructive">
                    {mockAppointments.filter(a => a.status === 'cancelled').length}
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPatients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} ({patient.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Appointment Type</Label>
                    <Select>
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
                    <Input type="date" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Time Slot</Label>
                    <Select>
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
                    <Input placeholder="Reason for visit..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsNewAppointmentOpen(false)}>Schedule</Button>
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
                      <p className="text-sm text-muted-foreground">Dr. {appointment.doctorName.replace('Dr. ', '')}</p>
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
                      <Button variant="outline" size="sm">Check In</Button>
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
