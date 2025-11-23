import { useNavigate } from "react-router-dom";
import { DetailModal } from "../common";

export function NCRDetailModal({ isOpen, onClose, ncrData }) {
  const navigate = useNavigate();

  const handleViewCases = () => {
    onClose();
    navigate(`/admin/ncr/${ncrData.id}/kasus`);
  };

  const fields = [
    {
      label: "Judul Dokumen",
      value: ncrData.title,
      className: "text-lg font-semibold text-navy",
    },
    {
      label: "Tanggal Dibuat",
      value: ncrData.date,
    },
    {
      label: "Deskripsi",
      value: ncrData.description,
      type: "description",
    },
  ];

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Dokumen NCR"
      subtitle="Informasi lengkap mengenai dokumen NCR yang dipilih"
      fields={fields}
      primaryAction={{
        label: "Lihat Kasus NCR",
        onClick: handleViewCases,
      }}
    />
  );
}
