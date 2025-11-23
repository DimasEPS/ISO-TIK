import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBar, PaginateControls } from "@/components/admin/table";
import { ManualClauseFormDialog, ManualClauseDeleteDialog } from "@/components/admin/Manual";
import { manualClauses } from "@/mocks/manualClauses";
import { Eye, FilePen, Plus, Trash2 } from "lucide-react";

const PER_PAGE_OPTIONS = [10, 20, 50];

export default function KlausaManual() {
  const navigate = useNavigate();
  const [clauses, setClauses] = useState(manualClauses);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedClause, setSelectedClause] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const filteredClauses = useMemo(() => {
    return clauses.filter((clause) =>
      clause.judul.toLowerCase().includes(search.toLowerCase()) ||
      clause.nomor.toLowerCase().includes(search.toLowerCase())
    );
  }, [clauses, search]);

  const totalPages = Math.max(1, Math.ceil(filteredClauses.length / perPage));
  const pagedClauses = useMemo(() => {
    const start = (activePage - 1) * perPage;
    return filteredClauses.slice(start, start + perPage);
  }, [filteredClauses, activePage, perPage]);

  const handleSave = (payload) => {
    if (formMode === "edit" && selectedClause) {
      setClauses((prev) =>
        prev.map((clause) =>
          clause.id === selectedClause.id ? { ...clause, ...payload } : clause
        )
      );
    } else {
      const nextId = Math.max(0, ...clauses.map((c) => c.id)) + 1;
      setClauses((prev) => [...prev, { ...payload, id: nextId }]);
    }
  };

  return (
    <section className="space-y-6">
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
          className="flex h-14 items-center gap-2 self-start rounded-[4px] bg-navy px-4 text-white hover:bg-navy/90 lg:self-auto"
          onClick={() => {
            setSelectedClause(null);
            setFormMode("create");
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Tambah Klausa
        </Button>
      </div>

      <div className="space-y-3">
        {pagedClauses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-medium bg-white p-6 text-center text-gray-dark">
            Tidak ada klausa yang sesuai.
          </div>
        ) : (
          pagedClauses.map((clause) => (
            <div
              key={clause.id}
              className="flex items-center justify-between rounded-md border border-gray-medium bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="inline-flex h-8 min-w-12 items-center justify-center rounded-sm bg-navy px-3 text-sm font-semibold text-white">
                  {clause.nomor}
                </span>
                <span className="body-medium text-navy">{clause.judul}</span>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" title="Lihat">
                  <Eye
                    className="h-5 w-5 text-navy hover:cursor-pointer"
                    onClick={() => navigate(`/admin/manual/klausa/${clause.id}/sub`)}
                  />
                </button>
                <button
                  type="button"
                  title="Edit"
                  onClick={() => {
                    setSelectedClause(clause);
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
                    setSelectedClause(clause);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-5 w-5 text-red hover:cursor-pointer" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
        totalData={filteredClauses.length}
      />

      <ManualClauseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        initialData={selectedClause ?? undefined}
        onSubmit={handleSave}
      />

      <ManualClauseDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        clauseNumber={selectedClause?.nomor ?? ""}
        onConfirm={() => {
          if (!selectedClause) return;
          setClauses((prev) => prev.filter((clause) => clause.id !== selectedClause.id));
          setSelectedClause(null);
        }}
      />
    </section>
  );
}
