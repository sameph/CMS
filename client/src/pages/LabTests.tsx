import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockLabTests } from '@/data/mockData';
import { LabTest } from '@/types/clinic';
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
import { Search, TestTube, Clock, CheckCircle, Upload, DollarSign, User, Plus, FileText, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LabTestRequestForm } from '@/components/lab/LabTestRequestForm';
import { LabResultEntryForm, LabTestRequest } from '@/components/lab/LabResultEntryForm';

// Mock lab requests (what OPD sends to lab)
const mockLabRequests: LabTestRequest[] = [
  {
    id: 'REQ001',
    patientId: 'P001',
    patientName: 'John Smith',
    requestedBy: 'Dr. Michael Chen',
    requestDate: '2024-12-21T09:30:00',
    priority: 'urgent',
    clinicalNotes: 'Patient presenting with fatigue and dizziness. Rule out anemia.',
    status: 'pending',
    tests: [
      { category: 'Hematology', items: ['WBC', 'Hgb', 'Hct', 'RBC', 'Platelet'] },
      { category: 'Chemistry', items: ['FBS/RBS', 'Creatinine'] },
    ],
  },
  {
    id: 'REQ002',
    patientId: 'P002',
    patientName: 'Emily Davis',
    requestedBy: 'Dr. Michael Chen',
    requestDate: '2024-12-21T10:15:00',
    priority: 'normal',
    status: 'in-progress',
    tests: [
      { category: 'Urinalysis', items: ['Colour', 'PH', 'Protein', 'Sugar', 'HCG Test'] },
    ],
  },
  {
    id: 'REQ003',
    patientId: 'P003',
    patientName: 'Robert Wilson',
    requestedBy: 'Dr. Michael Chen',
    requestDate: '2024-12-21T08:00:00',
    priority: 'normal',
    clinicalNotes: 'Annual checkup - lipid profile',
    status: 'completed',
    tests: [
      { category: 'Chemistry', items: ['Cholesterol', 'Triglycerides', 'HDL-C', 'LDL-C'] },
    ],
  },
];

export default function LabTests() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LabTestRequest | null>(null);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isResultEntryOpen, setIsResultEntryOpen] = useState(false);

  const isOPD = user?.role === 'opd';
  const isLab = user?.role === 'laboratory';

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-warning/10 text-warning border-warning/20',
      'in-progress': 'bg-info/10 text-info border-info/20',
      'completed': 'bg-success/10 text-success border-success/20',
    };
    return colors[status] || '';
  };

  const filteredRequests = mockLabRequests.filter(req =>
    req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const inProgressRequests = filteredRequests.filter(r => r.status === 'in-progress');
  const completedRequests = filteredRequests.filter(r => r.status === 'completed');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartTest = (request: LabTestRequest) => {
    toast.success(`Started processing tests for ${request.patientName}`);
  };

  const handleEnterResults = (request: LabTestRequest) => {
    setSelectedRequest(request);
    setIsResultEntryOpen(true);
  };

  const getTotalTests = (request: LabTestRequest) => {
    return request.tests.reduce((sum, cat) => sum + cat.items.length, 0);
  };

  // Request Table Component for Lab Staff
  const RequestTable = ({ requests, showActions = false }: { requests: LabTestRequest[], showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Request ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Tests Requested</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id} className={cn(
            'hover:bg-accent/50',
            request.priority === 'urgent' && 'bg-destructive/5'
          )}>
            <TableCell className="font-mono text-sm text-primary">{request.id}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
                <span className="font-medium">{request.patientName}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {request.tests.map(cat => (
                  <Badge key={cat.category} variant="outline" className="text-xs">
                    {cat.category} ({cat.items.length})
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{request.requestedBy}</TableCell>
            <TableCell className="text-sm">{formatDate(request.requestDate)}</TableCell>
            <TableCell>
              {request.priority === 'urgent' ? (
                <Badge variant="destructive" className="animate-pulse">URGENT</Badge>
              ) : (
                <Badge variant="secondary">Normal</Badge>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn('capitalize', getStatusColor(request.status))}>
                {request.status.replace('-', ' ')}
              </Badge>
            </TableCell>
            {showActions && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {request.status === 'pending' && isLab && (
                    <Button size="sm" variant="outline" onClick={() => handleStartTest(request)}>
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {request.status === 'in-progress' && isLab && (
                    <Button size="sm" onClick={() => handleEnterResults(request)}>
                      <Upload className="h-4 w-4 mr-1" />
                      Enter Results
                    </Button>
                  )}
                  {request.status === 'completed' && (
                    <Button size="sm" variant="ghost" onClick={() => setSelectedRequest(request)}>
                      <FileText className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout 
      title={isLab ? "Laboratory Dashboard" : "Lab Tests"} 
      subtitle={isLab ? "Process incoming test requests and report results" : "Request and track laboratory tests"}
    >
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
          
          {isOPD && (
            <Button onClick={() => setIsRequestFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Request Lab Tests
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
              <p className="text-sm text-muted-foreground">
                {isLab ? 'Awaiting Processing' : 'Pending Requests'}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-info/20 bg-info/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <TestTube className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inProgressRequests.length}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedRequests.length}</p>
              <p className="text-sm text-muted-foreground">Completed Today</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              {isLab ? 'Incoming' : 'Pending'} ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="gap-2">
              <TestTube className="h-4 w-4" />
              In Progress ({inProgressRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <RequestTable requests={pendingRequests} showActions />
              {pendingRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mb-3 opacity-50" />
                  <p>{isLab ? 'No incoming requests' : 'No pending requests'}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <RequestTable requests={inProgressRequests} showActions />
              {inProgressRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <TestTube className="h-12 w-12 mb-3 opacity-50" />
                  <p>No tests in progress</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <RequestTable requests={completedRequests} showActions />
              {completedRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-3 opacity-50" />
                  <p>No completed tests</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Lab Test Request Form (OPD only) */}
        <LabTestRequestForm 
          open={isRequestFormOpen} 
          onOpenChange={setIsRequestFormOpen} 
        />

        {/* Lab Result Entry Form (Lab only) */}
        <LabResultEntryForm
          open={isResultEntryOpen}
          onOpenChange={setIsResultEntryOpen}
          request={selectedRequest}
        />

        {/* View Request Details Dialog */}
        <Dialog open={!!selectedRequest && !isResultEntryOpen} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            {selectedRequest && (
              <>
                <DialogHeader>
                  <DialogTitle>Request Details - {selectedRequest.id}</DialogTitle>
                  <DialogDescription>
                    Lab test request for {selectedRequest.patientName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p className="font-medium">{selectedRequest.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Requested By</p>
                      <p className="font-medium">{selectedRequest.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(selectedRequest.requestDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Priority</p>
                      <Badge variant={selectedRequest.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {selectedRequest.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Requested Tests</p>
                    <div className="space-y-2">
                      {selectedRequest.tests.map(cat => (
                        <div key={cat.category} className="rounded-lg border border-border p-3">
                          <p className="font-medium text-sm mb-1">{cat.category}</p>
                          <div className="flex flex-wrap gap-1">
                            {cat.items.map(test => (
                              <Badge key={test} variant="outline" className="text-xs">
                                {test}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedRequest.clinicalNotes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Clinical Notes</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedRequest.clinicalNotes}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}