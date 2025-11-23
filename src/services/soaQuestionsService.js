import { apiClient } from "@/lib/api-client"

const normalizeQuestionPayload = (payload = {}) => ({
  category_id: payload.category_id,
  question_code: payload.question_code?.trim(),
  question_name: payload.question_name?.trim(),
  question: payload.question?.trim(),
})

export const soaQuestionsService = {
  listQuestions: (params = {}) =>
    apiClient("/soa-questions", {
      params,
    }),

  listCategoryReferences: (params = {}) =>
    apiClient("/soa-questions/refs/categories", {
      params,
    }),

  getQuestion: (questionId, params = {}) =>
    apiClient(`/soa-questions/${questionId}`, {
      params,
    }),

  createQuestion: (payload) =>
    apiClient("/admin/soa-questions", {
      method: "POST",
      data: normalizeQuestionPayload(payload),
    }),

  updateQuestion: (questionId, payload) =>
    apiClient(`/admin/soa-questions/${questionId}`, {
      method: "PUT",
      data: normalizeQuestionPayload(payload),
    }),

  deleteQuestion: (questionId) =>
    apiClient(`/admin/soa-questions/${questionId}`, {
      method: "DELETE",
    }),
}
