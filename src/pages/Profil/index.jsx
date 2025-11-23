import { useCallback, useEffect, useState } from "react";
import { useAdminLayout } from "@/layouts/admin/AdminLayoutContext";
import { useAuth } from "@/auth/context/AuthContext";
import {
  ProfileCard,
  ActivityLogTable,
  EditProfileModal,
  EditPasswordModal,
} from "./components";
import { useActivityLog } from "./hooks/useActivityLog";
import { profileService } from "@/services/profileService";

const mapProfileResponse = (payload) => {
  if (!payload) return null;
  const user = payload.user || {};
  const profile = payload.profile || {};
  return {
    email: user.email || "",
    username: user.username || "",
    lastLogin: user.last_login,
    roles: payload.roles || [],
    nama: profile.full_name || "",
    nip: profile.nip || "-",
    jabatan: profile.job_title || "-",
    departemen: profile.department || "-",
    telepon: profile.phone || "-",
    status: user.deleted_at ? "Nonaktif" : "Aktif",
    createdAt: user.created_at || profile.created_at,
    updatedAt: user.updated_at || profile.updated_at,
    createdBy: user.assigned_by || "System",
    avatar: profile.avatar_url || null,
  };
};

const splitFullName = (fullName) => {
  if (!fullName) {
    return { firstName: "", lastName: "" };
  }
  const normalized = fullName.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }
  const parts = normalized.split(" ");
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const normalizeOptionalField = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "-" ? "" : trimmed;
  }
  return String(value);
};

const mapProfileFieldErrors = (errors = {}) => {
  const mapped = {};
  if (errors.first_name?.[0]) mapped.nama = errors.first_name[0];
  if (errors.last_name?.[0]) mapped.nama = errors.last_name[0];
  if (errors.username?.[0]) mapped.username = errors.username[0];
  if (errors.email?.[0]) mapped.email = errors.email[0];
  if (errors.nip?.[0]) mapped.nip = errors.nip[0];
  if (errors.job_title?.[0]) mapped.jabatan = errors.job_title[0];
  if (errors.department?.[0]) mapped.departemen = errors.department[0];
  if (errors.phone?.[0]) mapped.telepon = errors.phone[0];
  if (errors.avatar?.[0]) mapped.avatar = errors.avatar[0];
  return mapped;
};

const mapPasswordFieldErrors = (errors = {}) => {
  const mapped = {};
  if (errors.current_password?.[0]) mapped.currentPassword = errors.current_password[0];
  if (errors.new_password?.[0]) mapped.newPassword = errors.new_password[0];
  if (errors.confirm_new_password?.[0]) mapped.confirmPassword = errors.confirm_new_password[0];
  return mapped;
};

