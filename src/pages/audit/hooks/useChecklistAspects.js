import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

/**
 * Custom hook untuk mengelola checklist aspects dengan React Query
 * @param {string} checklistId - UUID checklist
 * @param {Object} options - Query options
 */
export const useChecklistAspects = (checklistId, options = {}) => {
  const {
    data: aspectsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["checklistAspects", checklistId],
    queryFn: async () => {
      const response = await auditService.listAspects({
        checklist_id: checklistId,
        per_page: 100, // Get all aspects
      });

      // Backend response structure: response.data is already an array (not nested)
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!checklistId,
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    ...options,
  });

  // Transform data untuk frontend
  const aspects = Array.isArray(aspectsData)
    ? aspectsData.map((aspect) => ({
        id: aspect.id,
        name: aspect.aspect_name || aspect.name,
        description: aspect.description || "",
        checklistId: aspect.id_audit_checklists,
        categoriesCount: aspect.categories_count || 0,
        questionsCount: aspect.questions_count || 0,
        createdAt: aspect.created_at,
        updatedAt: aspect.updated_at,
      }))
    : [];

  return {
    aspects,
    isLoading,
    isError,
    error,
    refetch,
  };
};
