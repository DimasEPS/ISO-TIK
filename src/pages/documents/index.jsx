import { useMemo, useState } from "react"
import { Eye, FileDown, Trash2, FilePen } from "lucide-react"
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { SearchBar, PaginateControls, Table as AdminTable } from "@/components/admin/table"
import { Button } from "@/components/ui/button"
import { useDocuments } from "./hooks/useDocuments"
import { DocumentFormDialog } from "./components/DocumentFormDialog"
import { DocumentDeleteDialog } from "./components/DocumentDeleteDialog"
import { DetailModal } from "@/pages/ncr/components/common"

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
  const [editDoc, setEditDoc] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [deleteDoc, setDeleteDoc] = useState(null)

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
              onClick={() => setPreviewDoc(row)}
            >
              <Eye className="h-5 w-5" />
            </button>
            <button type="button" title="Unduh" className="text-[#F1C441] hover:text-yellow-500">
              <FileDown className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Edit"
              className="text-[#2B7FFF] hover:text-blue-dark"
              onClick={() => setEditDoc(row)}
            >
              <FilePen className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Hapus"
              className="text-[#FB2C36] hover:text-red-500"
              onClick={() => setDeleteDoc(row)}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    [],
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
        getRowKey={(row) => row.noDoc}
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
      />
      <DocumentFormDialog
        mode="edit"
        open={Boolean(editDoc)}
        onOpenChange={(open) => {
          if (!open) setEditDoc(null)
        }}
        initialData={editDoc}
      />
      <DetailModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
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
        onConfirm={() => setDeleteDoc(null)}
      />
    </div>
  )
}
