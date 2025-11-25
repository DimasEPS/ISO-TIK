import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

/**
 * Hook untuk fetch excel checklists by checklist ID
 * Response structure: response.data (array)
 */
export function useExcelChecklistsByChecklistId(checklistId) {
  return useQuery({
    queryKey: ["excel-checklists-by-checklist", checklistId],
    queryFn: async () => {
      const response = await auditService.listExcelChecklists({
        checklist_id: checklistId,
        per_page: 100, // Get all
      });

      // Response structure: response.data (array of excel checklists)
      const excelChecklists = response.data || [];

      return excelChecklists.map((item) => ({
        id: item.id,
        checklistName: item.excel_checklist_name || item.checklist_name || "",
        jenisChecklist: item.jenis_checklist || "",
        description: item.description || "",
        checklistId: item.id_audit_checklists || checklistId,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    },
    enabled: !!checklistId,
  });
}

/**
 * Hook untuk fetch pertanyaan excel checklist dengan jawaban
 * Response structure: response.data.questions.data
 * Questions field: excel_answers (array)
 * Answer fields: objective_evidence, auditor_note, conformity
 */
export function useExcelChecklistQuestions(documentId, excelChecklistId) {
  return useQuery({
    queryKey: ["excel-questions", documentId, excelChecklistId],
    queryFn: async () => {
      const response = await auditService.getDocumentExcelQuestions(
        documentId,
        excelChecklistId
      );

      // Response structure: response.data.questions.data
      const questions = response.data.questions.data || [];

      return questions.map((item) => ({
        id: item.id,
        aspect: item.aspect || "",
        itemAudit: item.item_audit || "",
        // Excel answers array (similar to category questions)
        buktiObjektif: item.excel_answers?.[0]?.objective_evidence || "",
        catatanAuditor: item.excel_answers?.[0]?.auditor_note || "",
        kesesuaian: item.excel_answers?.[0]?.conformity || "", // yes/no enum
        // Answer metadata
        answerId: item.excel_answers?.[0]?.id || null,
        userId: item.excel_answers?.[0]?.id_users || null,
        createdAt: item.excel_answers?.[0]?.created_at || null,
        updatedAt: item.excel_answers?.[0]?.updated_at || null,
        // Review data (if reviewed)
        reviewerComment: item.excel_answers?.[0]?.reviewer_comment || null,
        reviewedAt: item.excel_answers?.[0]?.reviewed_at || null,
        isReview: item.excel_answers?.[0]?.is_review || false,
        // Status untuk badge
        status: item.excel_answers?.length > 0 ? "answered" : "not-answered",
      }));
    },
    enabled: !!documentId && !!excelChecklistId,
  });
}

/**
 * Hook untuk fetch metadata excel checklist
 * Response structure: response.data.excel_checklist
 */
export function useExcelChecklistMetadata(documentId, excelChecklistId) {
  return useQuery({
    queryKey: ["excel-checklist-metadata", documentId, excelChecklistId],
    queryFn: async () => {
      const response = await auditService.getDocumentExcelQuestions(
        documentId,
        excelChecklistId
      );

      // Return excel checklist metadata
      return {
        id: response.data.excel_checklist.id,
        checklistName:
          response.data.excel_checklist.checklist_name || "Excel Checklist",
        jenisChecklist: response.data.excel_checklist.jenis_checklist || "",
        createdAt: response.data.excel_checklist.created_at,
        updatedAt: response.data.excel_checklist.updated_at,
      };
    },
    enabled: !!documentId && !!excelChecklistId,
  });
}
