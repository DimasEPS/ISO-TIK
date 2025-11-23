import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FilePen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const titleMap = {
  view: "Detail Dokumen Audit",
  edit: "Edit Dokumen Audit",
};

const subtitleMap = {
  view: "Informasi lengkap mengenai dokumen audit yang dipilih",
  edit: "Ubah informasi dokumen audit sesuai kebutuhan",
};

export function AlertIconDialog({
  type,
  row,
  onUpdate,
  isUpdating,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    judul: row.judul || "",
    lokasi: row.lokasi || "",
    tanggalAudit: row.tanggalAudit || "",
    leadAuditor: row.leadAuditor || "",
    auditor: row.auditor || "",
    revisi: row.revisi || "",
    status: row.status || "Draft",
  });
  const navigate = useNavigate();
  const readOnly = type === "view";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!onUpdate) {
      setOpen(false);
      return;
    }

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

    // Validate revision format
    const revisionPattern = /^\d+(\.\d+)?$/;
    if (!revisionPattern.test(formData.revisi.trim())) {
      toast.error("Format Revisi tidak valid!", {
        description: "Gunakan format angka seperti: 1.0, 1.1, 2.0, dst.",
      });
      return;
    }

    // Convert tanggal format if needed (dd/mm/yyyy -> yyyy-mm-dd)
    let auditDate = formData.tanggalAudit;
    if (auditDate && auditDate.includes("/")) {
      const dateMatch = auditDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        auditDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        toast.warning("Format tanggal tidak valid", {
          description: "Gunakan format dd/mm/yyyy (contoh: 15/12/2025)",
        });
        return;
      }
    }

    // Map frontend fields to backend API - only required fields
    const payload = {
      title: formData.judul.trim(),
      revision: formData.revisi.trim(),
      status: mapStatusToBackend(formData.status),
    };

    // Add optional fields only if they have values
    if (auditDate) {
      payload.audit_period = auditDate;
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
      await onUpdate({ documentId: row.id, payload });
      
      toast.success("Dokumen audit berhasil diupdate!", {
        description: `Perubahan pada "${formData.judul}" telah disimpan`,
      });
      
      setOpen(false);
    } catch (error) {
      const errorMsg = error?.data?.message || error?.message || "Unknown error";
      const errorDetails = error?.data?.errors 
        ? Object.entries(error.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n")
        : null;

      toast.error("Gagal mengupdate dokumen", {
        description: errorDetails || errorMsg,
        duration: 7000,
      });
    }
  };

  // Map frontend status ke backend enum
  const mapStatusToBackend = (status) => {
    const statusMap = {
      Draft: "draft",
      "In Progress": "in_progress",
      Reviewed: "reviewed",
      Approved: "approved",
    };
    return statusMap[status] || status.toLowerCase().replace(" ", "_");
  };

  const handleNavigate = (mode) => {
    navigate(`/admin/audit/dokumen/${row.id}`, {
      state: {
        dokumenTitle: row.judul,
        lokasi: row.lokasi,
        tanggalAudit: row.tanggalAudit,
        revisi: row.revisi,
        mode: mode, // "view" or "fill"
      },
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={className}>
          {type === "view" && (
            <Eye className="text-[#121A2E] w-5 h-5 cursor-pointer" />
          )}
          {type === "edit" && (
            <FilePen className="text-[#2B7FFF] w-5 h-5 cursor-pointer" />
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="heading-3 text-navy">
            {titleMap[type]}
          </DialogTitle>
          <p className="text-gray-dark small mt-1">{subtitleMap[type]}</p>
        </DialogHeader>

        {readOnly ? (
          <div className="space-y-4 py-2">
            <div className="bg-state p-4 rounded-lg">
              <p className="text-sm font-semibold text-navy mb-1">
                Checklist Audit
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-dark mb-1">Tanggal Audit</p>
                <p className="text-sm text-navy font-medium">
                  {row.tanggalAudit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-dark mb-1">Lokasi</p>
                <p className="text-sm text-navy font-medium">{row.lokasi}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-dark mb-1">Lead Auditor</p>
                <p className="text-sm text-navy font-medium">
                  {row.leadAuditor}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-dark mb-1">Auditor</p>
                <p className="text-sm text-navy font-medium">{row.auditor}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-dark mb-1">Revisi</p>
                <p className="text-sm text-navy font-medium">{row.revisi}</p>
              </div>
              <div>
                <p className="text-xs text-gray-dark mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                    row.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : row.status === "Reviewed"
                      ? "bg-blue-100 text-blue-700"
                      : row.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {row.status}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => handleNavigate("view")}
              >
                Lihat Jawaban
              </Button>
              <Button
                className="rounded-lg bg-navy hover:bg-navy-hover"
                onClick={() => handleNavigate("fill")}
              >
                Isi Jawaban
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="judul" className="text-sm text-navy">
                Judul Dokumen <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judul"
                value={formData.judul}
                onChange={(e) => handleInputChange("judul", e.target.value)}
                className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lokasi" className="text-sm text-navy">
                  Lokasi
                </Label>
                <Input
                  id="lokasi"
                  value={formData.lokasi}
                  onChange={(e) => handleInputChange("lokasi", e.target.value)}
                  className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalAudit" className="text-sm text-navy">
                  Tanggal Audit
                </Label>
                <Input
                  id="tanggalAudit"
                  type="text"
                  value={formData.tanggalAudit}
                  onChange={(e) =>
                    handleInputChange("tanggalAudit", e.target.value)
                  }
                  className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy"
                  placeholder="Contoh: 15/12/2025"
                />
                <p className="text-xs text-gray-500">
                  Format: dd/mm/yyyy
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadAuditor" className="text-sm text-navy">
                  Lead Auditor
                </Label>
                <Input
                  id="leadAuditor"
                  value={formData.leadAuditor}
                  onChange={(e) =>
                    handleInputChange("leadAuditor", e.target.value)
                  }
                  className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auditor" className="text-sm text-navy">
                  Auditor
                </Label>
                <Input
                  id="auditor"
                  value={formData.auditor}
                  onChange={(e) => handleInputChange("auditor", e.target.value)}
                  className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revisi" className="text-sm text-navy">
                  Revisi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="revisi"
                  value={formData.revisi}
                  onChange={(e) => handleInputChange("revisi", e.target.value)}
                  className="rounded-lg bg-state placeholder:text-gray-dark focus:bg-gray-light focus:border-2 focus:border-navy"
                  required
                  placeholder="Contoh: 1.0"
                />
                <p className="text-xs text-gray-500">
                  Format: angka.angka (1.0, 2.1)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm text-navy">
                  Status
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-state px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-dark focus-visible:outline-none focus-visible:bg-gray-light focus-visible:border-2 focus-visible:border-navy disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Draft">Draft</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="rounded-lg">
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isUpdating}
                className="rounded-lg bg-navy hover:bg-navy-hover disabled:opacity-50"
              >
                {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
