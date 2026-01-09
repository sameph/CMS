import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Clock, CheckCircle, TestTube, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RequestTable, formatDate, getStatusColor } from '@/components/lab/RequestTable';
import { useLabDashboardRequests } from '@/hooks/useLabDashboardRequests';
import { LabResultEntryForm } from '@/components/lab/LabResultEntryForm';
import type { LabRequestListItem } from '@/types/clinic';

export default function LaboratoryDashboard() {
  const {
    searchTerm,
    setSearchTerm,
    pending,
    inProgress,
    completed,
    setStatus,
    submitResults,
    loading,
  } = useLabDashboardRequests();

  const [selected, setSelected] = useState<LabRequestListItem | null>(null);
  const [openResult, setOpenResult] = useState(false);

  const stats = [
    { icon: Clock, label: 'Incoming', value: pending.length, color: 'warning' },
    { icon: TestTube, label: 'In Progress', value: inProgress.length, color: 'info' },
    { icon: CheckCircle, label: 'Completed', value: completed.length, color: 'success' },
  ];

  return (
    <DashboardLayout title="Laboratory Dashboard" subtitle="Process lab requests and report results">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by patient or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={cn('rounded-xl p-4 flex items-center gap-4 border',
              s.color === 'warning' && 'border-warning/20 bg-warning/5',
              s.color === 'info' && 'border-info/20 bg-info/5',
              s.color === 'success' && 'border-success/20 bg-success/5')}
            >
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl',
                s.color === 'warning' && 'bg-warning/10',
                s.color === 'info' && 'bg-info/10',
                s.color === 'success' && 'bg-success/10')
              }>
                <s.icon className={cn('h-6 w-6',
                  s.color === 'warning' && 'text-warning',
                  s.color === 'info' && 'text-info',
                  s.color === 'success' && 'text-success')}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" /> Incoming ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="gap-2">
              <TestTube className="h-4 w-4" /> In Progress ({inProgress.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" /> Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <RequestTable
                requests={pending}
                showActions
                onStart={async (r) => setStatus({ id: r.id, status: 'in_progress' })}
                onEnterResults={(r) => { setSelected(r); setOpenResult(true); }}
                onView={setSelected}
              />
              {pending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mb-3 opacity-50" />
                  <p>No incoming requests</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <RequestTable
                requests={inProgress}
                showActions
                onEnterResults={(r) => { setSelected(r); setOpenResult(true); }}
                onView={setSelected}
              />
              {inProgress.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <TestTube className="h-12 w-12 mb-3 opacity-50" />
                  <p>No tests in progress</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <RequestTable requests={completed} showActions onView={setSelected} />
              {completed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-3 opacity-50" />
                  <p>No completed tests</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Result Entry */}
        <LabResultEntryForm
          open={openResult}
          onOpenChange={setOpenResult}
          request={selected as any}
          onSubmit={async (results) => {
            if (!selected) return;
            await submitResults({ id: selected.id, results });
          }}
        />

        {/* View Request Details Dialog */}
        <Dialog open={!!selected && !openResult} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle>Request Details - {selected.id}</DialogTitle>
                  <DialogDescription>Lab test request for {selected.patientName}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p className="font-medium">{selected.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Requested By</p>
                      <p className="font-medium">{selected.requestedBy || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(selected.requestDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline" className={cn('capitalize', getStatusColor(selected.status))}>
                        {selected.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Requested Tests</p>
                    <div className="space-y-2">
                      {selected.tests.map((cat) => (
                        <div key={cat.category} className="rounded-lg border border-border p-3">
                          <p className="font-medium text-sm mb-1">{cat.category}</p>
                          <div className="flex flex-wrap gap-1">
                            {cat.items.map((test) => (
                              <Badge key={test} variant="outline" className="text-xs">
                                {test}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
