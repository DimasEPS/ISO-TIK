import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { auditService } from "@/services/auditService";

/**
 * Custom hook untuk mengelola audit excel questions (item audit) dengan React Query
 * @param {string} excelChecklistId - UUID excel checklist audit
 */
export const useExcelQuestions = (excelChecklistId) => {
  const queryClient = useQueryClient();

  // Query untuk fetch excel questions by excel checklist
  const {
    data: questionsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["auditExcelQuestions", excelChecklistId],
    queryFn: async () => {
      const response = await auditService.getExcelChecklistQuestions(
        excelChecklistId
      );
      // Backend response structure: response.data.audit_excel_questions
      return response.data.audit_excel_questions || [];
    },
    enabled: !!excelChecklistId,
    staleTime: 1000, // 1 second for immediate updates
    refetchOnMount: true,
  });

  // Transform data untuk frontend
  const questions =
    questionsData?.map((question) => ({
      id: question.id,
      aspect: question.aspect || "",
      itemAudit: question.item_audit || "",
      excelChecklistId: question.id_audit_excel_checklists,
      createdAt: question.created_at,
      updatedAt: question.updated_at,
    })) || [];

  // Mutation untuk create excel question
  const createMutation = useMutation({
    mutationFn: async (newQuestion) => {
      const payload = {
        aspect: newQuestion.aspect || null,
        item_audit: newQuestion.itemAudit || null,
        id_audit_excel_checklists: excelChecklistId,
      };
      return await auditService.createExcelQuestion(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["auditExcelQuestions", excelChecklistId],
      });
      queryClient.invalidateQueries({ queryKey: ["auditExcelChecklists"] });
      toast.success(
        `Item audit "${
          data?.data?.item_audit || data?.data?.itemAudit || "baru"
        }" berhasil ditambahkan`
      );
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menambahkan item audit";
      toast.error(errorMessage);
    },
  });

  // Mutation untuk update excel question
  const updateMutation = useMutation({
    mutationFn: async ({ id, aspect, itemAudit }) => {
      const payload = {
        aspect: aspect || null,
        item_audit: itemAudit || null,
        id_audit_excel_checklists: excelChecklistId,
      };
      return await auditService.updateExcelQuestion(id, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["auditExcelQuestions", excelChecklistId],
      });
      queryClient.invalidateQueries({ queryKey: ["auditExcelChecklists"] });
      toast.success(
        `Item audit "${
          data?.data?.item_audit || data?.data?.itemAudit || ""
        }" berhasil diperbarui`
      );
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal memperbarui item audit";
      toast.error(errorMessage);
    },
  });

  // Mutation untuk delete excel question
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await auditService.deleteExcelQuestion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auditExcelQuestions", excelChecklistId],
      });
      queryClient.invalidateQueries({ queryKey: ["auditExcelChecklists"] });
      toast.success("Item audit berhasil dihapus");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus item audit";
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
