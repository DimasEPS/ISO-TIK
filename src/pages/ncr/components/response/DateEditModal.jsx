import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

/**
 * Modal for editing target date
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 * @param {Function} onSave - Save handler
 * @param {string} currentDate - Current date value
 */
export function DateEditModal({
  isOpen,
  onClose,
  onSave,
  currentDate = "",
}) {
  const [date, setDate] = useState(currentDate);

  useEffect(() => {
    if (currentDate) {
      setDate(currentDate);
    }
  }, [currentDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(date);
    }
    onClose();
  };

  const handleCancel = () => {
    setDate(currentDate);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy">
            Edit Tanggal Target Perbaikan
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-dark">
            Ubah Tanggal Target Perbaikan sesuai kebutuhan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="date" className="text-sm font-medium text-gray-dark">
              Tanggal Target Perbaikan
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 border-gray-300 focus-visible:border-black! focus-visible:border-2! focus-visible:ring-0!"
            />
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-12 px-6 border-gray-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-12 px-6 bg-navy text-white hover:bg-navy/90"
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
