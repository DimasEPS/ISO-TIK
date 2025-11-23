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

  const initialCategory = useMemo(() => {
    if (parsedDefaultValues.category) return parsedDefaultValues.category
    return categoryOptions[0]?.label ?? "Semua Kategori"
  }, [parsedDefaultValues, categoryOptions])
  const [internalCategory, setInternalCategory] = useState(initialCategory)

  const isQuestionVariant = variant === "question"
  const isCategoryVariant = variant === "category"
  const isDocumentVariant = !isQuestionVariant && !isCategoryVariant
  const isEditMode = mode === "edit"

  const memoizedDocumentDefaults = useMemo(
    () => buildDocumentFormState(parsedDefaultValues, documentStatusOptions),
    [parsedDefaultValues, documentStatusOptions],
  )

  const [documentForm, setDocumentForm] = useState(() => memoizedDocumentDefaults)
  const [internalSubmitting, setInternalSubmitting] = useState(false)

  useEffect(() => {
    if (!isDialogOpen) {
      setInternalCategory(initialCategory)
      setDocumentForm(memoizedDocumentDefaults)
      setStatusDropdownOpen(false)
      setInternalSubmitting(false)
    }
  }, [isDialogOpen, memoizedDocumentDefaults, initialCategory])

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
        isQuestionVariant
          ? "h-14 gap-2 bg-navy px-6 text-white hover:bg-navy-hover w-[203px]"
          : isCategoryVariant
          ? "h-14 gap-2 bg-navy px-6 text-white hover:bg-navy-hover w-[203px]"
          : "bg-navy text-gray-light hover:bg-navy-hover h-14 w-[203px]"
      }
    >
      <Plus className="h-5 w-5" /> {triggerLabel ?? (isQuestionVariant ? "Tambah Pertanyaan" : "Tambah Dokumen SoA")}
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

  const selectedStatusLabel =
    documentStatusOptions.find((option) => option.value === documentForm.status)?.label ??
    documentForm.status

  const submittingDocument = documentSubmitting || internalSubmitting

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
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <DropdownMenu open={isCategoryMenuOpen} onOpenChange={setIsCategoryMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-[4px] bg-state px-4 py-3 text-left body font-semibold text-gray-dark"
                      >
                        {internalCategory}
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
                          onClick={() => {
                            setInternalCategory(option.label)
                            setIsCategoryMenuOpen(false)
                          }}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kodePertanyaan" className="body-medium text-gray-dark">
                    Kode Pertanyaan
                  </Label>
                  <Input
                    id="kodePertanyaan"
                    defaultValue={defaultValues.code}
                    placeholder="Contoh A.5.1"
                    className="h-12 border border-transparent bg-state text-navy px-4 py-3 text-sm rounded-[4px] focus:border-navy focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namaPertanyaan" className="body-medium text-gray-dark">
                    Nama Pertanyaan
                  </Label>
                  <Input
                    id="namaPertanyaan"
                    defaultValue={defaultValues.name}
                    placeholder="Masukkan Nama Pertanyaan"
                    className="h-12 border border-transparent bg-state text-navy px-4 py-3 text-sm rounded-[4px] focus:border-navy focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isiPertanyaan" className="body-medium text-gray-dark">
                    Pertanyaan
                  </Label>
                  <textarea
                    id="isiPertanyaan"
                    defaultValue={defaultValues.question}
                    placeholder="Masukkan Pertanyaan"
                    className="min-h-[120px] w-full border border-transparent bg-state text-navy px-4 py-3 text-sm rounded-[4px] focus:border-navy focus:outline-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="rounded-[4px]" variant="outline">
                    Batal
                  </Button>
                </DialogClose>
                <Button type="button" className="hover:bg-navy-hover! rounded-[4px]" onClick={() => setIsDialogOpen(false)}>
                  {submitLabel}
                </Button>
              </DialogFooter>
            </>
          ) : isCategoryVariant ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kodeKategori" className="body-medium text-gray-dark">
                    Kategori
                  </Label>
                  <Input
                    id="kodeKategori"
                    defaultValue={defaultValues.code}
                    placeholder="Contoh A.5"
                    className="bg-state body text-navy h-12 px-4 py-3 rounded-[4px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namaKategori" className="body-medium text-gray-dark">
                    Nama Kategori
                  </Label>
                  <Input
                    id="namaKategori"
                    defaultValue={defaultValues.name}
                    placeholder="Masukkan Nama Kategori"
                    className="bg-state body text-navy h-12 px-4 py-3 rounded-[4px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deskripsiKategori" className="body-medium text-gray-dark">
                    Deskripsi
                  </Label>
                  <textarea
                    id="deskripsiKategori"
                    defaultValue={defaultValues.description}
                    placeholder="Masukkan Deskripsi"
                    className="min-h-[120px] w-full rounded-[4px] border bg-state body text-navy px-4 py-3 focus:border-navy focus:outline-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="rounded-[4px]" variant="outline">
                    Batal
                  </Button>
                </DialogClose>
                <Button type="button" className="hover:bg-navy-hover! rounded-[4px]" onClick={() => setIsDialogOpen(false)}>
                  {submitLabel}
                </Button>
              </DialogFooter>
            </>
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
                    className="rounded-[8px] border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
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
                    className="rounded-[8px] border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
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
                  className="rounded-[8px] border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
                  required
                  disabled={submittingDocument}
                />
              </div>

              <div className="grid gap-4">
                <div className="grid gap-3">
                  <div className="grid gap-3">
                    <Label htmlFor="revision">Revisi</Label>
                    <Input
                      id="revision"
                      value={documentForm.revision}
                      onChange={handleDocumentInputChange("revision")}
                      placeholder="Masukkan Revisi"
                    className="rounded-[8px] border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
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
                    className="rounded-[8px] border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
                      disabled={submittingDocument}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-3">
                    <Label htmlFor="compiler_name">Penyusun</Label>
                    <Input
                      id="compiler_name"
                      value={documentForm.compiler_name}
                      onChange={handleDocumentInputChange("compiler_name")}
                      placeholder="Masukkan Nama Penyusun"
                    className="rounded-[8px] border border-transparent bg-state text-navy h-12 px-4 py-3 placeholder:text-gray-400 focus:border-navy focus:bg-white transition-colors"
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
                      className="rounded-[4px]! transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
                      disabled={submittingDocument}
                    />
                  </div>
                </div>

                <div className="grid gap-3 ">
                  <div className="grid gap-3">
                    <Label htmlFor="director_name">Direktur</Label>
                    <Input
                      id="director_name"
                      value={documentForm.director_name}
                      onChange={handleDocumentInputChange("director_name")}
                      placeholder="Masukkan Nama Direktur"
                      className="rounded-[4px]! transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
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
                      }))}
                      classNameButton="w-full h-12! bg-state text-navy rounded-[8px] border border-transparent"
                      classNameDropdown="w-[]"
                      showFunnelIcon={false}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-[8px] border-gray-300 text-navy"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={submittingDocument}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="rounded-[8px] bg-navy px-6 text-white hover:bg-navy-hover"
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
