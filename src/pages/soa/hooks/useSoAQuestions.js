import { useCallback, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { soaQuestionsService } from "@/services/soaQuestionsService"

const mapQuestionRow = (item) => ({
  id: item.id,
  code: item.question_code,
  title: item.question_name,
  description: item.question,
  sectionCode: item.category?.code ?? item.category_code ?? "-",
  sectionLabel: item.category?.name ?? item.category_name ?? "Kategori SoA",
  category_id: item.category?.id ?? item.category_id,
  judul: item.question_name ?? "",
})

const mapCategoryRefOptions = (items = []) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    label: `${item.code ?? "-"} - ${item.name ?? "Kategori"}`,
    value: item.id,
  }))

export function useSoAQuestions() {
  const [searchValue, setSearchValueState] = useState("")
  const [perPage, setPerPage] = useState(10)
  const [activePage, setActivePage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const queryClient = useQueryClient()

  const queryParams = useMemo(
    () => ({
      search: searchValue.trim() || undefined,
      page: activePage,
      per_page: perPage,
      category_id: selectedCategory !== "all" ? selectedCategory : undefined,
    }),
    [searchValue, activePage, perPage, selectedCategory],
  )

  const listQuery = useQuery({
    queryKey: ["soa-questions", queryParams],
    queryFn: () => soaQuestionsService.listQuestions(queryParams),
    keepPreviousData: true,
  })

  const categoryRefsQuery = useQuery({
    queryKey: ["soa-question-categories"],
    queryFn: () => soaQuestionsService.listCategoryReferences(),
  })

  const questions = useMemo(
    () => (listQuery.data?.data ?? []).map(mapQuestionRow),
    [listQuery.data],
  )

  const categoryOptions = useMemo(() => {
    const categories = categoryRefsQuery.data?.data?.categories ?? []
    return mapCategoryRefOptions(categories)
  }, [categoryRefsQuery.data])

  const totalPages = listQuery.data?.meta?.last_page ?? 1
  const totalData = listQuery.data?.meta?.total ?? questions.length

  const handleSearchValueChange = useCallback((value) => {
    setSearchValueState(value)
    setActivePage(1)
  }, [])

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value))
    setActivePage(1)
  }, [])

  const createMutation = useMutation({
    mutationFn: (payload) => soaQuestionsService.createQuestion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soa-questions"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ questionId, payload }) =>
      soaQuestionsService.updateQuestion(questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soa-questions"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (questionId) => soaQuestionsService.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soa-questions"] })
    },
  })

  return {
    searchValue,
    setSearchValue: handleSearchValueChange,
    perPage,
    setPerPage,
    activePage,
    setActivePage,
    selectedCategory,
    setSelectedCategory,
    pagedData: questions,
    totalPages,
    totalData,
    handlePaginateChange,
    categoryOptions,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    isLoadingCategoryOptions: categoryRefsQuery.isLoading,
    createQuestion: (payload) => createMutation.mutateAsync(payload),
    isCreatingQuestion: createMutation.isPending,
    updateQuestion: (questionId, payload) =>
      updateMutation.mutateAsync({ questionId, payload }),
    isUpdatingQuestion: updateMutation.isPending,
    deleteQuestion: (questionId) => deleteMutation.mutateAsync(questionId),
    isDeletingQuestion: deleteMutation.isPending,
  }
}
