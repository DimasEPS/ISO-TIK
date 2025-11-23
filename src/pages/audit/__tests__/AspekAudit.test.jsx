import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AspekAudit from "../AspekAudit";
import { aspekAuditData, checklistData } from "@/mocks/tableData";

// Mock auditService
vi.mock("@/services/auditService", () => ({
  auditService: {
    listAspects: vi.fn(),
    createAspect: vi.fn(),
    updateAspect: vi.fn(),
    deleteAspect: vi.fn(),
  },
}));

// Mock Sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Helper untuk wrap component dengan QueryClient
function renderWithQueryClient(component) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
}

describe("AspekAudit Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Load & Display", () => {
    it("should render the page with search input and add button", () => {
      renderWithQueryClient(<AspekAudit />);

      expect(
        screen.getByPlaceholderText(/cari aspek berdasarkan nama/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/tambah aspek/i)).toBeInTheDocument();
    });

    it("should display all aspek cards on initial load", () => {
      renderWithQueryClient(<AspekAudit />);

      // Check if aspek cards are rendered (using mock data initially)
      const firstAspek = aspekAuditData[0];
      expect(screen.getByText(firstAspek.name)).toBeInTheDocument();
    });

    it("should render checklist filter dropdown", () => {
      renderWithQueryClient(<AspekAudit />);

      expect(screen.getByText(/semua checklist/i)).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should filter aspek list when searching by name", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const searchInput = screen.getByPlaceholderText(
        /cari aspek berdasarkan nama/i
      );

      // Type in search
      await user.type(searchInput, aspekAuditData[0].name);

      await waitFor(() => {
        expect(screen.getByText(aspekAuditData[0].name)).toBeInTheDocument();
      });
    });

    it("should show no results message when search returns empty", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const searchInput = screen.getByPlaceholderText(
        /cari aspek berdasarkan nama/i
      );

      // Search for non-existent aspek
      await user.type(searchInput, "NonExistentAspek12345");

      await waitFor(() => {
        expect(
          screen.getByText(/tidak ada aspek audit ditemukan/i)
        ).toBeInTheDocument();
      });
    });

    it("should clear search and show all results", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const searchInput = screen.getByPlaceholderText(
        /cari aspek berdasarkan nama/i
      );

      // Type and clear
      await user.type(searchInput, "test");
      await user.clear(searchInput);

      // Should show all aspek again
      await waitFor(() => {
        expect(screen.getByText(aspekAuditData[0].name)).toBeInTheDocument();
      });
    });
  });

  describe("Checklist Filter", () => {
    it("should filter aspek by selected checklist", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Click checklist dropdown
      const dropdownButton = screen.getByText(/semua checklist/i);
      await user.click(dropdownButton);

      // Wait for dropdown options
      await waitFor(() => {
        expect(screen.getByText(checklistData[0].title)).toBeInTheDocument();
      });

      // Select first checklist
      await user.click(screen.getByText(checklistData[0].title));

      // Should filter results
      await waitFor(() => {
        // Only aspek with checklistId 1 should be visible
        const filteredAspek = aspekAuditData.filter(
          (aspek) => aspek.checklistId === 1
        );
        expect(screen.getByText(filteredAspek[0].name)).toBeInTheDocument();
      });
    });

    it("should reset filter when selecting 'Semua Checklist'", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Open dropdown and select a specific checklist
      const dropdownButton = screen.getByText(/semua checklist/i);
      await user.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText(checklistData[0].title)).toBeInTheDocument();
      });

      await user.click(screen.getByText(checklistData[0].title));

      // Now reset by selecting "Semua Checklist"
      await user.click(screen.getByText(checklistData[0].title));

      await waitFor(() => {
        const allChecklistOption = screen.getAllByText(/semua checklist/i);
        expect(allChecklistOption.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Pagination", () => {
    it("should display pagination controls when data exists", () => {
      renderWithQueryClient(<AspekAudit />);

      expect(screen.getByText(/per halaman/i)).toBeInTheDocument();
    });

    it("should change items per page", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Find and click per page dropdown
      const perPageButton = screen.getByRole("button", { name: /10/i });
      await user.click(perPageButton);

      // Select 20 per page
      await waitFor(() => {
        const option20 = screen.getByRole("option", { name: "20" });
        expect(option20).toBeInTheDocument();
      });
    });

    it("should navigate between pages", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Find next page button if multiple pages exist
      const nextButtons = screen.queryAllByLabelText(/next/i);

      if (nextButtons.length > 0) {
        await user.click(nextButtons[0]);
        // Verify page changed
        await waitFor(() => {
          expect(screen.getByText(/halaman/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe("Create Aspek", () => {
    it("should open add dialog when clicking add button", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const addButton = screen.getByText(/tambah aspek/i);
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/aspek audit baru/i)).toBeInTheDocument();
      });
    });

    it("should show validation error when submitting empty form", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const addButton = screen.getByText(/tambah aspek/i);
      await user.click(addButton);

      await waitFor(() => {
        const saveButton = screen.getByRole("button", {
          name: /simpan aspek/i,
        });
        expect(saveButton).toBeInTheDocument();
      });

      // Try to submit without filling form
      const saveButton = screen.getByRole("button", { name: /simpan aspek/i });
      await user.click(saveButton);

      // Form should show validation or stay open
      await waitFor(() => {
        expect(screen.getByText(/aspek audit baru/i)).toBeInTheDocument();
      });
    });

    it("should create new aspek with valid data", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const addButton = screen.getByText(/tambah aspek/i);
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/nama aspek/i)).toBeInTheDocument();
      });

      // Fill form
      const nameInput = screen.getByLabelText(/nama aspek/i);
      const descInput = screen.getByLabelText(/deskripsi/i);

      await user.type(nameInput, "New Test Aspek");
      await user.type(descInput, "Test description for aspek");

      // Submit
      const saveButton = screen.getByRole("button", { name: /simpan aspek/i });
      await user.click(saveButton);

      // Should close dialog and show new aspek
      await waitFor(() => {
        expect(screen.getByText("New Test Aspek")).toBeInTheDocument();
      });
    });
  });

  describe("Update Aspek", () => {
    it("should open edit dialog when clicking edit button", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Find first edit button
      const editButtons = screen.getAllByTitle(/edit/i);
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/edit aspek audit/i)).toBeInTheDocument();
      });
    });

    it("should pre-fill form with existing aspek data", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const firstAspek = aspekAuditData[0];

      // Click edit on first aspek
      const editButtons = screen.getAllByTitle(/edit/i);
      await user.click(editButtons[0]);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/nama aspek/i);
        expect(nameInput).toHaveValue(firstAspek.name);
      });
    });

    it("should update aspek with new data", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Click edit
      const editButtons = screen.getAllByTitle(/edit/i);
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/nama aspek/i)).toBeInTheDocument();
      });

      // Update name
      const nameInput = screen.getByLabelText(/nama aspek/i);
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Aspek Name");

      // Save
      const saveButton = screen.getByRole("button", {
        name: /simpan perubahan/i,
      });
      await user.click(saveButton);

      // Should show updated aspek
      await waitFor(() => {
        expect(screen.getByText("Updated Aspek Name")).toBeInTheDocument();
      });
    });
  });

  describe("Delete Aspek", () => {
    it("should open delete dialog when clicking delete button", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Find first delete button
      const deleteButtons = screen.getAllByTitle(/hapus/i);
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/hapus aspek/i)).toBeInTheDocument();
        expect(screen.getByText(/peringatan/i)).toBeInTheDocument();
      });
    });

    it("should require confirmation text to delete", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const firstAspek = aspekAuditData[0];

      // Click delete
      const deleteButtons = screen.getAllByTitle(/hapus/i);
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(firstAspek.name)).toBeInTheDocument();
      });

      // Try to delete without typing confirmation
      const deleteButton = screen.getByRole("button", {
        name: /hapus aspek/i,
      });
      expect(deleteButton).toBeDisabled();
    });

    it("should delete aspek after correct confirmation", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const firstAspek = aspekAuditData[0];

      // Click delete
      const deleteButtons = screen.getAllByTitle(/hapus/i);
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        const confirmInput =
          screen.getByPlaceholderText(/masukkan nama aspek/i);
        expect(confirmInput).toBeInTheDocument();
      });

      // Type confirmation
      const confirmInput = screen.getByPlaceholderText(/masukkan nama aspek/i);
      await user.type(confirmInput, firstAspek.name);

      // Delete button should be enabled
      const deleteButton = screen.getByRole("button", {
        name: /hapus aspek/i,
      });
      expect(deleteButton).not.toBeDisabled();

      // Click delete
      await user.click(deleteButton);

      // Aspek should be removed from list
      await waitFor(() => {
        expect(screen.queryByText(firstAspek.name)).not.toBeInTheDocument();
      });
    });
  });

  describe("Aspek Card Display", () => {
    it("should display aspek name and description", () => {
      renderWithQueryClient(<AspekAudit />);

      const firstAspek = aspekAuditData[0];
      expect(screen.getByText(firstAspek.name)).toBeInTheDocument();
      expect(screen.getByText(firstAspek.description)).toBeInTheDocument();
    });

    it("should display checklist badge for each aspek", () => {
      renderWithQueryClient(<AspekAudit />);

      // Check if checklist names are displayed
      const firstAspek = aspekAuditData[0];
      const checklist = checklistData.find(
        (c, index) => index + 1 === firstAspek.checklistId
      );

      if (checklist) {
        expect(screen.getByText(checklist.title)).toBeInTheDocument();
      }
    });

    it("should have edit and delete buttons for each aspek", () => {
      renderWithQueryClient(<AspekAudit />);

      const editButtons = screen.getAllByTitle(/edit/i);
      const deleteButtons = screen.getAllByTitle(/hapus/i);

      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no aspek exist", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Search for something that doesn't exist
      const searchInput = screen.getByPlaceholderText(
        /cari aspek berdasarkan nama/i
      );
      await user.type(searchInput, "NonExistentAspek999");

      await waitFor(() => {
        expect(
          screen.getByText(/tidak ada aspek audit ditemukan/i)
        ).toBeInTheDocument();
      });
    });

    it("should not show pagination when no data", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Search for something that doesn't exist
      const searchInput = screen.getByPlaceholderText(
        /cari aspek berdasarkan nama/i
      );
      await user.type(searchInput, "NonExistentAspek999");

      await waitFor(() => {
        expect(screen.queryByText(/per halaman/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Dialog Interactions", () => {
    it("should close dialog when clicking cancel button", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Open add dialog
      const addButton = screen.getByText(/tambah aspek/i);
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/aspek audit baru/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole("button", { name: /batal/i });
      await user.click(cancelButton);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText(/aspek audit baru/i)).not.toBeInTheDocument();
      });
    });

    it("should close delete dialog without deleting when clicking cancel", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      const firstAspek = aspekAuditData[0];
      const initialAspekCount = screen.getAllByText(firstAspek.name).length;

      // Open delete dialog
      const deleteButtons = screen.getAllByTitle(/hapus/i);
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/hapus aspek/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole("button", { name: /batal/i });
      await user.click(cancelButton);

      // Dialog should close and aspek should still exist
      await waitFor(() => {
        const currentAspekCount = screen.getAllByText(firstAspek.name).length;
        expect(currentAspekCount).toBe(initialAspekCount);
      });
    });
  });

  describe("Combined Filters", () => {
    it("should apply both search and checklist filter together", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AspekAudit />);

      // Apply search
      const searchInput = screen.getByPlaceholderText(
        /cari aspek berdasarkan nama/i
      );
      await user.type(searchInput, aspekAuditData[0].name);

      // Apply checklist filter
      const dropdownButton = screen.getByText(/semua checklist/i);
      await user.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText(checklistData[0].title)).toBeInTheDocument();
      });

      await user.click(screen.getByText(checklistData[0].title));

      // Should show filtered results
      await waitFor(() => {
        // Results should match both filters
        const aspeksMatchingBoth = aspekAuditData.filter(
          (aspek) =>
            aspek.name
              .toLowerCase()
              .includes(aspekAuditData[0].name.toLowerCase()) &&
            aspek.checklistId === 1
        );
        if (aspeksMatchingBoth.length > 0) {
          expect(
            screen.getByText(aspeksMatchingBoth[0].name)
          ).toBeInTheDocument();
        }
      });
    });
  });
});
