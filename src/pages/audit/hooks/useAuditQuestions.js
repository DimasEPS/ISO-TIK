import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { auditService } from "@/services/auditService";

/**
 * Custom hook untuk mengelola audit questions dengan React Query
 * @param {string} categoryId - UUID kategori audit
 */
export const useAuditQuestions = (categoryId) => {
  const queryClient = useQueryClient();

  // Query untuk fetch questions by category
  const {
    data: questionsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["auditQuestions", categoryId],
    queryFn: async () => {
      const response = await auditService.getCategoryQuestions(categoryId);
      // Backend response structure: response.data.questions.data
      return response.data.questions.data || [];
    },
    enabled: !!categoryId,
    staleTime: 1000, // 1 second for immediate updates
    refetchOnMount: true,
  });

  // Transform data untuk frontend (question_text -> text)
  const questions =
    questionsData?.map((question) => ({
      id: question.id,
      text: question.question_text,
      categoryId: question.id_audit_categories,
      createdAt: question.created_at,
      updatedAt: question.updated_at,
    })) || [];

  // Mutation untuk create question
  const createMutation = useMutation({
    mutationFn: async (newQuestion) => {
      const payload = {
        question_text: newQuestion.text,
        id_audit_categories: categoryId,
      };
      return await auditService.createQuestion(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["auditQuestions", categoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["auditCategories"] });
      toast.success(
        `Pertanyaan "${
          data?.data?.question_text || data?.data?.text || "baru"
        }" berhasil ditambahkan`
      );
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menambahkan pertanyaan";
      toast.error(errorMessage);
    },
  });

  // Mutation untuk update question
  const updateMutation = useMutation({
    mutationFn: async ({ id, text }) => {
      const payload = {
        question_text: text,
        id_audit_categories: categoryId,
      };
      return await auditService.updateQuestion(id, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["auditQuestions", categoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["auditCategories"] });
      toast.success(
        `Pertanyaan "${
          data?.data?.question_text || data?.data?.text || ""
        }" berhasil diperbarui`
      );
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal memperbarui pertanyaan";
      toast.error(errorMessage);
    },
  });

  // Mutation untuk delete question
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await auditService.deleteQuestion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auditQuestions", categoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["auditCategories"] });
      toast.success("Pertanyaan berhasil dihapus");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus pertanyaan";
      toast.error(errorMessage);
    },
  });

  return {
    questions,
    isLoading,
    isError,
    error,
    refetch,
    createQuestion: createMutation.mutate,
    updateQuestion: updateMutation.mutate,
    deleteQuestion: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
