import { useCallback, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { soaCategoriesService } from "@/services/soaCategoriesService"

const mapCategoryRow = (item) => ({
  id: item.id,
  code: item.code ?? item.category_code,
  name: item.name ?? item.category_name,
  description: item.description ?? "",
  judul: item.name ?? item.category_name ?? "",
})

export function useSoACategories() {
  const [searchValue, setSearchValueState] = useState("")
  const [perPage, setPerPage] = useState(10)
  const [activePage, setActivePage] = useState(1)
  const queryClient = useQueryClient()

  const queryParams = useMemo(
    () => ({
      search: searchValue.trim() || undefined,
      page: activePage,
      per_page: perPage,
    }),
    [searchValue, activePage, perPage],
  )

  const listQuery = useQuery({
    queryKey: ["soa-categories", queryParams],
    queryFn: () => soaCategoriesService.listCategories(queryParams),
    keepPreviousData: true,
  })

  const categories = useMemo(
    () => (listQuery.data?.data ?? []).map(mapCategoryRow),
    [listQuery.data],
  )

  const totalPages = listQuery.data?.meta?.last_page ?? 1
  const totalData = listQuery.data?.meta?.total ?? categories.length

  const handleSearchValueChange = useCallback((value) => {
    setSearchValueState(value)
    setActivePage(1)
  }, [])

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value))
    setActivePage(1)
  }, [])

  const createMutation = useMutation({
    mutationFn: (payload) => soaCategoriesService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soa-categories"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ categoryId, payload }) =>
      soaCategoriesService.updateCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soa-categories"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (categoryId) => soaCategoriesService.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soa-categories"] })
    },
  })

  return {
    searchValue,
    setSearchValue: handleSearchValueChange,
    perPage,
    activePage,
    setActivePage,
    pagedData: categories,
    totalPages,
    totalData,
    handlePaginateChange,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    createCategory: (payload) => createMutation.mutateAsync(payload),
    isCreatingCategory: createMutation.isPending,
    updateCategory: (categoryId, payload) =>
      updateMutation.mutateAsync({ categoryId, payload }),
    isUpdatingCategory: updateMutation.isPending,
    deleteCategory: (categoryId) => deleteMutation.mutateAsync(categoryId),
    isDeletingCategory: deleteMutation.isPending,
  }
}
