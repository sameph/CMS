import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Search, DollarSign, Clock, CheckCircle, CreditCard, Banknote, User, FileText, TestTube, Pill, Syringe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { fetchPendingPayments, confirmPayment, PaymentItem } from '@/services/payments';

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cardReference, setCardReference] = useState('');
  const [pendingPayments, setPendingPayments] = useState<PaymentItem[]>([]);
  const [completedPayments, setCompletedPayments] = useState<PaymentItem[]>([]); // Keep empty or handle later
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingPayments();
      setPendingPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payments');
      setPendingPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'consultation': FileText,
      'laboratory': TestTube,
      'medication': Pill,
      'injection': Syringe,
    };
    return icons[type] || DollarSign;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'consultation': 'bg-primary/10 text-primary',
      'laboratory': 'bg-info/10 text-info',
      'medication': 'bg-success/10 text-success',
      'injection': 'bg-warning/10 text-warning',
    };
    return colors[type] || 'bg-secondary/10 text-secondary-foreground';
  };

  const filteredPayments = (pendingPayments || []).filter(payment =>
    payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleProcessPayment = async () => {
    if (!selectedPayment) return;
    if (paymentMethod === 'card' && !cardReference.trim()) {
      toast.error('Enter card transaction reference');
      return;
    }
    setIsProcessingPayment(true);
    try {
      await confirmPayment(selectedPayment.id, selectedPayment.type, {
        method: paymentMethod,
        reference: paymentMethod === 'card' ? cardReference.trim() : undefined,
      });
      toast.success('Payment processed successfully');
      setIsProcessingPayment(false);
      setSelectedPayment(null);
      setCardReference('');
      loadData(); // Reload list
    } catch (err) {
      toast.error('Failed to confirm payment');
      setIsProcessingPayment(false);
    }
  };

  const pendingLabPayments = filteredPayments.filter(p => p.type === 'laboratory');

  return (
    <DashboardLayout title="Payments" subtitle="Process and manage financial transactions">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-success/20 bg-gradient-to-br from-success/10 to-success/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${todayRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
            </div>
          </div>
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{filteredPayments.length}</p>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
            </div>
          </div>
          <div className="rounded-xl border border-info/20 bg-info/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <TestTube className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingLabPayments.length}</p>
              <p className="text-sm text-muted-foreground">Unpaid Lab Tests</p>
            </div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedPayments.length}</p>
              <p className="text-sm text-muted-foreground">Completed Today</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({filteredPayments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedPayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <CheckCircle className="h-12 w-12 mb-3 opacity-50" />
                          <p>No pending payments</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => {
                      const TypeIcon = getTypeIcon(payment.type);
                      return (
                        <TableRow key={payment.id} className="hover:bg-accent/50">
                          <TableCell className="font-mono text-sm text-primary">{payment.id.substring(0, 8)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                                <User className="h-4 w-4 text-secondary-foreground" />
                              </div>
                              <span className="font-medium">{payment.patientName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('gap-1 capitalize', getTypeColor(payment.type))}>
                              <TypeIcon className="h-3 w-3" />
                              {payment.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-lg">${payment.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(payment.date)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => setSelectedPayment(payment)}>
                              <DollarSign className="h-4 w-4 mr-1" />
                              Process
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="completed">
            {/* Keeping completed section simple/empty for now as backend endpoint isn't ready */}
             <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mb-3 opacity-50" />
                <p>No completed payments visible</p>
              </div>
          </TabsContent>
        </Tabs>

        {/* Process Payment Dialog */}
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent>
            {selectedPayment && (
              <>
                <DialogHeader>
                  <DialogTitle>Process Payment</DialogTitle>
                  <DialogDescription>
                    Collect payment for {selectedPayment.patientName}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
                    <p className="text-4xl font-bold text-foreground">${selectedPayment.amount.toFixed(2)}</p>
                    <Badge variant="outline" className={cn('mt-2 capitalize', getTypeColor(selectedPayment.type))}>
                      {selectedPayment.type}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                          paymentMethod === 'cash'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Banknote className={cn('h-5 w-5', paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground')} />
                        <span className={cn('font-medium', paymentMethod === 'cash' ? 'text-foreground' : 'text-muted-foreground')}>Cash</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                          paymentMethod === 'card'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <CreditCard className={cn('h-5 w-5', paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground')} />
                        <span className={cn('font-medium', paymentMethod === 'card' ? 'text-foreground' : 'text-muted-foreground')}>Card</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-2">
                       <Label htmlFor="reference">Transaction Reference</Label>
                       <Input id="reference" placeholder="Enter card transaction reference" value={cardReference} onChange={(e)=>setCardReference(e.target.value)} />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedPayment(null)}>Cancel</Button>
                  <Button onClick={handleProcessPayment} disabled={isProcessingPayment || (paymentMethod==='card' && !cardReference.trim())}>
                    {isProcessingPayment ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
