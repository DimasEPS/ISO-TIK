import { useEffect, useRef, useState } from "react"
import { CalendarIcon, UploadIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const defaultForm = {
  noDoc: "",
  judul: "",
  tanggalTerbit: "",
  deskripsi: "",
  fileName: "",
  file: null,
}

export function DocumentFormDialog({
  mode = "add",
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState(defaultForm)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        noDoc: initialData.noDoc || "",
        judul: initialData.judul || "",
        tanggalTerbit: initialData.tanggalTerbit || "",
        deskripsi: initialData.deskripsi || "",
        fileName: initialData.fileName || `${initialData.noDoc || "dokumen"}.pdf`,
        file: null,
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } else if (!open) {
      setFormData({ ...defaultForm })
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [mode, initialData, open])

  const heading = mode === "edit" ? "Edit Dokumen" : "Tambah Dokumen"
  const description =
    mode === "edit"
      ? "Ubah informasi dokumen sesuai kebutuhan"
      : "Lengkapi form di bawah ini untuk menambah dokumen baru"

  const primaryButtonLabel = mode === "edit" ? "Simpan Perubahan" : "Simpan Dokumen"
  const fileButtonLabel = mode === "edit" ? "Ubah Dokumen" : "Unggah Dokumen Baru"

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const [file] = event.target.files || []
    if (!file) return

    setFormData((prev) => ({
      ...prev,
      file,
      fileName: file.name,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      id: initialData?.id,
      noDoc: formData.noDoc?.trim() || "",
      judul: formData.judul?.trim() || "",
      tanggalTerbit: formData.tanggalTerbit?.trim() || "",
      deskripsi: formData.deskripsi?.trim() || "",
      file: formData.file,
    }

    if (!payload.noDoc) {
      window.alert("Kode dokumen wajib diisi.")
      return
    }

    if (!payload.judul) {
      window.alert("Nama dokumen wajib diisi.")
      return
    }

    if (mode === "add" && !payload.file) {
      window.alert("File dokumen wajib diunggah.")
      return
    }

    if (!onSubmit) {
      onOpenChange?.(false)
      return
    }

    try {
      await onSubmit(payload)
      onOpenChange?.(false)
    } catch (error) {
      console.error("Gagal menyimpan dokumen", error)
      window.alert(error?.message || "Gagal menyimpan dokumen.")
    }
  }

  const handleCancel = () => {
    setFormData({ ...defaultForm })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] space-y-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="heading-3 text-navy">{heading}</DialogTitle>
          <DialogDescription className="text-gray-dark">{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="small text-gray-dark">Kode Dokumen</p>
              <input
                type="text"
                className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF]"
                placeholder="Masukkan Kode Dokumen"
                value={formData.noDoc}
                onChange={handleInputChange("noDoc")}
                readOnly={mode === "edit"}
              />
            </div>
            <div className="space-y-2">
              <p className="small text-gray-dark">Tanggal Unggah</p>
              <div className="relative">
                <input
                  type="date"
                  className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF]"
                  placeholder="27/4/2025"
                  value={formData.tanggalTerbit}
                  onChange={handleInputChange("tanggalTerbit")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="small text-gray-dark">Nama Dokumen</p>
            <input
              type="text"
              className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF]"
              placeholder="Masukkan Nama Dokumen"
              value={formData.judul}
              onChange={handleInputChange("judul")}
            />
          </div>

          <div className="space-y-2">
            <p className="small text-gray-dark">Deskripsi</p>
            <textarea
              className="min-h-24 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF]"
              placeholder="Masukkan Deskripsi Dokumen"
              value={formData.deskripsi}
              onChange={handleInputChange("deskripsi")}
            />
          </div>

          <div className="space-y-2">
            <p className="small text-gray-dark">File</p>
            {formData.fileName && (
              <p className="text-sm text-gray-dark flex items-center gap-2">
                <UploadIcon className="h-4 w-4 text-navy" />
                {formData.fileName}
              </p>
            )}
            <Button
              type="button"
              className="w-full bg-[#1F3EFF] hover:bg-[#152ab8]"
              variant="default"
              onClick={handleFileButtonClick}
              disabled={isSubmitting}
            >
              <UploadIcon className="mr-2 h-4 w-4" /> {fileButtonLabel}
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-navy hover:bg-navy-hover text-white"
              disabled={isSubmitting}
            >
              {primaryButtonLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
