import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Catalog,
  createOpdRequest,
  getOpdCatalog,
  getPatients,
  listOpdRequests,
  mapLabRequestToListItem,
  packRequestedFromSelected,
} from '@/services/labRequests';
import type { LabRequestListItem } from '@/types/clinic';
import { toast } from 'sonner';

export function useOpdLabRequests() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: catalog, isLoading: loadingCatalog, error: catalogError } = useQuery<Catalog>({
    queryKey: ['opd-catalog'],
    queryFn: getOpdCatalog,
  });
  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ['patients-all'],
    queryFn: getPatients,
  });
  const { data: rawList, isLoading: loadingList } = useQuery<any[]>({
    queryKey: ['opd-requests'],
    queryFn: listOpdRequests,
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

  const { mutateAsync: submitRequest, isPending: creating } = useMutation({
    mutationFn: async (payload: { patientName: string; patientId?: string; notes?: string; requested: any }) => {
      return createOpdRequest(payload);
    },
    onSuccess: () => {
      toast.success('Lab request sent');
      qc.invalidateQueries({ queryKey: ['opd-requests'] });
    },
    onError: (e: any) => {
      toast.error('Failed to send request', { description: e?.message || 'Error' });
    },
  });

  // Build UI categories from catalog labels (labels are human-friendly)
  const uiCategories = useMemo(() => {
    if (!catalog?.labels) return undefined;
    return [
      { name: 'Hematology', tests: catalog.labels.hematology.map((x) => x.label) },
      { name: 'Urinalysis', tests: catalog.labels.urinalysis.map((x) => x.label) },
      { name: 'Chemistry', tests: catalog.labels.chemistry.map((x) => x.label) },
      { name: 'Serology', tests: catalog.labels.serology.map((x) => x.label) },
    ];
  }, [catalog]);

  const createRequest = async (data: {
    patientId: string;
    priority: 'normal' | 'urgent';
    clinicalNotes: string;
    selected: Record<string, string[]>;
  }) => {
    if (!catalog) {
      toast.error('Catalog not loaded');
      return;
    }
    const requested = packRequestedFromSelected(data.selected, catalog);

    const patient = patients?.find((p) => p.id === data.patientId);
    const patientName = patient?.name || 'Unknown';

    await submitRequest({
      patientId: data.patientId,
      patientName,
      notes: data.clinicalNotes,
      requested,
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    pending,
    inProgress,
    completed,
    patients,
    uiCategories,
    createRequest,
    loading: loadingCatalog || loadingPatients || loadingList,
    creating,
    error: catalogError,
  };
}
