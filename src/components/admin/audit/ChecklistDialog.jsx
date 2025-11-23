import { useState, useEffect } from "react";
import { Plus, FilePen, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function ChecklistDialog({
  mode = "add",
  checklist,
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isSubmitting = false,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: checklist?.title || "",
    description: checklist?.description || "",
  });

  // Use controlled state if provided, otherwise use internal state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  // Update form data when checklist changes
  useEffect(() => {
    if (checklist) {
      setFormData({
        title: checklist.title || "",
        description: checklist.description || "",
      });
    }
  }, [checklist]);

  const isAddMode = mode === "add";
  const title = isAddMode ? "Tambah Checklist" : "Edit Checklist";
  const subtitle = isAddMode
    ? "Lengkapi form di bawah ini untuk menambah checklist baru"
    : "Ubah informasi checklist sesuai kebutuhan";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title?.trim()) {
      toast.error("Judul checklist wajib diisi!");
      return;
    }

    if (!formData.description?.trim()) {
      toast.error("Deskripsi checklist wajib diisi!");
      return;
    }

    // Map to backend field names
    const payload = {
      checklist_name: formData.title.trim(),
      description: formData.description.trim(),
    };

    try {
      await onSave?.(payload);

      toast.success(
        isAddMode
          ? "Checklist berhasil ditambahkan!"
          : "Checklist berhasil diupdate!",
        {
          description: `Checklist "${formData.title}" telah disimpan`,
        }
      );

      setOpen(false);
      if (isAddMode) {
        setFormData({ title: "", description: "" });
      }
    } catch (error) {
      const errorMsg =
        error?.data?.message || error?.message || "Unknown error";
      const errorDetails = error?.data?.errors
        ? Object.entries(error.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n")
        : null;

      toast.error(
        isAddMode
          ? "Gagal menambahkan checklist"
          : "Gagal mengupdate checklist",
        {
          description: errorDetails || errorMsg,
          duration: 7000,
        }
      );
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const DefaultTrigger = isAddMode ? (
    <Button className="bg-navy hover:bg-navy-hover text-white rounded-lg h-[52px] gap-2">
      <Plus className="w-5 h-5" />
      Tambah Checklist
    </Button>
  ) : (
    <button
      type="button"
      className="hover:bg-blue-50 p-2 rounded transition-colors"
    >
      <FilePen className="text-[#2B7FFF] w-5 h-5 cursor-pointer" />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || DefaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="heading-3 text-navy">{title}</DialogTitle>
          <p className="text-gray-dark small mt-1">{subtitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm text-navy">
              Judul Checklist <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange("title")}
              placeholder="Masukkan judul checklist"
              className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-navy">
              Deskripsi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange("description")}
              placeholder="Masukkan deskripsi checklist"
              className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy min-h-[100px]"
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
                : isAddMode
                ? "Simpan Checklist"
                : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteChecklistDialog({
  checklist,
  onDelete,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isDeleting = false,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Use controlled state if provided, otherwise use internal state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirmText !== checklist.title) {
      toast.warning("Judul checklist tidak sesuai", {
        description: "Pastikan Anda mengetik judul checklist dengan benar.",
      });
      return;
    }

    try {
      await onDelete();
      toast.success("Checklist berhasil dihapus!", {
        description: `Checklist "${checklist.title}" telah dihapus dari sistem.`,
      });
      setOpen(false);
      setConfirmText("");
    } catch (error) {
      toast.error("Gagal menghapus checklist", {
        description:
          error.message || "Terjadi kesalahan saat menghapus checklist.",
      });
    }
  };

  const DefaultTrigger = (
    <button
      type="button"
      className="hover:bg-red-50 p-2 rounded transition-colors"
    >
      <AlertTriangle className="text-[#FB2C36] w-5 h-5 cursor-pointer" />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || DefaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="heading-3 text-red-600">
              Hapus Checklist
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm font-semibold text-red-800 mb-2">
              Peringatan!
            </p>
            <p className="text-sm text-red-700">
              Tindakan ini tidak dapat dibatalkan. Checklist akan dihapus secara
              permanen.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Untuk menghapus checklist, ketik judul checklist berikut:
            </p>
            <p className="font-semibold text-navy mb-3">{checklist.title}</p>
          </div>

          <form onSubmit={handleDelete} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm text-gray-700">
                Ketik judul checklist di sini
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Masukkan judul checklist"
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
                  onClick={() => setConfirmText("")}
                  disabled={isDeleting}
                >
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={confirmText !== checklist.title || isDeleting}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Menghapus..." : "Hapus Checklist"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
