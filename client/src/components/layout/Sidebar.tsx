import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/clinic';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  TestTube,
  FileText,
  Pill,
  Syringe,
  Package,
  UserPlus,
  Settings,
  LogOut,
  ChevronLeft,
  Activity,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['receptionist', 'opd', 'laboratory', 'injection'] },
  { label: 'Patients', icon: Users, path: '/patients', roles: ['receptionist', 'opd'] },
  { label: 'Appointments', icon: Calendar, path: '/appointments', roles: ['receptionist', 'opd'] },
  { label: 'Consultations', icon: Stethoscope, path: '/consultations', roles: ['opd'] },
  { label: 'OPD Stock', icon: Package, path: '/opd-stock', roles: ['opd'] },
  { label: 'Lab Requests', icon: TestTube, path: '/opd/lab-requests', roles: ['opd'] },
  { label: 'Lab Dashboard', icon: TestTube, path: '/lab/dashboard', roles: ['laboratory'] },
  { label: 'Prescriptions', icon: FileText, path: '/prescriptions', roles: ['opd', 'injection'] },
  { label: 'Payments', icon: CreditCard, path: '/payments', roles: ['receptionist'] },
  { label: 'Drug Store', icon: Package, path: '/drug-store', roles: ['opd', 'injection'] },
  { label: 'Dispensing', icon: Pill, path: '/dispensing', roles: ['injection'] },
  { label: 'Injections', icon: Syringe, path: '/injections', roles: ['injection'] },
  { label: 'User Management', icon: UserPlus, path: '/users', roles: ['opd'] },
  { label: 'Analytics', icon: Activity, path: '/analytics', roles: ['opd'] },
  { label: 'Settings', icon: Settings, path: '/settings', roles: ['receptionist', 'opd', 'laboratory', 'injection'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      receptionist: 'Receptionist',
      opd: 'OPD Doctor',
      laboratory: 'Laboratory',
      injection: 'Injection Room',
    };
    return labels[role];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
        'bg-sidebar text-sidebar-foreground',
        collapsed ? 'w-20' : 'w-64'
      )}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className={cn(
          'flex items-center border-b border-sidebar-border p-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
                <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">ClinicPro</h1>
                <p className="text-xs text-sidebar-foreground/60">Management System</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
              <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
          )}
        </div>

        {/* User Info */}
        {user && (
          <div className={cn(
            'border-b border-sidebar-border p-4',
            collapsed && 'flex justify-center'
          )}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-card">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">{getRoleLabel(user.role)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-center rounded-lg p-3 transition-all duration-200',
                            isActive
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )
                        }
                      >
                        <item.icon className="h-5 w-5" />
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-card">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card">
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'mt-2 w-full text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              collapsed && 'justify-center'
            )}
          >
            <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
