import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

/**
 * Map backend response ke format yang dibutuhkan frontend
 * Backend: { id, checklist_name, description, created_at, updated_at }
 * Frontend: { id, title, description }
 */
const mapChecklistRow = (item) => ({
  id: item.id,
  title: item.checklist_name || "-",
  description: item.description || "-",
  created_at: item.created_at,
  updated_at: item.updated_at,
});

/**
 * Hook untuk mengelola Audit Checklists dengan React Query
 * Fitur:
 * - List checklists dengan pagination
 * - Search by name
 * - Create, update, delete checklist (mutations)
 * @param {Object} options - Configuration options
 * @param {number} options.initialPerPage - Initial items per page
 */
export function useAuditChecklists({ initialPerPage = 10 } = {}) {
  const queryClient = useQueryClient();

  // State untuk pagination dan search
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(initialPerPage);
  const [activePage, setActivePage] = useState(1);

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

    return params;
  }, [searchQuery, activePage, perPage]);

  // React Query - Fetch list checklists
  const listQuery = useQuery({
    queryKey: ["audit-checklists", queryParams],
    queryFn: () => auditService.listChecklists(queryParams),
    keepPreviousData: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Map backend data ke format frontend
  const mappedData = useMemo(() => {
    if (!listQuery.data?.data) return [];
    return listQuery.data.data.map(mapChecklistRow);
  }, [listQuery.data]);

  // Pagination metadata dari backend
  const totalPages = listQuery.data?.meta?.last_page ?? 1;
  const totalData = listQuery.data?.meta?.total ?? 0;
  const currentPage = Math.min(activePage, totalPages);

  // Mutation: Create checklist
  const createMutation = useMutation({
    mutationFn: (payload) => auditService.createChecklist(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-checklists"]);
    },
  });

  // Mutation: Update checklist
  const updateMutation = useMutation({
    mutationFn: ({ checklistId, payload }) =>
      auditService.updateChecklist(checklistId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-checklists"]);
    },
  });

  // Mutation: Delete checklist
  const deleteMutation = useMutation({
    mutationFn: (checklistId) => auditService.deleteChecklist(checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-checklists"]);
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

    // Mutations
    createChecklist: createMutation.mutate,
    updateChecklist: updateMutation.mutate,
    deleteChecklist: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Refetch manually if needed
    refetch: listQuery.refetch,
  };
}
