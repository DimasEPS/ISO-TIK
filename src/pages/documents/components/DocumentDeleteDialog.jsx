import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DocumentDeleteDialog({ open, onOpenChange, documentData, onConfirm }) {
  const [typedTitle, setTypedTitle] = useState("")

  useEffect(() => {
    if (open) setTypedTitle("")
  }, [open])

  const handleConfirm = () => {
    if (!documentData?.judul) return
    if (typedTitle.trim() !== documentData.judul.trim()) return
    onConfirm?.(documentData)
    onOpenChange?.(false)
  }

  const canDelete =
    Boolean(documentData?.judul) && typedTitle.trim() === documentData.judul.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] bg-white">
        <DialogHeader className="space-y-2">
          <DialogTitle className="heading-3 text-red-600">Hapus Dokumen</DialogTitle>
          <DialogDescription className="text-gray-dark">
            Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-red bg-red-light p-4 text-sm text-red">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Peringatan!</p>
              <p>Tindakan ini tidak dapat dibatalkan. Dokumen akan dihapus secara permanen.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-navy">
            Untuk menghapus dokumen, ketik judul dokumen berikut:
          </p>
          <input
            readOnly
            value={documentData?.noDoc || "-"}
            className="h-11 w-full rounded-lg border border-transparent bg-[#F5F7FB] px-4 text-navy"
          />
          <input
            value={typedTitle}
            onChange={(event) => setTypedTitle(event.target.value)}
            placeholder="Ketik judul dokumen di sini"
            className="h-11 w-full rounded-lg border border-transparent bg-[#F5F7FB] px-4 text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
          />
        </div>

        <DialogFooter className="pt-4 sm:gap-0">
          <DialogClose asChild>
            <button className="h-11 px-6 border-gray-dark border hover:bg-gray-dark text-navy rounded-[4px] mr-2">
              Batal
            </button>
          </DialogClose>
          <button
            className="h-11 px-6 bg-red-light rounded-[4px] text-red border border-red hover:text-white transition transform hover:bg-red"
            onClick={handleConfirm}
            disabled={!canDelete}
          >
            Hapus Dokumen
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
