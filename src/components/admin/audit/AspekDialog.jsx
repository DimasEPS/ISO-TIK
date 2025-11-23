import { useState, useEffect } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function AspekDialog({
  mode = "add",
  aspek,
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isSubmitting = false,
  checklistId,
  checklists = [],
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: aspek?.name || "",
    description: aspek?.description || "",
    selectedChecklistId: aspek?.checklistId || checklistId || undefined,
  });

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  useEffect(() => {
    if (aspek) {
      setFormData({
        name: aspek.name || "",
        description: aspek.description || "",
        selectedChecklistId: aspek.checklistId || checklistId || "",
      });
    } else if (checklistId) {
      setFormData((prev) => ({
        ...prev,
        selectedChecklistId: checklistId,
      }));
    }
  }, [aspek, checklistId]);

  const isAddMode = mode === "add";
  const title = isAddMode ? "Tambah Aspek Audit" : "Edit Aspek Audit";
  const subtitle = isAddMode
    ? "Lengkapi form di bawah ini untuk menambah aspek audit baru"
    : "Ubah informasi aspek audit sesuai kebutuhan";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.name.trim()) {
      toast.warning("Nama aspek wajib diisi", {
        description:
          "Pastikan semua field yang wajib sudah terisi dengan benar.",
      });
      return;
    }

    if (!formData.description || !formData.description.trim()) {
      toast.warning("Deskripsi wajib diisi", {
        description:
          "Pastikan semua field yang wajib sudah terisi dengan benar.",
      });
      return;
    }

    if (!formData.selectedChecklistId) {
      toast.warning("Checklist belum dipilih", {
        description: "Silakan pilih checklist terlebih dahulu.",
      });
      return;
    }

    try {
      // Map frontend field names ke backend field names
      const payload = {
        aspect_name: formData.name.trim(),
        description: formData.description.trim(),
        id_audit_checklists: formData.selectedChecklistId,
      };

      await onSave(payload);

      toast.success(
        isAddMode
          ? "Aspek audit berhasil ditambahkan!"
          : "Aspek audit berhasil diperbarui!",
        {
          description: isAddMode
            ? `Aspek "${formData.name}" telah ditambahkan ke sistem.`
            : `Perubahan pada aspek "${formData.name}" telah disimpan.`,
        }
      );

      setOpen(false);
      if (isAddMode) {
        setFormData({
          name: "",
          description: "",
          selectedChecklistId: checklistId || undefined,
        });
      }
    } catch (error) {
      console.error("Error response:", error);
      console.error("Error data:", error.response?.data);

      const errorMessage =
        error.message || "Terjadi kesalahan saat menyimpan aspek.";
      const errorDetails = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(", ")
        : error.response?.data?.message || errorMessage;

      toast.error(
        isAddMode ? "Gagal menambah aspek" : "Gagal memperbarui aspek",
        {
          description: errorDetails,
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
      Tambah Aspek
    </Button>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || DefaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="heading-3 text-navy">{title}</DialogTitle>
          <p className="text-gray-dark small mt-1">{subtitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-navy">
              Nama Aspek <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange("name")}
              placeholder="Masukkan nama aspek"
              className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-navy">
              Deskripsi <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange("description")}
              placeholder="Masukkan deskripsi aspek"
              className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy min-h-[100px]"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checklist" className="text-sm text-navy">
              Checklist <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.selectedChecklistId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, selectedChecklistId: value }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="rounded-lg bg-state focus:bg-gray-light focus:border-2 focus:border-navy h-12">
                <SelectValue placeholder="Pilih checklist" />
              </SelectTrigger>
              <SelectContent>
                {checklists.length === 0 ? (
                  <div className="p-2 text-sm text-gray-dark text-center">
                    Tidak ada checklist tersedia
                  </div>
                ) : (
                  checklists.map((checklist) => (
                    <SelectItem key={checklist.id} value={checklist.id}>
                      {checklist.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-dark">
              Pilih checklist yang akan dikaitkan dengan aspek ini
            </p>
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
                ? "Simpan Aspek"
                : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteAspekDialog({
  aspek,
  onDelete,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isDeleting = false,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirmText !== aspek.name) {
      toast.warning("Nama aspek tidak sesuai", {
        description: "Pastikan Anda mengetik nama aspek dengan benar.",
      });
      return;
    }

    try {
      await onDelete();
      toast.success("Aspek audit berhasil dihapus!", {
        description: `Aspek "${aspek.name}" telah dihapus dari sistem.`,
      });
      setOpen(false);
      setConfirmText("");
    } catch (error) {
      toast.error("Gagal menghapus aspek", {
        description: error.message || "Terjadi kesalahan saat menghapus aspek.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="heading-3 text-red-600">
              Hapus Aspek Audit
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm font-semibold text-red-800 mb-2">
              Peringatan!
            </p>
            <p className="text-sm text-red-700">
              Tindakan ini tidak dapat dibatalkan. Aspek audit dan semua
              kategori di dalamnya akan dihapus secara permanen.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Untuk menghapus aspek, ketik nama aspek berikut:
            </p>
            <p className="font-semibold text-navy mb-3">{aspek.name}</p>
          </div>

          <form onSubmit={handleDelete} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm text-gray-700">
                Ketik nama aspek di sini
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Masukkan nama aspek"
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
                disabled={confirmText !== aspek.name || isDeleting}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Menghapus..." : "Hapus Aspek"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function KategoriDialog({
  aspek,
  kategori,
  mode = "add",
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: kategori?.name || "",
  });

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  useEffect(() => {
    if (kategori) {
      setFormData({
        name: kategori.name || "",
      });
    }
  }, [kategori]);

  const isAddMode = mode === "add";
  const title = isAddMode ? "Tambah Kategori" : "Edit Kategori";
  const subtitle = isAddMode
    ? `Tambah kategori baru ke aspek "${aspek?.name}"`
    : "Ubah informasi kategori sesuai kebutuhan";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setOpen(false);
    if (isAddMode) {
      setFormData({ name: "" });
    }
  };

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="heading-3 text-navy">{title}</DialogTitle>
          <p className="text-gray-dark small mt-1">{subtitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="kategori-name" className="text-sm text-navy">
              Nama Kategori
            </Label>
            <Input
              id="kategori-name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama kategori"
              className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-lg">
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="rounded-lg bg-navy hover:bg-navy-hover"
            >
              {isAddMode ? "Simpan Kategori" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
