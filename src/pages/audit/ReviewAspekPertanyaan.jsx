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
import { Textarea } from "@/components/ui/textarea";

// Mock data untuk review
const mockReviewData = {
  aspekList: [
    {
      id: 1,
      name: "Jenis Aspek 1",
      expanded: true,
      categories: [
        {
          id: 1,
          name: "Jenis Kategori 1",
          questions: [
            {
              id: 1,
              text: "Apakah rekaman CCTV dilampan minimal 30 hari?",
              status: "belum",
              jawaban: "-",
              observasi: "-",
              verifikasi: "-",
              rencanaLokumen: "-",
              reviewer: null,
            },
            {
              id: 2,
              text: "Apakah rekaman CCTV dilampan minimal 30 hari?",
              status: "sudah",
              jawaban: "Parsial",
              observasi: "CCTV terpasang di 4 dari 6 area data center",
              verifikasi: "Verified melalui observasi fisik",
              rencanaLokumen: "Denah CCTV, foto area tidak tercakup",
              reviewer: {
                name: "Admin Reviewer",
                date: "8/1/2025",
                comment: "-",
              },
            },
          ],
        },
        {
          id: 2,
          name: "Jenis Kategori 2",
          questions: [],
        },
        {
          id: 3,
          name: "Jenis Kategori 3",
          questions: [],
        },
      ],
    },
    {
      id: 2,
      name: "Jenis Aspek 1",
      expanded: false,
      categories: [],
    },
  ],
};

