import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function NCRAddModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [hasInteracted, setHasInteracted] = useState({
    title: false,
    description: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    // Reset form
    setFormData({ title: "", description: "" });
    setHasInteracted({ title: false, description: false });
    onClose();
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "" });
    setHasInteracted({ title: false, description: false });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white" showCloseButton={true}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-navy mb-2">
              Tambah Dokumen NCR
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-dark">
              Lengkapi form di bawah ini untuk menambah dokumen NCR baru
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm text-gray-dark">
                Judul
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (!hasInteracted.title) {
                    setHasInteracted({ ...hasInteracted, title: true });
                  }
                }}
                onFocus={() => {
                  if (!hasInteracted.title) {
                    setFormData({ ...formData, title: "" });
                  }
                }}
                className="w-full bg-gray-light border-gray-300 focus:border-black focus:border-2 focus-visible:ring-0"
                placeholder="Masukkan Judul Dokumen"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm text-gray-dark">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (!hasInteracted.description) {
                    setHasInteracted({ ...hasInteracted, description: true });
                  }
                }}
                onFocus={() => {
                  if (!hasInteracted.description) {
                    setFormData({ ...formData, description: "" });
                  }
                }}
                className="w-full min-h-[120px] bg-gray-light border-gray-300 resize-none focus:border-black focus:border-2 focus-visible:ring-0"
                placeholder="Masukkan Deskripsi Dokumen"
                required
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
              className="h-12 px-6 bg-navy text-white hover:bg-navy-hover"
            >
              Simpan Dokumen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
