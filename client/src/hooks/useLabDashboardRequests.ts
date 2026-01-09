import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Catalog,
  getLabCatalog,
  listLabRequests,
  mapLabRequestToListItem,
  updateLabRequest,
  packResultsForUpdate,
} from '@/services/labRequests';
import type { LabRequestListItem } from '@/types/clinic';
import { toast } from 'sonner';

export function useLabDashboardRequests() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: catalog, isLoading: loadingCatalog } = useQuery<Catalog>({
    queryKey: ['lab-catalog'],
    queryFn: getLabCatalog,
  });

  const { data: rawList, isLoading: loadingList } = useQuery<any[]>({
    queryKey: ['lab-requests'],
    queryFn: listLabRequests,
  });

  const list: LabRequestListItem[] = useMemo(() => {
    if (!rawList) return [];
    return rawList.map((doc) => mapLabRequestToListItem(doc, catalog));
  }, [rawList, catalog]);

  const filtered = useMemo(() => {
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter((r) =>
      r.patientName.toLowerCase().includes(term) || r.id.toLowerCase().includes(term)
    );
  }, [list, searchTerm]);

  const pending = filtered.filter((r) => r.status === 'pending');
  const inProgress = filtered.filter((r) => r.status === 'in-progress');
  const completed = filtered.filter((r) => r.status === 'completed');

  const { mutateAsync: setStatus, isPending: updatingStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'in_progress' | 'completed' | 'cancelled' }) => {
      return updateLabRequest(id, { status });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-requests'] });
    },
    onError: (e: any) => toast.error('Failed to update status', { description: e?.message }),
  });

  const { mutateAsync: submitResults, isPending: submittingResults } = useMutation({
    mutationFn: async ({ id, results }: { id: string; results: Record<string, any> }) => {
      if (!catalog) throw new Error('Catalog not loaded');
      const packed = packResultsForUpdate(results, catalog);
      return updateLabRequest(id, { ...packed, status: 'completed' });
    },
    onSuccess: () => {
      toast.success('Results submitted');
      qc.invalidateQueries({ queryKey: ['lab-requests'] });
    },
    onError: (e: any) => toast.error('Failed to submit results', { description: e?.message }),
  });

  return {
    searchTerm,
    setSearchTerm,
    pending,
    inProgress,
    completed,
    setStatus,
    submitResults,
    loading: loadingCatalog || loadingList,
    updatingStatus,
    submittingResults,
  };
}
