import { useCallback, useMemo, useState } from "react";
import { auditData } from "@/mocks/tableData.js";
import { Download, FileText } from "lucide-react";
import { PaginateControls, SearchBar, StatusDropdown, Table as AdminTable } from "@/components/admin/table";
import { OverlayForm } from "@/components/admin/audit/OverlayForm";
import { AlertIconDialog } from "@/components/admin/audit/AlertIconDialog";
import { DeleteDialog } from "@/components/admin/audit/DeleteDialog";

const FILTER_OPTIONS = [
  { value: "Semua Status" },
  { value: "Draft" },
  { value: "In Progress" },
  { value: "Reviewed" },
  { value: "Approved" },
];

const PAGINATE_OPTIONS = [10, 20, 50, 100];

const AUDIT_COLUMNS = [
  {
    key: "judul",
    header: "Judul",
    headerClassName: "text-left text-navy",
    cellClassName: "text-navy text-left",
    accessor: "judul",
  },
  {
    key: "lokasi",
    header: "Lokasi",
    headerClassName: "text-center",
    cellClassName: "text-center",
    accessor: "lokasi",
  },
  {
    key: "tanggalAudit",
    header: "Tanggal Audit",
    headerClassName: "text-center",
    cellClassName: "text-center",
    accessor: "tanggalAudit",
  },
  {
    key: "leadAuditor",
    header: "Lead Auditor",
    headerClassName: "text-center",
    cellClassName: "text-center",
    accessor: "leadAuditor",
  },
  {
    key: "auditor",
    header: "Auditor",
    headerClassName: "text-center",
    cellClassName: "text-center",
    accessor: "auditor",
  },
  {
    key: "revisi",
    header: "Revisi",
    headerClassName: "text-center",
    cellClassName: "text-center",
    accessor: "revisi",
  },
  {
    key: "status",
    header: "Status",
    headerClassName: "text-center",
    cellClassName: "text-center",
    render: (row) => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          row.status === "In Progress"
            ? "bg-yellow-100 text-yellow-700"
            : row.status === "Reviewed"
            ? "bg-blue-100 text-blue-700"
            : row.status === "Approved"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "aksi",
    header: "Aksi",
    headerClassName: "text-center",
    cellClassName: "flex justify-center gap-4",
    render: (row) => (
      <>
        <AlertIconDialog type="view" row={row} />
        <AlertIconDialog type="edit" row={row} />
        <FileText className="text-[#00C950] w-5 h-5 cursor-pointer" />
        <Download className="text-[#F1C441] w-5 h-5 cursor-pointer" />
        <DeleteDialog row={row} />
      </>
    ),
  },
];

function useAuditDocuments() {
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isModalDropdownOpen, setIsModalDropdownOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("Draft");
  const [perPage, setPerPage] = useState(10);
  const [activePage, setActivePage] = useState(1);

  const filteredData = useMemo(() => {
    return statusFilter === "Semua Status"
      ? auditData
      : auditData.filter((item) => item.status === statusFilter);
  }, [statusFilter]);

  const totalData = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const currentPage = Math.min(activePage, totalPages);

  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    return filteredData.slice(startIndex, startIndex + perPage);
  }, [filteredData, currentPage, perPage]);

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
  }, []);

  return {
    statusFilter,
    setStatusFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    isModalDropdownOpen,
    setIsModalDropdownOpen,
    modalStatus,
    setModalStatus,
    perPage,
    currentPage,
    setActivePage,
    pagedData,
    totalData,
    totalPages,
    handlePaginateChange,
  };
}

export default function DokumenAudit() {
  const {
    statusFilter,
    setStatusFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    isModalDropdownOpen,
    setIsModalDropdownOpen,
    modalStatus,
    setModalStatus,
    perPage,
    currentPage,
    setActivePage,
    pagedData,
    totalData,
    totalPages,
    handlePaginateChange,
  } = useAuditDocuments();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SearchBar className="w-[1082px]"/>

      <StatusDropdown
        isMenuOpen={isFilterDropdownOpen}
        setIsMenuOpen={setIsFilterDropdownOpen}
        value={statusFilter}
        onChange={setStatusFilter}
        options={FILTER_OPTIONS}
        classNameButton="w-[204px]! h-14!"
        classNameDropdown="w-[204px]!"
      />

      <OverlayForm
        isStatusDropdownOpen={isModalDropdownOpen}
        setIsStatusDropdownOpen={setIsModalDropdownOpen}
        statusValue={modalStatus}
        onStatusChange={setModalStatus}
      />

      <AdminTable
        columns={AUDIT_COLUMNS}
        data={pagedData}
        getRowKey={(row, index) => `${row.judul}-${index}`}
      />

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
    </div>
  );
}
