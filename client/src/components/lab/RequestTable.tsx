import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LabRequestListItem } from '@/types/clinic';
import { User, Play, Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    'in-progress': 'bg-info/10 text-info border-info/20',
    completed: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return colors[status] || '';
}

export function formatDate(dateString: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function RequestTable({
  requests,
  showActions = false,
  onStart,
  onEnterResults,
  onView,
}: {
  requests: LabRequestListItem[];
  showActions?: boolean;
  onStart?: (r: LabRequestListItem) => void;
  onEnterResults?: (r: LabRequestListItem) => void;
  onView?: (r: LabRequestListItem) => void;
}) {
  const totalTests = (r: LabRequestListItem) => r.tests.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Request ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Tests</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((r) => (
          <TableRow key={r.id} className="hover:bg-accent/50">
            <TableCell className="font-mono text-sm text-primary">{r.id}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
                <span className="font-medium">{r.patientName}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {r.tests.map((cat) => (
                  <Badge key={cat.category} variant="outline" className="text-xs">
                    {cat.category} ({cat.items.length})
                  </Badge>
                ))}
                <Badge variant="secondary" className="text-xs">Total: {totalTests(r)}</Badge>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{r.requestedBy || '-'}</TableCell>
            <TableCell className="text-sm">{formatDate(r.requestDate)}</TableCell>
            <TableCell>
              <Badge variant="outline" className={cn('capitalize', getStatusColor(r.status))}>
                {r.status.replace('-', ' ')}
              </Badge>
            </TableCell>
            {showActions && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {r.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => onStart?.(r)}>
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {r.status === 'in-progress' && (
                    <Button size="sm" onClick={() => onEnterResults?.(r)}>
                      <Upload className="h-4 w-4 mr-1" />
                      Enter Results
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => onView?.(r)}>
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
