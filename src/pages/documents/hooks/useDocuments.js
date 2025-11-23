import { useMemo, useState, useCallback, useEffect } from "react"
import { tableData } from "@/mocks/tableData"

const normalizeDocuments = (list = []) =>
  list.map((item, index) => ({
    ...item,
    deskripsi:
      item.deskripsi ??
      `Dokumen referensi SoA ${item.judul || item.noDoc || index + 1}`,
  }))

const BASE_DOCUMENTS = normalizeDocuments(tableData)

export function useDocuments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [perPage, setPerPage] = useState(10)
  const [activePage, setActivePage] = useState(1)

  const filteredData = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return BASE_DOCUMENTS
    return BASE_DOCUMENTS.filter((item) => {
      const fields = [
        item.noDoc,
        item.judul,
        item.deskripsi,
        item.penyusun,
      ]
      return fields.some((field) => field?.toLowerCase().includes(normalized))
    })
  }, [searchQuery])

  const totalData = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalData / perPage))
  const currentPage = Math.min(activePage, totalPages)

  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage
    return filteredData.slice(startIndex, startIndex + perPage)
  }, [filteredData, currentPage, perPage])

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value))
  }, [])

  useEffect(() => {
    setActivePage(1)
  }, [searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    perPage,
    currentPage,
    setActivePage,
    pagedData,
    totalData,
    totalPages,
    handlePaginateChange,
  }
}
