import { useMemo, useState } from "react";
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

export default function AspekPertanyaan() {
  const { id } = useParams();
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
    aspekName = "Jenis Aspek 1",
    mode = "view", // "view" or "fill"
  } = location.state || {};

  const [activeTab, setActiveTab] = useState("aspek");
  const [selectedKategori, setSelectedKategori] = useState("kategori-1");
  const [expandedAspek, setExpandedAspek] = useState("aspek-1");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    jawaban: "",
    observasi: "",
    verifikasi: "",
    rekomenDokumen: "",
  });

  // Mock data for navigator
  const navigatorData = useMemo(
    () => [
      {
        id: "aspek-1",
        name: "Jenis Aspek 1",
        categories: [
          { id: "kategori-1", name: "Jenis Kategori 1", isActive: true },
          { id: "kategori-2", name: "Jenis Kategori 2", isActive: false },
          { id: "kategori-3", name: "Jenis Kategori 3", isActive: false },
        ],
      },
      {
        id: "aspek-2",
        name: "Jenis Aspek 1",
        categories: [
          { id: "kategori-4", name: "Jenis Kategori 4", isActive: false },
          { id: "kategori-5", name: "Jenis Kategori 5", isActive: false },
        ],
      },
    ],
    []
  );

  // Mock data for questions
  const questionsData = useMemo(
    () => [
      {
        id: 1,
        aspek: "Jenis Aspek 1",
        kategori: "Jenis Kategori 1",
        question: "Apakah rekaman CCTV disimpan minimal 30 hari?",
        status: "not-answered",
        jawaban: null,
        observasi: null,
        verifikasi: null,
        rekomenDokumen: null,
      },
      {
        id: 2,
        aspek: "Jenis Aspek 1",
        kategori: "Jenis Kategori 1",
        question: "Apakah rekaman CCTV disimpan minimal 30 hari?",
        status: "answered",
        jawaban: "Parsial",
        observasi: "CCTV terpasang di 4 dari 6 area data center",
        verifikasi: "Verified melalui observasi fisik",
        rekomenDokumen: "Denah CCTV, foto area tidak tercakup",
      },
      {
        id: 3,
        aspek: "Jenis Aspek 1",
        kategori: "Jenis Kategori 1",
        question: "Apakah rekaman CCTV disimpan minimal 30 hari?",
        status: "not-answered",
        jawaban: null,
        observasi: null,
        verifikasi: null,
        rekomenDokumen: null,
      },
    ],
    []
  );

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

  const handleSimpanJawaban = () => {
    console.log(
      "Simpan jawaban:",
      formData,
      "untuk question:",
      selectedQuestion.id
    );
    // Update question with new answer
    setDialogOpen(false);
  };

  const toggleAspek = (aspekId) => {
    setExpandedAspek(expandedAspek === aspekId ? null : aspekId);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "excel") {
      navigate(`/admin/audit/dokumen/${id}/excel/${id}`, {
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
            to={`/admin/audit/dokumen/${id}`}
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
              Pencapaian Target Uptime 99,995%
            </p>
          </div>
          <div>
            <p className="text-gray-dark small mb-1">Jenis Aspek</p>
            <p className="text-[#2B7FFF] body-medium">{aspekName}</p>
          </div>
          <div>
            <p className="text-gray-dark small mb-1">Jenis Kategori</p>
            <p className="text-[#2B7FFF] body-medium">Jenis Kategori 1</p>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questionsData.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-lg border border-gray-300 p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-navy small">
                      Aspek: {question.aspek}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-navy small">
                      Kategori: {question.kategori}
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
                    <p className="text-navy body">{question.jawaban}</p>
                  </div>
                  <div>
                    <p className="text-gray-dark small mb-1">Observasi:</p>
                    <p className="text-navy body">{question.observasi}</p>
                  </div>
                  <div>
                    <p className="text-gray-dark small mb-1">Verifikasi:</p>
                    <p className="text-navy body">{question.verifikasi}</p>
                  </div>
                  <div>
                    <p className="text-gray-dark small mb-1">
                      Rekaman Dokumen:
                    </p>
                    <p className="text-navy body">{question.rekomenDokumen}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigator Sidebar */}
      <div className="w-80 bg-white rounded-lg border border-gray-300 p-6 h-fit sticky top-8">
        <h3 className="heading-3 text-navy mb-4">Navigator Pertanyaan</h3>

        <div className="space-y-2">
          {navigatorData.map((aspek) => (
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
                  {aspek.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedKategori(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 small ${
                        selectedKategori === category.id
                          ? "bg-[#D4EDDA] text-[#155724] font-medium"
                          : "text-gray-dark hover:bg-gray-100"
                      }`}
                    >
                      {selectedKategori === category.id && (
                        <div className="h-2 w-2 rounded-full bg-[#28A745] shrink-0" />
                      )}
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
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
              <Button type="button" variant="outline" className="rounded-lg">
                Batal
              </Button>
            </DialogClose>
            <Button
              onClick={handleSimpanJawaban}
              className="rounded-lg bg-navy hover:bg-navy-hover text-white"
            >
              Simpan Jawaban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
