import { useState, useEffect, useMemo, useCallback } from "react"
import { SearchIcon, Plus, Eye, FilePen, FileText, Download, Trash2, Loader2 } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { useNCRDocuments } from "./hooks/useNCRData"
import { ncrMockData } from "./data/mockData"
import {
  NCRDetailModal,
  NCREditModal,
  NCRDeleteModal,
  NCRAddModal,
} from "./components/ncr"
import { PaginationControls } from "./components/common"
import { ChecklistCard } from "@/components/admin/audit/ChecklistCard"
import { NCR_STATUS } from "./constants"
import { PDFPreviewDialog } from "@/generatePDF/components"
import { downloadNCRDocumentPDF, getNCRDocumentPDFPreview } from "@/generatePDF/generators/ncrPDF"

export default function NCR() {
  usePageTemplate({
    title: "Non Conformity Report (NCR)",
    subtitle: "Kelola dokumen dan status",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const [statusFilter, setStatusFilter] = useState("all")

  const statusFilteredData = useMemo(() => {
    if (statusFilter === "all") return ncrMockData
    return ncrMockData.filter((item) => item.status === statusFilter)
  }, [statusFilter])

  const {
    searchQuery,
    setSearchQuery,
    perPage,
    currentPage,
    setActivePage,
    pagedData,
    totalData,
    totalPages,
    handlePaginateChange,
  } = useNCRDocuments(statusFilteredData)

  const [selectedNCR, setSelectedNCR] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [previewNCR, setPreviewNCR] = useState(null)
  const [generatingNCRId, setGeneratingNCRId] = useState(null)

  const handleViewDetail = (ncr) => {
    setSelectedNCR(ncr)
    setIsDetailModalOpen(true)
  }

  const handleEdit = (ncr) => {
    setSelectedNCR(ncr)
    setIsEditModalOpen(true)
  }

  const handleDelete = (ncr) => {
    setSelectedNCR(ncr)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedNCR(null)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedNCR(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedNCR(null)
  }

  const handleAddNCR = () => {
    setIsAddModalOpen(true)
  }

  const handlePreviewPDF = (ncr) => {
    setPreviewNCR(ncr)
    setIsPreviewDialogOpen(true)
  }

  const handleDownloadPDF = async (ncr) => {
    if (!ncr) return
    setGeneratingNCRId(ncr.id)
    try {
      await downloadNCRDocumentPDF(ncr, {
        filename: `laporan-ncr-${ncr.ncrNumber || ncr.id}.pdf`,
      })
    } catch (error) {
      console.error("Gagal mengunduh PDF NCR", error)
    } finally {
      setGeneratingNCRId(null)
    }
  }

  const handlePreviewDialogChange = (open) => {
    setIsPreviewDialogOpen(open)
    if (!open) {
      setPreviewNCR(null)
    }
  }

  const previewBuilder = useCallback(() => {
    if (!previewNCR) return null
    return getNCRDocumentPDFPreview(previewNCR)
  }, [previewNCR])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <InputGroup className="h-14 flex-1">
          <InputGroupInput
            placeholder="Cari NCR berdasarkan judul dokumen"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="bg-state text-navy placeholder:text-gray-dark"
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <Button
          onClick={handleAddNCR}
          className="body-medium p-4  w-40 gap-2 bg-navy roundeed-[4px] h-14 text-white hover:bg-navy-hover"
        >
          <Plus className="h-5 w-5" /> Tambah NCR
        </Button>
      </div>

      <div className="space-y-4">
        {pagedData.map((ncr) => (
          <ChecklistCard
            key={ncr.id}
            checklist={ncr}
            badge={ncr.id}
            title={ncr.title}
            description={ncr.description}
            actions={
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleViewDetail(ncr)}
                  className="rounded p-2 transition-colors hover:bg-blue-50"
                  title="Lihat Detail"
                  aria-label="Lihat Detail NCR"
                >
                  <Eye className="h-5 w-5 text-[#000000]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(ncr)}
                  className="rounded p-2 transition-colors hover:bg-blue-50"
                  title="Edit"
                  aria-label="Edit NCR"
                >
                  <FilePen className="h-5 w-5 text-[#193cb8]" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewPDF(ncr)}
                  className="rounded p-2 transition-colors hover:bg-blue-50"
                  title="Pratinjau PDF"
                  aria-label="Pratinjau PDF NCR"
                >
                  <FileText className="h-5 w-5 text-[#00c950]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(ncr)}
                  className="rounded p-2 transition-colors hover:bg-blue-50 disabled:opacity-60"
                  title="Unduh PDF"
                  aria-label="Unduh PDF NCR"
                  disabled={generatingNCRId === ncr.id}
                >
                  {generatingNCRId === ncr.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#2B7FFF]" />
                  ) : (
                    <Download className="h-5 w-5 text-[#f0b100]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(ncr)}
                  className="rounded p-2 transition-colors hover:bg-red-50"
                  title="Hapus"
                  aria-label="Hapus NCR"
                >
                  <Trash2 className="h-5 w-5 text-[#FB2C36]" />
                </button>
              </div>
            }
          />
        ))}
        {pagedData.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            Tidak ada NCR sesuai pencarian
          </div>
        )}
      </div>

      <PaginationControls
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        totalData={totalData}
        onPageChange={setActivePage}
        onPaginateChange={handlePaginateChange}
      />

      {selectedNCR && (
        <NCRDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          ncrData={selectedNCR}
        />
      )}
      {selectedNCR && (
        <NCREditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          ncrData={selectedNCR}
          onSave={(data) => console.log("Saving data", data)}
        />
      )}
      {selectedNCR && (
        <NCRDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          ncrData={selectedNCR}
          onConfirm={(data) => console.log("Deleting data", data)}
        />
      )}
      <NCRAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => console.log("Adding data", data)}
      />

      <PDFPreviewDialog
        open={isPreviewDialogOpen}
        onOpenChange={handlePreviewDialogChange}
        title={`Pratinjau Laporan NCR ${previewNCR?.ncrNumber || previewNCR?.id || ""}`.trim()}
        previewBuilder={previewNCR ? previewBuilder : null}
        onDownload={
          previewNCR
            ? () =>
                downloadNCRDocumentPDF(previewNCR, {
                  filename: `laporan-ncr-${previewNCR.ncrNumber || previewNCR.id}.pdf`,
                })
            : null
        }
      />
    </div>
  )
}
