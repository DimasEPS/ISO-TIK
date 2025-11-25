import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

/**
 * Custom hook untuk mengelola document checklists dengan React Query
 * @param {string} documentId - UUID dokumen audit
 * @param {Object} options - Query options
 */
export const useDocumentChecklists = (documentId, options = {}) => {
  const {
    data: checklistsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["documentChecklists", documentId],
    queryFn: async () => {
      const response = await auditService.getDocumentChecklists(documentId);

      // Backend response structure: response.data.checklists.data
      return response.data.checklists?.data || [];
    },
    enabled: !!documentId,
    staleTime: 30000, // 30 seconds for checklist list
    refetchOnMount: true,
    ...options,
  });

  // Transform data untuk frontend
  const checklists = Array.isArray(checklistsData)
    ? checklistsData.map((checklist) => ({
        id: checklist.id,
        title: checklist.checklist_name || checklist.name,
        description: checklist.description || "",
        // Counts dari backend - use backend field names directly
        aspects_count: checklist.aspects_count || 0,
        categories_count: checklist.categories_count || 0,
        questions_count: checklist.questions_count || 0,
        excel_checklists_count: checklist.excel_checklists_count || 0,
        excel_questions_count: checklist.item_audit_count || 0, // Backend uses item_audit_count
        createdAt: checklist.created_at,
        updatedAt: checklist.updated_at,
      }))
    : [];

  return {
    checklists,
    isLoading,
    isError,
    error,
    refetch,
  };
};
