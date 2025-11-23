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
import { useState, useEffect } from "react";
import { CASE_STATUS } from "../../constants";

export function CaseEditModal({ isOpen, onClose, caseData, onSave }) {
  const [formData, setFormData] = useState({
    id: "",
    bagianTerkait: "",
    tanggal: "",
    standarReferensi: "",
    klasifikasi: "",
    namaAuditor: "",
    namaAuditee: "",
    status: "",
  });
  const [hasInteracted, setHasInteracted] = useState({
    id: false,
    bagianTerkait: false,
    tanggal: false,
    standarReferensi: false,
    klasifikasi: false,
    namaAuditor: false,
    namaAuditee: false,
  });

  useEffect(() => {
    if (caseData) {
      setFormData({
        id: caseData.id || "",
        bagianTerkait: caseData.bagianTerkait || "",
        tanggal: caseData.tanggal || "",
        standarReferensi: caseData.standarReferensi || "",
        klasifikasi: caseData.klasifikasi || "",
        namaAuditor: caseData.namaAuditor || "",
        namaAuditee: caseData.namaAuditee || "",
        status: caseData.status || "",
      });
      setHasInteracted({
        id: false,
        bagianTerkait: false,
        tanggal: false,
        standarReferensi: false,
        klasifikasi: false,
        namaAuditor: false,
        namaAuditee: false,
      });
    }
  }, [caseData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ ...caseData, ...formData });
    }
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      id: caseData?.id || "",
      bagianTerkait: caseData?.bagianTerkait || "",
      tanggal: caseData?.tanggal || "",
      standarReferensi: caseData?.standarReferensi || "",
      klasifikasi: caseData?.klasifikasi || "",
      namaAuditor: caseData?.namaAuditor || "",
      namaAuditee: caseData?.namaAuditee || "",
      status: caseData?.status || "",
    });
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (!hasInteracted[field]) {
      setHasInteracted({ ...hasInteracted, [field]: true });
    }
  };

  const handleInputFocus = (field) => {
    // Only clear if user hasn't interacted yet
    if (!hasInteracted[field]) {
      // Mark as interacted without clearing the value in edit mode
      setHasInteracted({ ...hasInteracted, [field]: true });
    }
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
              <Label htmlFor="id" className="text-sm text-gray-dark">
                Nomor NCR
              </Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => handleInputChange("id", e.target.value)}
                onFocus={() => handleInputFocus("id")}
                className="w-full bg-gray-light border-gray-300 focus:border-black focus:border-2 focus-visible:ring-0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bagianTerkait" className="text-sm text-gray-dark">
                  Bagian/Lokasi
                </Label>
                <Input
                  id="bagianTerkait"
                  value={formData.bagianTerkait}
                  onChange={(e) => handleInputChange("bagianTerkait", e.target.value)}
                  onFocus={() => handleInputFocus("bagianTerkait")}
                  className="w-full bg-gray-light border-gray-300 focus:border-black focus:border-2 focus-visible:ring-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal" className="text-sm text-gray-dark">
                  Tanggal
                </Label>
                <Input
                  id="tanggal"
                  value={formData.tanggal}
                  onChange={(e) => handleInputChange("tanggal", e.target.value)}
                  onFocus={() => handleInputFocus("tanggal")}
                  className="w-full bg-gray-light border-gray-300 focus:border-black focus:border-2 focus-visible:ring-0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="standarReferensi" className="text-sm text-gray-dark">
                Standar Referensi
              </Label>
              <Input
                id="standarReferensi"
                value={formData.standarReferensi}
                onChange={(e) => handleInputChange("standarReferensi", e.target.value)}
                onFocus={() => handleInputFocus("standarReferensi")}
                className="w-full bg-gray-light border-gray-300 focus:border-black focus:border-2 focus-visible:ring-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="klasifikasi" className="text-sm text-gray-dark">
                Klausul
              </Label>
              <Input
                id="klasifikasi"
                value={formData.klasifikasi}
                onChange={(e) => handleInputChange("klasifikasi", e.target.value)}
                onFocus={() => handleInputFocus("klasifikasi")}
                className="w-full bg-gray-light border-gray-300 focus:border-black focus:border-2 focus-visible:ring-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaAuditor" className="text-sm text-gray-dark">
                Pilih Auditor
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between bg-gray-light border-gray-300 h-10"
                  >
                    <span className="text-navy">{formData.namaAuditor || "Pilih Auditor"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => handleInputChange("namaAuditor", "Cakrawerdaya")}>
                    Cakrawerdaya
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInputChange("namaAuditor", "John Doe")}>
                    John Doe
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInputChange("namaAuditor", "Jane Smith")}>
                    Jane Smith
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaAuditee" className="text-sm text-gray-dark">
                Pilih Auditee
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between bg-gray-light border-gray-300 h-10"
                  >
                    <span className="text-navy">{formData.namaAuditee || "Pilih Auditee"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => handleInputChange("namaAuditee", "Rasiban")}>
                    Rasiban
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInputChange("namaAuditee", "Ahmad")}>
                    Ahmad
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInputChange("namaAuditee", "Budi")}>
                    Budi
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                    <span className="text-navy">{formData.status || "Pilih Status"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => handleInputChange("status", CASE_STATUS.PENDING)}>
                    {CASE_STATUS.PENDING}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInputChange("status", CASE_STATUS.APPROVED)}>
                    {CASE_STATUS.APPROVED}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInputChange("status", CASE_STATUS.REJECTED)}>
                    {CASE_STATUS.REJECTED}
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
