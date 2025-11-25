import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { ChevronRight, SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  PertanyaanDialog,
  DeletePertanyaanDialog,
} from "@/components/admin/audit/PertanyaanDialog";
import { PertanyaanCard } from "@/components/admin/audit/PertanyaanCard";
import { PaginateControls } from "@/components/admin/table/PaginateControls";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { useAuditQuestions } from "./hooks/useAuditQuestions";
import { auditService } from "@/services/auditService";
import { useQuery } from "@tanstack/react-query";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

function Breadcrumb({ aspekName, kategoriName, aspekId }) {
  return (
    <nav className="flex items-center gap-2 body text-gray-dark">
      <Link to="/admin/audit/aspek" className="text-[#2B7FFF] hover:underline">
        Aspek Audit
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-dark" />
      <Link
        to={`/admin/audit/aspek/${aspekId}/kategori`}
        className="text-[#2B7FFF] hover:underline"
      >
        {aspekName || "Loading..."}
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-dark" />
      <span className="text-[#2B7FFF] font-medium">
        {kategoriName || "Pertanyaan Audit"}
      </span>
    </nav>
  );
}

function PertanyaanAudit() {
  usePageTemplate({
    title: "Detail Checklist Audit",
    subtitle: "Kelola dokumen, checklist, aspek, pertanyaan audit",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });

  const location = useLocation();
  const { aspekId, id: kategoriId } = useParams();

  // Get category detail untuk display
  const { data: categoryDetail, isLoading: isLoadingCategory } = useQuery({
    queryKey: ["audit-category", kategoriId],
    queryFn: () => auditService.getCategory(kategoriId),
    enabled: !!kategoriId,
  });

  const kategoriName =
    categoryDetail?.category_name ||
    location.state?.kategoriName ||
    "Loading...";
  const aspekName = location.state?.aspekName || "Loading...";
  const checklistName = location.state?.checklistName || "Loading...";

  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPertanyaan, setSelectedPertanyaan] = useState(null);

  // Use audit questions hook
  const {
    questions,
    isLoading,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    isCreating,
    isUpdating,
    isDeleting,
    refetch,
  } = useAuditQuestions(kategoriId);

  // Refetch when dialog closes after successful operation
  useEffect(() => {
    if (!isEditDialogOpen && !isDeleteDialogOpen) {
      refetch();
    }
  }, [isEditDialogOpen, isDeleteDialogOpen, refetch]);

  const filteredData = useMemo(() => {
    if (!questions || !Array.isArray(questions)) return [];
    if (!searchQuery) return questions;
    return questions.filter((item) =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, searchQuery]);

  const totalData = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const currentPage = Math.min(activePage, totalPages);

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    return filteredData.slice(startIndex, startIndex + perPage);
  }, [filteredData, currentPage, perPage]);

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
    setActivePage(1);
  }, []);

  const handleAddPertanyaan = async (formData) => {
    await createQuestion({
      text: formData.text,
      categoryId: kategoriId,
    });
  };

  const handleEdit = (pertanyaan) => {
    setSelectedPertanyaan(pertanyaan);
    setIsEditDialogOpen(true);
  };

  const handleEditPertanyaan = async (formData) => {
    await updateQuestion({
      id: selectedPertanyaan.id,
      text: formData.text,
    });
    setIsEditDialogOpen(false);
    setSelectedPertanyaan(null);
  };

  const handleDelete = (pertanyaan) => {
    setSelectedPertanyaan(pertanyaan);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteQuestion(selectedPertanyaan.id);
    setIsDeleteDialogOpen(false);
    setSelectedPertanyaan(null);
  };

  if (isLoadingCategory || isLoading) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          aspekName="Loading..."
          kategoriName="Loading..."
          aspekId={aspekId}
        />
        <div className="text-center py-12">
          <p className="text-gray-dark">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb
        aspekName={aspekName}
        kategoriName={kategoriName}
        aspekId={aspekId}
      />

      <div>
        <h2 className="text-2xl font-bold text-navy mb-3">Pertanyaan Audit</h2>
        <div className="flex items-start gap-12">
          <div>
            <p className="text-sm text-gray-600 mb-1">Checklist Audit:</p>
            <p className="text-[#2B7FFF] font-medium">{checklistName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Aspek Audit:</p>
            <p className="text-[#2B7FFF] font-medium">{aspekName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kategori Pertanyaan:</p>
            <p className="text-[#2B7FFF] font-medium">{kategoriName}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between">
        <InputGroup className="h-14 max-w-[1080px] flex-1">
          <InputGroupInput
            placeholder="Cari pertanyaan berdasarkan teks"
            className="bg-state text-navy placeholder:text-gray-dark"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <PertanyaanDialog
          mode="add"
          categoryId={kategoriId}
          onSave={handleAddPertanyaan}
          isSubmitting={isCreating}
        />
      </div>

      <div className="space-y-3">
        {currentPageData.length === 0 ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">
              {isLoading ? "Memuat data..." : "Tidak ada pertanyaan ditemukan"}
            </p>
          </div>
        ) : (
          currentPageData.map((pertanyaan) => (
            <PertanyaanCard
              key={pertanyaan.id}
              pertanyaan={pertanyaan}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {totalData > 0 && (
        <PaginateControls
          perPage={perPage}
          onPaginateChange={handlePaginateChange}
          paginateValue={PAGINATE_OPTIONS}
          setActivePage={setActivePage}
          activePage={currentPage}
          onPageChange={setActivePage}
          totalPages={totalPages}
          totalData={totalData}
        />
      )}

      {/* Edit Dialog */}
      {selectedPertanyaan && (
        <PertanyaanDialog
          key={`edit-${selectedPertanyaan.id}`}
          mode="edit"
          pertanyaan={selectedPertanyaan}
          categoryId={kategoriId}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditPertanyaan}
          isSubmitting={isUpdating}
        />
      )}

      {/* Delete Dialog */}
      <DeletePertanyaanDialog
        pertanyaan={selectedPertanyaan}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default PertanyaanAudit;
