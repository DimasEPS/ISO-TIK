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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CASE_STATUS, CASE_STATUS_LABELS } from "../../constants";
import { useAdminUsers } from "../../hooks/useNCRQueries";

const createInitialFormData = () => ({
  ncrNumber: "",
  location: "",
  ncrDate: "",
  referencesStandard: "",
  clause: "",
  auditorName: "",
  auditorId: "",
  auditeeName: "",
  auditeeId: "",
  status: "",
  findingCategory: "minor",
  targetDate: "",
  completionDate: "",
  documentId: "",
});

const createInitialErrors = () => ({
  auditorId: "",
  auditeeId: "",
});

const mapCaseToFormData = (caseData = {}) => ({
  ncrNumber: caseData.ncrNumber || caseData.ncr_number || caseData.case_number || caseData.id || "",
  location: caseData.location || caseData.bagianTerkait || "",
  ncrDate: caseData.ncrDate || caseData.ncr_date || caseData.tanggal || "",
  referencesStandard:
    caseData.referencesStandard || caseData.references_standard || caseData.standard_reference || "",
  clause: caseData.clause || caseData.klasifikasi || "",
  auditorName: caseData.auditorName || caseData.namaAuditor || "",
  auditorId: caseData.auditorId || caseData.id_auditor || caseData.auditor_id || "",
  auditeeName: caseData.auditeeName || caseData.namaAuditee || "",
  auditeeId: caseData.auditeeId || caseData.id_auditee || caseData.auditee_id || "",
  status: caseData.status || "",
  findingCategory: caseData.findingCategory || caseData.finding_category || "minor",
  targetDate: caseData.targetDate || caseData.target_date || "",
  completionDate: caseData.completionDate || caseData.completion_date || "",
  documentId: caseData.documentId || caseData.id_ncr_documents || caseData.document_id || "",
});

