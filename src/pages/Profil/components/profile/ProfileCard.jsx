import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Key, UserCog } from "lucide-react";

/**
 * Reusable Profile Card Component
 * @param {Object} user - User profile data
 * @param {Function} onEditAccount - Callback for edit account button
 * @param {Function} onEditProfile - Callback for edit profile button
 * @param {Function} onEditPassword - Callback for edit password button
 */
export function ProfileCard({ user, onEditAccount, onEditProfile, onEditPassword }) {
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - User Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Email</div>
            <div className="text-base text-navy font-medium">{user.email || "-"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Username</div>
            <div className="text-base text-navy font-medium">{user.username || "-"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Last Login</div>
            <div className="text-base text-navy font-medium">
              {formatDate(user.lastLogin)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Role</div>
            <div className="flex flex-col gap-1">
              {user.roles?.map((role, index) => (
                <div key={index} className="text-base text-navy font-medium">
                  {role}
                </div>
              )) || <div className="text-base text-navy font-medium">-</div>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={onEditAccount}
              variant="outline"
              className="w-full border-gray-300 gap-2"
            >
              <UserCog className="h-4 w-4" />
              Edit Akun
            </Button>
            <Button
              onClick={onEditPassword}
              variant="outline"
              className="w-full border-gray-300 gap-2"
            >
              <Key className="h-4 w-4" />
              Ubah Password
            </Button>
            <Button
              onClick={onEditProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Data Diri
            </Button>
          </div>
        </div>

        {/* Center Section - Avatar */}
        <div className="lg:col-span-1 flex flex-col items-center justify-start pt-4">
          <Avatar className="h-32 w-32 bg-navy text-white">
            <AvatarImage src={user.avatar} alt={user.nama} />
            <AvatarFallback className="text-3xl bg-navy text-white">
              {getInitials(user.nama)}
            </AvatarFallback>
          </Avatar>
          <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {user.status || "Aktif"}
          </div>
          <div className="mt-4 space-y-2 text-center">
            <div className="text-sm text-gray-600">Nama Lengkap</div>
            <div className="text-lg text-navy font-semibold">
              {user.degreePrefix && `${user.degreePrefix} `}
              {user.nama || "-"}
              {user.degreeSuffix && `, ${user.degreeSuffix}`}
            </div>
          </div>
          <div className="mt-4 space-y-2 text-center">
            <div className="text-sm text-gray-600">Nomor Induk Pegawai</div>
            <div className="text-base text-navy font-medium">{user.nip || "-"}</div>
          </div>
        </div>

        {/* Right Section - Additional Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Jabatan</div>
            <div className="text-base text-navy font-medium">{user.jabatan || "-"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Departemen</div>
            <div className="text-base text-navy font-medium">{user.departemen || "-"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Nomor Telepon</div>
            <div className="text-base text-navy font-medium">{user.telepon || "-"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Tanggal Dibuat</div>
            <div className="text-base text-navy font-medium">
              {formatDate(user.createdAt)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Terakhir Diperbarui</div>
            <div className="text-base text-navy font-medium">
              {formatDate(user.updatedAt)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Ditambahkan Oleh</div>
            <div className="text-base text-navy font-medium">{user.createdBy || "System"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
