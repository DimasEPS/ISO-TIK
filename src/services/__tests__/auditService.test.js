import { describe, it, expect, vi, beforeEach } from "vitest";
import { auditService } from "../auditService";
import { apiClient } from "@/lib/api-client";

// Mock the apiClient
vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

describe("auditService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Document Operations", () => {
    describe("listDocuments", () => {
      it("should call apiClient with correct params", async () => {
        const mockParams = {
          page: 1,
          per_page: 10,
          search_title: "test",
          status: "draft",
        };

        await auditService.listDocuments(mockParams);

        expect(apiClient).toHaveBeenCalledWith("/audit/documents", {
          params: mockParams,
        });
      });

      it("should work without params", async () => {
        await auditService.listDocuments();

        expect(apiClient).toHaveBeenCalledWith("/audit/documents", {
          params: {},
        });
      });
    });

    describe("getDocument", () => {
      it("should fetch single document by ID", async () => {
        const documentId = "abc-123";

        await auditService.getDocument(documentId);

        expect(apiClient).toHaveBeenCalledWith(
          `/audit/documents/${documentId}`,
          {
            params: {},
          }
        );
      });

      it("should pass params correctly", async () => {
        const documentId = "abc-123";
        const params = { include: "checklists" };

        await auditService.getDocument(documentId, params);

        expect(apiClient).toHaveBeenCalledWith(
          `/audit/documents/${documentId}`,
          {
            params,
          }
        );
      });
    });

    describe("createDocument", () => {
      it("should create document with correct payload", async () => {
        const payload = {
          title: "New Audit",
          location: "Jakarta",
          audit_period: "2025-12-15",
          lead_auditor: "John",
          auditor_name: "Jane",
          revision: "1.0",
          status: "draft",
        };

        await auditService.createDocument(payload);

        expect(apiClient).toHaveBeenCalledWith("/admin/audit/documents", {
          method: "POST",
          data: payload,
        });
      });
    });

    describe("updateDocument", () => {
      it("should update document with correct payload", async () => {
        const documentId = "abc-123";
        const payload = {
          title: "Updated Audit",
          status: "approved",
        };

        await auditService.updateDocument(documentId, payload);

        expect(apiClient).toHaveBeenCalledWith(
          `/admin/audit/documents/${documentId}`,
          {
            method: "PUT",
            data: payload,
          }
        );
      });
    });

    describe("deleteDocument", () => {
      it("should delete document by ID", async () => {
        const documentId = "abc-123";

        await auditService.deleteDocument(documentId);

        expect(apiClient).toHaveBeenCalledWith(
          `/admin/audit/documents/${documentId}`,
          {
            method: "DELETE",
          }
        );
      });
    });

    describe("getDocumentChecklists", () => {
      it("should fetch checklists for a document", async () => {
        const documentId = "doc-123";
        const params = { page: 1, per_page: 15 };

        await auditService.getDocumentChecklists(documentId, params);

        expect(apiClient).toHaveBeenCalledWith(
          `/audit/documents/${documentId}/checklists`,
          {
            params,
          }
        );
      });
    });

    describe("getDocumentCategoryQuestions", () => {
      it("should fetch category questions for a document", async () => {
        const documentId = "doc-123";
        const categoryId = "cat-456";
        const params = { questions_page: 1 };

        await auditService.getDocumentCategoryQuestions(
          documentId,
          categoryId,
          params
        );

        expect(apiClient).toHaveBeenCalledWith(
          `/audit/documents/${documentId}/categories/${categoryId}/questions-with-answers`,
          { params }
        );
      });
    });

    describe("getDocumentExcelQuestions", () => {
      it("should fetch excel questions for a document", async () => {
        const documentId = "doc-123";
        const excelChecklistId = "excel-456";
        const params = { search_aspect: "Security" };

        await auditService.getDocumentExcelQuestions(
          documentId,
          excelChecklistId,
          params
        );

        expect(apiClient).toHaveBeenCalledWith(
          `/audit/documents/${documentId}/excel-checklists/${excelChecklistId}/questions-with-answers`,
          { params }
        );
      });
    });
  });

  describe("Checklist Operations", () => {
    describe("listChecklists", () => {
      it("should fetch checklists with params", async () => {
        const params = { page: 1, search_name: "ISO" };

        await auditService.listChecklists(params);

        expect(apiClient).toHaveBeenCalledWith("/audit/checklists", { params });
      });
    });

    describe("getChecklist", () => {
      it("should fetch single checklist", async () => {
        const checklistId = "check-123";

        await auditService.getChecklist(checklistId);

        expect(apiClient).toHaveBeenCalledWith(
          `/audit/checklists/${checklistId}`,
          {
            params: {},
          }
        );
      });
    });

    describe("createChecklist", () => {
      it("should create checklist", async () => {
        const payload = {
          checklist_name: "New Checklist",
          description: "Description",
        };

        await auditService.createChecklist(payload);

        expect(apiClient).toHaveBeenCalledWith("/admin/audit/checklists", {
          method: "POST",
          data: payload,
        });
      });
    });

    describe("updateChecklist", () => {
      it("should update checklist", async () => {
        const checklistId = "check-123";
        const payload = { checklist_name: "Updated Name" };

        await auditService.updateChecklist(checklistId, payload);

        expect(apiClient).toHaveBeenCalledWith(
          `/admin/audit/checklists/${checklistId}`,
          {
            method: "PUT",
            data: payload,
          }
        );
      });
    });

    describe("deleteChecklist", () => {
      it("should delete checklist", async () => {
        const checklistId = "check-123";

        await auditService.deleteChecklist(checklistId);

        expect(apiClient).toHaveBeenCalledWith(
          `/admin/audit/checklists/${checklistId}`,
          {
            method: "DELETE",
          }
        );
      });
    });
  });

  describe("Aspect Operations", () => {
    describe("listAspects", () => {
      it("should fetch aspects with filters", async () => {
        const params = { search_name: "Security", checklist_id: "check-123" };

        await auditService.listAspects(params);

        expect(apiClient).toHaveBeenCalledWith("/audit/aspects", { params });
      });
    });

    describe("getAspect", () => {
      it("should fetch single aspect", async () => {
        const aspectId = "aspect-123";

        await auditService.getAspect(aspectId);

        expect(apiClient).toHaveBeenCalledWith(`/audit/aspects/${aspectId}`, {
          params: {},
        });
      });
    });

    describe("getAspectCategories", () => {
      it("should fetch categories for aspect", async () => {
        const aspectId = "aspect-123";
        const params = { categories_page: 1 };

        await auditService.getAspectCategories(aspectId, params);

        expect(apiClient).toHaveBeenCalledWith(
          `/audit/aspects/${aspectId}/categories`,
          {
            params,
          }
        );
      });
    });
  });

  describe("Answer Operations", () => {
    describe("createAnswer", () => {
      it("should create audit answer", async () => {
        const payload = {
          id_audit_questions: "q-123",
          id_audit_documents: "d-456",
          answer_text: "Test answer",
        };

        await auditService.createAnswer(payload);

        expect(apiClient).toHaveBeenCalledWith("/audit/answers", {
          method: "POST",
          data: payload,
        });
      });
    });

    describe("updateAnswer", () => {
      it("should update audit answer", async () => {
        const answerId = "ans-123";
        const payload = { answer_text: "Updated answer" };

        await auditService.updateAnswer(answerId, payload);

        expect(apiClient).toHaveBeenCalledWith(`/audit/answers/${answerId}`, {
          method: "PUT",
          data: payload,
        });
      });
    });

    describe("reviewAnswer", () => {
      it("should review audit answer", async () => {
        const answerId = "ans-123";
        const payload = {
          reviewer_comment: "Looks good",
          is_review: true,
        };

        await auditService.reviewAnswer(answerId, payload);

        expect(apiClient).toHaveBeenCalledWith(
          `/audit/answers/${answerId}/review`,
          {
            method: "POST",
            data: payload,
          }
        );
      });
    });

    describe("getAnswer", () => {
      it("should fetch single answer", async () => {
        const answerId = "ans-123";

        await auditService.getAnswer(answerId);

        expect(apiClient).toHaveBeenCalledWith(`/audit/answers/${answerId}`, {
          params: {},
        });
      });
    });
  });

  describe("Excel Operations", () => {
    describe("listExcelChecklists", () => {
      it("should fetch excel checklists", async () => {
        const params = { search_name: "Excel" };

        await auditService.listExcelChecklists(params);

        expect(apiClient).toHaveBeenCalledWith("/audit/excel-checklists", {
          params,
        });
      });
    });

    describe("createExcelAnswer", () => {
      it("should create excel answer", async () => {
        const payload = {
          id_audit_excel_questions: "eq-123",
          id_audit_documents: "d-456",
          answer_text: "Excel answer",
        };

        await auditService.createExcelAnswer(payload);

        expect(apiClient).toHaveBeenCalledWith("/audit/excel-answers", {
          method: "POST",
          data: payload,
        });
      });
    });

    describe("reviewExcelAnswer", () => {
      it("should review excel answer", async () => {
        const answerId = "ea-123";
        const payload = { reviewer_comment: "Approved" };

        await auditService.reviewExcelAnswer(answerId, payload);

        expect(apiClient).toHaveBeenCalledWith(
          `/audit/excel-answers/${answerId}/review`,
          {
            method: "POST",
            data: payload,
          }
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should propagate errors from apiClient", async () => {
      const error = new Error("Network error");
      apiClient.mockRejectedValue(error);

      await expect(auditService.listDocuments()).rejects.toThrow(
        "Network error"
      );
    });
  });
});
