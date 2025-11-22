import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DEFAULT_FORM = {
  judul: "",
  namaPerusahaan: "",
  lokasi: "",
  ruangLingkup: "",
  status: "Draft",
};

const ROLES = [
  { label: "Lead Auditor", value: "Lead Auditor" },
  { label: "Member Auditor", value: "Member Auditor" },
];

const STATUS_OPTIONS = ["Draft", "In Progress", "Reviewed", "Approved"];

export function ManualDocumentFormDialog({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(DEFAULT_FORM);
  const [team, setTeam] = useState([]);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState(ROLES[0].value);

  useEffect(() => {
    if (open) {
      setForm({ ...DEFAULT_FORM, ...(initialData ?? {}) });
      setTeam(initialData?.team ?? []);
      setMemberName("");
      setMemberRole(ROLES[0].value);
    }
  }, [open, initialData]);

  const disabledSave = useMemo(
    () =>
      !form.judul.trim() ||
      !form.namaPerusahaan.trim() ||
      !form.lokasi.trim() ||
      !form.ruangLingkup.trim(),
    [form],
  );

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    const entry = {
      id: crypto.randomUUID(),
      name: memberName,
      role: memberRole,
      dateAdded: initialData?.dateAdded ?? "16/11/2025",
    };
    setTeam((prev) => [...prev, entry]);
    setMemberName("");
    setMemberRole(ROLES[0].value);
  };

  const handleRemoveMember = (id) => {
    setTeam((prev) => prev.filter((member) => member.id !== id));
  };

  const handleSave = () => {
    onSubmit?.({ ...form, team });
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[95vw] sm:max-w-[1200px] md:max-w-[1400px] bg-white px-8 py-6 text-navy"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="heading-4-bold">
            {isEdit ? "Edit Checklist Manual" : "Tambah Checklist Manual"}
          </DialogTitle>
          <p className="text-sm text-gray-dark">
            Lengkapi form di bawah ini untuk {isEdit ? "memperbarui" : "menambah"} Checklist Manual baru
          </p>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-navy">Judul</label>
            <Input
              value={form.judul}
              onChange={handleChange("judul")}
              placeholder="Masukkan Judul"
              className="h-12 bg-state text-navy border-0"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-navy">Nama Perusahaan</label>
              <Input
                value={form.namaPerusahaan}
                onChange={handleChange("namaPerusahaan")}
                placeholder="Masukkan Nama Perusahaan"
                className="h-12 bg-state text-navy border-0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-navy">Lokasi</label>
              <Input
                value={form.lokasi}
                onChange={handleChange("lokasi")}
                placeholder="Masukkan Lokasi"
                className="h-12 bg-state text-navy border-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-navy">Ruang Lingkup</label>
            <Input
              value={form.ruangLingkup}
              onChange={handleChange("ruangLingkup")}
              placeholder="Masukkan Ruang Lingkup"
              className="h-12 bg-state text-navy border-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-navy">Status</label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="h-12 w-full bg-state border-0 justify-between text-navy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" className="bg-white">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-navy">Tetapkan Anggota Tim</div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input
                value={memberName}
                onChange={(event) => setMemberName(event.target.value)}
                placeholder="Masukkan nama"
                className="h-12 bg-state text-navy border-0"
              />
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger className="h-12 w-full bg-state border-0 justify-between text-navy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" className="bg-white">
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddMember}
                className="h-12 rounded-sm bg-navy px-6 text-white hover:bg-navy-hover"
              >
                Tambah
              </Button>
            </div>

            <div className="overflow-hidden rounded-md border border-gray-medium">
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] items-center bg-state px-4 py-3 text-sm font-medium text-navy">
                <span>Nama</span>
                <span className="text-center">Peran</span>
                <span className="text-center whitespace-nowrap">Tanggal Ditambahkan</span>
                <span className="text-center">Aksi</span>
              </div>
              {team.length === 0 ? (
                <div className="px-4 py-4 text-sm text-gray-dark">Belum ada anggota ditambahkan.</div>
              ) : (
                team.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[2fr_1fr_1fr_auto] items-center border-t border-gray-medium px-4 py-3 text-sm text-navy"
                  >
                    <span className="truncate">{member.name}</span>
                    <span className="flex justify-center">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                          member.role === "Lead Auditor"
                            ? "bg-navy text-white"
                            : "bg-gray-medium text-navy",
                        )}
                      >
                        {member.role}
                      </span>
                    </span>
                    <span className="text-center text-sm text-navy">{member.dateAdded}</span>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red hover:text-red px-3"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
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
            onClick={handleSave}
            disabled={disabledSave}
            className="h-11 px-6 bg-navy text-white hover:bg-navy-hover disabled:opacity-50"
          >
            {isEdit ? "Simpan Perubahan" : "Simpan Dokumen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
