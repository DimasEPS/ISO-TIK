import { useCallback, useMemo, useState } from "react"
import { Download, FilePen, FileText, Trash2, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PaginateControls, SearchBar, StatusDropdown, Table as AdminTable } from "@/components/admin/table"
import { AlertIconDialog } from "@/components/admin/soa/AlertIconDialog"
import { useSoADocuments } from "./hooks/useSoADocuments"
import { PDFPreviewDialog } from "@/generatePDF/components"
import { downloadSoAReviewPDF, getSoAReviewPDFPreview } from "@/generatePDF/generators"
import { OverlayForm } from "@/components/admin/soa/OverlayForm"
import { usePageTemplate } from "@/hooks/usePageTemplate"
import { DocumentDeleteDialog } from "@/pages/documents/components/DocumentDeleteDialog"
import { getSoAReviewExportData } from "@/services/soaReviewExportService"

const FILTER_OPTIONS = [
  { value: "Semua Status" },
  { value: "Draft" },
  { value: "In Progress" },
  { value: "Reviewed" },
  { value: "Approved" },
]

const PAGINATE_OPTIONS = [10, 20, 50, 100]

const STATUS_STYLES = {
  Draft: "bg-gray-light text-navy-hover border border-[#D7DBE4] shadow-sm small",
  "In Progress":
    "bg-yellow-light text-yellow border border-[#F4E0A3] shadow-sm small",
  Reviewed: "bg-blue-light text-blue border border-[#C5D4FF] shadow-sm small",
  Approved: "bg-green-light text-green border border-[#BDECCB] shadow-sm small",
}

