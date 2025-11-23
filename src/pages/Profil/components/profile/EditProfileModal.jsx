import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

// Split full name into first and last name
const splitFullName = (fullName) => {
  if (!fullName) return { namaDepan: "", namaBelakang: "" };
  const normalized = fullName.trim().replace(/\s+/g, " ");
  if (!normalized) return { namaDepan: "", namaBelakang: "" };
  const parts = normalized.split(" ");
  return {
    namaDepan: parts[0],
    namaBelakang: parts.slice(1).join(" "),
  };
};

/**
 * Modal Edit Data Diri (Profile Data Only - No Account Info)
 * Endpoint: PUT /profile
 */
export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
  errors = {},
  isSaving = false,
  onFieldChange,
}) {
  const { namaDepan, namaBelakang } = splitFullName(user?.nama);
  
  const [formData, setFormData] = useState({
    namaDepan: namaDepan || "",
    namaBelakang: namaBelakang || "",
    gelarAwalan: user?.degreePrefix || "",
    gelarAkhiran: user?.degreeSuffix || "",
    nip: user?.nip || "",
    telepon: user?.telepon || "",
    jabatan: user?.jabatan || "",
    departemen: user?.departemen || "",
  });
  const [clientErrors, setClientErrors] = useState({});

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  const combinedErrors = { ...clientErrors, ...errors };

  const getInitials = (namaDepan, namaBelakang) => {
    if (!namaDepan) return "??";
    if (namaDepan && namaBelakang) {
      return (namaDepan[0] + namaBelakang[0]).toUpperCase();
    }
    return namaDepan.substring(0, 2).toUpperCase();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setClientErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (errors[field] && onFieldChange) {
      onFieldChange(field);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!formData.namaDepan.trim()) {
      validationErrors.namaDepan = "Nama depan wajib diisi";
    }

    if (Object.keys(validationErrors).length > 0) {
      setClientErrors(validationErrors);
      return;
    }

    setClientErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      return {};
    });

      const result = await onSave({
      firstName: formData.namaDepan.trim(),
      lastName: formData.namaBelakang.trim(),
      degreePrefix: formData.gelarAwalan,
      degreeSuffix: formData.gelarAkhiran,
      nip: formData.nip,
      jabatan: formData.jabatan,
      departemen: formData.departemen,
      telepon: formData.telepon,
    });

    if (result?.success) {
      setClientErrors({});
    } else if (result?.errorMessage) {
      setClientErrors((prev) => ({ ...prev, submit: result.errorMessage }));
    }
  };

  // Reset form when modal opens with new user data
  useEffect(() => {
    if (isOpen && user) {
      const { namaDepan, namaBelakang } = splitFullName(user.nama);
      setFormData({
        namaDepan: namaDepan || "",
        namaBelakang: namaBelakang || "",
        gelarAwalan: user.degreePrefix || "",
        gelarAkhiran: user.degreeSuffix || "",
        nip: user.nip || "",
        telepon: user.telepon || "",
        jabatan: user.jabatan || "",
        departemen: user.departemen || "",
      });
      setAvatarPreview(user.avatar || null);
      setClientErrors({});
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      setClientErrors({});
    }
  }, [isOpen]);

  const handleDialogChange = (openState) => {
    if (!openState) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy mb-2">
            Edit Data Diri
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Lengkapi form di bawah ini untuk mengedit Data Diri Anda sesuai kebutuhan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center gap-3 pb-4">
              <Avatar className="h-24 w-24 bg-navy text-white">
                <AvatarImage src={avatarPreview} alt={`${formData.namaDepan} ${formData.namaBelakang}`} />
                <AvatarFallback className="text-2xl bg-navy text-white">
                  {getInitials(formData.namaDepan, formData.namaBelakang)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                className="bg-gray-300 text-gray-600 gap-2 cursor-not-allowed"
                disabled
              >
                <Upload className="h-4 w-4" />
                Unggah Foto Profil (Segera)
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Pengunggahan foto sementara dinonaktifkan sampai API mendukung JSON upload.
              </p>
            </div>

            {/* Nama Depan & Nama Belakang */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="namaDepan" className="text-sm text-gray-500">
                  Nama Depan
                </Label>
                <Input
                  id="namaDepan"
                  value={formData.namaDepan}
                  onChange={(e) => handleChange("namaDepan", e.target.value)}
                  placeholder="Nama Depan"
                  className="h-11 bg-gray-50"
                  disabled={isSaving}
                />
                {combinedErrors.namaDepan && (
                  <p className="text-xs text-red-500">{combinedErrors.namaDepan}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="namaBelakang" className="text-sm text-gray-500">
                  Nama Belakang
                </Label>
                <Input
                  id="namaBelakang"
                  value={formData.namaBelakang}
                  onChange={(e) => handleChange("namaBelakang", e.target.value)}
                  placeholder="Nama Belakang"
                  className="h-11 bg-gray-50"
                  disabled={isSaving}
                />
                {combinedErrors.namaBelakang && (
                  <p className="text-xs text-red-500">{combinedErrors.namaBelakang}</p>
                )}
              </div>
            </div>

            {/* Gelar Awalan & Gelar Akhiran */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gelarAwalan" className="text-sm text-gray-500">
                  Gelar Awalan
                </Label>
                <Input
                  id="gelarAwalan"
                  value={formData.gelarAwalan}
                  onChange={(e) => handleChange("gelarAwalan", e.target.value)}
                  placeholder="Gelar Awalan"
                  className="h-11 bg-gray-50"
                  disabled={isSaving}
                />
                {combinedErrors.gelarAwalan && (
                  <p className="text-xs text-red-500">{combinedErrors.gelarAwalan}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gelarAkhiran" className="text-sm text-gray-500">
                  Gelar Akhiran
                </Label>
                <Input
                  id="gelarAkhiran"
                  value={formData.gelarAkhiran}
                  onChange={(e) => handleChange("gelarAkhiran", e.target.value)}
                  placeholder="Gelar Akhiran"
                  className="h-11 bg-gray-50"
                  disabled={isSaving}
                />
                {combinedErrors.gelarAkhiran && (
                  <p className="text-xs text-red-500">{combinedErrors.gelarAkhiran}</p>
                )}
              </div>
            </div>

            {/* Nomor Induk Pegawai & Nomor Telepon */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nip" className="text-sm text-gray-500">
                  Nomor Induk Pegawai
                </Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) => handleChange("nip", e.target.value)}
                  placeholder="Nomor Induk Pegawai"
                  className="h-11 bg-gray-50"
                  disabled={isSaving}
                />
                {combinedErrors.nip && (
                  <p className="text-xs text-red-500">{combinedErrors.nip}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telepon" className="text-sm text-gray-500">
                  Nomor Telepon
                </Label>
                <Input
                  id="telepon"
                  type="tel"
                  value={formData.telepon}
                  onChange={(e) => handleChange("telepon", e.target.value)}
                  placeholder="Nomor Telepon"
                  className="h-11 bg-gray-50"
                  disabled={isSaving}
                />
                {combinedErrors.telepon && (
                  <p className="text-xs text-red-500">{combinedErrors.telepon}</p>
                )}
              </div>
            </div>

            {/* Jabatan & Departemen */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jabatan" className="text-sm text-gray-500">
                  Jabatan
                </Label>
                <Input
                  id="jabatan"
                  value={formData.jabatan}
                  onChange={(e) => handleChange("jabatan", e.target.value)}
                  placeholder="Jabatan"
                  className="h-11 bg-gray-50"
                  disabled={isSaving}
                />
                {combinedErrors.jabatan && (
                  <p className="text-xs text-red-500">{combinedErrors.jabatan}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departemen" className="text-sm text-gray-500">
                  Departemen
                </Label>
                <Input
                  id="departemen"
                  value={formData.departemen}
                  onChange={(e) => handleChange("departemen", e.target.value)}
                  placeholder="Departemen"
                  className="h-11 bg-gray-50"
                  disabled={isSaving}
                />
                {combinedErrors.departemen && (
                  <p className="text-xs text-red-500">{combinedErrors.departemen}</p>
                )}
              </div>
            </div>
          </div>

          {combinedErrors.submit && (
            <p className="text-sm text-red-500 mt-2">{combinedErrors.submit}</p>
          )}

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 px-6 border-gray-300"
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 bg-navy text-white hover:bg-navy/90"
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
