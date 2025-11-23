import { createContext, useContext, useMemo, useState } from "react";

const LayoutTemplateContext = createContext(null);

export function LayoutTemplateProvider({ children }) {
  const [template, setTemplate] = useState({
    title: "Dashboard",
    subtitle: "Selamat datang di sistem audit management",
    user: {
      name: "Pengguna",
      role: "Pengelola",
      urlDetail: "/admin/profil",
    },
  });

  const value = useMemo(
    () => ({
      template,
      setTemplate,
    }),
    [template]
  );

  return (
    <LayoutTemplateContext.Provider value={value}>
      {children}
    </LayoutTemplateContext.Provider>
  );
}

export function useLayoutTemplate() {
  const ctx = useContext(LayoutTemplateContext);
  if (!ctx) {
    throw new Error("useLayoutTemplate must be used inside LayoutTemplateProvider");
  }
  return ctx;
}
