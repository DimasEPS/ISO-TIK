import { useMemo, useState, useEffect } from "react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { usePageTemplate } from "@/hooks/usePageTemplate";
import { Button } from "@/components/ui/button"
import {
  PaginateControls,
  SearchBar,
  StatusDropdown,
  Table as AdminTable,
} from "@/components/admin/table"
import { Download, Eye, FilePen, FileText, Plus, Trash2, FileDown } from "lucide-react"
import { PDFExportButton } from "@/generatePDF/components"
import { generateUserPDF, generateUsersListPDF } from "@/generatePDF"
import {
  ViewUserModal,
  AddUserModal,
  EditUserModal,
  ResetPasswordModal,
  DeleteUserModal,
} from "./components"
import { FILTER_OPTIONS, PAGINATE_OPTIONS, STATUS_STYLES } from "./constants"
import { USER_COLUMNS as BASE_USER_COLUMNS } from "./data/index.jsx"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUserManagement"
import { resolveUserDisplayName } from "@/lib/user-display"

// Status mapping: backend (active/inactive) → frontend display (Aktif/Nonaktif)
const STATUS_DISPLAY_MAP = {
  active: "Aktif",
  inactive: "Nonaktif",
}

// Enhance USER_COLUMNS with Status render function
const USER_COLUMNS = BASE_USER_COLUMNS.map(col => {
  if (col.key === "status") {
    return {
      ...col,
      render: (row) => {
        const displayStatus = STATUS_DISPLAY_MAP[row.status] ?? row.status
        return (
          <span
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium ${
              STATUS_STYLES[displayStatus] ??
              "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {displayStatus}
          </span>
        )
      },
    };
  }
  if (col.key === "role") {
    return {
      ...col,
      render: (row) => {
        // Display first role if multiple roles exist
        const roleDisplay = Array.isArray(row.roles) && row.roles.length > 0
          ? row.roles[0]
          : "-"
        return <span>{roleDisplay}</span>
      },
    };
  }
  return col;
});

export default function ManajemenPengguna() {
  usePageTemplate({
    title: "Manajemen Pengguna",
    subtitle: "Kelola akses dan peran pengguna platform",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  });
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState(FILTER_OPTIONS[0].value)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [perPage, setPerPage] = useState(10)
  const [activePage, setActivePage] = useState(1)

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setActivePage(1) // Reset to first page on search
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Map filter value to API status (Semua Status/Aktif/Nonaktif → all/active/inactive)
  const apiStatusFilter = useMemo(() => {
    if (statusFilter === "Semua Status") return "all"
    if (statusFilter === "Aktif") return "active"
    if (statusFilter === "Nonaktif") return "inactive"
    return "all"
  }, [statusFilter])

  // Fetch users from API with pagination and filters
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch: refetchUsers,
  } = useUsers({
    per_page: perPage,
    page: activePage,
    status: apiStatusFilter === "all" ? undefined : apiStatusFilter,
    search: debouncedSearch || undefined,
  })

  const users = usersResponse?.data ?? []
  const tableUsers = useMemo(
    () =>
      users.map((user) => {
        const id = user?.id ?? user?.user_id ?? user?.uuid ?? user?.username ?? user?.email
        const fullName = resolveUserDisplayName(user, user?.username ?? user?.email ?? "-")
        const firstName = user?.first_name ?? user?.firstName ?? ""
        const lastName = user?.last_name ?? user?.lastName ?? ""

        const normalizedRoles = Array.isArray(user?.roles)
          ? user.roles.map((role) => {
              if (typeof role === "string") return role
              if (role?.name) return role.name
              return String(role ?? "-")
            })
          : []

        return {
          ...user,
          id,
          fullName,
          firstName,
          lastName,
          role: normalizedRoles[0] ?? user?.role ?? "-",
          roles: normalizedRoles,
          status: user?.status ?? (user?.deleted_at ? "inactive" : "active"),
        }
      }),
    [users],
  )
  const meta = usersResponse?.meta ?? {}
  const totalPages = meta.last_page ?? 1
  const totalData = meta.total ?? 0

  // Mutations
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  // Action handlers
  const handleView = (user) => {
    // Navigate to user profile page
    navigate(`/admin/profil/${user.id}`, { state: { user } })
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleResetPassword = (user) => {
    setSelectedUser(user)
    setIsResetPasswordModalOpen(true)
  }

  const handleDelete = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleDownload = async (user) => {
    // Generate PDF untuk single user
    await generateUserPDF(user, {
      includeRoles: true,
      includeDetails: true,
      filename: `user-${user.username}.pdf`,
    })
  }

  const handleExportAllUsers = async () => {
    // Generate PDF untuk semua users (current page data)
    await generateUsersListPDF(tableUsers, {
      filename: 'daftar-pengguna.pdf',
      filters: {
        status: statusFilter !== 'Semua Status' ? statusFilter : 'Semua',
        search: search || undefined,
      },
    })
  }

  const handleAddUser = (userData) => {
    console.log("Creating user with payload:", userData)
    createUserMutation.mutate(userData, {
      onSuccess: () => {
        setIsAddModalOpen(false)
        toast.success("Pengguna berhasil ditambahkan!")
        refetchUsers()
      },
      onError: (error) => {
        console.error("Failed to create user:", error)
        console.error("Error data:", error.data)
        
        // Show validation errors if available
        let errorMessage = error.message || "Unknown error"
        if (error.data?.errors) {
          const validationErrors = Object.entries(error.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n")
          errorMessage = `Validation errors:\n${validationErrors}`
        }
        
        toast.error(`Gagal menambahkan pengguna: ${errorMessage}`)
      },
    })
  }

  const handleSaveEdit = (userData) => {
    if (!selectedUser?.id) return
    
    updateUserMutation.mutate(
      { userId: selectedUser.id, userData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
          toast.success("Pengguna berhasil diperbarui!")
          refetchUsers()
        },
        onError: (error) => {
          console.error("Failed to update user:", error)
          toast.error(`Gagal memperbarui pengguna: ${error.message || "Unknown error"}`)
        },
      }
    )
  }

  const handleSaveResetPassword = (data) => {
    // TODO: Implement API call to reset password when endpoint is available
    console.log("Reset password:", data)
    setIsResetPasswordModalOpen(false)
    toast.success("Password berhasil direset!")
  }

  const handleConfirmDelete = (userId) => {
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false)
        toast.success("Pengguna berhasil dihapus!")
        refetchUsers()
      },
      onError: (error) => {
        console.error("Failed to delete user:", error)
        toast.error(`Gagal menghapus pengguna: ${error.message || "Unknown error"}`)
      },
    })
  }

  // Update columns with action handlers
  const columnsWithActions = useMemo(() => {
    return USER_COLUMNS.map((col) => {
      if (col.key === "actions") {
        return {
          ...col,
          render: (row) => (
            <>
              <button type="button" title="Lihat" onClick={() => handleView(row)}>
                <Eye className="text-navy w-5 h-5 cursor-pointer hover:opacity-70" />
              </button>
              <button type="button" title="Edit" onClick={() => handleEdit(row)}>
                <FilePen className="text-blue-600 w-5 h-5 cursor-pointer hover:opacity-70" />
              </button>
            </>
          ),
        }
      }
      return col
    })
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SearchBar
          placeholder="Cari pengguna berdasarkan nama lengkap"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setActivePage(1)
          }}
          inputGroupClassName="h-12 flex-1"
        />

        <StatusDropdown
          isMenuOpen={isStatusDropdownOpen}
          setIsMenuOpen={setIsStatusDropdownOpen}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value)
            setActivePage(1)
          }}
          options={FILTER_OPTIONS}
          classNameButton="w-[180px] h-12"
          classNameDropdown="w-[180px]"
        />

        <PDFExportButton
          onExport={handleExportAllUsers}
          label="Export PDF"
          variant="outline"
          className="h-12 whitespace-nowrap"
        />

        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex h-12 items-center gap-2 rounded-lg bg-navy px-6 text-white hover:bg-navy/90 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white">
          <p className="text-gray-500">Memuat data pengguna...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 bg-white">
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      ) : (
        <>
          <AdminTable
            className="bg-white"
            tableClassName="min-w-[960px]"
            columns={columnsWithActions}
            data={tableUsers}
            getRowKey={(row) => row.id || row.username}
          />

          <PaginateControls
            perPage={perPage}
            onPaginateChange={(value) => {
              setPerPage(Number(value))
              setActivePage(1)
            }}
            paginateValue={PAGINATE_OPTIONS}
            activePage={activePage}
            onPageChange={setActivePage}
            totalPages={totalPages}
            totalData={totalData}
          />
        </>
      )}

      {/* Modals */}
      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveEdit}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveResetPassword}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={selectedUser}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
