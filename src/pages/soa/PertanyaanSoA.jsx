import { useMemo, useState, useCallback } from "react"
import { NavLink } from "react-router-dom"
import { SearchIcon, Plus, ChevronDown, Funnel, FilePen, Trash2 } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePageTemplate } from "@/hooks/usePageTemplate"
import { PaginateControls } from "@/components/admin/table"
import { ChecklistCard } from "@/components/admin/audit/ChecklistCard"
import { OverlayForm } from "@/components/admin/soa/OverlayForm"
import { DocumentDeleteDialog } from "@/pages/documents/components/DocumentDeleteDialog"
import { useSoAQuestions } from "./hooks/useSoAQuestions"

const PAGINATE_OPTIONS = [10, 20, 50]

export default function PertanyaanSoA() {
  usePageTemplate({
    title: "Statement of Applicability",
    subtitle: "Kelola dokumen, kategori, dan pertanyaan SoA",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [deleteQuestion, setDeleteQuestion] = useState(null)

  const {
    searchValue,
    setSearchValue,
    perPage,
    activePage,
    setActivePage,
    selectedCategory,
    setSelectedCategory,
    pagedData,
    totalPages,
    totalData,
    handlePaginateChange,
    categoryOptions,
    isLoading,
    isError,
    error,
    createQuestion,
    isCreatingQuestion,
    updateQuestion,
    isUpdatingQuestion,
    deleteQuestion: deleteQuestionMutation,
  } = useSoAQuestions()

  const filterOptions = useMemo(
    () => [{ label: "Semua Kategori", value: "all" }, ...categoryOptions],
    [categoryOptions],
  )

  const handleSearchChange = useCallback(
    (event) => {
      setSearchValue(event.target.value)
    },
    [setSearchValue],
  )

  const handleSubmitQuestion = useCallback(
    async (payload, questionId) => {
      const trimmedPayload = {
        category_id: payload?.category_id,
        question_code: payload?.question_code?.trim(),
        question_name: payload?.question_name?.trim(),
        question: payload?.question?.trim(),
      }

      if (
        !trimmedPayload.category_id ||
        !trimmedPayload.question_code ||
        !trimmedPayload.question_name ||
        !trimmedPayload.question
      ) {
        toast.warning("Lengkapi seluruh data pertanyaan sebelum menyimpan.")
        return
      }

      try {
        if (questionId) {
          await updateQuestion(questionId, trimmedPayload)
          toast.success("Pertanyaan SoA berhasil diperbarui.")
        } else {
          await createQuestion(trimmedPayload)
          toast.success("Pertanyaan SoA berhasil ditambahkan.")
        }
      } catch (submitError) {
        console.error("Gagal menyimpan pertanyaan SoA", submitError)
        toast.error(submitError?.message ?? "Gagal menyimpan pertanyaan SoA")
      }
    },
    [createQuestion, updateQuestion],
  )

  const handleDeleteQuestion = useCallback(
    async (payload) => {
      const questionId =
        typeof payload === "string" ? payload : payload?.id
      if (!questionId) return
      try {
        await deleteQuestionMutation(questionId)
        setDeleteQuestion(null)
        toast.success("Pertanyaan SoA berhasil dihapus.")
      } catch (deleteError) {
        console.error("Gagal menghapus pertanyaan SoA", deleteError)
        toast.error(deleteError?.message ?? "Gagal menghapus pertanyaan SoA")
      }
    },
    [deleteQuestionMutation],
  )

  const handlePromptDeleteQuestion = useCallback(
    (question) => {
      if (!question) {
        setDeleteQuestion(null)
        return
      }

      setDeleteQuestion({
        ...question,
        judul: question.judul || question.title || "Pertanyaan",
      })
    },
    [setDeleteQuestion],
  )

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center gap-4 ">
        <InputGroup className="h-14 flex-1">
          <InputGroupInput
            placeholder="Cari pertanyaan berdasarkan nama"
            value={searchValue}
            onChange={handleSearchChange}
            className="bg-state text-navy placeholder:text-gray-dark"
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <DropdownMenu open={isCategoryDropdownOpen} onOpenChange={setIsCategoryDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-14 min-w-40 justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <Funnel className="h-4 w-4" />
                {filterOptions.find((option) => option.value === selectedCategory)?.label}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[180px]">
            <DropdownMenuLabel>Pilih Kategori</DropdownMenuLabel>
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => {
                  setSelectedCategory(option.value)
                  setActivePage(1)
                  setIsCategoryDropdownOpen(false)
                }}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <OverlayForm
          variant="question"
          trigger={
            <Button className="h-14 gap-2 bg-navy text-white hover:bg-navy-hover p-4">
              <Plus className="h-5 w-5" /> Tambah Pertanyaan
            </Button>
          }
          categoryOptions={categoryOptions}
          onQuestionSubmit={handleSubmitQuestion}
          questionSubmitting={isCreatingQuestion}
        />
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red">
          {error?.message || "Gagal memuat pertanyaan SoA"}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Memuat data pertanyaan SoA...
        </div>
      ) : (
        <div className="space-y-4">
          {pagedData.map((item) => (
          <ChecklistCard
            key={item.id}
            badge={item.sectionCode}
            title={item.title}
            description={item.description}
            meta={
              <span className="inline-flex items-center bg-state px-3 py-1 small rounded-lg text-navy">
                Kategori: {item.sectionCode} - {item.sectionLabel}
              </span>
            }
            actions={
              <div className="flex items-center gap-2">
                <OverlayForm
                  variant="question"
                  mode="edit"
                  defaultValues={{
                    id: item.id,
                    category_id: item.category_id,
                    question_code: item.code,
                    question_name: item.title,
                    question: item.description,
                  }}
                  categoryOptions={categoryOptions}
                  onQuestionSubmit={handleSubmitQuestion}
                  questionSubmitting={isUpdatingQuestion}
                  trigger={
                    <button
                      type="button"
                      className="rounded p-2 transition-colors hover:bg-blue-50"
                      title="Edit"
                    >
                      <FilePen className="h-5 w-5 text-[#2B7FFF]" />
                    </button>
                  }
                />
                <button
                  type="button"
                  className="rounded p-2 transition-colors hover:bg-red-50"
                  title="Hapus"
                  onClick={() => handlePromptDeleteQuestion(item)}
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
              </div>
            }
          />
          ))}
          {pagedData.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              Tidak ada pertanyaan sesuai pencarian
            </div>
          )}
        </div>
      )}

      <PaginateControls
        perPage={perPage}
        onPaginateChange={handlePaginateChange}
        paginateValue={PAGINATE_OPTIONS}
        setActivePage={setActivePage}
        activePage={activePage}
        onPageChange={setActivePage}
        totalPages={totalPages}
        totalData={totalData}
      />

      <DocumentDeleteDialog
        open={Boolean(deleteQuestion)}
        onOpenChange={(open) => {
          if (!open) setDeleteQuestion(null)
        }}
        documentData={deleteQuestion}
        entityLabel="Pertanyaan"
        onConfirm={(payload) => payload && handleDeleteQuestion(payload)}
      />
    </div>
  )
}

function TabNavigation() {
  const tabs = [
    { label: "Dokumen SoA", to: "/admin/soa/dokumen" },
    { label: "Kategori SOA", to: "/admin/soa/kategori" },
    { label: "Pertanyaan SOA", to: "/admin/soa/pertanyaan" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `rounded-xl px-5 py-2 text-sm font-semibold ${
              isActive ? "bg-white text-navy shadow-sm border border-[#E1E6F4]" : "text-gray-500"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
