import { usePageTemplate } from "@/hooks/usePageTemplate";

export default function Dashboard() {
  usePageTemplate({
    title: "Dashboard",
    subtitle: "Selamat datang di sistem audit management",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });

  return <div></div>;
}
