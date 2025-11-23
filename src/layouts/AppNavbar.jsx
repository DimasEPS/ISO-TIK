import { Link } from "react-router-dom";
import { useLayoutTemplate } from "./LayoutTemplateContext";

function getInitials(name = "") {
  const [first = "", second = ""] = name.trim().split(" ");
  if (!first && !second) return "";
  if (!second) return first.slice(0, 2).toUpperCase();
  return `${first[0]}${second[0]}`.toUpperCase();
}

export function AppNavbar() {
  const { template } = useLayoutTemplate();
  const {
    title,
    subtitle,
    user = { name: "User", role: "Role", urlDetail: "/admin/profil" },
  } = template;
  const initials = user?.initials ?? getInitials(user?.name);

  return (
    <header className="bg-white w-full">
      <div className="flex items-center justify-between py-3 sm:py-4 gap-4 sm:gap-8 min-h-[70px]">
        <div className="flex flex-col min-w-0 flex-1">
          <h1 className="heading-3 text-navy truncate text-xl sm:text-2xl md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-dark text-xs sm:text-sm truncate">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          className="flex items-center gap-2 sm:gap-3 shrink-0"
          to={user?.urlDetail || "/admin/profil"}
        >
          <div className="hidden sm:flex size-10 sm:size-11 items-center justify-center rounded-full text-xs sm:text-sm font-semibold text-[#1B2A49] bg-gray-light shrink-0">
            {initials}
          </div>
          <div className="hidden sm:flex flex-col text-right shrink-0">
            <span className="text-[#1B2A49] body-medium text-sm whitespace-nowrap">
              {user?.name || "User"}
            </span>
            <span className="text-gray-dark small text-xs whitespace-nowrap">
              {user?.role || "Role"}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
