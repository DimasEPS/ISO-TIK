import autoTable from "jspdf-autotable"
import { jsPDF } from "../utils/jspdf-instance"
import {
  addFooter,
  addHeader,
  addInfoBox,
  addSection,
  addText,
  checkNewPage,
} from "../utils/pdfHelpers"
import { PDF_CONFIG } from "../utils/pdfConfig"

const buildRows = (sections, controlCodes) => {
  if (!sections?.length) return []

  const rows = []
  sections.forEach((section) => {
    if (!section?.questions?.length) return
    section.questions.forEach((question) => {
      const summaryText = question?.summary?.length
        ? question.summary.map((item, idx) => `${idx + 1}. ${item}`).join("\n")
        : "-"
      const docsText = question?.documents?.length
        ? question.documents.map((doc) => `${doc.id || ""}${doc.title ? ` - ${doc.title}` : ""}`).join("\n")
        : "-"

      rows.push([
        `${section.code} ${section.title || section.label || ""}`.trim(),
        question.id || "-",
        [question.title, question.description].filter(Boolean).join("\n"),
        question.yts || "-",
        ...controlCodes.map((code) => question?.controls?.[code] ?? "-"),
        question.justification || "-",
        summaryText,
        docsText,
        question.statusLabel || "-",
        question.reviewerComment || "-",
      ])
    })
  })

  return rows
}

const buildColumnStyles = (doc, controlCodes) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right
  const baseRatios = {
    aspect: 0.12,
    code: 0.06,
    question: 0.2,
    yts: 0.04,
    justification: 0.12,
    summary: 0.13,
    documents: 0.08,
    status: 0.05,
    comment: 0.12,
  }

  const baseWidths = Object.fromEntries(
    Object.entries(baseRatios).map(([key, ratio]) => [key, contentWidth * ratio]),
  )

  const fixedWidthSum = Object.values(baseWidths).reduce((sum, val) => sum + val, 0)
  const remaining = Math.max(contentWidth - fixedWidthSum, 0)
  const controlWidth = controlCodes.length ? remaining / controlCodes.length : 0

  const columnStyles = {
    0: { cellWidth: baseWidths.aspect },
    1: { cellWidth: baseWidths.code },
    2: { cellWidth: baseWidths.question },
    3: { cellWidth: baseWidths.yts, halign: "center" },
  }

  controlCodes.forEach((code, index) => {
    columnStyles[4 + index] = { cellWidth: controlWidth || 12, halign: "center" }
  })

  const baseIndex = 4 + controlCodes.length
  columnStyles[baseIndex] = { cellWidth: baseWidths.justification }
  columnStyles[baseIndex + 1] = { cellWidth: baseWidths.summary }
  columnStyles[baseIndex + 2] = { cellWidth: baseWidths.documents }
  columnStyles[baseIndex + 3] = { cellWidth: baseWidths.status, halign: "center" }
  columnStyles[baseIndex + 4] = { cellWidth: baseWidths.comment }

  return columnStyles
}

const getDocumentMeta = (documentData = {}) => {
  return {
    noDoc: documentData.noDoc || "-",
    judul: documentData.judul || documentData.title || "Statement of Applicability",
    revisi: documentData.revisi || "-",
    status: documentData.status || "-",
    penyusun: documentData.penyusun || "-",
    ketuaIso: documentData.ketuaIso || "-",
    direktur: documentData.direktur || "-",
    tanggalTerbit: documentData.tanggalTerbit || "-",
  }
}

