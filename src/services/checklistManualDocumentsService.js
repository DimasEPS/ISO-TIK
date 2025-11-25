import { apiClient } from "@/lib/api-client"

const DOCUMENT_STATUSES = ["draft", "in_progress", "reviewed", "approved"]
const TEAM_ROLES = ["lead", "member", "reviewer"]

const sanitizeString = (value) => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

const normalizeTeamMembers = (members) => {
  if (!Array.isArray(members)) return undefined

  const normalized = members
    .map((member) => {
      const userId = member?.user_id ?? member?.userId
      const role = member?.role

      if (!userId || typeof userId !== "string") return null
      if (!role || !TEAM_ROLES.includes(role)) return null

      return {
        user_id: userId,
        role,
      }
    })
    .filter(Boolean)

  return normalized.length ? normalized : []
}

const buildCreatePayload = (payload = {}) => ({
  title: sanitizeString(payload.title) ?? "",
  company_name: sanitizeString(payload.company_name) ?? null,
  location: sanitizeString(payload.location) ?? null,
  scope: sanitizeString(payload.scope) ?? null,
  status: DOCUMENT_STATUSES.includes(payload.status) ? payload.status : "draft",
  team_members: normalizeTeamMembers(payload.team_members),
})

const buildUpdatePayload = (payload = {}) => {
  const data = {}

  if (payload.title !== undefined) {
    data.title = sanitizeString(payload.title) ?? null
  }

  if (payload.company_name !== undefined) {
    data.company_name = sanitizeString(payload.company_name) ?? null
  }

  if (payload.location !== undefined) {
    data.location = sanitizeString(payload.location) ?? null
  }

  if (payload.scope !== undefined) {
    data.scope = sanitizeString(payload.scope) ?? null
  }

  if (payload.status !== undefined && DOCUMENT_STATUSES.includes(payload.status)) {
    data.status = payload.status
  }

  if (payload.team_members !== undefined) {
    data.team_members = normalizeTeamMembers(payload.team_members)
  }

  return data
}

const unwrapEntity = (response) => response?.data ?? response

const unwrapList = (response) => ({
  data: response?.data?.data ?? response?.data ?? [],
  meta: response?.data?.meta ?? response?.meta ?? {},
  message: response?.message,
})

export const checklistManualDocumentsService = {
  listDocuments: async (params = {}) => {
    const response = await apiClient("/checklist-manual/documents", {
      params,
    })
    return unwrapList(response)
  },

  getDocument: async (documentId, params = {}) => {
    const response = await apiClient(`/checklist-manual/documents/${documentId}`, {
      params,
    })
    return unwrapEntity(response)
  },

  getDocumentStructure: async (documentId, params = {}) => {
    const response = await apiClient(`/checklist-manual/documents/${documentId}/structure`, {
      params,
    })
    return unwrapEntity(response)
  },

  createDocument: async (payload) => {
    const response = await apiClient("/admin/checklist-manual/documents", {
      method: "POST",
      data: buildCreatePayload(payload),
    })
    return unwrapEntity(response)
  },

  updateDocument: async (documentId, payload) => {
    const response = await apiClient(`/admin/checklist-manual/documents/${documentId}`, {
      method: "PUT",
      data: buildUpdatePayload(payload),
    })
    return unwrapEntity(response)
  },

  deleteDocument: async (documentId) => {
    const response = await apiClient(`/admin/checklist-manual/documents/${documentId}`, {
      method: "DELETE",
    })
    return unwrapEntity(response)
  },
}

export const checklistManualDocumentStatuses = DOCUMENT_STATUSES
export const checklistManualTeamRoles = TEAM_ROLES
