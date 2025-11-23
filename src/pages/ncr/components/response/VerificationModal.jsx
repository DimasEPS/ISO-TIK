import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const VERIFICATION_STATUS = [
  "STANDAR ISO - 27001:2022",
  "STANDAR ISO - 9001:2015",
  "STANDAR ISO - 14001:2015",
];

/**
 * Modal for verification of corrective actions
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 * @param {Function} onSave - Save handler
 * @param {Object} verificationData - Current verification data (optional)
 */
export function VerificationModal({
  isOpen,
  onClose,
  onSave,
  verificationData = null,
}) {
  const [formData, setFormData] = useState({
    namaPemverifikasi: "",
    tanggalPemverifikasi: "",
    tanggalVerifikasi: "",
    catatanVerifikasi: "",
  });

  useEffect(() => {
    if (verificationData) {
      setFormData({
        namaPemverifikasi: verificationData.namaPemverifikasi || "",
        tanggalPemverifikasi: verificationData.tanggalPemverifikasi || "",
        tanggalVerifikasi: verificationData.tanggalVerifikasi || "",
        catatanVerifikasi: verificationData.catatanVerifikasi || "",
      });
    }
  }, [verificationData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      namaPemverifikasi: verificationData?.namaPemverifikasi || "",
      tanggalPemverifikasi: verificationData?.tanggalPemverifikasi || "",
      tanggalVerifikasi: verificationData?.tanggalVerifikasi || "",
      catatanVerifikasi: verificationData?.catatanVerifikasi || "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy">
            Verifikasi Tindakan Perbaikan
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-dark">
            Isi detail verifikasi tindakan perbaikan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nama Pemverifikasi */}
            <div className="space-y-2">
              <Label htmlFor="namaPemverifikasi" className="text-sm font-medium text-gray-dark">
                Nama Pemverifikasi
              </Label>
              <Input
                id="namaPemverifikasi"
                placeholder="Masukkan Nama Pemverifikasi"
                value={formData.namaPemverifikasi}
                onChange={(e) => setFormData({ ...formData, namaPemverifikasi: e.target.value })}
                className="border-gray-300 focus-visible:border-black! focus-visible:border-2! focus-visible:ring-0!"
              />
            </div>

            {/* Tanggal Pemverifikasi */}
            <div className="space-y-2">
              <Label htmlFor="tanggalPemverifikasi" className="text-sm font-medium text-gray-dark">
                Tanggal Penyelesaian
              </Label>
              <Input
                id="tanggalPemverifikasi"
                type="date"
                value={formData.tanggalPemverifikasi}
                onChange={(e) => setFormData({ ...formData, tanggalPemverifikasi: e.target.value })}
                className="border-gray-300 focus-visible:border-black! focus-visible:border-2! focus-visible:ring-0!"
              />
            </div>

            {/* Tanggal Verifikasi */}
            <div className="space-y-2">
              <Label htmlFor="tanggalVerifikasi" className="text-sm font-medium text-gray-dark">
                Tanggal Verifikasi
              </Label>
              <Input
                id="tanggalVerifikasi"
                type="date"
                value={formData.tanggalVerifikasi}
                onChange={(e) => setFormData({ ...formData, tanggalVerifikasi: e.target.value })}
                className="border-gray-300 focus-visible:border-black! focus-visible:border-2! focus-visible:ring-0!"
              />
            </div>

            {/* Catatan Verifikasi */}
            <div className="space-y-2">
              <Label htmlFor="catatanVerifikasi" className="text-sm font-medium text-gray-dark">
                Catatan Verifikasi
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12 px-4 border-gray-300 hover:border-navy"
                  >
                    <span className={formData.catatanVerifikasi ? "text-gray-900" : "text-gray-400"}>
                      {formData.catatanVerifikasi || "Pilih Catatan Verifikasi"}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-(--radix-dropdown-menu-trigger-width)">
                  {VERIFICATION_STATUS.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => setFormData({ ...formData, catatanVerifikasi: status })}
                      className="cursor-pointer"
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
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
              className="h-12 px-6 bg-navy text-white hover:bg-navy/90"
            >
              Simpan Verifikasi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
