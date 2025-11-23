import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/context/AuthContext";
import usersIcon from "../assets/users.png";
import {
  ClipboardCheck,
  FileChartLine,
  FileText,
  Folder,
  FolderOpen,
  House,
  HouseIcon,
  LogOut,
  LogOutIcon,
  TriangleAlert,
} from "lucide-react";

// Constants
const NAVIGATION_ITEMS = [
  { title: "Dashboard", url: "/admin/dashboard", icon: House, hoverIcon: HouseIcon },
  { title: "Dokumen", url: "/admin/dokumen", icon: Folder, hoverIcon: FolderOpen },
  { title: "SoA", url: "/admin/soa", icon: FileText, hoverIcon: FileText },
  { title: "Audit", url: "/admin/audit", icon: ClipboardCheck, hoverIcon: ClipboardCheck },
  { title: "NCR", url: "/admin/ncr", icon: TriangleAlert, hoverIcon: TriangleAlert },
  { title: "Manual", url: "/admin/manual", icon: FileChartLine, hoverIcon: FileChartLine },
  {
    title: "Manajemen Pengguna",
    url: "/admin/manajemen-pengguna",
    icon: UserIcon,
    hoverIcon: UserIcon,
    iconClassName: "!h-6 !w-6 text-gray-dark",
    hoverIconClassName: "!h-6 !w-6 text-gray-dark",
  },
];

const SECTION_DIVIDERS = {
  1: "Modul Audit",
  5: "Administrasi",
};

const ICON_CLASSES = {
  base: "h-5 w-5 text-gray-dark transition-all duration-200",
  active: "h-5 w-5 text-gray-light transition-all duration-200",
  hover: "h-5 w-5 text-gray-dark transition-all duration-200",
};

const BUTTON_CLASSES = {
  base: "group/nav-item transition-all duration-200 rounded-lg",
  active: "!bg-navy !text-gray-light hover:!bg-navy hover:!text-gray-light cursor-default",
  inactive: "hover:bg-navy hover:text-gray-light",
};

const TEXT_CLASSES = {
  active: "text-gray-light text-[15px] transition-all duration-200",
  inactive: "text-gray-dark group-hover/nav-item:text-gray-light text-[15px] transition-all duration-200",
};

// Custom Icon Component
function UserIcon({ className = "h-4 w-4 text-gray-dark", ...props }) {
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

const getTextClasses = (isActive) => {
  return isActive ? TEXT_CLASSES.active : TEXT_CLASSES.inactive;
};

// Components
function SidebarNavItem({ item, isActive, isHovered, onClick, onMouseEnter, onMouseLeave }) {
  const showHoverIcon = isActive || isHovered;
  const IconComponent = showHoverIcon ? item.hoverIcon : item.icon;

  return (
    <div className="px-3">
      <NavLink 
        to={item.url} 
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`flex items-center gap-3 px-4 py-3 h-[52px] ${getButtonClasses(isActive)}`}
      >
        <IconComponent
          className={getIconClasses(
            showHoverIcon,
            isActive,
            showHoverIcon ? item.hoverIconClassName : item.iconClassName
          )}
        />
        <span className={getTextClasses(isActive)}>
          {item.title}
        </span>
      </NavLink>
    </div>
  );
}

function SectionDivider({ title }) {
  return (
    <div className="px-3 py-3">
      <hr className="border-navy mb-2" />
      <p className="text-[13px] text-gray-dark px-4">{title}</p>
    </div>
  );
}

export function AppSidebarContent() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get active item from URL
  const resolveActiveFromPath = useCallback(() => {
    if (typeof window === "undefined") return null;
    const path = window.location.pathname;
    const matched = NAVIGATION_ITEMS.find((item) => path.startsWith(item.url));
    return matched?.title ?? null;
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
    <div className="flex flex-col h-full justify-between py-4 px-4">
      <nav className="flex flex-col gap-1">
        <div className="px-3 py-2 mb-1">
          <p className="text-[13px] text-gray-dark px-4">Menu Utama</p>
        </div>

        {NAVIGATION_ITEMS.map((item, index) => (
          <div key={item.title}>
            <SidebarNavItem
              item={item}
              isActive={activeItem === item.title}
              isHovered={hoveredItem === item.title && activeItem !== item.title}
              onClick={() => setActiveItem(item.title)}
              onMouseEnter={() => handleMouseEnter(item.title)}
              onMouseLeave={handleMouseLeave}
            />

            {SECTION_DIVIDERS[index] && <SectionDivider title={SECTION_DIVIDERS[index]} />}
          </div>
        ))}
      </nav>

      <div className="px-3 mt-4">
        <button
          onClick={handleLogout}
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={handleMouseLeave}
          className="flex items-center gap-3 px-4 py-3 group transition-all duration-200 hover:bg-red-50 hover:text-red-700 rounded-lg w-full"
        >
          <LogOutIcon
            className={`h-5 w-5 transition-all duration-200 ${
              hoveredItem === "logout" ? "text-red-700" : "text-red-600"
            }`}
          />
          <span className="transition-all text-red-600 group-hover:text-red-700 text-[15px]">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}
