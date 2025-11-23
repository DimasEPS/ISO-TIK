import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAdminLayout } from "@/layouts/admin/AdminLayoutContext";
import { Button } from "@/components/ui/button";
import { SearchBar, PaginateControls } from "@/components/admin/table";
import { ManualSubClauseFormDialog, ManualSubClauseDeleteDialog } from "@/components/admin/Manual";
import { manualSubClauses } from "@/mocks/manualSubClauses";
import { manualClauses } from "@/mocks/manualClauses";
import { Eye, FilePen, Plus, Trash2, ChevronRight } from "lucide-react";

const PER_PAGE_OPTIONS = [10, 20, 50];

export default function SubKlausa() {
  const { clauseId } = useParams();
  const navigate = useNavigate();
  const { setHeader } = useAdminLayout();

  // Get parent clause data
  const parentClause = useMemo(
    () => manualClauses.find((c) => c.id === Number(clauseId)),
    [clauseId]
  );

  // State management
  const [subClauses, setSubClauses] = useState(() =>
    manualSubClauses.filter((sc) => sc.parentId === Number(clauseId))
  );
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedSubClause, setSelectedSubClause] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setHeader({
      title: "Checklist Manual",
      subtitle: "Kelola dokumen dan pertanyaan",
      user: {
        name: "Admin User",
        role: "Administrator",
        urlDetail: "/admin/profil",
      },
    });
  }, [setHeader]);

  const filteredSubClauses = useMemo(() => {
    return subClauses.filter(
      (subClause) =>
        subClause.judul.toLowerCase().includes(search.toLowerCase()) ||
        subClause.nomor.toLowerCase().includes(search.toLowerCase())
    );
  }, [subClauses, search]);

  const totalPages = Math.max(1, Math.ceil(filteredSubClauses.length / perPage));
  const pagedSubClauses = useMemo(() => {
    const start = (activePage - 1) * perPage;
    return filteredSubClauses.slice(start, start + perPage);
  }, [filteredSubClauses, activePage, perPage]);

  const handleSave = (payload) => {
    if (formMode === "edit" && selectedSubClause) {
      setSubClauses((prev) =>
        prev.map((subClause) =>
          subClause.id === selectedSubClause.id
            ? { ...subClause, ...payload }
            : subClause
        )
      );
    } else {
      const nextId =
        Math.max(0, ...subClauses.map((sc) => sc.id), ...manualSubClauses.map((sc) => sc.id)) + 1;
      setSubClauses((prev) => [
        ...prev,
        {
          ...payload,
          id: nextId,
          parentId: Number(clauseId),
          breadcrumb: [parentClause?.judul, payload.judul],
        },
      ]);
    }
  };

  if (!parentClause) {
    return (
      <div className="rounded-xl border border-dashed border-gray-medium bg-white p-6 text-center text-gray-dark">
        Klausa tidak ditemukan
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-300">
        <button
          className="px-6 py-3 font-medium transition-colors body-medium relative text-navy"
        >
          Daftar Klausa
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />
        </button>
        <button
          onClick={() => navigate(`/admin/manual/klausa/${clauseId}/pertanyaan`)}
          className="px-6 py-3 font-medium transition-colors body-medium relative text-gray-dark hover:text-navy"
        >
          Pertanyaan Manual
        </button>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 body text-gray-dark">
        <button
          onClick={() => navigate("/admin/manual/klausa")}
          className="text-[#2B7FFF] hover:underline"
        >
          Klausa Manual
        </button>
        <ChevronRight className="h-4 w-4 text-gray-dark" />
        <span className="text-[#2B7FFF] font-medium">Daftar Sub Klausa</span>
      </nav>

      {/* Page Title */}
      <div>
        <h2 className="heading-2 text-navy mb-3">Daftar Sub Klausa</h2>
        <div className="flex items-start gap-12">
          <div>
            <p className="small text-gray-dark mb-1">Klausa Utama</p>
            <p className="body-medium text-[#2B7FFF]">
              {parentClause.nomor}. {parentClause.judul}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Add Button */}
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
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

        <Button
          type="button"
          className="flex h-14 items-center gap-2 self-start rounded-lg bg-navy px-4 text-white hover:bg-navy/90 lg:self-auto"
          onClick={() => {
            setSelectedSubClause(null);
            setFormMode("create");
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Tambah Sub Klausa
        </Button>
      </div>

      {/* Sub Clauses List */}
      <div className="space-y-3">
        {pagedSubClauses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-medium bg-white p-6 text-center text-gray-dark">
            Tidak ada sub klausa yang sesuai.
          </div>
        ) : (
          pagedSubClauses.map((subClause) => (
            <div
              key={subClause.id}
              className="rounded-md border border-gray-medium bg-white shadow-sm"
            >
              {/* Breadcrumb inside card */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-2 small text-gray-dark">
                <span>{parentClause.nomor}. {parentClause.judul}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-dark">{subClause.judul}</span>
              </div>

              {/* Main content */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-medium">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-12 items-center justify-center rounded-sm bg-navy px-3 text-sm font-semibold text-white">
                    {subClause.nomor}
                  </span>
                  <span className="body-medium text-navy">{subClause.judul}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" title="Lihat">
                    <Eye className="h-5 w-5 text-navy hover:cursor-pointer" />
                  </button>
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => {
                      setSelectedSubClause(subClause);
                      setFormMode("edit");
                      setIsFormOpen(true);
                    }}
                  >
                    <FilePen className="h-5 w-5 text-blue hover:cursor-pointer" />
                  </button>
                  <button
                    type="button"
                    title="Hapus"
                    onClick={() => {
                      setSelectedSubClause(subClause);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-5 w-5 text-red hover:cursor-pointer" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <PaginateControls
        perPage={perPage}
        onPaginateChange={(value) => {
          setPerPage(Number(value));
          setActivePage(1);
        }}
        paginateValue={PER_PAGE_OPTIONS}
        activePage={activePage}
        onPageChange={setActivePage}
        totalPages={totalPages}
        totalData={filteredSubClauses.length}
      />

      {/* Form Dialog */}
      <ManualSubClauseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        parentTitle={`${parentClause.nomor}. ${parentClause.judul}`}
        initialData={selectedSubClause ?? undefined}
        onSubmit={handleSave}
      />

      {/* Delete Dialog */}
      <ManualSubClauseDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        clauseNumber={selectedSubClause?.nomor ?? ""}
        onConfirm={() => {
          if (!selectedSubClause) return;
          setSubClauses((prev) =>
            prev.filter((subClause) => subClause.id !== selectedSubClause.id)
          );
          setSelectedSubClause(null);
        }}
      />
    </section>
  );
}
