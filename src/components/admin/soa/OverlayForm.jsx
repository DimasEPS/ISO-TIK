import { useEffect, useMemo, useState } from "react"
import { Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusDropdown } from "@/components/admin/table"

const DEFAULT_DOCUMENT_STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "In Progress", value: "in_progress" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Approved", value: "approved" },
]

const buildDocumentFormState = (defaults = {}, statusOptions = DEFAULT_DOCUMENT_STATUSES) => ({
  document_number: defaults.document_number ?? "",
  publish_date: defaults.publish_date ?? "",
  title: defaults.title ?? "",
  revision: defaults.revision ?? "",
  classification: defaults.classification ?? "",
  compiler_name: defaults.compiler_name ?? "",
  iso_chairman_name: defaults.iso_chairman_name ?? "",
  director_name: defaults.director_name ?? "",
  status: defaults.status ?? statusOptions[0]?.value ?? "draft",
})

const buildCategoryFormState = (defaults = {}) => ({
  id: defaults.id,
  code: defaults.code ?? defaults.category_code ?? "",
  name: defaults.name ?? defaults.category_name ?? "",
  description: defaults.description ?? "",
})

const buildQuestionFormState = (defaults = {}, categoryOptions = []) => {
  const resolvedCategoryId =
    defaults.category_id ??
    defaults.categoryId ??
    defaults.category?.id ??
    categoryOptions[0]?.value ?? ""

  return {
    id: defaults.id,
    category_id: resolvedCategoryId,
    question_code: defaults.question_code ?? defaults.code ?? "",
    question_name: defaults.question_name ?? defaults.name ?? "",
    question: defaults.question ?? defaults.description ?? "",
  }
}

