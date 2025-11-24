import { useState, useEffect } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Add/Edit Dialog
export function KategoriDialog({
  mode = "add",
  kategori = null,
  aspectId,
  open,
  onOpenChange,
  onSave,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [internalOpen, setInternalOpen] = useState(false);

  // For uncontrolled mode, use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (mode === "edit" && kategori) {
      setFormData({
        name: kategori.name || "",
      });
    } else {
      setFormData({
        name: "",
      });
    }
  }, [mode, kategori, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aspectId) {
      toast.error("Error", {
        description: "Aspect ID tidak ditemukan",
      });
      return;
    }

    try {
      await onSave?.({
        ...formData,
        aspectId: aspectId,
      });

      // Reset form and close dialog on success
      setFormData({ name: "" });

      // For uncontrolled mode (add), close the dialog
      if (mode === "add") {
        setIsOpen(false);
      }
    } catch (error) {
      // Error handling sudah ada di hook
      console.error("Submit error:", error);
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="heading-3 text-navy">
          {mode === "add"
            ? "Tambah Kategori Pertanyaan"
            : "Edit Kategori Pertanyaan"}
        </DialogTitle>
        <p className="text-gray-dark small mt-1">
          {mode === "add"
            ? "Lengkapi form di bawah ini untuk menambah kategori pertanyaan baru"
            : "Ubah informasi kategori pertanyaan sesuai kebutuhan"}
        </p>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-navy">
            Nama Kategori Pertanyaan
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Masukkan nama kategori pertanyaan"
            className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12"
            required
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              disabled={isSubmitting}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="rounded-lg bg-navy hover:bg-navy-hover"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Menyimpan..."
              : mode === "add"
              ? "Simpan Kategori Pertanyaan"
              : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  // Controlled mode
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  // Uncontrolled mode with trigger
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-navy hover:bg-navy-hover text-white rounded-lg h-[52px] gap-2">
          <Plus className="w-5 h-5" />
          Tambah Kategori
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

// Delete Confirmation Dialog
export function DeleteKategoriDialog({
  kategori,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (inputValue === kategori?.name) {
      try {
        await onConfirm?.();
        setInputValue("");
        onOpenChange?.(false);
      } catch (error) {
        // Error handling sudah ada di hook
        console.error("Delete error:", error);
      }
    }
  };

  const isValid = inputValue === kategori?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="heading-3 text-red-600">
              Hapus Kategori Pertanyaan
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm font-semibold text-red-800 mb-2">
              Peringatan!
            </p>
            <p className="text-sm text-red-700">
              Tindakan ini tidak dapat dibatalkan. Kategori Pertanyaan ini,
              beserta semua pertanyaan yang terkait akan dihapus secara
              permanen.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Untuk menghapus kategori, ketik nama kategori berikut:
            </p>
            <p className="font-semibold text-navy mb-3">{kategori?.name}</p>
          </div>

          <form onSubmit={handleDelete} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm text-gray-700">
                Ketik nama kategori di sini
              </Label>
              <Input
                id="confirm-text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Masukkan nama kategori"
                className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy"
                disabled={isDeleting}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setInputValue("")}
                  disabled={isDeleting}
                >
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={!isValid || isDeleting}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Menghapus..." : "Hapus Kategori Pertanyaan"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
