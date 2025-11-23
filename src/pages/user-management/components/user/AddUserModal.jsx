import { useState, useEffect } from "react";
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
import { useUserRoles } from "@/hooks/useUserManagement";

const STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

/**
 * Modal untuk menambah user baru
 * Backend API schema requires: first_name, last_name, username, email, password, password_confirmation, status, role_ids[]
 */
export function AddUserModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    status: "active",
    password: "",
    password_confirmation: "",
  });

  const [selectedRoles, setSelectedRoles] = useState([]); // Array of { id: uuid, name: string }
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch available roles from API
  const { data: rolesResponse, isLoading: isLoadingRoles } = useUserRoles()
  const availableRoles = rolesResponse?.data ?? []

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddRole = () => {
    if (selectedRoleId && !selectedRoles.some(r => r.id === selectedRoleId)) {
      const role = availableRoles.find(r => r.id === selectedRoleId)
      if (role) {
        setSelectedRoles([...selectedRoles, {
          id: role.id,
          name: role.name,
          dateAdded: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
        }])
        setSelectedRoleId("")
        if (errors.roles) {
          setErrors((prev) => ({ ...prev, roles: "" }))
        }
      }
    }
  };

  const handleRemoveRole = (roleId) => {
    setSelectedRoles(selectedRoles.filter(r => r.id !== roleId));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "Nama depan wajib diisi";
    if (!formData.last_name.trim()) newErrors.last_name = "Nama belakang wajib diisi";
    if (!formData.username.trim()) newErrors.username = "Username wajib diisi";
    if (!formData.email.trim()) newErrors.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email tidak valid";
    if (!formData.password) newErrors.password = "Password wajib diisi";
    else if (formData.password.length < 8) newErrors.password = "Password minimal 8 karakter";
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Password tidak cocok";
    }
    if (selectedRoles.length === 0) newErrors.roles = "Minimal satu role harus ditambahkan";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare payload according to CreateAdminUserRequest schema
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        status: formData.status,
        role_ids: selectedRoles.map(r => r.id), // Array of UUIDs
      };
      onSave(payload);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      status: "active",
      password: "",
      password_confirmation: "",
    });
    setSelectedRoles([]);
    setSelectedRoleId("");
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
                <Label htmlFor="first_name" className="text-sm text-gray-700">
                  Nama Depan
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  placeholder="Masukkan Nama Depan"
                  className={`h-11 ${errors.first_name ? "border-red-500" : ""}`}
                />
                {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm text-gray-700">
                  Nama Belakang
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  placeholder="Masukkan Nama Belakang"
                  className={`h-11 ${errors.last_name ? "border-red-500" : ""}`}
                />
                {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
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
                <Label htmlFor="password_confirmation" className="text-sm text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => handleChange("password_confirmation", e.target.value)}
                  placeholder="Ulangi Password"
                  className={`h-11 ${errors.password_confirmation ? "border-red-500" : ""}`}
                />
                {errors.password_confirmation && <p className="text-xs text-red-500">{errors.password_confirmation}</p>}
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
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
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
                  value={selectedRoleId}
                  onValueChange={(value) => setSelectedRoleId(value)}
                  disabled={isLoadingRoles}
                >
                  <SelectTrigger className="h-11 flex-1">
                    <SelectValue placeholder={isLoadingRoles ? "Memuat role..." : "Pilih Role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddRole}
                  className="bg-blue hover:bg-blue-600"
                  disabled={!selectedRoleId || isLoadingRoles}
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
                    {selectedRoles.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center p-4 text-sm text-gray-500">
                          Belum ada role yang ditambahkan
                        </td>
                      </tr>
                    ) : (
                      selectedRoles.map((role) => (
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
