import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { casesMockData } from "./data/mockData";
import { STATUS_BADGE_STYLES } from "./constants";

export default function CaseDetailPage() {
  usePageTemplate({
    title: "Non Conformity Report (NCR)",
    subtitle: "Detail Kasus NCR",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const navigate = useNavigate();
  const { id, caseId } = useParams();

  // Mock data - in real app, fetch based on caseId
  const caseDetail = casesMockData.find(c => c.id === caseId) || {
    id: caseId || "010101",
    bagianTerkait: "Ruang Server",
    tanggal: "27/4/2025",
    standarReferensi: "STANDAR ISO : 27001:2022",
    klasifikasi: "-",
    namaAuditor: "Cakrawerdaya",
    namaAuditee: "-",
    status: "Rasiban",
  };

  const ncrDetail = {
    id: id,
    title: "NCR Dokumen 1",
    date: "27/4/2025",
  };

  const [findings] = useState([
    {
      id: 1,
      kategori: "Kategori Temuan Audit - Minor",
      deskripsi: "Organisasi PT. ABC belum adanya SDM IT khususnya pada bidang artefaktif IT, organisasi hanya memiliki SDM IT Support",
    },
    {
      id: 2,
      kategori: "Kategori Temuan Audit - Minor",
      deskripsi: "Organisasi PT. ABC belum adanya SDM IT khususnya pada bidang artefaktif IT, organisasi hanya memiliki SDM IT Support",
    },
  ]);

  const [targetDate] = useState("6/1/2025");

  const [analyses] = useState([
    {
      id: 1,
      deskripsi: "Organisasi masih baru dan di rasa belum dibutuhkan secara operasional dan tenaga kerja yang berkerja existing secara otodidak",
    },
    {
      id: 2,
      deskripsi: "Organisasi PT. ABC belum adanya SDM IT khususnya pada bidang artefaktif IT, organisasi hanya memiliki SDM IT Support",
    },
  ]);

  const [corrections] = useState([
    {
      id: 1,
      deskripsi: "organisasi harus merekrut SDM IT profesional",
    },
    {
      id: 2,
      deskripsi: "organisasi harus merekrut SDM IT profesional",
    },
  ]);

  const [correctiveActions] = useState([
    {
      id: 1,
      deskripsi: "organisasi akan Menyusun struktur organisasi",
    },
    {
      id: 2,
      deskripsi: "organisasi akan membuat job requirement",
    },
    {
      id: 3,
      deskripsi: "melakukan rekrutmen sesuai koreksi",
    },
  ]);

  const [verificationData] = useState({
    namaPemverifikasi: "Cakrawerdaya",
    tanggalPemverifikasi: "27/7/2025",
    tanggalVerifikasi: "27/7/2025",
    catatanVerifikasi: "STANDAR ISO : 27001:2022",
  });

  const handleBack = () => {
    navigate(`/admin/ncr/${id}/kasus`);
  };

  const handleDaftarTemuan = () => {
    navigate(`/admin/ncr/${id}/kasus/${caseId}/temuan`);
  };

  const getStatusBadgeClass = (status) => {
    const statusKey = status?.toLowerCase();
    return STATUS_BADGE_STYLES[statusKey] || STATUS_BADGE_STYLES.default;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate("/admin/ncr")}
          className="text-gray-dark hover:text-navy"
        >
          Dokumen NCR
        </button>
        <span className="text-gray-dark">&gt;</span>
        <button
          onClick={handleBack}
          className="text-gray-dark hover:text-navy"
        >
          Daftar Kasus
        </button>
        <span className="text-gray-dark">&gt;</span>
        <span className="text-navy font-medium">Detail Kasus</span>
      </div>

      {/* Header Section */}
      <div className="bg-blue-50 border border-blue-600 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-navy mb-6">Detail Kasus NCR</h1>
        
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">No. NCR</p>
            <p className="text-base font-bold text-navy">{caseDetail.id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">Bagian/Lokasi</p>
            <p className="text-base text-navy">{caseDetail.bagianTerkait}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">Tanggal</p>
            <p className="text-base text-navy">{caseDetail.tanggal}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">Klausul</p>
            <p className="text-base text-navy">{caseDetail.klasifikasi}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">Standar Referensi</p>
            <p className="text-base text-navy">{caseDetail.standarReferensi}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">Nama Auditee</p>
            <p className="text-base text-navy">{caseDetail.namaAuditee}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">Nama Auditor</p>
            <p className="text-base text-navy">{caseDetail.namaAuditor}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">Status Auditee</p>
            <div>
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusBadgeClass(caseDetail.status)}`}>
                {caseDetail.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleDaftarTemuan}
            className="h-10 px-6 bg-gray-900 text-white hover:bg-gray-800"
          >
            Daftar Temuan
          </Button>
        </div>
      </div>

      {/* Uraian Ketidaksesuaian Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-navy">
            Uraian Ketidaksesuaian :
          </h3>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700">{findings[0]?.kategori}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 p-3">
          <div className="space-y-2">
            {findings.map((finding, index) => (
              <div key={finding.id} className="flex items-center gap-2">
                <span className="text-sm text-navy font-medium">{index + 1}.</span>
                <p className="text-sm text-navy flex-1">{finding.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tanggal Target Perbaikan Section */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-navy mb-2">
          Tanggal Target Perbaikan
        </h3>
        <div className="bg-green-100 border border-green-600 rounded px-3 py-2 inline-block">
          <p className="text-base text-navy font-medium">{targetDate}</p>
        </div>
      </div>

      {/* Analisis Penyebab Ketidaksesuaian Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-navy mb-3">
          Analisis Penyebab Ketidaksesuaian :
        </h3>

        <div className="bg-white rounded-lg border border-gray-300 p-3">
          <div className="space-y-2">
            {analyses.map((analysis, index) => (
              <div key={analysis.id} className="flex items-center gap-2">
                <span className="text-sm text-navy font-medium">{index + 1}.</span>
                <p className="text-sm text-navy flex-1">{analysis.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Koreksi Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-navy mb-3">Koreksi:</h3>

        <div className="bg-white rounded-lg border border-gray-300 p-3">
          <div className="space-y-2">
            {corrections.map((correction, index) => (
              <div key={correction.id} className="flex items-center gap-2">
                <span className="text-sm text-navy font-medium">{index + 1}.</span>
                <p className="text-sm text-navy flex-1">{correction.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tindakan Koreksi Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-navy mb-3">Tindakan Koreksi:</h3>

        <div className="bg-white rounded-lg border border-gray-300 p-3">
          <div className="space-y-2">
            {correctiveActions.map((action, index) => (
              <div key={action.id} className="flex items-center gap-2">
                <span className="text-sm text-navy font-medium">{index + 1}.</span>
                <p className="text-sm text-navy flex-1">{action.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Card */}
      <div className="bg-green-50 border border-green-600 rounded-lg p-4">
        <h3 className="text-base font-semibold text-navy mb-4">
          Verifikasi Tindakan Perbaikan
        </h3>

        <div className="bg-white rounded-lg border border-gray-300 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Nama Pemverifikasi</p>
              <p className="text-base text-navy font-medium">
                {verificationData.namaPemverifikasi}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600">Tanggal Pemverifikasi</p>
              <p className="text-base text-navy font-medium">
                {verificationData.tanggalPemverifikasi}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600">Tanggal Verifikasi</p>
              <p className="text-base text-navy font-medium">
                {verificationData.tanggalVerifikasi}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600">Catatan Verifikasi</p>
              <p className="text-base text-navy font-medium">
                {verificationData.catatanVerifikasi}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
