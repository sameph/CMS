import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Clock, CheckCircle, TestTube, Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LabTestRequestForm } from '@/components/lab/LabTestRequestForm';
import { RequestTable, formatDate, getStatusColor } from '@/components/lab/RequestTable';
import { useOpdLabRequests } from '@/hooks/useOpdLabRequests';
import type { LabRequestListItem } from '@/types/clinic';
import { useQuery } from '@tanstack/react-query';
import { getOpdRequest, buildLabelMaps } from '@/services/labRequests';

export default function OPDLabRequests() {
  const {
    searchTerm,
    setSearchTerm,
    pending,
    inProgress,
    completed,
    patients,
    uiCategories,
    createRequest,
    loading,
  } = useOpdLabRequests();

  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [selected, setSelected] = useState<LabRequestListItem | null>(null);

  const { data: selectedFull } = useQuery({
    queryKey: ['opd-request', selected?.id],
    queryFn: () => getOpdRequest(selected!.id),
    enabled: !!selected?.id,
  });

  const stats = [
    { icon: Clock, label: 'Pending Requests', value: pending.length, color: 'warning' },
    { icon: TestTube, label: 'In Progress', value: inProgress.length, color: 'info' },
    { icon: CheckCircle, label: 'Completed', value: completed.length, color: 'success' },
  ];

  return (
    <DashboardLayout title="OPD Lab Requests" subtitle="Request and track lab tests from OPD">
      <div className="space-y-6">
        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button onClick={() => setIsRequestFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Request Lab Tests
          </Button>
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
              <Clock className="h-4 w-4" /> Pending ({pending.length})
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
                showStart={false} 
                showEnterResults={false} 
                showView 
                onView={setSelected} 
              />
              {pending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mb-3 opacity-50" />
                  <p>No pending requests</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <RequestTable 
                requests={inProgress} 
                showActions 
                showStart={false} 
                showEnterResults={false} 
                showView 
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
              <RequestTable 
                requests={completed} 
                showActions 
                showStart={false} 
                showEnterResults={false} 
                showView 
                onView={setSelected} 
              />
              {completed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-3 opacity-50" />
                  <p>No completed tests</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* New Request Form */}
        <LabTestRequestForm
          open={isRequestFormOpen}
          onOpenChange={setIsRequestFormOpen}
          patients={patients}
          categories={uiCategories}
          onSubmit={async ({ patientId, clinicalNotes, selected }) => {
            await createRequest({ patientId, clinicalNotes, selected, priority: 'normal' });
          }}
        />

        {/* View Request Details Dialog */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
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

                  {selectedFull?.results && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Results</p>
                      <div className="space-y-2">
                        {(() => {
                          const { byKey } = buildLabelMaps(selectedFull.catalog || undefined);
                          const cats: Array<{ label: 'Hematology'|'Urinalysis'|'Chemistry'|'Serology'; key: keyof typeof selectedFull.results }> = [
                            { label: 'Hematology', key: 'hematology' },
                            { label: 'Urinalysis', key: 'urinalysis' },
                            { label: 'Chemistry', key: 'chemistry' },
                            { label: 'Serology', key: 'serology' },
                          ];
                          return cats.map((c) => {
                            const res = selectedFull.results?.[c.key] || {};
                            const normals = selectedFull.normals?.[c.key] || {};
                            const keys = Object.keys(res);
                            if (!keys.length) return null;
                            return (
                              <div key={c.label} className="rounded-lg border border-border p-3">
                                <p className="font-medium text-sm mb-2">{c.label}</p>
                                <div className="space-y-1">
                                  {keys.map((k: string) => (
                                    <div key={k} className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        {byKey[c.label]?.[k] || k}
                                      </span>
                                      <span className="font-medium">{res[k]}</span>
                                      {normals[k] && (
                                        <span className="text-xs text-muted-foreground">Normal: {normals[k]}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
