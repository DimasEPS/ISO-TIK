import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLayoutTemplate } from "@/layouts";
import { Button } from "@/components/ui/button";
import { PaginateControls } from "@/components/admin/table";
import { ManualQuestionFormDialog, ManualQuestionDeleteDialog } from "@/components/admin/Manual";
import { manualQuestions } from "@/mocks/manualQuestions";
import { manualSubClauses } from "@/mocks/manualSubClauses";
import { manualClauses } from "@/mocks/manualClauses";
import { FilePen, Plus, Trash2, ChevronRight } from "lucide-react";

const PER_PAGE_OPTIONS = [10, 20, 50];

export default function PertanyaanManual() {
  const { clauseId } = useParams();
  const navigate = useNavigate();
  const { setTemplate } = useLayoutTemplate();

  // Get parent clause data
  const parentClause = useMemo(
    () => manualClauses.find((c) => c.id === Number(clauseId)),
    [clauseId]
  );

  // Get sub clauses for this parent
  const subClausesForParent = useMemo(
    () => manualSubClauses.filter((sc) => sc.parentId === Number(clauseId)),
    [clauseId]
  );

  // State management
  const [questions, setQuestions] = useState(() =>
    manualQuestions.filter((q) =>
      subClausesForParent.some((sc) => sc.id === q.subClauseId)
    )
  );
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setTemplate({
      title: "Checklist Manual",
      subtitle: "Kelola dokumen dan pertanyaan",
      user: {
        name: "Admin User",
        role: "Administrator",
        urlDetail: "/admin/profil",
      },
    });
  }, [setTemplate]);

  const totalPages = Math.max(1, Math.ceil(questions.length / perPage));
  const pagedQuestions = useMemo(() => {
    const start = (activePage - 1) * perPage;
    return questions.slice(start, start + perPage);
  }, [questions, activePage, perPage]);

  const handleSave = (payload) => {
    if (formMode === "edit" && selectedQuestion) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === selectedQuestion.id ? { ...q, ...payload } : q
        )
      );
    } else {
      const nextId = Math.max(0, ...questions.map((q) => q.id), ...manualQuestions.map((q) => q.id)) + 1;
      setQuestions((prev) => [
        ...prev,
        {
          ...payload,
          id: nextId,
          subClauseId: subClausesForParent[0]?.id || 0,
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
          onClick={() => navigate(`/admin/manual/klausa/${clauseId}/sub`)}
          className="px-6 py-3 font-medium transition-colors body-medium relative text-gray-dark hover:text-navy"
        >
          Daftar Klausa
        </button>
        <button
          className="px-6 py-3 font-medium transition-colors body-medium relative text-navy"
        >
          Pertanyaan Manual
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />
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
        <span className="text-[#2B7FFF] font-medium">Pertanyaan Klausa</span>
      </nav>

      {/* Page Title */}
      <div>
        <h2 className="heading-2 text-navy mb-3">Pertanyaan Klausa</h2>
        <div className="flex items-start gap-12">
          <div>
            <p className="small text-gray-dark mb-1">Klausa Utama</p>
            <p className="body font-medium text-[#2B7FFF]">
              {parentClause.nomor}. {parentClause.judul}
            </p>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          className="flex h-14 items-center gap-2 rounded-lg bg-navy px-4 text-white hover:bg-navy/90"
          onClick={() => {
            setSelectedQuestion(null);
            setFormMode("create");
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Tambah Pertanyaan
        </Button>
      </div>

      {/* Questions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {pagedQuestions.length === 0 ? (
          <div className="col-span-2 rounded-xl border border-dashed border-gray-medium bg-white p-6 text-center text-gray-dark">
            Tidak ada pertanyaan yang tersedia.
          </div>
        ) : (
          pagedQuestions.map((question) => (
            <div
              key={question.id}
              className="rounded-md border border-gray-medium bg-white p-4 shadow-sm space-y-3"
            >
              <div>
                <p className="small text-gray-dark mb-1">Pertanyaan:</p>
                <p className="body text-navy">{question.pertanyaan}</p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Panduan Bukti Objektif</p>
                <p className="body text-navy">{question.panduanBuktiObjektif}</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  title="Edit"
                  onClick={() => {
                    setSelectedQuestion(question);
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
                    setSelectedQuestion(question);
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
        totalData={questions.length}
      />

      {/* Form Dialog */}
      <ManualQuestionFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        initialData={selectedQuestion ?? undefined}
        onSubmit={handleSave}
      />

      {/* Delete Dialog */}
      <ManualQuestionDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        questionPreview={selectedQuestion?.pertanyaan ?? ""}
        onConfirm={() => {
          if (!selectedQuestion) return;
          setQuestions((prev) => prev.filter((q) => q.id !== selectedQuestion.id));
          setSelectedQuestion(null);
        }}
      />
    </section>
  );
}
