import { useCallback, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { soaDocumentsService } from "@/services/soaDocumentsService"

const STATUS_DISPLAY_TO_API = {
  "Semua Status": undefined,
  Draft: "draft",
  "In Progress": "in_progress",
  Reviewed: "reviewed",
  Approved: "approved",
}

const API_STATUS_TO_DISPLAY = {
  draft: "Draft",
  in_progress: "In Progress",
  reviewed: "Reviewed",
  approved: "Approved",
}

const mapDocumentRow = (item) => ({
  id: item.id ?? item.document_number,
  noDoc: item.document_number,
  judul: item.title,
  tanggalTerbit: item.publish_date,
  tanggalDibuat: item.created_at ?? "-",
  penyusun: item.compiler_name ?? "-",
  ketuaIso: item.iso_chairman_name ?? "-",
  direktur: item.director_name ?? "-",
  revisi: item.revision ?? "-",
  klasifikasi: item.classification ?? "-",
  statusRaw: item.status,
  status: API_STATUS_TO_DISPLAY[item.status] ?? item.status ?? "-",
})

export function useSoADocuments() {
  const [statusFilter, setStatusFilterState] = useState("Semua Status")
  const [searchQuery, setSearchQueryState] = useState("")
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [perPage, setPerPage] = useState(10)
  const [activePage, setActivePage] = useState(1)
  const queryClient = useQueryClient()

  const apiStatusFilter = STATUS_DISPLAY_TO_API[statusFilter]

  const queryParams = useMemo(
    () => ({
      search: searchQuery.trim() || undefined,
      status: apiStatusFilter,
      page: activePage,
      per_page: perPage,
    }),
    [searchQuery, apiStatusFilter, activePage, perPage],
  )

  const listQuery = useQuery({
    queryKey: ["soa-documents", queryParams],
    queryFn: () => soaDocumentsService.listDocuments(queryParams),
    keepPreviousData: true,
  })

  const documents = useMemo(
    () => (listQuery.data?.data ?? []).map(mapDocumentRow),
    [listQuery.data],
  )

  const totalPages = listQuery.data?.meta?.last_page ?? 1
  const totalData = listQuery.data?.meta?.total ?? 0

  const handleSearchChange = useCallback((value) => {
    setSearchQueryState(value)
    setActivePage(1)
  }, [])

  const handleStatusChange = useCallback((value) => {
    setStatusFilterState(value)
    setActivePage(1)
  }, [])

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value))
    setActivePage(1)
  }, [])

  const createMutation = useMutation({
    mutationFn: (payload) => soaDocumentsService.createDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soa-documents"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (documentId) => soaDocumentsService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soa-documents"] })
    },
  })
  return {
    statusFilter,
    setStatusFilter: handleStatusChange,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    searchQuery,
    setSearchQuery: handleSearchChange,
    perPage,
    currentPage: activePage,
    setActivePage,
    pagedData: documents,
    totalData,
    totalPages,
    handlePaginateChange,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    createDocument: (payload) => createMutation.mutateAsync(payload),
    isCreating: createMutation.isPending,
    deleteDocument: (documentId) => deleteMutation.mutateAsync(documentId),
    isDeleting: deleteMutation.isPending,
  }
}
