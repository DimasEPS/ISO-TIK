import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_FORM = { pertanyaan: "", panduanBuktiObjektif: "" };

export function ManualQuestionFormDialog({
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

  const handleChange = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const disabled = !form.pertanyaan.trim() || !form.panduanBuktiObjektif.trim();

  const handleSave = () => {
    if (disabled) return;
    onSubmit?.(form);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[560px] bg-white px-8 py-6 text-navy">
        <DialogHeader className="gap-1">
          <DialogTitle className="heading-4-bold">
            {isEdit ? "Edit Pertanyaan Klausa" : "Tambah Pertanyaan Klausa"}
          </DialogTitle>
          <p className="text-sm text-gray-dark">
            Lengkapi form di bawah ini untuk {isEdit ? "memperbarui" : "menambah"} Pertanyaan Klausa baru
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-navy">Pertanyaan</label>
            <Textarea
              value={form.pertanyaan}
              onChange={handleChange("pertanyaan")}
              placeholder="Masukkan Pertanyaan"
              className="min-h-[100px] bg-state border-0 text-navy resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-navy">Panduan Bukti Objektif</label>
            <Textarea
              value={form.panduanBuktiObjektif}
              onChange={handleChange("panduanBuktiObjektif")}
              placeholder="Masukkan Panduan Bukti Objektif"
              className="min-h-[100px] bg-state border-0 text-navy resize-none"
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
            Simpan Pertanyaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
