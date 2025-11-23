import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ncrDocumentsService } from "@/services/ncrDocumentsService";
import { ncrCasesService } from "@/services/ncrCasesService";
import { ncrPointsService } from "@/services/ncrPointsService";
import { adminUsersService } from "@/services/adminUsersService";

// Query keys
export const ncrKeys = {
  all: ["ncr"],
  documents: () => [...ncrKeys.all, "documents"],
  documentsList: (filters) => [...ncrKeys.documents(), "list", filters],
  documentDetail: (id) => [...ncrKeys.documents(), "detail", id],
  
  cases: () => [...ncrKeys.all, "cases"],
  casesList: (docId, filters) => [...ncrKeys.cases(), "list", docId, filters],
  caseDetail: (caseId) => [...ncrKeys.cases(), "detail", caseId],
  caseDocuments: (caseId) => [...ncrKeys.cases(), caseId, "documents"],
  
  points: () => [...ncrKeys.all, "points"],
  pointsList: (caseId, filters) => [...ncrKeys.points(), "list", caseId, filters],
  
  adminUsers: () => ["adminUsers"],
  adminUsersList: (filters) => [...ncrKeys.adminUsers(), "list", filters],
};

// NCR Documents Hooks
export function useNCRDocuments(params = {}) {
  return useQuery({
    queryKey: ncrKeys.documentsList(params),
    queryFn: () => ncrDocumentsService.listDocuments(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useNCRDocument(documentId) {
  return useQuery({
    queryKey: ncrKeys.documentDetail(documentId),
    queryFn: () => ncrDocumentsService.getDocument(documentId),
    enabled: !!documentId,
  });
}

export function useCreateNCRDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => ncrDocumentsService.createDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ncrKeys.documents() });
    },
  });
}

export function useUpdateNCRDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ documentId, payload }) => 
      ncrDocumentsService.updateDocument(documentId, payload),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ncrKeys.documentDetail(documentId) });
      queryClient.invalidateQueries({ queryKey: ncrKeys.documents() });
    },
  });
}

export function useDeleteNCRDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (documentId) => ncrDocumentsService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ncrKeys.documents() });
    },
  });
}

// NCR Cases Hooks
export function useNCRCases(documentId, params = {}) {
  return useQuery({
    queryKey: ncrKeys.casesList(documentId, params),
    queryFn: () => ncrCasesService.listCases(documentId, params),
    enabled: !!documentId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useNCRCase(caseId) {
  return useQuery({
    queryKey: ncrKeys.caseDetail(caseId),
    queryFn: () => ncrCasesService.getCase(caseId),
    enabled: !!caseId,
  });
}

export function useNCRCaseDocuments(caseId) {
  return useQuery({
    queryKey: ncrKeys.caseDocuments(caseId),
    queryFn: () => ncrCasesService.getCaseDocuments(caseId),
    enabled: !!caseId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateNCRCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => ncrCasesService.createCase(payload),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ncrKeys.cases() });
      if (documentId) {
        queryClient.invalidateQueries({ queryKey: ncrKeys.documentDetail(documentId) });
      }
    },
  });
}

export function useUpdateNCRCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, payload }) => 
      ncrCasesService.updateCase(caseId, payload),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ncrKeys.caseDetail(caseId) });
      queryClient.invalidateQueries({ queryKey: ncrKeys.cases() });
    },
  });
}

export function useDeleteNCRCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (caseId) => ncrCasesService.deleteCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ncrKeys.cases() });
    },
  });
}

export function useAttachCaseDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, documentId }) => 
      ncrCasesService.attachDocument(caseId, documentId),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ncrKeys.caseDocuments(caseId) });
    },
  });
}

export function useDetachCaseDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, documentId }) => 
      ncrCasesService.detachDocument(caseId, documentId),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ncrKeys.caseDocuments(caseId) });
    },
  });
}

// NCR Points (Findings, Analysis, Corrections, Actions) Hooks
export function useNCRPoints(caseId, params = {}) {
  return useQuery({
    queryKey: ncrKeys.pointsList(caseId, params),
    queryFn: () => ncrPointsService.listPoints(caseId, params),
    enabled: !!caseId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateNCRPoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => ncrPointsService.createPoint(payload),
    onSuccess: (data, variables) => {
      // Invalidate all point queries for this case
      if (variables.caseId) {
        queryClient.invalidateQueries({ 
          queryKey: ncrKeys.pointsList(variables.caseId) 
        });
      }
      queryClient.invalidateQueries({ queryKey: ncrKeys.points() });
    },
  });
}

export function useUpdateNCRPoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pointId, payload }) => 
      ncrPointsService.updatePoint(pointId, payload),
    onSuccess: (data, variables) => {
      // Invalidate point queries for this case
      if (variables.payload?.caseId) {
        queryClient.invalidateQueries({ 
          queryKey: ncrKeys.pointsList(variables.payload.caseId) 
        });
      }
      queryClient.invalidateQueries({ queryKey: ncrKeys.points() });
    },
  });
}

export function useDeleteNCRPoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pointId, caseId }) => ncrPointsService.deletePoint(pointId),
    onSuccess: (data, variables) => {
      // Invalidate point queries for this case
      if (variables.caseId) {
        queryClient.invalidateQueries({ 
          queryKey: ncrKeys.pointsList(variables.caseId) 
        });
      }
      queryClient.invalidateQueries({ queryKey: ncrKeys.points() });
    },
  });
}

// Admin Users Hooks
export function useAdminUsers(params = {}) {
  return useQuery({
    queryKey: ncrKeys.adminUsersList(params),
    queryFn: () => adminUsersService.listAdminUsers(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
