import { apiClient } from "@/lib/api-client"

const unwrapData = (response) => response?.data ?? response

const cleanUndefined = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )

const normalizeCasePayload = (payload = {}) =>
  cleanUndefined({
    ncr_number: payload.ncrNumber ?? payload.ncr_number,
    ncr_date: payload.ncrDate ?? payload.ncr_date,
    location: payload.location,
    references_standard: payload.referencesStandard ?? payload.references_standard,
    clause: payload.clause,
    auditor_name: payload.auditorName ?? payload.auditor_name,
    finding_category: payload.findingCategory ?? payload.finding_category ?? "minor",
    completion_date: payload.completionDate ?? payload.completion_date,
    verifier_name: payload.verifierName ?? payload.verifier_name,
    verification_date: payload.verificationDate ?? payload.verification_date,
    verification_notes: payload.verificationNotes ?? payload.verification_notes,
    auditee_name: payload.auditeeName ?? payload.auditee_name,
    target_date: payload.targetDate ?? payload.target_date,
    status: payload.status,
    id_ncr_documents: payload.documentId ?? payload.id_ncr_documents,
    id_auditor: payload.auditorId ?? payload.id_auditor,
    id_auditee: payload.auditeeId ?? payload.id_auditee,
  })

export const ncrCasesService = {
  listCases: async (documentId, params = {}) => {
    const response = await apiClient(`/ncr-documents/${documentId}/cases`, {
      params: cleanUndefined({
        per_page: params.per_page ?? params.perPage,
        page: params.page,
        ncr_number: params.ncr_number ?? params.ncrNumber,
        status: params.status,
      }),
    })

    return unwrapData(response)
  },

  getCase: async (caseId) => {
    const response = await apiClient(`/ncr-cases/${caseId}`)
    return unwrapData(response)
  },

  createCase: async (payload) => {
    const response = await apiClient("/admin/ncr-cases", {
      method: "POST",
      data: normalizeCasePayload(payload),
    })
    return unwrapData(response)
  },

  updateCase: async (caseId, payload) => {
    const response = await apiClient(`/admin/ncr-cases/${caseId}`, {
      method: "PUT",
      data: normalizeCasePayload(payload),
    })
    return unwrapData(response)
  },

  deleteCase: async (caseId) => {
    const response = await apiClient(`/admin/ncr-cases/${caseId}`, {
      method: "DELETE",
    })
    return unwrapData(response)
  },

  getCaseDocuments: async (caseId) => {
    const response = await apiClient(`/ncr-cases/${caseId}/documents`)
    return unwrapData(response)
  },
}
