import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/admin/table/SearchBar";
import { ChecklistCard } from "@/components/admin/audit/ChecklistCard";

const CLAUSES = [
  {
    id: "KLS-01",
    title: "Klausul 4. Konteks Organisasi",
    description: "Menetapkan ruang lingkup, kebutuhan pihak berkepentingan, dan sistem manajemen keamanan informasi.",
    badge: "Klausul 4",
    meta: "Terakhir diperbarui 10 Feb 2025",
  },
  {
    id: "KLS-02",
    title: "Klausul 5. Kepemimpinan",
    description: "Peran manajemen puncak dalam memastikan dukungan terhadap kebijakan manual.",
    badge: "Klausul 5",
    meta: "Terakhir diperbarui 05 Feb 2025",
  },
  {
    id: "KLS-03",
    title: "Klausul 6. Perencanaan",
    description: "Langkah mitigasi risiko serta peluang peningkatan kontrol.",
    badge: "Klausul 6",
    meta: "Terakhir diperbarui 29 Jan 2025",
  },
  {
    id: "KLS-04",
    title: "Klausul 7. Dukungan",
    description: "Sumber daya, kompetensi, dan komunikasi terkait dokumentasi manual.",
    badge: "Klausul 7",
    meta: "Terakhir diperbarui 20 Jan 2025",
  },
];

export default function KlausaManual() {
  const [search, setSearch] = useState("");

  const filteredClauses = useMemo(() => {
    return CLAUSES.filter((clause) =>
      clause.title.toLowerCase().includes(search.toLowerCase()) ||
      clause.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          placeholder="Cari klausa manual..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          inputGroupClassName="h-14 lg:w-[420px]"
        />
        <Button className="h-12 px-6 self-start lg:self-auto">Tambah Klausa</Button>
      </div>

      <div className="space-y-4">
        {filteredClauses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            Tidak ada klausa yang sesuai.
          </div>
        ) : (
          filteredClauses.map((clause) => (
            <ChecklistCard
              key={clause.id}
              checklist={clause}
              badge={clause.badge}
              title={clause.title}
              description={clause.description}
              meta={clause.meta}
            />
          ))
        )}
      </div>
    </section>
  );
}
