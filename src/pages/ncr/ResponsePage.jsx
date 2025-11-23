import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { ListCard } from "./components/common";
import { ResponseItemModal, ResponseDeleteModal, DateEditModal, VerificationModal } from "./components/response";
import { 
  useNCRPoints, 
  useNCRCase,
  useCreateNCRPoint,
  useUpdateNCRPoint,
  useDeleteNCRPoint,
  useUpdateNCRCase
} from "./hooks/useNCRQueries";

const POINT_TYPE_MAP = {
  finding: "uraian",
  analysis: "analisa",
  correction: "koreksi",
  corrective_action: "tindakan",
  uraian: "uraian",
  analisa: "analisa",
  koreksi: "koreksi",
  tindakan: "tindakan",
};

const normalizePointType = (value) => {
  if (!value) return undefined;
  const normalized = String(value).toLowerCase();
  return POINT_TYPE_MAP[normalized] ?? normalized;
};

const extractPointItems = (payload, expectedType) => {
  if (!payload) return [];
  const normalizedTarget = normalizePointType(expectedType);
  const containers = Array.isArray(payload.points)
    ? payload.points
    : Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  if (!containers.length) return [];

  const isGrouped = containers.some((group) => Array.isArray(group?.items));

  if (!isGrouped) {
    return containers;
  }

  const matched = normalizedTarget
    ? containers.find(
        (group) => normalizePointType(group.point_type) === normalizedTarget
      )
    : containers[0];

  return matched?.items ?? [];
};

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

  // Fetch case details
  const { data: caseData, isLoading: isCaseLoading } = useNCRCase(caseId);

  const caseInfo = useMemo(() => {
    if (!caseData) return {};
    return caseData.case ?? caseData.data ?? caseData;
  }, [caseData]);
  const documentTitle =
    caseInfo.document_title || caseInfo.ncr_document?.title || "NCR Dokumen";

  // Fetch findings
  const { data: findingsData } = useNCRPoints(caseId, { point_type: "finding" });
  
  // Fetch analyses
  const { data: analysesData, isLoading: isAnalysesLoading } = useNCRPoints(caseId, { point_type: "analysis" });
  
  // Fetch corrections
  const { data: correctionsData, isLoading: isCorrectionsLoading } = useNCRPoints(caseId, { point_type: "correction" });
  
  // Fetch corrective actions
  const { data: correctiveActionsData, isLoading: isActionsLoading } = useNCRPoints(caseId, { point_type: "corrective_action" });

  const createMutation = useCreateNCRPoint();
  const updateMutation = useUpdateNCRPoint();
  const deleteMutation = useDeleteNCRPoint();
  const updateCaseMutation = useUpdateNCRCase();

  const auditeeId =
    caseInfo.id_auditee ??
    caseInfo.auditee_id ??
    caseInfo.auditeeId ??
    caseInfo.auditee_uuid ??
    caseInfo.auditeeUuid ??
    caseInfo.auditee?.id ??
    caseInfo.auditee?.uuid ??
    "";
  const isAuditeeMissing = !auditeeId;

  const ensureAuditeeAvailable = () => {
    if (!isAuditeeMissing) return true;
    alert(
      "Data auditee kasus belum tersedia. Mohon muat ulang halaman atau perbarui data kasus terlebih dahulu."
    );
    return false;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID");
  };

  const caseDetail = useMemo(() => {
    return {
      ncrTitle: documentTitle,
      caseNumber:
        caseInfo?.case_number ||
        caseInfo?.ncr_number ||
        caseInfo?.ncrNumber ||
        caseInfo?.id ||
        "-",
      targetDate: formatDate(caseInfo?.target_date || caseInfo?.targetDate),
    };
  }, [caseInfo, documentTitle]);

  const derivedVerificationData = useMemo(() => {
    const verificationNote = caseInfo?.verification_note || caseInfo?.verificationNote;
    const verificationDate = caseInfo?.verification_date || caseInfo?.verificationDate;
    const verifiedByValue = caseInfo?.verified_by || caseInfo?.verifiedBy;
    const verifierName =
      typeof verifiedByValue === "string"
        ? verifiedByValue
        : verifiedByValue?.name || "";

    if (!verificationNote && !verificationDate && !verifierName) {
      return null;
    }

    return {
      namaPemverifikasi: verifierName || "-",
      tanggalPemverifikasi: formatDate(caseInfo?.verified_at || verificationDate),
      tanggalVerifikasi: formatDate(verificationDate),
      catatanVerifikasi: verificationNote || "-",
    };
  }, [caseInfo]);

  const findings = useMemo(() => {
    const items = extractPointItems(findingsData, "finding");
    return items.map(f => ({
      id: f.id,
      kategori: f.category || "Kategori Temuan",
      deskripsi: f.description || f.deskripsi || "",
      description: f.description || f.deskripsi || "",
    }));
  }, [findingsData]);

  const analyses = useMemo(() => {
    const items = extractPointItems(analysesData, "analysis");
    return items.map(a => ({
      id: a.id,
      deskripsi: a.description || a.deskripsi || "",
      description: a.description || a.deskripsi || "",
    }));
  }, [analysesData]);

  const corrections = useMemo(() => {
    const items = extractPointItems(correctionsData, "correction");
    return items.map(c => ({
      id: c.id,
      deskripsi: c.description || c.deskripsi || "",
      description: c.description || c.deskripsi || "",
    }));
  }, [correctionsData]);

  const correctiveActions = useMemo(() => {
    const items = extractPointItems(correctiveActionsData, "corrective_action");
    return items.map(ca => ({
      id: ca.id,
      deskripsi: ca.description || ca.deskripsi || "",
      description: ca.description || ca.deskripsi || "",
    }));
  }, [correctiveActionsData]);

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

  useEffect(() => {
    setVerificationData(derivedVerificationData || null);
  }, [derivedVerificationData]);

  const handleBack = () => {
    navigate(`/admin/ncr/${id}/kasus/${caseId}/temuan`);
  };

  // Date handlers
  const handleEditTargetDate = () => {
    setIsDateEditModalOpen(true);
  };

  const handleSaveDate = async (newDate) => {
    try {
      await updateCaseMutation.mutateAsync({
        caseId: caseId,
        payload: {
          target_date: newDate,
        },
      });
      setIsDateEditModalOpen(false);
    } catch (error) {
      console.error("Gagal mengupdate tanggal target:", error);
    }
  };

  // Analysis handlers
  const handleAddAnalysis = () => {
    if (!ensureAuditeeAvailable()) return;
    setIsAnalysisModalOpen(true);
  };

  const handleSaveAnalysis = async (data) => {
    if (!ensureAuditeeAvailable()) return;

    try {
      await createMutation.mutateAsync({
        caseId: caseId,
        ncr_case_id: caseId,
        point_type: "analysis",
        description: data.description || data.deskripsi,
        auditeeId,
      });
      setIsAnalysisModalOpen(false);
    } catch (error) {
      console.error("Gagal menambah analisis:", error);
    }
  };

  const handleDeleteAnalysis = (analysis) => {
    setSelectedItem(analysis);
    setIsAnalysisDeleteModalOpen(true);
  };

  const handleConfirmDeleteAnalysis = async (analysis) => {
    try {
      await deleteMutation.mutateAsync({
        pointId: analysis.id,
        caseId: caseId,
      });
      setIsAnalysisDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Gagal menghapus analisis:", error);
    }
  };

  // Correction handlers
  const handleAddCorrection = () => {
    if (!ensureAuditeeAvailable()) return;
    setIsCorrectionModalOpen(true);
  };

  const handleSaveCorrection = async (data) => {
    if (!ensureAuditeeAvailable()) return;

    try {
      await createMutation.mutateAsync({
        caseId: caseId,
        ncr_case_id: caseId,
        point_type: "correction",
        description: data.description || data.deskripsi,
        auditeeId,
      });
      setIsCorrectionModalOpen(false);
    } catch (error) {
      console.error("Gagal menambah koreksi:", error);
    }
  };

  const handleDeleteCorrection = (correction) => {
    setSelectedItem(correction);
    setIsCorrectionDeleteModalOpen(true);
  };

  const handleConfirmDeleteCorrection = async (correction) => {
    try {
      await deleteMutation.mutateAsync({
        pointId: correction.id,
        caseId: caseId,
      });
      setIsCorrectionDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Gagal menghapus koreksi:", error);
    }
  };

  // Corrective Action handlers
  const handleAddCorrectiveAction = () => {
    if (!ensureAuditeeAvailable()) return;
    setIsCorrectiveActionModalOpen(true);
  };

  const handleSaveCorrectiveAction = async (data) => {
    if (!ensureAuditeeAvailable()) return;

    try {
      await createMutation.mutateAsync({
        caseId: caseId,
        ncr_case_id: caseId,
        point_type: "corrective_action",
        description: data.description || data.deskripsi,
        auditeeId,
      });
      setIsCorrectiveActionModalOpen(false);
    } catch (error) {
      console.error("Gagal menambah tindakan koreksi:", error);
    }
  };

  const handleDeleteCorrectiveAction = (action) => {
    setSelectedItem(action);
    setIsCorrectiveActionDeleteModalOpen(true);
  };

  const handleConfirmDeleteCorrectiveAction = async (action) => {
    try {
      await deleteMutation.mutateAsync({
        pointId: action.id,
        caseId: caseId,
      });
      setIsCorrectiveActionDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Gagal menghapus tindakan koreksi:", error);
    }
  };

  const handleSubmitVerification = () => {
    setIsVerificationModalOpen(true);
  };

  const handleSaveVerification = async (data) => {
    try {
      await updateCaseMutation.mutateAsync({
        caseId: caseId,
        payload: {
          verification_note: data.catatanVerifikasi,
          verification_date: data.tanggalVerifikasi,
          verified_by: data.verifiedBy,
        },
      });
      setVerificationData(data);
      setIsVerificationModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan verifikasi:", error);
    }
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
      {isCaseLoading ? (
        <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-navy" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      ) : (
        <ListCard
          title="Uraian Ketidaksesuaian :"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
          badge={
            <div className="bg-white border border-gray-300 rounded px-3 py-1 inline-block">
              <p className="text-sm text-gray-700">{findings[0]?.kategori || "Kategori Temuan"}</p>
            </div>
          }
          items={findings}
          showDelete={false}
          actions={[]}
        />
      )}

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
        <p className="text-base text-navy font-medium">{caseDetail.targetDate}</p>
      </div>

      {/* Analisis Penyebab Ketidaksesuaian Section */}
      {isAnalysesLoading ? (
        <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-navy" />
          <p className="text-gray-600">Memuat analisis...</p>
        </div>
      ) : (
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
              className: "bg-blue-600 text-white hover:bg-blue-700",
              disabled: isCaseLoading || isAuditeeMissing,
            }
          ]}
        />
      )}

      {/* Koreksi Section */}
      {isCorrectionsLoading ? (
        <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-navy" />
          <p className="text-gray-600">Memuat koreksi...</p>
        </div>
      ) : (
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
              className: "bg-blue-600 text-white hover:bg-blue-700",
              disabled: isCaseLoading || isAuditeeMissing,
            }
          ]}
        />
      )}

      {/* Tindakan Koreksi Section */}
      {isActionsLoading ? (
        <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-navy" />
          <p className="text-gray-600">Memuat tindakan koreksi...</p>
        </div>
      ) : (
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
              className: "bg-blue-600 text-white hover:bg-blue-700",
              disabled: isCaseLoading || isAuditeeMissing,
            }
          ]}
        />
      )}

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
        currentDate={caseDetail.targetDate}
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
