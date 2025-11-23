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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const EMPTY_FORM = {
  description: "",
  deskripsi: "",
};

export function FindingAddModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState(() => ({ ...EMPTY_FORM }));
  const [hasInteracted, setHasInteracted] = useState({
    deskripsi: false,
  });

  const descriptionValue = formData.description ?? formData.deskripsi ?? "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ ...formData, description: descriptionValue, deskripsi: descriptionValue });
    }
    // Reset form
    setFormData({ ...EMPTY_FORM });
    setHasInteracted({
      deskripsi: false,
    });
    onClose();
  };

  const handleCancel = () => {
    setFormData({ ...EMPTY_FORM });
    setHasInteracted({
      deskripsi: false,
    });
    onClose();
  };

  const handleInputFocus = (field) => {
    if (!hasInteracted[field]) {
      setFormData({ ...formData, description: "", deskripsi: "" });
      setHasInteracted({ ...hasInteracted, [field]: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy">
            Tambah Temuan Ketidaksesuaian
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-dark">
            Isi detail untuk menambahkan temuan ketidaksesuaian baru.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Temuan Ketidaksesuaian */}
            <div className="space-y-2">
              <Label htmlFor="deskripsi" className="text-sm font-medium text-gray-dark">
                Temuan Ketidaksesuaian
              </Label>
              <Textarea
                id="deskripsi"
                placeholder="Masukkan Temuan Ketidaksesuaian"
                value={descriptionValue}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setFormData({ ...formData, description: nextValue, deskripsi: nextValue });
                }}
                onFocus={() => handleInputFocus("deskripsi")}
                className="min-h-[120px] resize-none border-gray-300 focus-visible:border-black! focus-visible:border-2! focus-visible:ring-0!"
              />
            </div>
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
              Tambah Temuan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
