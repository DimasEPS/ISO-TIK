import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { ConfirmationInput } from "../common";
import { useState } from "react";

export function NCRDeleteModal({ isOpen, onClose, ncrData, onConfirm }) {
  const [isValid, setIsValid] = useState(false);

  const handleDelete = () => {
    if (onConfirm && isValid) {
      onConfirm(ncrData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <TriangleAlert className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-red-500 mb-2">
                Hapus NCR
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-dark">
                Apakah Anda yakin ingin menghapus NCR ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-600 mb-2">
              Peringatan!
            </p>
            <p className="text-sm text-red-700">
              Tindakan ini tidak dapat dibatalkan. NCR akan dihapus secara permanen.
            </p>
          </div>

          <div className="mt-4">
            <ConfirmationInput
              label="Untuk menghapus NCR, ketik judul NCR berikut:"
              placeholder="Ketik judul NCR di sini"
              expectedValue={ncrData?.title || ""}
              onValidChange={setIsValid}
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 px-6 border-gray-300"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={!isValid}
            className="h-12 px-6 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hapus NCR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
