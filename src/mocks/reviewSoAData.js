import { tableData } from "@/mocks/tableData"

export const reviewControlQuestion = {
  id: "A.5.1",
  title: "Kebijakan untuk keamanan informasi",
  description:
    "Apakah kebijakan keamanan informasi dan kebijakan-kebijakan topik khusus telah ditentukan, disetujui oleh manajemen, diterbitkan, dikomunikasikan kepada dan diketahui oleh personil yang relevan serta para pihak berkepentingan yang relevan, dan ditinjau pada selang waktu terencana serta pada saat terjadi-nya perubahan yang signifikan?",
  justification:
    "Kebijakan keamanan informasi telah diterapkan di seluruh unit kerja dan dikomunikasikan minimal 2 kali dalam setahun. Pengecualian diberikan untuk unit yang sedang melakukan migrasi sistem.",
  summary: [
    "Kebijakan penerapan SMKI telah didokumentasikan dan diterapkan di seluruh unit.",
    "Peninjauan dokumen SMKI dilakukan minimal 1 kali setiap tahun.",
  ],
}

export const reviewControlMatrix = [
  {
    code: "PL",
    label: "Persyaratan Legal",
    description: "Kewajiban hukum dan regulasi yang berlaku untuk unit ini.",
    value: { yes: true, no: false, partial: false },
  },
  {
    code: "KK",
    label: "Kewajiban Kontrak",
    description: "Perjanjian kontras dengan pihak ketiga penyedia layanan.",
    value: { yes: false, no: true, partial: false },
  },
  {
    code: "PK/PB",
    label: "Persyaratan Kerja / Praktek yang Baik",
    description: "Standar prosedur operasional terbaik yang ditetapkan manajemen.",
    value: { yes: false, no: false, partial: true },
  },
  {
    code: "HPR",
    label: "Hasil Penilaian Risiko (Keamanan Informasi)",
    description: "Mitigasi berdasarkan hasil analisis risiko keamanan informasi.",
    value: { yes: true, no: false, partial: false },
  },
]

export const reviewRelatedDocuments = [
  {
    id: "MN-MG-01",
    title: "Manual Keamanan Informasi",
    description: "Kebijakan umum keamanan informasi organisasi",
  },
  {
    id: "MN-MG-02",
    title: "Manual Prosedur Keamanan",
    description: "Rincian prosedur keamanan pada lingkungan produksi",
  },
  {
    id: "MN-MG-03",
    title: "Pedoman Audit Internal",
    description: "Checklist audit tahunan SMKI",
  },
]

export const reviewNavigatorConfig = [
  {
    code: "A.5",
    title: "Information Security Policies",
    label: "Information Security Policies",
    questions: [
      { 
        id: "A.5.1", 
        label: "Kebijakan untuk keamanan informasi", 
        description: "Apakah kebijakan keamanan informasi dan kebijakan-kebijakan topik khusus telah ditentukan, disetujui oleh manajemen, diterbitkan, dikomunikasikan kepada dan diketahui oleh personil yang relevan serta para pihak berkepentingan yang relevan, dan ditinjau pada selang waktu terencana serta pada saat terjadi-nya perubahan yang signifikan?",
        status: "complete" 
      },
      { 
        id: "A.5.2", 
        label: "Informasi tentang keamanan informasi dalam perjanjian dengan pihak lain", 
        description: "Apakah persyaratan keamanan informasi, termasuk kebutuhan untuk menangani aset keamanan informasi, telah diidentifikasi dan disesuaikan untuk setiap hubungan dengan pemangku kepentingan eksternal?",
        status: "in-progress" 
      },
      { 
        id: "A.5.3", 
        label: "Perlakuan informasi keamanan dalam manajemen proyek", 
        description: "Apakah persyaratan keamanan informasi telah ditangani dalam manajemen proyek, terlepas dari jenis proyek?",
        status: "active" 
      },
    ],
  },
  {
    code: "A.6",
    title: "Organization of Information Security",
    label: "Organization of Information Security",
    questions: [
      { 
        id: "A.6.1", 
        label: "Organisasi tanggung jawab keamanan informasi", 
        description: "Apakah tanggung jawab dan kewajiban keamanan informasi telah ditugaskan kepada peran organisasi?",
        status: "pending" 
      }
    ],
  },
  {
    code: "A.7",
    title: "Human Resource Security",
    label: "Human Resource Security",
    questions: [],
  },
  {
    code: "A.8",
    title: "Asset Management",
    label: "Asset Management",
    questions: [],
  },
  {
    code: "A.9",
    title: "Access Control",
    questions: [],
  },
]

export function getReviewMetaByTitle(title) {
  const found = tableData.find((row) => row.judul === title)
  if (!found) return {
    title: tableData[0]?.judul ?? "SOA ISO 27001",
    category: { code: "A.5", name: "Information Security Policies" },
  }

  const categoryMap = {
    Rahasia: { code: "A.5", name: "Information Security Policies" },
    Internal: { code: "A.6", name: "Organization of Information Security" },
    Publik: { code: "A.7", name: "Human Resource Security" },
  }

  return {
    title: found.judul,
    category: categoryMap[found.klasifikasi] ?? { code: "A.5", name: "Information Security Policies" },
    noDoc: found.noDoc,
  }
}
