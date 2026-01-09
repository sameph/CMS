import { Activity, FileText, TestTube, CreditCard, Pill, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'consultation' | 'lab' | 'payment' | 'prescription' | 'dispensing';
  title: string;
  description: string;
  time: string;
  status?: 'completed' | 'pending' | 'in-progress';
}

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'consultation',
    title: 'Consultation Completed',
    description: 'John Smith - General checkup',
    time: '10 min ago',
    status: 'completed',
  },
  {
    id: '2',
    type: 'lab',
    title: 'Lab Results Uploaded',
    description: 'Emily Davis - Blood test results ready',
    time: '25 min ago',
    status: 'completed',
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Received',
    description: 'Robert Wilson - $120.00 via card',
    time: '45 min ago',
    status: 'completed',
  },
  {
    id: '4',
    type: 'prescription',
    title: 'Prescription Issued',
    description: 'Maria Garcia - Antibiotics prescribed',
    time: '1 hour ago',
    status: 'pending',
  },
  {
    id: '5',
    type: 'dispensing',
    title: 'Medication Dispensed',
    description: 'David Lee - Amlodipine 5mg',
    time: '2 hours ago',
    status: 'completed',
  },
];

export function RecentActivity() {
  const getIcon = (type: ActivityItem['type']) => {
    const icons = {
      consultation: FileText,
      lab: TestTube,
      payment: CreditCard,
      prescription: FileText,
      dispensing: Pill,
    };
    return icons[type];
  };

  const getIconColor = (type: ActivityItem['type']) => {
    const colors = {
      consultation: 'bg-primary/10 text-primary',
      lab: 'bg-info/10 text-info',
      payment: 'bg-success/10 text-success',
      prescription: 'bg-warning/10 text-warning',
      dispensing: 'bg-accent text-accent-foreground',
    };
    return colors[type];
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest system updates</p>
        </div>
        <Activity className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="divide-y divide-border">
        {mockActivity.map((item, index) => {
          const Icon = getIcon(item.type);
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-4 transition-colors hover:bg-accent/50 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                getIconColor(item.type)
              )}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                <span>{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
