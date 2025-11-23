import { NavLink, Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";
import { usePageTemplate } from "@/hooks/usePageTemplate";

const tabs = [
  { label: "Dokumen Manual", path: "/admin/manual/dokumen" },
  { label: "Klausa Manual", path: "/admin/manual/klausa" },
];

const baseTab = "body-medium p-4 rounded-t-[4px] transition-all duration-200";
const inactiveTab = "text-navy hover:bg-state";
const activeTab = "bg-state text-navy shadow border-b-[3px] border-navy";

export default function Manual() {
  const location = useLocation();
  usePageTemplate({
    title: "Checklist Manual",
    subtitle: "Kelola dokumen dan pertanyaan",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });

  return (
    <div>
      <div className="flex gap-4" id="manual-sub-navbar">
        {tabs.map((tab) => {
          const isRootActive =
            tab.path === "/admin/manual/dokumen" &&
            location.pathname === "/admin/manual";
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                clsx(baseTab, isActive || isRootActive ? activeTab : inactiveTab)
              }
              end={tab.path === "/admin/manual/dokumen"}
            >
              {tab.label}
            </NavLink>
          );
        })}
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
