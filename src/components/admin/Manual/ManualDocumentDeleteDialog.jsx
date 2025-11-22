import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ManualDocumentDeleteDialog({
  open,
  onOpenChange,
  title = "",
  onConfirm,
}) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const canDelete = typed.trim() === title.trim();

  const handleConfirm = () => {
    if (!canDelete) return;
    onConfirm?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-white px-8 py-6 text-navy"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="heading-4-bold text-red">Hapus Checklist Manual</DialogTitle>
          <p className="text-sm text-gray-dark">
            Apakah Anda yakin ingin menghapus Checklist Manual ini? Tindakan ini tidak dapat dibatalkan.
          </p>
        </DialogHeader>

        <div className="rounded-md border border-red-light bg-red-light/40 p-4 text-sm text-red">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-medium">Peringatan!</p>
              <p className="text-red">
                Tindakan ini tidak dapat dibatalkan. Checklist Manual akan dihapus secara permanen.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-navy">Untuk menghapus Checklist Manual, ketik judul Manual berikut:</p>
          <Input
            value={title}
            readOnly
            className="h-11 bg-state text-navy border-0"
          />
          <Input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder="Ketik judul Checklist Manual di sini"
            className="h-11 bg-state text-navy border-0"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <Button variant="outline" className="h-11 px-6 text-navy border-gray-medium">
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!canDelete}
            className="h-11 px-6 bg-red text-white hover:bg-red/90 disabled:opacity-50"
          >
            Hapus Checklist Manual
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
