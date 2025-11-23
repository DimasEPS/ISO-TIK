import { useCallback, useMemo, useState } from "react";
import { DEFAULT_PER_PAGE, DEFAULT_PAGE } from "../constants";

export function useNCRDocuments(data) {
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [activePage, setActivePage] = useState(DEFAULT_PAGE);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data]);

  const totalData = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const currentPage = Math.min(activePage, totalPages);

  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    return filteredData.slice(startIndex, startIndex + perPage);
  }, [filteredData, currentPage, perPage]);

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
    setActivePage(1);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    perPage,
    currentPage,
    setActivePage,
    pagedData,
    totalData,
    totalPages,
    handlePaginateChange,
  };
}

export function useCaseDocuments(data) {
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [activePage, setActivePage] = useState(DEFAULT_PAGE);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    return data.filter(
      (item) =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bagianTerkait.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data]);

  const totalData = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const currentPage = Math.min(activePage, totalPages);

  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    return filteredData.slice(startIndex, startIndex + perPage);
  }, [filteredData, currentPage, perPage]);

  const handlePaginateChange = useCallback((value) => {
    setPerPage(Number(value));
    setActivePage(1);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    perPage,
    currentPage,
    setActivePage,
    pagedData,
    totalData,
    totalPages,
    handlePaginateChange,
  };
}
