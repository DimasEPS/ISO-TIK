import { useCallback, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { documentsService } from "@/services/documentsService"

const formatUploadedAt = (timestamp) => {
  if (!timestamp) return "-"

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const buildSafeFileName = (baseName = "dokumen", extension = "") => {
  const sanitized =
    baseName
      ?.toString()
      ?.trim()
      ?.replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "-")
      ?.replace(/\s+/g, "-")
      ?.replace(/-+/g, "-")
      ?.replace(/^-|-$/g, "")
      ?.toLowerCase() || "dokumen"

  const normalizedExtension = extension
    ? extension.startsWith(".")
      ? extension
      : `.${extension}`
    : ""

  return `${sanitized}${normalizedExtension}`
}

const resolveFileName = (fileUrl, fallbackName, extension) => {
  if (fileUrl) {
    const segments = fileUrl.split(/[\\/]+/).filter(Boolean)
    const candidate = segments[segments.length - 1]
    if (candidate) {
      try {
        return decodeURIComponent(candidate)
      } catch (error) {
        console.warn("Failed to decode file name", error)
        return candidate
      }
    }
  }

  return buildSafeFileName(fallbackName || "dokumen", extension)
}

export const mapDocumentSummary = (item = {}) => {
  const uploadedAt = item.uploaded_at ?? item.uploadedAt ?? null

  return {
    id: item.id,
    noDoc: item.document_code ?? item.documentCode ?? "-",
    judul: item.document_name ?? item.documentName ?? "-",
    deskripsi: item.description ?? "-",
    tanggalTerbit: formatUploadedAt(uploadedAt),
    uploadedAt,
  }
}

export const mapDocumentDetail = (item = {}) => {
  const summary = mapDocumentSummary(item)
  const fileUrl = item.file_url ?? item.fileUrl ?? ""
  const fileExtension = item.file_extension ?? item.fileExtension ?? ""
  const mimeType = item.mime_type ?? item.mimeType ?? ""
  const uploader = item.uploader ?? {}

  return {
    ...summary,
    fileUrl,
    fileName: resolveFileName(fileUrl, summary.judul || summary.noDoc, fileExtension),
    fileExtension,
    mimeType,
    penyusun: uploader.username || uploader.email || "-",
  }
}

export function useDocuments() {
  const [searchQuery, setSearchQueryState] = useState("")
  const [perPage, setPerPage] = useState(10)
  const [activePage, setActivePage] = useState(1)
  const queryClient = useQueryClient()

  const queryParams = useMemo(
    () => ({
      search: searchQuery.trim() || undefined,
      page: activePage,
      per_page: perPage,
    }),
    [searchQuery, activePage, perPage],
  )

  const listQuery = useQuery({
    queryKey: ["documents", queryParams],
    queryFn: () => documentsService.listDocuments(queryParams),
    keepPreviousData: true,
  })

  const documents = useMemo(
    () => (listQuery.data?.data ?? []).map(mapDocumentSummary),
    [listQuery.data],
  )

  const totalPages = listQuery.data?.meta?.last_page ?? 1
  const totalData = listQuery.data?.meta?.total ?? documents.length
  const currentPage = listQuery.data?.meta?.current_page ?? activePage

  const handleSearchQueryChange = useCallback((value) => {
    setSearchQueryState(value)
    setActivePage(1)
  }, [])

  const handlePaginateChange = useCallback((value) => {
    const numeric = Number(value)
    setPerPage(Number.isNaN(numeric) ? 10 : numeric)
    setActivePage(1)
  }, [])

  const createMutation = useMutation({
    mutationFn: (payload) => documentsService.createDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ documentId, payload }) =>
      documentsService.updateDocument(documentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (documentId) => documentsService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })

  const fetchDocumentDetail = useCallback(
    (documentId) => {
      if (!documentId) {
        return Promise.reject(new Error("Dokumen tidak valid"))
      }

      return queryClient.fetchQuery({
        queryKey: ["documents", "detail", documentId],
        queryFn: () => documentsService.getDocument(documentId),
      })
    },
    [queryClient],
  )

  return {
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    perPage,
    currentPage,
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
    isCreatingDocument: createMutation.isPending,
    updateDocument: (documentId, payload) =>
      updateMutation.mutateAsync({ documentId, payload }),
    isUpdatingDocument: updateMutation.isPending,
    deleteDocument: (documentId) => deleteMutation.mutateAsync(documentId),
    isDeletingDocument: deleteMutation.isPending,
    fetchDocumentDetail,
    refetchDocuments: () => listQuery.refetch(),
  }
}
