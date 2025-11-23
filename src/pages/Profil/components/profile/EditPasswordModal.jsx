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
import { Eye, EyeOff } from "lucide-react";

/**
 * Reusable Edit Password Modal Component
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Close modal callback
 * @param {Function} onSave - Save changes callback
 */
export function EditPasswordModal({
  isOpen,
  onClose,
  onSave,
  isSubmitting = false,
  errors: serverErrors = {},
  onFieldChange,
}) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [clientErrors, setClientErrors] = useState({});
  const combinedErrors = { ...clientErrors, ...serverErrors };

  const resetFormState = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setClientErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      resetFormState();
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (clientErrors[field]) {
      setClientErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverErrors[field] && onFieldChange) {
      onFieldChange(field);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Kata sandi saat ini wajib diisi";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Kata sandi baru wajib diisi";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Kata sandi minimal 8 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Kata sandi tidak cocok";
    }

    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await onSave({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });

    if (result?.success) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setClientErrors({});
    } else if (result?.errorMessage) {
      setClientErrors((prev) => ({ ...prev, submit: result.errorMessage }));
    }
  };

  const handleClose = () => {
    // Reset form and errors
    resetFormState();
    onClose();
  };

  const handleDialogChange = (openState) => {
    if (!openState) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[500px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy mb-2">
            Edit Kata Sandi
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Pastikan kata sandi baru berbeda dengan kata sandi saat ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm text-gray-700">
                Kata Sandi Saat Ini <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleChange("currentPassword", e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className={`h-11 pr-10 ${combinedErrors.currentPassword ? "border-red-500" : ""}`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {combinedErrors.currentPassword && (
                <p className="text-xs text-red-500">{combinedErrors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm text-gray-700">
                Kata Sandi Baru <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Masukkan kata sandi baru"
                  className={`h-11 pr-10 ${combinedErrors.newPassword ? "border-red-500" : ""}`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {combinedErrors.newPassword && (
                <p className="text-xs text-red-500">{combinedErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
                Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Konfirmasi kata sandi baru"
                  className={`h-11 pr-10 ${combinedErrors.confirmPassword ? "border-red-500" : ""}`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {combinedErrors.confirmPassword && (
                <p className="text-xs text-red-500">{combinedErrors.confirmPassword}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-medium mb-1">Persyaratan kata sandi:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Minimal 8 karakter</li>
                <li>Disarankan menggunakan kombinasi huruf besar, huruf kecil, angka, dan simbol</li>
              </ul>
            </div>
          </div>

          {combinedErrors.submit && (
            <p className="text-sm text-red-500 mt-2">{combinedErrors.submit}</p>
          )}

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-11 px-6 border-gray-300"
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 bg-blue-600 text-white hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Ubah Kata Sandi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
