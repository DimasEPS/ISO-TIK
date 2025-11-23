import { apiClient } from "@/lib/api-client"

const normalizeString = (value) => {
  if (value === undefined || value === null) return undefined
  const trimmed = `${value}`.trim()
  return trimmed.length > 0 ? trimmed : ""
}

const buildFormData = (payload = {}, { requireFile = false } = {}) => {
  const formData = new FormData()

  const code = normalizeString(payload.document_code)
  const name = normalizeString(payload.document_name)
  const description = normalizeString(payload.description)

  if (code !== undefined) formData.append("document_code", code)
  if (name !== undefined) formData.append("document_name", name)
  if (description !== undefined) formData.append("description", description)

  const file = payload.file
  if (file) {
    formData.append("file", file)
  } else if (requireFile) {
    throw new Error("File dokumen wajib diunggah")
  }

  return formData
}

export const documentsService = {
  listDocuments: (params = {}) =>
    apiClient("/admin/documents", {
      params,
    }),

  getDocument: (documentId, params = {}) =>
    apiClient(`/admin/documents/${documentId}`, {
      params,
    }),

  createDocument: (payload) =>
    apiClient("/admin/documents", {
      method: "POST",
      data: buildFormData(payload, { requireFile: true }),
    }),

  updateDocument: (documentId, payload) =>
    apiClient(`/admin/documents/${documentId}`, {
      method: "POST",
      data: (() => {
        const formData = buildFormData(payload, { requireFile: false })
        formData.append("_method", "PUT")
        return formData
      })(),
    }),

  deleteDocument: (documentId) =>
    apiClient(`/admin/documents/${documentId}`, {
      method: "DELETE",
    }),
}
