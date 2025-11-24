import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DocumentDeleteDialog({
  open,
  onOpenChange,
  documentData,
  onConfirm,
  caseSensitive = true,
  entityLabel = "Dokumen",
}) {
  const [typedTitle, setTypedTitle] = useState("")

  useEffect(() => {
    if (open) setTypedTitle("")
  }, [open])

  const normalize = (value) => {
    const workingValue = value?.toString().trim() ?? ""
    return caseSensitive ? workingValue : workingValue.toLowerCase()
  }

  const confirmationLabel = documentData?.judul ?? documentData?.noDoc ?? ""

  const handleConfirm = () => {
    if (!confirmationLabel) return
    if (normalize(typedTitle) !== normalize(confirmationLabel)) return
    onConfirm?.(documentData)
    onOpenChange?.(false)
  }

  const canDelete =
    Boolean(confirmationLabel) && normalize(typedTitle) === normalize(confirmationLabel)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] bg-white">
        <DialogHeader className="space-y-2">
          <DialogTitle className="heading-3 text-red-600">Hapus {entityLabel}</DialogTitle>
          <DialogDescription className="text-gray-dark">
            Apakah Anda yakin ingin menghapus {entityLabel.toLowerCase()} ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-red bg-red-light p-4 text-sm text-red">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Peringatan!</p>
              <p>Tindakan ini tidak dapat dibatalkan. {entityLabel} akan dihapus secara permanen.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-navy">
            Untuk menghapus {entityLabel.toLowerCase()}, ketik judul berikut:
          </p>
          <input
            readOnly
            value={confirmationLabel || "-"}
            className="h-11 w-full rounded-lg border border-transparent bg-[#F5F7FB] px-4 text-navy"
          />
          <input
            value={typedTitle}
            onChange={(event) => setTypedTitle(event.target.value)}
            placeholder={`Ketik judul ${entityLabel.toLowerCase()} di sini`}
            className="h-11 w-full rounded-lg border border-transparent bg-[#F5F7FB] px-4 text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
          />
        </div>

        <DialogFooter className="pt-4 sm:gap-0">
          <DialogClose asChild>
            <button className="h-11 px-6 border-gray-dark border hover:bg-gray-dark text-navy rounded-lg mr-2">
              Batal
            </button>
          </DialogClose>
          <button
            className="h-11 px-6 bg-red-light rounded-lg text-red border border-red hover:text-white transition transform hover:bg-red"
            onClick={handleConfirm}
            disabled={!canDelete}
          >
            Hapus {entityLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