const buildSoAColumns = ({ onPreview, onDownload, downloadingId, onDelete, onEdit, isUpdating }) => [
  {
    key: "noDoc",
    header: "No Dokumen",
    headerClassName: "text-left text-navy min-w-[120px] whitespace-nowrap",
    cellClassName: "text-navy text-left whitespace-nowrap",
    accessor: "noDoc",
  },
  {
    key: "judul",
    header: "Judul",
    headerClassName: "text-left min-w-[220px] whitespace-nowrap",
    cellClassName: "text-left max-w-[240px] truncate",
    render: (row) => <span title={row.judul}>{row.judul}</span>,
  },
  {
    key: "tanggalTerbit",
    header: "Tanggal Terbit",
    headerClassName: "text-center min-w-[140px] whitespace-nowrap",
    cellClassName: "text-center whitespace-nowrap",
    accessor: "tanggalTerbit",
  },
  {
    key: "penyusun",
    header: "Penyusun",
    headerClassName: "text-center min-w-[140px] whitespace-nowrap",
    cellClassName: "text-center max-w-[140px] truncate",
    render: (row) => <span title={row.penyusun}>{row.penyusun}</span>,
  },
  {
    key: "ketuaIso",
    header: "Ketua ISO",
    headerClassName: "text-center min-w-[130px] whitespace-nowrap",
    cellClassName: "text-center max-w-[140px] truncate",
    render: (row) => <span title={row.ketuaIso}>{row.ketuaIso}</span>,
  },
  {
    key: "direktur",
    header: "Direktur",
    headerClassName: "text-center min-w-[120px] whitespace-nowrap",
    cellClassName: "text-center max-w-[140px] truncate",
    render: (row) => <span title={row.direktur}>{row.direktur}</span>,
  },
  {
    key: "status",
    header: "Status",
    headerClassName: "text-center min-w-[120px]",
    cellClassName: "text-center",
    render: (row) => (
      <span
        className={`inline-flex items-center justify-center rounded px-3 py-1 text-xs font-medium ${
          STATUS_STYLES[row.status] ??
          "bg-gray-100 text-gray-600 border border-gray-200"
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "aksi",
    header: "Aksi",
    headerClassName: "text-center min-w-[140px]",
    cellClassName: "flex justify-center gap-4 whitespace-nowrap",
    render: (row) => (
      <>
        <AlertIconDialog
          type="view"
          row={row}
          trigger={() => (
            <button type="button">
              <Eye className="textEye-[#121A2E] w-5 h-5 cursor-pointer" />
            </button>
          )}
        />
        <AlertIconDialog
          type="edit"
          row={row}
          trigger={() => (
            <button type="button">
              <FilePen className="text-[#2B7FFF] w-5 h-5 cursor-pointer" />
            </button>
          )}
          onEditSubmit={onEdit}
          editSubmitting={isUpdating}
        />
        <button type="button" onClick={() => onPreview?.(row)} title="Pratinjau PDF" aria-label="Pratinjau PDF Dokumen">
          <FileText className="text-[#00C950] w-5 h-5 cursor-pointer" />
        </button>
        <button
          type="button"
          onClick={() => onDownload?.(row)}
          title="Unduh PDF"
          aria-label="Unduh PDF Dokumen"
          disabled={downloadingId === row.noDoc}
          className="disabled:opacity-60"
        >
          {downloadingId === row.noDoc ? (
            <Loader2 className="text-[#F1C441] w-5 h-5 animate-spin" />
          ) : (
            <Download className="text-[#F1C441] w-5 h-5 cursor-pointer" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(row)}
          title="Hapus"
          aria-label="Hapus Dokumen"
        >
          <Trash2 className="text-[#FB2C36] w-5 h-5 cursor-pointer" />
        </button>
      </>
    ),
  },
]

export default function DokumenSoA() {
  usePageTemplate({
    title: "Statement of Applicability",
    subtitle: "Kelola dokumen, kategori, dan pertanyaan SoA",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  })
  const {
    statusFilter,
    setStatusFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    searchQuery,
    setSearchQuery,
    perPage,
    currentPage,
    setActivePage,
    pagedData,
    totalData,
    totalPages,
    handlePaginateChange,
    isLoading,
    isError,
    error,
    createDocument,
    isCreating,
    updateDocument,
    isUpdating,
    deleteDocument,
    isDeleting,
  } = useSoADocuments()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [downloadingDocId, setDownloadingDocId] = useState(null)
  const [deleteDoc, setDeleteDoc] = useState(null)


  const handleSearchChange = useCallback(
    (event) => {
      setSearchQuery(event.target.value)
    },
    [setSearchQuery],
  )

  const handlePreview = useCallback((row) => {
    setPreviewDoc(row)
    setIsPreviewOpen(true)
  }, [])

  const handleDownload = useCallback(async (row) => {
    if (!row?.id) {
      toast.error("Dokumen SoA tidak ditemukan.")
      return false
    }

    setDownloadingDocId(row.noDoc)
    try {
      const reviewData = await getSoAReviewExportData(row.id)
      if (!reviewData.sections.length) {
        toast.warning("Belum ada jawaban SoA untuk dokumen ini. PDF akan menggunakan placeholder.")
      }

      await downloadSoAReviewPDF(row, {
        ...reviewData,
        filename: `review-soa-${(row.noDoc || row.judul || "dokumen").replace(/\s+/g, "-").toLowerCase()}.pdf`,
      })
      return true
    } catch (error) {
      console.error("Gagal mengunduh PDF SoA", error)
      toast.error(error?.message ?? "Gagal mengunduh PDF SoA.")
      return false
    } finally {
      setDownloadingDocId(null)
    }
  }, [getSoAReviewExportData])

  const handleClosePreview = useCallback((open) => {
    setIsPreviewOpen(open)
    if (!open) {
      setPreviewDoc(null)
    }
  }, [])

  const previewBuilder = useCallback(async () => {
    if (!previewDoc?.id) return null

    const reviewData = await getSoAReviewExportData(previewDoc.id)

    return getSoAReviewPDFPreview(previewDoc, reviewData)
  }, [previewDoc, getSoAReviewExportData])

  const handleEditDocument = useCallback(
    async (documentId, payload) => {
      if (!documentId) return
      try {
        await updateDocument(documentId, payload)
      } catch (updateError) {
        console.error("Gagal memperbarui dokumen SoA", updateError)
        throw updateError
      }
    },
    [updateDocument],
  )

  const handlePromptDeleteDocument = useCallback(
    (document) => {
      if (!document) {
        setDeleteDoc(null)
        return
      }

      setDeleteDoc({
        ...document,
        judul: document.judul || document.noDoc || "Dokumen SoA",
      })
    },
    [setDeleteDoc],
  )

  const columns = useMemo(
    () =>
      buildSoAColumns({
        onPreview: handlePreview,
        onDownload: handleDownload,
        downloadingId: downloadingDocId,
        onDelete: handlePromptDeleteDocument,
        onEdit: handleEditDocument,
        isUpdating,
      }),
    [handlePreview, handleDownload, downloadingDocId, handlePromptDeleteDocument, handleEditDocument, isUpdating],
  )

  const handleCreateDocument = useCallback(
    async (payload) => {
      const trimmedPayload = {
        document_number: payload?.document_number?.trim(),
        publish_date: payload?.publish_date,
        title: payload?.title?.trim(),
        revision: payload?.revision?.trim(),
        classification: payload?.classification?.trim() || null,
        compiler_name: payload?.compiler_name?.trim() || null,
        iso_chairman_name: payload?.iso_chairman_name?.trim() || null,
        director_name: payload?.director_name?.trim() || null,
        status: payload?.status,
      }

      if (!trimmedPayload.document_number || !trimmedPayload.title) {
        toast.warning("Nomor dan judul dokumen wajib diisi.")
        return
      }

      try {
        await createDocument(trimmedPayload)
        toast.success("Dokumen SoA berhasil ditambahkan.")
      } catch (createError) {
        console.error("Gagal membuat dokumen SoA", createError)
        toast.error(createError?.message ?? "Gagal membuat dokumen SoA")
      }
    },
    [createDocument],
  )

  const handleDeleteDocument = useCallback(
    async (documentId) => {
      if (!documentId) return
      try {
        await deleteDocument(documentId)
        setDeleteDoc(null)
        toast.success("Dokumen SoA berhasil dihapus.")
      } catch (deleteError) {
        console.error("Gagal menghapus dokumen SoA", deleteError)
        toast.error(deleteError?.message ?? "Gagal menghapus dokumen SoA")
      }
    },
    [deleteDocument],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 min-w-60"
          inputGroupClassName="h-14 w-full"
        />

        <StatusDropdown
          isMenuOpen={isFilterDropdownOpen}
          setIsMenuOpen={setIsFilterDropdownOpen}
          value={statusFilter}
          onChange={setStatusFilter}
          options={FILTER_OPTIONS}
          classNameButton="w-[204px]! h-14!"
          classNameDropdown="w-[204px]!"
        />

        <OverlayForm
          className="w-[203px]"
          triggerLabel="Tambah Dokumen"
          onDocumentSubmit={handleCreateDocument}
          documentSubmitting={isCreating}
        />
      </div>

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red">
          {error?.message || "Gagal memuat dokumen SoA"}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-gray-dark">
          Memuat data dokumen SoA...
        </div>
      ) : (
        <AdminTable
          className="bg-white"
          tableClassName="min-w-[900px]"
          columns={columns}
          data={pagedData}
          getRowKey={(row) => row.id || `${row.noDoc}`}
        />
      )}

      <PaginateControls
        perPage={perPage}
        onPaginateChange={handlePaginateChange}
        paginateValue={PAGINATE_OPTIONS}
        setActivePage={setActivePage}
        activePage={currentPage}
        onPageChange={setActivePage}
        totalPages={totalPages}
        totalData={totalData}
      />

      <PDFPreviewDialog
        open={isPreviewOpen}
        onOpenChange={handleClosePreview}
        title={previewDoc?.judul ? `Pratinjau Review SoA • ${previewDoc.judul}` : "Pratinjau Review SoA"}
        previewBuilder={previewDoc ? previewBuilder : null}
        onDownload={
          previewDoc
            ? async () => {
                const success = await handleDownload(previewDoc)
                if (!success) {
                  throw new Error("Gagal mengunduh PDF SoA")
                }
              }
            : null
        }
      />

      <DocumentDeleteDialog
        open={Boolean(deleteDoc)}
        onOpenChange={(open) => {
          if (!open) setDeleteDoc(null)
        }}
        documentData={deleteDoc}
        onConfirm={(payload) => {
          const documentId =
            typeof payload === "string" ? payload : payload?.id
          if (documentId) handleDeleteDocument(documentId)
        }}
        entityLabel="Dokumen SoA"
      />

    </div>
  )
}
