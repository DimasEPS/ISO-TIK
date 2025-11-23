import { Button } from "@/components/ui/button";
import { Eye, FilePen, Trash2 } from "lucide-react";

export function CaseCard({ kasus, onViewDetail, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg border border-gray-300 p-4 hover:shadow-md transition-shadow">
      <div className="mb-3">
        <p className="text-xs text-gray-dark mb-1">Nomor NCR</p>
        <h3 className="text-lg font-bold text-navy">{kasus.id}</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <p className="text-xs text-gray-dark">Bagian Terkait</p>
          <p className="text-navy">{kasus.bagianTerkait}</p>
        </div>
        <div>
          <p className="text-xs text-gray-dark">Tanggal</p>
          <p className="text-navy">{kasus.tanggal}</p>
        </div>
        <div>
          <p className="text-xs text-gray-dark">Standar Referensi</p>
          <p className="text-navy">{kasus.standarReferensi}</p>
        </div>
        <div>
          <p className="text-xs text-gray-dark">Klasifikasi</p>
          <p className="text-navy">{kasus.klasifikasi}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-dark">Nama Auditor</p>
            <p className="text-navy">{kasus.namaAuditor}</p>
          </div>
          <div>
            <p className="text-xs text-gray-dark">Nama Auditee</p>
            <p className="text-navy">{kasus.namaAuditee}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-dark">Status</p>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                {kasus.status}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-dark">Aksi</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onViewDetail(kasus)}
                className="h-8 w-8 p-0 text-navy hover:text-navy-hover hover:bg-gray-100"
              >
                <Eye className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(kasus)}
                className="h-8 w-8 p-0 text-navy hover:text-navy-hover hover:bg-gray-100"
              >
                <FilePen className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(kasus)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
