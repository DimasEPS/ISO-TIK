import { useCallback, useMemo, useState } from "react";
import { Download, Eye, FilePen, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PaginateControls,
  SearchBar,
  StatusDropdown,
  Table as AdminTable,
} from "@/components/admin/table";
import {
  ManualDocumentDeleteDialog,
  ManualDocumentDetailDialog,
  ManualDocumentFormDialog,
} from "@/components/admin/Manual";
import { useManualDocuments } from "./hooks/useManualDocuments";

const FILTER_OPTIONS = [
  { value: "Semua Status" },
  { value: "Draft" },
  { value: "In Progress" },
  { value: "Reviewed" },
  { value: "Approved" },
];

const PAGINATE_OPTIONS = [10, 20, 50];

const STATUS_STYLES = {
  Draft: "bg-gray-light text-navy-hover border border-gray-medium small",
  "In Progress": "bg-yellow-light text-yellow border border-yellow small",
  Reviewed: "bg-blue-light text-blue border border-blue small",
  Approved: "bg-green-light text-green border border-green small",
};

export default function ManualDocuments() {
  const {
    documents,
    statusFilter,
    setStatusFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    searchQuery,
    setSearchQuery,
    perPage,
    currentPage,
    setActivePage,
    totalPages,
    totalData,
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
  } = useManualDocuments();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formDocument, setFormDocument] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailDocument, setDetailDocument] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteDocumentTarget, setDeleteDocumentTarget] = useState(null);

  const columns = useMemo(
    () => [
      {
        key: "judul",
        header: "Judul",
        headerClassName: "text-left px-4",
        cellClassName: "text-left px-4 text-navy",
        render: (row) => (
          <span className="truncate" title={row.judul}>
            {row.judul}
          </span>
        ),
      },
      {
        key: "namaPerusahaan",
        header: "Nama Perusahaan",
        headerClassName: "text-left px-4 whitespace-nowrap",
        cellClassName: "text-left px-4 text-navy whitespace-nowrap",
        accessor: "namaPerusahaan",
      },
      {
        key: "lokasi",
        header: "Lokasi",
        headerClassName: "text-left px-4 whitespace-nowrap",
        cellClassName: "text-left px-4 text-navy whitespace-nowrap",
        accessor: "lokasi",
      },
      {
        key: "ruangLingkup",
        header: "Ruang Lingkup",
        headerClassName: "text-left px-4 whitespace-nowrap",
        cellClassName: "text-left px-4 text-navy",
        render: (row) => (
          <span className="truncate" title={row.ruangLingkup}>
            {row.ruangLingkup}
          </span>
        ),
      },
      {
        key: "ketuaAuditor",
        header: "Ketua Auditor",
        headerClassName: "text-left px-4 whitespace-nowrap",
        cellClassName: "text-left px-4 text-navy whitespace-nowrap",
        render: (row) => <span title={row.ketuaAuditor}>{row.ketuaAuditor}</span>,
      },
      {
        key: "status",
        header: "Status",
        headerClassName: "text-center px-4",
        cellClassName: "text-center px-4",
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
        headerClassName: "text-center px-4 whitespace-nowrap",
        cellClassName:
          "flex items-center justify-center gap-3 px-4 whitespace-nowrap",
        render: (row) => (
          <>
            <button
              type="button"
              title="Lihat"
              onClick={() => {
                setDetailDocument(row);
                setIsDetailOpen(true);
              }}
            >
              <Eye className="text-navy w-5 h-5 cursor-pointer" />
            </button>
            <button
              type="button"
              title="Edit"
              onClick={() => {
                setFormDocument(row);
                setFormMode("edit");
                setIsFormOpen(true);
              }}
            >
              <FilePen className="text-blue w-5 h-5 cursor-pointer" />
            </button>
            <button type="button" title="Lihat File">
              <FileText className="text-green w-5 h-5 cursor-pointer" />
            </button>
            <button type="button" title="Unduh">
              <Download className="text-yellow w-5 h-5 cursor-pointer" />
            </button>
            <button
              type="button"
              title="Hapus"
              onClick={() => {
                setDeleteDocumentTarget(row);
                setIsDeleteOpen(true);
              }}
              disabled={isDeleting && deleteDocumentTarget?.id === row.id}
            >
              <Trash2 className="text-red w-5 h-5 cursor-pointer" />
            </button>
          </>
        ),
      },
    ],
    [deleteDocumentTarget?.id, isDeleting]
  );

  const handleSearchChange = useCallback(
    (event) => {
      setSearchQuery(event.target.value);
    },
    [setSearchQuery],
  );

  const handleOpenCreateForm = useCallback(() => {
    setFormDocument(null);
    setFormMode("create");
    setIsFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (payload) => {
      try {
        if (formMode === "edit" && formDocument) {
          await updateDocument(formDocument.id, payload);
          toast.success("Checklist manual berhasil diperbarui.");
        } else {
          await createDocument(payload);
          toast.success("Checklist manual berhasil ditambahkan.");
        }
        setIsFormOpen(false);
        setFormDocument(null);
      } catch (submitError) {
        console.error("Gagal menyimpan checklist manual", submitError);
        toast.error(submitError?.message ?? "Gagal menyimpan checklist manual.");
        throw submitError;
      }
    },
    [createDocument, formDocument, formMode, updateDocument],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDocumentTarget) return;
    try {
      await deleteDocument(deleteDocumentTarget.id);
      toast.success("Checklist manual berhasil dihapus.");
      setDeleteDocumentTarget(null);
    } catch (deleteError) {
      console.error("Gagal menghapus checklist manual", deleteError);
      toast.error(deleteError?.message ?? "Gagal menghapus checklist manual.");
    }
  }, [deleteDocument, deleteDocumentTarget]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <SearchBar
            className="flex-1"
            placeholder="Cari dokumen berdasarkan nama"
            value={searchQuery}
            onChange={handleSearchChange}
            inputGroupClassName="h-14 w-full"
          />

          <StatusDropdown
            isMenuOpen={isFilterDropdownOpen}
            setIsMenuOpen={setIsFilterDropdownOpen}
            value={statusFilter}
            onChange={setStatusFilter}
            options={FILTER_OPTIONS}
            className="sm:w-[204px]"
            classNameButton="h-14 w-full bg-state"
            classNameDropdown="w-[204px]"
            showFunnelIcon={false}
          />
        </div>

        <Button
          type="button"
          className="flex h-14 items-center gap-2 self-start rounded-lg bg-navy px-4 text-white hover:bg-navy/90 lg:self-auto"
          onClick={handleOpenCreateForm}
        >
          <Plus className="h-4 w-4" />
          Tambah Dokumen
        </Button>
      </div>

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red">
          {error?.message || "Gagal memuat checklist manual"}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-gray-medium bg-white px-4 py-10 text-center text-gray-dark">
          Memuat data checklist manual...
        </div>
      ) : (
        <AdminTable
          className="rounded-xl border border-gray-medium bg-white shadow-sm"
          headerClassName="bg-state"
          tableClassName="min-w-[900px]"
          columns={columns}
          data={documents}
          getRowKey={(row) => row.id}
        />
      )}

      <PaginateControls
        perPage={perPage}
        onPaginateChange={handlePaginateChange}
        paginateValue={PAGINATE_OPTIONS}
        activePage={currentPage}
        onPageChange={setActivePage}
        totalPages={totalPages}
        totalData={totalData}
      />

      <ManualDocumentFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setFormDocument(null);
            setFormMode("create");
          }
        }}
        mode={formMode}
        initialData={formDocument?.formValues ?? undefined}
        onSubmit={handleFormSubmit}
        submitting={formMode === "edit" ? isUpdating : isCreating}
      />

      <ManualDocumentDetailDialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setDetailDocument(null);
          }
        }}
        data={detailDocument ?? undefined}
        onViewAnswers={() => {}}
        onFillAnswers={() => {}}
      />

      <ManualDocumentDeleteDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setDeleteDocumentTarget(null);
          }
        }}
        title={deleteDocumentTarget?.judul ?? ""}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  );
}
