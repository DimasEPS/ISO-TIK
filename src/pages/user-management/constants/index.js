/**
 * Constants for Manajemen Pengguna module
 */

export const FILTER_OPTIONS = [
  { value: "Semua Status" },
  { value: "Aktif" },
  { value: "Menunggu" },
  { value: "Nonaktif" },
];

export const PAGINATE_OPTIONS = [10, 20, 50];

export const STATUS_STYLES = {
  Aktif: "bg-green-light text-green border border-[#BDECCB] shadow-sm small",
  Menunggu: "bg-yellow-light text-yellow border border-[#F4E0A3] shadow-sm small",
  Nonaktif: "bg-gray-light text-navy-hover border border-[#D7DBE4] shadow-sm small",
};

export const AVAILABLE_ROLES = ["Admin", "Auditor", "Reviewer", "Approver", "Direktur", "Manager"];

export const STATUS_OPTIONS = ["Aktif", "Menunggu", "Nonaktif"];
