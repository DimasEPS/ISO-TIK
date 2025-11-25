import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";
import { toast } from "sonner";

/**
 * Hook untuk mengelola audit categories dengan React Query
 * @param {string} aspectId - UUID aspect untuk filter categories
 * @param {Object} options - Query options { enabled, initialSearch, initialPage, initialPerPage }
 */
export function useAuditCategories(aspectId, options = {}) {
  const {
    enabled = true,
    initialSearch = "",
    initialPage = 1,
    initialPerPage = 10,
  } = options;

  const queryClient = useQueryClient();

  // Query untuk list categories by aspectId
  const categoriesQuery = useQuery({
    queryKey: [
      "audit-categories",
      aspectId,
      { search: initialSearch, page: initialPage, per_page: initialPerPage },
    ],
    queryFn: async () => {
      const response = await auditService.getAspectCategories(aspectId, {
        search_category_name: initialSearch || undefined,
        categories_page: initialPage,
        categories_per_page: initialPerPage,
      });

      // Handle nested response structure
      // Response structure: { status, message, data: { aspect: {...}, categories: {...} } }
      const categoriesData =
        response.data?.categories?.data || response.data?.categories || [];

      // Transform data dari backend ke format frontend
      const transformedCategories = Array.isArray(categoriesData)
        ? categoriesData.map((category) => ({
            id: category.id,
            name: category.categories_name,
            aspectId: category.id_audit_aspects,
            aspectName: category.aspect?.aspect_name,
            createdAt: category.created_at,
            updatedAt: category.updated_at,
          }))
        : [];

      return transformedCategories;
    },
    enabled: enabled && !!aspectId,
    staleTime: 1000, // 1 second - short stale time for frequent updates
    refetchOnMount: true,
  });

  // Mutation untuk create category
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData) => {
      // Transform dari format frontend ke backend
      const payload = {
        category_name: categoryData.name,
        id_audit_aspects: categoryData.aspectId,
      };

      return await auditService.createCategory(payload);
    },
    onSuccess: (data) => {
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({
        queryKey: ["audit-categories", aspectId],
      });
      queryClient.invalidateQueries({ queryKey: ["audit-aspect", aspectId] });

      const categoryName =
        data?.categories_name || data?.category_name || "Kategori baru";
      toast.success("Kategori berhasil ditambahkan", {
        description: `Kategori "${categoryName}" telah ditambahkan.`,
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menambahkan kategori";

      toast.error("Gagal menambahkan kategori", {
        description: errorMessage,
      });

      console.error("Create category error:", error);
    },
  });

  // Mutation untuk update category
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ categoryId, categoryData }) => {
      // Transform dari format frontend ke backend
      const payload = {
        category_name: categoryData.name,
        id_audit_aspects: categoryData.aspectId,
      };

      return await auditService.updateCategory(categoryId, payload);
    },
    onSuccess: (data) => {
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({
        queryKey: ["audit-categories", aspectId],
      });
      queryClient.invalidateQueries({ queryKey: ["audit-aspect", aspectId] });

      const categoryName =
        data?.categories_name || data?.category_name || "Kategori";
      toast.success("Kategori berhasil diperbarui", {
        description: `Kategori "${categoryName}" telah diperbarui.`,
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui kategori";

      toast.error("Gagal memperbarui kategori", {
        description: errorMessage,
      });

      console.error("Update category error:", error);
    },
  });

  // Mutation untuk delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId) => {
      return await auditService.deleteCategory(categoryId);
    },
    onSuccess: () => {
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({
        queryKey: ["audit-categories", aspectId],
      });

      toast.success("Kategori berhasil dihapus", {
        description: "Kategori dan pertanyaan terkait telah dihapus.",
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus kategori";

      toast.error("Gagal menghapus kategori", {
        description: errorMessage,
      });

      console.error("Delete category error:", error);
    },
  });

  return {
    // Query states
    categories: categoriesQuery.data || [],
    pagedData: categoriesQuery.data,
    pagination: categoriesQuery.data?.pagination,
    isLoading: categoriesQuery.isLoading,
    isPending: categoriesQuery.isPending,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,

    // Mutation functions
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,

    // Mutation states
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
}
