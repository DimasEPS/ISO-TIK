import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Outlet } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";

export default function Audit() {
  usePageTemplate({
    title: "Detail Checklist Audit",
    subtitle: "Kelola dokumen, checklist, aspek, pertanyaan audit",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedPathname = location.pathname.replace(/\/+$/, "") || "/";
  const baseTab = "body-medium p-4 rounded-t-[4px] transition-all duration-200";
  const inactive = "text-navy hover:bg-state";
  const active = "bg-state text-navy shadow border-b-[3px] border-navy";

  useEffect(() => {
    if (normalizedPathname === "/admin/audit") {
      navigate("/admin/audit/dokumen", { replace: true });
    }
  }, [normalizedPathname, navigate]);

  const getTabClass = (targetPath) => ({ isActive }) => {
    const isDefaultDokumen =
      targetPath === "/admin/audit/dokumen" && normalizedPathname === "/admin/audit";
    return clsx(baseTab, isActive || isDefaultDokumen ? active : inactive);
  };

  return (
    <div>
      <div className="flex gap-4" id="audit-sub-navbar">
        <NavLink
          to="/admin/audit/dokumen"
          className={getTabClass("/admin/audit/dokumen")}
        >
          {" "}
          Dokumen Audit{" "}
        </NavLink>
        <NavLink
          to="/admin/audit/checklist"
          className={getTabClass("/admin/audit/checklist")}
        >
          {" "}
          Checklist Audit{" "}
        </NavLink>
        <NavLink
          to="/admin/audit/aspek"
          className={getTabClass("/admin/audit/aspek")}
        >
          {" "}
          Aspek Audit{" "}
        </NavLink>
        <NavLink
          to="/admin/audit/checklist-excel"
          className={getTabClass("/admin/audit/checklist-excel")}
        >
          {" "}
          Checklist Excel{" "}
        </NavLink>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
