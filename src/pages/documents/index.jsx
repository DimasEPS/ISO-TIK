import { useCallback, useMemo, useState } from "react"
import { Eye, FileDown, Trash2, FilePen } from "lucide-react"
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { SearchBar, PaginateControls, Table as AdminTable } from "@/components/admin/table"
import { Button } from "@/components/ui/button"
import { useDocuments, mapDocumentDetail } from "./hooks/useDocuments"
import { DocumentFormDialog } from "./components/DocumentFormDialog"
import { DocumentDeleteDialog } from "./components/DocumentDeleteDialog"
import { DetailModal } from "@/pages/ncr/components/common"
import { downloadDocumentFile } from "@/lib/download-file"

export default function Dokumen() {
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
    createDocument,
    isCreatingDocument,
    updateDocument,
    isUpdatingDocument,
    deleteDocument,
    fetchDocumentDetail,
  } = useDocuments()
  usePageTemplate({
    title: "Statement of Applicability",
    subtitle: "Kelola dokumen, kategori, dan pertanyaan SoA",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [deleteDoc, setDeleteDoc] = useState(null)

  const handleCreateDocument = useCallback(
    async (values) => {
      await createDocument({
        document_code: values.noDoc,
        document_name: values.judul,
        description: values.deskripsi,
        file: values.file,
      })
      setActivePage(1)
    },
    [createDocument, setActivePage],
  )

  const handleUpdateDocument = useCallback(
    async (values) => {
      const targetId = values.id || editDoc?.id
      if (!targetId) {
        throw new Error("Dokumen tidak valid")
      }

      await updateDocument(targetId, {
        document_code: values.noDoc,
        document_name: values.judul,
        description: values.deskripsi,
        file: values.file,
      })
    },
    [editDoc?.id, updateDocument],
  )

  const handlePreviewDocument = useCallback(
    async (document) => {
      if (!document?.id) return

      setPreviewDoc({
        ...document,
        penyusun: document.penyusun || "-",
        fileName: document.fileName || "",
      })

      try {
        const response = await fetchDocumentDetail(document.id)
        const detail = mapDocumentDetail(response?.data ?? {})
        setPreviewDoc(detail)
      } catch (error) {
        console.error("Gagal memuat detail dokumen", error)
        window.alert(error?.message || "Gagal memuat detail dokumen.")
      }
    },
    [fetchDocumentDetail],
  )

  const handleDownloadDocument = useCallback(
    async (document) => {
      if (!document?.id) return

      let detail
      try {
        const response = await fetchDocumentDetail(document.id)
        detail = mapDocumentDetail(response?.data ?? {})
        await downloadDocumentFile({
          fileUrl: detail.fileUrl,
          fileName: detail.fileName || detail.noDoc || "dokumen",
        })
      } catch (error) {
        console.error("Gagal mengunduh dokumen", error)
        window.alert(error?.message || "Gagal mengunduh dokumen.")
      }
    },
    [fetchDocumentDetail],
  )

  const handleEditDocument = useCallback(
    async (document) => {
      if (!document?.id) return

      setEditDoc(document)
      setIsEditDialogOpen(true)

      try {
        const response = await fetchDocumentDetail(document.id)
        const detail = mapDocumentDetail(response?.data ?? {})
        setEditDoc(detail)
      } catch (error) {
        console.error("Gagal memuat detail dokumen", error)
        window.alert(error?.message || "Gagal memuat detail dokumen.")
      }
    },
    [fetchDocumentDetail],
  )

  const handlePromptDeleteDocument = useCallback(
    (document) => {
      if (!document) {
        setDeleteDoc(null)
        return
      }

      setDeleteDoc({
        ...document,
        judul: document.judul || document.noDoc || "Dokumen",
      })
    },
    [setDeleteDoc],
  )

  const handleDeleteDocument = useCallback(
    async (document) => {
      if (!document?.id) return

      try {
        await deleteDocument(document.id)
        setDeleteDoc(null)
      } catch (error) {
        console.error("Gagal menghapus dokumen", error)
        window.alert(error?.message || "Gagal menghapus dokumen.")
      }
    },
    [deleteDocument],
  )

  const handleClosePreview = useCallback(() => {
    setPreviewDoc(null)
  }, [])

  const columns = useMemo(
    () => [
      {
        key: "noDoc",
        header: "Kode Dokumen",
        headerClassName: "text-left min-w-[140px] body-medium text-navy whitespace-nowrap",
        cellClassName: "text-left text-navy body whitespace-nowrap",
        accessor: "noDoc",
      },
      {
        key: "judul",
        header: "Nama Dokumen",
        headerClassName: "text-left min-w-[220px] body-medium text-navy-hover whitespace-nowrap",
        cellClassName: "text-left text-navy truncate max-w-[260px] body",
        render: (row) => <span title={row.judul}>{row.judul}</span>,
      },
      {
        key: "deskripsi",
        header: "Deskripsi",
        headerClassName: "text-left min-w-[300px] body-medium text-navy-hover",
        cellClassName: "text-left text-navy-hover max-w-[320px] truncate",
        render: (row) => <span title={row.deskripsi}>{row.deskripsi}</span>,
      },
      {
        key: "tanggalTerbit",
        header: "Tanggal Unggah",
        headerClassName: "text-center min-w-[150px] body-medium text-navy-hover",
        cellClassName: "text-center text-navy-hover body",
        accessor: "tanggalTerbit",
      },
      {
        key: "aksi",
        header: "Aksi",
        headerClassName: "text-center min-w-[140px] body text-navy-hover",
        cellClassName: "flex items-center justify-center gap-3 whitespace-nowrap body text-navy-hover",
        render: (row) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Lihat"
              className="text-[#121A2E] hover:text-blue-dark"
              onClick={() => handlePreviewDocument(row)}
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Unduh"
              className="text-[#F1C441] hover:text-yellow-500"
              onClick={() => handleDownloadDocument(row)}
            >
              <FileDown className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Edit"
              className="text-[#2B7FFF] hover:text-blue-dark"
              onClick={() => handleEditDocument(row)}
            >
              <FilePen className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Hapus"
              className="text-[#FB2C36] hover:text-red-500"
              onClick={() => handlePromptDeleteDocument(row)}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    [handleDownloadDocument, handleEditDocument, handlePreviewDocument, handlePromptDeleteDocument],
  )

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-[1330px_189px] gap-4 md:flex-row md:items-center">
        <SearchBar
          className="flex-1"
          inputGroupClassName="w-[1330px] h-[56px]"
          placeholder="Cari dokumen berdasarkan kode atau nama"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <Button
          className="h-14 px-6 text-white bg-navy hover:bg-navy-hover"
          onClick={() => setIsAddDialogOpen(true)}
        >
          + Tambah Dokumen
        </Button>
      </div>

      <AdminTable
        className="bg-white"
        tableClassName="min-w-[900px]"
        columns={columns}
        data={pagedData}
        getRowKey={(row) => row.id ?? row.noDoc}
      />

      <PaginateControls
        perPage={perPage}
        paginateValue={[10, 20, 50, 100]}
        onPaginateChange={handlePaginateChange}
        setActivePage={setActivePage}
        activePage={currentPage}
        onPageChange={setActivePage}
        totalPages={totalPages}
        totalData={totalData}
      />
      <DocumentFormDialog
        mode="add"
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreateDocument}
        isSubmitting={isCreatingDocument}
      />
      <DocumentFormDialog
        mode="edit"
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setEditDoc(null)
        }}
        initialData={editDoc}
        onSubmit={handleUpdateDocument}
        isSubmitting={isUpdatingDocument}
      />
      <DetailModal
        isOpen={Boolean(previewDoc)}
        onClose={handleClosePreview}
        title="Detail Dokumen SoA"
        subtitle="Informasi lengkap mengenai dokumen yang dipilih"
        fields={
          previewDoc
            ? [
                {
                  label: "Kode Dokumen",
                  value: previewDoc.noDoc,
                  className: "text-navy font-semibold",
                },
                {
                  label: "Nama Dokumen",
                  value: previewDoc.judul,
                  className: "text-navy font-semibold",
                },
                {
                  label: "Tanggal Unggah",
                  value: previewDoc.tanggalTerbit,
                },
                {
                  label: "Penyusun",
                  value: previewDoc.penyusun || "-",
                },
                {
                  label: "Deskripsi",
                  value: previewDoc.deskripsi || "-",
                  type: "description",
                },
                {
                  label: "File",
                  value: previewDoc.fileName || previewDoc.noDoc || "-",
                },
              ]
            : []
        }
      />
      <DocumentDeleteDialog
        open={Boolean(deleteDoc)}
        onOpenChange={(open) => {
          if (!open) setDeleteDoc(null)
        }}
        documentData={deleteDoc}
        onConfirm={(document) => handleDeleteDocument(document)}
        entityLabel="Dokumen"
      />
    </div>
  )
}
