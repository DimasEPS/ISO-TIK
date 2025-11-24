import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { KategoriCard } from "@/components/admin/audit/KategoriCard";
import {
  KategoriDialog,
  DeleteKategoriDialog,
} from "@/components/admin/audit/KategoriDialog";
import { PaginateControls } from "@/components/admin/table/PaginateControls";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { useAuditCategories } from "./hooks/useAuditCategories";
import { auditService } from "@/services/auditService";
import { useQuery } from "@tanstack/react-query";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

function Breadcrumb({ aspekName }) {
  return (
    <nav className="flex items-center gap-2 body text-gray-dark">
      <Link to="/admin/audit/aspek" className="text-[#2B7FFF] hover:underline">
        Aspek Audit
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-dark" />
      <span className="text-[#2B7FFF] font-medium">
        {aspekName || "Kategori Pertanyaan"}
      </span>
    </nav>
  );
}

export default function KategoriPertanyaan() {
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
  const { id: aspekId } = useParams();
  const navigate = useNavigate();

  // Get aspect detail untuk display
  const { data: aspectDetail, isLoading: isLoadingAspect } = useQuery({
    queryKey: ["audit-aspect", aspekId],
    queryFn: () => auditService.getAspect(aspekId),
    enabled: !!aspekId,
  });

  const aspekName =
    aspectDetail?.aspect_name || location.state?.aspekName || "Loading...";
  const checklistName = location.state?.checklistName || "Loading...";

  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState(null);

  // Use audit categories hook
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
    refetch,
  } = useAuditCategories(aspekId, {
    enabled: !!aspekId,
    initialSearch: searchQuery,
    initialPage: activePage,
    initialPerPage: perPage,
  });

  // Refetch when dialog closes after successful operation
  useEffect(() => {
    if (!isEditDialogOpen && !isDeleteDialogOpen) {
      refetch();
    }
  }, [isEditDialogOpen, isDeleteDialogOpen, refetch]);

  const filteredData = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    if (!searchQuery) return categories;
    return categories.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

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

  const handleAddKategori = async (formData) => {
    await createCategory({
      name: formData.name,
      aspectId: aspekId,
    });
  };

  const handleEdit = (kategori) => {
    setSelectedKategori(kategori);
    setIsEditDialogOpen(true);
  };

  const handleEditKategori = async (formData) => {
    await updateCategory({
      categoryId: selectedKategori.id,
      categoryData: {
        name: formData.name,
        aspectId: aspekId,
      },
    });
    setIsEditDialogOpen(false);
    setSelectedKategori(null);
  };

  const handleDelete = (kategori) => {
    setSelectedKategori(kategori);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteCategory(selectedKategori.id);
    setIsDeleteDialogOpen(false);
    setSelectedKategori(null);
  };

  const handleAddPertanyaan = (kategori) => {
    navigate(
      `/admin/audit/aspek/kategori/${aspekId}/pertanyaan/${kategori.id}`,
      {
        state: {
          kategoriName: kategori.name,
          checklistName,
          aspekName,
          aspekId,
        },
      }
    );
  };

  const handleViewPertanyaan = () => {
    // Navigate to pertanyaan detail page
  };

  if (isLoadingAspect || isLoading) {
    return (
      <div className="space-y-4">
        <Breadcrumb aspekName="Loading..." />
        <div className="text-center py-12">
          <p className="text-gray-dark">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb aspekName={aspekName} />

      <div>
        <h2 className="text-2xl font-bold text-navy mb-3">
          Kategori Pertanyaan
        </h2>
        <div className="flex items-start gap-12">
          <div>
            <p className="text-sm text-gray-600 mb-1">Checklist Audit:</p>
            <p className="text-[#2B7FFF] font-medium">{checklistName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Aspek Audit:</p>
            <p className="text-[#2B7FFF] font-medium">{aspekName}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between">
        <InputGroup className="h-14 max-w-[1080px] flex-1">
          <InputGroupInput
            placeholder="Cari kategori berdasarkan nama"
            className="bg-state text-navy placeholder:text-gray-dark"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <KategoriDialog
          mode="add"
          aspectId={aspekId}
          onSave={handleAddKategori}
          isSubmitting={isCreating}
        />
      </div>

      <div className="space-y-3">
        {currentPageData.length === 0 ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">
              {isLoading ? "Memuat data..." : "Tidak ada kategori ditemukan"}
            </p>
          </div>
        ) : (
          currentPageData.map((kategori) => (
            <KategoriCard
              key={kategori.id}
              kategori={kategori}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddPertanyaan={handleAddPertanyaan}
              onViewPertanyaan={handleViewPertanyaan}
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
      {selectedKategori && (
        <KategoriDialog
          key={`edit-${selectedKategori.id}`}
          mode="edit"
          kategori={selectedKategori}
          aspectId={aspekId}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditKategori}
          isSubmitting={isUpdating}
        />
      )}

      {/* Delete Dialog */}
      <DeleteKategoriDialog
        kategori={selectedKategori}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
