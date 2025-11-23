import { useCallback, useEffect, useState } from "react";
import { profileService } from "@/services/profileService";

export function useActivityLog({ token, initialPerPage = 10 } = {}) {
  const [perPage, setPerPage] = useState(initialPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, last_page: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(
    async (page, size) => {
      if (!token) {
        setData([]);
        setMeta({ total: 0, last_page: 0 });
        return;
      }

      setLoading(true);
      try {
        const response = await profileService.getActivityLogs({
          token,
          page,
          perPage: size,
        });
        const items = response.data || [];
        const total = response.meta?.total ?? items.length ?? 0;
        const lastPage = response.meta?.last_page ?? (total > 0 ? Math.ceil(total / size) : 0);
        setData(items);
        setMeta({
          total,
          last_page: lastPage,
        });
        setError(null);
      } catch (err) {
        setError(err.message || "Gagal memuat aktivitas");
        setData([]);
        setMeta({ total: 0, last_page: 0 });
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchLogs(currentPage, perPage);
  }, [fetchLogs, currentPage, perPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePaginateChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  return {
    perPage,
    currentPage,
    data,
    totalData: meta.total ?? data.length,
    totalPages: meta.last_page ?? 0,
    loading,
    error,
    handlePageChange,
    handlePaginateChange,
    refetch: fetchLogs,
  };
}
