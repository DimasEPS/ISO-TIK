import { useEffect, useState } from "react"
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
}

export function DocumentFormDialog({ mode = "add", open, onOpenChange, initialData }) {
  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        noDoc: initialData.noDoc || "",
        judul: initialData.judul || "",
        tanggalTerbit: initialData.tanggalTerbit || "",
        deskripsi: initialData.deskripsi || "",
        fileName: initialData.fileName || `${initialData.noDoc || "dokumen"}.pdf`,
      })
    } else if (!open) {
      setFormData(defaultForm)
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

  const handleSubmit = (event) => {
    event.preventDefault()
    onOpenChange?.(false)
  }

  const handleCancel = () => {
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
                  type="text"
                  className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF]"
                  placeholder="27/4/2025"
                  value={formData.tanggalTerbit}
                  onChange={handleInputChange("tanggalTerbit")}
                />
                <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              className="min-h-[96px] w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF]"
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
            <Button type="button" className="w-full bg-[#1F3EFF] hover:bg-[#152ab8]" variant="default">
              <UploadIcon className="mr-2 h-4 w-4" /> {fileButtonLabel}
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleCancel}>
              Batal
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-navy hover:bg-navy-hover text-white">
              {primaryButtonLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
