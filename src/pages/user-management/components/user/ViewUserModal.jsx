import { DetailModal } from "@/pages/ncr/components/common";

// Status mapping: API (active/inactive) → display (Aktif/Nonaktif)
const STATUS_DISPLAY_MAP = {
  active: "Aktif",
  inactive: "Nonaktif",
}

/**
 * Modal untuk melihat detail user
 * Handles API response format: full_name, status: active/inactive, roles: array of strings
 */
export function ViewUserModal({ isOpen, onClose, user }) {
  if (!user) return null;

  // Handle both API format (full_name) and legacy format (fullName/lastName)
  const fullName = user.full_name || (user.lastName ? `${user.fullName} ${user.lastName}` : user.fullName) || "-";
  
  // Roles from API is array of strings, or legacy format with objects
  const roleNames = user.roles && user.roles.length > 0 
    ? (typeof user.roles[0] === "string" 
        ? user.roles.join(", ") 
        : user.roles.map(r => r.name || r).join(", "))
    : user.role || "-";

  // Map status to display format
  const displayStatus = STATUS_DISPLAY_MAP[user.status] || user.status || "-";

  const fields = [
    { label: "Nama Lengkap", value: fullName },
    { label: "Username", value: user.username || "-" },
    { label: "Email", value: user.email || "-" },
    { label: "Role", value: roleNames },
    { 
      label: "Status", 
      value: displayStatus,
      type: "badge",
      badgeClassName: user.status === "active" || displayStatus === "Aktif"
        ? "bg-green-100 text-green-700" 
        : user.status === "inactive" || displayStatus === "Nonaktif"
        ? "bg-gray-100 text-gray-700"
        : "bg-yellow-100 text-yellow-700"
    },
    { label: "Tanggal Dibuat", value: user.createdAt || user.created_at || "-" },
    { label: "Terakhir Login", value: user.lastLogin || user.last_login || "-" },
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
