import { apiClient } from "@/lib/api-client";

/**
 * Audit Service
 * Service untuk mengelola audit documents, checklists, aspects, categories, questions, dan answers
 */

export const auditService = {
  // ========== AUDIT DOCUMENTS ==========
  /**
   * List audit documents dengan pagination, search, dan filter
   * @param {Object} params - { search_title, search_location, status, page, per_page }
   */
  listDocuments: (params = {}) =>
    apiClient("/audit/documents", {
      params,
    }),

  /**
   * Get detail audit document by ID
   * @param {string} documentId - UUID dokumen audit
   */
  getDocument: (documentId, params = {}) =>
    apiClient(`/audit/documents/${documentId}`, {
      params,
    }),

  /**
   * Get checklists untuk dokumen audit tertentu
   * @param {string} documentId - UUID dokumen audit
   * @param {Object} params - { search_name, page, per_page }
   */
  getDocumentChecklists: (documentId, params = {}) =>
    apiClient(`/audit/documents/${documentId}/checklists`, {
      params,
    }),

  /**
   * Get questions with answers untuk kategori tertentu di dokumen
   * @param {string} documentId - UUID dokumen audit
   * @param {string} categoryId - UUID kategori
   * @param {Object} params - { search_question_text, filter_answer_status, questions_page, questions_per_page }
   */
  getDocumentCategoryQuestions: (documentId, categoryId, params = {}) =>
    apiClient(
      `/audit/documents/${documentId}/categories/${categoryId}/questions-with-answers`,
      {
        params,
      }
    ),

  /**
   * Get excel checklist questions with answers untuk dokumen
   * @param {string} documentId - UUID dokumen audit
   * @param {string} excelChecklistId - UUID excel checklist
   * @param {Object} params - { search_aspect, search_item_audit, questions_page, questions_per_page }
   */
  getDocumentExcelQuestions: (documentId, excelChecklistId, params = {}) =>
    apiClient(
      `/audit/documents/${documentId}/excel-checklists/${excelChecklistId}/questions-with-answers`,
      {
        params,
      }
    ),

  /**
   * Create new audit document (admin only)
   * @param {Object} payload - { title, audit_period, location, lead_auditor, auditor_name, revision, status }
   */
  createDocument: (payload) =>
    apiClient("/admin/audit/documents", {
      method: "POST",
      data: payload,
    }),

  /**
   * Update audit document (admin/reviewer only)
   * @param {string} documentId - UUID dokumen audit
   * @param {Object} payload - { title, audit_period, location, lead_auditor, auditor_name, revision, status }
   */
  updateDocument: (documentId, payload) =>
    apiClient(`/admin/audit/documents/${documentId}`, {
      method: "PUT",
      data: payload,
    }),

  /**
   * Delete audit document (admin only)
   * @param {string} documentId - UUID dokumen audit
   */
  deleteDocument: (documentId) =>
    apiClient(`/admin/audit/documents/${documentId}`, {
      method: "DELETE",
    }),

  // ========== AUDIT CHECKLISTS ==========
  /**
   * List audit checklists dengan pagination dan search
   * @param {Object} params - { search_name, page, per_page }
   */
  listChecklists: (params = {}) =>
    apiClient("/audit/checklists", {
      params,
    }),

  /**
   * Get detail audit checklist by ID
   * @param {string} checklistId - UUID checklist
   */
  getChecklist: (checklistId, params = {}) =>
    apiClient(`/audit/checklists/${checklistId}`, {
      params,
    }),

  /**
   * Create new audit checklist (admin only)
   * @param {Object} payload - { checklist_name, description }
   */
  createChecklist: (payload) =>
    apiClient("/admin/audit/checklists", {
      method: "POST",
      data: payload,
    }),

  /**
   * Update audit checklist (admin only)
   * @param {string} checklistId - UUID checklist
   * @param {Object} payload - { checklist_name, description }
   */
  updateChecklist: (checklistId, payload) =>
    apiClient(`/admin/audit/checklists/${checklistId}`, {
      method: "PUT",
      data: payload,
    }),

  /**
   * Delete audit checklist (admin only)
   * @param {string} checklistId - UUID checklist
   */
  deleteChecklist: (checklistId) =>
    apiClient(`/admin/audit/checklists/${checklistId}`, {
      method: "DELETE",
    }),

  // ========== AUDIT ASPECTS ==========
  /**
   * List audit aspects dengan pagination, search, dan filter
   * @param {Object} params - { search_name, checklist_id, page, per_page }
   */
  listAspects: (params = {}) =>
    apiClient("/audit/aspects", {
      params,
    }),

  /**
   * Get detail audit aspect by ID
   * @param {string} aspectId - UUID aspect
   */
  getAspect: (aspectId, params = {}) =>
    apiClient(`/audit/aspects/${aspectId}`, {
      params,
    }),

  /**
   * Get categories untuk aspect tertentu
   * @param {string} aspectId - UUID aspect
   * @param {Object} params - { search_category_name, categories_page, categories_per_page }
   */
  getAspectCategories: (aspectId, params = {}) =>
    apiClient(`/audit/aspects/${aspectId}/categories`, {
      params,
    }),

  /**
   * Create new audit aspect
   * @param {Object} data - { aspect_name, description, id_audit_checklists }
   */
  createAspect: (data) =>
    apiClient("/admin/audit/aspects", {
      method: "POST",
      data: data,
    }),

  /**
   * Update audit aspect
   * @param {string} aspectId - UUID aspect
   * @param {Object} data - { aspect_name, description, id_audit_checklists }
   */
  updateAspect: (aspectId, data) =>
    apiClient(`/admin/audit/aspects/${aspectId}`, {
      method: "PUT",
      data: data,
    }),

  /**
   * Delete audit aspect
   * @param {string} aspectId - UUID aspect
   */
  deleteAspect: (aspectId) =>
    apiClient(`/admin/audit/aspects/${aspectId}`, {
      method: "DELETE",
    }),

  // ========== AUDIT CATEGORIES ==========
  /**
   * Get detail audit category by ID
   * @param {string} categoryId - UUID category
   */
  getCategory: (categoryId, params = {}) =>
    apiClient(`/audit/categories/${categoryId}`, {
      params,
    }),

  /**
   * Get questions untuk kategori tertentu
   * @param {string} categoryId - UUID category
   * @param {Object} params - { search_question_text, questions_page, questions_per_page }
   */
  getCategoryQuestions: (categoryId, params = {}) =>
    apiClient(`/audit/categories/${categoryId}/questions`, {
      params,
    }),

  /**
   * Create new audit category (admin only)
   * @param {Object} data - { categories_name, id_audit_aspects }
   */
  createCategory: (data) =>
    apiClient("/admin/audit/categories", {
      method: "POST",
      data: data,
    }),

  /**
   * Update audit category (admin only)
   * @param {string} categoryId - UUID category
   * @param {Object} data - { categories_name, id_audit_aspects }
   */
  updateCategory: (categoryId, data) =>
    apiClient(`/admin/audit/categories/${categoryId}`, {
      method: "PUT",
      data: data,
    }),

  /**
   * Delete audit category (admin only)
   * @param {string} categoryId - UUID category
   */
  deleteCategory: (categoryId) =>
    apiClient(`/admin/audit/categories/${categoryId}`, {
      method: "DELETE",
    }),

  // ========== AUDIT QUESTIONS ==========
  /**
   * Get detail audit question by ID
   * @param {string} questionId - UUID question
   */
  getQuestion: (questionId, params = {}) =>
    apiClient(`/audit/questions/${questionId}`, {
      params,
    }),

  /**
   * Create new audit question (admin only)
   * @param {Object} data - { question_text, id_audit_categories }
   */
  createQuestion: (data) =>
    apiClient("/admin/audit/questions", {
      method: "POST",
      data: data,
    }),

  /**
   * Update audit question (admin only)
   * @param {string} questionId - UUID question
   * @param {Object} data - { question_text, id_audit_categories }
   */
  updateQuestion: (questionId, data) =>
    apiClient(`/admin/audit/questions/${questionId}`, {
      method: "PUT",
      data: data,
    }),

  /**
   * Delete audit question (admin only)
   * @param {string} questionId - UUID question
   */
  deleteQuestion: (questionId) =>
    apiClient(`/admin/audit/questions/${questionId}`, {
      method: "DELETE",
    }),

  // ========== AUDIT EXCEL CHECKLISTS ==========
  /**
   * List audit excel checklists dengan pagination, search, dan filter
   * @param {Object} params - { search_name, checklist_id, page, per_page }
   */
  listExcelChecklists: (params = {}) =>
    apiClient("/audit/excel-checklists", {
      params,
    }),

  /**
   * Get detail audit excel checklist by ID
   * @param {string} excelChecklistId - UUID excel checklist
   */
  getExcelChecklist: (excelChecklistId, params = {}) =>
    apiClient(`/audit/excel-checklists/${excelChecklistId}`, {
      params,
    }),

  /**
   * Get questions untuk excel checklist tertentu
   * @param {string} excelChecklistId - UUID excel checklist
   * @param {Object} params - { search_aspect, search_item_audit, page, per_page }
   */
  getExcelChecklistQuestions: (excelChecklistId, params = {}) =>
    apiClient(`/audit/excel-checklists/${excelChecklistId}/questions`, {
      params,
    }),

  /**
   * Create new audit excel checklist
   * @param {Object} data - { excel_checklist_name, description, id_audit_checklists }
   */
  createExcelChecklist: (data) =>
    apiClient("/admin/audit/excel-checklists", {
      method: "POST",
      data: data,
    }),

  /**
   * Update audit excel checklist
   * @param {string} excelChecklistId - UUID excel checklist
   * @param {Object} data - { excel_checklist_name, description, id_audit_checklists }
   */
  updateExcelChecklist: (excelChecklistId, data) =>
    apiClient(`/admin/audit/excel-checklists/${excelChecklistId}`, {
      method: "PUT",
      data: data,
    }),

  /**
   * Delete audit excel checklist
   * @param {string} excelChecklistId - UUID excel checklist
   */
  deleteExcelChecklist: (excelChecklistId) =>
    apiClient(`/admin/audit/excel-checklists/${excelChecklistId}`, {
      method: "DELETE",
    }),

  // ========== AUDIT EXCEL QUESTIONS ==========
  /**
   * Get detail audit excel question by ID
   * @param {string} questionId - UUID excel question
   */
  getExcelQuestion: (questionId, params = {}) =>
    apiClient(`/audit/excel-questions/${questionId}`, {
      params,
    }),

  /**
   * Create new audit excel question (admin only)
   * @param {Object} data - { aspect, item_audit, id_audit_excel_checklists }
   */
  createExcelQuestion: (data) =>
    apiClient("/admin/audit/excel-questions", {
      method: "POST",
      data: data,
    }),

  /**
   * Update audit excel question (admin only)
   * @param {string} questionId - UUID excel question
   * @param {Object} data - { aspect, item_audit, id_audit_excel_checklists }
   */
  updateExcelQuestion: (questionId, data) =>
    apiClient(`/admin/audit/excel-questions/${questionId}`, {
      method: "PUT",
      data: data,
    }),

  /**
   * Delete audit excel question (admin only)
   * @param {string} questionId - UUID excel question
   */
  deleteExcelQuestion: (questionId) =>
    apiClient(`/admin/audit/excel-questions/${questionId}`, {
      method: "DELETE",
    }),

  // ========== AUDIT ANSWERS ==========
  /**
   * Get detail audit answer by ID
   * @param {string} answerId - UUID answer
   */
  getAnswer: (answerId, params = {}) =>
    apiClient(`/audit/answers/${answerId}`, {
      params,
    }),

  /**
   * Create new audit answer (admin/auditor only)
   * @param {Object} payload - { id_audit_questions, id_audit_documents, answer_text, observation, verification, record_doc }
   */
  createAnswer: (payload) =>
    apiClient("/audit/answers", {
      method: "POST",
      data: payload,
    }),

  /**
   * Update audit answer (admin/auditor only)
   * @param {string} answerId - UUID answer
   * @param {Object} payload - { answer_text, observation, verification, record_doc }
   */
  updateAnswer: (answerId, payload) =>
    apiClient(`/audit/answers/${answerId}`, {
      method: "PUT",
      data: payload,
    }),

  /**
   * Review audit answer (admin/reviewer only)
   * @param {string} answerId - UUID answer
   * @param {Object} payload - { reviewer_comment, is_review, reviewer_id }
   */
  reviewAnswer: (answerId, payload) =>
    apiClient(`/audit/answers/${answerId}/review`, {
      method: "POST",
      data: payload,
    }),

  // ========== AUDIT EXCEL ANSWERS ==========
  /**
   * Get detail audit excel answer by ID
   * @param {string} answerId - UUID excel answer
   */
  getExcelAnswer: (answerId, params = {}) =>
    apiClient(`/audit/excel-answers/${answerId}`, {
      params,
    }),

  /**
   * Create new audit excel answer (admin/auditor only)
   * @param {Object} payload - { id_audit_excel_questions, id_audit_documents, answer_text, observation, verification, record_doc }
   */
  createExcelAnswer: (payload) =>
    apiClient("/audit/excel-answers", {
      method: "POST",
      data: payload,
    }),

  /**
   * Update audit excel answer (admin/auditor only)
   * @param {string} answerId - UUID excel answer
   * @param {Object} payload - { answer_text, observation, verification, record_doc }
   */
  updateExcelAnswer: (answerId, payload) =>
    apiClient(`/audit/excel-answers/${answerId}`, {
      method: "PUT",
      data: payload,
    }),

  /**
   * Review audit excel answer (admin/reviewer only)
   * @param {string} answerId - UUID excel answer
   * @param {Object} payload - { reviewer_comment, is_review, reviewer_id }
   */
  reviewExcelAnswer: (answerId, payload) =>
    apiClient(`/audit/excel-answers/${answerId}/review`, {
      method: "POST",
      data: payload,
    }),
};