export function OverlayForm({
  variant = "document",
  mode = "add",
  trigger,
  triggerLabel,
  categoryOptions = [],
  defaultValues = {},
  className = "",
  onDocumentSubmit,
  documentSubmitting = false,
  documentStatusOptions = DEFAULT_DOCUMENT_STATUSES,
  onCategorySubmit,
  categorySubmitting = false,
  onQuestionSubmit,
  questionSubmitting = false,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)

  const defaultValuesString = useMemo(
    () => JSON.stringify(defaultValues ?? {}),
    [defaultValues],
  )

  const parsedDefaultValues = useMemo(() => {
    try {
      return JSON.parse(defaultValuesString)
    } catch {
      return {}
    }
  }, [defaultValuesString])

  const documentStatusOptionsKey = useMemo(
    () => JSON.stringify(documentStatusOptions ?? []),
    [documentStatusOptions],
  )

  const categoryOptionsKey = useMemo(
    () => JSON.stringify(categoryOptions ?? []),
    [categoryOptions],
  )

  const normalizedDocumentStatusOptions = useMemo(() => {
    try {
      const parsed = JSON.parse(documentStatusOptionsKey)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [documentStatusOptionsKey])

  const normalizedCategoryOptions = useMemo(() => {
    try {
      const parsed = JSON.parse(categoryOptionsKey)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [categoryOptionsKey])

  const memoizedDocumentDefaults = useMemo(
    () => buildDocumentFormState(parsedDefaultValues, normalizedDocumentStatusOptions),
    [parsedDefaultValues, normalizedDocumentStatusOptions],
  )

  const memoizedCategoryDefaults = useMemo(
    () => buildCategoryFormState(parsedDefaultValues),
    [parsedDefaultValues],
  )

  const memoizedQuestionDefaults = useMemo(
    () => buildQuestionFormState(parsedDefaultValues, normalizedCategoryOptions),
    [parsedDefaultValues, normalizedCategoryOptions],
  )

  const [documentForm, setDocumentForm] = useState(() => memoizedDocumentDefaults)
  const [categoryForm, setCategoryForm] = useState(() => memoizedCategoryDefaults)
  const [questionForm, setQuestionForm] = useState(() => memoizedQuestionDefaults)
  const [internalSubmitting, setInternalSubmitting] = useState(false)
  const [internalCategorySubmitting, setInternalCategorySubmitting] = useState(false)
  const [internalQuestionSubmitting, setInternalQuestionSubmitting] = useState(false)

  useEffect(() => {
    if (isDialogOpen) return

    setDocumentForm((prev) =>
      prev === memoizedDocumentDefaults ? prev : memoizedDocumentDefaults,
    )
    setCategoryForm((prev) =>
      prev === memoizedCategoryDefaults ? prev : memoizedCategoryDefaults,
    )
    setQuestionForm((prev) =>
      prev === memoizedQuestionDefaults ? prev : memoizedQuestionDefaults,
    )
    setStatusDropdownOpen(false)
    setInternalSubmitting(false)
    setInternalCategorySubmitting(false)
    setInternalQuestionSubmitting(false)
  }, [
    isDialogOpen,
    memoizedDocumentDefaults,
    memoizedCategoryDefaults,
    memoizedQuestionDefaults,
  ])

  const isQuestionVariant = variant === "question"
  const isCategoryVariant = variant === "category"
  const isDocumentVariant = !isQuestionVariant && !isCategoryVariant
  const isEditMode = mode === "edit"

  const submitLabel = isQuestionVariant
    ? isEditMode
      ? "Simpan Perubahan"
      : "Simpan Pertanyaan"
    : isCategoryVariant
    ? isEditMode
      ? "Simpan Perubahan"
      : "Simpan Kategori"
    : "Simpan Dokumen"

  const heading = isQuestionVariant
    ? isEditMode
      ? "Edit Pertanyaan"
      : "Tambah Pertanyaan"
    : isCategoryVariant
    ? isEditMode
      ? "Edit Kategori"
      : "Tambah Kategori"
    : "Tambahkan Dokumen SoA"

  const description = isQuestionVariant
    ? isEditMode
      ? "Ubah informasi pertanyaan sesuai kebutuhan"
      : "Lengkapi form di bawah ini untuk menambah pertanyaan baru"
    : isCategoryVariant
    ? isEditMode
      ? "Ubah informasi kategori sesuai kebutuhan"
      : "Lengkapi form di bawah ini untuk menambah kategori baru"
    : "Lengkapi form di bawah ini untuk menambah dokumen SoA baru"

  const defaultTrigger = (
    <Button
      type="button"
      className={
        isQuestionVariant || isCategoryVariant
          ? "h-14 gap-2 bg-navy px-6 text-white hover:bg-navy-hover w-[203px]"
          : "bg-navy text-gray-light hover:bg-navy-hover h-14 w-[203px]"
      }
    >
      <Plus className="h-5 w-5" /> {triggerLabel ?? (isQuestionVariant ? "Tambah Pertanyaan" : isCategoryVariant ? "Tambah Kategori" : "Tambah Dokumen SoA")}
    </Button>
  )

  const handleDocumentInputChange = (field) => (event) => {
    const { value } = event.target
    setDocumentForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleDocumentStatusChange = (nextValue) => {
    const option =
      documentStatusOptions.find(
        (candidate) => candidate.value === nextValue || candidate.label === nextValue,
      ) ?? documentStatusOptions[0]
    setDocumentForm((prev) => ({ ...prev, status: option?.value ?? prev.status }))
    setStatusDropdownOpen(false)
  }

  const handleCategoryInputChange = (field) => (event) => {
    const { value } = event.target
    setCategoryForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleQuestionInputChange = (field) => (event) => {
    const { value } = event.target
    setQuestionForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleQuestionCategorySelect = (option) => {
    setQuestionForm((prev) => ({ ...prev, category_id: option.value }))
    setIsCategoryMenuOpen(false)
  }

  const mapDocumentPayload = (state) => ({
    document_number: state.document_number?.trim(),
    publish_date: state.publish_date,
    title: state.title?.trim(),
    revision: state.revision?.trim(),
    classification: state.classification?.trim() || null,
    compiler_name: state.compiler_name?.trim() || null,
    iso_chairman_name: state.iso_chairman_name?.trim() || null,
    director_name: state.director_name?.trim() || null,
    status: state.status,
  })

  const mapCategoryPayload = (state) => ({
    code: state.code?.trim(),
    name: state.name?.trim(),
    description: state.description?.trim() || null,
  })

  const mapQuestionPayload = (state) => ({
    category_id: state.category_id,
    question_code: state.question_code?.trim(),
    question_name: state.question_name?.trim(),
    question: state.question?.trim(),
  })

  const handleDocumentSubmit = async (event) => {
    event.preventDefault()
    if (!onDocumentSubmit) return
    try {
      setInternalSubmitting(true)
      await onDocumentSubmit(mapDocumentPayload(documentForm))
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Gagal menyimpan dokumen SoA", error)
    } finally {
      setInternalSubmitting(false)
    }
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    if (!onCategorySubmit) return
    try {
      setInternalCategorySubmitting(true)
      if (categoryForm.id) {
        await onCategorySubmit(mapCategoryPayload(categoryForm), categoryForm.id)
      } else {
        await onCategorySubmit(mapCategoryPayload(categoryForm))
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Gagal menyimpan kategori SoA", error)
    } finally {
      setInternalCategorySubmitting(false)
    }
  }

  const handleQuestionSubmit = async (event) => {
    event.preventDefault()
    if (!onQuestionSubmit || !questionForm.category_id) return
    try {
      setInternalQuestionSubmitting(true)
      if (questionForm.id) {
        await onQuestionSubmit(mapQuestionPayload(questionForm), questionForm.id)
      } else {
        await onQuestionSubmit(mapQuestionPayload(questionForm))
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Gagal menyimpan pertanyaan SoA", error)
    } finally {
      setInternalQuestionSubmitting(false)
    }
  }

  const selectedStatusLabel =
    documentStatusOptions.find((option) => option.value === documentForm.status)?.label ??
    documentForm.status

  const submittingDocument = documentSubmitting || internalSubmitting
  const submittingCategory = categorySubmitting || internalCategorySubmitting
  const submittingQuestion = questionSubmitting || internalQuestionSubmitting
  const canSubmitCategory = Boolean(categoryForm.code?.trim() && categoryForm.name?.trim())
  const canSubmitQuestion = Boolean(
    questionForm.category_id &&
    questionForm.question_code?.trim() &&
    questionForm.question_name?.trim() &&
    questionForm.question?.trim(),
  )

  return (
    <div className={className}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
        <DialogContent className={isQuestionVariant ? "sm:max-w-[520px]" : "sm:max-w-[600px] sm:max-h-[993px] mx-auto"}>
          <DialogHeader>
            <DialogTitle className="text-navy heading-3">{heading}</DialogTitle>
            <DialogDescription className="text-gray-dark small">
              {description}
            </DialogDescription>
          </DialogHeader>

          {isQuestionVariant ? (
            <form className="space-y-4" onSubmit={handleQuestionSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <DropdownMenu open={isCategoryMenuOpen} onOpenChange={setIsCategoryMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded bg-state px-4 py-3 text-left body font-semibold text-gray-dark"
                      >
                        {categoryOptions.find((option) => option.value === questionForm.category_id)?.label ?? "Pilih Kategori"}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isCategoryMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[464px] bg-state space-y-1">
                      {categoryOptions.map((option) => (
                        <DropdownMenuItem
                          className="w-full body"
                          key={option.value ?? option.label}
                          onClick={() => handleQuestionCategorySelect(option)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question_code" className="body-medium text-gray-dark">
                    Kode Pertanyaan
                  </Label>
                  <Input
                    id="question_code"
                    value={questionForm.question_code}
                    onChange={handleQuestionInputChange("question_code")}
                    placeholder="Contoh A.5.1"
                    className="h-12 border border-transparent bg-state text-navy px-4 py-3 text-sm focus:border-navy focus:outline-none"
                    disabled={submittingQuestion}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question_name" className="body-medium text-gray-dark">
                  Nama Pertanyaan
                </Label>
                <Input
                  id="question_name"
                  value={questionForm.question_name}
                  onChange={handleQuestionInputChange("question_name")}
                  placeholder="Masukkan Nama Pertanyaan"
                  className="h-12 border border-transparent bg-state text-navy px-4 py-3 text-sm rounded focus:border-navy focus:outline-none"
                  disabled={submittingQuestion}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question" className="body-medium text-gray-dark">
                  Pertanyaan
                </Label>
                <textarea
                  id="question"
                  value={questionForm.question}
                  onChange={handleQuestionInputChange("question")}
                  placeholder="Masukkan Pertanyaan"
                  className="min-h-[120px] w-full border border-transparent bg-state text-navy px-4 py-3 text-sm rounded focus:border-navy focus:outline-none"
                  disabled={submittingQuestion}
                  required
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button className="rounded" variant="outline" type="button" disabled={submittingQuestion}>
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="hover:bg-navy-hover! rounded"
                  disabled={submittingQuestion || !canSubmitQuestion}
                >
                  {submittingQuestion ? "Menyimpan..." : submitLabel}
                </Button>
              </DialogFooter>
            </form>
          ) : isCategoryVariant ? (
            <form className="space-y-4" onSubmit={handleCategorySubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kodeKategori" className="body-medium text-gray-dark">
                    Kategori
                  </Label>
                  <Input
                    id="kodeKategori"
                    value={categoryForm.code}
                    onChange={handleCategoryInputChange("code")}
                    placeholder="Contoh A.5"
                    className="bg-state body text-navy h-12 px-4 py-3 rounded"
                    disabled={submittingCategory}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namaKategori" className="body-medium text-gray-dark">
                    Nama Kategori
                  </Label>
                  <Input
                    id="namaKategori"
                    value={categoryForm.name}
                    onChange={handleCategoryInputChange("name")}
                    placeholder="Masukkan Nama Kategori"
                    className="bg-state body text-navy h-12 px-4 py-3 rounded"
                    disabled={submittingCategory}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deskripsiKategori" className="body-medium text-gray-dark">
                    Deskripsi
                  </Label>
                  <textarea
                    id="deskripsiKategori"
                    value={categoryForm.description}
                    onChange={handleCategoryInputChange("description")}
                    placeholder="Masukkan Deskripsi"
                    className="min-h-[120px] w-full rounded border bg-state body text-navy px-4 py-3 focus:border-navy focus:outline-none"
                    disabled={submittingCategory}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="rounded" variant="outline" type="button">
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="hover:bg-navy-hover! rounded"
                  disabled={submittingCategory || !canSubmitCategory}
                >
                  {submittingCategory ? "Menyimpan..." : submitLabel}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleDocumentSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="document_number">No Dokumen</Label>
                  <Input
                    id="document_number"
                    value={documentForm.document_number}
                    onChange={handleDocumentInputChange("document_number")}
                    placeholder="Masukkan No Dokumen"
                    className="rounded border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
                    required
                    disabled={submittingDocument}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="publish_date">Tanggal Terbit</Label>
                  <Input
                    id="publish_date"
                    type="date"
                    value={documentForm.publish_date}
                    onChange={handleDocumentInputChange("publish_date")}
                    className="rounded border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
                    required
                    disabled={submittingDocument}
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="title">Judul Dokumen</Label>
                <Input
                  id="title"
                  value={documentForm.title}
                  onChange={handleDocumentInputChange("title")}
                  placeholder="Masukkan Judul Dokumen"
                  className="rounded border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
                  required
                  disabled={submittingDocument}
                />
              </div>

              <div className="grid gap-4 ">
                <div className="grid gap-3">
                  <Label htmlFor="revision">Revisi</Label>
                  <Input
                    id="revision"
                    value={documentForm.revision}
                    onChange={handleDocumentInputChange("revision")}
                    placeholder="Masukkan Revisi"
                    className="rounded border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
                    required
                    disabled={submittingDocument}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="classification">Klasifikasi</Label>
                  <Input
                    id="classification"
                    value={documentForm.classification}
                    onChange={handleDocumentInputChange("classification")}
                    placeholder="Masukkan Klasifikasi"
                    className="rounded border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
                    disabled={submittingDocument}
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="compiler_name">Penyusun</Label>
                  <Input
                    id="compiler_name"
                    value={documentForm.compiler_name}
                    onChange={handleDocumentInputChange("compiler_name")}
                    placeholder="Masukkan Nama Penyusun"
                    className="rounded border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
                    disabled={submittingDocument}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="iso_chairman_name">Ketua ISO</Label>
                  <Input
                    id="iso_chairman_name"
                    value={documentForm.iso_chairman_name}
                    onChange={handleDocumentInputChange("iso_chairman_name")}
                    placeholder="Masukkan Nama Ketua Iso"
                    className="rounded transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
                    disabled={submittingDocument}
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="director_name">Direktur</Label>
                  <Input
                    id="director_name"
                    value={documentForm.director_name}
                    onChange={handleDocumentInputChange("director_name")}
                    placeholder="Masukkan Nama Direktur"
                    className="rounded! transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
                    disabled={submittingDocument}
                  />
                </div>
                <div className="grid gap-3">
                  <Label>Status</Label>
                  <StatusDropdown
                    isMenuOpen={statusDropdownOpen}
                    setIsMenuOpen={setStatusDropdownOpen}
                    value={selectedStatusLabel}
                    onChange={handleDocumentStatusChange}
                    options={documentStatusOptions.map((option) => ({
                      value: option.label,
                      label: option.label,
                    }))}
                    classNameButton="w-full h-12! bg-state text-navy rounded border border-transparent"
                    classNameDropdown="w-[]"
                    showFunnelIcon={false}
                  />
                </div>
              </div>

              <DialogFooter className="gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded border-gray-300 text-navy h-[43px]"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={submittingDocument}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="rounded bg-navy px-6 text-white hover:bg-navy-hover h-[43px]"
                  disabled={submittingDocument}
                >
                  {submittingDocument ? "Menyimpan..." : submitLabel}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
