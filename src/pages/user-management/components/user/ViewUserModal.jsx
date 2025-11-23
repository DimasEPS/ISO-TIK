import { DetailModal } from "@/pages/ncr/components/common";

/**
 * Modal untuk melihat detail user
 */
export function ViewUserModal({ isOpen, onClose, user }) {
  if (!user) return null;

  const fullName = user.lastName ? `${user.fullName} ${user.lastName}` : user.fullName;
  const roleNames = user.roles && user.roles.length > 0 
    ? user.roles.map(r => r.name).join(", ") 
    : user.role || "-";

  const fields = [
    { label: "Nama Lengkap", value: fullName || "-" },
    { label: "Username", value: user.username || "-" },
    { label: "Email", value: user.email || "-" },
    { label: "Role", value: roleNames },
    { 
      label: "Status", 
      value: user.status || "-",
      type: "badge",
      badgeClassName: user.status === "Aktif" 
        ? "bg-green-100 text-green-700" 
        : user.status === "Menunggu"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-700"
    },
    { label: "Tanggal Dibuat", value: user.createdAt || "-" },
    { label: "Terakhir Login", value: user.lastLogin || "-" },
  ];

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Pengguna"
      subtitle={`Informasi lengkap pengguna ${fullName}`}
      fields={fields}
      layout="grid"
      secondaryAction={{
        label: "Tutup",
        onClick: onClose,
        className: "h-11 px-6 border-gray-300"
      }}
    />
  );
}
