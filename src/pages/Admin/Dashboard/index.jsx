import { useAdminLayout } from "@/layouts/admin/AdminLayoutContext"
import { useEffect } from "react";
export default function Dashboard(){
    const {setHeader} = useAdminLayout();
    useEffect(() => {
            setHeader({
                title: "Dashboard",
                subtitle: "Selamat datang di sistem audit management",
                user: {
                    name: "Admin User",
                    role: "Administrator",
                    urlDetail: '/admin/profil'
                }
            })
        }, [])
    return(
        <div>

        </div>
    )
}