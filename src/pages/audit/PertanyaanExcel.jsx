import { useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExcelAuditTable } from "@/components/admin/audit/ExcelAuditTable";
import { pertanyaanExcelData } from "@/mocks/excelAuditData";

// Mock data untuk pertanyaan excel
const mockExcelData = {
  checklistTitle: "Fully Redundant Critical Systems",
  checklistExcel: [
    {
      id: 1,
      name: "Jenis Checklist excel 1",
      expanded: true,
      items: [
        {
          id: 1,
          itemAudit: "Apakah SLA menetapkan uptime 99,995%?",
          aspek: "Kebijakan & SLA",
          buktiObjektif: "Dokumen SLA",
          kesesuaian: "Ya",
          catatanEditor: "Perlu Ada Perubahan terkait dokumen terkait",
        },
        {
          id: 2,
          itemAudit: "Apakah SLA menetapkan uptime 99,995%?",
          aspek: "Kebijakan & SLA",
          buktiObjektif: "Dokumen SLA",
          kesesuaian: "Tidak",
          catatanEditor: "Perlu Ada Perubahan terkait dokumen terkait",
        },
        {
          id: 3,
          itemAudit: "Apakah SLA menetapkan uptime 99,995%?",
          aspek: "Kebijakan & SLA",
          buktiObjektif: "Belum Diisi",
          kesesuaian: "Belum Diisi",
          catatanEditor: "Belum Diisi",
        },
      ],
    },
    {
      id: 2,
      name: "Jenis Checklist excel 2",
      expanded: false,
      items: [],
    },
  ],
};

