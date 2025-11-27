import { useCallback, useMemo, useState, useRef } from "react";
import { Download, Eye, FilePen, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { resolveUserDisplayName } from "@/lib/user-display";
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
import { checklistManualDocumentsService } from "@/services/checklistManualDocumentsService";

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
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteDocumentTarget, setDeleteDocumentTarget] = useState(null);
  const [leadCache, setLeadCache] = useState({});
  const fetchingLeadsRef = useRef(new Set());
  

  const columns = useMemo(() => [
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
      render: (row) => {
        // If API list already provided an array of leads, show them
        if (Array.isArray(row.leadAuditor) && row.leadAuditor.length > 0) {
          const joined = row.leadAuditor.join(", ");
          return <span title={joined}>{joined}</span>;
        }

        // If it's a single string (some mocks or older shapes), show it
        if (typeof row.leadAuditor === "string" && row.leadAuditor.trim() !== "") {
          return <span title={row.leadAuditor}>{row.leadAuditor}</span>;
        }

        // Fallback to ketuaAuditor single value if present
        if (row.ketuaAuditor && row.ketuaAuditor !== "-") {
          return <span title={row.ketuaAuditor}>{row.ketuaAuditor}</span>;
        }

        // If we already fetched and cached the lead for this row, show it
        const cached = leadCache[row.id];
        if (cached) return <span title={cached}>{cached}</span>;

        // Otherwise, trigger a one-time fetch for the document detail to read team
        if (!fetchingLeadsRef.current.has(row.id)) {
          fetchingLeadsRef.current.add(row.id);
          checklistManualDocumentsService
            .getDocument(row.id)
            .then((apiResp) => {
              const data = apiResp?.data ?? apiResp ?? {};
              const team = Array.isArray(data.team) ? data.team : [];
              const leadNames = team
                .filter((m) => (m.role || "").toLowerCase() === "lead")
                .map((m) => m.name ?? m.username ?? m.email ?? "-");
              const value = leadNames.length ? leadNames.join(", ") : "-";
              setLeadCache((prev) => ({ ...prev, [row.id]: value }));
            })
            .catch((err) => {
              console.error("Failed to fetch lead auditor for", row.id, err);
              setLeadCache((prev) => ({ ...prev, [row.id]: "-" }));
            })
            .finally(() => fetchingLeadsRef.current.delete(row.id));
        }

        return <span title="-">-</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "text-center px-4",
      cellClassName: "text-center px-4",
      render: (row) => (
        <span
          className={`inline-flex items-center justify-center rounded px-3 py-1 text-xs font-medium ${
            STATUS_STYLES[row.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"
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
      cellClassName: "flex items-center justify-center gap-3 px-4 whitespace-nowrap",
      render: (row) => (
        <>
          <button
            type="button"
            title="Lihat"
            onClick={async () => {
              setDetailLoading(true);
              try {
                const apiResp = await checklistManualDocumentsService.getDocument(row.id);
                const data = apiResp?.data ?? apiResp ?? {};

                const team = Array.isArray(data.team) ? data.team : [];

                const leadAuditor = team
                  .filter((m) => (m.role || "").toLowerCase() === "lead")
                  .map((m) => m.name ?? m.username ?? m.email ?? "-");
                const memberAuditor = team
                  .filter((m) => (m.role || "").toLowerCase() === "member")
                  .map((m) => m.name ?? m.username ?? m.email ?? "-");
                const reviewerAuditor = team
                  .filter((m) => (m.role || "").toLowerCase() === "reviewer")
                  .map((m) => m.name ?? m.username ?? m.email ?? "-");

                const mapped = {
                  id: data.id,
                  judul: data.title ?? "-",
                  tanggalDibuat: data.created_at ? new Date(data.created_at).toLocaleDateString("id-ID") : "-",
                  namaPerusahaan: data.company_name ?? "-",
                  lokasi: data.location ?? "-",
                  ruangLingkup: data.scope ?? "-",
                  status:
                    (data.status && {
                      draft: "Draft",
                      in_progress: "In Progress",
                      reviewed: "Reviewed",
                      approved: "Approved",
                    }[data.status]) || (data.status ?? "Draft"),
                  leadAuditor,
                  memberAuditor,
                  reviewerAuditor,
                  raw: data,
                };

                setDetailDocument(mapped);
                setIsDetailOpen(true);
              } catch (err) {
                console.error("Gagal memuat detail dokumen", err);
                toast.error(err?.message ?? "Gagal memuat detail dokumen");
              } finally {
                setDetailLoading(false);
              }
            }}
          >
            <Eye className="text-navy w-5 h-5 cursor-pointer" />
          </button>
          <button
            type="button"
            title="Edit"
            onClick={async () => {
              setDetailLoading(true);
              try {
                const apiResp = await checklistManualDocumentsService.getDocument(row.id);
                const data = apiResp?.data ?? apiResp ?? {};

                const team = Array.isArray(data.team) ? data.team : [];

                const teamForForm = team.map((member) => {
                  const source = member.user ?? member;
                  const userId = (member.user_id ?? member.userId ?? source.id ?? source.uuid ?? null) || null;
                  const nameFallback = source?.username ?? source?.email ?? member?.username ?? member?.email ?? "Pengguna tanpa nama";
                  const displayName = resolveUserDisplayName(member, nameFallback);
                  const roleDisplay = (member.role === "lead" && "Lead Auditor") || (member.role === "member" && "Member Auditor") || (member.role === "reviewer" && "Reviewer") || (member.role ?? "-");

                  return {
                    id: (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `temp-${Math.random().toString(36).slice(2, 11)}`),
                    userId: userId ? String(userId) : null,
                    name: member?.name ?? displayName,
                    displayName,
                    username: source?.username ?? member?.username ?? null,
                    email: source?.email ?? member?.email ?? null,
                    role: roleDisplay,
                    roleRaw: member?.role ?? null,
                    dateAdded: member?.assigned_at ? new Date(member.assigned_at).toLocaleDateString("id-ID") : "-",
                  };
                });

                const leadAuditors = teamForForm.filter((m) => (m.role || "").toLowerCase().includes("lead")).map((m) => m.displayName ?? m.name);

                const mappedFormValues = {
                  judul: data.title ?? "",
                  namaPerusahaan: data.company_name ?? "",
                  lokasi: data.location ?? "",
                  ruangLingkup: data.scope ?? "",
                  status: (data.status && {
                    draft: "Draft",
                    in_progress: "In Progress",
                    reviewed: "Reviewed",
                    approved: "Approved",
                  }[data.status]) || (data.status ?? "Draft"),
                  team: teamForForm,
                };

                const mappedRow = {
                  id: data.id,
                  judul: data.title ?? "-",
                  namaPerusahaan: data.company_name ?? "-",
                  lokasi: data.location ?? "-",
                  ruangLingkup: data.scope ?? "-",
                  ketuaAuditor: leadAuditors[0] ?? "-",
                  status: mappedFormValues.status,
                  leadAuditor: leadAuditors,
                  memberAuditor: teamForForm.filter((m) => (m.role || "").toLowerCase().includes("member")).map((m) => m.displayName ?? m.name),
                  reviewerAuditor: teamForForm.filter((m) => (m.role || "").toLowerCase().includes("reviewer")).map((m) => m.displayName ?? m.name),
                  team: teamForForm,
                  formValues: mappedFormValues,
                };

                setFormDocument(mappedRow);
                setFormMode("edit");
                setIsFormOpen(true);
              } catch (err) {
                console.error("Gagal memuat dokumen untuk edit", err);
                toast.error(err?.message ?? "Gagal memuat dokumen untuk edit");
              } finally {
                setDetailLoading(false);
              }
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
  ], [deleteDocumentTarget?.id, isDeleting]);

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
