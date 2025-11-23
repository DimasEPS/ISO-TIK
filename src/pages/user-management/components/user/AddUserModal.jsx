import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const AVAILABLE_ROLES = ["Admin", "Auditor", "Reviewer", "Approver", "Direktur", "Manager"];
const STATUS_OPTIONS = ["Aktif", "Menunggu", "Nonaktif"];

/**
 * Modal untuk menambah user baru
 */
export function AddUserModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    fullName: "",
    lastName: "",
    username: "",
    email: "",
    status: "Aktif",
    password: "",
    confirmPassword: "",
  });

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddRole = () => {
    if (selectedRole && !roles.some(r => r.name === selectedRole)) {
      const newRole = {
        id: Date.now(),
        name: selectedRole,
        dateAdded: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      };
      setRoles([...roles, newRole]);
      setSelectedRole("");
    }
  };

  const handleRemoveRole = (roleId) => {
    setRoles(roles.filter(r => r.id !== roleId));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Nama depan wajib diisi";
    if (!formData.username.trim()) newErrors.username = "Username wajib diisi";
    if (!formData.email.trim()) newErrors.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email tidak valid";
    if (!formData.password) newErrors.password = "Password wajib diisi";
    else if (formData.password.length < 8) newErrors.password = "Password minimal 8 karakter";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }
    if (roles.length === 0) newErrors.roles = "Minimal satu role harus ditambahkan";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { confirmPassword, ...userData } = formData;
      onSave({ ...userData, roles: roles.map(r => r.name) });
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      lastName: "",
      username: "",
      email: "",
      status: "Aktif",
      password: "",
      confirmPassword: "",
    });
    setRoles([]);
    setSelectedRole("");
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy mb-2">
            Tambah Pengguna
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nama Depan dan Belakang */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm text-gray-700">
                  Nama Depan
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Masukkan Nama Depan"
                  className={`h-11 ${errors.fullName ? "border-red-500" : ""}`}
                />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm text-gray-700">
                  Nama Belakang
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Masukkan Nama Belakang"
                  className="h-11"
                />
              </div>
            </div>

            {/* Username dan Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="Masukkan Username"
                  className={`h-11 ${errors.username ? "border-red-500" : ""}`}
                />
                {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Masukkan Email"
                  className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            {/* Password dan Confirm Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Masukkan Password"
                  className={`h-11 ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Ulangi Password"
                  className={`h-11 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm text-gray-700">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tetapkan Role Akses Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-navy">Tetapkan Role Akses</p>
              </div>

              {/* Role Selection */}
              <div className="flex gap-2 mb-4">
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value)}
                >
                  <SelectTrigger className="h-11 flex-1">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddRole}
                  className="bg-blue hover:bg-blue-600"
                >
                  Tambah
                </Button>
              </div>

              {/* Roles Table */}
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-navy">Nama</th>
                      <th className="text-left p-3 text-sm font-semibold text-navy">Tanggal Ditambahkan</th>
                      <th className="text-center p-3 text-sm font-semibold text-navy w-20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center p-4 text-sm text-gray-500">
                          Belum ada role yang ditambahkan
                        </td>
                      </tr>
                    ) : (
                      roles.map((role) => (
                        <tr key={role.id} className="border-b last:border-b-0">
                          <td className="p-3 text-sm">{role.name}</td>
                          <td className="p-3 text-sm">{role.dateAdded}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRole(role.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {errors.roles && <p className="text-xs text-red-500 mt-2">{errors.roles}</p>}
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-11 px-6 border-gray-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 bg-navy text-white hover:bg-navy-hover"
            >
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
