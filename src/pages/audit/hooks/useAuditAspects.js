import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

/**
 * Map backend response ke format yang dibutuhkan frontend
 * Backend: { id, aspect_name, description, id_audit_checklists, created_at, updated_at }
 * Frontend: { id, name, description, checklistId }
 */
const mapAspectRow = (item) => ({
  id: item.id,
  name: item.aspect_name || "-",
  description: item.description || "-",
  checklistId: item.id_audit_checklists,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

/**
 * Hook untuk mengelola Audit Aspects dengan React Query
 * Fitur:
 * - List aspects dengan pagination
 * - Search by name
 * - Filter by checklist
 * - Create, update, delete aspect (mutations)
 */
export function useAuditAspects() {
  const queryClient = useQueryClient();

  // State untuk pagination, search, dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [selectedChecklistId, setSelectedChecklistId] = useState(null);

  // Prepare query params untuk API
  const queryParams = useMemo(() => {
    const params = {
      page: activePage,
      per_page: perPage,
    };

    // Search params
    if (searchQuery.trim()) {
      params.search_name = searchQuery.trim();
    }

    // Filter by checklist
    if (selectedChecklistId) {
      params.checklist_id = selectedChecklistId;
    }

    return params;
  }, [searchQuery, activePage, perPage, selectedChecklistId]);

  // React Query - Fetch list aspects
  const listQuery = useQuery({
    queryKey: ["audit-aspects", queryParams],
    queryFn: () => auditService.listAspects(queryParams),
    keepPreviousData: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Map backend data ke format frontend
  const mappedData = useMemo(() => {
    if (!listQuery.data?.data) return [];
    return listQuery.data.data.map(mapAspectRow);
  }, [listQuery.data]);

  // Pagination metadata dari backend
  const totalPages = listQuery.data?.meta?.last_page ?? 1;
  const totalData = listQuery.data?.meta?.total ?? 0;
  const currentPage = Math.min(activePage, totalPages);

  // Mutation: Create aspect
  const createMutation = useMutation({
    mutationFn: (payload) => auditService.createAspect(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-aspects"]);
    },
  });

  // Mutation: Update aspect
  const updateMutation = useMutation({
    mutationFn: ({ aspectId, payload }) =>
      auditService.updateAspect(aspectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-aspects"]);
    },
  });

  // Mutation: Delete aspect
  const deleteMutation = useMutation({
    mutationFn: (aspectId) => auditService.deleteAspect(aspectId),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-aspects"]);
    },
  });

  // Handler untuk perubahan pagination
  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
    setActivePage(1); // Reset ke page 1 saat ganti per_page
  }, []);

  // Handler untuk search
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setActivePage(1); // Reset ke page 1 saat search
  }, []);

  // Handler untuk filter checklist
  const handleChecklistFilterChange = useCallback((checklistId) => {
    setSelectedChecklistId(checklistId);
    setActivePage(1); // Reset ke page 1 saat ganti filter
  }, []);

  return {
    // Query states
    pagedData: mappedData,
    isLoading: listQuery.isPending,
    isError: listQuery.isError,
    error: listQuery.error,

    // Pagination
    perPage,
    setPerPage,
    activePage: currentPage,
    setActivePage,
    totalPages,
    totalData,
    handlePaginateChange,

    // Search
    searchQuery,
    setSearchQuery: handleSearchChange,

    // Filter
    selectedChecklistId,
    setSelectedChecklistId: handleChecklistFilterChange,

    // Mutations
    createAspect: createMutation.mutate,
    updateAspect: updateMutation.mutate,
    deleteAspect: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Refetch manually if needed
    refetch: listQuery.refetch,
  };
}
