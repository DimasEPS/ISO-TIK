import { apiClient } from "@/lib/api-client"

const normalizeAnswerPayload = (payload = {}) => ({
  current_control: payload.current_control,
  pl: payload.pl ?? null,
  kk: payload.kk ?? null,
  pk_pb: payload.pk_pb ?? null,
  hpr: payload.hpr ?? null,
  justification: payload.justification?.trim() ?? null,
  implementation_summary: payload.implementation_summary?.trim() ?? null,
  id_soa_questions: payload.id_soa_questions ?? null,
  id_soa_documents: payload.id_soa_documents ?? null,
  document_ids: Array.isArray(payload.document_ids) ? payload.document_ids.filter(Boolean) : [],
})

export const soaAnswersService = {
  listAnswers: (params = {}) =>
    apiClient("/soa-answers", {
      params,
    }),

  getAnswer: (answerId, params = {}) =>
    apiClient(`/soa-answers/${answerId}`, {
      params,
    }),

  createAnswer: (payload) =>
    apiClient("/admin/soa-answers", {
      method: "POST",
      data: normalizeAnswerPayload(payload),
    }),

  updateAnswer: (answerId, payload) =>
    apiClient(`/admin/soa-answers/${answerId}`, {
      method: "PUT",
      data: normalizeAnswerPayload(payload),
    }),

  deleteAnswer: (answerId) =>
    apiClient(`/admin/soa-answers/${answerId}`, {
      method: "DELETE",
    }),

  reviewAnswer: (answerId, payload) =>
    apiClient(`/admin/soa-answers/${answerId}/review`, {
      method: "PUT",
      data: {
        reviewer_comment: payload?.reviewer_comment ?? null,
      },
    }),
}
