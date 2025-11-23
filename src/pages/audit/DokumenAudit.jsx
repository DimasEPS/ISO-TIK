import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import {
  PaginateControls,
  SearchBar,
  StatusDropdown,
  Table as AdminTable,
} from "@/components/admin/table";
import { OverlayForm } from "@/components/admin/audit/OverlayForm";
import { AlertIconDialog } from "@/components/admin/audit/AlertIconDialog";
import { DeleteDialog } from "@/components/admin/audit/DeleteDialog";
import { PDFPreviewDialog } from "@/generatePDF/components/PDFPreviewDialog";
import { useAuditDocuments } from "./hooks/useAuditDocuments";
import {
  getAuditDocumentPDFPreview,
  downloadAuditDocumentPDF,
} from "@/generatePDF/generators/auditDocumentPDF";

const FILTER_OPTIONS = [
  { value: "Semua Status" },
  { value: "Draft" },
  { value: "In Progress" },
  { value: "Reviewed" },
  { value: "Approved" },
];

const PAGINATE_OPTIONS = [10, 20, 50, 100];

const getStatusBadgeClass = (status) => {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower === "in_progress" || statusLower === "in progress") {
    return "bg-yellow-100 text-yellow-700";
  } else if (statusLower === "reviewed") {
    return "bg-blue-100 text-blue-700";
  } else if (statusLower === "approved") {
    return "bg-green-100 text-green-700";
  } else {
    return "bg-gray-100 text-gray-700";
  }
};

const getStatusLabel = (status) => {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower === "in_progress") return "In Progress";
  if (statusLower === "draft") return "Draft";
  if (statusLower === "reviewed") return "Reviewed";
  if (statusLower === "approved") return "Approved";
  return status || "Draft";
};

export default function DokumenAudit() {
  const {
    // Data & loading states
    pagedData,
    isLoading,
    isError,
    error,
    // Pagination
    perPage,
    activePage,
    setActivePage,
    totalPages,
    totalData,
    handlePaginateChange,
    // Search & Filter
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    // Mutations
    createDocument,
    updateDocument,
    deleteDocument,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAuditDocuments();

  // Local UI states
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isModalDropdownOpen, setIsModalDropdownOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("Draft");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleCreateDocument = async (payload) => {
    await createDocument(payload);
  };

  const handlePreviewDocument = (row) => {
    setPreviewDoc(row);
  };

  const handleDownloadDocument = async (row) => {
    setDownloadingId(row.id);
    try {
      await downloadAuditDocumentPDF(row, {
        filename: `dokumen-audit-${(row.judul || row.id)
          .replace(/\s+/g, "-")
          .toLowerCase()}.pdf`,
      });
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setDownloadingId(null);
    }
  };

  const previewBuilder = previewDoc
    ? () => getAuditDocumentPDFPreview(previewDoc)
    : null;

  // Define columns inside component untuk akses mutations
  const AUDIT_COLUMNS = [
    {
      key: "judul",
      header: "Judul",
      headerClassName: "text-left text-navy",
      cellClassName: "text-navy text-left",
      accessor: "judul",
    },
    {
      key: "lokasi",
      header: "Lokasi",
      headerClassName: "text-center",
      cellClassName: "text-center",
      accessor: "lokasi",
    },
    {
      key: "tanggalAudit",
      header: "Tanggal Audit",
      headerClassName: "text-center",
      cellClassName: "text-center",
      accessor: "tanggalAudit",
    },
    {
      key: "leadAuditor",
      header: "Lead Auditor",
      headerClassName: "text-center",
      cellClassName: "text-center",
      accessor: "leadAuditor",
    },
    {
      key: "auditor",
      header: "Auditor",
      headerClassName: "text-center",
      cellClassName: "text-center",
      accessor: "auditor",
    },
    {
      key: "revisi",
      header: "Revisi",
      headerClassName: "text-center",
      cellClassName: "text-center",
      accessor: "revisi",
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(
            row.status
          )}`}
        >
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      headerClassName: "text-center",
      cellClassName: "flex justify-center gap-4",
      render: (row) => (
        <>
          <AlertIconDialog type="view" row={row} />
          <AlertIconDialog
            type="edit"
            row={row}
            onUpdate={updateDocument}
            isUpdating={isUpdating}
          />
          <button
            type="button"
            onClick={() => handlePreviewDocument(row)}
            title="Pratinjau PDF"
            aria-label="Pratinjau PDF Dokumen"
          >
            <FileText className="text-[#00C950] w-5 h-5 cursor-pointer" />
          </button>
          <button
            type="button"
            onClick={() => handleDownloadDocument(row)}
            title="Unduh PDF"
            aria-label="Unduh PDF Dokumen"
            disabled={downloadingId === row.id}
            className="disabled:opacity-60"
          >
            {downloadingId === row.id ? (
              <Loader2 className="text-[#F1C441] w-5 h-5 animate-spin" />
            ) : (
              <Download className="text-[#F1C441] w-5 h-5 cursor-pointer" />
            )}
          </button>
          <DeleteDialog
            row={row}
            onDelete={deleteDocument}
            isDeleting={isDeleting}
          />
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SearchBar
        className="w-[1082px]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Cari judul dokumen audit..."
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
        isStatusDropdownOpen={isModalDropdownOpen}
        setIsStatusDropdownOpen={setIsModalDropdownOpen}
        statusValue={modalStatus}
        onStatusChange={setModalStatus}
        onSubmit={handleCreateDocument}
        isSubmitting={isCreating}
      />

      {isLoading && (
        <div className="w-full text-center py-8 text-gray-500">
          Memuat data audit...
        </div>
      )}

      {isError && (
        <div className="w-full text-center py-8 text-red-500">
          Terjadi kesalahan: {error?.message || "Gagal memuat data"}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <AdminTable
            columns={AUDIT_COLUMNS}
            data={pagedData}
            getRowKey={(row, index) => row.id || `audit-${index}`}
          />

          <PaginateControls
            perPage={perPage}
            onPaginateChange={handlePaginateChange}
            paginateValue={PAGINATE_OPTIONS}
            setActivePage={setActivePage}
            activePage={activePage}
            onPageChange={setActivePage}
            totalPages={totalPages}
            totalData={totalData}
          />
        </>
      )}

      <PDFPreviewDialog
        open={Boolean(previewDoc)}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null);
        }}
        title={
          previewDoc?.judul
            ? `Pratinjau Dokumen Audit • ${previewDoc.judul}`
            : "Pratinjau Dokumen Audit"
        }
        previewBuilder={previewBuilder}
        onDownload={
          previewDoc
            ? async () => {
                await downloadAuditDocumentPDF(previewDoc, {
                  filename: `dokumen-audit-${(previewDoc.judul || previewDoc.id)
                    .replace(/\s+/g, "-")
                    .toLowerCase()}.pdf`,
                });
              }
            : null
        }
      />
    </div>
  );
}
