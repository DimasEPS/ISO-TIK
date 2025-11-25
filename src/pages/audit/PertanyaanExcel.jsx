import { useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
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
import { toast } from "sonner";
import {
  useExcelChecklistsByChecklistId,
  useExcelChecklistQuestions,
  useExcelChecklistMetadata,
} from "./hooks/useExcelChecklistQuestions";
import { auditService } from "@/services/auditService";

function PertanyaanExcel() {
  const { id, checklistId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { dokumenTitle, lokasi, tanggalAudit, revisi, mode } =
    location.state || {};

  // Step 1: Fetch excel checklists by checklist ID
  const { data: excelChecklists = [], isLoading: isLoadingExcelChecklists } =
    useExcelChecklistsByChecklistId(checklistId);

  // Get first excel checklist (assuming one checklist has one excel checklist)
  const excelChecklistId = excelChecklists[0]?.id;

  // Step 2: Fetch excel checklist metadata and questions ONLY if we have excelChecklistId
  const { data: excelMetadata, isLoading: isLoadingMetadata } =
    useExcelChecklistMetadata(id, excelChecklistId);

  const {
    data: questions = [],
    isLoading: isLoadingQuestions,
    refetch: refetchQuestions,
  } = useExcelChecklistQuestions(id, excelChecklistId);

  const [activeTab, setActiveTab] = useState("excel");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    buktiObjektif: "",
    kesesuaian: "",
    catatanAuditor: "",
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "aspek") {
      // Navigate to AspekPertanyaan
      navigate(`/admin/audit/dokumen/${id}/aspek/${checklistId}`, {
        state: { dokumenTitle, lokasi, tanggalAudit, revisi, mode },
      });
    }
  };

  const handleOpenDialog = (question) => {
    setSelectedItem(question);
    // Map back display values to backend values for form
    const kesesuaianValue = question.kesesuaian;
    setFormData({
      buktiObjektif: question.buktiObjektif || "",
      kesesuaian: kesesuaianValue || "",
      catatanAuditor: question.catatanAuditor || "",
    });
    setDialogOpen(true);
  };

  const handleSimpanJawaban = async () => {
    if (!selectedItem) return;

    setIsSaving(true);
    try {
      const payload = {
        excel_question_id: selectedItem.id,
        document_id: id,
        objective_evidence: formData.buktiObjektif || null,
        auditor_note: formData.catatanAuditor || null,
        conformity: formData.kesesuaian || null,
      };

      if (selectedItem.answerId) {
        // Update existing answer
        await auditService.updateExcelAnswer(selectedItem.answerId, {
          objective_evidence: payload.objective_evidence,
          auditor_note: payload.auditor_note,
          conformity: payload.conformity,
        });
        toast.success("Jawaban berhasil diperbarui");
      } else {
        // Create new answer
        await auditService.createExcelAnswer(payload);
        toast.success("Jawaban berhasil disimpan");
      }

      // Refresh questions
      await refetchQuestions();

      setDialogOpen(false);
      setSelectedItem(null);
      setFormData({
        buktiObjektif: "",
        kesesuaian: "",
        catatanAuditor: "",
      });
    } catch (error) {
      console.error("Error saving excel answer:", error);
      toast.error("Gagal menyimpan jawaban");
    } finally {
      setIsSaving(false);
    }
  };

  // Transform questions to sections format for ExcelAuditTable
  // Group questions by aspect
  const excelData = {
    sections: questions.reduce((acc, question) => {
      const aspectName = question.aspect || "Tanpa Aspek";
      let section = acc.find((s) => s.title === aspectName);

      if (!section) {
        section = {
          code: aspectName.toLowerCase().replace(/\s+/g, "-"),
          title: aspectName,
          items: [],
        };
        acc.push(section);
      }

      // Map conformity: yes → Ya, no → Tidak
      const kesesuaianDisplay =
        question.kesesuaian === "yes"
          ? "Ya"
          : question.kesesuaian === "no"
          ? "Tidak"
          : question.kesesuaian || "Belum Diisi";

      section.items.push({
        id: question.id,
        itemAudit: question.itemAudit || "-",
        buktiObjektif: question.buktiObjektif || "Belum Diisi",
        kesesuaian: kesesuaianDisplay,
        catatanEditor: question.catatanAuditor || "Belum Diisi",
        // Keep original question data for dialog (with original values)
        ...question,
      });

      return acc;
    }, []),
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
                {isLoadingExcelChecklists || isLoadingMetadata
                  ? "Loading..."
                  : excelMetadata?.checklistName ||
                    excelChecklists[0]?.checklistName ||
                    "Excel Checklist"}
              </p>
            </div>
            <div>
              <p className="small text-gray-dark mb-1">Total Pertanyaan</p>
              <p className="body-medium text-[#2B7FFF]">
                {isLoadingQuestions ? "Loading..." : questions.length || 0}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingExcelChecklists && (
            <div className="text-center py-8">
              <p className="text-gray-dark">Memuat excel checklist...</p>
            </div>
          )}

          {!isLoadingExcelChecklists && !excelChecklistId && (
            <div className="text-center py-8">
              <p className="text-red-600">
                Excel checklist tidak ditemukan untuk checklist ini.
              </p>
            </div>
          )}

          {!isLoadingExcelChecklists &&
            excelChecklistId &&
            isLoadingQuestions && (
              <div className="text-center py-8">
                <p className="text-gray-dark">Memuat pertanyaan...</p>
              </div>
            )}

          {/* Table Section */}
          {!isLoadingExcelChecklists &&
            excelChecklistId &&
            !isLoadingQuestions && (
              <ExcelAuditTable
                data={excelData}
                onEditClick={handleOpenDialog}
              />
            )}
        </div>

        {/* Navigator Sidebar */}
        <div className="w-80 shrink-0">
          <div className="border rounded-lg p-4 bg-white sticky top-6">
            <h3 className="body-medium text-navy mb-4">Navigator Aspek</h3>

            {isLoadingQuestions ? (
              <p className="text-gray-dark text-sm">Memuat aspek...</p>
            ) : (
              <div className="space-y-2">
                {excelData.sections.map((section) => (
                  <div key={section.code} className="p-2 rounded bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#28A745] shrink-0" />
                      <span className="body text-navy font-medium">
                        {section.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-dark mt-1 ml-4">
                      {section.items.length} pertanyaan
                    </p>
                  </div>
                ))}
                {excelData.sections.length === 0 && (
                  <p className="text-gray-dark text-sm">Tidak ada pertanyaan</p>
                )}
              </div>
            )}
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
                  <p className="small text-gray-dark mb-1">Catatan Auditor</p>
                  <p className="body text-navy">
                    {selectedItem?.catatanAuditor || "Belum Diisi"}
                  </p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label className="body-medium text-navy mb-2 block">
                  Bukti Objektif
                </Label>
                <Input
                  value={formData.buktiObjektif}
                  onChange={(e) =>
                    setFormData({ ...formData, buktiObjektif: e.target.value })
                  }
                  placeholder="Masukkan Bukti Objektif"
                  className="w-full"
                  disabled={mode === "view"}
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
                  disabled={mode === "view"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kesesuaian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Ya</SelectItem>
                    <SelectItem value="no">Tidak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="body-medium text-navy mb-2 block">
                  Catatan Auditor
                </Label>
                <Input
                  value={formData.catatanAuditor}
                  onChange={(e) =>
                    setFormData({ ...formData, catatanAuditor: e.target.value })
                  }
                  placeholder="Masukkan Catatan Auditor"
                  className="w-full"
                  disabled={mode === "view"}
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
                    catatanAuditor: "",
                  });
                }}
                variant="outline"
                className="rounded-lg"
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                onClick={handleSimpanJawaban}
                className="rounded-lg bg-navy hover:bg-navy/90 text-white"
                disabled={isSaving}
              >
                {isSaving
                  ? "Menyimpan..."
                  : selectedItem?.answerId
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
