import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

/**
 * Map backend response ke format yang dibutuhkan frontend
 * Backend: { id, title, audit_period, location, lead_auditor, auditor_name, revision, status, created_at, updated_at }
 * Frontend: { id, judul, tanggalAudit, lokasi, leadAuditor, auditor, revisi, status }
 */
const mapAuditDocumentRow = (item) => ({
  id: item.id,
  judul: item.title || "-",
  tanggalAudit: item.audit_period
    ? new Date(item.audit_period).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-",
  lokasi: item.location || "-",
  leadAuditor: item.lead_auditor || "-",
  auditor: item.auditor_name || "-",
  revisi: item.revision || "-",
  status: item.status || "draft",
});

/**
 * Hook untuk mengelola Audit Documents dengan React Query
 * Fitur:
 * - List documents dengan pagination
 * - Search by title & location
 * - Filter by status
 * - Create, update, delete document (mutations)
 */
export function useAuditDocuments() {
  const queryClient = useQueryClient();

  // State untuk pagination, search, dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);

  // Prepare query params untuk API
  const queryParams = useMemo(() => {
    const params = {
      page: activePage,
      per_page: perPage,
    };

    // Search params (bisa search di title atau location)
    if (searchQuery.trim()) {
      params.search_title = searchQuery.trim();
      // Uncomment jika mau search di location juga
      // params.search_location = searchQuery.trim()
    }

    // Status filter
    if (statusFilter && statusFilter !== "Semua Status") {
      // Map frontend status ke backend enum: draft, in_progress, reviewed, approved
      const statusMap = {
        Draft: "draft",
        "In Progress": "in_progress",
        Reviewed: "reviewed",
        Approved: "approved",
      };
      params.status = statusMap[statusFilter] || statusFilter.toLowerCase();
    }

    return params;
  }, [searchQuery, statusFilter, activePage, perPage]);

  // React Query - Fetch list documents
  const listQuery = useQuery({
    queryKey: ["audit-documents", queryParams],
    queryFn: () => auditService.listDocuments(queryParams),
    keepPreviousData: true, // Maintain previous data while fetching new page
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Map backend data ke format frontend
  const mappedData = useMemo(() => {
    if (!listQuery.data?.data) return [];
    return listQuery.data.data.map(mapAuditDocumentRow);
  }, [listQuery.data]);

  // Pagination metadata dari backend
  const totalPages = listQuery.data?.meta?.last_page ?? 1;
  const totalData = listQuery.data?.meta?.total ?? 0;
  const currentPage = Math.min(activePage, totalPages);

  // Mutation: Create document
  const createMutation = useMutation({
    mutationFn: (payload) => auditService.createDocument(payload),
    onSuccess: () => {
      // Invalidate list query untuk refresh data
      queryClient.invalidateQueries(["audit-documents"]);
    },
  });

  // Mutation: Update document
  const updateMutation = useMutation({
    mutationFn: ({ documentId, payload }) =>
      auditService.updateDocument(documentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-documents"]);
    },
  });

  // Mutation: Delete document
  const deleteMutation = useMutation({
    mutationFn: (documentId) => auditService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["audit-documents"]);
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

  // Handler untuk status filter
  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    setActivePage(1); // Reset ke page 1 saat ganti filter
  }, []);

  return {
    // Query states
    pagedData: mappedData,
    isLoading: listQuery.isLoading,
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

    // Search & Filter
    searchQuery,
    setSearchQuery: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,

    // Mutations
    createDocument: createMutation.mutate,
    updateDocument: updateMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,

    // Refetch manually if needed
    refetch: listQuery.refetch,
  };
}
