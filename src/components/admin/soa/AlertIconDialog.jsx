import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, Eye, FilePen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const titleMap = {
  view: "Detail Dokumen SoA",
  edit: "Edit Dokumen SoA",
  delete: "Hapus Dokumen SoA",
}

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "In Progress", value: "in_progress" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Approved", value: "approved" },
]

const DISPLAY_STATUS_TO_API = {
  Draft: "draft",
  "In Progress": "in_progress",
  Reviewed: "reviewed",
  Approved: "approved",
}

export function AlertIconDialog({
  type,
  row,
  className = "",
  trigger,
  onEditSubmit,
  editSubmitting = false,
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const readOnly = type === "view"
  const isDelete = type === "delete"
  const [formData, setFormData] = useState(() => buildEditFormState(row))
  const [confirmInput, setConfirmInput] = useState("")
  const [internalEditSubmitting, setInternalEditSubmitting] = useState(false)
  const isEditSubmitting = editSubmitting || internalEditSubmitting

  useEffect(() => {
    setFormData(buildEditFormState(row))
  }, [row])

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    const documentId = row?.id ?? row?.noDoc
    if (!onEditSubmit || !documentId) {
      console.warn("Edit submit ignored: missing handler or document identifier")
      return
    }

    const payload = mapEditFormToPayload(formData)

    try {
      setInternalEditSubmitting(true)
      await onEditSubmit(documentId, payload)
      setOpen(false)
    } catch (error) {
      console.error("Gagal memperbarui dokumen SoA", error)
      alert(error?.message ?? "Gagal memperbarui dokumen SoA")
    } finally {
      setInternalEditSubmitting(false)
    }
  }

  const handleNavigateToReview = (mode) => {
    const params = new URLSearchParams()
    if (mode) params.set("mode", mode)
    if (row?.id) params.set("documentId", row.id)
    const query = params.toString()
    navigate(`/admin/soa/review${query ? `?${query}` : ""}`)
  }

  const defaultTrigger = (
    <button type="button" className={className}>
      {type === "view" && (
        <Eye className="text-[#121A2E] w-5 h-5 cursor-pointer" />
      )}
      {type === "edit" && (
        <FilePen className="text-[#2B7FFF] w-5 h-5 cursor-pointer" />
      )}
      {type === "delete" && (
        <AlertTriangle className="text-[#FB2C36] w-5 h-5 cursor-pointer" />
      )}
    </button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger({ open, setOpen })
        ) : (
          defaultTrigger
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[640px] space-y-6">
        <DialogHeader className="space-y-1">
          <DialogTitle
            className={`heading-3 ${isDelete ? "text-[#B42318]" : "text-navy"}`}
          >
            {titleMap[type]}
          </DialogTitle>
          <p className="text-gray-dark small">
            Informasi lengkap mengenai dokumen SoA yang dipilih
          </p>
        </DialogHeader>

        {readOnly ? (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-navy">
              <InfoPair label="No Dokumen">
                <span className="text-green heading-4-bold">{row.noDoc}</span>
              </InfoPair>
              <InfoPair label="Tanggal Dibuat">{row.tanggalDibuat}</InfoPair>
              <InfoPair label="Judul Dokumen">
                <span className="heading-4 text-navy">{row.judul}</span>
              </InfoPair>
              <InfoPair label="Tanggal Terbit">{row.tanggalTerbit}</InfoPair>
              <InfoPair label="Klasifikasi">{row.klasifikasi ?? "-"}</InfoPair>
              <InfoPair label="Revisi">{row.revisi ?? "-"}</InfoPair>
              <InfoPair label="Penyusun">{row.penyusun}</InfoPair>
              <InfoPair label="Ketua ISO">{row.ketuaIso}</InfoPair>
              <InfoPair label="Direktur">{row.direktur}</InfoPair>
              <div className="flex flex-col gap-1">
                <span className="small text-gray-dark">Status</span>
                <span
                  className={`inline-flex items-center justify-center rounded-[4px] px-3 py-1 text-xs font-semibold ${getStatusClass(row.status)}`}
                >
                  {row.status}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  handleNavigateToReview("view")
                }}
              >
                Lihat Jawaban
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setOpen(false)
                  handleNavigateToReview()
                }}
              >
                Isi Jawaban
              </Button>
            </div>
          </>
        ) : isDelete ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-red bg-red-light px-4 py-3 text-sm text-red space-y-1">
              <p className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Peringatan!
              </p>
              <p>Tindakan ini tidak dapat dibatalkan. Dokumen akan dihapus secara permanen.</p>
            </div>

            <div className="space-y-2">
              <p className="small text-gray-dark">
                Untuk menghapus dokumen, ketik judul dokumen berikut:
              </p>
              <div className="rounded-md bg-state px-4 py-3 text-navy font-semibold">
                {row.judul}
              </div>
              <Input
                value={confirmInput}
                onChange={(event) => setConfirmInput(event.target.value)}
                placeholder="Ketik judul dokumen di sini"
                className="bg-state text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:ring-0"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setOpen(false)} className={`cursor-pointer rounded-[4px]`}>
                Batal
              </Button>
              <Button
                type="button"
                variant="outline"
                className={`text-red bg-red-light border border-red hover:bg-red hover:text-white cursor-pointer! rounded-[4px]`}
              >
                Hapus Dokumen
              </Button>
            </div>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="No Dokumen">
                <Input
                  value={formData.noDoc}
                  onChange={handleChange("noDoc")}
                  className="bg-state text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:ring-0 h-12"
                  disabled={isEditSubmitting}
                />
              </FormField>
              <FormField label="Tanggal Terbit">
                <Input
                  type="date"
                  value={formData.tanggalTerbit}
                  onChange={handleChange("tanggalTerbit")}
                  className="bg-state text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:ring-0 h-12"
                  disabled={isEditSubmitting}
                />
              </FormField>
            </div>
            <FormField label="Judul Dokumen">
              <Input
                value={formData.judul}
                onChange={handleChange("judul")}
                className="bg-state text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:ring-0 h-12"
                disabled={isEditSubmitting}
              />
            </FormField>
            <FormField label="Revisi">
              <Input
                value={formData.revisi}
                onChange={handleChange("revisi")}
                className="bg-state text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:ring-0 h-12"
                disabled={isEditSubmitting}
              />
            </FormField>
            <FormField label="Klasifikasi">
              <Input
                value={formData.klasifikasi}
                onChange={handleChange("klasifikasi")}
                className="bg-state text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:ring-0 h-12"
                disabled={isEditSubmitting}
              />
            </FormField>
            <FormField label="Penyusun">
              <Input
                value={formData.penyusun}
                onChange={handleChange("penyusun")}
                className="bg-state text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:ring-0 h-12"
                disabled={isEditSubmitting}
              />
            </FormField>
            <FormField label="Ketua ISO">
              <Input
                value={formData.ketuaIso}
                onChange={handleChange("ketuaIso")}
                className="bg-state text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:ring-0 h-12"
                disabled={isEditSubmitting}
              />
            </FormField>
            <FormField label="Direktur">
              <Input
                value={formData.direktur}
                onChange={handleChange("direktur")}
                className="bg-state text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:ring-0 h-12"
                disabled={isEditSubmitting}
              />
            </FormField>
            <FormField label="Status">
              <select
                value={formData.status}
                onChange={handleChange("status")}
                className="bg-state w-full text-center text-navy border border-transparent focus:border-2 focus:border-navy-hover focus:outline-none h-12 rounded-md px-3 h-12"
                disabled={isEditSubmitting}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isEditSubmitting}>
                {isEditSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function buildEditFormState(row = {}) {
  const editable = row?.editable ?? {}

  const resolvedPublishDate =
    editable.publish_date ??
    row?.tanggalTerbitInput ??
    normalizeDateField(row?.tanggalTerbit) ??
    ""

  return {
    noDoc: editable.document_number ?? row?.noDoc ?? "",
    tanggalTerbit: resolvedPublishDate,
    judul: editable.title ?? row?.judul ?? "",
    revisi: editable.revision ?? sanitizeDisplayValue(row?.revisi),
    klasifikasi: editable.classification ?? sanitizeDisplayValue(row?.klasifikasi),
    penyusun: editable.compiler_name ?? sanitizeDisplayValue(row?.penyusun),
    ketuaIso: editable.iso_chairman_name ?? sanitizeDisplayValue(row?.ketuaIso),
    direktur: editable.director_name ?? sanitizeDisplayValue(row?.direktur),
    status:
      editable.status ??
      row?.statusRaw ??
      DISPLAY_STATUS_TO_API[row?.status] ??
      "draft",
  }
}

function mapEditFormToPayload(state = {}) {
  return {
    document_number: state.noDoc?.trim(),
    publish_date: normalizeDateField(state.tanggalTerbit),
    title: state.judul?.trim(),
    revision: state.revisi?.trim(),
    classification: state.klasifikasi?.trim() || null,
    compiler_name: state.penyusun?.trim() || null,
    iso_chairman_name: state.ketuaIso?.trim() || null,
    director_name: state.direktur?.trim() || null,
    status: state.status || "draft",
  }
}

function sanitizeDisplayValue(value) {
  if (value === "-" || value == null) {
    return ""
  }
  return value
}

function normalizeDateField(value) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const [datePart] = trimmed.split("T")
  return datePart
}

function InfoPair({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="small text-gray-dark">{label}</span>
      <span className="text-base font-semibold text-navy">{children}</span>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <label className="text-sm font-medium text-gray-dark space-y-2">
      <span className="block small text-gray-dark">{label}</span>
      {children}
    </label>
  )
}

function getStatusClass(status) {
  switch (status) {
    case "Draft":
      return "bg-gray-light text-navy-hover border border-[#D7DBE4] shadow-sm small"
    case "In Progress":
      return "bg-yellow-light text-yellow border border-[#F4E0A3] shadow-sm small"
    case "Reviewed":
      return "bg-blue-light text-blue border border-[#C5D4FF] shadow-sm small"
    case "Approved":
      return "bg-green-light text-green border border-[#BDECCB] shadow-sm small"
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200"
  }
}