function PertanyaanExcel() {
  const { id, checklistId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { dokumenTitle, lokasi, tanggalAudit, revisi, mode } =
    location.state || {};
  const [activeTab, setActiveTab] = useState("excel");
  const [excelData, setExcelData] = useState(pertanyaanExcelData);
  const [checklistExcel, setChecklistExcel] = useState(
    mockExcelData.checklistExcel
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    buktiObjektif: "",
    kesesuaian: "",
    catatanEditor: "",
  });

  const toggleChecklist = (checklistId) => {
    setChecklistExcel(
      checklistExcel.map((checklist) =>
        checklist.id === checklistId
          ? { ...checklist, expanded: !checklist.expanded }
          : checklist
      )
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "aspek") {
      // Navigate to AspekPertanyaan
      navigate(`/admin/audit/dokumen/${id}/aspek/${checklistId}`, {
        state: { dokumenTitle, lokasi, tanggalAudit, revisi, mode },
      });
    }
  };

  const handleOpenDialog = (item, sectionCode) => {
    setSelectedItem({ ...item, sectionCode });
    setFormData({
      buktiObjektif:
        item.buktiObjektif !== "Belum Diisi" ? item.buktiObjektif : "",
      kesesuaian: item.kesesuaian !== "Belum Diisi" ? item.kesesuaian : "",
      catatanEditor:
        item.catatanEditor !== "Belum Diisi" ? item.catatanEditor : "",
    });
    setDialogOpen(true);
  };

  const handleSimpanPerubahan = () => {
    if (!selectedItem) return;

    setExcelData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.code !== selectedItem.sectionCode) return section;
        return {
          ...section,
          items: section.items.map((item) => {
            if (item.id !== selectedItem.id) return item;
            return {
              ...item,
              buktiObjektif:
                formData.buktiObjektif.trim() !== ""
                  ? formData.buktiObjektif
                  : item.buktiObjektif,
              kesesuaian:
                formData.kesesuaian.trim() !== ""
                  ? formData.kesesuaian
                  : item.kesesuaian,
              catatanEditor:
                formData.catatanEditor.trim() !== ""
                  ? formData.catatanEditor
                  : item.catatanEditor,
            };
          }),
        };
      }),
    }));
    setDialogOpen(false);
    setSelectedItem(null);
    setFormData({
      buktiObjektif: "",
      kesesuaian: "",
      catatanEditor: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-8 border-b">
        <button
          onClick={() => handleTabChange("aspek")}
          className={`pb-3 body font-medium transition-colors relative ${
            activeTab === "aspek" ? "text-navy" : "text-gray-dark"
          }`}
        >
          Aspek Pertanyaan
          {activeTab === "aspek" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("excel")}
          className={`pb-3 body font-medium transition-colors relative ${
            activeTab === "excel" ? "text-navy" : "text-gray-dark"
          }`}
        >
          Pertanyaan Excel
          {activeTab === "excel" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />
          )}
        </button>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 body text-gray-dark">
        <Link
          to="/admin/audit/dokumen"
          className="text-[#2B7FFF] hover:underline"
        >
          Dokumen Audit
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-dark" />
        <Link
          to={`/admin/audit/dokumen/${id}`}
          state={{ dokumenTitle, lokasi, tanggalAudit, revisi, mode }}
          className="text-[#2B7FFF] hover:underline"
        >
          Daftar Checklist
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-dark" />
        <span className="text-[#2B7FFF] font-medium">Pertanyaan Excel</span>
      </nav>

      {/* Page Title */}
      <div>
        <h2 className="heading-2 text-navy">Pertanyaan Excel</h2>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Content */}
        <div className="flex-1 space-y-6">
          {/* Info Header */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="small text-gray-dark mb-1">Jenis Checklist</p>
              <p className="body-medium text-[#2B7FFF]">
                {mockExcelData.checklistTitle}
              </p>
            </div>
            <div>
              <p className="small text-gray-dark mb-1">Jenis Checklist Excel</p>
              <p className="body-medium text-[#2B7FFF]">
                {mockExcelData.checklistExcel[0].name}
              </p>
            </div>
          </div>

          {/* Table Section */}
          <ExcelAuditTable
            data={excelData}
            onEditClick={handleOpenDialog}
          />
        </div>

        {/* Navigator Sidebar */}
        <div className="w-80 shrink-0">
          <div className="border rounded-lg p-4 bg-white sticky top-6">
            <h3 className="body-medium text-navy mb-4">
              Navigator Checklist Excel
            </h3>

            <div className="space-y-2">
              {checklistExcel.map((checklist) => (
                <div key={checklist.id}>
                  <button
                    onClick={() => toggleChecklist(checklist.id)}
                    className="w-full flex items-center justify-between p-2 hover:bg-state rounded transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {checklist.expanded && (
                        <div className="w-2 h-2 rounded-full bg-[#28A745] shrink-0" />
                      )}
                      <span
                        className={`body ${
                          checklist.expanded
                            ? "text-navy font-medium"
                            : "text-gray-dark"
                        }`}
                      >
                        {checklist.name}
                      </span>
                    </div>
                    {checklist.expanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-dark shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-dark shrink-0" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Isi Jawaban */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="heading-3 text-navy">
              Isi Jawaban
            </DialogTitle>
            <p className="small text-gray-dark mt-1">
              {selectedItem?.itemAudit}
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Show existing data if available */}
            {selectedItem?.buktiObjektif !== "Belum Diisi" && (
              <div className="space-y-3 pb-4 border-b">
                <div>
                  <p className="small text-gray-dark mb-1">Bukti Objektif</p>
                  <p className="body text-navy">
                    {selectedItem?.buktiObjektif}
                  </p>
                </div>
                <div>
                  <p className="small text-gray-dark mb-1">Kesesuaian</p>
                  <p className="body text-navy">{selectedItem?.kesesuaian}</p>
                </div>
                <div>
                  <p className="small text-gray-dark mb-1">Catatan Editor</p>
                  <p className="body text-navy">
                    {selectedItem?.catatanEditor}
                  </p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label className="body-medium text-navy mb-2 block">
                  {selectedItem?.buktiObjektif !== "Belum Diisi"
                    ? "Bukti Objektif"
                    : "Bukti Objektif"}
                </Label>
                <Input
                  value={formData.buktiObjektif}
                  onChange={(e) =>
                    setFormData({ ...formData, buktiObjektif: e.target.value })
                  }
                  placeholder="Masukkan Bukti Objektif"
                  className="w-full"
                />
              </div>

              <div>
                <Label className="body-medium text-navy mb-2 block">
                  Kesesuaian
                </Label>
                <Select
                  value={formData.kesesuaian}
                  onValueChange={(value) =>
                    setFormData({ ...formData, kesesuaian: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kesesuaian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ya">Ya</SelectItem>
                    <SelectItem value="Tidak">Tidak</SelectItem>
                    <SelectItem value="Sebagian">Sebagian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="body-medium text-navy mb-2 block">
                  Catatan Editor
                </Label>
                <Input
                  value={formData.catatanEditor}
                  onChange={(e) =>
                    setFormData({ ...formData, catatanEditor: e.target.value })
                  }
                  placeholder="Masukkan Catatan Editor"
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  setFormData({
                    buktiObjektif: "",
                    kesesuaian: "",
                    catatanEditor: "",
                  });
                }}
                variant="outline"
                className="rounded-lg"
              >
                Batal
              </Button>
              <Button
                onClick={handleSimpanPerubahan}
                className="rounded-lg bg-navy hover:bg-navy/90 text-white"
              >
                {selectedItem?.buktiObjektif !== "Belum Diisi"
                  ? "Simpan Perubahan"
                  : "Simpan Jawaban"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PertanyaanExcel;
