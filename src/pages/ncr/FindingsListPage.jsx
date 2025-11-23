import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { FindingAddModal, FindingEditModal, FindingDeleteModal } from "./components/finding";
import { ListCard } from "./components/common";
import { 
  useNCRPoints, 
  useNCRCase,
  useCreateNCRPoint,
  useUpdateNCRPoint,
  useDeleteNCRPoint 
} from "./hooks/useNCRQueries";

const POINT_TYPE_MAP = {
  finding: "uraian",
  analysis: "analisa",
  correction: "koreksi",
  corrective_action: "tindakan",
  uraian: "uraian",
  analisa: "analisa",
  koreksi: "koreksi",
  tindakan: "tindakan",
};

const normalizePointType = (value) => {
  if (!value) return undefined;
  const normalized = String(value).toLowerCase();
  return POINT_TYPE_MAP[normalized] ?? normalized;
};

const extractPointItems = (payload, expectedType) => {
  if (!payload) return [];
  const normalizedTarget = normalizePointType(expectedType);
  const containers = Array.isArray(payload.points)
    ? payload.points
    : Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  if (!containers.length) return [];

  const isGrouped = containers.some((group) => Array.isArray(group?.items));

  if (!isGrouped) {
    return containers;
  }

  const matched = normalizedTarget
    ? containers.find(
        (group) => normalizePointType(group.point_type) === normalizedTarget
      )
    : containers[0];

  return matched?.items ?? [];
};

export default function FindingsListPage() {
  usePageTemplate({
    title: "Non Conformity Report (NCR)",
    subtitle: "Kelola dokumen dan temuan",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const navigate = useNavigate();
  const { id, caseId } = useParams();

  const [selectedFinding, setSelectedFinding] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch case details
  const { data: caseData, isLoading: isCaseLoading } = useNCRCase(caseId);

  const caseInfo = useMemo(() => {
    if (!caseData) return {};
    return caseData.case ?? caseData.data ?? caseData;
  }, [caseData]);

  const documentTitle =
    caseInfo.document_title || caseInfo.ncr_document?.title || "NCR Dokumen";

  // Fetch findings (point_type: finding)
  const { data: findingsData, isLoading, error } = useNCRPoints(caseId, { 
    point_type: "finding" 
  });

  const createMutation = useCreateNCRPoint();
  const updateMutation = useUpdateNCRPoint();
  const deleteMutation = useDeleteNCRPoint();

  const auditorId =
    caseInfo.auditor_uuid ??
    caseInfo.id_auditor ??
    caseInfo.auditor_id ??
    caseInfo.auditorId ??
    caseInfo.auditor?.id ??
    caseInfo.auditor?.uuid ??
    "";

  const caseDetail = useMemo(() => {
    return {
      ncrTitle: documentTitle,
      caseNumber:
        caseInfo?.case_number ||
        caseInfo?.ncr_number ||
        caseInfo?.ncrNumber ||
        caseInfo?.id ||
        "-",
    };
  }, [caseInfo, documentTitle]);

  const findings = useMemo(() => {
    const items = extractPointItems(findingsData, "finding");
    return items.map(f => ({
      id: f.id,
      kategori: f.category || "Kategori Temuan",
      deskripsi: f.description || f.deskripsi || "",
      description: f.description || f.deskripsi || "",
    }));
  }, [findingsData]);

  const handleBack = () => {
    navigate(`/admin/ncr/${id}/kasus`);
  };

  const handleAddFinding = () => {
    if (!auditorId) {
      alert("Data auditor kasus belum tersedia. Mohon muat ulang halaman atau perbarui data kasus terlebih dahulu.");
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (newFinding) => {
    try {
      await createMutation.mutateAsync({
        caseId: caseId,
        ncr_case_id: caseId,
        point_type: "finding",
        description: newFinding.description || newFinding.deskripsi,
        category: "Kategori Temuan Audit - Minor", // Default category
        auditorId,
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Gagal menambah temuan:", error);
    }
  };

  const handleEditCategory = () => {
    // Open edit modal with the category (first finding's category as reference)
    if (findings.length > 0) {
      setSelectedFinding(findings[0]);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (updatedFinding) => {
    if (!updatedFinding?.id) return;
    try {
      await updateMutation.mutateAsync({
        pointId: updatedFinding.id,
        payload: {
          caseId: caseId,
          category: updatedFinding.kategori,
          description: updatedFinding.description || updatedFinding.deskripsi,
        },
      });
      setIsEditModalOpen(false);
      setSelectedFinding(null);
    } catch (error) {
      console.error("Gagal mengupdate temuan:", error);
    }
  };

  const handleDeleteFinding = (finding) => {
    setSelectedFinding(finding);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (findingData) => {
    if (!findingData?.id) return;
    try {
      await deleteMutation.mutateAsync({
        pointId: findingData.id,
        caseId: caseId,
      });
      setIsDeleteModalOpen(false);
      setSelectedFinding(null);
    } catch (error) {
      console.error("Gagal menghapus temuan:", error);
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
        <button
          onClick={handleBack}
          className="text-gray-dark hover:text-navy"
        >
          Daftar Kasus
        </button>
        <span className="text-gray-dark">&gt;</span>
        <span className="text-navy font-medium">Daftar Temuan</span>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-dark mb-1">Judul Dokumen</p>
            <h2 className="text-lg font-semibold text-navy">
              {caseDetail.ncrTitle}
            </h2>
          </div>
          <div>
            <p className="text-sm text-gray-dark mb-1">Nomor NCR</p>
            <h2 className="text-lg font-semibold text-navy">
              {caseDetail.caseNumber}
            </h2>
          </div>
        </div>
      </div>

      {/* Findings List Card */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-navy" />
          <p className="text-gray-600">Memuat data temuan...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg border border-red-300 p-8 text-center">
          <p className="text-red-600">Gagal memuat data temuan</p>
          <p className="text-sm mt-2 text-red-500">{error.message}</p>
        </div>
      ) : (
        <ListCard
          title="Uraian Ketidaksesuaian :"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          badge={
            <div className="bg-white border border-gray-300 rounded px-3 py-1 inline-block">
              <p className="text-sm text-gray-700">
                {findings[0]?.kategori || "Kategori Temuan Audit - Minor"}
              </p>
            </div>
          }
          items={findings}
          onDelete={handleDeleteFinding}
          showDelete={true}
          actions={[
            {
              icon: Pencil,
              label: "Edit Kategori Temuan",
              onClick: handleEditCategory,
              className: "bg-blue-600 text-white hover:bg-blue-700",
              disabled: findings.length === 0 && !isLoading
            },
            {
              icon: Plus,
              label: "Tambah Temuan",
              onClick: handleAddFinding,
              className: "bg-green-600 text-white hover:bg-green-700",
              disabled: isCaseLoading
            }
          ]}
        />
      )}

      {/* Penanganan button at bottom right */}
      <div className="flex justify-end">
        <Button 
          onClick={() => navigate(`/admin/ncr/${id}/kasus/${caseId}/tanggapan`)}
          className="h-12 px-6 bg-navy text-white hover:bg-navy/90"
        >
          Tanggapan Terkait Temuan
        </Button>
      </div>

      {/* Modals */}
      <FindingAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAdd}
      />

      <FindingEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        findingData={selectedFinding}
        onSave={handleSaveEdit}
      />

      <FindingDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        findingData={selectedFinding}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
