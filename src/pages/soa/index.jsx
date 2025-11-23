import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Outlet } from "react-router-dom";
import { usePageTemplate } from "@/hooks/usePageTemplate";

export default function SoA(){
    usePageTemplate({
      title: "Statement of Applicability",
      subtitle: "Kelola dokumen, kategori, dan pertanyaan SoA",
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
    
    const tabConfigs = [
        {label: "Dokumen SoA", path: "/admin/soa/dokumen"},
        {label: "Kategori SoA", path: "/admin/soa/kategori"},
        {label: "Pertanyaan SoA", path: "/admin/soa/pertanyaan"},
    ];
    
    const hideTabs = normalizedPathname.includes("/admin/soa/review");

    useEffect(() => {
        if(normalizedPathname === "/admin/soa"){
            navigate("/admin/soa/dokumen", { replace: true });
        }
    }, [normalizedPathname, navigate])
    
    return(
        <div>
            {!hideTabs && (
                <div className="flex gap-4" id="soa-sub-navbar">
                    {tabConfigs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) => {
                                // Cek jika ini adalah tab Dokumen SoA DAN
                                // user berada di root path /admin/soa ATAU di path dokumen
                                const isDokumenActive = 
                                    tab.path === "/admin/soa/dokumen" && 
                                    (normalizedPathname === "/admin/soa" || normalizedPathname === "/admin/soa/dokumen");
                                
                                return clsx(
                                    baseTab, 
                                    isActive || isDokumenActive ? active : inactive
                                );
                            }}
                        >
                            {tab.label}
                        </NavLink>
                    ))}
                </div>
            )}
        
            <div className="py-4">
                <Outlet />
            </div>
        </div>
    )
}
