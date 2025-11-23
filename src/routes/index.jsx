// src/routes/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/auth/components/ProtectedRoute";
import { AdminLayout } from "@/layouts/admin";
import { LoginPage } from "@/pages/Auth";
import DashboardPage from "@/pages/Admin/Dashboard";
import DokumenPage from "@/pages/Admin/Dokumen";
import NotFoundPage from "@/pages/NotFound";
import DokumenSoA from "@/pages/Admin/SoA/DokumenSoA";
import SoA from "@/pages/Admin/SoA";
import KategoriSoA from "@/pages/Admin/SoA/KategoriSoA";
import PertanyaanSoA from "@/pages/Admin/SoA/PertanyaanSoA";
import NCR from "@/pages/Admin/NCR";
import CaseListPage from "@/pages/Admin/NCR/CaseListPage";
import CaseDetailPage from "@/pages/Admin/NCR/CaseDetailPage";
import FindingsListPage from "@/pages/Admin/NCR/FindingsListPage";
import ResponsePage from "@/pages/Admin/NCR/ResponsePage";
import Audit from "@/pages/Admin/Audit";
import DokumenAudit from "@/pages/Admin/Audit/DokumenAudit";
import AspekAudit from "@/pages/Admin/Audit/AspekAudit";
import ChecklistAudit from "@/pages/Admin/Audit/ChekclistAudit";
import ChecklistExcel from "@/pages/Admin/Audit/ChecklistExcel";
import KategoriPertanyaan from "@/pages/Admin/Audit/KategoriPertanyaan";
import PertanyaanAudit from "@/pages/Admin/Audit/PertanyaanAudit";
import ItemAudit from "@/pages/Admin/Audit/ItemAudit";
import DaftarChecklist from "@/pages/Admin/Audit/DaftarChecklist";
import AspekPertanyaan from "@/pages/Admin/Audit/AspekPertanyaan";
import PertanyaanExcel from "@/pages/Admin/Audit/PertanyaanExcel";
import ReviewAspekPertanyaan from "@/pages/Admin/Audit/ReviewAspekPertanyaan";
import ReviewPertanyaanExcel from "@/pages/Admin/Audit/ReviewPertanyaanExcel";

import ReviewJawabanSoA from "@/pages/Admin/SoA/ReviewJawabanSoA";
import Manual from "@/pages/Admin/Manual";
import ManualDocuments from "@/pages/Admin/Manual/ManualDocuments";
import KlausaManual from "@/pages/Admin/Manual/KlausaManual";
import ManajemenPengguna from "@/pages/Admin/ManajemenPengguna";
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
        <AdminLayout />
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
