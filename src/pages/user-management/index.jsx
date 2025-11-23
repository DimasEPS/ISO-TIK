import { useMemo, useState } from "react"
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
import { USERS, USER_COLUMNS as BASE_USER_COLUMNS } from "./data/index.jsx"

// Enhance USER_COLUMNS with Status render function
const USER_COLUMNS = BASE_USER_COLUMNS.map(col => {
  if (col.key === "status") {
    return {
      ...col,
      render: (row) => (
        <span
          className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium ${
            STATUS_STYLES[row.status] ??
            "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {row.status}
        </span>
      ),
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

  const filteredUsers = useMemo(() => {
    const searchValue = search.toLowerCase()
    return USERS.filter((user) => {
      const matchesStatus =
        statusFilter === "Semua Status" || user.status === statusFilter
      const fullName = user.lastName ? `${user.fullName} ${user.lastName}` : user.fullName;
      const matchesSearch =
        fullName.toLowerCase().includes(searchValue) ||
        user.username.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
      return matchesStatus && matchesSearch
    })
  }, [search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage))
  const pagedUsers = useMemo(() => {
    const startIndex = (activePage - 1) * perPage
    return filteredUsers.slice(startIndex, startIndex + perPage)
  }, [filteredUsers, activePage, perPage])

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
    // Generate PDF untuk semua users (filtered)
    await generateUsersListPDF(filteredUsers, {
      filename: 'daftar-pengguna.pdf',
      filters: {
        status: statusFilter !== 'all' ? statusFilter : 'Semua',
        search: search || undefined,
      },
    })
  }

  const handleAddUser = (userData) => {
    // TODO: Implement API call to add user
    console.log("Add user:", userData)
    setIsAddModalOpen(false)
    alert("Pengguna berhasil ditambahkan!")
  }

  const handleSaveEdit = (userData) => {
    // TODO: Implement API call to update user
    console.log("Update user:", userData)
    setIsEditModalOpen(false)
    alert("Pengguna berhasil diperbarui!")
  }

  const handleSaveResetPassword = (data) => {
    // TODO: Implement API call to reset password
    console.log("Reset password:", data)
    setIsResetPasswordModalOpen(false)
    alert("Password berhasil direset!")
  }

  const handleConfirmDelete = (userId) => {
    // TODO: Implement API call to delete user
    console.log("Delete user:", userId)
    setIsDeleteModalOpen(false)
    alert("Pengguna berhasil dihapus!")
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

      <AdminTable
        className="bg-white"
        tableClassName="min-w-[960px]"
        columns={columnsWithActions}
        data={pagedUsers}
        getRowKey={(row) => row.id}
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
        totalData={filteredUsers.length}
      />

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
