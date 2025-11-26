import { useState, useCallback } from "react";
import { useAuditChecklists } from "./hooks/useAuditChecklists";
import { SearchBar, PaginateControls } from "@/components/admin/table";
import { ChecklistCard } from "@/components/admin/audit/ChecklistCard";
import {
  ChecklistDialog,
  DeleteChecklistDialog,
} from "@/components/admin/audit/ChecklistDialog";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

export default function ChecklistAudit() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  // Use the real API hook
  const {
    pagedData,
    isLoading,
    searchQuery,
    setSearchQuery,
    perPage,
    activePage,
    setActivePage,
    totalPages,
    totalData,
    handlePaginateChange,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAuditChecklists();

  const handleAddChecklist = useCallback(
    async (formData) => {
      await createChecklist(formData);
    },
    [createChecklist]
  );

  const handleEditChecklist = useCallback(
    async (formData) => {
      await updateChecklist({
        checklistId: selectedChecklist.id,
        payload: formData,
      });
      setEditDialogOpen(false);
      setSelectedChecklist(null);
    },
    [selectedChecklist, updateChecklist]
  );

  const handleDeleteChecklist = useCallback(async () => {
    await deleteChecklist(selectedChecklist.id);
    setDeleteDialogOpen(false);
    setSelectedChecklist(null);
  }, [selectedChecklist, deleteChecklist]);

  const openEditDialog = useCallback((checklist) => {
    setSelectedChecklist(checklist);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((checklist) => {
    setSelectedChecklist(checklist);
    setDeleteDialogOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          className="w-[1082px]"
          placeholder="Cari checklist berdasarkan nama"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <ChecklistDialog
          mode="add"
          onSave={handleAddChecklist}
          isSubmitting={isCreating}
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">Memuat data checklist...</p>
          </div>
        ) : pagedData.length === 0 ? (
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
          activePage={activePage}
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
          isSubmitting={isUpdating}
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
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
