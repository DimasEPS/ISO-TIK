import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

/**
 * Custom hook untuk mengelola aspect categories dengan React Query
 * @param {string} aspectId - UUID aspect
 * @param {Object} options - Query options
 */
export const useAspectCategories = (aspectId, options = {}) => {
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["aspectCategories", aspectId],
    queryFn: async () => {
      const response = await auditService.getAspectCategories(aspectId);

      // Backend response structure: response.data.categories.data
      return response.data.categories?.data || [];
    },
    enabled: !!aspectId,
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    ...options,
  });

  // Transform data untuk frontend
  const categories = Array.isArray(categoriesData)
    ? categoriesData.map((category) => ({
        id: category.id,
        name:
          category.categories_name || category.category_name || category.name,
        description: category.description || "",
        aspectId: category.id_audit_aspects,
        questionsCount: category.questions_count || 0,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      }))
    : [];

  return {
    categories,
    isLoading,
    isError,
    error,
    refetch,
  };
};
