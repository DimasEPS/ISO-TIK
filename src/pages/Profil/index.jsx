import { useCallback, useEffect, useState } from "react";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { useAuth } from "@/auth/context/AuthContext";
import {
  ProfileCard,
  ActivityLogTable,
  EditAccountModal,
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
    degreePrefix: profile.degree_prefix || "",
    nama: profile.full_name || "",
    degreeSuffix: profile.degree_suffix || "",
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
  if (errors.degree_prefix?.[0]) mapped.gelarAwalan = errors.degree_prefix[0];
  if (errors.first_name?.[0]) mapped.namaDepan = errors.first_name[0];
  if (errors.last_name?.[0]) mapped.namaBelakang = errors.last_name[0];
  if (errors.degree_suffix?.[0]) mapped.gelarAkhiran = errors.degree_suffix[0];
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

const mapAccountFieldErrors = (errors = {}) => {
  const mapped = {};
  if (errors.username?.[0]) mapped.username = errors.username[0];
  if (errors.email?.[0]) mapped.email = errors.email[0];
  return mapped;
};

export default function Profil() {
  const { token, updateUserInfo } = useAuth();
  const [userData, setUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isEditPasswordModalOpen, setIsEditPasswordModalOpen] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountFieldErrors, setAccountFieldErrors] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});
  usePageTemplate({
    title: "Profile Saya",
    subtitle: "Kelola informasi pribadi dan preferensi akun Anda",
    user: {
      name: userData?.nama || "Pengguna",
      role: userData?.roles?.[0] || "User",
      urlDetail: "/admin/profil",
    },
  });

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
    fetchProfile();
  }, [fetchProfile]);

  const handleEditAccount = () => {
    setAccountFieldErrors({});
    setIsEditAccountModalOpen(true);
  };

  const handleEditProfile = () => {
    setProfileFieldErrors({});
    setIsEditProfileModalOpen(true);
  };

  const handleEditPassword = () => {
    setPasswordFieldErrors({});
    setIsEditPasswordModalOpen(true);
  };

  const closeAccountModal = useCallback(() => {
    setIsEditAccountModalOpen(false);
    setAccountFieldErrors({});
  }, []);

  const closeProfileModal = useCallback(() => {
    setIsEditProfileModalOpen(false);
    setProfileFieldErrors({});
  }, []);

  const closePasswordModal = useCallback(() => {
    setIsEditPasswordModalOpen(false);
    setPasswordFieldErrors({});
  }, []);

  const clearAccountFieldError = useCallback((field) => {
    setAccountFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
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

    const firstName = updatedData.firstName?.trim() || "";
    const lastName = updatedData.lastName?.trim() || "";

    if (!firstName) {
      setProfileFieldErrors((prev) => ({
        ...prev,
        namaDepan: "Nama depan wajib diisi",
      }));
      return { success: false, errorMessage: "Nama depan wajib diisi" };
    }

    setProfileSaving(true);
    setProfileFieldErrors({});

    try {
      const payload = {
        first_name: firstName,
      };

      if (lastName) {
        payload.last_name = lastName;
      }

      const degreePrefix = normalizeOptionalField(updatedData.degreePrefix);
      if (degreePrefix) payload.degree_prefix = degreePrefix;

      const degreeSuffix = normalizeOptionalField(updatedData.degreeSuffix);
      if (degreeSuffix) payload.degree_suffix = degreeSuffix;

      const nip = normalizeOptionalField(updatedData.nip);
      if (nip) payload.nip = nip;

      const jobTitle = normalizeOptionalField(updatedData.jabatan);
      if (jobTitle) payload.job_title = jobTitle;

      const department = normalizeOptionalField(updatedData.departemen);
      if (department) payload.department = department;

      const phone = normalizeOptionalField(updatedData.telepon);
      if (phone) payload.phone = phone;

      const profileResponse = await profileService.updateProfile({
        token,
        data: payload,
      });
      
      // Update local user data
      setUserData(mapProfileResponse(profileResponse));
      
      // Update auth context if username/email changed (from response)
      if (profileResponse?.user) {
        updateUserInfo({
          username: profileResponse.user.username,
          email: profileResponse.user.email,
        });
      }
      
      closeProfileModal();
      alert("Profil berhasil diperbarui!");
      return { success: true };
    } catch (error) {
      console.error("=== Profile Update Error ===");
      console.error("Full error:", error);
      console.error("Error data:", error?.data);
      console.error("Backend errors:", error?.data?.errors);
      console.error("Error message:", error?.data?.message);
      
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

  const handleSaveAccount = async (accountData) => {
    if (!token || !accountData) {
      return { success: false };
    }

    setAccountSaving(true);
    setAccountFieldErrors({});

    try {
      const response = await profileService.updateAccount({
        token,
        data: {
          username: accountData.username,
          email: accountData.email,
        },
      });
      
      // Update local user data
      setUserData((prev) => ({
        ...prev,
        username: accountData.username,
        email: accountData.email,
      }));
      
      // Update auth context
      updateUserInfo({
        username: accountData.username,
        email: accountData.email,
      });
      
      closeAccountModal();
      alert("Akun berhasil diperbarui!");
      return { success: true };
    } catch (error) {
      const backendErrors = error?.data?.errors || {};
      const mappedErrors = mapAccountFieldErrors(backendErrors);
      const fallbackMessage =
        error?.data?.message || error?.message || "Gagal memperbarui akun";
      if (!Object.keys(mappedErrors).length && fallbackMessage) {
        mappedErrors.submit = fallbackMessage;
      }
      setAccountFieldErrors(mappedErrors);
      return {
        success: false,
        errorMessage: fallbackMessage,
      };
    } finally {
      setAccountSaving(false);
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
          onEditAccount={handleEditAccount}
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

      {/* Edit Account Modal */}
      <EditAccountModal
        isOpen={isEditAccountModalOpen}
        onClose={closeAccountModal}
        user={userData || {}}
        onSave={handleSaveAccount}
        errors={accountFieldErrors}
        isSaving={accountSaving}
        onFieldChange={clearAccountFieldError}
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
