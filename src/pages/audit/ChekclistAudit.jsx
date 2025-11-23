import { useState, useMemo, useCallback } from "react";
import { checklistData } from "@/mocks/tableData";
import { SearchBar, PaginateControls } from "@/components/admin/table";
import { ChecklistCard } from "@/components/admin/audit/ChecklistCard";
import {
  ChecklistDialog,
  DeleteChecklistDialog,
} from "@/components/admin/audit/ChecklistDialog";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

function useChecklistManagement() {
  const [checklists, setChecklists] = useState(checklistData);
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const filteredData = useMemo(() => {
    if (!searchQuery) return checklists;
    return checklists.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [checklists, searchQuery]);

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
        id: Math.max(...checklists.map((c) => c.id), 0) + 1,
        ...formData,
      };
      setChecklists((prev) => [newChecklist, ...prev]);
    },
    [checklists]
  );

  const handleEditChecklist = useCallback(
    (formData) => {
      setChecklists((prev) =>
        prev.map((item) =>
          item.id === selectedChecklist.id ? { ...item, ...formData } : item
        )
      );
      setEditDialogOpen(false);
      setSelectedChecklist(null);
    },
    [selectedChecklist]
  );

  const handleDeleteChecklist = useCallback(() => {
    setChecklists((prev) =>
      prev.filter((item) => item.id !== selectedChecklist.id)
    );
    setDeleteDialogOpen(false);
    setSelectedChecklist(null);
  }, [selectedChecklist]);

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
    openEditDialog,
    openDeleteDialog,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedChecklist,
  };
}

export default function ChecklistAudit() {
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
    openEditDialog,
    openDeleteDialog,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedChecklist,
  } = useChecklistManagement();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          placeholder="Cari checklist berdasarkan nama"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <ChecklistDialog mode="add" onSave={handleAddChecklist} />
      </div>

      <div className="space-y-4">
        {pagedData.length === 0 ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">Tidak ada checklist ditemukan</p>
          </div>
        ) : (
          pagedData.map((checklist) => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
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

      {/* Edit Dialog - Controlled externally */}
      {selectedChecklist && (
        <ChecklistDialog
          key={`edit-${selectedChecklist.id}`}
          mode="edit"
          checklist={selectedChecklist}
          onSave={handleEditChecklist}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Delete Dialog - Controlled externally */}
      {selectedChecklist && (
        <DeleteChecklistDialog
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
