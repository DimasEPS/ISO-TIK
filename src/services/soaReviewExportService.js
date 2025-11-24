import { soaCategoriesService } from "@/services/soaCategoriesService"
import { soaAnswersService } from "@/services/soaAnswersService"

const MAX_PAGE_SIZE = 100 // backend per_page limit

const CONTROL_METRICS = [
  { field: "pl", code: "PL", label: "Persyaratan Legal" },
  { field: "kk", code: "KK", label: "Kewajiban Kontrak" },
  { field: "pk_pb", code: "PK/PB", label: "Persyaratan Kerja / Praktik yang Baik" },
  { field: "hpr", code: "HPR", label: "Hasil Penilaian Risiko (Keamanan Informasi)" },
]

const CONTROL_VALUE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partial", label: "Partial" },
]

const CONTROL_VALUE_LABELS = CONTROL_VALUE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

const CONTROL_CODES = CONTROL_METRICS.map((metric) => metric.code)

const currentControlToLabel = (value) => {
  if (value === "yes") return "Y"
  if (value === "no") return "T"
  if (value === "partial") return "S"
  return "-"
}

const getControlValueLabel = (value) => {
  if (!value) return "-"
  const normalized = String(value).toLowerCase()
  return CONTROL_VALUE_LABELS[normalized] ?? "-"
}

const splitSummaryText = (text) => {
  if (!text) return []
  return String(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

const extractPaginatedResult = (response) => {
  const payload = response?.data ?? response ?? {}

  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: response?.meta ?? {},
    }
  }

  if (Array.isArray(payload?.data)) {
    return {
      items: payload.data,
      meta: payload.meta ?? response?.meta ?? {},
    }
  }

  return {
    items: [],
    meta: payload?.meta ?? response?.meta ?? {},
  }
}

const resolveLastPage = (meta = {}, fallback = 1) => {
  const lastPage = Number(meta.last_page ?? meta.lastPage)
  if (Number.isFinite(lastPage) && lastPage > 0) {
    return lastPage
  }

  const total = Number(meta.total ?? meta.Total)
  const perPage = Number(meta.per_page ?? meta.perPage ?? MAX_PAGE_SIZE)
  if (Number.isFinite(total) && Number.isFinite(perPage) && perPage > 0) {
    return Math.max(1, Math.ceil(total / perPage))
  }

  return fallback
}

const fetchAllPages = async (request, baseParams = {}) => {
  const firstResponse = await request({
    ...baseParams,
    per_page: MAX_PAGE_SIZE,
    page: 1,
  })

  const { items: firstItems, meta } = extractPaginatedResult(firstResponse)
  const results = [...firstItems]

  const lastPage = resolveLastPage(meta, 1)

  if (!Number.isFinite(lastPage) || lastPage <= 1) {
    return results
  }

  const requests = []
  for (let page = 2; page <= lastPage; page += 1) {
    requests.push(
      request({
        ...baseParams,
        per_page: MAX_PAGE_SIZE,
        page,
      }),
    )
  }

  if (requests.length) {
    const responses = await Promise.all(requests)
    responses.forEach((response) => {
      const { items } = extractPaginatedResult(response)
      if (items.length) {
        results.push(...items)
      }
    })
  }

  return results
}

const fetchAllCategories = () =>
  fetchAllPages((params) => soaCategoriesService.listCategoriesWithQuestions(params))

const fetchAllAnswers = (documentId) =>
  fetchAllPages((params) => soaAnswersService.listAnswers(params), {
    document_id: documentId,
  })

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

const mapCategoryWithQuestions = (item = {}) => ({
  id: item.id,
  code: item.code ?? item.category_code,
  title: item.name ?? item.category_name ?? "-",
  questions: (item.questions ?? []).map((question) => ({
    id: question.id,
    code: question.code ?? question.question_code,
    title: question.name ?? question.question_name ?? "-",
    description: question.question ?? "",
  })),
})

const mapAnswerSummary = (item = {}) => ({
  id: item.id,
  questionId: item.question?.id ?? null,
  current_control: item.current_control ?? null,
  pl: item.pl ?? null,
  kk: item.kk ?? null,
  pk_pb: item.pk_pb ?? null,
  hpr: item.hpr ?? null,
  justification: item.justification ?? "",
  implementation_summary: item.implementation_summary ?? "",
  reviewer_comment: item.reviewer_comment ?? "",
  is_review: Boolean(item.is_review),
})

const buildQuestionRow = (question, summary, detail) => {
  const badge = getStatusBadge(summary)

  return {
    id: question.code || question.id,
    title: question.title,
    description: question.description,
    yts: currentControlToLabel(summary?.current_control),
    controls: {
      PL: getControlValueLabel(summary?.pl),
      KK: getControlValueLabel(summary?.kk),
      "PK/PB": getControlValueLabel(summary?.pk_pb),
      HPR: getControlValueLabel(summary?.hpr),
    },
    justification: summary?.justification || "-",
    summary: splitSummaryText(summary?.implementation_summary),
    documents: detail?.documents ?? [],
    statusLabel: badge.label,
    statusClass: badge.className,
    reviewerComment:
      (detail?.reviewer_comment ?? summary?.reviewer_comment ?? "-")?.trim() || "-",
  }
}

export const getSoAReviewExportData = async (documentId) => {
  if (!documentId) {
    throw new Error("Dokumen SoA tidak ditemukan.")
  }

  const [categoriesRaw, answersRaw] = await Promise.all([
    fetchAllCategories(),
    fetchAllAnswers(documentId),
  ])

  const categories = categoriesRaw.map(mapCategoryWithQuestions)
  const answers = answersRaw.map(mapAnswerSummary)

  const answersByQuestion = new Map()
  answers.forEach((answer) => {
    if (answer.questionId) {
      answersByQuestion.set(answer.questionId, answer)
    }
  })

  const detailByAnswerId = new Map()
  await Promise.all(
    answers
      .filter((answer) => answer.id)
      .map(async (answer) => {
        try {
          const detailResponse = await soaAnswersService.getAnswer(answer.id)
          detailByAnswerId.set(answer.id, mapAnswerDetailResponse(detailResponse))
        } catch (error) {
          console.error("Gagal mengambil detail jawaban SoA", error)
        }
      }),
  )

  const sections = categories.map((category) => ({
    code: category.code,
    title: category.title,
    questions: (category.questions ?? []).map((question) => {
      const summary = answersByQuestion.get(question.id) ?? null
      const detail = summary?.id ? detailByAnswerId.get(summary.id) : null
      return buildQuestionRow(question, summary, detail)
    }),
  }))

  return {
    controlCodes: CONTROL_CODES,
    sections,
  }
}

export const soaReviewControlCodes = CONTROL_CODES
