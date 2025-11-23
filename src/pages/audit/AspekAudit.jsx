import { useState, useMemo, useCallback } from "react";
import { aspekAuditData, checklistData } from "@/mocks/tableData";
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

function useAspekManagement() {
  const [aspekList, setAspekList] = useState(aspekAuditData);
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [selectedChecklist, setSelectedChecklist] = useState("Semua Checklist");
  const [isChecklistDropdownOpen, setIsChecklistDropdownOpen] = useState(false);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAspek, setSelectedAspek] = useState(null);

  // Get unique checklists for filter
  const checklistOptions = useMemo(() => {
    const options = [{ value: "Semua Checklist" }];
    checklistData.forEach((checklist) => {
      options.push({ value: checklist.title });
    });
    return options;
  }, []);

  const filteredData = useMemo(() => {
    let filtered = aspekList;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by checklist
    if (selectedChecklist !== "Semua Checklist") {
      const checklistId =
        checklistData.findIndex((c) => c.title === selectedChecklist) + 1;
      filtered = filtered.filter((item) => item.checklistId === checklistId);
    }

    return filtered;
  }, [aspekList, searchQuery, selectedChecklist]);

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

  const handleAddAspek = useCallback(
    (formData) => {
      const newAspek = {
        id: Math.max(...aspekList.map((a) => a.id), 0) + 1,
        name: formData.name,
        description: formData.description || "Description for this aspek",
        checklistId: 1,
      };
      setAspekList((prev) => [newAspek, ...prev]);
    },
    [aspekList]
  );

  const handleEditAspek = useCallback(
    (formData) => {
      setAspekList((prev) =>
        prev.map((item) =>
          item.id === selectedAspek.id
            ? {
                ...item,
                name: formData.name,
                description: formData.description,
              }
            : item
        )
      );
      setEditDialogOpen(false);
      setSelectedAspek(null);
    },
    [selectedAspek]
  );

  const handleDeleteAspek = useCallback(() => {
    setAspekList((prev) => prev.filter((item) => item.id !== selectedAspek.id));
    setDeleteDialogOpen(false);
    setSelectedAspek(null);
  }, [selectedAspek]);

  const openEditDialog = useCallback((aspek) => {
    setSelectedAspek(aspek);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((aspek) => {
    setSelectedAspek(aspek);
    setDeleteDialogOpen(true);
  }, []);

  const getChecklistName = useCallback((checklistId) => {
    const checklist = checklistData.find(
      (c, index) => index + 1 === checklistId
    );
    return checklist ? checklist.title : null;
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
    handleAddAspek,
    handleEditAspek,
    handleDeleteAspek,
    openEditDialog,
    openDeleteDialog,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedAspek,
    selectedChecklist,
    setSelectedChecklist,
    checklistOptions,
    isChecklistDropdownOpen,
    setIsChecklistDropdownOpen,
    getChecklistName,
  };
}

export default function AspekAudit() {
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
    handleAddAspek,
    handleEditAspek,
    handleDeleteAspek,
    openEditDialog,
    openDeleteDialog,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedAspek,
    selectedChecklist,
    setSelectedChecklist,
    checklistOptions,
    isChecklistDropdownOpen,
    setIsChecklistDropdownOpen,
    getChecklistName,
  } = useAspekManagement();

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

        <AspekDialog mode="add" onSave={handleAddAspek} />
      </div>

      <div className="space-y-3">
        {pagedData.length === 0 ? (
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
          activePage={currentPage}
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
        />
      )}
    </div>
  );
}
