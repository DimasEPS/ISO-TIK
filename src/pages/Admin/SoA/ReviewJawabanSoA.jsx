import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { List, Rows3, Eye, ChevronDown, ChevronRight, Check, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchBar, StatusDropdown } from "@/components/admin/table"
import { useReviewSoA } from "./hooks/useReviewSoA"
import {
  getReviewMetaByTitle,
  reviewControlMatrix,
  reviewRelatedDocuments,
  reviewNavigatorConfig,
} from "@/mocks/reviewSoAData"
import { ScaleTable } from "@/components/scaleTable"
import { scaleTableData } from "@/mocks/scaleTable"

const CATEGORY_OPTIONS = reviewNavigatorConfig.map((section) => ({
  label: `${section.title}`,
  value: section.code,
}))

const VIEW_MODE_OPTIONS = [
  { value: "detail", label: "Pengisian Jawaban", icon: List, url: "/admin/soa/pengisian" },
  { value: "table", label: "Tampilan Table", icon: Rows3, url: "/admin/soa/pengisian/table" },
]
const TABLE_CATEGORY_OPTIONS = [
  { value: "Semua Kategori" },
  ...reviewNavigatorConfig.map((section) => ({ value: section.code  })),
]

export default function ReviewJawabanSoA() {
  const controls = useMemo(() => reviewControlMatrix, [])
  const documentMeta = useMemo(() => getReviewMetaByTitle("SOA ISO 27001:2022 - Q1 2025"), [])
  const [viewMode, setViewMode] = useState(VIEW_MODE_OPTIONS[0].value)
  const [selectedCategory, setSelectedCategory] = useState(reviewNavigatorConfig[0]?.code ?? "")
  const selectedCategoryData = useMemo(
    () => reviewNavigatorConfig.find((cat) => cat.code === selectedCategory),
    [selectedCategory],
  )
  const [selectedQuestion, setSelectedQuestion] = useState(selectedCategoryData?.questions[0]?.id ?? "")
  useMemo(() => {
    setSelectedQuestion(selectedCategoryData?.questions[0]?.id ?? "")
  }, [selectedCategory, selectedCategoryData])

  const currentQuestion = useMemo(
    () =>
      selectedCategoryData?.questions.find((q) => q.id === selectedQuestion) ??
      selectedCategoryData?.questions[0],
    [selectedQuestion, selectedCategoryData],
  )

  const { controlState, setControlState, comment, setComment } = useReviewSoA({
    defaultControlState: "no",
  })

  const isTableMode = viewMode === "table"
  const [searchParams] = useSearchParams()
  const isViewOnlyMode = searchParams.get("mode") === "view"
  const [tableSearch, setTableSearch] = useState("")
  const [tableCategory, setTableCategory] = useState(TABLE_CATEGORY_OPTIONS[0].value)
  const [isTableStatusOpen, setIsTableStatusOpen] = useState(false)
  const viewModeControl = <ViewModeDropdown viewMode={viewMode} onViewModeChange={setViewMode} />
  const viewModeCard = <div className="w-full max-w-[365px]">{viewModeControl}</div>

  return (
    <div>
      <div
        className={`mx-auto flex h-[calc(100vh-120px)] w-full flex-col gap-6 overflow-hidden lg:grid lg:items-start lg:gap-8 ${
          isTableMode ? "lg:grid-cols-[minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_365px]"
        }`}
      >
        <div className={`flex h-full flex-col overflow-hidden ${isTableMode ? "" : "border-r border-navy-hover"}`}>
          <div className="shrink-0 pb-2 lg:pb-4 lg:pr-4">
            <PageHeader
              documentMeta={documentMeta}
              selectedCategory={selectedCategory}
              categoryOptions={CATEGORY_OPTIONS}
              viewModeControl={isTableMode ? viewModeControl : null}
            />
          </div>
          {viewMode === "table" ? (
            <div className="flex-1 min-h-0 pb-4 space-y-4 px-2">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <SearchBar
                  placeholder="Cari pertanyaan atau kendali"
                  value={tableSearch}
                  onChange={(event) => setTableSearch(event.target.value)}
                  className="w-full"
                />
                <StatusDropdown
                  isMenuOpen={isTableStatusOpen}
                  setIsMenuOpen={setIsTableStatusOpen}
                  value={tableCategory}
                  onChange={setTableCategory}
                  options={TABLE_CATEGORY_OPTIONS}
                  classNameButton="h-[56px] w-[219px]"
                  classNameDropdown="w-[219px]"
                />
              </div>
              <LegendBar />
              <ScaleTable data={scaleTableData} search={tableSearch} categoryFilter={tableCategory} />
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0 pr-1 lg:pr-4">
              <div className="space-y-6 pb-4">
                <QuestionCard
                  question={currentQuestion}
                  controls={controls}
                  controlState={controlState}
                  setControlState={setControlState}
                  readOnly={isViewOnlyMode}
                />
                <RelatedDocs docs={reviewRelatedDocuments} readOnly={isViewOnlyMode} />
                <CommentCard comment={comment} setComment={setComment} />
                <ActionBar readOnly={isViewOnlyMode} />
              </div>
            </ScrollArea>
          )}
        </div>

        {!isTableMode && (
          <aside className="space-y-4 overflow-y-auto lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto ">
            {viewModeCard}
            <div className="space-y-4">
              <LegendCard documentMeta={documentMeta} />
              <Navigator
                sections={reviewNavigatorConfig}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedQuestion={selectedQuestion}
                onQuestionChange={setSelectedQuestion}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

function PageHeader({ documentMeta, selectedCategory, categoryOptions, viewModeControl }) {
  const categoryLabel = categoryOptions.find((opt) => opt.value === selectedCategory)?.label || ""

  return (
    <section>
      <div className="relative space-y-5 py-4">
        {viewModeControl && (
          <div className="w-full max-w-[365px] sm:w-auto lg:absolute lg:right-0 lg:top-0">{viewModeControl}</div>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link to={`/admin/soa/dokumen`} className="small text-gray-dark hover:text-blue-dark">
            Dokumen SOA
          </Link>
          <span className="text-gray-dark">&gt;</span>
          <span className="small text-blue-dark">Pengisian Jawaban SOA</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            <h1 className="heading-2 text-navy">Pengisian Jawaban SOA</h1>
            <div className="space-y-1 grid grid-cols-2">
              <div>
                <p className="small text-gray-dark mb-3">Judul Dokumen</p>
                <p className="heading-4 text-blue-dark">{documentMeta.title}</p>
              </div>
              <div>
                <p className="small text-gray-dark mb-3">Kategori SoA</p>
                <p className="heading-4 text-blue-dark">
                  <span className="text-gray-light bg-blue-dark px-2 py-1 rounded body-medium mr-4">{selectedCategory}</span>
                  {categoryLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuestionCard({ question, controls, controlState, setControlState, readOnly }) {
  const [formData, setFormData] = useState({
    justification: "",
    summary: "",
  })

  const CONTROL_COLUMNS = [
    { label: "Ya", value: "yes", width: 43 },
    { label: "Tidak", value: "no", width: 67 },
    { label: "Sebagian", value: "partial", width: 96 },
  ]

  const CONTROL_TABLE_DIMENSIONS = {
    width: 566,
    headerHeight: 43,
    rowHeight: 34,
    firstColumnWidth: 360,
  }

  if (!question) {
    return (
      <section className="rounded-2xl border border-[#DDE3F5] bg-white p-6 shadow-sm">
        <p className="text-center text-gray-500">Pilih pertanyaan untuk menampilkan detail</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl shadow-sm space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded bg-blue-dark px-2 py-1 small-medium text-gray-light">{question.id}</span>
          <p className="body-bold text-navy">{question.label}</p>
        </div>
        <p className="text-navy-hover leading-relaxed body">{question.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[150px_minmax(0,1fr)]">
        <div className="space-y-3">
          <p className="body-medium text-navy">Kendali Saat Ini</p>
          <div className="flex flex-col gap-4 body">
            {[
              { label: "Ya", value: "yes" },
              { label: "Tidak", value: "no" },
              { label: "Sebagian", value: "partial" },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="accent-navy"
                  name="control-state"
                  value={option.value}
                  checked={controlState === option.value}
                  onChange={(event) => setControlState(event.target.value)}
                  disabled={readOnly}
                />
                <span className={controlState === option.value ? "text-navy font-medium" : "text-gray-dark"}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2 overflow-auto">
          <div className="shadow-sm" style={{ width: CONTROL_TABLE_DIMENSIONS.width }}>
            <table className="w-full table-fixed border-collapse border-spacing-0">
              <colgroup>
                <col style={{ width: CONTROL_TABLE_DIMENSIONS.firstColumnWidth }} />
                {CONTROL_COLUMNS.map((column) => (
                  <col key={column.value} style={{ width: column.width }} />
                ))}
              </colgroup>
              <thead>
                <tr
                  style={{ height: CONTROL_TABLE_DIMENSIONS.headerHeight }}
                  className="bg-blue-light text-blue-dark"
                >
                  <th className="border border-blue-dark px-3 text-left body rounded-tl-[200px]">
                    Kendali yang Dipilih &amp; Alasan Pemilihan
                  </th>
                  {CONTROL_COLUMNS.map((column) => (
                    <th key={column.value} className="border border-blue-dark text-center body">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {controls.map((control, index) => (
                  <tr
                    key={control.code}
                    style={{ height: CONTROL_TABLE_DIMENSIONS.rowHeight }}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"}`}
                  >
                    <td className="px-3 font-semibold text-navy">
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate body text-[#1F2D56]">{control.label}</span>
                      </div>
                    </td>
                    {CONTROL_COLUMNS.map((column) => (
                      <td key={`${control.code}-${column.value}`} className="border-l border-[#E1E7FB] px-2">
                        <div className="flex items-center justify-center">
                          <input
                            type="radio"
                            name={`control-${control.code}`}
                            className="h-2.5 w-2.5 accent-navy"
                            defaultChecked={control.value[column.value]}
                            disabled={readOnly}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FormField
        label="Pembenaran (Justifikasi) terhadap Pengecualian"
        placeholder="Jelaskan alasan pemilihan dan pengecualian jika ada"
        value={formData.justification}
        onChange={(value) => setFormData({ ...formData, justification: value })}
        readOnly={readOnly}
      />
      <FormField
        label="Ringkasan Penerapan / Pelaksanaan"
        placeholder="Ringkasan implementasi kontrol keamanan informasi"
        value={formData.summary}
        onChange={(value) => setFormData({ ...formData, summary: value })}
        readOnly={readOnly}
      />
    </section>
  )
}

function FormField({ label, placeholder, value, onChange, readOnly }) {
  return (
    <div className="space-y-2">
      <p className="body-medium text-navy">{label}</p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`min-h-[110px] w-full rounded-2xl border border-[#E3E9FF] px-4 py-3 text-sm text-gray-700 focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF] ${readOnly ? "bg-[#ECEFF5]" : "bg-[#F6F7FB]"}`}
      />
    </div>
  )
}

function RelatedDocs({ docs, readOnly }) {
  return (
    <section className="rounded-2xl border border-[#2B7FFF] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-2xl bg-[#2B7FFF] px-6 py-4 text-white">
        <div>
          <p className="text-sm font-semibold">Dokumen Terkait</p>
          <p className="text-xs text-white/80">{docs.length} dokumen dipilih</p>
        </div>
        {!readOnly && (
          <Button className="bg-white text-[#2B7FFF] hover:bg-gray-100">
            <ChevronDown className="mr-2 h-4 w-4" /> Tambah Dokumen Terkait
          </Button>
        )}
      </div>

      <div className="space-y-3 px-6 py-4">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#DCE8FF] bg-[#F6F9FF] px-4 py-3"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#2B7FFF]">{doc.id}</p>
              <p className="font-semibold text-navy">{doc.title}</p>
              <p className="text-xs text-gray-500">{doc.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#2B7FFF] hover:bg-white"
                aria-label="Lihat dokumen"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {!readOnly && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-green-500 hover:bg-white"
                    aria-label="Pertahankan"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-500 hover:bg-white"
                    aria-label="Hapus"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CommentCard({ comment, setComment }) {
  return (
    <section className="space-y-3 rounded-2xl border border-[#D8E2FF] bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-navy">Komentar Reviewer</p>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Placeholder"
        className="min-h-[140px] w-full rounded-2xl border border-[#E3E9FF] bg-[#F6F7FB] p-4 text-sm text-gray-dark focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF]"
      />
      <div className="flex justify-end">
        <Button disabled={!comment}>Simpan Komentar</Button>
      </div>
    </section>
  )
}

function ActionBar({ readOnly }) {
  return (
    <div className="flex flex-col-reverse gap-4 rounded-2xl border border-[#D8E2FF] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <Button variant="outline" className="w-full sm:w-auto">
        ← Pertanyaan Sebelumnya
      </Button>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {!readOnly && (
          <Button className="w-full bg-green-500 text-white hover:bg-green-600 sm:w-auto">
            Simpan Jawaban
          </Button>
        )}
        <Button variant="default" className="w-full sm:w-auto">
          Pertanyaan Selanjutnya →
        </Button>
      </div>
    </div>
  )
}

function LegendCard({ documentMeta }) {
  return (
    <section className="rounded-[4px] border border-blue-dark bg-blue-light text-sm text-[#1F2D56] shadow-sm">
      <div className="space-y-2 px-5 py-4">
        <p className="font-semibold text-navy">Keterangan:</p>
        <div className="space-y-1 text-blue-dark">
          <p >Y = Ya</p>
          <p>T = Tidak</p>
          <p>S = Sebagian</p>
        </div>
      </div>
      <div className="px-5 py-4 text-xs space-y-1 text-blue-dark">
        <hr className="border-t border-blue" />
        <p>PL = Persyaratan Legal</p>
        <p>KK = Kewajiban Kontrak</p>
        <p>PK/PB = Persyaratan Kerja / Praktek yang Baik</p>
        <p>HPR = Hasil Penilaian Risiko (Keamanan Informasi)</p>
      </div>
      <div className="px-5 py-3 text-xs text-blue-dark">
        <p>Kategori Aktif</p>
        <p className="font-semibold text-blue-dark">{documentMeta.category.code}</p>
      </div>
    </section>
  )
}

function LegendBar() {
  const entries = [
    "Y = Ya",
    "T = Tidak",
    "S = Sebagian",
    "PL = Persyaratan Legal",
    "KK = Kewajiban Kontrak",
    "PK/PB = Persyaratan Kerja / Praktek yang Baik",
    "HPR = Hasil Penilaian Risiko (Keamanan Informasi)",
  ]

  return (
    <div className="rounded-lg border border-blue-500 bg-[#EAF2FF] px-5 py-3 text-xs text-blue-700">
      <p className="font-semibold mb-2">Keterangan:</p>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px]">
        {entries.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  )
}

function Navigator({
  sections,
  selectedCategory,
  onCategoryChange,
  selectedQuestion,
  onQuestionChange,
}) {
  const [expandedCategory, setExpandedCategory] = useState(selectedCategory)

  useMemo(() => {
    setExpandedCategory(selectedCategory)
  }, [selectedCategory])

  const getQuestionStatus = (isActive) => {
    if (isActive) {
      return "border-green-500 text-green-500 bg-green-50"
    }
    return "border-gray-300 text-gray-400 bg-white"
  }

  return (
    <section className="space-y-4 p-5 text-sm shadow-sm">
      <p className="heading-4 text-navy">Navigator Pertanyaan</p>
      <ScrollArea className="max-h-[60vh] pr-1">
        <div className="space-y-2">
          {sections.map((section) => {
            const isExpanded = expandedCategory === section.code

            return (
              <div key={section.code} className="rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setExpandedCategory(isExpanded ? "" : section.code)
                    onCategoryChange(section.code)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 font-medium transition-colors ${
                    selectedCategory === section.code ? "" : "bg-[#F9FBFF] text-navy hover:bg-blue-50"
                  }`}
                >
                  <span className="text-xs">
                    <span className="bg-navy text-gray-light mr-2 px-2 py-1 rounded-[4px]">{section.code}</span>
                    <span className="ml-1 body text-navy">{section.label || section.title}</span>
                  </span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>

                {isExpanded && section.questions.length > 0 && (
                  <div className="bg-white ">
                    {section.questions.map((question) => (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => onQuestionChange(question.id)}
                        className={`w-full px-4 py-2 text-left transition-colors ${
                          selectedQuestion === question.id ? "" : "text-gray-dark hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="small-medium text-navy">{question.id}</span>
                            <span className="small text-gray-600">{question.label}</span>
                          </div>
                          <span
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${getQuestionStatus(
                              selectedQuestion === question.id,
                            )}`}
                          >
                            <span className="h-2 w-2 rounded-full bg-current" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {isExpanded && section.questions.length === 0 && (
                  <div className="bg-white border-t border-[#E3E9FF] px-3 py-2 text-center text-gray-400 text-xs">
                    Belum ada pertanyaan
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </section>
  )
}
function ViewModeDropdown({ viewMode, onViewModeChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const activeOption = VIEW_MODE_OPTIONS.find((option) => option.value === viewMode) ?? VIEW_MODE_OPTIONS[0]
  const ActiveIcon = activeOption.icon

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-between gap-2 rounded-[4px] border border-navy w-[364px] h-12 bg-state px-4 py-2 text-sm body text-navy shadow-sm"
        >
          <div className="flex items-center gap-2">
            <ActiveIcon className="text-gray-500" />
            <div className="flex flex-col">
              <span>{activeOption.label}</span>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[364px] bg-white p-2">
       
        <div className="space-y-1">
          {VIEW_MODE_OPTIONS.map((option) => {
            const OptionIcon = option.icon
            const isSelected = option.value === viewMode
            return (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => {
                  onViewModeChange(option.value)
                  setIsOpen(false)
                }}
                className={`flex h-12 w-full items-center gap-3 px-3 text-sm transition ${
                  isSelected
                    ? "text-navy bg-state"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <OptionIcon className="h-4 w-4 text-gray-500" />
                <div className="flex flex-col ">
                  <span>{option.label}</span>
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
