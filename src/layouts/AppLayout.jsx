import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BaseSidebar } from "@/components/sidebar";
import { AppSidebarContent } from "./AppSidebarContent";
import { AppSidebarCompact } from "./AppSidebarCompact";
import { AppNavbar } from "./AppNavbar";
import { Outlet } from "react-router-dom";
import { LayoutTemplateProvider } from "./LayoutTemplateContext";
import { X } from "lucide-react";

export function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleCollapse = () => setIsSidebarCollapsed(true);
  const handleExpand = () => setIsSidebarCollapsed(false);

  return (
    <LayoutTemplateProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar Icon Only - Visible on small/medium screens */}
        <div className="lg:hidden">
          <AppSidebarCompact />
        </div>

        {/* Full Sidebar - Visible on large screens */}
        <div className="hidden lg:block">
          {isSidebarCollapsed ? (
            <AppSidebarCompact onExpand={handleExpand} />
          ) : (
            <SidebarProvider>
              <BaseSidebar
                title="Sistem TIK"
                subtitle="Admin Panel"
                className="z-30"
                headerAction={
                  <button
                    type="button"
                    onClick={handleCollapse}
                    className="p-2 rounded-md text-navy transition-colors hover:bg-navy hover:text-gray-light p-[10px]"
                    aria-label="Sembunyikan sidebar"
                  >
                    <X className="h-[20px] w-[20px]" />
                  </button>
                }
              >
                <AppSidebarContent />
              </BaseSidebar>
            </SidebarProvider>
          )}
        </div>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-h-screen bg-gray-light ml-20 transition-all duration-300 ${
            isSidebarCollapsed ? "lg:ml-20" : "lg:ml-[294px]"
          }`}
        >
          {/* Navbar - Sticky di atas */}
          <div className="sticky top-0 bg-white border-b border-navy-hover w-full z-20">
            <div className="md:px-8">
              <AppNavbar />
            </div>
          </div>

          {/* Main Content - Scrollable dengan responsive padding */}
          <main>
            <div className="md:px-8 p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </LayoutTemplateProvider>
  );
}
