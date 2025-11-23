import { useState, useRef, useEffect } from "react";
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
import { Camera, X } from "lucide-react";

/**
 * Reusable Edit Profile Modal Component
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Close modal callback
 * @param {Object} user - User data to edit
 * @param {Function} onSave - Save changes callback
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
  const [formData, setFormData] = useState({
    nama: user?.nama || "",
    nip: user?.nip || "",
    jabatan: user?.jabatan || "",
    departemen: user?.departemen || "",
    telepon: user?.telepon || "",
    email: user?.email || "",
    username: user?.username || "",
  });
  const [clientErrors, setClientErrors] = useState({});

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const combinedErrors = { ...clientErrors, ...errors };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }

      setAvatarFile(file);
      if (errors.avatar && onFieldChange) {
        onFieldChange("avatar");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (errors.avatar && onFieldChange) {
      onFieldChange("avatar");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!formData.nama.trim()) {
      validationErrors.nama = "Nama lengkap wajib diisi";
    }
    if (!formData.email.trim()) {
      validationErrors.email = "Email wajib diisi";
    }
    if (!formData.username.trim()) {
      validationErrors.username = "Username wajib diisi";
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
      ...formData,
      avatar: avatarFile,
      avatarPreview,
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
      setFormData({
        nama: user.nama || "",
        nip: user.nip || "",
        jabatan: user.jabatan || "",
        departemen: user.departemen || "",
        telepon: user.telepon || "",
        email: user.email || "",
        username: user.username || "",
      });
      setAvatarPreview(user.avatar || null);
      setAvatarFile(null);
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
            Perbarui informasi akun dan profil Anda. Nama, email, dan username wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-200">
              <div className="relative">
                <Avatar className="h-24 w-24 bg-navy text-white">
                  <AvatarImage src={avatarPreview} alt={formData.nama} />
                  <AvatarFallback className="text-2xl bg-navy text-white">
                    {getInitials(formData.nama)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
                  disabled={isSaving}
                >
                  <Camera className="h-4 w-4" />
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition-colors"
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isSaving}
              />
              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium">Foto Profil</p>
                <p className="text-xs text-gray-500 mt-1">
                  Klik ikon kamera untuk mengubah foto. Max 5MB
                </p>
                {combinedErrors.avatar && (
                  <p className="text-xs text-red-500 mt-1">{combinedErrors.avatar}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="h-11"
                  disabled={isSaving}
                />
                {combinedErrors.nama && (
                  <p className="text-xs text-red-500">{combinedErrors.nama}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nip" className="text-sm text-gray-700">
                  Nomor Induk Pegawai
                </Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) => handleChange("nip", e.target.value)}
                  placeholder="Masukkan NIP"
                  className="h-11"
                  disabled={isSaving}
                />
                {combinedErrors.nip && (
                  <p className="text-xs text-red-500">{combinedErrors.nip}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jabatan" className="text-sm text-gray-700">
                  Jabatan
                </Label>
                <Input
                  id="jabatan"
                  value={formData.jabatan}
                  onChange={(e) => handleChange("jabatan", e.target.value)}
                  placeholder="Masukkan jabatan"
                  className="h-11"
                  disabled={isSaving}
                />
                {combinedErrors.jabatan && (
                  <p className="text-xs text-red-500">{combinedErrors.jabatan}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departemen" className="text-sm text-gray-700">
                  Departemen
                </Label>
                <Input
                  id="departemen"
                  value={formData.departemen}
                  onChange={(e) => handleChange("departemen", e.target.value)}
                  placeholder="Masukkan departemen"
                  className="h-11"
                  disabled={isSaving}
                />
                {combinedErrors.departemen && (
                  <p className="text-xs text-red-500">{combinedErrors.departemen}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telepon" className="text-sm text-gray-700">
                Nomor Telepon
              </Label>
              <Input
                id="telepon"
                type="tel"
                value={formData.telepon}
                onChange={(e) => handleChange("telepon", e.target.value)}
                placeholder="Masukkan nomor telepon"
                className="h-11"
                disabled={isSaving}
              />
              {combinedErrors.telepon && (
                <p className="text-xs text-red-500">{combinedErrors.telepon}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Masukkan email"
                className="h-11"
                disabled={isSaving}
              />
              {combinedErrors.email && (
                <p className="text-xs text-red-500">{combinedErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-gray-700">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Masukkan username"
                className="h-11"
                disabled={isSaving}
              />
              {combinedErrors.username && (
                <p className="text-xs text-red-500">{combinedErrors.username}</p>
              )}
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
              className="h-11 px-6 bg-blue-600 text-white hover:bg-blue-700"
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
