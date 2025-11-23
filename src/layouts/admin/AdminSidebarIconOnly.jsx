import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/context/AuthContext";
import usersIcon from "../../assets/users.png";
import {
  ClipboardCheck,
  FileChartLine,
  FileText,
  Folder,
  FolderOpen,
  House,
  HouseIcon,
  LogOutIcon,
  TriangleAlert,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Constants
const NAVIGATION_ITEMS = [
  { title: "Dashboard", url: "/admin/dashboard", icon: House, hoverIcon: HouseIcon },
  { title: "Dokumen", url: "/admin/dokumen", icon: Folder, hoverIcon: FolderOpen },
  { title: "SoA", url: "/admin/SoA", icon: FileText, hoverIcon: FileText },
  { title: "Audit", url: "/admin/Audit", icon: ClipboardCheck, hoverIcon: ClipboardCheck },
  { title: "NCR", url: "/admin/NCR", icon: TriangleAlert, hoverIcon: TriangleAlert },
  { title: "Manual", url: "/admin/manual", icon: FileChartLine, hoverIcon: FileChartLine },
  {
    title: "Manajemen Pengguna",
    url: "/admin/manajemen-pengguna",
    icon: UserIcon,
    hoverIcon: UserIcon,
    iconClassName: "!h-5 !w-5 text-gray-dark",
    hoverIconClassName: "!h-5 !w-5 text-navy",
  },
];

const SECTION_DIVIDERS = [1, 5];

const ICON_CLASSES = {
  base: "h-5 w-5 text-gray-dark transition-all duration-200",
  active: "h-5 w-5 text-gray-light transition-all duration-200",
  hover: "h-5 w-5 text-navy scale-110 transition-all duration-200",
};

const BUTTON_CLASSES = {
  base: "group/nav-item transition-all duration-200 rounded-lg w-12 h-12 flex items-center justify-center",
  active: "!bg-navy !text-gray-light hover:!bg-navy hover:!text-gray-light cursor-default",
  inactive: "hover:bg-gray-dark2 hover:text-gray-light",
};

// Custom Icon Component
function UserIcon({ className = "h-5 w-5 text-gray-dark", ...props }) {
  return (
    <span
      role="img"
      aria-label="User icon"
      className={`inline-block ${className}`.trim()}
      style={{
        WebkitMaskImage: `url(${usersIcon})`,
        maskImage: `url(${usersIcon})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        backgroundColor: "currentColor",
        display: "inline-block",
      }}
      {...props}
    />
  );
}

// Utility Functions
const getIconClasses = (showHover, isActive, customClass) => {
  if (customClass) return customClass;
  if (showHover) {
    return isActive ? ICON_CLASSES.active : ICON_CLASSES.hover;
  }
  return ICON_CLASSES.base;
};

const getButtonClasses = (isActive) => {
  const base = BUTTON_CLASSES.base;
  const style = isActive ? BUTTON_CLASSES.active : BUTTON_CLASSES.inactive;
  return `${base} ${style}`;
};

// Components
function SidebarNavIconItem({ item, isActive, isHovered, onClick, onMouseEnter, onMouseLeave }) {
  const showHoverIcon = isActive || isHovered;
  const IconComponent = showHoverIcon ? item.hoverIcon : item.icon;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={item.url}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={getButtonClasses(isActive)}
          >
            <IconComponent
              className={getIconClasses(
                showHoverIcon,
                isActive,
                showHoverIcon ? item.hoverIconClassName : item.iconClassName
              )}
            />
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-navy text-white">
          <p>{item.title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SectionDivider() {
  return <hr className="border-navy my-2 mx-2" />;
}

export function AdminSidebarIconOnly() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const [activeItem, setActiveItem] = useState(null);

  // Get active item from URL
  const resolveActiveFromPath = useCallback(() => {
    if (typeof window === "undefined") return null;
    const path = window.location.pathname;
    const matched = NAVIGATION_ITEMS.find((item) => path.startsWith(item.url));
    return matched?.title ?? NAVIGATION_ITEMS[0]?.title ?? null;
  }, []);

  // Initialize active item and listen to path changes
  useEffect(() => {
    setActiveItem(resolveActiveFromPath());
    const handlePopstate = () => setActiveItem(resolveActiveFromPath());
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, [resolveActiveFromPath]);

  // Handler for mouse events
  const handleMouseEnter = useCallback(
    (itemTitle) => {
      if (activeItem !== itemTitle) {
        setHoveredItem(itemTitle);
      }
    },
    [activeItem]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-gray-light border-r border-navy flex flex-col items-center py-6 z-30">
      {/* Main Menu */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        <div className="mb-2">
          <p className="text-xs text-gray-dark text-center px-2">Menu</p>
        </div>

        {NAVIGATION_ITEMS.map((item, index) => (
          <div key={item.title} className="w-full flex flex-col items-center">
            {SECTION_DIVIDERS.includes(index) && <SectionDivider />}
            
            <div className="px-2">
              <SidebarNavIconItem
                item={item}
                isActive={activeItem === item.title}
                isHovered={hoveredItem === item.title && activeItem !== item.title}
                onClick={() => setActiveItem(item.title)}
                onMouseEnter={() => handleMouseEnter(item.title)}
                onMouseLeave={handleMouseLeave}
              />
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto mb-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                onMouseEnter={() => setHoveredItem("logout")}
                onMouseLeave={handleMouseLeave}
                className="group transition-all duration-200 hover:bg-red-50 hover:text-red-700 rounded-lg w-12 h-12 flex items-center justify-center"
              >
                <LogOutIcon
                  className={`h-5 w-5 transition-all duration-200 ${
                    hoveredItem === "logout" ? "text-red-700" : "text-red-600"
                  }`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-red-600 text-white">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
