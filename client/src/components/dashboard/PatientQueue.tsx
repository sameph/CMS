import { Clock, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PatientQueueProps {
  appointments: Appointment[];
  onCallPatient?: (appointment: Appointment) => void;
}

export function PatientQueue({ appointments, onCallPatient }: PatientQueueProps) {
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
      'consultation': 'bg-info/10 text-info',
      'follow-up': 'bg-primary/10 text-primary',
      'emergency': 'bg-destructive/10 text-destructive',
    };
    return colors[type];
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="font-semibold text-foreground">Patient Queue</h3>
          <p className="text-sm text-muted-foreground">Today's appointments</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {appointments.filter(a => a.status === 'waiting').length} waiting
        </Badge>
      </div>
      
      <div className="divide-y divide-border">
        {appointments.map((appointment, index) => (
          <div
            key={appointment.id}
            className={cn(
              'flex items-center gap-4 p-4 transition-colors',
              appointment.status === 'in-progress' && 'bg-primary/5',
              appointment.status === 'waiting' && 'hover:bg-accent'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <User className="h-5 w-5 text-secondary-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground truncate">{appointment.patientName}</p>
                <Badge variant="outline" className={cn('text-xs', getTypeColor(appointment.type))}>
                  {appointment.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{appointment.time}</span>
                {appointment.notes && (
                  <>
                    <span>•</span>
                    <span className="truncate">{appointment.notes}</span>
                  </>
                )}
              </div>
            </div>

            <Badge variant="outline" className={cn('capitalize', getStatusColor(appointment.status))}>
              {appointment.status.replace('-', ' ')}
            </Badge>

            {appointment.status === 'waiting' && onCallPatient && (
              <Button
                size="sm"
                onClick={() => onCallPatient(appointment)}
                className="gap-1"
              >
                Call
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mb-3 opacity-50" />
          <p>No appointments scheduled</p>
        </div>
      )}
    </div>
  );
}
