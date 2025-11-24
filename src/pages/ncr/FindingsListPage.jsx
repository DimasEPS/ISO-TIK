import { useState, useMemo } from "react";
import { toast } from "sonner";
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
  useDeleteNCRPoint,
  useUpdateNCRCase,
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

const FINDING_CATEGORY_LABELS = {
  minor: "Kategori Temuan Audit - Minor",
  major: "Kategori Temuan Audit - Major",
  critical: "Kategori Temuan Audit - Critical",
};

const getCategoryLabel = (value) => {
  if (!value) return "Kategori Temuan";
  const normalized = String(value).toLowerCase();
  return FINDING_CATEGORY_LABELS[normalized] || value;
};

const getCategoryValue = (label) => {
  if (!label) return null;
  const entry = Object.entries(FINDING_CATEGORY_LABELS).find(([, text]) => text === label);
  if (entry) return entry[0];
  const normalized = label.toLowerCase();
  if (FINDING_CATEGORY_LABELS[normalized]) {
    return normalized;
  }
  return null;
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
  const deleteMutation = useDeleteNCRPoint();
  const updateCaseMutation = useUpdateNCRCase();

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

  const findingCategoryLabel = useMemo(() => {
    return getCategoryLabel(caseInfo?.finding_category || caseInfo?.findingCategory);
  }, [caseInfo]);

  const findings = useMemo(() => {
    const items = extractPointItems(findingsData, "finding");
    return items.map(f => ({
      id: f.id,
      kategori: f.category || findingCategoryLabel || "Kategori Temuan",
      deskripsi: f.description || f.deskripsi || "",
      description: f.description || f.deskripsi || "",
    }));
  }, [findingsData, findingCategoryLabel]);

  const handleBack = () => {
    navigate(`/admin/ncr/${id}/kasus`);
  };

  const handleAddFinding = () => {
    if (!auditorId) {
      toast.error("Data auditor kasus belum tersedia. Muat ulang halaman atau perbarui data kasus terlebih dahulu.");
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
      toast.success("Temuan berhasil ditambahkan.");
    } catch (error) {
      console.error("Gagal menambah temuan:", error);
      toast.error(error?.message || "Gagal menambah temuan.");
    }
  };

  const handleEditCategory = () => {
    const referenceFinding = findings[0] || { kategori: findingCategoryLabel };
    setSelectedFinding(referenceFinding);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedFinding) => {
    const selectedLabel = updatedFinding?.kategori;
    const categoryValue = getCategoryValue(selectedLabel);

    if (!categoryValue) {
      toast.error("Kategori temuan tidak valid. Silakan pilih kembali.");
      return;
    }

    try {
      await updateCaseMutation.mutateAsync({
        caseId: caseId,
        payload: {
          finding_category: categoryValue,
        },
      });
      setIsEditModalOpen(false);
      setSelectedFinding(null);
      toast.success("Kategori temuan berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal mengupdate kategori temuan:", error);
      toast.error(error?.message || "Gagal mengupdate kategori temuan.");
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
      toast.success("Temuan berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus temuan:", error);
      toast.error(error?.message || "Gagal menghapus temuan.");
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
                {findingCategoryLabel || "Kategori Temuan Audit - Minor"}
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
              disabled: isCaseLoading
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
