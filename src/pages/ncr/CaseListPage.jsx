import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { Button } from "@/components/ui/button";
import { SearchIcon, ChevronDown, Loader2 } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CaseCard, CaseDetailModal, CaseEditModal, CaseAddModal, CaseDeleteModal } from "./components/case";
import { PaginationControls } from "./components/common";
import { 
  useNCRCases, 
  useNCRDocument,
  useCreateNCRCase,
  useUpdateNCRCase,
  useDeleteNCRCase 
} from "./hooks/useNCRQueries";
import { CASE_STATUS, CASE_STATUS_LABELS } from "./constants";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setActivePage] = useState(1);

  // Fetch NCR document details
  const { data: ncrDocument } = useNCRDocument(id);

  // Fetch cases for this document
  const { data: casesResponse, isLoading, error } = useNCRCases(id, {
    page: currentPage,
    per_page: perPage,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const createMutation = useCreateNCRCase();
  const updateMutation = useUpdateNCRCase();
  const deleteMutation = useDeleteNCRCase();

  const rawCases = casesResponse?.cases?.data ?? [];
  const paginationMeta = casesResponse?.cases?.meta ?? {};
  const totalData = paginationMeta.total ?? 0;
  const totalPages = paginationMeta.last_page ?? 1;

  const documentData = casesResponse?.document || ncrDocument?.data;

  const normalizedCases = useMemo(() => {
    if (!rawCases.length) return [];
    return rawCases.map((item) => {
      const ncrNumber = item.ncr_number || item.case_number || item.id || "";
      const location = item.location || item.department_location || item.bagianTerkait || "-";
      const ncrDate = item.ncr_date || item.tanggal || "";
      const referencesStandard = item.references_standard || item.standard_reference || item.standarReferensi || "";
      const clause = item.clause || item.klasifikasi || "";
      const auditorName = item.auditor_name || item.namaAuditor || item.auditor?.name || "";
      const auditeeName = item.auditee_name || item.namaAuditee || item.auditee?.name || "";
      const auditorId = item.id_auditor || item.auditor_id || item.auditor?.id || "";
      const auditeeId = item.id_auditee || item.auditee_id || item.auditee?.id || "";
      const targetDate = item.target_date || item.targetPerbaikan || "";
      const completionDate = item.completion_date || item.tanggalSelesai || "";
      const documentId = item.id_ncr_documents || item.document_id || id;

      return {
        id: item.id,
        ncrNumber,
        ncrDate,
        location,
        referencesStandard,
        clause,
        auditorName,
        auditorId,
        auditeeName,
        auditeeId,
        status: item.status || "",
        targetDate,
        completionDate,
        findingCategory: item.finding_category || item.findingCategory || "minor",
        documentId,
        bagianTerkait: location,
        tanggal: ncrDate,
        standarReferensi: referencesStandard,
        klasifikasi: clause,
        namaAuditor: auditorName,
        namaAuditee: auditeeName,
      };
    });
  }, [rawCases, id]);

  const ncrDetail = {
    id: id,
    title: documentData?.title || "NCR Dokumen",
    date: documentData?.created_at ? new Date(documentData.created_at).toLocaleDateString('id-ID') : "-",
    description: documentData?.description || "",
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

  const handleSaveEdit = async (updatedCase) => {
    if (!selectedCase?.id) return;
    try {
      await updateMutation.mutateAsync({
        caseId: selectedCase.id,
        payload: updatedCase,
      });
      setIsEditModalOpen(false);
      setSelectedCase(null);
      toast.success("Kasus NCR berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal mengupdate kasus:", error);
      toast.error(error?.message || "Gagal memperbarui kasus NCR.");
    }
  };

  const handleConfirmDelete = async (caseData) => {
    if (!caseData?.id) return;
    try {
      await deleteMutation.mutateAsync(caseData.id);
      setIsDeleteModalOpen(false);
      setSelectedCase(null);
      toast.success("Kasus NCR berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus kasus:", error);
      toast.error(error?.message || "Gagal menghapus kasus NCR.");
    }
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

  const handleSaveAdd = async (newCase) => {
    try {
      await createMutation.mutateAsync({
        ...newCase,
        documentId: id,
      });
      setIsAddModalOpen(false);
      toast.success("Kasus NCR berhasil ditambahkan.");
    } catch (error) {
      console.error("Gagal menambah kasus:", error);
      toast.error(error?.message || "Gagal menambah kasus NCR.");
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
    setActivePage(1);
  }, []);

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
              {statusFilter === "all" ? "Semua Status" : CASE_STATUS_LABELS[statusFilter]}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[204px]">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              Semua Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(CASE_STATUS.DRAFT)}>
              {CASE_STATUS_LABELS[CASE_STATUS.DRAFT]}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(CASE_STATUS.IN_PROGRESS)}>
              {CASE_STATUS_LABELS[CASE_STATUS.IN_PROGRESS]}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(CASE_STATUS.REVIEWED)}>
              {CASE_STATUS_LABELS[CASE_STATUS.REVIEWED]}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(CASE_STATUS.APPROVED)}>
              {CASE_STATUS_LABELS[CASE_STATUS.APPROVED]}
            </DropdownMenuItem>
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
        {isLoading ? (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Memuat data kasus...</p>
          </div>
        ) : error ? (
          <div className="col-span-full rounded-2xl border border-dashed border-red-300 bg-red-50 p-8 text-center text-red-600">
            <p>Gagal memuat data kasus</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        ) : normalizedCases.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            Tidak ada kasus sesuai pencarian
          </div>
        ) : (
          normalizedCases.map((kasus, index) => (
            <CaseCard 
              key={`${kasus.id}-${index}`} 
              kasus={kasus}
              onViewDetail={handleViewDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
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
