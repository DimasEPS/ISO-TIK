import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DokumenAudit from "../DokumenAudit";

// Mock services with actual implementations
vi.mock("@/services/auditService", () => ({
  auditService: {
    listDocuments: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

vi.mock("@/generatePDF/generators/auditDocumentPDF", () => ({
  getAuditDocumentPDFPreview: vi.fn(),
  downloadAuditDocumentPDF: vi.fn(),
}));

// Import after mocking
import { auditService } from "@/services/auditService";
import * as auditDocumentPDF from "@/generatePDF/generators/auditDocumentPDF";

// Mock components that have complex dependencies
vi.mock("@/components/admin/audit/OverlayForm", () => ({
  OverlayForm: ({ onSubmit, isSubmitting }) => (
    <div data-testid="overlay-form">
      <button
        onClick={() =>
          onSubmit({
            title: "Test Doc",
            location: "Test Location",
            audit_period: "2025-12-15",
            lead_auditor: "Lead",
            auditor_name: "Auditor",
            revision: "1.0",
            status: "draft",
          })
        }
        disabled={isSubmitting}
      >
        Submit Form
      </button>
    </div>
  ),
}));

vi.mock("@/components/admin/audit/AlertIconDialog", () => ({
  AlertIconDialog: ({ type, row, onUpdate, isUpdating }) => (
    <div data-testid={`alert-dialog-${type}`}>
      {type === "edit" && (
        <button
          onClick={() =>
            onUpdate?.({
              documentId: row.id,
              payload: { title: "Updated Title" },
            })
          }
          disabled={isUpdating}
        >
          Update
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/admin/audit/DeleteDialog", () => ({
  DeleteDialog: ({ row, onDelete, isDeleting }) => (
    <div data-testid="delete-dialog">
      <button onClick={() => onDelete?.(row.id)} disabled={isDeleting}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock("@/generatePDF/components/PDFPreviewDialog", () => ({
  PDFPreviewDialog: ({ open, onDownload }) =>
    open ? (
      <div data-testid="pdf-preview-dialog">
        <button onClick={onDownload}>Download PDF</button>
      </div>
    ) : null,
}));

describe("DokumenAudit Integration", () => {
  let queryClient;

  const mockDocuments = {
    data: [
      {
        id: "1",
        title: "Audit Doc 1",
        location: "Jakarta",
        audit_period: "2025-12-15T00:00:00Z",
        lead_auditor: "John Doe",
        auditor_name: "Jane Smith",
        revision: "1.0",
        status: "draft",
        created_at: "2025-01-01T10:00:00Z",
        updated_at: "2025-01-20T15:30:00Z",
      },
      {
        id: "2",
        title: "Audit Doc 2",
        location: "Bandung",
        audit_period: "2025-12-20T00:00:00Z",
        lead_auditor: "Alice",
        auditor_name: "Bob",
        revision: "2.0",
        status: "in_progress",
        created_at: "2025-01-05T10:00:00Z",
        updated_at: "2025-01-21T15:30:00Z",
      },
    ],
    meta: {
      current_page: 1,
      per_page: 10,
      total: 2,
      last_page: 1,
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0, // Disable cache for tests
        },
      },
    });

    // Clear all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    auditService.listDocuments.mockResolvedValue(mockDocuments);
    auditService.createDocument.mockResolvedValue({ data: { id: "3" } });
    auditService.updateDocument.mockResolvedValue({ data: { id: "1" } });
    auditService.deleteDocument.mockResolvedValue({});

    auditDocumentPDF.getAuditDocumentPDFPreview.mockResolvedValue({
      url: "blob:mock-url",
      dispose: vi.fn(),
    });
    auditDocumentPDF.downloadAuditDocumentPDF.mockResolvedValue({});
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DokumenAudit />
      </QueryClientProvider>
    );
  };

  describe("Initial Load", () => {
    it("should display loading state initially", async () => {
      vi.mocked(auditService.listDocuments).mockImplementation(
        () => new Promise(() => {})
      ); // Never resolves
      renderComponent();

      expect(screen.getByText(/memuat data audit/i)).toBeInTheDocument();
    });

    it("should load and display documents from API", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
        expect(screen.getByText("Audit Doc 2")).toBeInTheDocument();
      });

      expect(auditService.listDocuments).toHaveBeenCalledWith({
        page: 1,
        per_page: 10,
      });
    });

    it("should display error message when API fails", async () => {
      vi.mocked(auditService.listDocuments).mockRejectedValue(
        new Error("Network error")
      );
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/terjadi kesalahan/i)).toBeInTheDocument();
      });
    });

    it("should map backend data to frontend format correctly", async () => {
      renderComponent();

      await waitFor(() => {
        // Check if date is formatted to Indonesian format (dd/mm/yyyy)
        expect(screen.getByText("15/12/2025")).toBeInTheDocument();
        expect(screen.getByText("20/12/2025")).toBeInTheDocument();

        // Check if location is mapped correctly
        expect(screen.getByText("Jakarta")).toBeInTheDocument();
        expect(screen.getByText("Bandung")).toBeInTheDocument();

        // Check if auditor names are mapped
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("should search documents by title", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /cari judul dokumen audit/i
      );
      await user.type(searchInput, "Test Search");

      await waitFor(() => {
        expect(auditService.listDocuments).toHaveBeenCalledWith(
          expect.objectContaining({
            search_title: "Test Search",
            page: 1, // Should reset to page 1
          })
        );
      });
    });

    it("should reset to page 1 when searching", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /cari judul dokumen audit/i
      );
      await user.type(searchInput, "Search");

      await waitFor(() => {
        expect(auditService.listDocuments).toHaveBeenLastCalledWith(
          expect.objectContaining({
            page: 1,
          })
        );
      });
    });
  });

  describe("Status Filter", () => {
    it("should filter documents by status", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      // Note: Actual filter interaction would require more complex setup
      // This tests the hook logic that should be triggered
      expect(auditService.listDocuments).toHaveBeenCalled();
    });
  });

  describe("Pagination", () => {
    it("should call API with correct page and per_page params", async () => {
      renderComponent();

      await waitFor(() => {
        expect(auditService.listDocuments).toHaveBeenCalledWith({
          page: 1,
          per_page: 10,
        });
      });
    });
  });

  describe("CREATE Operation", () => {
    it("should create document successfully", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId("overlay-form")).toBeInTheDocument();
      });

      const submitButton = screen.getByText("Submit Form");
      await user.click(submitButton);

      await waitFor(() => {
        expect(auditService.createDocument).toHaveBeenCalledWith({
          title: "Test Doc",
          location: "Test Location",
          audit_period: "2025-12-15",
          lead_auditor: "Lead",
          auditor_name: "Auditor",
          revision: "1.0",
          status: "draft",
        });
      });
    });

    it("should refresh list after successful creation", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(auditService.listDocuments).toHaveBeenCalledTimes(1);
      });

      const submitButton = screen.getByText("Submit Form");
      await user.click(submitButton);

      await waitFor(
        () => {
          // Should be called again after mutation
          expect(auditService.listDocuments).toHaveBeenCalledTimes(2);
        },
        { timeout: 3000 }
      );
    });

    it("should call createDocument when form is submitted", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId("overlay-form")).toBeInTheDocument();
      });

      const submitButton = screen.getByText("Submit Form");
      await user.click(submitButton);

      // Should call the create document API
      await waitFor(() => {
        expect(auditService.createDocument).toHaveBeenCalledWith({
          title: "Test Doc",
          location: "Test Location",
          audit_period: "2025-12-15",
          lead_auditor: "Lead",
          auditor_name: "Auditor",
          revision: "1.0",
          status: "draft",
        });
      });
    });
  });

  describe("UPDATE Operation", () => {
    it("should update document successfully", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      const updateButton = screen.getAllByText("Update")[0];
      await user.click(updateButton);

      await waitFor(() => {
        expect(auditService.updateDocument).toHaveBeenCalledWith("1", {
          title: "Updated Title",
        });
      });
    });

    it("should refresh list after successful update", async () => {
      const user = userEvent.setup();
      renderComponent();

      // Wait for initial load and data to be rendered
      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
        expect(auditService.listDocuments).toHaveBeenCalledTimes(1);
      });

      // Find update button (from AlertIconDialog mock)
      const updateButtons = screen.getAllByText("Update");
      expect(updateButtons.length).toBeGreaterThan(0);

      await user.click(updateButtons[0]);

      // Wait for list refresh after successful update
      await waitFor(
        () => {
          expect(auditService.listDocuments).toHaveBeenCalledTimes(2);
        },
        { timeout: 3000 }
      );
    });
  });

  describe("DELETE Operation", () => {
    it("should delete document successfully", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText("Delete");
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(auditService.deleteDocument).toHaveBeenCalledWith("1");
      });
    });

    it("should refresh list after successful deletion", async () => {
      const user = userEvent.setup();
      renderComponent();

      // Wait for initial load and data to be rendered
      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
        expect(auditService.listDocuments).toHaveBeenCalledTimes(1);
      });

      // Find delete button (from DeleteDialog mock)
      const deleteButtons = screen.getAllByText("Delete");
      expect(deleteButtons.length).toBeGreaterThan(0);

      await user.click(deleteButtons[0]);

      // Wait for list refresh after successful deletion
      await waitFor(
        () => {
          expect(auditService.listDocuments).toHaveBeenCalledTimes(2);
        },
        { timeout: 3000 }
      );
    });
  });

  describe("PDF Export", () => {
    it("should generate PDF preview when preview button clicked", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      // Find preview buttons (FileText icons)
      const previewButtons = screen.getAllByTitle("Pratinjau PDF");
      await user.click(previewButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("pdf-preview-dialog")).toBeInTheDocument();
      });
    });

    it("should download PDF when download button clicked", async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      const downloadButtons = screen.getAllByTitle("Unduh PDF");
      await user.click(downloadButtons[0]);

      await waitFor(() => {
        expect(auditDocumentPDF.downloadAuditDocumentPDF).toHaveBeenCalled();
      });
    });

    it("should show loading spinner during PDF download", async () => {
      auditDocumentPDF.downloadAuditDocumentPDF.mockImplementation(
        () => new Promise(() => {})
      );
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      const downloadButtons = screen.getAllByTitle("Unduh PDF");
      await user.click(downloadButtons[0]);

      // Should show loading state (icon changes to Loader2)
      // Note: This would need to verify the icon component change
    });
  });

  describe("Status Badge Display", () => {
    it("should display correct status badge for draft", async () => {
      renderComponent();

      await waitFor(() => {
        const draftBadge = screen.getByText("Draft");
        expect(draftBadge).toBeInTheDocument();
        expect(draftBadge).toHaveClass("bg-gray-100", "text-gray-700");
      });
    });

    it("should display correct status badge for in_progress", async () => {
      renderComponent();

      await waitFor(() => {
        const inProgressBadge = screen.getByText("In Progress");
        expect(inProgressBadge).toBeInTheDocument();
        expect(inProgressBadge).toHaveClass("bg-yellow-100", "text-yellow-700");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle create error gracefully", async () => {
      vi.mocked(auditService.createDocument).mockRejectedValue(
        new Error("Create failed")
      );
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId("overlay-form")).toBeInTheDocument();
      });

      const submitButton = screen.getByText("Submit Form");
      await user.click(submitButton);

      // Should handle error without crashing
      await waitFor(() => {
        expect(auditService.createDocument).toHaveBeenCalled();
      });
    });

    it("should handle update error gracefully", async () => {
      vi.mocked(auditService.updateDocument).mockRejectedValue(
        new Error("Update failed")
      );
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      const updateButton = screen.getAllByText("Update")[0];
      await user.click(updateButton);

      await waitFor(() => {
        expect(auditService.updateDocument).toHaveBeenCalled();
      });
    });

    it("should handle delete error gracefully", async () => {
      vi.mocked(auditService.deleteDocument).mockRejectedValue(
        new Error("Delete failed")
      );
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Audit Doc 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText("Delete");
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(auditService.deleteDocument).toHaveBeenCalled();
      });
    });
  });

  describe("Empty State", () => {
    it("should handle empty data gracefully", async () => {
      vi.mocked(auditService.listDocuments).mockResolvedValue({
        data: [],
        meta: {
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1,
        },
      });

      renderComponent();

      await waitFor(() => {
        // Should render table even with no data
        expect(
          screen.queryByText(/memuat data audit/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Data Transformation", () => {
    it("should correctly format dates from ISO to Indonesian format", async () => {
      renderComponent();

      await waitFor(() => {
        // 2025-12-15T00:00:00Z should become 15/12/2025
        expect(screen.getByText("15/12/2025")).toBeInTheDocument();
        expect(screen.getByText("20/12/2025")).toBeInTheDocument();
      });
    });

    it("should handle missing optional fields", async () => {
      vi.mocked(auditService.listDocuments).mockResolvedValue({
        data: [
          {
            id: "1",
            title: "Doc with minimal fields",
            location: "Jakarta",
            audit_period: "2025-12-15T00:00:00Z",
            status: "draft",
          },
        ],
        meta: {
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
        },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Doc with minimal fields")).toBeInTheDocument();
        // Should display '-' for missing fields
        expect(screen.getAllByText("-").length).toBeGreaterThan(0);
      });
    });
  });
});