function ReviewAspekPertanyaan() {
  const { id, checklistId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { dokumenTitle, lokasi, tanggalAudit, revisi, mode } =
    location.state || {};
  const [activeTab, setActiveTab] = useState("aspek");
  const [aspekList, setAspekList] = useState(mockReviewData.aspekList);
  const [selectedQuestion, setSelectedQuestion] = useState(
    mockReviewData.aspekList[0].categories[0].questions[0]
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [komentarReviewer, setKomentarReviewer] = useState("");

  const toggleAspek = (aspekId) => {
    setAspekList(
      aspekList.map((aspek) =>
        aspek.id === aspekId ? { ...aspek, expanded: !aspek.expanded } : aspek
      )
    );
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
    setKomentarReviewer(question.reviewer?.comment || "");
    setDialogOpen(true);
  };

  const handleTandaiDireview = () => {
    // Mark as reviewed
    console.log("Tandai Direview clicked for question:", selectedQuestion.id);
  };

  const handleSimpanKomentar = () => {
    console.log("Simpan Komentar:", komentarReviewer);
    setDialogOpen(false);
    setKomentarReviewer("");
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
          {/* Info Header */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="small text-gray-dark mb-1">Jenis Checklist</p>
              <p className="body-medium text-[#2B7FFF]">
                Pencapaian Target Uptime 99,995%
              </p>
            </div>
            <div>
              <p className="small text-gray-dark mb-1">Jenis Aspek</p>
              <p className="body-medium text-[#2B7FFF]">Jenis Aspek 1</p>
            </div>
            <div>
              <p className="small text-gray-dark mb-1">Jenis Kategori</p>
              <p className="body-medium text-[#2B7FFF]">Jenis Kategori 1</p>
            </div>
          </div>

          {/* Question Cards - Display all questions */}
          <div className="space-y-4">
            {mockReviewData.aspekList[0].categories[0].questions.map(
              (question) => (
                <div
                  key={question.id}
                  className="border-2 border-[#D8E2FF] rounded-xl p-6 bg-white space-y-4"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-navy body font-medium shrink-0">
                        {question.id}.
                      </span>
                      <p className="text-navy body font-medium flex-1">
                        {question.text}
                      </p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="small text-gray-dark">Aspek:</span>
                      <span className="small text-navy font-medium">
                        Jenis Aspek 1
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="small text-gray-dark">Kategori:</span>
                      <span className="small text-navy font-medium">
                        Jenis Kategori 1
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded small font-medium ${
                        question.status === "sudah"
                          ? "bg-[#2B7FFF] text-white"
                          : "bg-[#FFF4E5] text-[#FF9800]"
                      }`}
                    >
                      {question.status === "sudah"
                        ? "Sudah Direview"
                        : "Belum Direview"}
                    </span>
                  </div>

                  {/* Answer Details */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <p className="small text-gray-dark mb-1">Jawaban:</p>
                      <p className="body text-navy">{question.jawaban}</p>
                    </div>
                    <div>
                      <p className="small text-gray-dark mb-1">Observasi:</p>
                      <p className="body text-navy">{question.observasi}</p>
                    </div>
                    <div>
                      <p className="small text-gray-dark mb-1">Verifikasi:</p>
                      <p className="body text-navy">{question.verifikasi}</p>
                    </div>
                    <div>
                      <p className="small text-gray-dark mb-1">
                        Rencana Dokumen:
                      </p>
                      <p className="body text-navy">
                        {question.rencanaLokumen}
                      </p>
                    </div>
                  </div>

                  {/* Review Section */}
                  {question.reviewer && (
                    <div className="bg-[#E8F5E9] p-4 rounded-lg space-y-2">
                      <p className="small text-gray-dark">Admin Reviewer</p>
                      <p className="body text-navy font-medium">
                        {question.reviewer.name}
                      </p>
                      <div>
                        <p className="small text-gray-dark">Tanggal:</p>
                        <p className="body text-navy">
                          {question.reviewer.date}
                        </p>
                      </div>
                      <div>
                        <p className="small text-gray-dark">
                          Komentar Reviewer:
                        </p>
                        <p className="body text-navy">
                          {question.reviewer.comment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleIsiReview(question)}
                      className="rounded-lg bg-[#2B7FFF] hover:bg-[#1a5fcf] text-white"
                    >
                      Isi Review
                    </Button>
                    <Button
                      onClick={() => handleTandaiDireview()}
                      className="rounded-lg bg-[#28A745] hover:bg-[#1e8035] text-white"
                    >
                      Tandai Direview
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Navigator Sidebar */}
        <div className="w-80 shrink-0">
          <div className="border rounded-lg p-4 bg-white sticky top-6">
            <h3 className="body-medium text-navy mb-4">Navigator Pertanyaan</h3>

            <div className="space-y-2">
              {aspekList.map((aspek) => (
                <div key={aspek.id}>
                  <button
                    onClick={() => toggleAspek(aspek.id)}
                    className="w-full flex items-center justify-between p-2 hover:bg-state rounded transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {aspek.expanded && (
                        <div className="w-2 h-2 rounded-full bg-[#28A745] shrink-0" />
                      )}
                      <span
                        className={`body ${
                          aspek.expanded
                            ? "text-navy font-medium"
                            : "text-gray-dark"
                        }`}
                      >
                        {aspek.name}
                      </span>
                    </div>
                    {aspek.expanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-dark shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-dark shrink-0" />
                    )}
                  </button>

                  {aspek.expanded && aspek.categories.length > 0 && (
                    <div className="pl-6 mt-1 space-y-1">
                      {aspek.categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            if (category.questions.length > 0) {
                              setSelectedQuestion(category.questions[0]);
                            }
                          }}
                          className={`w-full text-left p-2 rounded body transition-colors ${
                            category.id === 1
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
            <p className="small text-gray-dark mt-1">{currentQuestion?.text}</p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Question Details */}
            <div className="space-y-3">
              <div>
                <p className="small text-gray-dark mb-1">Jawaban:</p>
                <p className="body text-navy">{currentQuestion?.jawaban}</p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Observasi:</p>
                <p className="body text-navy">{currentQuestion?.observasi}</p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Verifikasi:</p>
                <p className="body text-navy">{currentQuestion?.verifikasi}</p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Rekaman Dokumen:</p>
                <p className="body text-navy">
                  {currentQuestion?.rencanaLokumen}
                </p>
              </div>
            </div>

            {/* Existing Review Section (if exists) */}
            {currentQuestion?.reviewer && (
              <div className="bg-[#E8F5E9] p-4 rounded-lg space-y-2 border border-[#28A745]">
                <p className="small text-gray-dark">Admin Reviewer</p>
                <p className="body text-navy font-medium">
                  {currentQuestion.reviewer.name}
                </p>
                <div>
                  <p className="small text-gray-dark">Tanggal:</p>
                  <p className="body text-navy">
                    {currentQuestion.reviewer.date}
                  </p>
                </div>
                <div>
                  <p className="small text-gray-dark">Komentar Reviewer:</p>
                  <p className="body text-navy">
                    {currentQuestion.reviewer.comment}
                  </p>
                </div>
              </div>
            )}

            {/* Comment Form */}
            <div>
              <label className="body-medium text-navy mb-2 block">
                {currentQuestion?.reviewer
                  ? "Edit Komentar"
                  : "Berikan Komentar"}
              </label>
              <Textarea
                value={komentarReviewer}
                onChange={(e) => setKomentarReviewer(e.target.value)}
                placeholder="Masukkan komentar..."
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  setKomentarReviewer("");
                }}
                variant="outline"
                className="rounded-lg"
              >
                Batal
              </Button>
              <Button
                onClick={handleSimpanKomentar}
                className="rounded-lg bg-navy hover:bg-navy/90 text-white"
              >
                Simpan Komentar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReviewAspekPertanyaan;
