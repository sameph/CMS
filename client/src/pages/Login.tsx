import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/clinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, User, Stethoscope, TestTube, Syringe, Lock, Mail, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleOptions: RoleOption[] = [
  { role: 'receptionist', label: 'Receptionist', description: 'Patient registration & payments', icon: User },
  { role: 'opd', label: 'OPD Doctor', description: 'Consultations & prescriptions', icon: Stethoscope },
  { role: 'laboratory', label: 'Laboratory', description: 'Lab tests & results', icon: TestTube },
  { role: 'injection', label: 'Injection Room', description: 'Dispensing & injections', icon: Syringe },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        toast.success('Welcome back!');
        const roleLanding: Record<UserRole, string> = {
          receptionist: '/patients',
          opd: '/appointments',
          laboratory: '/lab-tests',
          injection: '/injections',
        };
        navigate(roleLanding[selectedRole] || '/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-primary-foreground"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ClinicPro</h1>
            <p className="text-sm text-primary-foreground/80">Management System</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Streamline Your<br />
            Clinical Operations
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            A comprehensive solution for managing patients, appointments, laboratory tests, 
            prescriptions, and billing — all in one integrated platform.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="rounded-xl bg-primary-foreground/10 backdrop-blur-sm p-4">
              <p className="text-3xl font-bold">1,247</p>
              <p className="text-sm text-primary-foreground/70">Active Patients</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 backdrop-blur-sm p-4">
              <p className="text-3xl font-bold">24</p>
              <p className="text-sm text-primary-foreground/70">Today's Appointments</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © 2024 ClinicPro. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ClinicPro</h1>
              <p className="text-sm text-muted-foreground">Management System</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select your role</Label>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((option) => (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => setSelectedRole(option.role)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
                    selectedRole === option.role
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    selectedRole === option.role
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}>
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading || !selectedRole}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Demo mode: Use any email/password with a selected role
          </p>
        </div>
      </div>
    </div>
  );
}
