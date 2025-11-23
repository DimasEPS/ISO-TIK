import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { FindingAddModal, FindingEditModal, FindingDeleteModal } from "./components/finding";
import { ListCard } from "./components/common";

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

  // Mock data - in real app, fetch based on caseId
  const caseDetail = {
    ncrTitle: "NCR Dokumen 1",
    caseNumber: "010101",
  };

  const [findings, setFindings] = useState([
    {
      id: 1,
      kategori: "Kategori Temuan Audit - Minor",
      deskripsi: "Organisasi PT. ABC belum adanya SDM IT khususnya pada bidang artefaktif IT, organisasi hanya memiliki SDM IT Support",
    },
    {
      id: 2,
      kategori: "Kategori Temuan Audit - Minor",
      deskripsi: "Organisasi PT. ABC belum adanya SDM IT khususnya pada bidang artefaktif IT, organisasi hanya memiliki SDM IT Support",
    },
    {
      id: 3,
      kategori: "Kategori Temuan Audit - Minor",
      deskripsi: "Organisasi PT. ABC belum adanya SDM IT khususnya pada bidang artefaktif IT, organisasi hanya memiliki SDM IT Support",
    },
    {
      id: 4,
      kategori: "Kategori Temuan Audit - Minor",
      deskripsi: "Organisasi PT. ABC belum adanya SDM IT khususnya pada bidang artefaktif IT, organisasi hanya memiliki SDM IT Support",
    },
    {
      id: 5,
      kategori: "Kategori Temuan Audit - Minor",
      deskripsi: "Organisasi PT. ABC belum adanya SDM IT khususnya pada bidang artefaktif IT, organisasi hanya memiliki SDM IT Support",
    },
  ]);

  const [selectedFinding, setSelectedFinding] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleBack = () => {
    navigate(`/admin/ncr/${id}/kasus`);
  };

  const handleAddFinding = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (newFinding) => {
    // TODO: Implement add logic (API call)
    const newId = Math.max(...findings.map(f => f.id), 0) + 1;
    setFindings([...findings, { ...newFinding, id: newId }]);
    console.log("Adding new finding:", newFinding);
  };

  const handleEditCategory = () => {
    // Open edit modal with the category (first finding's category as reference)
    if (findings.length > 0) {
      setSelectedFinding(findings[0]);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = (updatedFinding) => {
    // TODO: Implement edit logic (API call)
    setFindings(findings.map(f => 
      f.id === updatedFinding.id ? updatedFinding : f
    ));
    console.log("Updating finding:", updatedFinding);
  };

  const handleDeleteFinding = (finding) => {
    setSelectedFinding(finding);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (findingData) => {
    // TODO: Implement delete logic (API call)
    setFindings(findings.filter(f => f.id !== findingData.id));
    console.log("Deleting finding:", findingData);
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
      <ListCard
        title="Uraian Ketidaksesuaian :"
        bgColor="bg-blue-50"
        borderColor="border-blue-200"
        badge={
          <div className="bg-white border border-gray-300 rounded px-3 py-1 inline-block">
            <p className="text-sm text-gray-700">Kategori Temuan Audit - Minor</p>
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
            className: "bg-blue-600 text-white hover:bg-blue-700"
          },
          {
            icon: Plus,
            label: "Tambah Temuan",
            onClick: handleAddFinding,
            className: "bg-green-600 text-white hover:bg-green-700"
          }
        ]}
      />

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
