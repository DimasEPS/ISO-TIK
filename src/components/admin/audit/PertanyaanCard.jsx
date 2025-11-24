import { FilePen, Trash2 } from "lucide-react";

export function PertanyaanCard({ pertanyaan, onEdit, onDelete }) {
  return (
    <div className="border-l-4 border-navy bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <p className="text-navy text-base leading-relaxed">
            {pertanyaan.text}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(pertanyaan)}
            className="hover:bg-blue-50 p-2 rounded transition-colors"
            title="Edit pertanyaan"
          >
            <FilePen className="text-[#2B7FFF] w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(pertanyaan)}
            className="hover:bg-red-50 p-2 rounded transition-colors"
            title="Hapus pertanyaan"
          >
            <Trash2 className="text-[#FB2C36] w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
