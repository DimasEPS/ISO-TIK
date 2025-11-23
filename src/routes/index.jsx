// src/routes/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/auth/components/ProtectedRoute";
import { AppLayout } from "@/layouts";
import { LoginPage } from "@/pages/Auth";
import DashboardPage from "@/pages/dashboard";
import DokumenPage from "@/pages/documents";
import NotFoundPage from "@/pages/NotFound";
import DokumenSoA from "@/pages/soa/DokumenSoA";
import SoA from "@/pages/soa";
import KategoriSoA from "@/pages/soa/KategoriSoA";
import PertanyaanSoA from "@/pages/soa/PertanyaanSoA";
import NCR from "@/pages/ncr";
import CaseListPage from "@/pages/ncr/CaseListPage";
import CaseDetailPage from "@/pages/ncr/CaseDetailPage";
import FindingsListPage from "@/pages/ncr/FindingsListPage";
import ResponsePage from "@/pages/ncr/ResponsePage";
import Audit from "@/pages/audit";
import DokumenAudit from "@/pages/audit/DokumenAudit";
import AspekAudit from "@/pages/audit/AspekAudit";
import ChecklistAudit from "@/pages/audit/ChekclistAudit";
import ChecklistExcel from "@/pages/audit/ChecklistExcel";
import KategoriPertanyaan from "@/pages/audit/KategoriPertanyaan";
import PertanyaanAudit from "@/pages/audit/PertanyaanAudit";
import ItemAudit from "@/pages/audit/ItemAudit";
import DaftarChecklist from "@/pages/audit/DaftarChecklist";
import AspekPertanyaan from "@/pages/audit/AspekPertanyaan";
import PertanyaanExcel from "@/pages/audit/PertanyaanExcel";
import ReviewAspekPertanyaan from "@/pages/audit/ReviewAspekPertanyaan";
import ReviewPertanyaanExcel from "@/pages/audit/ReviewPertanyaanExcel";
import SubKlausa from "@/pages/manual/SubKlausa";
import ReviewJawabanSoA from "@/pages/soa/ReviewJawabanSoA";
import Manual from "@/pages/manual";
import ManualDocuments from "@/pages/manual/ManualDocuments";
import KlausaManual from "@/pages/manual/KlausaManual";
import PertanyaanManual from "@/pages/manual/PertanyaanManual";
import ManajemenPengguna from "@/pages/user-management";
import Profil from "@/pages/Profil";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      {
        path: "soa",
        element: <SoA />, // berisi tab + <Outlet />
        children: [
          { index: true, element: <DokumenSoA /> },
          { path: "dokumen", element: <DokumenSoA /> },
          { path: "kategori", element: <KategoriSoA /> },
          { path: "pertanyaan", element: <PertanyaanSoA /> },
          { path: "review", element: <ReviewJawabanSoA /> },
        ],
      },
      {
        path: "audit",
        element: <Audit />,
        children: [
          { index: true, element: <DokumenAudit /> },
          { path: "dokumen", element: <DokumenAudit /> },
          { path: "checklist", element: <ChecklistAudit /> },
          { path: "aspek", element: <AspekAudit /> },
          { path: "checklist-excel", element: <ChecklistExcel /> },
        ],
      },
      {
        path: "manual",
        element: <Manual />,
        children: [
          { index: true, element: <ManualDocuments /> },
          { path: "dokumen", element: <ManualDocuments /> },
          { path: "klausa", element: <KlausaManual /> },
        ],
      },
      { path: "manual/klausa/:clauseId/sub", element: <SubKlausa /> },
      { path: "manual/klausa/:clauseId/pertanyaan", element: <PertanyaanManual /> },
      { path: "dokumen", element: <DokumenPage /> },
      { path: "ncr", element: <NCR /> },
      { path: "ncr/:id/kasus", element: <CaseListPage /> },
      { path: "ncr/:id/kasus/:caseId", element: <CaseDetailPage /> },
      { path: "ncr/:id/kasus/:caseId/temuan", element: <FindingsListPage /> },
      { path: "ncr/:id/kasus/:caseId/tanggapan", element: <ResponsePage /> },
      { path: "manajemen-pengguna", element: <ManajemenPengguna /> },
      { path: "profil", element: <Profil /> },
      { path: "profil/:userId", element: <Profil /> },
      { path: "audit/aspek/kategori/:id", element: <KategoriPertanyaan /> },
      {
        path: "audit/aspek/kategori/:aspekId/pertanyaan/:id",
        element: <PertanyaanAudit />,
      },
      {
        path: "audit/checklist-excel/:id/item",
        element: <ItemAudit />,
      },
      {
        path: "audit/dokumen/:id",
        element: <DaftarChecklist />,
      },
      {
        path: "audit/dokumen/:id/aspek/:aspekId",
        element: <AspekPertanyaan />,
      },
      {
        path: "audit/dokumen/:id/excel/:checklistId",
        element: <PertanyaanExcel />,
      },
      {
        path: "audit/dokumen/:id/review/:checklistId",
        element: <ReviewAspekPertanyaan />,
      },
      {
        path: "audit/dokumen/:id/review-excel/:checklistId",
        element: <ReviewPertanyaanExcel />,
      },
      { path: "*", element: <Navigate to="/admin/dashboard" /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
