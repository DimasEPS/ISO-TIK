import { useCallback, useState } from "react"
import { NavLink } from "react-router-dom"
import { SearchIcon, Plus, FilePen, Trash2 } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { ChecklistCard } from "@/components/admin/audit/ChecklistCard"
import { usePageTemplate } from "@/hooks/usePageTemplate"
import { PaginateControls } from "@/components/admin/table"
import { OverlayForm } from "@/components/admin/soa/OverlayForm"
import { DocumentDeleteDialog } from "@/pages/documents/components/DocumentDeleteDialog"
import { useSoACategories } from "./hooks/useSoACategories"

const PAGINATE_OPTIONS = [10, 20, 50]

export default function KategoriSoA() {
  usePageTemplate({
    title: "Statement of Applicability",
    subtitle: "Kelola dokumen, kategori, dan pertanyaan SoA",
    user: {
      name: "Admin User",
      role: "Administrator",
      urlDetail: "/admin/profil",
    },
  })

  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const {
    searchValue,
    setSearchValue,
    perPage,
    activePage,
    setActivePage,
    pagedData,
    totalPages,
    totalData,
    handlePaginateChange,
    isLoading,
    isError,
    error,
    createCategory,
    isCreatingCategory,
    updateCategory,
    isUpdatingCategory,
    deleteCategory,
  } = useSoACategories()

  const handleSearchChange = useCallback(
    (event) => {
      setSearchValue(event.target.value)
    },
    [setSearchValue],
  )

  const handleSubmitCategory = useCallback(
    async (payload, categoryId) => {
      try {
        if (categoryId) {
          await updateCategory(categoryId, payload)
        } else {
          await createCategory(payload)
        }
      } catch (submitError) {
        console.error("Gagal menyimpan kategori SoA", submitError)
        alert(submitError?.message ?? "Gagal menyimpan kategori SoA")
      }
    },
    [createCategory, updateCategory],
  )

  const handleDeleteCategory = useCallback(
    async (categoryPayload) => {
      const categoryId =
        typeof categoryPayload === "string" ? categoryPayload : categoryPayload?.id
      if (!categoryId) return
      try {
        await deleteCategory(categoryId)
        setCategoryToDelete(null)
      } catch (deleteError) {
        console.error("Gagal menghapus kategori SoA", deleteError)
        alert(deleteError?.message ?? "Gagal menghapus kategori SoA")
      }
    },
    [deleteCategory],
  )

  const handlePromptDeleteCategory = useCallback(
    (category) => {
      if (!category) {
        setCategoryToDelete(null)
        return
      }

      setCategoryToDelete({
        ...category,
        judul: category.judul || category.name || "Kategori",
      })
    },
    [setCategoryToDelete],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-[4px] p-4">
        <InputGroup className="h-[56px] flex-1 w-[1355px]">
          <InputGroupInput
            placeholder="Cari kategori berdasarkan nama"
            value={searchValue}
            onChange={handleSearchChange}
            className="bg-state text-navy placeholder:text-gray-dark"
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <OverlayForm
          variant="category"
          onCategorySubmit={handleSubmitCategory}
          categorySubmitting={isCreatingCategory}
          trigger={
            <Button className="h-[56px] gap-2 bg-navy text-white hover:bg-navy-hover w-[191px] p-[16px]">
              <Plus className="h-5 w-5" /> Tambah Kategori
            </Button>
          }
          categoryOptions={[]}
        />
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red">
          {error?.message || "Gagal memuat kategori SoA"}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Memuat data kategori SoA...
        </div>
      ) : (
        <div className="space-y-4">
          {pagedData.map((item) => (
            <ChecklistCard
              key={item.id}
              badge={item.code}
              title={item.name}
              description={item.description || "-"}
              meta={
                <span className="inline-flex items-center bg-state px-3 py-1 small rounded-[4px] text-navy">
                  Kode: {item.code || "-"}
                </span>
              }
              actions={
                <div className="flex items-center gap-2">
                  <OverlayForm
                    variant="category"
                    mode="edit"
                    defaultValues={{
                      id: item.id,
                      code: item.code,
                      name: item.name,
                      description: item.description,
                    }}
                    onCategorySubmit={handleSubmitCategory}
                    categorySubmitting={isUpdatingCategory}
                    trigger={
                      <button
                        type="button"
                        className="rounded p-2 transition-colors hover:bg-blue-50"
                        title="Edit"
                      >
                        <FilePen className="h-5 w-5 text-[#2B7FFF]" />
                      </button>
                    }
                    categoryOptions={[]}
                  />
                  <button
                    type="button"
                    className="rounded p-2 transition-colors hover:bg-red-50"
                    title="Hapus"
                    onClick={() => handlePromptDeleteCategory(item)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              }
            />
          ))}
          {pagedData.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              Tidak ada kategori sesuai pencarian
            </div>
          )}
        </div>
      )}

      <PaginateControls
        perPage={perPage}
        onPaginateChange={handlePaginateChange}
        paginateValue={PAGINATE_OPTIONS}
        setActivePage={setActivePage}
        activePage={activePage}
        onPageChange={setActivePage}
        totalPages={totalPages}
        totalData={totalData}
      />

      <DocumentDeleteDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null)
        }}
        documentData={categoryToDelete}
        entityLabel="Kategori"
        onConfirm={(payload) => payload && handleDeleteCategory(payload)}
      />
    </div>
  )
}

function TabNavigation() {
  const tabs = [
    { label: "Dokumen SoA", to: "/admin/soa/dokumen" },
    { label: "Kategori SOA", to: "/admin/soa/kategori" },
    { label: "Pertanyaan SOA", to: "/admin/soa/pertanyaan" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `rounded-xl px-5 py-2 text-sm font-semibold ${
              isActive ? "bg-white text-navy shadow-sm border border-[#E1E6F4]" : "text-gray-500"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
