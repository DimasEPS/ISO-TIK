import { useState, useEffect } from "react";
import { Plus, AlertTriangle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function ChecklistExcelDialog({
  mode = "add",
  excelChecklist,
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
    name: excelChecklist?.name || "",
    description: excelChecklist?.description || "",
    selectedChecklistId:
      excelChecklist?.checklistId || checklistId || undefined,
  });

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  useEffect(() => {
    if (excelChecklist) {
      setFormData({
        name: excelChecklist.name || "",
        description: excelChecklist.description || "",
        selectedChecklistId:
          excelChecklist.checklistId || checklistId || undefined,
      });
    } else if (checklistId) {
      setFormData((prev) => ({
        ...prev,
        selectedChecklistId: checklistId,
      }));
    }
  }, [excelChecklist, checklistId]);

  const isAddMode = mode === "add";
  const title = isAddMode ? "Tambah Checklist Excel" : "Edit Checklist Excel";
  const subtitle = isAddMode
    ? "Lengkapi form di bawah ini untuk menambah checklist excel baru"
    : "Ubah informasi checklist excel sesuai kebutuhan";

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.name.trim()) {
      toast.warning("Nama checklist excel wajib diisi", {
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
        excel_checklist_name: formData.name.trim(),
        description: formData.description.trim(),
        id_audit_checklists: formData.selectedChecklistId,
      };

      await onSave(payload);

      toast.success(
        isAddMode
          ? "Checklist excel berhasil ditambahkan!"
          : "Checklist excel berhasil diperbarui!",
        {
          description: isAddMode
            ? `Checklist excel "${formData.name}" telah ditambahkan ke sistem.`
            : `Perubahan pada checklist excel "${formData.name}" telah disimpan.`,
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
        error.message || "Terjadi kesalahan saat menyimpan checklist excel.";
      const errorDetails = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(", ")
        : error.response?.data?.message || "";

      toast.error("Gagal menyimpan checklist excel", {
        description: errorDetails || errorMessage,
      });
    }
  };

  const DefaultTrigger = isAddMode ? (
    <Button className="bg-navy hover:bg-navy-hover text-white rounded-lg h-[52px] gap-2">
      <Plus className="w-5 h-5" />
      Tambah Checklist Excel
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
                  <div className="py-2 px-2 text-sm text-gray-dark">
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
              Pilih checklist yang akan dikaitkan dengan checklist excel ini
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-navy">
              Nama Checklist Excel <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange("name")}
              placeholder="Masukkan nama checklist excel"
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
              placeholder="Masukkan deskripsi checklist excel"
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
                ? "Simpan Checklist Excel"
                : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteChecklistExcelDialog({
  excelChecklist,
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
    if (confirmText === excelChecklist.name) {
      try {
        await onDelete();

        toast.success("Checklist excel berhasil dihapus!", {
          description: `Checklist excel "${excelChecklist.name}" telah dihapus dari sistem.`,
        });

        setOpen(false);
        setConfirmText("");
      } catch (error) {
        console.error("Error deleting excel checklist:", error);

        const errorMessage =
          error.message || "Terjadi kesalahan saat menghapus checklist excel.";
        const errorDetails = error.response?.data?.message || "";

        toast.error("Gagal menghapus checklist excel", {
          description: errorDetails || errorMessage,
        });
      }
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setConfirmText("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="heading-3 text-red-600">
              Hapus Checklist Excel
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm font-semibold text-red-800 mb-2">
              Peringatan!
            </p>
            <p className="text-sm text-red-700">
              Tindakan ini tidak dapat dibatalkan. Checklist Excel akan dihapus
              secara permanen.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Untuk menghapus checklist excel, ketik nama checklist excel
              berikut:
            </p>
            <p className="font-semibold text-navy mb-3">
              {excelChecklist.name}
            </p>
          </div>

          <form onSubmit={handleDelete} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm text-gray-700">
                Ketik nama checklist excel di sini
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Masukkan nama checklist excel"
                className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12"
                disabled={isDeleting}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  disabled={isDeleting}
                >
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={confirmText !== excelChecklist.name || isDeleting}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Menghapus..." : "Hapus Checklist Excel"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
