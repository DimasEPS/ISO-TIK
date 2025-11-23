import { DetailModal } from "../common";
import { STATUS_BADGE_STYLES } from "../../constants";

export function CaseDetailModal({ isOpen, onClose, caseData, primaryAction, secondaryAction }) {
  const getStatusBadgeClass = (status) => {
    const statusKey = status?.toLowerCase();
    return STATUS_BADGE_STYLES[statusKey] || STATUS_BADGE_STYLES.default;
  };

  const fields = [
    {
      label: "No. NCR",
      value: caseData.id,
      className: "font-bold text-navy",
    },
    {
      label: "Bagian/Lokasi",
      value: caseData.bagianTerkait,
    },
    {
      label: "Tanggal",
      value: caseData.tanggal,
    },
    {
      label: "Standar Referensi",
      value: caseData.standarReferensi,
    },
    {
      label: "Klausul",
      value: caseData.klasifikasi,
    },
    {
      label: "Nama Auditor",
      value: caseData.namaAuditor,
    },
    {
      label: "Nama Auditee",
      value: caseData.namaAuditee,
    },
    {
      label: "Status",
      value: caseData.status,
      type: "badge",
      badgeClassName: getStatusBadgeClass(caseData.status),
    },
  ];

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Kasus NCR"
      subtitle="Informasi lengkap mengenai Kasus NCR yang dipilih"
      fields={fields}
      layout="grid"
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
    />
  );
}
