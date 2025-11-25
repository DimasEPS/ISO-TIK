import { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { ChevronRight, ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useChecklistAspects } from "./hooks/useChecklistAspects";
import { useAspectCategories } from "./hooks/useAspectCategories";
import { useCategoryQuestions } from "./hooks/useCategoryQuestions";
import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";
import { toast } from "sonner";

export default function AspekPertanyaan() {
  const { id: documentId, checklistId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  usePageTemplate({
    title: "Detail Checklist Audit",
    subtitle: "Kelola dokumen, checklist, aspek, pertanyaan audit",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });

  // Get data from location state
  const {
    dokumenTitle = "Checklist Audit 2025",
    lokasi = "Bandar Lampung",
    tanggalAudit = "27/4/2025",
    revisi = "1.0",
    mode = "fill", // "view" or "fill"
  } = location.state || {};

  const [activeTab, setActiveTab] = useState("aspek");
  const [expandedAspek, setExpandedAspek] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedAspectId, setSelectedAspectId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    jawaban: "",
    observasi: "",
    verifikasi: "",
    rekomenDokumen: "",
  });

  // Get checklist detail
  const { data: checklistDetail, isLoading: checklistLoading } = useQuery({
    queryKey: ["checklist", checklistId],
    queryFn: async () => {
      const response = await auditService.getChecklist(checklistId);
      return response;
    },
    select: (response) => response.data.checklist || response.data,
    staleTime: 5 * 60 * 1000,
  });

  // Get aspects for this checklist
  const { aspects = [] } = useChecklistAspects(checklistId);

  // Auto-select first aspect if not selected
  useEffect(() => {
    if (aspects.length > 0 && !expandedAspek) {
      setExpandedAspek(aspects[0].id);
      setSelectedAspectId(aspects[0].id);
    }
  }, [aspects, expandedAspek]);

  // Get categories for selected aspect
  const { categories = [] } = useAspectCategories(selectedAspectId, {
    enabled: !!selectedAspectId,
  });

  // Auto-select first category if not selected
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Get questions WITH ANSWERS for selected category
  const { questions = [], refetch: refetchQuestions } = useCategoryQuestions(
    documentId,
    selectedCategoryId,
    {
      enabled: !!selectedCategoryId,
    }
  );

  // Get selected aspect and category for display
  const selectedAspect = aspects.find((a) => a.id === selectedAspectId);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Use real questions data
  const questionsData = questions;

  const getStatusBadge = (status) => {
    if (status === "answered") {
      return (
        <span className="px-2 py-1 bg-[#D4EDDA] text-[#155724] rounded-lg small font-medium">
          Sudah Dijawab
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-[#FFF3CD] text-[#856404] rounded-lg small font-medium">
        Belum Dijawab
      </span>
    );
  };

  const getActionButton = (question) => {
    if (mode === "view") {
      return null;
    }

    const handleClick = () => {
      setSelectedQuestion(question);
      setFormData({
        jawaban: question.jawaban || "",
        observasi: question.observasi || "",
        verifikasi: question.verifikasi || "",
        rekomenDokumen: question.rekomenDokumen || "",
      });
      setDialogOpen(true);
    };

    if (question.status === "answered") {
      return (
        <Button
          onClick={handleClick}
          className="flex items-center gap-2 h-[42px] px-4 bg-[#2B7FFF] hover:bg-[#2563EB] text-white rounded-lg"
        >
          <Pencil className="h-4 w-4" />
          <span className="body-medium">Edit Jawaban</span>
        </Button>
      );
    }

    return (
      <Button
        onClick={handleClick}
        className="flex items-center gap-2 h-[42px] px-4 bg-[#F1C441] hover:bg-[#E0B031] text-white rounded-lg"
      >
        <Pencil className="h-4 w-4" />
        <span className="body-medium">Isi Jawaban</span>
      </Button>
    );
  };

  const handleSimpanJawaban = async () => {
    try {
      setIsSaving(true);
      const payload = {
        question_id: selectedQuestion.id,
        document_id: documentId,
        answer_text: formData.jawaban,
        observation: formData.observasi,
        verification: formData.verifikasi,
        record_doc: formData.rekomenDokumen,
      };

      if (selectedQuestion.answerId) {
        // Update existing answer
        await auditService.updateAnswer(selectedQuestion.answerId, {
          answer_text: formData.jawaban,
          observation: formData.observasi,
          verification: formData.verifikasi,
          record_doc: formData.rekomenDokumen,
        });
        toast.success("Jawaban berhasil diperbarui");
      } else {
        // Create new answer
        await auditService.createAnswer(payload);
        toast.success("Jawaban berhasil disimpan");
      }

      // Refetch questions to get updated data
      await refetchQuestions();

      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error(
        error.message || "Gagal menyimpan jawaban. Silakan coba lagi."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAspek = (aspekId) => {
    if (expandedAspek === aspekId) {
      setExpandedAspek(null);
    } else {
      setExpandedAspek(aspekId);
      setSelectedAspectId(aspekId);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "excel") {
      navigate(`/admin/audit/dokumen/${documentId}/excel/${checklistId}`, {
        state: { dokumenTitle, lokasi, tanggalAudit, revisi, mode },
      });
    }
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Tabs - Above breadcrumb */}
        <div className="flex gap-4 border-b border-gray-300">
          <button
            onClick={() => handleTabChange("aspek")}
            className={`px-6 py-3 font-medium transition-colors body-medium relative ${
              activeTab === "aspek"
                ? "text-navy"
                : "text-gray-dark hover:text-navy"
            }`}
          >
            Aspek Pertanyaan
            {activeTab === "aspek" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />
            )}
          </button>
          <button
            onClick={() => handleTabChange("excel")}
            className={`px-6 py-3 font-medium transition-colors body-medium relative ${
              activeTab === "excel"
                ? "text-navy"
                : "text-gray-dark hover:text-navy"
            }`}
          >
            Pertanyaan Excel
            {activeTab === "excel" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy" />
            )}
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/audit"
            className="text-[#2B7FFF] hover:underline body"
          >
            Dokumen Audit
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-dark" />
          <Link
            to={`/admin/audit/dokumen/${documentId}`}
            state={{ dokumenTitle, lokasi, tanggalAudit, revisi, mode }}
            className="text-[#2B7FFF] hover:underline body"
          >
            Daftar Checklist
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-dark" />
          <span className="text-[#2B7FFF] body">Aspek Pertanyaan</span>
        </div>

        {/* Page Title */}
        <div>
          <h2 className="heading-2 text-navy">Aspek Pertanyaan</h2>
        </div>

        {/* Checklist Info */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-gray-dark small mb-1">Jenis Checklist</p>
            <p className="text-[#2B7FFF] body-medium">
              {checklistLoading
                ? "Loading..."
                : checklistDetail?.checklist_name || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-dark small mb-1">Jenis Aspek</p>
            <p className="text-[#2B7FFF] body-medium">
              {selectedAspect?.name || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-dark small mb-1">Jenis Kategori</p>
            <p className="text-[#2B7FFF] body-medium">
              {selectedCategory?.name || "-"}
            </p>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questionsData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-300">
              <p className="text-gray-dark body">
                {selectedCategoryId
                  ? "Tidak ada pertanyaan untuk kategori ini"
                  : "Pilih kategori untuk melihat pertanyaan"}
              </p>
            </div>
          ) : (
            questionsData.map((question, index) => (
              <div
                key={question.id}
                className="bg-white rounded-lg border border-gray-300 p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-navy small">
                        Aspek: {selectedAspect?.name || "-"}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-navy small">
                        Kategori: {selectedCategory?.name || "-"}
                      </span>
                      <span className="text-gray-400">|</span>
                      {getStatusBadge(question.status)}
                    </div>
                    <p className="text-navy body font-medium">
                      {index + 1}. {question.question}
                    </p>
                  </div>
                  <div className="shrink-0">{getActionButton(question)}</div>
                </div>

                {/* Answer Details (only show if answered) */}
                {question.status === "answered" && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div>
                      <p className="text-gray-dark small mb-1">Jawaban:</p>
                      <p className="text-navy body">
                        {question.jawaban || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-dark small mb-1">Observasi:</p>
                      <p className="text-navy body">
                        {question.observasi || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-dark small mb-1">Verifikasi:</p>
                      <p className="text-navy body">
                        {question.verifikasi || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-dark small mb-1">
                        Rekaman Dokumen:
                      </p>
                      <p className="text-navy body">
                        {question.rekomenDokumen || "-"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigator Sidebar */}
      <div className="w-80 bg-white rounded-lg border border-gray-300 p-6 h-fit sticky top-8">
        <h3 className="heading-3 text-navy mb-4">Navigator Pertanyaan</h3>

        {aspects.length === 0 ? (
          <p className="text-gray-dark small text-center py-4">
            Tidak ada aspek tersedia
          </p>
        ) : (
          <div className="space-y-2">
            {aspects.map((aspek) => (
              <div key={aspek.id} className="space-y-2">
                <button
                  onClick={() => toggleAspek(aspek.id)}
                  className="w-full flex items-center justify-between p-3 text-navy hover:bg-gray-100 rounded-lg transition-colors body-medium"
                >
                  <span>{aspek.name}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      expandedAspek === aspek.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedAspek === aspek.id && (
                  <div className="space-y-1 pl-3">
                    {categories.length === 0 ? (
                      <p className="text-gray-dark small px-3 py-2">
                        Tidak ada kategori
                      </p>
                    ) : (
                      categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 small ${
                            selectedCategoryId === category.id
                              ? "bg-[#D4EDDA] text-[#155724] font-medium"
                              : "text-gray-dark hover:bg-gray-100"
                          }`}
                        >
                          {selectedCategoryId === category.id && (
                            <div className="h-2 w-2 rounded-full bg-[#28A745] shrink-0" />
                          )}
                          <span>{category.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Isi Jawaban */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="heading-3 text-navy">
              {selectedQuestion?.status === "answered"
                ? "Edit Jawaban"
                : "Isi Jawaban"}
            </DialogTitle>
            <p className="text-gray-dark small mt-1">
              {selectedQuestion?.question}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Jawaban */}
            <div className="space-y-2">
              <label className="body text-navy font-medium">Jawaban</label>
              <Textarea
                placeholder="Masukkan Jawaban"
                value={formData.jawaban}
                onChange={(e) =>
                  setFormData({ ...formData, jawaban: e.target.value })
                }
                className="min-h-[80px] rounded-lg bg-state placeholder:text-gray-dark focus:bg-white focus:border-2 focus:border-navy"
              />
            </div>

            {/* Observasi */}
            <div className="space-y-2">
              <label className="body text-navy font-medium">Observasi</label>
              <Textarea
                placeholder="Masukkan Observasi"
                value={formData.observasi}
                onChange={(e) =>
                  setFormData({ ...formData, observasi: e.target.value })
                }
                className="min-h-[80px] rounded-lg bg-state placeholder:text-gray-dark focus:bg-white focus:border-2 focus:border-navy"
              />
            </div>

            {/* Verifikasi */}
            <div className="space-y-2">
              <label className="body text-navy font-medium">Verifikasi</label>
              <Textarea
                placeholder="Masukkan Verifikasi"
                value={formData.verifikasi}
                onChange={(e) =>
                  setFormData({ ...formData, verifikasi: e.target.value })
                }
                className="min-h-[80px] rounded-lg bg-state placeholder:text-gray-dark focus:bg-white focus:border-2 focus:border-navy"
              />
            </div>

            {/* Rekaman Dokumen */}
            <div className="space-y-2">
              <label className="body text-navy font-medium">
                Rekaman Dokumen
              </label>
              <Textarea
                placeholder="Masukkan Rekaman Dokumen:"
                value={formData.rekomenDokumen}
                onChange={(e) =>
                  setFormData({ ...formData, rekomenDokumen: e.target.value })
                }
                className="min-h-[80px] rounded-lg bg-state placeholder:text-gray-dark focus:bg-white focus:border-2 focus:border-navy"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                disabled={isSaving}
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              onClick={handleSimpanJawaban}
              disabled={isSaving}
              className="rounded-lg bg-navy hover:bg-navy-hover text-white disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Jawaban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
