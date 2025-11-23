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

/**
 * Modal Edit Akun Anda (Username & Email)
 * Endpoint: PUT /users/me/account
 */
export function EditAccountModal({
  isOpen,
  onClose,
  user,
  onSave,
  errors = {},
  isSaving = false,
  onFieldChange,
}) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [clientErrors, setClientErrors] = useState({});

  const combinedErrors = { ...clientErrors, ...errors };

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
    
    if (!formData.username.trim()) {
      validationErrors.username = "Username wajib diisi";
    }
    if (!formData.email.trim()) {
      validationErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Email tidak valid";
    }

    if (Object.keys(validationErrors).length > 0) {
      setClientErrors(validationErrors);
      return;
    }

    setClientErrors({});
    const result = await onSave(formData);

    if (result?.success) {
      setClientErrors({});
    } else if (result?.errorMessage) {
      setClientErrors((prev) => ({ ...prev, submit: result.errorMessage }));
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
      });
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
      <DialogContent className="sm:max-w-[450px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy mb-2">
            Edit Akun Anda
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Lakukan perubahan akun untuk mengubah Edit Akun Anda secara keseluruhan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-gray-700">
                Username
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

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-700">
                Email
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
