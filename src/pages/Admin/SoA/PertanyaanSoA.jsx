import { useMemo, useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { SearchIcon, Plus, ChevronDown, Funnel, FilePen, Trash2 } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminLayout } from "@/layouts/admin/AdminLayoutContext"
import { PaginateControls } from "@/components/admin/table"
import { ChecklistCard } from "@/components/admin/audit/ChecklistCard"
import { reviewNavigatorConfig } from "@/mocks/reviewSoAData"
import { OverlayForm } from "@/components/admin/soa/OverlayForm"

const PAGINATE_OPTIONS = [10, 20, 50]

const buildQuestionItems = () => {
  const fallbackDescription =
    "Has management defined and approved a set of policies for information security?"
  return reviewNavigatorConfig.flatMap((section) =>
    section.questions.map((question, index) => ({
      id: question.id ?? `${section.code}-${index + 1}`,
      title: question.label,
      description: question.description ?? fallbackDescription,
      sectionCode: section.code,
      sectionLabel: section.label ?? section.title ?? "Kategori SoA",
    })),
  )
}

export default function PertanyaanSoA() {
  const { setHeader } = useAdminLayout()
  const allItems = useMemo(() => buildQuestionItems(), [])
  const [searchValue, setSearchValue] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [perPage, setPerPage] = useState(10)
  const [activePage, setActivePage] = useState(1)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setHeader({
      title: "Statement of Applicability",
      subtitle: "Kelola dokumen, kategori, dan pertanyaan SoA",
      user: {
        name: "Admin User",
        role: "Administrator",
        urlDetail: "/admin/profil",
      },
    })
  }, [setHeader])

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchValue.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.sectionCode === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [allItems, searchValue, selectedCategory])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage))
  const pagedItems = useMemo(() => {
    const startIndex = (activePage - 1) * perPage
    return filteredItems.slice(startIndex, startIndex + perPage)
  }, [filteredItems, activePage, perPage])

  const handlePaginateChange = (value) => {
    setPerPage(Number(value))
    setActivePage(1)
  }


  const categoryOptions = [
    { label: "Semua Kategori", value: "all" },
    ...reviewNavigatorConfig.map((section) => ({
      label: `${section.code} - ${section.label ?? section.title ?? "Kategori"}`,
      value: section.code,
    })),
  ]

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center gap-4 ">
        <InputGroup className="h-[56px] flex-1">
          <InputGroupInput
            placeholder="Cari pertanyaan berdasarkan nama"
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value)
              setActivePage(1)
            }}
            className="bg-state text-navy placeholder:text-gray-dark"
          />
          <InputGroupAddon>
            <SearchIcon className="text-navy" />
          </InputGroupAddon>
        </InputGroup>

        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-[56px] min-w-[160px] justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <Funnel className="h-4 w-4" />
                {categoryOptions.find((option) => option.value === selectedCategory)?.label}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[180px]">
            <DropdownMenuLabel>Pilih Kategori</DropdownMenuLabel>
            {categoryOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => {
                  setSelectedCategory(option.value)
                  setActivePage(1)
                  setIsCategoryMenuOpen(false)
                }}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <OverlayForm
          variant="question"
          trigger={
            <Button className="h-[56px] gap-2 bg-navy text-white hover:bg-navy-hover p-4">
              <Plus className="h-5 w-5" /> Tambah Pertanyaan
            </Button>
          }
          categoryOptions={categoryOptions}
        />
      </div>

      <div className="space-y-4">
        {pagedItems.map((item) => (
          <ChecklistCard
            key={item.id}
            badge={item.sectionCode}
            title={item.title}
            description={item.description}
            meta={
              <span className="inline-flex items-center bg-state px-3 py-1 small rounded-[4px] text-navy">
                Kategori: {item.sectionCode} - {item.sectionLabel}
              </span>
            }
            actions={
              <div className="flex items-center gap-2">
                <OverlayForm
                  variant="question"
                  mode="edit"
                  defaultValues={{
                    category: `${item.sectionCode} - ${item.sectionLabel}`,
                    code: item.id,
                    name: item.title,
                    question: item.description,
                  }}
                  categoryOptions={categoryOptions}
                  trigger={
                    <button
                      type="button"
                      className="rounded p-2 transition-colors hover:bg-blue-50"
                      title="Edit"
                    >
                      <FilePen className="h-5 w-5 text-[#2B7FFF]" />
                    </button>
                  }
                />
                <button
                  type="button"
                  className="rounded p-2 transition-colors hover:bg-red-50"
                  title="Hapus"
                  onClick={() => console.log("Hapus", item)}
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
              </div>
            }
          />
        ))}
        {pagedItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            Tidak ada pertanyaan sesuai pencarian
          </div>
        )}
      </div>

      <PaginateControls
        perPage={perPage}
        onPaginateChange={handlePaginateChange}
        paginateValue={PAGINATE_OPTIONS}
        setActivePage={setActivePage}
        activePage={activePage}
        onPageChange={setActivePage}
        totalPages={totalPages}
        totalData={filteredItems.length}
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
