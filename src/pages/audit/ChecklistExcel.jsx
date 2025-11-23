import { useState, useMemo, useCallback } from "react";
import { SearchIcon, Eye, FilePen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PaginateControls } from "@/components/admin/table/PaginateControls";
import { StatusDropdown } from "@/components/admin/table/StatusDropdown";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import {
  ChecklistExcelDialog,
  DeleteChecklistExcelDialog,
} from "@/components/admin/audit/ChecklistExcelDialog";
import { useAuditExcelChecklists } from "./hooks/useAuditExcelChecklists";
import { useAuditChecklists } from "./hooks/useAuditChecklists";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

function ChecklistExcelCard({ excelChecklist, onView, onEdit, onDelete }) {
  return (
    <div className="border-l-4 border-navy bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-navy font-semibold text-lg mb-2">
            {excelChecklist.name}
          </h3>
          <p className="text-gray-dark text-sm leading-relaxed mb-3">
            {excelChecklist.description}
          </p>
          <div className="inline-block">
            <span className="text-xs bg-state text-navy px-3 py-1 rounded">
              Checklist Audit: {excelChecklist.checklistName || "N/A"}
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onView(excelChecklist)}
            className="hover:bg-gray-100 p-2 rounded transition-colors"
            title="Lihat detail"
          >
            <Eye className="text-[#121A2E] w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(excelChecklist)}
            className="hover:bg-blue-50 p-2 rounded transition-colors"
            title="Edit checklist excel"
          >
            <FilePen className="text-[#2B7FFF] w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(excelChecklist)}
            className="hover:bg-red-50 p-2 rounded transition-colors"
            title="Hapus checklist excel"
          >
            <Trash2 className="text-[#FB2C36] w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistExcel() {
  usePageTemplate({
    title: "Detail Checklist Audit",
    subtitle: "Kelola dokumen, checklist, aspek, pertanyaan audit",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });

  const navigate = useNavigate();

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExcelChecklist, setSelectedExcelChecklist] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Semua Checklist");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Use audit checklists hook untuk data checklist (dropdown)
  const { pagedData: checklists, isLoading: isLoadingChecklists } =
    useAuditChecklists({
      initialPerPage: 100, // Load all for dropdown
    });

  // Use audit excel checklists hook
  const {
    excelChecklists,
    isLoading,
    currentPage,
    totalPages,
    totalData,
    perPage,
    setActivePage,
    handlePaginateChange,
    searchQuery,
    setSearchQuery,
    setSelectedChecklistId,
    createExcelChecklist,
    updateExcelChecklist,
    deleteExcelChecklist,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAuditExcelChecklists({
    initialPerPage: 10,
  });

  // Filter options untuk dropdown
  const filterOptions = useMemo(() => {
    const options = [{ value: "Semua Checklist" }];
    if (checklists && Array.isArray(checklists)) {
      checklists.forEach((checklist) => {
        options.push({ value: checklist.title });
      });
    }
    return options;
  }, [checklists]);

  // Handler untuk add excel checklist
  const handleAddExcelChecklist = useCallback(
    async (payload) => {
      await createExcelChecklist(payload);
    },
    [createExcelChecklist]
  );

  // Handler untuk edit excel checklist
  const handleEditExcelChecklist = useCallback(
    async (payload) => {
      await updateExcelChecklist({
        excelChecklistId: selectedExcelChecklist.id,
        payload,
      });
      setEditDialogOpen(false);
      setSelectedExcelChecklist(null);
    },
    [selectedExcelChecklist, updateExcelChecklist]
  );

  // Handler untuk delete excel checklist
  const handleDeleteExcelChecklist = useCallback(async () => {
    await deleteExcelChecklist(selectedExcelChecklist.id);
    setDeleteDialogOpen(false);
    setSelectedExcelChecklist(null);
  }, [selectedExcelChecklist, deleteExcelChecklist]);

  // Handler untuk view detail
  const handleView = useCallback(
    (excelChecklist) => {
      navigate(`/admin/audit/checklist-excel/${excelChecklist.id}/item`, {
        state: {
          checklistAuditName: excelChecklist.checklistName,
          checklistExcelName: excelChecklist.name,
        },
      });
    },
    [navigate]
  );

  // Handler untuk open edit dialog
  const openEditDialog = useCallback((excelChecklist) => {
    setSelectedExcelChecklist(excelChecklist);
    setEditDialogOpen(true);
  }, []);

  // Handler untuk open delete dialog
  const openDeleteDialog = useCallback((excelChecklist) => {
    setSelectedExcelChecklist(excelChecklist);
    setDeleteDialogOpen(true);
  }, []);

  // Handler untuk filter change
  const handleFilterChange = useCallback(
    (value) => {
      setSelectedFilter(value);
      if (value === "Semua Checklist") {
        setSelectedChecklistId("");
      } else if (checklists && Array.isArray(checklists)) {
        const checklist = checklists.find((c) => c.title === value);
        if (checklist) {
          setSelectedChecklistId(checklist.id);
        }
      }
    },
    [checklists, setSelectedChecklistId]
  );

  const PAGINATE_OPTIONS = [10, 20, 50, 100];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <InputGroup className="h-14 max-w-[680px]">
          <InputGroupInput
            placeholder="Cari checklist excel berdasarkan nama"
            className="bg-state text-navy placeholder:text-gray-dark"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <StatusDropdown
          isMenuOpen={isFilterDropdownOpen}
          setIsMenuOpen={setIsFilterDropdownOpen}
          value={selectedFilter}
          onChange={handleFilterChange}
          options={filterOptions}
          classNameButton="w-[280px]! h-14!"
          classNameDropdown="w-[280px]!"
          showFunnelIcon={true}
        />

        <ChecklistExcelDialog
          mode="add"
          onSave={handleAddExcelChecklist}
          isSubmitting={isCreating}
          checklists={checklists || []}
        />
      </div>

      <div className="space-y-3">
        {isLoading || isLoadingChecklists ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">Memuat data...</p>
          </div>
        ) : excelChecklists.length === 0 ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">Tidak ada checklist excel ditemukan</p>
          </div>
        ) : (
          excelChecklists.map((excelChecklist) => (
            <ChecklistExcelCard
              key={excelChecklist.id}
              excelChecklist={excelChecklist}
              onView={handleView}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
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
      {selectedExcelChecklist && (
        <ChecklistExcelDialog
          key={`edit-${selectedExcelChecklist.id}`}
          mode="edit"
          excelChecklist={selectedExcelChecklist}
          onSave={handleEditExcelChecklist}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          isSubmitting={isUpdating}
          checklists={checklists || []}
        />
      )}

      {/* Delete Dialog */}
      {selectedExcelChecklist && (
        <DeleteChecklistExcelDialog
          key={`delete-${selectedExcelChecklist.id}`}
          excelChecklist={selectedExcelChecklist}
          onDelete={handleDeleteExcelChecklist}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
