import { useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewExcelAuditTable } from "@/components/admin/audit/ReviewExcelAuditTable";
import { toast } from "sonner";
import {
  useExcelChecklistsByChecklistId,
  useExcelChecklistQuestions,
} from "./hooks/useExcelChecklistQuestions";
import { auditService } from "@/services/auditService";

function ReviewPertanyaanExcel() {
  const { id, checklistId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { dokumenTitle, lokasi, tanggalAudit, revisi, mode } =
    location.state || {};

  // Fetch excel checklists by checklist ID
  const { data: excelChecklists = [], isLoading: isLoadingExcelChecklists } =
    useExcelChecklistsByChecklistId(checklistId);

  const excelChecklistId = excelChecklists[0]?.id;

  // Fetch questions
  const {
    data: questions = [],
    isLoading: isLoadingQuestions,
    refetch: refetchQuestions,
  } = useExcelChecklistQuestions(id, excelChecklistId);

  const [activeTab, setActiveTab] = useState("excel");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [komentarReviewer, setKomentarReviewer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "aspek") {
      // Navigate to ReviewAspekPertanyaan
      navigate(`/admin/audit/dokumen/${id}/review/${checklistId}`, {
        state: { dokumenTitle, lokasi, tanggalAudit, revisi, mode },
      });
    }
  };

  const handleOpenDialog = (question) => {
    setSelectedItem(question);
    setKomentarReviewer(question.reviewerComment || "");
    setDialogOpen(true);
  };

  const handleSimpanKomentar = async () => {
    if (!selectedItem || !selectedItem.answerId) {
      toast.error("Pertanyaan belum dijawab");
      return;
    }

    const trimmedComment = komentarReviewer.trim();
    if (!trimmedComment) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    try {
      await auditService.reviewExcelAnswer(selectedItem.answerId, {
        reviewer_comment: trimmedComment,
        is_review: true,
      });

      toast.success("Komentar berhasil disimpan");
      await refetchQuestions();

      setDialogOpen(false);
      setSelectedItem(null);
      setKomentarReviewer("");
    } catch (error) {
      console.error("Error saving review comment:", error);
      toast.error("Gagal menyimpan komentar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTandaiDireview = async (question) => {
    if (!question.answerId) {
      toast.error("Pertanyaan belum dijawab");
      return;
    }

    try {
      await auditService.reviewExcelAnswer(question.answerId, {
        reviewer_comment: question.reviewerComment || "-",
        is_review: true,
      });

      toast.success("Berhasil menandai sudah direview");
      await refetchQuestions();
    } catch (error) {
      console.error("Error marking as reviewed:", error);
      toast.error("Gagal menandai sudah direview");
    }
  };

  // Transform questions to sections format for ReviewExcelAuditTable
  const reviewData = {
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
        buktiObjektif: question.buktiObjektif || "Belum diisi",
        kesesuaian: kesesuaianDisplay,
        catatanEditor: question.catatanAuditor || "Belum diisi",
        komentarReviewer: question.reviewerComment || "Belum diisi",
        statusReview: question.isReview ? "sudah" : "belum",
        // Reviewer info
        reviewer: question.reviewerName
          ? {
              name: question.reviewerName,
              date: question.reviewedAt
                ? new Date(question.reviewedAt).toLocaleDateString("id-ID")
                : "-",
              comment: question.reviewerComment || "-",
            }
          : null,
        // Keep original question data
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
        <span className="text-[#2B7FFF] font-medium">
          Review Pertanyaan Excel
        </span>
      </nav>

      {/* Page Title */}
      <div>
        <h2 className="heading-2 text-navy">Review Pertanyaan Excel</h2>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Content */}
        <div className="flex-1 space-y-6">
          {/* Loading State */}
          {(isLoadingExcelChecklists || isLoadingQuestions) && (
            <div className="text-center py-8">
              <p className="text-gray-dark">Memuat data...</p>
            </div>
          )}

          {/* Info Header */}
          {!isLoadingExcelChecklists && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="small text-gray-dark mb-1">Jenis Checklist</p>
                <p className="body-medium text-[#2B7FFF]">
                  {excelChecklists[0]?.checklistName || "Excel Checklist"}
                </p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Total Pertanyaan</p>
                <p className="body-medium text-[#2B7FFF]">
                  {isLoadingQuestions ? "Loading..." : questions.length || 0}
                </p>
              </div>
            </div>
          )}

          {!isLoadingExcelChecklists && !excelChecklistId && (
            <div className="text-center py-8">
              <p className="text-red-600">
                Excel checklist tidak ditemukan untuk checklist ini.
              </p>
            </div>
          )}

          {/* Review Excel Table */}
          {!isLoadingExcelChecklists &&
            excelChecklistId &&
            !isLoadingQuestions && (
              <ReviewExcelAuditTable
                data={reviewData}
                onKomentarClick={handleOpenDialog}
                onTandaiDireview={handleTandaiDireview}
              />
            )}
        </div>

        {/* Navigator Sidebar */}
        <div className="w-80 shrink-0">
          <div className="border rounded-lg p-4 bg-white sticky top-6">
            <h3 className="body-medium text-navy mb-4">Navigator Aspek</h3>

            {isLoadingQuestions && (
              <p className="text-gray-dark text-sm">Memuat aspek...</p>
            )}

            {!isLoadingQuestions && (
              <div className="space-y-2">
                {reviewData.sections.map((section) => (
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
                {reviewData.sections.length === 0 && (
                  <p className="text-gray-dark text-sm">Tidak ada pertanyaan</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Komentar Reviewer */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="heading-3 text-navy">
              Komentar Reviewer
            </DialogTitle>
            <p className="small text-gray-dark mt-1">
              {selectedItem?.itemAudit}
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Question Details */}
            <div className="space-y-3">
              <div>
                <p className="small text-gray-dark mb-1">Bukti Objektif</p>
                <p className="body text-navy">
                  {selectedItem?.buktiObjektif || "-"}
                </p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Kesesuaian</p>
                <p className="body text-navy">
                  {selectedItem?.kesesuaian || "-"}
                </p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Catatan Auditor</p>
                <p className="body text-navy">
                  {selectedItem?.catatanAuditor || "-"}
                </p>
              </div>
            </div>

            {/* Existing Review Section (if exists) */}
            {selectedItem?.reviewer && (
              <div className="bg-[#E8F5E9] p-4 rounded-lg space-y-2 border border-[#28A745]">
                <p className="small text-gray-dark">Admin Reviewer</p>
                <p className="body text-navy font-medium">
                  {selectedItem.reviewer.name}
                </p>
                <div>
                  <p className="small text-gray-dark">Tanggal:</p>
                  <p className="body text-navy">{selectedItem.reviewer.date}</p>
                </div>
                <div>
                  <p className="small text-gray-dark">Komentar Reviewer:</p>
                  <p className="body text-navy">
                    {selectedItem.reviewer.comment}
                  </p>
                </div>
              </div>
            )}

            {/* Comment Form */}
            <div className="space-y-2">
              <label className="body-medium text-navy mb-2 block">
                {selectedItem?.reviewer ? "Edit Komentar" : "Berikan Komentar"}
              </label>
              <Textarea
                placeholder="Masukkan komentar..."
                value={komentarReviewer}
                onChange={(e) => setKomentarReviewer(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isSaving}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  setKomentarReviewer("");
                  setSelectedItem(null);
                }}
                variant="outline"
                className="rounded-lg"
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                onClick={handleSimpanKomentar}
                className="rounded-lg bg-navy hover:bg-navy/90 text-white"
                disabled={isSaving}
              >
                {isSaving ? "Menyimpan..." : "Simpan Komentar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReviewPertanyaanExcel;
