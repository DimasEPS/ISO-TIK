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
import { kategoriPertanyaanData } from "@/mocks/tableData";
import { usePageTemplate } from "@/hooks/usePageTemplate";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 body text-gray-dark">
      <Link to="/admin/audit/aspek" className="text-[#2B7FFF] hover:underline">
        Aspek Audit
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-dark" />
      <span className="text-[#2B7FFF] font-medium">Kategori Pertanyaan</span>
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

  const { checklistName, aspekName } = location.state || {
    checklistName: "Pencapaian Target Uptime 99,995%",
    aspekName: "Availability & Reliability",
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [kategoriList, setKategoriList] = useState([]);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState(null);

  // Load kategori data based on aspekId
  useEffect(() => {
    const filtered = kategoriPertanyaanData.filter(
      (item) => item.aspekId === parseInt(aspekId)
    );
    setKategoriList(filtered);
  }, [aspekId]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return kategoriList;
    return kategoriList.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [kategoriList, searchQuery]);

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

  const handleAddKategori = (formData) => {
    const newKategori = {
      id: kategoriList.length + 1,
      aspekId: parseInt(aspekId),
      name: formData.name,
      description: formData.description,
      pertanyaanCount: 0,
    };
    setKategoriList([...kategoriList, newKategori]);
  };

  const handleEdit = (kategori) => {
    setSelectedKategori(kategori);
    setIsEditDialogOpen(true);
  };

  const handleEditKategori = (formData) => {
    setKategoriList(
      kategoriList.map((k) =>
        k.id === selectedKategori.id
          ? { ...k, name: formData.name, description: formData.description }
          : k
      )
    );
    setIsEditDialogOpen(false);
    setSelectedKategori(null);
  };

  const handleDelete = (kategori) => {
    setSelectedKategori(kategori);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setKategoriList(kategoriList.filter((k) => k.id !== selectedKategori.id));
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

  const handleViewPertanyaan = (kategori) => {
    console.log("View pertanyaan for kategori:", kategori);
    // Navigate to pertanyaan detail page
  };

  return (
    <div className="space-y-4">
      <Breadcrumb />

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

        <KategoriDialog mode="add" onSave={handleAddKategori} />
      </div>

      <div className="space-y-3">
        {pagedData.length === 0 ? (
          <div className="text-center py-12 text-gray-dark">
            <p className="body">Tidak ada kategori ditemukan</p>
          </div>
        ) : (
          pagedData.map((kategori) => (
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
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditKategori}
        />
      )}

      {/* Delete Dialog */}
      <DeleteKategoriDialog
        kategori={selectedKategori}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
