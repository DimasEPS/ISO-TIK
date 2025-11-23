import { useState, useMemo, useCallback } from "react";
import { useAuditAspects } from "./hooks/useAuditAspects";
import { useAuditChecklists } from "./hooks/useAuditChecklists";
import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AspekCard } from "@/components/admin/audit/AspekCard";
import {
  AspekDialog,
  DeleteAspekDialog,
} from "@/components/admin/audit/AspekDialog";
import { PaginateControls } from "@/components/admin/table/PaginateControls";
import { StatusDropdown } from "@/components/admin/table/StatusDropdown";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

export default function AspekAudit() {
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAspek, setSelectedAspek] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState("Semua Checklist");
  const [isChecklistDropdownOpen, setIsChecklistDropdownOpen] = useState(false);

  // Fetch checklists untuk dropdown filter
  const { pagedData: checklists } = useAuditChecklists();

  // Get checklist ID dari selected checklist name
  const selectedChecklistId = useMemo(() => {
    if (selectedChecklist === "Semua Checklist") return null;
    const checklist = checklists.find((c) => c.title === selectedChecklist);
    return checklist?.id || null;
  }, [selectedChecklist, checklists]);

  // Use aspects hook dengan filter checklist
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
    createAspect,
    updateAspect,
    deleteAspect,
    isCreating,
    isUpdating,
    isDeleting,
    setSelectedChecklistId: setChecklistFilter,
  } = useAuditAspects();

  // Update filter when selectedChecklistId changes
  useMemo(() => {
    setChecklistFilter(selectedChecklistId);
  }, [selectedChecklistId, setChecklistFilter]);

  // Build checklist options for dropdown
  const checklistOptions = useMemo(() => {
    const options = [{ value: "Semua Checklist" }];
    checklists.forEach((checklist) => {
      options.push({ value: checklist.title });
    });
    return options;
  }, [checklists]);

  const handleAddAspek = useCallback(
    async (payload) => {
      await createAspect(payload);
    },
    [createAspect]
  );

  const handleEditAspek = useCallback(
    async (payload) => {
      await updateAspect({ aspectId: selectedAspek.id, payload });
      setEditDialogOpen(false);
      setSelectedAspek(null);
    },
    [selectedAspek, updateAspect]
  );

  const handleDeleteAspek = useCallback(async () => {
    await deleteAspect(selectedAspek.id);
    setDeleteDialogOpen(false);
    setSelectedAspek(null);
  }, [selectedAspek, deleteAspect]);

  const openEditDialog = useCallback((aspek) => {
    setSelectedAspek(aspek);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((aspek) => {
    setSelectedAspek(aspek);
    setDeleteDialogOpen(true);
  }, []);

  const getChecklistName = useCallback(
    (checklistId) => {
      const checklist = checklists.find((c) => c.id === checklistId);
      return checklist ? checklist.title : null;
    },
    [checklists]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <InputGroup className="h-14 max-w-[680px]">
          <InputGroupInput
            placeholder="Cari aspek berdasarkan nama"
            className="bg-state text-navy placeholder:text-gray-dark"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <StatusDropdown
          isMenuOpen={isChecklistDropdownOpen}
          setIsMenuOpen={setIsChecklistDropdownOpen}
          value={selectedChecklist}
          onChange={setSelectedChecklist}
          options={checklistOptions}
          classNameButton="w-[280px]! h-14!"
          classNameDropdown="w-[280px]!"
          showFunnelIcon={true}
        />

        <AspekDialog
          mode="add"
          onSave={handleAddAspek}
          isSubmitting={isCreating}
          checklistId={selectedChecklistId || checklists[0]?.id}
          checklists={checklists}
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">Memuat data aspek audit...</p>
          </div>
        ) : pagedData.length === 0 ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">Tidak ada aspek audit ditemukan</p>
          </div>
        ) : (
          pagedData.map((aspek) => (
            <AspekCard
              key={aspek.id}
              aspek={aspek}
              checklistName={getChecklistName(aspek.checklistId)}
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

      {/* Edit Dialog */}
      {selectedAspek && (
        <AspekDialog
          key={`edit-${selectedAspek.id}`}
          mode="edit"
          aspek={selectedAspek}
          onSave={handleEditAspek}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          isSubmitting={isUpdating}
          checklistId={selectedAspek.checklistId}
          checklists={checklists}
        />
      )}

      {/* Delete Dialog */}
      {selectedAspek && (
        <DeleteAspekDialog
          key={`delete-${selectedAspek.id}`}
          aspek={selectedAspek}
          onDelete={handleDeleteAspek}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
