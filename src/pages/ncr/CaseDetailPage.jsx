import { useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download } from "lucide-react";
import { useNCRCase, useNCRPoints } from "./hooks/useNCRQueries";
import { STATUS_BADGE_STYLES, CASE_STATUS_LABELS } from "./constants";
import { PDFPreviewDialog } from "@/generatePDF/components";
import { downloadNCRDocumentPDF, getNCRDocumentPDFPreview } from "@/generatePDF/generators/ncrPDF";

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
    ? containers.find((group) => normalizePointType(group.point_type) === normalizedTarget)
    : containers[0];

  return matched?.items ?? [];
};

const formatDateValue = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("id-ID");
};

const listToStrings = (items) =>
  (items || [])
    .map((item) => item?.deskripsi || item?.description || item?.kategori || item?.text || "")
    .map((text) => (typeof text === "string" ? text.trim() : ""))
    .filter(Boolean);

const buildVerificationNotes = (caseInfo) => {
  if (!caseInfo) return [];
  const notes = [];
  if (caseInfo.verification_note) notes.push(caseInfo.verification_note);
  if (caseInfo.verification_date) {
    notes.push(`Tanggal: ${formatDateValue(caseInfo.verification_date)}`);
  }
  const verifierName = caseInfo.verifier_name || caseInfo.verified_by?.name;
  if (verifierName) {
    notes.push(`Diverifikasi oleh: ${verifierName}`);
  }
  return notes;
};