export function CaseEditModal({ isOpen, onClose, caseData, onSave }) {
  const [formData, setFormData] = useState(() => createInitialFormData());
  const [errors, setErrors] = useState(() => createInitialErrors());
  const { data: adminUsersResponse, isLoading: isAdminUsersLoading } = useAdminUsers({
    per_page: 100,
    status: "active",
  });

  const adminUsers = useMemo(() => adminUsersResponse?.data ?? [], [adminUsersResponse]);

  useEffect(() => {
    if (!caseData) {
      setFormData(createInitialFormData());
      setErrors(createInitialErrors());
      return;
    }

    setFormData(mapCaseToFormData(caseData));
    setErrors(createInitialErrors());
  }, [caseData]);

  const getUserDisplayName = (user = {}) => {
    if (user.full_name) return user.full_name;
    if (user.fullName) return user.fullName;
    if (user.first_name || user.last_name) {
      return [user.first_name, user.last_name].filter(Boolean).join(" ");
    }
    return user.username || user.email || "Pengguna";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectUser = (type, user) => {
    const displayName = getUserDisplayName(user);
    const idField = type === "auditor" ? "auditorId" : "auditeeId";
    const nameField = type === "auditor" ? "auditorName" : "auditeeName";
    setFormData((prev) => ({
      ...prev,
      [idField]: user.id,
      [nameField]: displayName,
    }));
    setErrors((prev) => ({ ...prev, [idField]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {
      auditorId: formData.auditorId ? "" : "Auditor harus dipilih",
      auditeeId: formData.auditeeId ? "" : "Auditee harus dipilih",
    };

    setErrors(validationErrors);

    const hasError = Object.values(validationErrors).some(Boolean);
    if (hasError) {
      return;
    }

    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const handleCancel = () => {
    if (caseData) {
      setFormData(mapCaseToFormData(caseData));
      setErrors(createInitialErrors());
    } else {
      setFormData(createInitialFormData());
      setErrors(createInitialErrors());
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white" showCloseButton={true}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-navy mb-2">
              Edit Kasus NCR
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-dark">
              Ubah informasi Kasus Pada NCR sesuai kebutuhan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="ncrNumber" className="text-sm text-gray-dark">
                Nomor NCR
              </Label>
              <Input
                id="ncrNumber"
                value={formData.ncrNumber}
                onChange={(e) => handleInputChange("ncrNumber", e.target.value)}
                className="w-full bg-gray-light border-gray-300 focus:border-black focus:border-2 focus-visible:ring-0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm text-gray-dark">
                  Bagian/Lokasi
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full bg-gray-light border-gray-300 focus:border-black focus:border-2 focus-visible:ring-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ncrDate" className="text-sm text-gray-dark">
                  Tanggal NCR
                </Label>
                <Input
                  id="ncrDate"
                  type="date"
                  value={formData.ncrDate}
                  onChange={(e) => handleInputChange("ncrDate", e.target.value)}
                  className="w-full bg-gray-light border-gray-300 focus:border-black focus:border-2 focus-visible:ring-0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referencesStandard" className="text-sm text-gray-dark">
                  Standar Referensi
                </Label>
                <Input
                  id="referencesStandard"
                  value={formData.referencesStandard}
                  onChange={(e) => handleInputChange("referencesStandard", e.target.value)}
                  className="w-full bg-gray-light border-gray-300 focus:border-black focus-border-2 focus-visible:ring-0"
                  placeholder="ISO 27001:2022"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clause" className="text-sm text-gray-dark">
                  Klausul
                </Label>
                <Input
                  id="clause"
                  value={formData.clause}
                  onChange={(e) => handleInputChange("clause", e.target.value)}
                  className="w-full bg-gray-light border-gray-300 focus:border-black focus-border-2 focus-visible:ring-0"
                  placeholder="6.5.1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetDate" className="text-sm text-gray-dark">
                  Tanggal Target
                </Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => handleInputChange("targetDate", e.target.value)}
                  className="w-full bg-gray-light border-gray-300 focus:border-black focus-border-2 focus-visible:ring-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="completionDate" className="text-sm text-gray-dark">
                  Tanggal Penyelesaian
                </Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => handleInputChange("completionDate", e.target.value)}
                  className="w-full bg-gray-light border-gray-300 focus:border-black focus-border-2 focus-visible:ring-0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditorName" className="text-sm text-gray-dark">
                Pilih Auditor
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between bg-gray-light border-gray-300 h-10"
                  >
                    <span className={formData.auditorName ? "text-navy" : "text-gray-400"}>
                      {formData.auditorName || "Pilih Auditor"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
                  {isAdminUsersLoading ? (
                    <DropdownMenuItem disabled>Memuat daftar pengguna...</DropdownMenuItem>
                  ) : adminUsers.length === 0 ? (
                    <DropdownMenuItem disabled>Tidak ada pengguna tersedia</DropdownMenuItem>
                  ) : (
                    adminUsers.map((user) => (
                      <DropdownMenuItem key={user.id} onClick={() => handleSelectUser("auditor", user)}>
                        {getUserDisplayName(user)}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.auditorId && <p className="text-sm text-red-500">{errors.auditorId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditeeName" className="text-sm text-gray-dark">
                Pilih Auditee
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between bg-gray-light border-gray-300 h-10"
                  >
                    <span className={formData.auditeeName ? "text-navy" : "text-gray-400"}>
                      {formData.auditeeName || "Pilih Auditee"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
                  {isAdminUsersLoading ? (
                    <DropdownMenuItem disabled>Memuat daftar pengguna...</DropdownMenuItem>
                  ) : adminUsers.length === 0 ? (
                    <DropdownMenuItem disabled>Tidak ada pengguna tersedia</DropdownMenuItem>
                  ) : (
                    adminUsers.map((user) => (
                      <DropdownMenuItem key={`auditee-${user.id}`} onClick={() => handleSelectUser("auditee", user)}>
                        {getUserDisplayName(user)}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.auditeeId && <p className="text-sm text-red-500">{errors.auditeeId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm text-gray-dark">
                Status
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between bg-gray-light border-gray-300 h-10"
                  >
                    <span className={formData.status ? "text-navy" : "text-gray-400"}>
                      {formData.status ? CASE_STATUS_LABELS[formData.status] || formData.status : "Pilih Status"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => handleInputChange("status", CASE_STATUS.DRAFT)}>
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInputChange("status", CASE_STATUS.IN_PROGRESS)}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInputChange("status", CASE_STATUS.REVIEWED)}>
                    Reviewed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInputChange("status", CASE_STATUS.APPROVED)}>
                    Approved
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
