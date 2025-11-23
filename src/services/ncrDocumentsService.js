import { apiClient } from "@/lib/api-client"

const unwrapData = (response) => response?.data ?? response

const unwrapListPayload = (response) => ({
  data: response?.data?.data ?? response?.data ?? [],
  meta: response?.data?.meta ?? response?.meta ?? {},
  message: response?.message,
})

const normalizeDocumentPayload = (payload = {}) => ({
  title: payload.title?.trim(),
  description: payload.description?.trim() || null,
})

export const ncrDocumentsService = {
  listDocuments: async (params = {}) => {
    const response = await apiClient("/ncr-documents", { params })
    return unwrapListPayload(response)
  },

  getDocument: async (documentId) => {
    const response = await apiClient(`/ncr-documents/${documentId}`)
    return unwrapData(response)
  },

  createDocument: async (payload) => {
    const response = await apiClient("/admin/ncr-documents", {
      method: "POST",
      data: normalizeDocumentPayload(payload),
    })
    return unwrapData(response)
  },

  updateDocument: async (documentId, payload) => {
    const response = await apiClient(`/admin/ncr-documents/${documentId}`, {
      method: "PUT",
      data: normalizeDocumentPayload(payload),
    })
    return unwrapData(response)
  },

  deleteDocument: async (documentId) => {
    const response = await apiClient(`/admin/ncr-documents/${documentId}`, {
      method: "DELETE",
    })
    return unwrapData(response)
  },
}
