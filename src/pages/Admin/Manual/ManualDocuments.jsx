import { useCallback, useMemo, useState } from "react";
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
import { manualDocuments } from "@/mocks/manualDocuments";
import { Download, Eye, FilePen, FileText, Plus, Trash2 } from "lucide-react";

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
  const [documents, setDocuments] = useState(manualDocuments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(FILTER_OPTIONS[0].value);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const buildTeamFromDoc = useCallback((doc) => {
    const lead = doc?.leadAuditor ?? [];
    const member = doc?.memberAuditor ?? [];
    return [
      ...lead.map((name) => ({
        id: crypto.randomUUID(),
        name,
        role: "Lead Auditor",
        dateAdded: doc?.tanggalDibuat ?? "",
      })),
      ...member.map((name) => ({
        id: crypto.randomUUID(),
        name,
        role: "Member Auditor",
        dateAdded: doc?.tanggalDibuat ?? "",
      })),
    ];
  }, []);

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
        render: (row) => (
          <span title={row.ketuaAuditor}>{row.ketuaAuditor}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        headerClassName: "text-center px-4",
        cellClassName: "text-center px-4",
        render: (row) => (
          <span
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium ${
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
                setSelectedDoc(row);
                setIsDetailOpen(true);
              }}
            >
              <Eye className="text-navy w-5 h-5 cursor-pointer" />
            </button>
            <button
              type="button"
              title="Edit"
              onClick={() => {
                setSelectedDoc({ ...row, team: buildTeamFromDoc(row) });
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
                setSelectedDoc(row);
                setIsDeleteOpen(true);
              }}
            >
              <Trash2 className="text-red w-5 h-5 cursor-pointer" />
            </button>
          </>
        ),
      },
    ],
    [buildTeamFromDoc]
  );

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesStatus =
        statusFilter === "Semua Status" || doc.status === statusFilter;
      const searchValue = search.toLowerCase();
      const matchesSearch =
        doc.judul.toLowerCase().includes(searchValue) ||
        doc.namaPerusahaan.toLowerCase().includes(searchValue);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, documents]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / perPage));
  const pagedDocuments = useMemo(() => {
    const startIndex = (activePage - 1) * perPage;
    return filteredDocuments.slice(startIndex, startIndex + perPage);
  }, [filteredDocuments, activePage, perPage]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <SearchBar
            className="flex-1"
            placeholder="Cari dokumen berdasarkan nama"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setActivePage(1);
            }}
            inputGroupClassName="h-14 w-full"
          />

          <StatusDropdown
            isMenuOpen={isStatusDropdownOpen}
            setIsMenuOpen={setIsStatusDropdownOpen}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setActivePage(1);
            }}
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
          onClick={() => {
            setSelectedDoc(null);
            setFormMode("create");
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Tambah Dokumen
        </Button>
      </div>

      <AdminTable
        className="rounded-xl border border-gray-medium bg-white shadow-sm"
        headerClassName="bg-state"
        tableClassName="min-w-[900px]"
        columns={columns}
        data={pagedDocuments}
        getRowKey={(row) => row.id}
      />

      <PaginateControls
        perPage={perPage}
        onPaginateChange={(value) => {
          setPerPage(Number(value));
          setActivePage(1);
        }}
        paginateValue={PAGINATE_OPTIONS}
        activePage={activePage}
        onPageChange={setActivePage}
        totalPages={totalPages}
        totalData={filteredDocuments.length}
      />

      <ManualDocumentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        initialData={selectedDoc ?? undefined}
        onSubmit={(payload) => {
          const teamList = payload.team ?? selectedDoc?.team ?? [];
          const derivedLead = teamList
            .filter((member) => member.role === "Lead Auditor")
            .map((member) => member.name);
          const derivedMember = teamList
            .filter((member) => member.role !== "Lead Auditor")
            .map((member) => member.name);

          if (formMode === "edit" && selectedDoc) {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === selectedDoc.id
                  ? {
                      ...doc,
                      ...payload,
                      team: teamList,
                      leadAuditor: derivedLead.length
                        ? derivedLead
                        : doc.leadAuditor,
                      memberAuditor: derivedMember.length
                        ? derivedMember
                        : doc.memberAuditor,
                    }
                  : doc
              )
            );
          } else {
            const nextId = Math.max(0, ...documents.map((doc) => doc.id)) + 1;
            const createdAt =
              payload.tanggalDibuat ?? new Date().toLocaleDateString("id-ID");
            setDocuments((prev) => [
              ...prev,
              {
                ...payload,
                id: nextId,
                team: teamList,
                tanggalDibuat: createdAt,
                leadAuditor: derivedLead,
                memberAuditor: derivedMember,
                ketuaAuditor: derivedLead[0] ?? payload.ketuaAuditor ?? "",
              },
            ]);
          }
        }}
      />

      <ManualDocumentDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        data={selectedDoc ?? undefined}
        onViewAnswers={() => {}}
        onFillAnswers={() => {}}
      />

      <ManualDocumentDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={selectedDoc?.judul ?? ""}
        onConfirm={() => {
          if (!selectedDoc) return;
          setDocuments((prev) =>
            prev.filter((doc) => doc.id !== selectedDoc.id)
          );
          setSelectedDoc(null);
        }}
      />
    </section>
  );
}
