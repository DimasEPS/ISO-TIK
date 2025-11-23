import { useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewExcelAuditTable } from "@/components/admin/audit/ReviewExcelAuditTable";
import { reviewExcelData } from "@/mocks/excelAuditData";

// Navigator data
const navigatorData = [
  {
    id: 1,
    name: "Fully Redundant Critical Systems",
    expanded: true,
  },
  {
    id: 2,
    name: "Jenis Checklist excel 1",
    expanded: false,
  },
  {
    id: 3,
    name: "Jenis Checklist excel 2",
    expanded: false,
  },
];

function ReviewPertanyaanExcel() {
  const { id, checklistId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { dokumenTitle, lokasi, tanggalAudit, revisi, mode } =
    location.state || {};
  const [activeTab, setActiveTab] = useState("excel");
  const [reviewData, setReviewData] = useState(reviewExcelData);
  const [checklistExcel, setChecklistExcel] = useState(navigatorData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [komentarReviewer, setKomentarReviewer] = useState("");

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
      // Navigate to ReviewAspekPertanyaan
      navigate(`/admin/audit/dokumen/${id}/review/${checklistId}`, {
        state: { dokumenTitle, lokasi, tanggalAudit, revisi, mode },
      });
    }
  };

  const handleOpenDialog = (item, sectionCode) => {
    setSelectedItem({ ...item, sectionCode });
    setKomentarReviewer(
      item.reviewer?.comment ||
        (item.komentarReviewer === "Belum diisi"
          ? ""
          : item.komentarReviewer || "")
    );
    setDialogOpen(true);
  };

  const handleSimpanKomentar = () => {
    if (!selectedItem) return;

    const trimmedComment = komentarReviewer.trim();

    setReviewData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.code !== selectedItem.sectionCode) return section;
        return {
          ...section,
          items: section.items.map((item) => {
            if (item.id !== selectedItem.id) return item;
            const updatedComment =
              trimmedComment !== "" ? trimmedComment : item.komentarReviewer;

            return {
              ...item,
              komentarReviewer: updatedComment,
              statusReview:
                item.statusReview === "sudah" || trimmedComment === ""
                  ? item.statusReview
                  : "sudah",
            };
          }),
        };
      }),
    }));
    setDialogOpen(false);
    setSelectedItem(null);
    setKomentarReviewer("");
  };

  const handleTandaiDireview = (item, sectionCode) => {
    setReviewData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.code !== sectionCode) return section;
        return {
          ...section,
          items: section.items.map((row) =>
            row.id === item.id ? { ...row, statusReview: "sudah" } : row
          ),
        };
      }),
    }));
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
          {/* Info Header */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="small text-gray-dark mb-1">Jenis Checklist</p>
              <p className="body-medium text-[#2B7FFF]">
                Fully Redundant Critical Systems
              </p>
            </div>
            <div>
              <p className="small text-gray-dark mb-1">Jenis Checklist Excel</p>
              <p className="body-medium text-[#2B7FFF]">
                Fully Redundant Critical Systems
              </p>
            </div>
          </div>

          {/* Review Excel Table */}
          <ReviewExcelAuditTable
            data={reviewData}
            onKomentarClick={handleOpenDialog}
            onTandaiDireview={handleTandaiDireview}
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
                <p className="body text-navy">{selectedItem?.buktiObjektif}</p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Kesesuaian</p>
                <p className="body text-navy">{selectedItem?.kesesuaian}</p>
              </div>
              <div>
                <p className="small text-gray-dark mb-1">Catatan Editor</p>
                <p className="body text-navy">{selectedItem?.catatanEditor}</p>
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

export default ReviewPertanyaanExcel;
