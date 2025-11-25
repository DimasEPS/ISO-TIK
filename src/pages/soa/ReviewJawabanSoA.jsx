import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { List, Rows3, ChevronDown, Check, X, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SearchBar, StatusDropdown } from "@/components/admin/table"
import { ScaleTable } from "@/components/scaleTable"
import { documentsService } from "@/services/documentsService"
import { soaAnswersService } from "@/services/soaAnswersService"
import { useReviewSoA } from "./hooks/useReviewSoA"

const CONTROL_METRICS = [
  {
    field: "pl",
    code: "PL",
    label: "Persyaratan Legal",
  },
  {
    field: "kk",
    code: "KK",
    label: "Kewajiban Kontrak",
  },
  {
    field: "pk_pb",
    code: "PK/PB",
    label: "Persyaratan Kerja / Praktik yang Baik",
  },
  {
    field: "hpr",
    code: "HPR",
    label: "Hasil Penilaian Risiko (Keamanan Informasi)",
  },
]

const CONTROL_VALUE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partial", label: "Partial" },
]

const CONTROL_VALUE_LABELS = CONTROL_VALUE_OPTIONS.reduce(
  (map, option) => ({ ...map, [option.value]: option.label }),
  {},
)

const getControlValueLabel = (value) => {
  if (!value) return undefined
  const normalized = String(value).toLowerCase()
  return CONTROL_VALUE_LABELS[normalized]
}

const CONTROL_CODES = CONTROL_METRICS.map((metric) => metric.code)

const VIEW_MODE_OPTIONS = [
  { value: "detail", label: "Pengisian Jawaban", icon: List },
  { value: "table", label: "Tampilan Tabel", icon: Rows3 },
]

const currentControlToLabel = (value) => {
  if (value === "yes") return "Y"
  if (value === "no") return "T"
  if (value === "partial") return "S"
  return "-"
}

