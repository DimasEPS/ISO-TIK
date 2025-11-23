import { apiClient } from "@/lib/api-client"

const normalizeDocumentPayload = (payload = {}) => ({
  document_number: payload.document_number?.trim(),
  title: payload.title?.trim(),
  publish_date: payload.publish_date,
  revision: payload.revision?.trim(),
  classification: payload.classification?.trim() || null,
  compiler_name: payload.compiler_name?.trim() || null,
  iso_chairman_name: payload.iso_chairman_name?.trim() || null,
  director_name: payload.director_name?.trim() || null,
  status: payload.status,
})

export const soaDocumentsService = {
  listDocuments: (params = {}) =>
    apiClient("/soa-documents", {
      params,
    }),

  createDocument: (payload) =>
    apiClient("/admin/soa-documents", {
      method: "POST",
      data: normalizeDocumentPayload(payload),
    }),

  updateDocument: (documentId, payload) =>
    apiClient(`/admin/soa-documents/${documentId}`, {
      method: "PUT",
      data: normalizeDocumentPayload(payload),
    }),

  deleteDocument: (documentId) =>
    apiClient(`/admin/soa-documents/${documentId}`, {
      method: "DELETE",
    }),
}
