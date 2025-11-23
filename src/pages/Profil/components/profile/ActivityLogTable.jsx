import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/pages/Admin/NCR/components/common";

/**
 * Reusable Activity Log Table Component
 * @param {Array} data - Activity log data
 * @param {number} perPage - Items per page
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {number} totalData - Total number of data items
 * @param {Function} onPageChange - Callback for page change
 * @param {Function} onPaginateChange - Callback for per page change
 */
export function ActivityLogTable({
  data = [],
  perPage,
  currentPage,
  totalPages,
  totalData,
  onPageChange,
  onPaginateChange,
  loading = false,
  error = null,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-navy mb-4">Log Aktivitas</h3>
      <p className="text-sm text-gray-600 mb-4">
        Riwayat aktivitas terbaru milik anda
      </p>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-600 hover:bg-blue-600">
              <TableHead className="text-white font-semibold">Waktu</TableHead>
              <TableHead className="text-white font-semibold">Aksi</TableHead>
              <TableHead className="text-white font-semibold">Tabel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                  Memuat data aktivitas...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-red-500 py-8">
                  {error}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                  Tidak ada data aktivitas
                </TableCell>
              </TableRow>
            ) : (
              data.map((log, index) => (
                <TableRow key={log.id || index}>
                  <TableCell className="text-navy">
                    {formatDate(log.created_at || log.waktu || log.timestamp || log.createdAt)}
                  </TableCell>
                  <TableCell className="text-navy font-medium">
                    {log.action_type || log.aksi || log.action}
                  </TableCell>
                  <TableCell className="text-navy">
                    {log.table_name || log.tabel || log.table || log.module}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && totalPages > 0 && (
        <PaginationControls
          perPage={perPage}
          currentPage={currentPage}
          totalPages={totalPages}
          totalData={totalData}
          onPageChange={onPageChange}
          onPaginateChange={onPaginateChange}
        />
      )}
    </div>
  );
}
