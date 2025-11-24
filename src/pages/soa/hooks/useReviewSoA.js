import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { soaCategoriesService } from "@/services/soaCategoriesService"
import { soaDocumentsService } from "@/services/soaDocumentsService"
import { soaAnswersService } from "@/services/soaAnswersService"

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

const mapDocumentDetail = (payload = {}) => {
  const data = payload?.data ?? payload ?? {}

  return {
    id: data.id,
    noDoc: data.document_number ?? "-",
    judul: data.title ?? "-",
    revisi: data.revision ?? "-",
    klasifikasi: data.classification ?? "-",
    tanggalTerbit: formatDate(data.publish_date),
    tanggalTerbitRaw: data.publish_date ?? null,
    penyusun: data.compiler_name ?? "-",
    ketuaIso: data.iso_chairman_name ?? "-",
    direktur: data.director_name ?? "-",
    status: data.status ?? "-",
  }
}

const mapCategoryWithQuestions = (item = {}) => ({
  id: item.id,
  code: item.code ?? item.category_code,
  title: item.name ?? item.category_name ?? "-",
  label: item.name ?? item.category_name ?? "-",
  description: item.description ?? "",
  questions: (item.questions ?? []).map((question) => ({
    id: question.id,
    code: question.code ?? question.question_code,
    title: question.name ?? question.question_name ?? "-",
    label: question.name ?? question.question_name ?? "-",
    description: question.question ?? "",
  })),
})

const mapAnswerSummary = (item = {}) => ({
  id: item.id,
  questionId: item.question?.id ?? null,
  current_control: item.current_control ?? null,
  pl: item.pl ?? null,
  kk: item.kk ?? null,
  pk_pb: item.pk_pb ?? null,
  hpr: item.hpr ?? null,
  justification: item.justification ?? "",
  implementation_summary: item.implementation_summary ?? "",
  reviewer_comment: item.reviewer_comment ?? "",
  reviewed_at: item.reviewed_at ?? null,
  is_review: Boolean(item.is_review),
  document: item.document ?? null,
  auditor: item.auditor ?? null,
})

export function useReviewSoA({ documentId, categoriesPerPage = 100 } = {}) {
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ["soa-categories", "with-questions", categoriesPerPage],
    queryFn: () =>
      soaCategoriesService.listCategoriesWithQuestions({
        per_page: categoriesPerPage,
      }),
  })

  const categories = useMemo(
    () => (categoriesQuery.data?.data ?? []).map(mapCategoryWithQuestions),
    [categoriesQuery.data],
  )

  const documentQuery = useQuery({
    queryKey: ["soa-documents", documentId],
    enabled: Boolean(documentId),
    queryFn: () => soaDocumentsService.getDocument(documentId),
  })

  const document = useMemo(
    () => (documentId ? mapDocumentDetail(documentQuery.data) : null),
    [documentId, documentQuery.data],
  )

  const answersQuery = useQuery({
    queryKey: ["soa-answers", { documentId }],
    enabled: Boolean(documentId),
    queryFn: () =>
      soaAnswersService.listAnswers({
        document_id: documentId,
        per_page: 10,
      }),
  })

  const answers = useMemo(
    () => (answersQuery.data?.data ?? []).map(mapAnswerSummary),
    [answersQuery.data],
  )

  const answersByQuestion = useMemo(() => {
    const map = new Map()
    answers.forEach((answer) => {
      if (answer.questionId) {
        map.set(answer.questionId, answer)
      }
    })
    return map
  }, [answers])

  const invalidateAnswers = () =>
    queryClient.invalidateQueries({ queryKey: ["soa-answers", { documentId }] })

  const createAnswerMutation = useMutation({
    mutationFn: (payload) => soaAnswersService.createAnswer(payload),
    onSuccess: () => {
      invalidateAnswers()
    },
  })

  const updateAnswerMutation = useMutation({
    mutationFn: ({ answerId, payload }) =>
      soaAnswersService.updateAnswer(answerId, payload),
    onSuccess: (_data, variables) => {
      invalidateAnswers()
      if (variables?.answerId) {
        queryClient.invalidateQueries({
          queryKey: ["soa-answers", "detail", variables.answerId],
        })
      }
    },
  })

  const saveAnswer = async ({ answerId, payload }) => {
    if (answerId) {
      const response = await updateAnswerMutation.mutateAsync({
        answerId,
        payload,
      })
      return response?.data ?? response
    }

    const response = await createAnswerMutation.mutateAsync(payload)
    return response?.data ?? response
  }

  return {
    categories,
    categoriesLoading: categoriesQuery.isLoading,
    categoriesError: categoriesQuery.error,
    document,
    documentLoading: documentQuery.isLoading,
    documentError: documentQuery.error,
    answers,
    answersByQuestion,
    answersLoading: answersQuery.isLoading,
    answersError: answersQuery.error,
    saveAnswer,
    isSavingAnswer: createAnswerMutation.isPending || updateAnswerMutation.isPending,
    refetchAnswers: answersQuery.refetch,
  }
}
