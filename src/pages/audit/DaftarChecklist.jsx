import { useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { SearchBar, PaginateControls } from "@/components/admin/table";
import { ChevronRight } from "lucide-react";
import { useDocumentChecklists } from "./hooks/useDocumentChecklists";
import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

const PAGINATE_OPTIONS = [10, 20, 50, 100];

export default function DaftarChecklist() {
  const { id: documentId } = useParams();
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

  // Get data from location state (passed from AlertIconDialog in DokumenAudit)
  const {
    dokumenTitle = "Checklist Audit 2025",
    lokasi = "Bandar Lampung",
    tanggalAudit = "27/4/2025",
    revisi = "1.0",
    mode = "view", // "view" or "fill"
  } = location.state || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);

  // Get document detail
  const { data: _documentDetail } = useQuery({
    queryKey: ["auditDocument", documentId],
    queryFn: () => auditService.getAuditDocument(documentId),
    select: (response) => response.data.audit_document,
    staleTime: 5 * 60 * 1000,
  });

  // Get checklists for this document
  const { checklists: checklistsData = [] } = useDocumentChecklists(documentId);

  // Use real data if available, fallback to mock
  const checklistCards = useMemo(() => {
    if (checklistsData && checklistsData.length > 0) {
      return checklistsData;
    }
    // Fallback mock data
    return [];
  }, [checklistsData]);

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return checklistCards;

    const query = searchQuery.toLowerCase();
    return checklistCards.filter(
      (card) =>
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query)
    );
  }, [checklistCards, searchQuery]);

  // Pagination
  const totalData = filteredCards.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const currentPage = Math.min(activePage, totalPages);

  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    return filteredCards.slice(startIndex, startIndex + perPage);
  }, [filteredCards, currentPage, perPage]);

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
    setActivePage(1);
  }, []);

  const handleCardClick = (card) => {
    // If mode is "view", go to Review page, otherwise go to Aspek Pertanyaan
    if (mode === "view") {
      navigate(`/admin/audit/dokumen/${documentId}/review/${card.id}`, {
        state: {
          dokumenTitle,
          lokasi,
          tanggalAudit,
          revisi,
          checklistTitle: card.title,
          mode,
        },
      });
    } else {
      navigate(`/admin/audit/dokumen/${documentId}/aspek/${card.id}`, {
        state: {
          dokumenTitle,
          lokasi,
          tanggalAudit,
          revisi,
          aspekName: card.title,
          mode,
        },
      });
    }
  };

  // Dynamic title based on mode
  const pageTitle =
    mode === "view" ? "Daftar Checklist Review" : "Daftar Checklist";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link to="/admin/audit" className="text-[#2B7FFF] hover:underline body">
          Dokumen Audit
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-dark" />
        <span className="text-gray-dark body">{pageTitle}</span>
      </div>

      {/* Page Title */}
      <div>
        <h2 className="heading-2 text-navy">{pageTitle}</h2>
      </div>

      {/* Checklist Info */}
      <div className="grid grid-cols-4 gap-6">
        <div>
          <p className="text-gray-dark small mb-1">Judul Dokumen</p>
          <p className="text-[#2B7FFF] body-medium">{dokumenTitle}</p>
        </div>
        <div>
          <p className="text-gray-dark small mb-1">Revisi</p>
          <p className="text-[#2B7FFF] body-medium">{revisi}</p>
        </div>
        <div>
          <p className="text-gray-dark small mb-1">Tanggal Audit</p>
          <p className="text-[#2B7FFF] body-medium">{tanggalAudit}</p>
        </div>
        <div>
          <p className="text-gray-dark small mb-1">Lokasi</p>
          <p className="text-[#2B7FFF] body-medium">{lokasi}</p>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Cari checklist"
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-4">
        {pagedData.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            className="bg-white rounded-lg border border-gray-300 p-6 text-left hover:border-navy hover:shadow-lg transition-all duration-200"
          >
            <h3 className="body-large text-navy font-semibold mb-2 line-clamp-2">
              {card.title}
            </h3>
            <p className="text-gray-dark small mb-6 line-clamp-2">
              {card.description}
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-dark small">Aspek</span>
                <span className="text-navy body-medium font-semibold">
                  {card.aspects_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-dark small">Kategori</span>
                <span className="text-navy body-medium font-semibold">
                  {card.categories_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-dark small">Pertanyaan</span>
                <span className="text-navy body-medium font-semibold">
                  {card.questions_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-dark small">Checklist Excel</span>
                <span className="text-navy body-medium font-semibold">
                  {card.excel_checklists_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-dark small">Item Audit</span>
                <span className="text-navy body-medium font-semibold">
                  {card.excel_questions_count || 0}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {pagedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-dark body">Tidak ada checklist ditemukan</p>
        </div>
      )}

      {/* Pagination */}
      {totalData > 0 && (
        <PaginateControls
          perPage={perPage}
          onPaginateChange={handlePaginateChange}
          paginateValue={PAGINATE_OPTIONS}
          setActivePage={setActivePage}
          activePage={currentPage}
          onPageChange={setActivePage}
          totalPages={totalPages}
          totalData={totalData}
        />
      )}
    </div>
  );
}
