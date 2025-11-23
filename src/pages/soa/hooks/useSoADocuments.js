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

const mapDocumentRow = (item) => {
  const publishDateIso = item.publish_date ?? ""
  const publishDateInput = publishDateIso ? publishDateIso.split("T")[0] : ""
  const createdAtIso = item.created_at ?? ""
  const revisionValue = item.revision ?? ""
  const classificationValue = item.classification ?? ""
  const compilerName = item.compiler_name ?? ""
  const isoChairmanName = item.iso_chairman_name ?? ""
  const directorName = item.director_name ?? ""
  const statusValue = item.status

  return {
    id: item.id ?? item.document_number,
    noDoc: item.document_number,
    judul: item.title,
    tanggalTerbit: publishDateIso || "-",
    tanggalTerbitInput: publishDateInput,
    tanggalDibuat: createdAtIso || "-",
    penyusun: compilerName || "-",
    ketuaIso: isoChairmanName || "-",
    direktur: directorName || "-",
    revisi: revisionValue || "-",
    klasifikasi: classificationValue || "-",
    statusRaw: statusValue,
    status: API_STATUS_TO_DISPLAY[statusValue] ?? statusValue ?? "-",
    editable: {
      document_number: item.document_number ?? "",
      publish_date: publishDateInput,
      title: item.title ?? "",
      revision: revisionValue,
      classification: classificationValue,
      compiler_name: compilerName,
      iso_chairman_name: isoChairmanName,
      director_name: directorName,
      status: statusValue ?? "draft",
    },
  }
}

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

  const updateMutation = useMutation({
    mutationFn: ({ documentId, payload }) =>
      soaDocumentsService.updateDocument(documentId, payload),
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
    updateDocument: (documentId, payload) =>
      updateMutation.mutateAsync({ documentId, payload }),
    isUpdating: updateMutation.isPending,
    deleteDocument: (documentId) => deleteMutation.mutateAsync(documentId),
    isDeleting: deleteMutation.isPending,
  }
}
