import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { Button } from "@/components/ui/button";
import { SearchIcon, ChevronDown } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CaseCard, CaseDetailModal, CaseEditModal, CaseAddModal, CaseDeleteModal } from "./components/case";
import { PaginationControls } from "./components/common";
import { useCaseDocuments } from "./hooks/useNCRData";
import { casesMockData } from "./data/mockData";

export default function CaseListPage() {
  usePageTemplate({
    title: "Non Conformity Report (NCR)",
    subtitle: "Kelola dokumen dan kasus",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedCase, setSelectedCase] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    perPage,
    currentPage,
    setActivePage,
    pagedData,
    totalData,
    totalPages,
    handlePaginateChange,
  } = useCaseDocuments(casesMockData);

  // Mock data - in real app, fetch based on id
  const ncrDetail = {
    id: id,
    title: "NCR Dokumen 1",
    date: "27/4/2025",
    description:
      "To provide management direction and support for information security in accordance with business requirements and relevant laws and regulations.",
  };

  const handleViewDetail = (kasus) => {
    setSelectedCase(kasus);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (kasus) => {
    setSelectedCase(kasus);
    setIsEditModalOpen(true);
  };

  const handleDelete = (kasus) => {
    setSelectedCase(kasus);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = (updatedCase) => {
    // TODO: Implement save logic (API call)
    console.log("Saving case:", updatedCase);
    // In real app, you would update the data here
  };

  const handleConfirmDelete = (caseData) => {
    // TODO: Implement delete logic (API call)
    console.log("Deleting case:", caseData);
    // In real app, you would delete the data here
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCase(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCase(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCase(null);
  };

  const handleAddCase = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (newCase) => {
    // TODO: Implement add logic (API call)
    console.log("Adding new case:", newCase);
    // In real app, you would add the data here
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleDetailKasus = () => {
    handleCloseDetailModal();
    // Navigate to case detail page
    if (selectedCase) {
      navigate(`/admin/ncr/${id}/kasus/${selectedCase.id}`);
    }
  };

  const handleDaftarTemuan = () => {
    handleCloseDetailModal();
    // Navigate to findings list
    if (selectedCase) {
      navigate(`/admin/ncr/${id}/kasus/${selectedCase.id}/temuan`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate("/admin/ncr")}
          className="text-gray-dark hover:text-navy"
        >
          Dokumen NCR
        </button>
        <span className="text-gray-dark">&gt;</span>
        <span className="text-navy font-medium">Daftar Kasus</span>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-dark mb-1">Judul Dokumen</p>
            <h2 className="text-lg font-semibold text-navy">
              {ncrDetail.title}
            </h2>
          </div>
          <div>
            <p className="text-sm text-gray-dark mb-1">Tanggal Dibuat</p>
            <p className="text-lg font-semibold text-navy">{ncrDetail.date}</p>
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-wrap items-center gap-4">
        <InputGroup className="h-14 flex-1">
          <InputGroupInput
            placeholder="Cari Kasus Berdasarkan Nomor NCR"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-state text-navy placeholder:text-gray-dark"
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-14 w-[204px] justify-between bg-white border-gray-300"
            >
              Semua Status
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[204px]">
            <DropdownMenuItem>Semua Status</DropdownMenuItem>
            <DropdownMenuItem>Draft</DropdownMenuItem>
            <DropdownMenuItem>In Progress</DropdownMenuItem>
            <DropdownMenuItem>Reviewed</DropdownMenuItem>
            <DropdownMenuItem>Approved</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          onClick={handleAddCase}
          className="h-14 px-6 bg-navy text-white hover:bg-navy-hover"
        >
          + Tambah Kasus
        </Button>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pagedData.map((kasus, index) => (
          <CaseCard 
            key={`${kasus.id}-${index}`} 
            kasus={kasus}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        perPage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        totalData={totalData}
        onPageChange={setActivePage}
        onPaginateChange={handlePaginateChange}
      />

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          caseData={selectedCase}
          secondaryAction={{
            label: "Detail Kasus",
            onClick: handleDetailKasus,
          }}
          primaryAction={{
            label: "Daftar Temuan",
            onClick: handleDaftarTemuan,
          }}
        />
      )}

      {/* Case Edit Modal */}
      {selectedCase && (
        <CaseEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          caseData={selectedCase}
          onSave={handleSaveEdit}
        />
      )}

      {/* Case Add Modal */}
      <CaseAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveAdd}
      />

      {/* Case Delete Modal */}
      {selectedCase && (
        <CaseDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          caseData={selectedCase}
          onConfirm={handleConfirmDelete}
        />
      )}

    </div>
  );
}
