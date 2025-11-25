import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

/**
 * Custom hook untuk mengelola category questions WITH ANSWERS dari document
 * @param {string} documentId - UUID document audit
 * @param {string} categoryId - UUID category
 * @param {Object} options - Query options
 */
export const useCategoryQuestions = (documentId, categoryId, options = {}) => {
  const {
    data: questionsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["documentCategoryQuestions", documentId, categoryId],
    queryFn: async () => {
      const response = await auditService.getDocumentCategoryQuestions(
        documentId,
        categoryId
      );

      // Backend response structure: response.data.questions.data
      return response.data.questions?.data || [];
    },
    enabled: !!documentId && !!categoryId,
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    ...options,
  });

  // Transform data untuk frontend
  const questions = Array.isArray(questionsData)
    ? questionsData.map((item) => ({
        id: item.id,
        question: item.question_text || item.question,
        categoryId: item.id_audit_categories,
        // Answer data from answers array (get first answer if exists)
        answerId: item.answers?.[0]?.id,
        jawaban: item.answers?.[0]?.answer_text,
        observasi: item.answers?.[0]?.observation,
        verifikasi: item.answers?.[0]?.verification,
        rekomenDokumen: item.answers?.[0]?.record_doc,
        // Review fields
        isReview: item.answers?.[0]?.is_review || false,
        reviewerComment: item.answers?.[0]?.reviewer_comment,
        reviewedAt: item.answers?.[0]?.reviewed_at,
        reviewerName: item.answers?.[0]?.reviewer?.name,
        status:
          item.answers && item.answers.length > 0 ? "answered" : "not-answered",
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }))
    : [];

  return {
    questions,
    isLoading,
    isError,
    error,
    refetch,
  };
};
