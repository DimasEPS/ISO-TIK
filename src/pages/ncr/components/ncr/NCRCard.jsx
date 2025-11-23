import { Button } from "@/components/ui/button";
import { Eye, FilePen, Trash2 } from "lucide-react";

export function NCRCard({ ncr, onViewDetail, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-navy mb-2">{ncr.title}</h3>
          <p className="text-sm text-gray-dark mb-3 line-clamp-2">
            {ncr.description}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetail(ncr)}
            className="text-navy hover:text-navy-hover hover:bg-gray-100"
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(ncr)}
            className="text-navy hover:text-navy-hover hover:bg-gray-100"
          >
            <FilePen className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(ncr)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
