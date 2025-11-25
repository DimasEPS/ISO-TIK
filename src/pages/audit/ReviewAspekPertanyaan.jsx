import { useState, useEffect } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useChecklistAspects } from "./hooks/useChecklistAspects";
import { useAspectCategories } from "./hooks/useAspectCategories";
import { useCategoryQuestions } from "./hooks/useCategoryQuestions";
import { auditService } from "@/services/auditService";

function ReviewAspekPertanyaan() {
  const { id, checklistId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { dokumenTitle, lokasi, tanggalAudit, revisi, mode } =
    location.state || {};

  // Fetch aspects by checklistId
  const { aspects = [], isLoading: isLoadingAspects } =
    useChecklistAspects(checklistId);

  const [activeTab, setActiveTab] = useState("aspek");
  const [selectedAspectId, setSelectedAspectId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [expandedAspects, setExpandedAspects] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [komentarReviewer, setKomentarReviewer] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingReviewed, setIsMarkingReviewed] = useState(false);

  // Fetch categories for selected aspect
  const { categories = [], isLoading: isLoadingCategories } =
    useAspectCategories(selectedAspectId);

  // Fetch questions for selected category
  const {
    questions = [],
    isLoading: isLoadingQuestions,
    refetch: refetchQuestions,
  } = useCategoryQuestions(id, selectedCategoryId);

  // Auto-select first aspect and category on load
  useEffect(() => {
    if (aspects.length > 0 && !selectedAspectId) {
      const firstAspect = aspects[0];
      setSelectedAspectId(firstAspect.id);
      setExpandedAspects({ [firstAspect.id]: true });
    }
  }, [aspects, selectedAspectId]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const toggleAspek = (aspekId) => {
    setExpandedAspects((prev) => ({
      ...prev,
      [aspekId]: !prev[aspekId],
    }));
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "excel") {
      // Navigate to ReviewPertanyaanExcel
      navigate(`/admin/audit/dokumen/${id}/review-excel/${checklistId}`, {
        state: { dokumenTitle, lokasi, tanggalAudit, revisi, mode },
      });
    }
  };

  const handleIsiReview = (question) => {
    setCurrentQuestion(question);
    setKomentarReviewer(question.reviewerComment || "");
    setDialogOpen(true);
  };

  const handleTandaiDireview = async (question) => {
    if (!question.answerId) {
      toast.error("Pertanyaan belum dijawab");
      return;
    }

    setIsMarkingReviewed(true);
    try {
      await auditService.reviewAnswer(question.answerId, {
        reviewer_comment: question.reviewerComment || "-",
        is_review: true,
      });

      toast.success("Berhasil menandai sudah direview");
      await refetchQuestions();
    } catch (error) {
      console.error("Error marking as reviewed:", error);
      toast.error("Gagal menandai sudah direview");
    } finally {
      setIsMarkingReviewed(false);
    }
  };

  const handleSimpanKomentar = async () => {
    if (!currentQuestion || !currentQuestion.answerId) {
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
      await auditService.reviewAnswer(currentQuestion.answerId, {
        reviewer_comment: trimmedComment,
        is_review: true,
      });

      toast.success("Komentar berhasil disimpan");
      await refetchQuestions();

      setDialogOpen(false);
      setKomentarReviewer("");
      setCurrentQuestion(null);
    } catch (error) {
      console.error("Error saving review comment:", error);
      toast.error("Gagal menyimpan komentar");
    } finally {
      setIsSaving(false);
    }
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
          Review Aspek Pertanyaan
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
          Review Pertanyaan Excel
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
          Daftar Checklist Review
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-dark" />
        <span className="text-[#2B7FFF] font-medium">
          Review Aspek Pertanyaan
        </span>
      </nav>

      {/* Page Title */}
      <div>
        <h2 className="heading-2 text-navy">Review Aspek Pertanyaan</h2>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Content */}
        <div className="flex-1 space-y-6">
          {/* Loading State */}
          {(isLoadingAspects || isLoadingCategories || isLoadingQuestions) && (
            <div className="text-center py-8">
              <p className="text-gray-dark">Memuat data...</p>
            </div>
          )}

          {/* Info Header */}
          {!isLoadingAspects && !isLoadingCategories && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="small text-gray-dark mb-1">Jenis Checklist</p>
                <p className="body-medium text-[#2B7FFF]">Review Checklist</p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Jenis Aspek</p>
                <p className="body-medium text-[#2B7FFF]">
                  {aspects.find((a) => a.id === selectedAspectId)?.name || "-"}
                </p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Jenis Kategori</p>
                <p className="body-medium text-[#2B7FFF]">
                  {categories.find((c) => c.id === selectedCategoryId)?.name ||
                    "-"}
                </p>
              </div>
            </div>
          )}

          {/* Question Cards - Display all questions */}
          {!isLoadingQuestions && questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border-2 border-[#D8E2FF] rounded-xl p-6 bg-white space-y-4"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-navy body font-medium shrink-0">
                        {index + 1}.
                      </span>
                      <p className="text-navy body font-medium flex-1">
                        {question.question}
                      </p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="small text-gray-dark">Aspek:</span>
                      <span className="small text-navy font-medium">
                        {aspects.find((a) => a.id === selectedAspectId)?.name ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="small text-gray-dark">Kategori:</span>
                      <span className="small text-navy font-medium">
                        {categories.find((c) => c.id === selectedCategoryId)
                          ?.name || "-"}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded small font-medium ${
                        question.isReview
                          ? "bg-[#2B7FFF] text-white"
                          : "bg-[#FFF4E5] text-[#FF9800]"
                      }`}
                    >
                      {question.isReview ? "Sudah Direview" : "Belum Direview"}
                    </span>
                  </div>

                  {/* Answer Details */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <p className="small text-gray-dark mb-1">Jawaban:</p>
                      <p className="body text-navy">
                        {question.jawaban || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="small text-gray-dark mb-1">Observasi:</p>
                      <p className="body text-navy">
                        {question.observasi || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="small text-gray-dark mb-1">Verifikasi:</p>
                      <p className="body text-navy">
                        {question.verifikasi || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="small text-gray-dark mb-1">
                        Rekaman Dokumen:
                      </p>
                      <p className="body text-navy">
                        {question.rekomenDokumen || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Review Section */}
                  {question.reviewerName && (
                    <div className="bg-[#E8F5E9] p-4 rounded-lg space-y-2">
                      <p className="small text-gray-dark">Admin Reviewer</p>
                      <p className="body text-navy font-medium">
                        {question.reviewerName}
                      </p>
                      {question.reviewedAt && (
                        <div>
                          <p className="small text-gray-dark">Tanggal:</p>
                          <p className="body text-navy">
                            {new Date(question.reviewedAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="small text-gray-dark">
                          Komentar Reviewer:
                        </p>
                        <p className="body text-navy">
                          {question.reviewerComment || "-"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleIsiReview(question)}
                      className="rounded-lg bg-[#2B7FFF] hover:bg-[#1a5fcf] text-white"
                      disabled={!question.answerId || isMarkingReviewed}
                    >
                      Isi Review
                    </Button>
                    <Button
                      onClick={() => handleTandaiDireview(question)}
                      className="rounded-lg bg-[#28A745] hover:bg-[#1e8035] text-white"
                      disabled={
                        !question.answerId ||
                        question.isReview ||
                        isMarkingReviewed
                      }
                    >
                      {isMarkingReviewed ? "Memproses..." : "Tandai Direview"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingQuestions && questions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-dark">
                Tidak ada pertanyaan untuk kategori ini
              </p>
            </div>
          )}
        </div>

        {/* Navigator Sidebar */}
        <div className="w-80 shrink-0">
          <div className="border rounded-lg p-4 bg-white sticky top-6">
            <h3 className="body-medium text-navy mb-4">Navigator Pertanyaan</h3>

            {isLoadingAspects && (
              <p className="text-gray-dark text-sm">Memuat aspek...</p>
            )}

            {!isLoadingAspects && aspects.length === 0 && (
              <div className="text-center py-6 px-4">
                <p className="text-gray-dark text-sm mb-2">
                  Checklist tidak ditemukan atau tidak memiliki aspek
                </p>
                <Link
                  to={`/admin/audit/dokumen/${id}`}
                  className="text-[#2B7FFF] text-sm hover:underline"
                >
                  Kembali ke Daftar Checklist
                </Link>
              </div>
            )}

            <div className="space-y-2">
              {aspects.map((aspek) => (
                <div key={aspek.id}>
                  <button
                    onClick={() => {
                      setSelectedAspectId(aspek.id);
                      toggleAspek(aspek.id);
                    }}
                    className="w-full flex items-center justify-between p-2 hover:bg-state rounded transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {expandedAspects[aspek.id] && (
                        <div className="w-2 h-2 rounded-full bg-[#28A745] shrink-0" />
                      )}
                      <span
                        className={`body ${
                          expandedAspects[aspek.id]
                            ? "text-navy font-medium"
                            : "text-gray-dark"
                        }`}
                      >
                        {aspek.name}
                      </span>
                    </div>
                    {expandedAspects[aspek.id] ? (
                      <ChevronUp className="w-4 h-4 text-gray-dark shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-dark shrink-0" />
                    )}
                  </button>

                  {expandedAspects[aspek.id] &&
                    selectedAspectId === aspek.id && (
                      <div className="pl-6 mt-1 space-y-1">
                        {isLoadingCategories && (
                          <p className="text-gray-dark text-sm p-2">
                            Memuat kategori...
                          </p>
                        )}
                        {!isLoadingCategories &&
                          categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className={`w-full text-left p-2 rounded body transition-colors ${
                                category.id === selectedCategoryId
                                  ? "bg-state text-navy font-medium"
                                  : "text-gray-dark hover:bg-state"
                              }`}
                            >
                              {category.name}
                            </button>
                          ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
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
              {currentQuestion?.question}
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Question Details */}
            <div className="space-y-3">
              <div>
                <p className="small text-gray-dark mb-1">Jawaban:</p>
                <p className="body text-navy">
                  {currentQuestion?.jawaban || "-"}
                </p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Observasi:</p>
                <p className="body text-navy">
                  {currentQuestion?.observasi || "-"}
                </p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Verifikasi:</p>
                <p className="body text-navy">
                  {currentQuestion?.verifikasi || "-"}
                </p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Rekaman Dokumen:</p>
                <p className="body text-navy">
                  {currentQuestion?.rekomenDokumen || "-"}
                </p>
              </div>
            </div>

            {/* Existing Review Section (if exists) */}
            {currentQuestion?.reviewerName && (
              <div className="bg-[#E8F5E9] p-4 rounded-lg space-y-2 border border-[#28A745]">
                <p className="small text-gray-dark">Admin Reviewer</p>
                <p className="body text-navy font-medium">
                  {currentQuestion.reviewerName}
                </p>
                {currentQuestion.reviewedAt && (
                  <div>
                    <p className="small text-gray-dark">Tanggal:</p>
                    <p className="body text-navy">
                      {new Date(currentQuestion.reviewedAt).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <p className="small text-gray-dark">Komentar Reviewer:</p>
                  <p className="body text-navy">
                    {currentQuestion.reviewerComment || "-"}
                  </p>
                </div>
              </div>
            )}

            {/* Comment Form */}
            <div>
              <label className="body-medium text-navy mb-2 block">
                {currentQuestion?.reviewerName
                  ? "Edit Komentar"
                  : "Berikan Komentar"}
              </label>
              <Textarea
                value={komentarReviewer}
                onChange={(e) => setKomentarReviewer(e.target.value)}
                placeholder="Masukkan komentar..."
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
                  setCurrentQuestion(null);
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

export default ReviewAspekPertanyaan;