export default function Profil() {
  const { setHeader } = useAdminLayout();
  const { token, updateUserInfo } = useAuth();
  
  const [userData, setUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isEditPasswordModalOpen, setIsEditPasswordModalOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});

  const {
    data: activityLogs,
    perPage,
    currentPage,
    totalData,
    totalPages,
    loading: activityLoading,
    error: activityError,
    handlePageChange,
    handlePaginateChange,
  } = useActivityLog({ token });

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setProfileLoading(true);
    try {
      const response = await profileService.getProfile({ token });
      setUserData(mapProfileResponse(response));
      setProfileError(null);
    } catch (error) {
      setProfileError(error.message || "Gagal memuat profil");
      setUserData(null);
    } finally {
      setProfileLoading(false);
    }
  }, [token]);

  useEffect(() => {
    setHeader({
      title: "Profile Saya",
      subtitle: "Kelola informasi pribadi dan preferensi akun Anda",
      user: {
        name: userData?.nama || "Pengguna",
        role: userData?.roles?.[0] || "User",
        urlDetail: "/admin/profil",
      },
    });
  }, [setHeader, userData]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditProfile = () => {
    setProfileFieldErrors({});
    setIsEditProfileModalOpen(true);
  };

  const handleEditPassword = () => {
    setPasswordFieldErrors({});
    setIsEditPasswordModalOpen(true);
  };

  const closeProfileModal = useCallback(() => {
    setIsEditProfileModalOpen(false);
    setProfileFieldErrors({});
  }, []);

  const closePasswordModal = useCallback(() => {
    setIsEditPasswordModalOpen(false);
    setPasswordFieldErrors({});
  }, []);

  const clearProfileFieldError = useCallback((field) => {
    setProfileFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearPasswordFieldError = useCallback((field) => {
    setPasswordFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSaveProfile = async (updatedData) => {
    if (!token || !updatedData) {
      return { success: false };
    }

    const normalizedName = updatedData.nama?.trim() || "";
    if (!normalizedName) {
      setProfileFieldErrors((prev) => ({
        ...prev,
        nama: "Nama lengkap wajib diisi",
      }));
      return { success: false, errorMessage: "Nama lengkap wajib diisi" };
    }

    setProfileSaving(true);
    setProfileFieldErrors({});

    try {
      await profileService.updateAccount({
        token,
        data: {
          username: updatedData.username?.trim(),
          email: updatedData.email?.trim(),
        },
      });
      updateUserInfo({
        username: updatedData.username?.trim(),
        email: updatedData.email?.trim(),
      });

      const profileForm = new FormData();
      const { firstName, lastName } = splitFullName(normalizedName);
      if (!firstName) {
        setProfileFieldErrors({ nama: "Nama lengkap wajib diisi" });
        return { success: false, errorMessage: "Nama lengkap wajib diisi" };
      }
      profileForm.append("first_name", firstName);
      profileForm.append("last_name", lastName || "");
      profileForm.append("nip", normalizeOptionalField(updatedData.nip));
      profileForm.append("job_title", normalizeOptionalField(updatedData.jabatan));
      profileForm.append("department", normalizeOptionalField(updatedData.departemen));
      profileForm.append("phone", normalizeOptionalField(updatedData.telepon));
      if (updatedData.avatar) {
        profileForm.append("avatar", updatedData.avatar);
      }

      const profileResponse = await profileService.updateProfile({
        token,
        data: profileForm,
      });
      setUserData(mapProfileResponse(profileResponse));
      closeProfileModal();
      alert("Profil berhasil diperbarui!");
      return { success: true };
    } catch (error) {
      const backendErrors = error?.data?.errors || {};
      const mappedErrors = mapProfileFieldErrors(backendErrors);
      const fallbackMessage =
        error?.data?.message || error?.message || "Gagal memperbarui profil";
      if (!Object.keys(mappedErrors).length && fallbackMessage) {
        mappedErrors.submit = fallbackMessage;
      }
      setProfileFieldErrors(mappedErrors);
      return {
        success: false,
        errorMessage: fallbackMessage,
      };
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePassword = async (passwordData) => {
    if (!token || !passwordData) {
      return { success: false };
    }

    setPasswordSaving(true);
    setPasswordFieldErrors({});

    try {
      await profileService.updatePassword({
        token,
        data: {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_new_password: passwordData.confirmPassword,
        },
      });
      closePasswordModal();
      alert("Kata sandi berhasil diubah!");
      return { success: true };
    } catch (error) {
      const backendErrors = error?.data?.errors || {};
      const mappedErrors = mapPasswordFieldErrors(backendErrors);
      const fallbackMessage =
        error?.data?.message || error?.message || "Gagal mengubah kata sandi";
      if (!Object.keys(mappedErrors).length && fallbackMessage) {
        mappedErrors.submit = fallbackMessage;
      }
      setPasswordFieldErrors(mappedErrors);
      return {
        success: false,
        errorMessage: fallbackMessage,
      };
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      {profileLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">
          Memuat profil...
        </div>
      ) : profileError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-semibold mb-2">Gagal memuat profil</p>
          <p className="text-sm mb-3">{profileError}</p>
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:underline"
            onClick={fetchProfile}
          >
            Coba lagi
          </button>
        </div>
      ) : userData ? (
        <ProfileCard
          user={userData}
          onEditProfile={handleEditProfile}
          onEditPassword={handleEditPassword}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          Data profil tidak tersedia.
        </div>
      )}

      {/* Activity Log Table */}
      <ActivityLogTable
        data={activityLogs}
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        totalData={totalData}
        onPageChange={handlePageChange}
        onPaginateChange={handlePaginateChange}
        loading={activityLoading}
        error={activityError}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={closeProfileModal}
        user={userData || {}}
        onSave={handleSaveProfile}
        errors={profileFieldErrors}
        isSaving={profileSaving}
        onFieldChange={clearProfileFieldError}
      />

      {/* Edit Password Modal */}
      <EditPasswordModal
        isOpen={isEditPasswordModalOpen}
        onClose={closePasswordModal}
        onSave={handleSavePassword}
        isSubmitting={passwordSaving}
        errors={passwordFieldErrors}
        onFieldChange={clearPasswordFieldError}
      />
    </div>
  );
}
