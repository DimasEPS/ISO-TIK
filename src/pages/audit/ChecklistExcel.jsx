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
import { checklistData } from "@/mocks/tableData";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

function ChecklistExcelCard({ checklist, onView, onEdit, onDelete }) {
  return (
    <div className="border-l-4 border-navy bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-navy font-semibold text-lg mb-2">
            {checklist.title}
          </h3>
          <p className="text-gray-dark text-sm leading-relaxed mb-3">
            {checklist.description}
          </p>
          <div className="inline-block">
            <span className="text-xs bg-state text-navy px-3 py-1 rounded">
              Checklist Audit: {checklist.title}
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onView(checklist)}
            className="hover:bg-gray-100 p-2 rounded transition-colors"
            title="Lihat detail"
          >
            <Eye className="text-[#121A2E] w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(checklist)}
            className="hover:bg-blue-50 p-2 rounded transition-colors"
            title="Edit checklist"
          >
            <FilePen className="text-[#2B7FFF] w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(checklist)}
            className="hover:bg-red-50 p-2 rounded transition-colors"
            title="Hapus checklist"
          >
            <Trash2 className="text-[#FB2C36] w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function useChecklistManagement() {
  const navigate = useNavigate();
  const [checklistList, setChecklistList] = useState(checklistData);
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("Semua Checklist");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const filterOptions = useMemo(() => {
    return [{ value: "Semua Checklist" }];
  }, []);

  const filteredData = useMemo(() => {
    let filtered = checklistList;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [checklistList, searchQuery]);

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

  const handleAddChecklist = useCallback(
    (formData) => {
      const newChecklist = {
        id: Math.max(...checklistList.map((c) => c.id), 0) + 1,
        title: formData.name || formData.checklistTitle,
        description: formData.description,
        checklistId: formData.checklistId,
      };
      setChecklistList((prev) => [newChecklist, ...prev]);
    },
    [checklistList]
  );

  const handleEditChecklist = useCallback(
    (formData) => {
      setChecklistList((prev) =>
        prev.map((item) =>
          item.id === selectedChecklist.id
            ? {
                ...item,
                title: formData.name || item.title,
                description: formData.description,
                checklistId: formData.checklistId,
              }
            : item
        )
      );
      setEditDialogOpen(false);
      setSelectedChecklist(null);
    },
    [selectedChecklist]
  );

  const handleDeleteChecklist = useCallback(() => {
    setChecklistList((prev) =>
      prev.filter((item) => item.id !== selectedChecklist.id)
    );
    setDeleteDialogOpen(false);
    setSelectedChecklist(null);
  }, [selectedChecklist]);

  const handleView = useCallback(
    (checklist) => {
      navigate(`/admin/audit/checklist-excel/${checklist.id}/item`, {
        state: {
          checklistAuditName: checklist.title,
          checklistExcelName: checklist.title,
        },
      });
    },
    [navigate]
  );

  const openEditDialog = useCallback((checklist) => {
    setSelectedChecklist(checklist);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((checklist) => {
    setSelectedChecklist(checklist);
    setDeleteDialogOpen(true);
  }, []);

  return {
    pagedData,
    searchQuery,
    setSearchQuery,
    perPage,
    currentPage,
    setActivePage,
    totalData,
    totalPages,
    handlePaginateChange,
    handleAddChecklist,
    handleEditChecklist,
    handleDeleteChecklist,
    handleView,
    openEditDialog,
    openDeleteDialog,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedChecklist,
    selectedFilter,
    setSelectedFilter,
    filterOptions,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
  };
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

  const {
    pagedData,
    searchQuery,
    setSearchQuery,
    perPage,
    currentPage,
    setActivePage,
    totalData,
    totalPages,
    handlePaginateChange,
    handleAddChecklist,
    handleEditChecklist,
    handleDeleteChecklist,
    handleView,
    openEditDialog,
    openDeleteDialog,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedChecklist,
    selectedFilter,
    setSelectedFilter,
    filterOptions,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
  } = useChecklistManagement();

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
          onChange={setSelectedFilter}
          options={filterOptions}
          classNameButton="w-[280px]! h-14!"
          classNameDropdown="w-[280px]!"
          showFunnelIcon={true}
        />

        <ChecklistExcelDialog mode="add" onSave={handleAddChecklist} />
      </div>

      <div className="space-y-3">
        {pagedData.length === 0 ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">Tidak ada checklist excel ditemukan</p>
          </div>
        ) : (
          pagedData.map((checklist) => (
            <ChecklistExcelCard
              key={checklist.id}
              checklist={checklist}
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
      {selectedChecklist && (
        <ChecklistExcelDialog
          key={`edit-${selectedChecklist.id}`}
          mode="edit"
          checklist={selectedChecklist}
          onSave={handleEditChecklist}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Delete Dialog */}
      {selectedChecklist && (
        <DeleteChecklistExcelDialog
          key={`delete-${selectedChecklist.id}`}
          checklist={selectedChecklist}
          onDelete={handleDeleteChecklist}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </div>
  );
}
