import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { ListCard } from "./components/common";
import { ResponseItemModal, ResponseDeleteModal, DateEditModal, VerificationModal } from "./components/response";

export default function ResponsePage() {
  usePageTemplate({
    title: "Non Conformity Report (NCR)",
    subtitle: "Kelola dokumen dan tanggapan",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const navigate = useNavigate();
  const { id, caseId } = useParams();

  // Mock data - in real app, fetch based on caseId
  const caseDetail = {
    ncrTitle: "NCR Dokumen 1",
    caseNumber: "010101",
  };

  const [targetDate, setTargetDate] = useState("8/1/2025");
  const [findings, setFindings] = useState([
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

  const [analyses, setAnalyses] = useState([
    {
      id: 1,
      deskripsi: "Organisasi masih baru dan di rasa belum dibutuhkan secara operasional dan tenaga kerja yang berkerja existing secara otodidak",
    },
    {
      id: 2,
      deskripsi: "Organisasi PT. ABC belum adanya SDM IT khususnya pada bidang artefaktif IT, organisasi hanya memiliki SDM IT Support",
    },
  ]);

  const [corrections, setCorrections] = useState([
    {
      id: 1,
      deskripsi: "organisasi harus merekrut SDM IT profesional",
    },
    {
      id: 2,
      deskripsi: "organisasi harus merekrut SDM IT profesional",
    },
  ]);

  const [correctiveActions, setCorrectiveActions] = useState([
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

  // Modal states
  const [isDateEditModalOpen, setIsDateEditModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isAnalysisDeleteModalOpen, setIsAnalysisDeleteModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isCorrectionDeleteModalOpen, setIsCorrectionDeleteModalOpen] = useState(false);
  const [isCorrectiveActionModalOpen, setIsCorrectiveActionModalOpen] = useState(false);
  const [isCorrectiveActionDeleteModalOpen, setIsCorrectiveActionDeleteModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  const handleBack = () => {
    navigate(`/admin/ncr/${id}/kasus/${caseId}/temuan`);
  };

  // Date handlers
  const handleEditTargetDate = () => {
    setIsDateEditModalOpen(true);
  };

  const handleSaveDate = (newDate) => {
    setTargetDate(newDate);
    console.log("Saving date:", newDate);
  };

  // Analysis handlers
  const handleAddAnalysis = () => {
    setIsAnalysisModalOpen(true);
  };

  const handleSaveAnalysis = (data) => {
    const newId = Math.max(...analyses.map(a => a.id), 0) + 1;
    setAnalyses([...analyses, { id: newId, deskripsi: data.deskripsi }]);
    console.log("Saving analysis:", data);
  };

  const handleDeleteAnalysis = (analysis) => {
    setSelectedItem(analysis);
    setIsAnalysisDeleteModalOpen(true);
  };

  const handleConfirmDeleteAnalysis = (analysis) => {
    setAnalyses(analyses.filter(a => a.id !== analysis.id));
    console.log("Deleting analysis:", analysis);
  };

  // Correction handlers
  const handleAddCorrection = () => {
    setIsCorrectionModalOpen(true);
  };

  const handleSaveCorrection = (data) => {
    const newId = Math.max(...corrections.map(c => c.id), 0) + 1;
    setCorrections([...corrections, { id: newId, deskripsi: data.deskripsi }]);
    console.log("Saving correction:", data);
  };

  const handleDeleteCorrection = (correction) => {
    setSelectedItem(correction);
    setIsCorrectionDeleteModalOpen(true);
  };

  const handleConfirmDeleteCorrection = (correction) => {
    setCorrections(corrections.filter(c => c.id !== correction.id));
    console.log("Deleting correction:", correction);
  };

  // Corrective Action handlers
  const handleAddCorrectiveAction = () => {
    setIsCorrectiveActionModalOpen(true);
  };

  const handleSaveCorrectiveAction = (data) => {
    const newId = Math.max(...correctiveActions.map(a => a.id), 0) + 1;
    setCorrectiveActions([...correctiveActions, { id: newId, deskripsi: data.deskripsi }]);
    console.log("Saving corrective action:", data);
  };

  const handleDeleteCorrectiveAction = (action) => {
    setSelectedItem(action);
    setIsCorrectiveActionDeleteModalOpen(true);
  };

  const handleConfirmDeleteCorrectiveAction = (action) => {
    setCorrectiveActions(correctiveActions.filter(a => a.id !== action.id));
    console.log("Deleting corrective action:", action);
  };

  const handleSubmitVerification = () => {
    setIsVerificationModalOpen(true);
  };

  const handleSaveVerification = (data) => {
    setVerificationData(data);
    console.log("Saving verification:", data);
    // TODO: Implement API call to save verification
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
          onClick={() => navigate(`/admin/ncr/${id}/kasus`)}
          className="text-gray-dark hover:text-navy"
        >
          Daftar Kasus
        </button>
        <span className="text-gray-dark">&gt;</span>
        <button
          onClick={handleBack}
          className="text-gray-dark hover:text-navy"
        >
          Daftar Temuan
        </button>
        <span className="text-gray-dark">&gt;</span>
        <span className="text-navy font-medium">Tanggapan Temuan</span>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-dark mb-1">Judul Dokumen</p>
            <h2 className="text-lg font-semibold text-navy">
              {caseDetail.ncrTitle}
            </h2>
          </div>
          <div>
            <p className="text-sm text-gray-dark mb-1">Nomor NCR</p>
            <h2 className="text-lg font-semibold text-navy">
              {caseDetail.caseNumber}
            </h2>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <h2 className="text-xl font-bold text-navy">Tanggapan Temuan</h2>

      {/* Uraian Ketidaksesuaian Section */}
      <ListCard
        title="Uraian Ketidaksesuaian :"
        bgColor="bg-yellow-50"
        borderColor="border-yellow-200"
        badge={
          <div className="bg-white border border-gray-300 rounded px-3 py-1 inline-block">
            <p className="text-sm text-gray-700">{findings[0]?.kategori}</p>
          </div>
        }
        items={findings}
        showDelete={false}
        actions={[]}
      />

      {/* Tanggal Target Perbaikan Section */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-navy">
            Tanggal Target Perbaikan
          </h3>
          <Button
            onClick={handleEditTargetDate}
            className="h-9 px-3 bg-green-600 text-white hover:bg-green-700 gap-1.5 text-sm"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Tanggal Target Perbaikan
          </Button>
        </div>
        <p className="text-base text-navy font-medium">{targetDate}</p>
      </div>

      {/* Analisis Penyebab Ketidaksesuaian Section */}
      <ListCard
        title="Analisis Penyebab Ketidaksesuaian :"
        bgColor="bg-blue-50"
        borderColor="border-blue-200"
        items={analyses}
        onDelete={handleDeleteAnalysis}
        showDelete={true}
        actions={[
          {
            icon: Plus,
            label: "Tambah Analisis",
            onClick: handleAddAnalysis,
            className: "bg-blue-600 text-white hover:bg-blue-700"
          }
        ]}
      />

      {/* Koreksi Section */}
      <ListCard
        title="Koreksi:"
        bgColor="bg-blue-50"
        borderColor="border-blue-200"
        items={corrections}
        onDelete={handleDeleteCorrection}
        showDelete={true}
        actions={[
          {
            icon: Plus,
            label: "Tambah Koreksi",
            onClick: handleAddCorrection,
            className: "bg-blue-600 text-white hover:bg-blue-700"
          }
        ]}
      />

      {/* Tindakan Koreksi Section */}
      <ListCard
        title="Tindakan Koreksi:"
        bgColor="bg-blue-50"
        borderColor="border-blue-200"
        items={correctiveActions}
        onDelete={handleDeleteCorrectiveAction}
        showDelete={true}
        actions={[
          {
            icon: Plus,
            label: "Tambah Tindakan Koreksi",
            onClick: handleAddCorrectiveAction,
            className: "bg-blue-600 text-white hover:bg-blue-700"
          }
        ]}
      />

      {/* Verification Card - Only show if verification data exists */}
      {verificationData && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-base font-semibold text-navy">
              Verifikasi Tindakan Perbaikan
            </h3>
            <Button
              onClick={() => setIsVerificationModalOpen(true)}
              className="h-9 px-3 bg-navy text-white hover:bg-navy/90 gap-1.5 text-sm"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Verifikasi Tindakan
            </Button>
          </div>

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
      )}

      {/* Action Button - Only show if no verification data */}
      {!verificationData && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitVerification}
            className="h-12 px-8 bg-navy text-white hover:bg-navy/90"
          >
            Berikan Verifikasi Tindakan Perbaikan
          </Button>
        </div>
      )}

      {/* Modals */}
      <DateEditModal
        isOpen={isDateEditModalOpen}
        onClose={() => setIsDateEditModalOpen(false)}
        onSave={handleSaveDate}
        currentDate={targetDate}
      />

      <ResponseItemModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onSave={handleSaveAnalysis}
        title="Tambah Analisis Penyebab Ketidaksesuaian"
        description="Tambah Analisis sesuai kebutuhan."
        label="Analisis Penyebab Ketidaksesuaian"
        placeholder="Masukkan Analisis Penyebab Ketidaksesuaian"
        buttonText="Tambah Analisis"
      />

      <ResponseDeleteModal
        isOpen={isAnalysisDeleteModalOpen}
        onClose={() => setIsAnalysisDeleteModalOpen(false)}
        itemData={selectedItem}
        onConfirm={handleConfirmDeleteAnalysis}
        title="Hapus Analisis Ketidaksesuaian"
        description="Apakah Anda yakin ingin menghapus Analisis ini? Tindakan ini tidak dapat dibatalkan."
        itemType="Analisis"
      />

      <ResponseItemModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        onSave={handleSaveCorrection}
        title="Tambah Koreksi"
        description="Tambah Koreksi sesuai kebutuhan."
        label="Koreksi"
        placeholder="Masukkan Koreksi"
        buttonText="Tambah Koreksi"
      />

      <ResponseDeleteModal
        isOpen={isCorrectionDeleteModalOpen}
        onClose={() => setIsCorrectionDeleteModalOpen(false)}
        itemData={selectedItem}
        onConfirm={handleConfirmDeleteCorrection}
        title="Hapus Koreksi"
        description="Apakah Anda yakin ingin menghapus Koreksi ini? Tindakan ini tidak dapat dibatalkan."
        itemType="Koreksi"
      />

      <ResponseItemModal
        isOpen={isCorrectiveActionModalOpen}
        onClose={() => setIsCorrectiveActionModalOpen(false)}
        onSave={handleSaveCorrectiveAction}
        title="Tambah Tindakan Koreksi"
        description="Tambah Tindakan Koreksi sesuai kebutuhan."
        label="Tindakan Koreksi"
        placeholder="Masukkan Tindakan Koreksi"
        buttonText="Tambah Tindakan Koreksi"
      />

      <ResponseDeleteModal
        isOpen={isCorrectiveActionDeleteModalOpen}
        onClose={() => setIsCorrectiveActionDeleteModalOpen(false)}
        itemData={selectedItem}
        onConfirm={handleConfirmDeleteCorrectiveAction}
        title="Hapus Tindakan Koreksi"
        description="Apakah Anda yakin ingin menghapus Tindakan Koreksi ini? Tindakan ini tidak dapat dibatalkan."
        itemType="Tindakan Koreksi"
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSave={handleSaveVerification}
        verificationData={verificationData}
      />
    </div>
  );
}
