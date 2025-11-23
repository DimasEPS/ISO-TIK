import { useState, useEffect, useMemo, useCallback } from "react"
import { SearchIcon, Plus, Eye, FilePen, FileText, Download, Trash2, Loader2 } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { 
  useNCRDocuments as useNCRDocumentsQuery,
  useCreateNCRDocument,
  useUpdateNCRDocument,
  useDeleteNCRDocument 
} from "./hooks/useNCRQueries"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [perPage, setPerPage] = useState(10)
  const [currentPage, setActivePage] = useState(1)

  // Fetch documents from API
  const { data: documentsData, isLoading, error } = useNCRDocumentsQuery({
    page: currentPage,
    per_page: perPage,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  })

  const createMutation = useCreateNCRDocument()
  const updateMutation = useUpdateNCRDocument()
  const deleteMutation = useDeleteNCRDocument()

  const pagedData = documentsData?.data || []
  const totalData = documentsData?.meta?.total || 0
  const totalPages = documentsData?.meta?.last_page || 1

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
        filename: `laporan-ncr-${ncr.ncr_number || ncr.id}.pdf`,
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

  const handleSaveAdd = async (formData) => {
    try {
      await createMutation.mutateAsync(formData)
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Gagal menambah dokumen NCR:", error)
    }
  }

  const handleSaveEdit = async (formData) => {
    if (!selectedNCR?.id) return
    try {
      await updateMutation.mutateAsync({
        documentId: selectedNCR.id,
        payload: formData,
      })
      setIsEditModalOpen(false)
      setSelectedNCR(null)
    } catch (error) {
      console.error("Gagal mengupdate dokumen NCR:", error)
    }
  }

  const handleConfirmDelete = async (ncrData) => {
    if (!ncrData?.id) return
    try {
      await deleteMutation.mutateAsync(ncrData.id)
      setIsDeleteModalOpen(false)
      setSelectedNCR(null)
    } catch (error) {
      console.error("Gagal menghapus dokumen NCR:", error)
    }
  }

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value))
    setActivePage(1)
  }, [])

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
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Memuat data NCR...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-8 text-center text-red-600">
            <p>Gagal memuat data NCR</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        ) : pagedData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            Tidak ada NCR sesuai pencarian
          </div>
        ) : (
          pagedData.map((ncr, index) => {
            const listNumber =
              ncr.ncr_number ||
              ncr.document_number ||
              String((currentPage - 1) * perPage + index + 1).padStart(2, "0");
            return (
            <ChecklistCard
              key={ncr.id}
              checklist={ncr}
              badge={listNumber}
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
            );
          })
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
          onSave={handleSaveEdit}
        />
      )}
      {selectedNCR && (
        <NCRDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          ncrData={selectedNCR}
          onConfirm={handleConfirmDelete}
        />
      )}
      <NCRAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAdd}
      />

      <PDFPreviewDialog
        open={isPreviewDialogOpen}
        onOpenChange={handlePreviewDialogChange}
        title={`Pratinjau Laporan NCR ${previewNCR?.ncr_number || previewNCR?.id || ""}`.trim()}
        previewBuilder={previewNCR ? previewBuilder : null}
        onDownload={
          previewNCR
            ? () =>
                downloadNCRDocumentPDF(previewNCR, {
                  filename: `laporan-ncr-${previewNCR.ncr_number || previewNCR.id}.pdf`,
                })
            : null
        }
      />
    </div>
  )
}