export const buildSoAReviewPDFDocument = async (documentData = {}, options = {}) => {
  const {
    controlCodes = [],
    sections = [],
    autoSave = false,
    filename = `review-soa-${documentData?.noDoc || "dokumen"}.pdf`,
  } = options

  const doc = new jsPDF({
    orientation: "landscape",
    unit: PDF_CONFIG.unit,
    format: "a3",
  })

  const meta = getDocumentMeta(documentData)
  let yPos = addHeader(doc, "Review Pengisian Jawaban SoA", meta.judul)

  yPos = addSection(doc, "Informasi Dokumen", yPos + 2)
  yPos = addInfoBox(
    doc,
    [
      { label: "No Dokumen", value: meta.noDoc },
      { label: "Judul", value: meta.judul },
      { label: "Revisi", value: meta.revisi },
      { label: "Status", value: meta.status },
      { label: "Penyusun", value: meta.penyusun },
      { label: "Ketua ISO", value: meta.ketuaIso },
      { label: "Direktur", value: meta.direktur },
      { label: "Tanggal Terbit", value: meta.tanggalTerbit },
    ],
    yPos,
    2,
  )

  yPos = checkNewPage(doc, yPos, 40)
  yPos = addSection(doc, "Ringkasan Kendali (Mode Tabel)", yPos)

  const rows = buildRows(sections, controlCodes)
  if (rows.length === 0) {
    rows.push(["-", "-", "Tidak ada data", "-", ...controlCodes.map(() => "-"), "-", "-", "-", "-", "-"])
  }

  const headStyles = {
    halign: "center",
    valign: "middle",
    fontSize: 7,
    fillColor: [14, 57, 160],
    textColor: [255, 255, 255],
  }

  const headRows = [
    [
      { content: "Kendali Keamanan Informasi ISO/IEC 27001:2022", colSpan: 3, styles: headStyles },
      { content: "Kendali Saat Ini", colSpan: 1, styles: headStyles },
      { content: "Kendali yang Dipilih & Alasan Pemilihan", colSpan: controlCodes.length, styles: headStyles },
      { content: "Pembenaran (Justifikasi) terhadap Pengecualian", rowSpan: 2, styles: headStyles },
      { content: "Ringkasan Penerapan / Pelaksanaan", rowSpan: 2, styles: headStyles },
      { content: "Dokumen Terkait", rowSpan: 2, styles: headStyles },
      { content: "Status Review", rowSpan: 2, styles: headStyles },
      { content: "Komentar Reviewer", rowSpan: 2, styles: headStyles },
    ],
    [
      { content: "Aspek", styles: headStyles },
      { content: "Kode", styles: headStyles },
      { content: "Pertanyaan", styles: headStyles },
      { content: "Y/T/S", styles: headStyles },
      ...controlCodes.map((code) => ({ content: code, styles: headStyles })),
    ],
  ]

  autoTable(doc, {
    startY: yPos + 4,
    head: headRows,
    body: rows,
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right },
    columnStyles: buildColumnStyles(doc, controlCodes),
    styles: { fontSize: 7, cellPadding: 1.5, textColor: [20, 32, 67] },
    headStyles: { fontSize: 7, fillColor: [14, 57, 160], textColor: [255, 255, 255], halign: "center", valign: "middle" },
    alternateRowStyles: { fillColor: [247, 249, 255] },
    bodyStyles: { valign: "top" },
  })

  yPos = doc.lastAutoTable?.finalY ?? yPos

  yPos = checkNewPage(doc, yPos, 20)
  yPos = addSection(doc, "Catatan", yPos)
  yPos = addText(
    doc,
    "Dokumen ini dibuat otomatis dari tampilan Review Jawaban SoA (mode tabel). Setiap kolom menampilkan ringkasan kendali, dokumen terkait, dan status review.",
    yPos,
    { fontSize: 8 },
  )

  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i)
    addFooter(doc, i, totalPages)
  }

  if (autoSave) {
    doc.save(filename)
  }

  return doc
}

export const downloadSoAReviewPDF = async (documentData, options = {}) => {
  const doc = await buildSoAReviewPDFDocument(documentData, { ...options, autoSave: false })
  const filename = options.filename || `review-soa-${documentData?.noDoc || "dokumen"}.pdf`
  doc.save(filename)
  return doc
}

export const getSoAReviewPDFPreview = async (documentData, options = {}) => {
  const doc = await buildSoAReviewPDFDocument(documentData, { ...options, autoSave: false })
  const blob = doc.output("blob")
  const url = URL.createObjectURL(blob)
  const dispose = () => URL.revokeObjectURL(url)
  return { url, dispose, doc }
}