const buildCasePdfPayload = (caseInfo, lists) => {
  if (!caseInfo) return null;
  const findingsText = listToStrings(lists.findings);

  return {
    ncrNumber: caseInfo.case_number || caseInfo.ncr_number || caseInfo.id,
    id: caseInfo.id,
    date: caseInfo.ncr_date || caseInfo.created_at,
    bagianLokasi: caseInfo.department_location || caseInfo.location || caseInfo.bagianTerkait,
    standarReferensi: caseInfo.references_standard || caseInfo.standard_reference,
    klausul: caseInfo.clause,
    uraianKetidaksesuaian: findingsText.length ? findingsText : caseInfo.description,
    kategoriTemuan: caseInfo.finding_category || caseInfo.kategoriTemuan,
    auditor: caseInfo.auditor_name || caseInfo.auditor?.name,
    auditee: caseInfo.auditee_name || caseInfo.auditee?.name,
    targetPerbaikan: caseInfo.target_date,
    analisaPenyebab: listToStrings(lists.analyses),
    koreksi: listToStrings(lists.corrections),
    tindakanKoreksi: listToStrings(lists.correctiveActions),
    verifikasiTindakan: buildVerificationNotes(caseInfo),
    auditorVerifier: caseInfo.verifier_name || caseInfo.auditor_name || caseInfo.auditor?.name,
    tglPenyelesaian: caseInfo.completion_date || caseInfo.verification_date,
  };
};

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch case details from API
  const { data: caseData, isLoading: isCaseLoading, error: caseError } = useNCRCase(caseId);

  // Fetch findings (point_type: finding)
  const { data: findingsData } = useNCRPoints(caseId, { point_type: "finding" });
  
  // Fetch analyses (point_type: analysis)
  const { data: analysesData } = useNCRPoints(caseId, { point_type: "analysis" });
  
  // Fetch corrections (point_type: correction)
  const { data: correctionsData } = useNCRPoints(caseId, { point_type: "correction" });
  
  // Fetch corrective actions (point_type: corrective_action)
  const { data: correctiveActionsData } = useNCRPoints(caseId, { point_type: "corrective_action" });

  const caseInfo = useMemo(() => {
    if (!caseData) return null;
    return caseData.case ?? caseData.data ?? caseData;
  }, [caseData]);

  const caseDetail = useMemo(() => {
    if (!caseInfo) return null;
    const verifierRaw = caseInfo.verified_by || caseInfo.verifiedBy;
    const verifierName =
      typeof verifierRaw === "string" ? verifierRaw : verifierRaw?.name || "-";

    return {
      id: caseInfo.case_number || caseInfo.id,
      bagianTerkait: caseInfo.department_location || caseInfo.location || "-",
      tanggal: formatDateValue(caseInfo.created_at || caseInfo.ncr_date),
      standarReferensi: caseInfo.standard_reference || caseInfo.references_standard || "-",
      klasifikasi: caseInfo.clause || "-",
      namaAuditor: caseInfo.auditor_name || caseInfo.auditor?.name || "-",
      namaAuditee: caseInfo.auditee_name || caseInfo.auditee?.name || "-",
      status: caseInfo.status || "-",
      targetPerbaikan: formatDateValue(caseInfo.target_date),
      verificationNote: caseInfo.verification_note || "-",
      verificationDate: formatDateValue(caseInfo.verification_date),
      verifiedBy: verifierName,
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

  const verificationData = useMemo(() => {
    if (!caseDetail) {
      return {
        namaPemverifikasi: "-",
        tanggalPemverifikasi: "-",
        tanggalVerifikasi: "-",
        catatanVerifikasi: "-",
      };
    }
    return {
      namaPemverifikasi: caseDetail.verifiedBy || "Belum ditentukan",
      tanggalPemverifikasi: caseDetail.verificationDate || "-",
      tanggalVerifikasi: caseDetail.verificationDate || "-",
      catatanVerifikasi: caseDetail.verificationNote || "Belum ada catatan",
    };
  }, [caseDetail]);

  const handleBack = () => {
    navigate(`/admin/ncr/${id}/kasus`);
  };

  const handleDaftarTemuan = () => {
    navigate(`/admin/ncr/${id}/kasus/${caseId}/temuan`);
  };

  const pdfPayload = useMemo(() => {
    if (!caseInfo) return null;
    return buildCasePdfPayload(caseInfo, {
      findings,
      analyses,
      corrections,
      correctiveActions,
    });
  }, [caseInfo, findings, analyses, corrections, correctiveActions]);

  const handlePreviewPDF = () => {
    if (!pdfPayload) return;
    setIsPreviewOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!pdfPayload) return;
    setIsDownloading(true);
    try {
      await downloadNCRDocumentPDF(pdfPayload, {
        filename: `laporan-ncr-${pdfPayload.ncrNumber || caseId}.pdf`,
      });
    } catch (error) {
      console.error("Gagal mengunduh PDF NCR:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const previewBuilder = useCallback(() => {
    if (!pdfPayload) return null;
    return getNCRDocumentPDFPreview(pdfPayload);
  }, [pdfPayload]);

  const getStatusBadgeClass = (status) => {
    const statusKey = status?.toLowerCase();
    return STATUS_BADGE_STYLES[statusKey] || STATUS_BADGE_STYLES.default;
  };

  if (isCaseLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-navy" />
        <p className="text-gray-600">Memuat detail kasus...</p>
      </div>
    );
  }

  if (caseError || !caseDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-600">Gagal memuat detail kasus</p>
        <Button onClick={handleBack} variant="outline">
          Kembali ke Daftar Kasus
        </Button>
      </div>
    );
  }

  return (
    <>
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
            <p className="text-sm text-gray-600">Status</p>
            <div>
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusBadgeClass(caseDetail.status)}`}>
                {CASE_STATUS_LABELS[caseDetail.status] || caseDetail.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            onClick={handleDaftarTemuan}
            className="h-10 px-6 bg-gray-900 text-white hover:bg-gray-800"
          >
            Daftar Temuan
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviewPDF}
            disabled={!pdfPayload}
            className="h-10 px-4 text-navy border-navy hover:bg-blue-100"
          >
            <FileText className="mr-2 h-4 w-4" />
            Pratinjau PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={!pdfPayload || isDownloading}
            className="h-10 px-4 text-navy border-navy hover:bg-blue-100"
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Unduh PDF
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
          <p className="text-sm text-gray-700">{findings[0]?.kategori || "Belum ada kategori temuan"}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 p-3">
          {findings.length ? (
            <div className="space-y-2">
              {findings.map((finding, index) => (
                <div key={finding.id || index} className="flex items-center gap-2">
                  <span className="text-sm text-navy font-medium">{index + 1}.</span>
                  <p className="text-sm text-navy flex-1">{finding.deskripsi}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Belum ada uraian ketidaksesuaian.</p>
          )}
        </div>
      </div>

      {/* Tanggal Target Perbaikan Section */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-navy mb-2">
          Tanggal Target Perbaikan
        </h3>
        <div className="bg-green-100 border border-green-600 rounded px-3 py-2 inline-block">
          <p className="text-base text-navy font-medium">{caseDetail.targetPerbaikan}</p>
        </div>
      </div>

      {/* Analisis Penyebab Ketidaksesuaian Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-navy mb-3">
          Analisis Penyebab Ketidaksesuaian :
        </h3>

        <div className="bg-white rounded-lg border border-gray-300 p-3">
          {analyses.length ? (
            <div className="space-y-2">
              {analyses.map((analysis, index) => (
                <div key={analysis.id || index} className="flex items-center gap-2">
                  <span className="text-sm text-navy font-medium">{index + 1}.</span>
                  <p className="text-sm text-navy flex-1">{analysis.deskripsi}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Belum ada analisis penyebab.</p>
          )}
        </div>
      </div>

      {/* Koreksi Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-navy mb-3">Koreksi:</h3>

        <div className="bg-white rounded-lg border border-gray-300 p-3">
          {corrections.length ? (
            <div className="space-y-2">
              {corrections.map((correction, index) => (
                <div key={correction.id || index} className="flex items-center gap-2">
                  <span className="text-sm text-navy font-medium">{index + 1}.</span>
                  <p className="text-sm text-navy flex-1">{correction.deskripsi}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Belum ada data koreksi.</p>
          )}
        </div>
      </div>

      {/* Tindakan Koreksi Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-navy mb-3">Tindakan Koreksi:</h3>

        <div className="bg-white rounded-lg border border-gray-300 p-3">
          {correctiveActions.length ? (
            <div className="space-y-2">
              {correctiveActions.map((action, index) => (
                <div key={action.id || index} className="flex items-center gap-2">
                  <span className="text-sm text-navy font-medium">{index + 1}.</span>
                  <p className="text-sm text-navy flex-1">{action.deskripsi}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Belum ada tindakan koreksi.</p>
          )}
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
      <PDFPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={`Pratinjau Laporan NCR ${caseDetail.id || ""}`.trim()}
        previewBuilder={pdfPayload ? previewBuilder : null}
        onDownload={
          pdfPayload
            ? () =>
                downloadNCRDocumentPDF(pdfPayload, {
                  filename: `laporan-ncr-${pdfPayload.ncrNumber || caseId}.pdf`,
                })
            : null
        }
      />
    </>
  );
}
