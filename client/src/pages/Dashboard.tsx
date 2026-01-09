import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PatientQueue } from '@/components/dashboard/PatientQueue';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useAuth } from '@/contexts/AuthContext';
import { mockDashboardStats, mockAppointments, mockLabTests, mockPrescriptions } from '@/data/mockData';
import { Users, Calendar, TestTube, FileText, DollarSign, Package, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Appointment } from '@/types/clinic';

export default function Dashboard() {
  const { user } = useAuth();
  const stats = mockDashboardStats;

  const handleCallPatient = (appointment: Appointment) => {
    toast.success(`Calling ${appointment.patientName} to consultation room`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'receptionist':
        return (
          <>
            <StatsCard
              title="Total Patients"
              value={stats.totalPatients.toLocaleString()}
              subtitle="Registered in system"
              icon={Users}
              variant="primary"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              subtitle="Scheduled for today"
              icon={Calendar}
              variant="success"
            />
            <StatsCard
              title="Today's Revenue"
              value={`$${stats.todayRevenue.toLocaleString()}`}
              subtitle="Collected payments"
              icon={DollarSign}
              variant="warning"
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Pending Payments"
              value={3}
              subtitle="Awaiting collection"
              icon={Clock}
              variant="danger"
            />
          </>
        );
      case 'opd':
        return (
          <>
            <StatsCard
              title="Today's Patients"
              value={stats.todayAppointments}
              subtitle="Consultations scheduled"
              icon={Users}
              variant="primary"
            />
            <StatsCard
              title="Pending Lab Results"
              value={stats.pendingLabTests}
              subtitle="Awaiting review"
              icon={TestTube}
              variant="warning"
            />
            <StatsCard
              title="Prescriptions Issued"
              value={15}
              subtitle="Today's prescriptions"
              icon={FileText}
              variant="success"
            />
            <StatsCard
              title="Low Stock Items"
              value={stats.lowStockItems}
              subtitle="Need restocking"
              icon={AlertTriangle}
              variant="danger"
            />
          </>
        );
      case 'laboratory':
        return (
          <>
            <StatsCard
              title="Pending Tests"
              value={mockLabTests.filter(t => t.status === 'pending').length}
              subtitle="Awaiting processing"
              icon={TestTube}
              variant="warning"
            />
            <StatsCard
              title="In Progress"
              value={mockLabTests.filter(t => t.status === 'in-progress').length}
              subtitle="Currently testing"
              icon={Clock}
              variant="primary"
            />
            <StatsCard
              title="Completed Today"
              value={mockLabTests.filter(t => t.status === 'completed').length}
              subtitle="Results uploaded"
              icon={TestTube}
              variant="success"
            />
            <StatsCard
              title="Unpaid Tests"
              value={mockLabTests.filter(t => !t.isPaid).length}
              subtitle="Pending payment"
              icon={DollarSign}
              variant="danger"
            />
          </>
        );
      case 'injection':
        return (
          <>
            <StatsCard
              title="Pending Prescriptions"
              value={mockPrescriptions.filter(p => p.status === 'pending').length}
              subtitle="Ready to dispense"
              icon={FileText}
              variant="warning"
            />
            <StatsCard
              title="Dispensed Today"
              value={mockPrescriptions.filter(p => p.status === 'dispensed').length}
              subtitle="Completed orders"
              icon={Package}
              variant="success"
            />
            <StatsCard
              title="Injections Today"
              value={4}
              subtitle="Administered"
              icon={TestTube}
              variant="primary"
            />
            <StatsCard
              title="Low Stock Alert"
              value={stats.lowStockItems}
              subtitle="Items below threshold"
              icon={AlertTriangle}
              variant="danger"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout 
      title={`${getGreeting()}, ${user?.name.split(' ')[0]}`}
      subtitle="Here's what's happening at the clinic today"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getRoleSpecificStats()}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Queue - Takes 2 columns */}
          <div className="lg:col-span-2">
            <PatientQueue 
              appointments={mockAppointments} 
              onCallPatient={user?.role === 'opd' ? handleCallPatient : undefined}
            />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
