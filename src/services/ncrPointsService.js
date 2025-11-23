import { apiClient } from "@/lib/api-client"

const unwrapData = (response) => response?.data ?? response

const cleanUndefined = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )

const POINT_TYPE_MAP = {
  finding: "uraian",
  analysis: "analisa",
  correction: "koreksi",
  corrective_action: "tindakan",
  uraian: "uraian",
  analisa: "analisa",
  koreksi: "koreksi",
  tindakan: "tindakan",
}

const normalizePointType = (value) => {
  if (!value) return undefined
  const normalized = String(value).toLowerCase()
  return POINT_TYPE_MAP[normalized] ?? value
}

const normalizePointPayload = (payload = {}) =>
  cleanUndefined({
    ncr_case_id: payload.caseId ?? payload.ncr_case_id,
    point_type: normalizePointType(payload.pointType ?? payload.point_type),
    description: payload.description,
    assigned_to: payload.assignedTo ?? payload.assigned_to,
    id_auditor: payload.auditorId ?? payload.id_auditor,
    id_auditee: payload.auditeeId ?? payload.id_auditee,
  })

export const ncrPointsService = {
  listPoints: async (caseId, params = {}) => {
    const response = await apiClient(`/ncr-cases/${caseId}/points`, {
      params: cleanUndefined({
        point_type: normalizePointType(params.point_type ?? params.pointType),
        status: params.status,
      }),
    })

    return unwrapData(response)
  },

  createPoint: async (payload) => {
    const response = await apiClient("/ncr-points", {
      method: "POST",
      data: normalizePointPayload(payload),
    })

    return unwrapData(response)
  },

  updatePoint: async (pointId, payload) => {
    const response = await apiClient(`/ncr-points/${pointId}`, {
      method: "PUT",
      data: normalizePointPayload(payload),
    })

    return unwrapData(response)
  },

  deletePoint: async (pointId) => {
    const response = await apiClient(`/ncr-points/${pointId}`, {
      method: "DELETE",
    })

    return unwrapData(response)
  },
}
