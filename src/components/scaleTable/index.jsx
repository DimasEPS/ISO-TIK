import { Fragment } from "react"
import { Eye, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ScaleTable({ data, search = "", categoryFilter = "Semua Kategori" }) {
  if (!data) return null

  const query = search.trim().toLowerCase()
  const filteredSections = data.sections
    .filter((section) => categoryFilter === "Semua Kategori" || section.code === categoryFilter)
    .map((section) => ({
      ...section,
      questions: section.questions.filter((question) => {
        if (!query) return true
        return (
          question.id.toLowerCase().includes(query) ||
          question.title.toLowerCase().includes(query) ||
          question.description.toLowerCase().includes(query)
        )
      }),
    }))
    .filter((section) => section.questions.length > 0)

  return (
    <section className="rounded-2xl border border-[#D8E2FF] bg-white shadow-sm h-full">
      <div className="overflow-auto h-full">
        <div className="origin-top-left scale-[1.3]">
          <table className="min-w-[1600px] text-[13px] w-full">
            <caption className="sr-only">Ringkasan kendali, status review, dan komentar reviewer.</caption>
            <thead>
              <tr className="bg-[#0E39A0] text-white text-[12px]">
                <th colSpan={3} className="border border-white/20 px-4 py-3 text-left font-semibold">
                  Kendali Keamanan Informasi ISO/IEC 27001:2022
                </th>
                <th colSpan={1} className="border border-white/20 px-4 py-3 text-center font-semibold">
                  Kendali Saat Ini
                </th>
                <th colSpan={4} className="border border-white/20 px-4 py-3 text-center font-semibold">
                  Kendali yang Dipilih &amp; Alasan Pemilihan
                </th>
                <th rowSpan={2} className="border border-white/20 px-4 py-3 text-left font-semibold">
                  Pembenaran (Justifikasi) terhadap Pengecualian
                </th>
                <th rowSpan={2} className="border border-white/20 px-4 py-3 text-left font-semibold">
                  Ringkasan Penerapan / Pelaksanaan
                </th>
                <th rowSpan={2} className="border border-white/20 px-4 py-3 text-left font-semibold">
                  Dokumen Terkait
                </th>
                <th rowSpan={2} className="border border-white/20 px-4 py-3 text-center font-semibold">
                  Status Review
                </th>
                <th rowSpan={2} className="border border-white/20 px-4 py-3 text-left font-semibold">
                  Komentar Reviewer
                </th>
                <th rowSpan={2} className="border border-white/20 px-4 py-3 text-center font-semibold">
                  Aksi Reviewer
                </th>
              </tr>
              <tr className="bg-[#0E39A0] text-white text-[12px]">
                <th className="border border-white/20 px-3 py-2 text-left font-semibold">Aspek</th>
                <th className="border border-white/20 px-3 py-2 text-left font-semibold">Kode</th>
                <th className="border border-white/20 px-3 py-2 text-left font-semibold">Pertanyaan</th>
                <th className="border border-white/20 px-3 py-2 text-center font-semibold">Y/T/S</th>
                {data.controlCodes.map((code) => (
                  <th key={code} className="border border-white/20 px-3 py-2 text-center font-semibold">
                    {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSections.map((section) => (
                <Fragment key={section.code}>
                  <tr className="bg-[#E7F4ED] text-navy">
                    <td colSpan={14} className="border border-[#C7E0D4] px-4 py-2 font-semibold">
                      {section.title}
                    </td>
                  </tr>
                  {section.questions.map((row) => (
                    <tr key={row.id} className="border-b border-[#E3E9FF] align-top text-[12px]">
                      <td className="border border-[#E3E9FF] px-3 py-3 font-semibold text-navy">{section.code}</td>
                      <td className="border border-[#E3E9FF] px-3 py-3 font-semibold text-navy">{row.id}</td>
                      <td className="border border-[#E3E9FF] px-3 py-3 text-[#1C2754]">
                        <p className="font-semibold">{row.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{row.description}</p>
                      </td>
                      <td className="border border-[#E3E9FF] px-3 py-3 text-center font-semibold text-navy">
                        {row.yts}
                      </td>
                      {data.controlCodes.map((code) => (
                        <td key={`${row.id}-${code}`} className="border border-[#E3E9FF] px-2 py-3 text-center">
                          {row.controls[code] ?? "-"}
                        </td>
                      ))}
                      <td className="border border-[#E3E9FF] px-3 py-3 text-[#1C2754]">{row.justification}</td>
                      <td className="border border-[#E3E9FF] px-3 py-3 text-[#1C2754]">
                        {row.summary?.length ? (
                          <ol className="list-decimal space-y-1 pl-4">
                            {row.summary.map((item, index) => (
                              <li key={`${row.id}-summary-${index}`}>{item}</li>
                            ))}
                          </ol>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="border border-[#E3E9FF] px-3 py-3 text-[#1C2754]">
                        {row.documents?.length ? (
                          <ol className="list-decimal space-y-1 pl-4">
                            {row.documents.map((doc, index) => (
                              <li key={`${row.id}-doc-${doc.id ?? index}`}>
                                <span className="font-semibold">{doc.id || doc.code}</span> - {doc.title || "-"}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="border border-[#E3E9FF] px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${row.statusClass}`}
                        >
                          {row.statusLabel}
                        </span>
                      </td>
                      <td className="border border-[#E3E9FF] px-3 py-3 text-[11px] text-gray-600">{row.reviewerComment}</td>
                      <td className="border border-[#E3E9FF] px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 border-blue-300 text-blue-600 hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 border-green-300 text-green-600 hover:bg-green-50">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
