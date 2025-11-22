import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const EMPTY_FORM = {
  nomor: "",
  judul: "",
};

export function ManualClauseFormDialog({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, ...(initialData ?? {}) });
    }
  }, [open, initialData]);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSave = () => {
    if (!form.nomor.trim() || !form.judul.trim()) return;
    onSubmit?.(form);
    onOpenChange?.(false);
  };

  const disabled = !form.nomor.trim() || !form.judul.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[520px] bg-white px-8 py-6 text-navy">
        <DialogHeader className="gap-1">
          <DialogTitle className="heading-4-bold">
            {isEdit ? "Edit Klausa Manual" : "Tambah Klausa Manual"}
          </DialogTitle>
          <p className="text-sm text-gray-dark">
            Lengkapi form di bawah ini untuk {isEdit ? "memperbarui" : "menambah"} Klausa Manual baru
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-navy">Nomor Klausa</label>
            <Input
              value={form.nomor}
              onChange={handleChange("nomor")}
              placeholder="Masukkan Judul Nomor Klausa"
              className="h-12 bg-state border-0 text-navy"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-navy">Nama Klausa</label>
            <Input
              value={form.judul}
              onChange={handleChange("judul")}
              placeholder="Masukkan Judul Klausa Manual"
              className="h-12 bg-state border-0 text-navy"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <Button variant="outline" className="h-11 px-6 text-navy border-gray-medium">
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={disabled}
            onClick={handleSave}
            className="h-11 px-6 bg-navy text-white hover:bg-navy-hover disabled:opacity-50"
          >
            Simpan Klausa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
