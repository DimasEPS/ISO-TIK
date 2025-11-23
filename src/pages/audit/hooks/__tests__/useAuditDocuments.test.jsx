import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuditDocuments } from '../useAuditDocuments';
import { auditService } from '@/services/auditService';

// Mock the audit service
vi.mock('@/services/auditService', () => ({
  auditService: {
    listDocuments: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

describe('useAuditDocuments', () => {
  let queryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('listDocuments', () => {
    it('should fetch documents successfully', async () => {
      const mockData = {
        data: [
          {
            id: '1',
            title: 'Test Audit',
            audit_period: '2025-12-15T00:00:00Z',
            location: 'Jakarta',
            lead_auditor: 'John Doe',
            auditor_name: 'Jane Smith',
            revision: '1.0',
            status: 'draft',
          },
        ],
        meta: {
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
        },
      };

      auditService.listDocuments.mockResolvedValue(mockData);

      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagedData).toHaveLength(1);
      expect(result.current.pagedData[0]).toMatchObject({
        id: '1',
        judul: 'Test Audit',
        lokasi: 'Jakarta',
        leadAuditor: 'John Doe',
        auditor: 'Jane Smith',
        revisi: '1.0',
      });
      expect(result.current.totalPages).toBe(1);
      expect(result.current.totalData).toBe(1);
    });

    it('should handle empty data', async () => {
      auditService.listDocuments.mockResolvedValue({
        data: [],
        meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 },
      });

      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagedData).toHaveLength(0);
      expect(result.current.totalData).toBe(0);
    });

    it('should handle error', async () => {
      const error = new Error('Network error');
      auditService.listDocuments.mockRejectedValue(error);

      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('search and filter', () => {
    it('should update search query', async () => {
      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      expect(result.current.searchQuery).toBe('');

      result.current.setSearchQuery('Test Search');

      expect(result.current.searchQuery).toBe('Test Search');
    });

    it('should update status filter', async () => {
      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      expect(result.current.statusFilter).toBe('Semua Status');

      result.current.setStatusFilter('Approved');

      expect(result.current.statusFilter).toBe('Approved');
    });

    it('should reset to page 1 when searching', async () => {
      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      // Set active page to 2
      result.current.setActivePage(2);
      expect(result.current.activePage).toBe(2);

      // Search should reset to page 1
      result.current.setSearchQuery('Test');

      await waitFor(() => {
        expect(result.current.activePage).toBe(1);
      });
    });

    it('should reset to page 1 when changing filter', async () => {
      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      result.current.setActivePage(3);
      expect(result.current.activePage).toBe(3);

      result.current.setStatusFilter('Draft');

      await waitFor(() => {
        expect(result.current.activePage).toBe(1);
      });
    });
  });

  describe('pagination', () => {
    it('should update per page and reset to page 1', async () => {
      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      expect(result.current.perPage).toBe(10);

      result.current.handlePaginateChange(20);

      expect(result.current.perPage).toBe(20);
      expect(result.current.activePage).toBe(1);
    });

    it('should update active page', async () => {
      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      result.current.setActivePage(2);

      expect(result.current.activePage).toBe(2);
    });
  });

  describe('mutations', () => {
    it('should create document successfully', async () => {
      const newDocument = {
        title: 'New Audit',
        location: 'Bandung',
        audit_period: '2025-12-20',
        lead_auditor: 'Test Lead',
        auditor_name: 'Test Auditor',
        revision: '1.0',
        status: 'draft',
      };

      auditService.createDocument.mockResolvedValue({ data: { ...newDocument, id: '2' } });

      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.createDocument(newDocument);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(auditService.createDocument).toHaveBeenCalledWith(newDocument);
    });

    it('should update document successfully', async () => {
      const documentId = '1';
      const updatedData = {
        title: 'Updated Audit',
        status: 'approved',
      };

      auditService.updateDocument.mockResolvedValue({ data: { id: documentId, ...updatedData } });

      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.updateDocument({ documentId, payload: updatedData });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(auditService.updateDocument).toHaveBeenCalledWith(documentId, updatedData);
    });

    it('should delete document successfully', async () => {
      const documentId = '1';

      auditService.deleteDocument.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.deleteDocument(documentId);

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(auditService.deleteDocument).toHaveBeenCalledWith(documentId);
    });
  });

  describe('data mapping', () => {
    it('should map backend response to frontend format correctly', async () => {
      const mockData = {
        data: [
          {
            id: 'abc-123',
            title: 'ISO Audit 2025',
            audit_period: '2025-03-15T00:00:00Z',
            location: 'Surabaya',
            lead_auditor: 'Lead Name',
            auditor_name: 'Auditor Name',
            revision: 'Rev 2.0',
            status: 'in_progress',
          },
        ],
        meta: {
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
        },
      };

      auditService.listDocuments.mockResolvedValue(mockData);

      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mappedItem = result.current.pagedData[0];
      expect(mappedItem.id).toBe('abc-123');
      expect(mappedItem.judul).toBe('ISO Audit 2025');
      expect(mappedItem.tanggalAudit).toBe('15/03/2025'); // Indonesian date format
      expect(mappedItem.lokasi).toBe('Surabaya');
      expect(mappedItem.leadAuditor).toBe('Lead Name');
      expect(mappedItem.auditor).toBe('Auditor Name');
      expect(mappedItem.revisi).toBe('Rev 2.0');
      expect(mappedItem.status).toBe('in_progress');
    });

    it('should handle missing optional fields', async () => {
      const mockData = {
        data: [
          {
            id: '1',
            title: 'Minimal Audit',
            audit_period: null,
            location: null,
            lead_auditor: null,
            auditor_name: null,
            revision: null,
            status: 'draft',
          },
        ],
        meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
      };

      auditService.listDocuments.mockResolvedValue(mockData);

      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mappedItem = result.current.pagedData[0];
      expect(mappedItem.tanggalAudit).toBe('-');
      expect(mappedItem.lokasi).toBe('-');
      expect(mappedItem.leadAuditor).toBe('-');
      expect(mappedItem.auditor).toBe('-');
      expect(mappedItem.revisi).toBe('-');
    });
  });

  describe('status mapping', () => {
    it('should map frontend status to backend enum', async () => {
      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      result.current.setStatusFilter('In Progress');

      await waitFor(() => {
        expect(auditService.listDocuments).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'in_progress',
          })
        );
      });
    });

    it('should not send status param for "Semua Status"', async () => {
      const { result } = renderHook(() => useAuditDocuments(), { wrapper });

      result.current.setStatusFilter('Semua Status');

      await waitFor(() => {
        const lastCall = auditService.listDocuments.mock.calls[auditService.listDocuments.mock.calls.length - 1];
        expect(lastCall[0]).not.toHaveProperty('status');
      });
    });
  });
});
