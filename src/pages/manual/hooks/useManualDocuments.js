import { useCallback, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { checklistManualDocumentsService } from "@/services/checklistManualDocumentsService"
import { resolveUserDisplayName } from "@/lib/user-display"

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

const TEAM_ROLE_API_TO_DISPLAY = {
  lead: "Lead Auditor",
  member: "Member Auditor",
  reviewer: "Reviewer",
}

const TEAM_ROLE_DISPLAY_TO_API = {
  "Lead Auditor": "lead",
  "Member Auditor": "member",
  Reviewer: "reviewer",
}

const safeUuid = (seed) => {
  if (seed?.id) return seed.id
  if (seed?.user_id) return seed.user_id
  if (seed?.userId) return seed.userId
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `temp-${Math.random().toString(36).slice(2, 11)}`
}

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

const resolveTeamMemberUserId = (member) => {
  const source = member?.user ?? member
  const candidates = [
    member?.user_id,
    member?.userId,
    source?.id,
    source?.uuid,
    source?.user_id,
    source?.userId,
  ]

  const value = candidates.find((candidate) => {
    if (typeof candidate === "string") return candidate.trim().length > 0
    if (typeof candidate === "number") return !Number.isNaN(candidate)
    return false
  })

  if (value === undefined || value === null) {
    return null
  }

  return String(value).trim()
}

const mapTeamForForm = (team = []) =>
  team.map((member) => {
    const source = member?.user ?? member
    const roleDisplay = TEAM_ROLE_API_TO_DISPLAY[member?.role] ?? member?.role ?? "-"
    const nameFallback = source?.username ?? source?.email ?? member?.username ?? member?.email ?? "-"
    const displayName = resolveUserDisplayName(member, nameFallback)

    const userId = resolveTeamMemberUserId(member)
    const name = member?.name ?? displayName

    return {
      id: safeUuid(member),
      userId,
      name,
      displayName,
      username: source?.username ?? member?.username ?? null,
      email: source?.email ?? member?.email ?? null,
      role: roleDisplay,
      roleRaw: member?.role ?? null,
      dateAdded: formatDate(member?.assigned_at),
    }
  })

const buildTeamMembersPayload = (team = []) =>
  team
    .map((member) => {
      const userId = member?.userId ?? member?.user_id
      const roleKey = member?.role ?? member?.roleRaw
      const apiRole = TEAM_ROLE_DISPLAY_TO_API[roleKey] ?? member?.roleRaw
      if (!userId || !apiRole) return null
      return {
        user_id: String(userId),
        role: apiRole,
      }
    })
    .filter(Boolean)

const toApiStatus = (status) => {
  if (!status) return "draft"
  if (STATUS_DISPLAY_TO_API[status] === undefined && status !== "Semua Status") {
    return typeof status === "string" ? status : "draft"
  }
  return STATUS_DISPLAY_TO_API[status] ?? "draft"
}

const mapFormToApiPayload = (formValues = {}) => ({
  title: formValues.judul,
  company_name: formValues.namaPerusahaan,
  location: formValues.lokasi,
  scope: formValues.ruangLingkup,
  status: toApiStatus(formValues.status ?? "Draft"),
  team_members: buildTeamMembersPayload(formValues.team),
})

const mapDocumentRow = (item) => {
  const statusRaw = item?.status ?? "draft"
  const statusDisplay = API_STATUS_TO_DISPLAY[statusRaw] ?? statusRaw ?? "Draft"
  const teamForForm = mapTeamForForm(item?.team ?? [])
  const leadAuditors = teamForForm
    .filter((member) => member.role === "Lead Auditor")
    .map((member) => member.displayName ?? member.name)
  const memberAuditors = teamForForm
    .filter((member) => member.role === "Member Auditor")
    .map((member) => member.displayName ?? member.name)
  const reviewerAuditors = teamForForm
    .filter((member) => member.role === "Reviewer")
    .map((member) => member.displayName ?? member.name)

  return {
    id: item?.id,
    judul: item?.title ?? "-",
    namaPerusahaan: item?.company_name ?? "-",
    lokasi: item?.location ?? "-",
    ruangLingkup: item?.scope ?? "-",
    ketuaAuditor: leadAuditors[0] ?? "-",
    status: statusDisplay,
    statusRaw,
    tanggalDibuat: formatDate(item?.created_at),
    createdAtRaw: item?.created_at ?? null,
    updatedAtRaw: item?.updated_at ?? null,
    leadAuditor: leadAuditors,
    memberAuditor: memberAuditors,
    reviewerAuditor: reviewerAuditors,
    team: teamForForm,
    raw: item,
    formValues: {
      judul: item?.title ?? "",
      namaPerusahaan: item?.company_name ?? "",
      lokasi: item?.location ?? "",
      ruangLingkup: item?.scope ?? "",
      status: statusDisplay,
      team: teamForForm,
    },
  }
}

export function useManualDocuments() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilterState] = useState("Semua Status")
  const [searchQuery, setSearchQueryState] = useState("")
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [perPage, setPerPage] = useState(10)
  const [activePage, setActivePage] = useState(1)

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
    queryKey: ["checklist-manual-documents", queryParams],
    queryFn: () => checklistManualDocumentsService.listDocuments(queryParams),
    keepPreviousData: true,
  })

  const documents = useMemo(
    () => (listQuery.data?.data ?? []).map(mapDocumentRow),
    [listQuery.data],
  )

  const totalPages = listQuery.data?.meta?.last_page ?? 1
  const totalData = listQuery.data?.meta?.total ?? 0

  const handleStatusFilter = useCallback((value) => {
    setStatusFilterState(value)
    setActivePage(1)
  }, [])

  const handleSearchQuery = useCallback((value) => {
    setSearchQueryState(value)
    setActivePage(1)
  }, [])

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value))
    setActivePage(1)
  }, [])

  const createMutation = useMutation({
    mutationFn: (formValues) =>
      checklistManualDocumentsService.createDocument(mapFormToApiPayload(formValues)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-manual-documents"] })
      setActivePage(1)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ documentId, formValues }) =>
      checklistManualDocumentsService.updateDocument(documentId, mapFormToApiPayload(formValues)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-manual-documents"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (documentId) => checklistManualDocumentsService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-manual-documents"] })
    },
  })

  return {
    documents,
    statusFilter,
    setStatusFilter: handleStatusFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    searchQuery,
    setSearchQuery: handleSearchQuery,
    perPage,
    currentPage: activePage,
    setActivePage,
    totalPages,
    totalData,
    handlePaginateChange,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    createDocument: (formValues) => createMutation.mutateAsync(formValues),
    isCreating: createMutation.isPending,
    updateDocument: (documentId, formValues) =>
      updateMutation.mutateAsync({ documentId, formValues }),
    isUpdating: updateMutation.isPending,
    deleteDocument: (documentId) => deleteMutation.mutateAsync(documentId),
    isDeleting: deleteMutation.isPending,
    refetchDocuments: listQuery.refetch,
  }
}