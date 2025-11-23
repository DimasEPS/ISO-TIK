import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusDropdown } from "@/components/admin/table";

const statusOptions = [
  { value: "Draft" },
  { value: "In Progress" },
  { value: "Reviewed" },
  { value: "Approved" },
];

export function OverlayForm({
  statusValue,
  onStatusChange,
  isStatusDropdownOpen,
  setIsStatusDropdownOpen,
  onSubmit,
  isSubmitting = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    lokasi: "",
    tanggalAudit: "",
    leadAuditor: "",
    auditor: "",
    revisi: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation - title, revision, status are required by backend
    if (!formData.judul?.trim()) {
      toast.error("Judul wajib diisi!");
      return;
    }

    if (!formData.revisi?.trim()) {
      toast.error("Revisi wajib diisi!", {
        description: "Format: angka.angka (contoh: 1.0, 2.1, 3.0)",
      });
      return;
    }

    // Validate revision format (should be like 1.0, 2.1, etc)
    const revisionPattern = /^\d+(\.\d+)?$/;
    if (!revisionPattern.test(formData.revisi.trim())) {
      toast.error("Format Revisi tidak valid!", {
        description: "Gunakan format angka seperti: 1.0, 1.1, 2.0, dst.",
      });
      return;
    }

    // Map status to backend enum
    const mapStatusToBackend = (status) => {
      const statusStr = String(status || "draft")
        .toLowerCase()
        .trim();
      if (statusStr === "in progress") return "in_progress";
      if (
        ["draft", "in_progress", "reviewed", "approved"].includes(statusStr)
      ) {
        return statusStr;
      }
      return "draft";
    };

    // Map frontend field names to backend field names
    // Only send fields that have values (except required fields)
    const payload = {
      title: formData.judul.trim(),
      revision: formData.revisi.trim(),
      status: mapStatusToBackend(statusValue),
    };

    // Add optional fields only if they have values
    if (formData.tanggalAudit) {
      // Convert dd/mm/yyyy to yyyy-mm-dd for backend
      const dateMatch = formData.tanggalAudit.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        payload.audit_period = `${year}-${month.padStart(
          2,
          "0"
        )}-${day.padStart(2, "0")}`;
      } else {
        toast.warning("Format tanggal tidak valid", {
          description: "Gunakan format dd/mm/yyyy (contoh: 15/12/2025)",
        });
        return;
      }
    }

    if (formData.lokasi?.trim()) {
      payload.location = formData.lokasi.trim();
    }

    if (formData.leadAuditor?.trim()) {
      payload.lead_auditor = formData.leadAuditor.trim();
    }

    if (formData.auditor?.trim()) {
      payload.auditor_name = formData.auditor.trim();
    }

    try {
      await onSubmit?.(payload);

      // Success notification
      toast.success("Dokumen audit berhasil ditambahkan!", {
        description: `Dokumen "${formData.judul}" telah dibuat`,
      });

      // Reset form and close dialog on success
      setFormData({
        judul: "",
        lokasi: "",
        tanggalAudit: "",
        leadAuditor: "",
        auditor: "",
        revisi: "",
      });
      onStatusChange?.("Draft");
      setIsOpen(false);
    } catch (error) {
      // Error notification with details
      const errorMsg =
        error?.data?.message || error?.message || "Unknown error";
      const errorDetails = error?.data?.errors
        ? Object.entries(error.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n")
        : null;

      toast.error("Gagal menambahkan dokumen", {
        description: errorDetails || errorMsg,
        duration: 7000,
      });
    }
  };
  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <ButtonGroup>
            <Button
              type="button"
              className="bg-navy! cursor-pointer text-gray-light hover:bg-navy-hover! rounded-lg! w-[233px]! h-[52px]! gap-4!"
              variant="secondary"
            >
              <Plus className="text-gray-light w-5! h-5!" />
              Tambah Dokumen Audit
            </Button>
          </ButtonGroup>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] sm:max-h-[993px] mx-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-navy heading-3">
                Tambahkan Dokumen Audit
              </DialogTitle>
              <DialogDescription className="text-gray-dark small">
                Lengkapi form di bawah ini untuk menambah dokumen audit baru
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 w-[536px]!">
              <div className="grid gap-3">
                <Label htmlFor="judul">
                  Judul <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="judul"
                  name="judul"
                  value={formData.judul}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="rounded-lg! transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
                  placeholder="Masukkan Judul"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input
                  id="lokasi"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="rounded-lg! transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
                  placeholder="Masukkan Lokasi"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tanggalAudit">Tanggal Audit</Label>
                <Input
                  id="tanggalAudit"
                  name="tanggalAudit"
                  type="text"
                  value={formData.tanggalAudit}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="rounded-lg! transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
                  placeholder="Contoh: 15/12/2025"
                />
                <p className="text-xs text-gray-500 -mt-2">
                  Format: dd/mm/yyyy (tanggal/bulan/tahun)
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="leadAuditor">Lead Auditor</Label>
                <Input
                  id="leadAuditor"
                  name="leadAuditor"
                  value={formData.leadAuditor}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="rounded-lg! transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
                  placeholder="Masukkan Nama Lead Auditor"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="auditor">Auditor</Label>
                <Input
                  id="auditor"
                  name="auditor"
                  value={formData.auditor}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="rounded-lg! transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
                  placeholder="Masukkan Nama Auditor"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="revisi">
                  Revisi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="revisi"
                  name="revisi"
                  value={formData.revisi}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="rounded-lg! transform transition-all duration-50 cursor-pointer bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy h-12!"
                  placeholder="Contoh: 1.0 atau 2.1"
                />
                <p className="text-xs text-gray-500 -mt-2">
                  Format: angka.angka (contoh: 1.0, 1.1, 2.0, dst.)
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <StatusDropdown
                  isMenuOpen={isStatusDropdownOpen}
                  setIsMenuOpen={setIsStatusDropdownOpen}
                  value={statusValue}
                  onChange={onStatusChange}
                  options={statusOptions}
                  classNameButton="w-[536px]! h-12!"
                  classNameDropdown="w-[536px]!"
                  showFunnelIcon={false}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  className="rounded-lg"
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="hover:bg-navy-hover! rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Dokumen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
