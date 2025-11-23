import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

/**
 * Custom hook untuk manage audit excel checklists dengan React Query
 * @param {Object} options - Configuration options
 * @param {string} options.initialSearch - Initial search query
 * @param {string} options.initialChecklistId - Initial checklist filter
 * @param {number} options.initialPerPage - Initial items per page
 */
export function useAuditExcelChecklists({
  initialSearch = "",
  initialChecklistId = "",
  initialPerPage = 10,
} = {}) {
  const queryClient = useQueryClient();

  // State untuk filter dan pagination
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedChecklistId, setSelectedChecklistId] =
    useState(initialChecklistId);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [activePage, setActivePage] = useState(1);

  // Query untuk list excel checklists
  const listQuery = useQuery({
    queryKey: [
      "audit-excel-checklists",
      {
        search: searchQuery,
        checklistId: selectedChecklistId,
        page: activePage,
        perPage,
      },
    ],
    queryFn: async () => {
      const params = {
        page: activePage,
        per_page: perPage,
      };

      if (searchQuery) {
        params.search_name = searchQuery;
      }

      if (selectedChecklistId && selectedChecklistId !== "") {
        params.checklist_id = selectedChecklistId;
      }

      const response = await auditService.listExcelChecklists(params);

      // Transform data dari backend ke format frontend
      const transformedData = response.data.map((item) => ({
        id: item.id,
        name: item.excel_checklist_name,
        description: item.description,
        checklistId: item.id_audit_checklists,
        checklistName: item.checklist?.checklist_name || null,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      return {
        data: transformedData,
        meta: response.meta,
      };
    },
    staleTime: 30000, // 30 seconds
    keepPreviousData: true,
  });

  // Pagination metadata dari backend
  const totalPages = listQuery.data?.meta?.last_page ?? 1;
  const totalData = listQuery.data?.meta?.total ?? 0;
  const currentPage = Math.min(activePage, totalPages);

  // Mutation: Create excel checklist
  const createMutation = useMutation({
    mutationFn: (payload) => auditService.createExcelChecklist(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-excel-checklists"]);
    },
  });

  // Mutation: Update excel checklist
  const updateMutation = useMutation({
    mutationFn: ({ excelChecklistId, payload }) =>
      auditService.updateExcelChecklist(excelChecklistId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-excel-checklists"]);
    },
  });

  // Mutation: Delete excel checklist
  const deleteMutation = useMutation({
    mutationFn: (excelChecklistId) =>
      auditService.deleteExcelChecklist(excelChecklistId),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-excel-checklists"]);
    },
  });

  // Handler untuk perubahan pagination
  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
    setActivePage(1);
  }, []);

  // Handler untuk perubahan page
  const handlePageChange = useCallback((page) => {
    setActivePage(page);
  }, []);

  // Handler untuk perubahan search
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setActivePage(1);
  }, []);

  // Handler untuk perubahan checklist filter
  const handleChecklistFilterChange = useCallback((checklistId) => {
    setSelectedChecklistId(checklistId);
    setActivePage(1);
  }, []);

  return {
    // Data
    excelChecklists: listQuery.data?.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,

    // Pagination
    currentPage,
    totalPages,
    totalData,
    perPage,
    setActivePage: handlePageChange,
    handlePaginateChange,

    // Filter
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedChecklistId,
    setSelectedChecklistId: handleChecklistFilterChange,

    // Mutations
    createExcelChecklist: createMutation.mutateAsync,
    updateExcelChecklist: updateMutation.mutateAsync,
    deleteExcelChecklist: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
