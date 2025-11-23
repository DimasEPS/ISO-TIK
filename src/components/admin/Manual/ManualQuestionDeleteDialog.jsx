import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ManualQuestionDeleteDialog({
  open,
  onOpenChange,
  questionPreview = "",
  onConfirm,
}) {
  const handleDelete = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[520px] bg-white px-8 py-6 text-navy">
        <DialogHeader className="gap-1">
          <DialogTitle className="heading-4-bold text-red">Hapus Pertanyaan Klausa</DialogTitle>
          <p className="text-sm text-gray-dark">
            Apakah Anda yakin ingin menghapus Pertanyaan Klausa ini? Tindakan ini tidak dapat dibatalkan.
          </p>
        </DialogHeader>

        <div className="rounded-md border border-red-light bg-red-light/40 p-4 text-sm text-red">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Peringatan!</p>
              <p>
                Tindakan ini tidak dapat dibatalkan. Pertanyaan Klausa akan dihapus secara permanen.
              </p>
            </div>
          </div>
        </div>

        {questionPreview && (
          <div className="space-y-2">
            <p className="text-sm text-navy">
              Untuk menghapus Pertanyaan Klausa, ketik nomor Klausa berikut:
            </p>
            <div className="rounded-md border border-gray-medium bg-state p-3 text-sm font-medium text-navy">
              4.1
            </div>
            <div className="rounded-md border border-gray-medium bg-state p-3 text-sm text-gray-dark">
              Ketik judul Klausa Manual di sini
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <Button variant="outline" className="h-11 px-6 text-navy border-gray-medium">
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            className="h-11 px-6 bg-red text-white hover:bg-red/90"
          >
            Hapus Pertanyaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
