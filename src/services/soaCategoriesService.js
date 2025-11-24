import { apiClient } from "@/lib/api-client"

const normalizeCategoryPayload = (payload = {}) => ({
  code: payload.code?.trim(),
  name: payload.name?.trim(),
  description: payload.description?.trim() || null,
})

export const soaCategoriesService = {
  listCategories: (params = {}) =>
    apiClient("/soa-categories", {
      params,
    }),

  listCategoriesWithQuestions: (params = {}) =>
    apiClient("/soa-categories/with-questions", {
      params,
    }),

  getCategory: (categoryId, params = {}) =>
    apiClient(`/admin/soa-categories/${categoryId}`, {
      params,
    }),

  createCategory: (payload) =>
    apiClient("/admin/soa-categories", {
      method: "POST",
      data: normalizeCategoryPayload(payload),
    }),

  updateCategory: (categoryId, payload) =>
    apiClient(`/admin/soa-categories/${categoryId}`, {
      method: "PUT",
      data: normalizeCategoryPayload(payload),
    }),

  deleteCategory: (categoryId) =>
    apiClient(`/admin/soa-categories/${categoryId}`, {
      method: "DELETE",
    }),
}
