import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { ChevronRight, SearchIcon, FilePen, Trash2 } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PaginateControls } from "@/components/admin/table/PaginateControls";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import {
  ItemAuditDialog,
  DeleteItemAuditDialog,
} from "@/components/admin/audit/ItemAuditDialog";
import { useExcelQuestions } from "./hooks/useExcelQuestions";
import { auditService } from "@/services/auditService";
import { useQuery } from "@tanstack/react-query";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

function ItemAuditCard({ item, onEdit, onDelete }) {
  return (
    <div className="border-l-4 border-navy bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-navy text-base leading-relaxed">
            {item.itemAudit}
          </p>
          {item.aspect && (
            <p className="text-sm text-gray-600">
              Aspek: <span className="font-medium">{item.aspect}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="hover:bg-blue-50 p-2 rounded transition-colors"
            title="Edit item"
          >
            <FilePen className="text-[#2B7FFF] w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="hover:bg-red-50 p-2 rounded transition-colors"
            title="Hapus item"
          >
            <Trash2 className="text-[#FB2C36] w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 body text-gray-dark">
      <Link
        to="/admin/audit/checklist-excel"
        className="text-[#2B7FFF] hover:underline"
      >
        Checklist Excel
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-dark" />
      <span className="text-[#2B7FFF] font-medium">Item Audit</span>
    </nav>
  );
}

export default function ItemAudit() {
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
  const { id: excelChecklistId } = useParams();

  // Get excel checklist detail untuk display
  const { data: excelChecklistDetail, isLoading: isLoadingExcelChecklist } =
    useQuery({
      queryKey: ["audit-excel-checklist", excelChecklistId],
      queryFn: () => auditService.getExcelChecklist(excelChecklistId),
      enabled: !!excelChecklistId,
    });

  const checklistExcelName =
    excelChecklistDetail?.excel_checklist_name ||
    location.state?.checklistExcelName ||
    "Loading...";
  const checklistAuditName = location.state?.checklistAuditName || "Loading...";

  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Use excel questions hook
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
  } = useExcelQuestions(excelChecklistId);

  // Refetch when dialog closes after successful operation
  useEffect(() => {
    if (!isEditDialogOpen && !isDeleteDialogOpen) {
      refetch();
    }
  }, [isEditDialogOpen, isDeleteDialogOpen, refetch]);

  const filteredData = useMemo(() => {
    if (!questions || !Array.isArray(questions)) return [];
    if (!searchQuery) return questions;
    return questions.filter(
      (item) =>
        item.itemAudit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.aspect &&
          item.aspect.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [questions, searchQuery]);

  const totalData = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const currentPage = Math.min(activePage, totalPages);

  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    return filteredData.slice(startIndex, startIndex + perPage);
  }, [filteredData, currentPage, perPage]);

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
    setActivePage(1);
  }, []);

  const handleAddItem = async (formData) => {
    await createQuestion({
      aspect: formData.aspect,
      itemAudit: formData.itemAudit,
      excelChecklistId: excelChecklistId,
    });
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditItem = async (formData) => {
    await updateQuestion({
      id: selectedItem.id,
      aspect: formData.aspect,
      itemAudit: formData.itemAudit,
    });
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteQuestion(selectedItem.id);
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  if (isLoadingExcelChecklist || isLoading) {
    return (
      <div className="space-y-4">
        <Breadcrumb />
        <div className="text-center py-12">
          <p className="text-gray-dark">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb />

      <div>
        <h2 className="text-2xl font-bold text-navy mb-3">Item Audit</h2>
        <div className="flex items-start gap-12">
          <div>
            <p className="text-sm text-gray-600 mb-1">Checklist Audit:</p>
            <p className="text-[#2B7FFF] font-medium">{checklistAuditName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Checklist Excel:</p>
            <p className="text-[#2B7FFF] font-medium">{checklistExcelName}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between">
        <InputGroup className="h-14 max-w-[1080px] flex-1">
          <InputGroupInput
            placeholder="Cari item audit"
            className="bg-state text-navy placeholder:text-gray-dark"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <ItemAuditDialog
          mode="add"
          excelChecklistId={excelChecklistId}
          onSave={handleAddItem}
          isSubmitting={isCreating}
        />
      </div>

      <div className="space-y-3">
        {pagedData.length === 0 ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">
              {isLoading ? "Memuat data..." : "Tidak ada item audit ditemukan"}
            </p>
          </div>
        ) : (
          pagedData.map((item) => (
            <ItemAuditCard
              key={item.id}
              item={item}
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
      {selectedItem && (
        <ItemAuditDialog
          key={`edit-${selectedItem.id}`}
          mode="edit"
          item={selectedItem}
          excelChecklistId={excelChecklistId}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditItem}
          isSubmitting={isUpdating}
        />
      )}

      {/* Delete Dialog */}
      <DeleteItemAuditDialog
        item={selectedItem}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
