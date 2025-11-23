import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteDialog({ row, onDelete, isDeleting, className = "" }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const expectedText = row.judul || "Checklist Audit";

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirmText === expectedText) {
      if (!onDelete) {
        setOpen(false);
        setConfirmText("");
        return;
      }

      try {
        await onDelete(row.id);

        toast.success("Dokumen audit berhasil dihapus!", {
          description: `Dokumen "${expectedText}" telah dihapus`,
        });

        setOpen(false);
        setConfirmText("");
      } catch (error) {
        const errorMsg =
          error?.data?.message || error?.message || "Unknown error";
        toast.error("Gagal menghapus dokumen", {
          description: errorMsg,
          duration: 7000,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={className}>
          <Trash2 className="text-[#FB2C36] w-5 h-5 cursor-pointer" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="heading-3 text-red-600">
              Hapus Dokumen Audit
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm font-semibold text-red-800 mb-2">
              Peringatan!
            </p>
            <p className="text-sm text-red-700">
              Tindakan ini tidak dapat dibatalkan. Dokumen akan dihapus secara
              permanen.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Untuk menghapus dokumen, ketik judul dokumen berikut:
            </p>
            <p className="font-semibold text-navy mb-3">{expectedText}</p>
          </div>

          <form onSubmit={handleDelete} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm text-gray-700">
                Ketik judul dokumen di sini
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Masukkan judul dokumen"
                className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setConfirmText("")}
                >
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={confirmText !== expectedText || isDeleting}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Menghapus..." : "Hapus Dokumen"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
