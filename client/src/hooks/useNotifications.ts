import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listInventory } from '@/services/inventory';
import { listAppointments } from '@/services/appointments';
import { fetchPendingPayments } from '@/services/payments';
import { useAuth } from '@/contexts/AuthContext';

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  time?: string;
  kind: 'stock' | 'appointment' | 'payment';
};

export function useNotifications() {
  const { user } = useAuth();

  const { data: central = [] } = useQuery<any[]>({
    queryKey: ['inventory', 'central'],
    queryFn: () => listInventory({ location: 'central' }),
  });
  const { data: opd = [] } = useQuery<any[]>({
    queryKey: ['inventory', 'opd'],
    queryFn: () => listInventory({ location: 'opd' }),
  });

  const { data: appointments = [] } = useQuery<any[]>({
    queryKey: ['appointments', 'today', 'waiting'],
    queryFn: () => listAppointments({ status: 'waiting' as any }),
  });

  const { data: pendingPayments = [] } = useQuery<any[]>({
    queryKey: ['payments', 'pending'],
    queryFn: () => fetchPendingPayments(),
    enabled: user?.role === 'receptionist',
  });

  const items: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];

    // Low stock: central + opd
    const lowStock = [...central, ...opd].filter(i => (i.reorderLevel ?? 0) >= 0 && i.quantity <= (i.reorderLevel ?? 0));
    lowStock.slice(0, 3).forEach((i) => {
      list.push({
        id: `stock-${i._id}`,
        kind: 'stock',
        title: 'Low Stock Alert',
        description: `${i.name} is low (${i.quantity} ${i.unit})`,
      });
    });

    // Waiting appointments (top 3)
    (appointments || []).slice(0,3).forEach((a: any) => {
      list.push({
        id: `appt-${a.id}`,
        kind: 'appointment',
        title: 'Waiting Patient',
        description: `${a.patientName} waiting for ${a.type}`,
        time: a.time,
      });
    });

    // Pending payments (receptionist)
    if (user?.role === 'receptionist') {
      (pendingPayments || []).slice(0,3).forEach((p: any) => {
        list.push({
          id: `pay-${p.id}`,
          kind: 'payment',
          title: 'Pending Payment',
          description: `${p.patientName}: ${p.details} • ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(p.amount || 0)}`,
        });
      });
    }

    return list;
  }, [central, opd, appointments, pendingPayments, user?.role]);

  return {
    items,
    count: items.length,
  };
}
