import { jsPDF } from "../utils/jspdf-instance";
import {
  addHeader,
  addFooter,
  addSection,
  addInfoBox,
  addText,
} from "../utils/pdfHelpers";
import { PDF_CONFIG } from "../utils/pdfConfig";

/**
 * Build PDF document untuk Audit Document
 * @param {Object} documentData - Data dokumen audit dari backend
 * @param {Object} options - Opsi untuk PDF generation
 * @returns {jsPDF} PDF document instance
 */
export const buildAuditDocumentPDF = async (documentData, options = {}) => {
  const {
    filename = `dokumen-audit-${documentData?.id || "dokumen"}.pdf`,
    autoSave = false,
  } = options;

  const doc = new jsPDF({
    orientation: PDF_CONFIG.orientation,
    unit: PDF_CONFIG.unit,
    format: PDF_CONFIG.format,
  });

  // Add header
  let yPos = addHeader(
    doc,
    "Dokumen Audit",
    "Sistem Informasi Manajemen ISO-TIK"
  );

  yPos += 5;

  // Document information
  yPos = addSection(doc, "Informasi Dokumen Audit", yPos);

  const getStatusLabel = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "in_progress") return "In Progress";
    if (statusLower === "draft") return "Draft";
    if (statusLower === "reviewed") return "Reviewed";
    if (statusLower === "approved") return "Approved";
    return status || "Draft";
  };

  const documentInfo = [
    {
      label: "Judul Dokumen",
      value: documentData?.judul || documentData?.title || "-",
    },
    {
      label: "Lokasi",
      value: documentData?.lokasi || documentData?.location || "-",
    },
    {
      label: "Tanggal Audit",
      value:
        documentData?.tanggalAudit ||
        (documentData?.audit_period
          ? new Date(documentData.audit_period).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-"),
    },
    {
      label: "Lead Auditor",
      value: documentData?.leadAuditor || documentData?.lead_auditor || "-",
    },
    {
      label: "Auditor",
      value: documentData?.auditor || documentData?.auditor_name || "-",
    },
    {
      label: "Revisi",
      value: documentData?.revisi || documentData?.revision || "-",
    },
    { label: "Status", value: getStatusLabel(documentData?.status) },
  ];

  yPos = addInfoBox(doc, documentInfo, yPos, 2);

  // Add creation/update timestamps
  if (documentData?.created_at || documentData?.updated_at) {
    yPos += 10;
    yPos = addSection(doc, "Riwayat", yPos);

    const timestamps = [];
    if (documentData.created_at) {
      timestamps.push({
        label: "Dibuat pada",
        value: new Date(documentData.created_at).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
    if (documentData.updated_at) {
      timestamps.push({
        label: "Diperbarui pada",
        value: new Date(documentData.updated_at).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    yPos = addInfoBox(doc, timestamps, yPos, 1);
  }

  // Add notes section if needed
  yPos += 15;
  yPos = addSection(doc, "Catatan", yPos);
  addText(
    doc,
    "Dokumen ini merupakan bagian dari Sistem Manajemen Keamanan Informasi (SMKI) sesuai dengan standar ISO/IEC 27001:2022.",
    yPos
  );

  // Add footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  if (autoSave) {
    doc.save(filename);
  }

  return doc;
};

/**
 * Download PDF untuk Audit Document
 * @param {Object} documentData - Data dokumen audit
 * @param {Object} options - Opsi untuk PDF generation
 */
export const downloadAuditDocumentPDF = async (documentData, options = {}) => {
  const doc = await buildAuditDocumentPDF(documentData, {
    ...options,
    autoSave: false,
  });
  const filename =
    options.filename ||
    `dokumen-audit-${documentData?.id || documentData?.judul || "dokumen"}.pdf`;
  doc.save(filename);
  return doc;
};

/**
 * Get PDF preview URL untuk Audit Document
 * @param {Object} documentData - Data dokumen audit
 * @param {Object} options - Opsi untuk PDF generation
 * @returns {Object} Object with url, dispose function, and doc instance
 */
export const getAuditDocumentPDFPreview = async (
  documentData,
  options = {}
) => {
  const doc = await buildAuditDocumentPDF(documentData, {
    ...options,
    autoSave: false,
  });
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const dispose = () => URL.revokeObjectURL(url);
  return { url, dispose, doc };
};