const splitSummaryText = (text) => {
  if (!text) return []
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

const getStatusBadge = (answer) => {
  if (!answer) {
    return {
      label: "Belum Dijawab",
      className: "bg-gray-100 text-gray-500 border border-gray-200",
    }
  }

  if (answer.is_review) {
    return {
      label: "Sudah Ditinjau",
      className: "bg-green-light text-green border border-green/30",
    }
  }

  return {
    label: "Draft",
    className: "bg-yellow-light text-yellow border border-yellow/40",
  }
}

const mapAnswerDetailResponse = (response) => {
  const data = response?.data ?? response
  if (!data) return null

  const documents = (data.soa_answer_documents ?? []).map((item) => ({
    id: item.document?.id ?? item.id_documents,
    code: item.document?.code ?? item.document_code ?? item.document?.document_code ?? "-",
    title: item.document?.name ?? item.document_name ?? "-",
    description: item.document?.description ?? "-",
  }))

  return {
    id: data.id,
    questionId: data.question?.id ?? null,
    current_control: data.current_control ?? "no",
    pl: data.pl ?? "",
    kk: data.kk ?? "",
    pk_pb: data.pk_pb ?? "",
    hpr: data.hpr ?? "",
    justification: data.justification ?? "",
    implementation_summary: data.implementation_summary ?? "",
    reviewer_comment: data.reviewer_comment ?? "",
    documents,
  }
}

const buildInitialFormState = ({ detail, questionId, documentId } = {}) => ({
  current_control: detail?.current_control ?? "no",
  pl: detail?.pl ?? "",
  kk: detail?.kk ?? "",
  pk_pb: detail?.pk_pb ?? "",
  hpr: detail?.hpr ?? "",
  justification: detail?.justification ?? "",
  implementation_summary: detail?.implementation_summary ?? "",
  id_soa_questions: questionId ?? detail?.questionId ?? null,
  id_soa_documents: documentId ?? null,
  document_ids: detail?.documents?.map((doc) => doc.id) ?? [],
})

const buildInitialDocuments = (detail) => detail?.documents ?? []

const buildQuestionRow = (question, summary, detail) => {
  const badge = getStatusBadge(summary)

  return {
    id: question.code || question.id,
    title: question.title,
    description: question.description,
    yts: currentControlToLabel(summary?.current_control),
    controls: {
      PL: getControlValueLabel(summary?.pl) ?? "-",
      KK: getControlValueLabel(summary?.kk) ?? "-",
      "PK/PB": getControlValueLabel(summary?.pk_pb) ?? "-",
      HPR: getControlValueLabel(summary?.hpr) ?? "-",
    },
    justification: summary?.justification || "-",
    summary: splitSummaryText(summary?.implementation_summary),
    documents: detail?.documents ?? [],
    statusLabel: badge.label,
    statusClass: badge.className,
    reviewerComment: summary?.reviewer_comment || "-",
  }
}

const buildSectionsFromCache = (categories, answersByQuestion, queryClient) => {
  if (!categories?.length) return []
  return categories.map((category) => ({
    code: category.code,
    title: category.title,
    questions: (category.questions ?? []).map((question) => {
      const summary = answersByQuestion.get(question.id)
      const cachedDetail =
        summary?.id && queryClient.getQueryData(["soa-answers", "detail", summary.id])
          ? mapAnswerDetailResponse(queryClient.getQueryData(["soa-answers", "detail", summary.id]))
          : null

      return buildQuestionRow(question, summary, cachedDetail)
    }),
  }))
}

const buildSectionsWithFetch = async (categories, answersByQuestion, queryClient) => {
  const sections = []
  for (const category of categories) {
    const rows = []
    for (const question of category.questions ?? []) {
      const summary = answersByQuestion.get(question.id)
      let detail = null

      if (summary?.id) {
        const cached = queryClient.getQueryData(["soa-answers", "detail", summary.id])
        if (cached) {
          detail = mapAnswerDetailResponse(cached)
        } else {
          const response = await queryClient.fetchQuery({
            queryKey: ["soa-answers", "detail", summary.id],
            queryFn: () => soaAnswersService.getAnswer(summary.id),
          })
          detail = mapAnswerDetailResponse(response)
        }
      }

      rows.push(buildQuestionRow(question, summary, detail))
    }
    sections.push({
      code: category.code,
      title: category.title,
      questions: rows,
    })
  }
  return sections
}

const mapDocumentOption = (item = {}) => ({
  id: item.id,
  code: item.document_code ?? item.document_number ?? item.noDoc ?? "-",
  title: item.document_name ?? item.documentName ?? item.title ?? "-",
  description: item.description ?? "-",
})

const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function ReviewJawabanSoA() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const documentId = searchParams.get("documentId")
  const isViewOnlyMode = searchParams.get("mode") === "view"

  const {
    categories,
    categoriesLoading,
    categoriesError,
    document,
    documentLoading,
    documentError,
    answersByQuestion,
    answersLoading,
    answersError,
    saveAnswer,
    isSavingAnswer,
    reviewAnswer,
    isReviewingAnswer,
  } = useReviewSoA({ documentId })

  const [viewMode, setViewMode] = useState(VIEW_MODE_OPTIONS[0].value)
  const isTableMode = viewMode === "table"

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.code,
        label: category.title,
      })),
    [categories],
  )

  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]?.value ?? "")
  useEffect(() => {
    if (!categoryOptions.length) return
    setSelectedCategory((prev) => {
      if (categoryOptions.some((option) => option.value === prev)) return prev
      return categoryOptions[0]?.value ?? ""
    })
  }, [categoryOptions])

  const selectedCategoryData = useMemo(
    () => categories.find((category) => category.code === selectedCategory) ?? categories[0],
    [categories, selectedCategory],
  )

  const [selectedQuestion, setSelectedQuestion] = useState(selectedCategoryData?.questions?.[0]?.id ?? "")
  useEffect(() => {
    if (!selectedCategoryData) return
    setSelectedQuestion((prev) => {
      if (selectedCategoryData.questions?.some((question) => question.id === prev)) return prev
      return selectedCategoryData.questions?.[0]?.id ?? ""
    })
  }, [selectedCategoryData])

  const currentQuestion = useMemo(
    () => selectedCategoryData?.questions?.find((question) => question.id === selectedQuestion) ?? null,
    [selectedCategoryData, selectedQuestion],
  )

  const orderedQuestions = useMemo(() => {
    const entries = []
    categories.forEach((category) => {
      category.questions?.forEach((question) => {
        entries.push({ categoryCode: category.code, question })
      })
    })
    return entries
  }, [categories])

  const activeAnswerSummary = currentQuestion ? answersByQuestion.get(currentQuestion.id) : null
  const activeAnswerId = activeAnswerSummary?.id ?? null

  const answerDetailQuery = useQuery({
    queryKey: ["soa-answers", "detail", activeAnswerId],
    enabled: Boolean(activeAnswerId),
    queryFn: () => soaAnswersService.getAnswer(activeAnswerId),
  })

  const answerDetail = useMemo(
    () => mapAnswerDetailResponse(answerDetailQuery.data),
    [answerDetailQuery.data],
  )

  const [formState, setFormState] = useState(() =>
    buildInitialFormState({ detail: answerDetail, questionId: currentQuestion?.id, documentId }),
  )
  const [selectedDocuments, setSelectedDocuments] = useState(() => buildInitialDocuments(answerDetail))
  const [isDocumentPickerOpen, setIsDocumentPickerOpen] = useState(false)
  const [reviewComment, setReviewComment] = useState("")

  useEffect(() => {
    setFormState(buildInitialFormState({ detail: answerDetail, questionId: currentQuestion?.id, documentId }))
    setSelectedDocuments(buildInitialDocuments(answerDetail))
  }, [answerDetail?.id, currentQuestion?.id, documentId])

  useEffect(() => {
    if (!activeAnswerId) {
      setReviewComment("")
      return
    }

    const sourceComment =
      answerDetail?.reviewer_comment ?? activeAnswerSummary?.reviewer_comment ?? ""
    setReviewComment(sourceComment)
  }, [activeAnswerId, answerDetail?.reviewer_comment, activeAnswerSummary?.reviewer_comment])

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      document_ids: selectedDocuments.map((doc) => doc.id),
    }))
  }, [selectedDocuments])

  const handleCurrentControlChange = useCallback((value) => {
    setFormState((prev) => ({ ...prev, current_control: value }))
  }, [])

  const handleMetricChange = useCallback((field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleFieldChange = useCallback((field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSaveAnswer = useCallback(async () => {
    if (isViewOnlyMode) return
    if (!documentId || !currentQuestion) {
      toast.warning("Pilih dokumen dan pertanyaan terlebih dahulu.")
      return
    }

    try {
      await saveAnswer({
        answerId: activeAnswerSummary?.id,
        payload: {
          ...formState,
          id_soa_documents: documentId,
          id_soa_questions: currentQuestion.id,
        },
      })
      toast.success("Jawaban berhasil disimpan.")
    } catch (error) {
      console.error("Gagal menyimpan jawaban SoA", error)
      toast.error(error?.message ?? "Gagal menyimpan jawaban SoA.")
    }
  }, [activeAnswerSummary?.id, currentQuestion, documentId, formState, isViewOnlyMode, saveAnswer])

  const handleRemoveDocument = useCallback((documentIdToRemove) => {
    setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== documentIdToRemove))
  }, [])

  const handleDocumentsConfirm = useCallback((documents) => {
    setSelectedDocuments(documents)
    setIsDocumentPickerOpen(false)
  }, [])

  const handleSaveReviewComment = useCallback(async () => {
    if (!activeAnswerId) {
      toast.warning("Belum ada jawaban yang dapat ditinjau.")
      return
    }

    const trimmedComment = reviewComment.trim()

    if (!trimmedComment) {
      toast.warning("Komentar reviewer tidak boleh kosong.")
      return
    }

    try {
      const response = await reviewAnswer({
        answerId: activeAnswerId,
        reviewer_comment: trimmedComment,
      })

      const updatedComment = response?.reviewer_comment ?? trimmedComment
      setReviewComment(updatedComment)
      toast.success("Komentar reviewer berhasil disimpan.")
    } catch (error) {
      console.error("Gagal menyimpan komentar reviewer", error)
      const message =
        error?.response?.data?.errors?.reviewer_comment?.[0] ??
        error?.response?.data?.message ??
        error?.message ??
        "Gagal menyimpan komentar reviewer."
      toast.error(message)
    }
  }, [activeAnswerId, reviewAnswer, reviewComment])

  const [tableDetailVersion, setTableDetailVersion] = useState(0)

  useEffect(() => {
    if (!isTableMode) return
    let cancelled = false
    const fetchDetails = async () => {
      await Promise.all(
        Array.from(answersByQuestion.values()).map((answer) => {
          if (!answer?.id) return Promise.resolve()
          return queryClient.prefetchQuery({
            queryKey: ["soa-answers", "detail", answer.id],
            queryFn: () => soaAnswersService.getAnswer(answer.id),
          })
        }),
      )
      if (!cancelled) {
        setTableDetailVersion((prev) => prev + 1)
      }
    }
    fetchDetails()
    return () => {
      cancelled = true
    }
  }, [answersByQuestion, isTableMode, queryClient])

  const tableSections = useMemo(
    () => buildSectionsFromCache(categories, answersByQuestion, queryClient),
    [categories, answersByQuestion, queryClient, tableDetailVersion],
  )

  const [tableSearch, setTableSearch] = useState("")
  const [tableCategory, setTableCategory] = useState("Semua Kategori")
  const [isTableStatusOpen, setIsTableStatusOpen] = useState(false)

  const tableCategoryOptions = useMemo(
    () => [{ value: "Semua Kategori" }, ...categories.map((category) => ({ value: category.code }))],
    [categories],
  )

  const handlePrevQuestion = useCallback(() => {
    const activeIndex = orderedQuestions.findIndex((entry) => entry.question.id === selectedQuestion)
    if (activeIndex <= 0) return
    const target = orderedQuestions[activeIndex - 1]
    setSelectedCategory(target.categoryCode)
    setSelectedQuestion(target.question.id)
  }, [orderedQuestions, selectedQuestion])

  const handleNextQuestion = useCallback(() => {
    const activeIndex = orderedQuestions.findIndex((entry) => entry.question.id === selectedQuestion)
    if (activeIndex === -1 || activeIndex === orderedQuestions.length - 1) return
    const target = orderedQuestions[activeIndex + 1]
    setSelectedCategory(target.categoryCode)
    setSelectedQuestion(target.question.id)
  }, [orderedQuestions, selectedQuestion])

  const viewModeControl = <ViewModeDropdown viewMode={viewMode} onViewModeChange={setViewMode} />

  if (!documentId) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
        <p className="body-medium text-navy mb-2">Pilih dokumen SoA terlebih dahulu.</p>
        <p className="mb-4 text-sm text-gray-500">
          Silakan buka daftar Dokumen SoA, pilih salah satu dokumen, lalu klik tombol “Isi Jawaban”.
        </p>
        <Button onClick={() => navigate("/admin/soa/dokumen")}>Kembali ke Dokumen SoA</Button>
      </div>
    )
  }

  if (documentLoading || categoriesLoading || answersLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
        Memuat data pengisian SoA...
      </div>
    )
  }

  if (documentError || categoriesError || answersError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red">
        {documentError?.message || categoriesError?.message || answersError?.message || "Gagal memuat data SoA"}
      </div>
    )
  }

  return (
    <div>
      <div
        className={`mx-auto flex h-[calc(100vh-120px)] w-full flex-col gap-6 overflow-hidden lg:grid lg:items-start lg:gap-8 ${
          isTableMode
            ? "lg:grid-cols-[minmax(0,1fr)_auto]"
            : "lg:grid-cols-[minmax(0,1fr)_365px]"
        }`}
      >
        <div className={`flex h-full flex-col overflow-hidden ${isTableMode ? "" : "border-r border-navy-hover"}`}>
          <div className="shrink-0 pb-2 lg:pb-4 lg:pr-4">
            <PageHeader
              documentMeta={document}
              categoryOptions={categoryOptions}
              selectedCategory={selectedCategory}
            />
          </div>

          {isTableMode ? (
            <div className="flex-1 min-h-0 pb-4 space-y-4 px-2">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center flex-1">
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
                    options={tableCategoryOptions}
                    classNameButton="h-[56px] w-[219px]"
                    classNameDropdown="w-[219px]"
                  />
                </div>
              </div>
              <LegendBar />
              <ScaleTable
                data={{ controlCodes: CONTROL_CODES, sections: tableSections }}
                search={tableSearch}
                categoryFilter={tableCategory}
              />
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0 pr-1 lg:pr-4">
              <div className="space-y-6 pb-4">
                <QuestionCard
                  question={currentQuestion}
                  controlMetrics={CONTROL_METRICS}
                  formState={formState}
                  onCurrentControlChange={handleCurrentControlChange}
                  onMetricChange={handleMetricChange}
                  onFieldChange={handleFieldChange}
                  selectedDocuments={selectedDocuments}
                  onOpenDocumentPicker={() => setIsDocumentPickerOpen(true)}
                  onRemoveDocument={handleRemoveDocument}
                  readOnly={isViewOnlyMode}
                />
                {isViewOnlyMode && (
                  <CommentCard
                    value={reviewComment}
                    onChange={setReviewComment}
                    onSave={handleSaveReviewComment}
                    isSaving={isReviewingAnswer}
                    disabled={!activeAnswerId}
                  />
                )}
                <ActionBar
                  readOnly={isViewOnlyMode}
                  onSave={handleSaveAnswer}
                  onPrevQuestion={handlePrevQuestion}
                  onNextQuestion={handleNextQuestion}
                  isSaving={isSavingAnswer}
                />
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex flex-col gap-4 mb-4 lg:mb-0 lg:col-start-2 lg:pt-4 lg:items-end">
          <div className="flex justify-end w-full lg:w-auto">{viewModeControl}</div>

          {!isTableMode && (
            <aside className="space-y-4 overflow-y-auto lg:sticky lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
              <LegendCard activeCategoryCode={selectedCategory} />
              <Navigator
                sections={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedQuestion={selectedQuestion}
                onQuestionChange={setSelectedQuestion}
                answersByQuestion={answersByQuestion}
              />
            </aside>
          )}
        </div>
      </div>

      <DocumentPickerDialog
        open={isDocumentPickerOpen}
        onOpenChange={setIsDocumentPickerOpen}
        selectedDocuments={selectedDocuments}
        onConfirm={handleDocumentsConfirm}
      />
    </div>
  )
}

function PageHeader({ documentMeta, categoryOptions, selectedCategory }) {
  const categoryLabel = categoryOptions.find((option) => option.value === selectedCategory)?.label ?? "-"

  return (
    <section>
      <div className="relative space-y-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link to={`/admin/soa/dokumen`} className="small text-gray-dark hover:text-blue-dark">
              Dokumen SOA
            </Link>
            <span className="text-gray-dark">&gt;</span>
            <span className="small text-blue-dark">Pengisian Jawaban SOA</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            <h1 className="heading-2 text-navy">Pengisian Jawaban SOA</h1>
            <div className="space-y-1 grid grid-cols-2">
              <div>
                <p className="small text-gray-dark mb-3">Judul Dokumen</p>
                <p className="heading-4 text-blue-dark">{documentMeta?.judul ?? "-"}</p>
                <p className="text-sm text-gray-500 mt-1">No Dokumen: {documentMeta?.noDoc ?? "-"}</p>
              </div>
              <div>
                <p className="small text-gray-dark mb-3">Kategori SoA Aktif</p>
                <p className="heading-4 text-blue-dark">
                  <span className="text-gray-light bg-blue-dark px-2 py-1 rounded body-medium mr-4">
                    {selectedCategory || "-"}
                  </span>
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

function QuestionCard({
  question,
  controlMetrics,
  formState,
  onCurrentControlChange,
  onMetricChange,
  onFieldChange,
  selectedDocuments,
  onOpenDocumentPicker,
  onRemoveDocument,
  readOnly,
}) {
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
          <span className="rounded bg-blue-dark px-2 py-1 small-medium text-gray-light">{question.code || question.id}</span>
          <p className="body-bold text-navy">{question.title}</p>
        </div>
        <p className="text-navy-hover leading-relaxed body">{question.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
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
                  checked={formState.current_control === option.value}
                  onChange={(event) => onCurrentControlChange(event.target.value)}
                  disabled={readOnly}
                />
                <span className={formState.current_control === option.value ? "text-navy font-medium" : "text-gray-dark"}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

  <div className="rounded border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border border-navy text-sm text-blue-dark">
              <thead className="border-b border-navy">
                <tr>
                  <th className="bg-blue-light px-6 py-3 text-left text-base border-r border-navy font-semibold text-blue-dark">
                    Kendali yang Dipilih &amp; Alasan Pemilihan
                  </th>
                  {CONTROL_VALUE_OPTIONS.map((option, index) => (
                    <th
                      key={option.value}
                      className={`bg-blue-light px-4 py-3 text-center text-base font-semibold text-blue-dark ${
                        index === CONTROL_VALUE_OPTIONS.length - 1 ? "" : "border-r border-navy"
                      }`}
                    >
                      {option.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {controlMetrics.map((metric, metricIndex) => (
                  <tr
                    key={metric.field}
                    className={`bg-transparent text-sm ${
                      metricIndex !== controlMetrics.length - 1 ? "border-b border-navy" : ""
                    }`}
                  >
                    <td className="px-6 py-4 border-r border-navy">
                      <p className="font-semibold text-blue-dark">{metric.label}</p>
                    </td>
                    {CONTROL_VALUE_OPTIONS.map((option, optionIndex) => {
                      const isSelected = formState[metric.field] === option.value
                      return (
                        <td
                          key={`${metric.field}-${option.value}`}
                          className={`px-4 py-3 text-center align-middle ${
                            optionIndex !== CONTROL_VALUE_OPTIONS.length - 1 ? "border-r border-[#101C46]" : ""
                          }`}
                        >
                          <label className="inline-flex items-center justify-center gap-2 text-sm">
                            <input
                              type="radio"
                              className="h-4 w-4 cursor-pointer appearance-none rounded-full border border-[#5C6BAE] bg-transparent transition checked:border-4 checked:border-[#6C8CFF] disabled:cursor-not-allowed"
                              name={`metric-${metric.field}`}
                              value={option.value}
                              checked={isSelected}
                              onChange={(event) => onMetricChange(metric.field, event.target.value)}
                              disabled={readOnly}
                            />
                          </label>
                        </td>
                      )
                    })}
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
        value={formState.justification}
        onChange={(value) => onFieldChange("justification", value)}
        readOnly={readOnly}
      />
      <FormField
        label="Ringkasan Penerapan / Pelaksanaan"
        placeholder="Ringkasan implementasi kontrol keamanan informasi"
        value={formState.implementation_summary}
        onChange={(value) => onFieldChange("implementation_summary", value)}
        readOnly={readOnly}
      />

      <RelatedDocs
        docs={selectedDocuments}
        onAddDocuments={onOpenDocumentPicker}
        onRemoveDocument={onRemoveDocument}
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
        className={`min-h-[110px] w-full rounded-2xl border border-[#E3E9FF] px-4 py-3 text-sm text-gray-700 focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF] ${
          readOnly ? "bg-[#ECEFF5]" : "bg-[#F6F7FB]"
        }`}
      />
    </div>
  )
}

function RelatedDocs({ docs, onAddDocuments, onRemoveDocument, readOnly }) {
  return (
    <section className="rounded-2xl border border-[#2B7FFF] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-2xl bg-[#2B7FFF] px-6 py-4 text-white">
        <div>
          <p className="text-sm font-semibold">Dokumen Terkait</p>
          <p className="text-xs text-white/80">{docs.length} dokumen dipilih</p>
        </div>
        {!readOnly && (
          <Button className="bg-white text-[#2B7FFF] hover:bg-gray-100" onClick={onAddDocuments}>
            <ChevronDown className="mr-2 h-4 w-4" /> Tambah Dokumen Terkait
          </Button>
        )}
      </div>

      <div className="space-y-3 px-6 py-4">
        {docs.length === 0 && <p className="text-sm text-gray-500">Belum ada dokumen terkait yang dipilih.</p>}
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#DCE8FF] bg-[#F6F9FF] px-4 py-3"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#2B7FFF]">{doc.code}</p>
              <p className="font-semibold text-navy">{doc.title}</p>
              <p className="text-xs text-gray-500">{doc.description || "-"}</p>
            </div>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-red-500 hover:bg-white"
                aria-label="Hapus dokumen"
                onClick={() => onRemoveDocument(doc.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function CommentCard({ value, onChange, onSave, isSaving, disabled }) {
  const handleChange = (event) => {
    onChange?.(event.target.value)
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[#D8E2FF] bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-navy">Komentar Reviewer</p>
        <p className="text-xs text-gray-500">Tambahkan catatan saat meninjau jawaban.</p>
      </div>
      <textarea
        value={value ?? ""}
        onChange={handleChange}
        placeholder="Tulis komentar reviewer"
        readOnly={disabled}
        className={`min-h-[140px] w-full rounded-2xl border border-[#E3E9FF] p-4 text-sm text-gray-dark focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BB2FF] ${
          disabled ? "bg-[#ECEFF5]" : "bg-[#F6F7FB]"
        }`}
      />
      {disabled ? (
        <p className="text-xs text-gray-500">Komentar reviewer tersedia setelah jawaban disimpan.</p>
      ) : (
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={isSaving} className="bg-navy text-white hover:bg-navy/90">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Komentar
          </Button>
        </div>
      )}
    </section>
  )
}

function ActionBar({ readOnly, onSave, onPrevQuestion, onNextQuestion, isSaving }) {
  return (
    <div className="flex flex-col-reverse gap-4 rounded-2xl border border-[#D8E2FF] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <Button variant="outline" className="w-full sm:w-auto" onClick={onPrevQuestion}>
        ← Pertanyaan Sebelumnya
      </Button>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {!readOnly && (
          <Button className="w-full bg-green-500 text-white hover:bg-green-600 sm:w-auto" onClick={onSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Jawaban
          </Button>
        )}
        <Button variant="default" className="w-full sm:w-auto" onClick={onNextQuestion}>
          Pertanyaan Selanjutnya →
        </Button>
      </div>
    </div>
  )
}

function LegendCard({ activeCategoryCode }) {
  return (
    <section className="w-full md:w-[364px] rounded border border-blue-dark bg-blue-light text-sm text-[#1F2D56] shadow-sm">
      <div className="space-y-2 px-5 py-4">
        <p className="font-semibold text-navy">Keterangan:</p>
        <div className="space-y-1 text-blue-dark">
          <p>Y = Ya</p>
          <p>T = Tidak</p>
          <p>S = Sebagian</p>
        </div>
      </div>
      <div className="px-5 py-4 text-xs space-y-1 text-blue-dark">
        <hr className="border-t border-blue" />
        <p>PL = Persyaratan Legal</p>
        <p>KK = Kewajiban Kontrak</p>
        <p>PK/PB = Persyaratan Kerja / Praktik yang Baik</p>
        <p>HPR = Hasil Penilaian Risiko</p>
      </div>
      <div className="px-5 py-3 text-xs text-blue-dark">
        <p>Kategori Aktif</p>
        <p className="font-semibold text-blue-dark">{activeCategoryCode || "-"}</p>
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
    "PK/PB = Persyaratan Kerja / Praktik yang Baik",
    "HPR = Hasil Penilaian Risiko (Keamanan Informasi)",
  ]

  return (
    <div className="rounded border border-blue-500 bg-[#EAF2FF] p-4 text-xs text-blue-700">
      <p className="body-medium text-navy-active mb-2">Keterangan:</p>
      <div className="flex flex-wrap gap-x-6 gap-y-1 small-medium">
        {entries.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  )
}

function Navigator({ sections, selectedCategory, onCategoryChange, selectedQuestion, onQuestionChange, answersByQuestion }) {
  const [expandedCategory, setExpandedCategory] = useState(selectedCategory)

  useEffect(() => {
    setExpandedCategory(selectedCategory)
  }, [selectedCategory])

  const getQuestionStatusClass = (questionId) => {
    const answer = answersByQuestion.get(questionId)
    if (!answer) {
      return "border-gray-300 text-gray-400 bg-white"
    }
    if (answer.is_review) {
      return "border-green-500 text-green-500 bg-green-50"
    }
    return "border-yellow-400 text-yellow-500 bg-yellow-50"
  }

  return (
    <section className="w-full md:w-[364px] space-y-4 p-5 text-sm shadow-sm">
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
                    <span className="bg-navy text-gray-light mr-2 px-2 py-1 rounded">{section.code}</span>
                    <span className="ml-1 body text-navy">{section.title}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
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
                            <span className="small-medium text-navy">{question.code || question.id}</span>
                            <span className="small text-gray-600">{question.title}</span>
                          </div>
                          <span
                            className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getQuestionStatusClass(
                              question.id,
                            )}`}
                          >
                            {answersByQuestion.get(question.id)?.is_review ? "Review" : answersByQuestion.get(question.id) ? "Draft" : "Kosong"}
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
          className="flex items-center justify-between gap-2 rounded border border-navy w-full md:w-[364px] h-12 bg-state px-4 py-2 text-sm body text-navy shadow-sm"
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
        <DropdownMenuLabel className="text-xs text-gray-500">Mode Tampilan</DropdownMenuLabel>
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
                  isSelected ? "text-navy bg-state" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <OptionIcon className="h-4 w-4 text-gray-500" />
                <div className="flex flex-col">
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

function DocumentPickerDialog({ open, onOpenChange, selectedDocuments, onConfirm }) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const documentsQuery = useQuery({
    queryKey: ["documents", "picker", debouncedSearch],
    queryFn: () =>
      documentsService.listDocuments({
        search: debouncedSearch || undefined,
        per_page: 50,
      }),
    enabled: open,
  })

  const documents = useMemo(
    () => (documentsQuery.data?.data ?? []).map(mapDocumentOption),
    [documentsQuery.data],
  )

  const [tempSelection, setTempSelection] = useState(() => new Map())

  useEffect(() => {
    if (!open) return
    const map = new Map()
    selectedDocuments.forEach((doc) => map.set(doc.id, doc))
    setTempSelection(map)
  }, [open, selectedDocuments])

  const toggleDocument = (doc) => {
    setTempSelection((prev) => {
      const next = new Map(prev)
      if (next.has(doc.id)) {
        next.delete(doc.id)
      } else {
        next.set(doc.id, doc)
      }
      return next
    })
  }

  const handleConfirm = () => {
    onConfirm(Array.from(tempSelection.values()))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Tambah Dokumen Terkait</DialogTitle>
          <DialogDescription>Pilih dokumen yang relevan sebagai referensi jawaban.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Cari dokumen berdasarkan nama"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="bg-state text-navy placeholder:text-gray-dark"
          />

          <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
            {documentsQuery.isLoading && <p className="text-sm text-gray-500">Memuat dokumen...</p>}
            {!documentsQuery.isLoading && documents.length === 0 && (
              <p className="text-sm text-gray-500">Tidak ada dokumen yang sesuai.</p>
            )}
            {documents.map((doc) => {
              const isSelected = tempSelection.has(doc.id)
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => toggleDocument(doc)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-[#DCE8FF] bg-[#F6F9FF] hover:bg-white"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#2B7FFF]">{doc.code}</p>
                    <p className="font-semibold text-navy">{doc.title}</p>
                    <p className="text-xs text-gray-500">{doc.description}</p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirm}>Simpan Dokumen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
