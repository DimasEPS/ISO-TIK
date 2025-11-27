import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_STYLES = {
  Draft: "bg-gray-light text-navy-hover border border-gray-medium small",
  "In Progress": "bg-yellow-light text-yellow border border-yellow small",
  Reviewed: "bg-blue-light text-blue border border-blue small",
  Approved: "bg-green-light text-green border border-green small",
};

export function ManualDocumentDetailDialog({
  open,
  onOpenChange,
  data,
  onViewAnswers,
  onFillAnswers,
}) {
  const detail = data ?? {};
  const leadAuditor = detail.leadAuditor ?? [];
  const memberAuditor = detail.memberAuditor ?? [];
  const reviewerAuditor = detail.reviewerAuditor ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl bg-white px-8 py-6 text-navy"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="heading-4-bold">Detail Checklist Manual</DialogTitle>
          <p className="text-sm text-gray-dark">
            Informasi lengkap mengenai dokumen Checklist Manual yang dipilih
          </p>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 md:gap-x-10">
          <div className="space-y-1">
            <p className="text-sm text-gray-dark">Judul</p>
            <p className="body-medium text-navy">{detail.judul}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-dark">Tanggal Dibuat</p>
            <p className="body-medium text-navy">{detail.tanggalDibuat}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-dark">Nama Perusahaan</p>
            <p className="body-medium text-navy">{detail.namaPerusahaan}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-dark">Lokasi</p>
            <p className="body-medium text-navy">{detail.lokasi}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-dark">Ruang Lingkup</p>
            <p className="body-medium text-navy">{detail.ruangLingkup}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-dark">Status</p>
            <span
              className={`inline-flex items-center justify-center rounded px-3 py-1 text-xs font-medium ${
                STATUS_STYLES[detail.status] ??
                "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {detail.status}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-dark">Lead Auditor</p>
          <ul className="list-disc space-y-1 pl-5 text-navy">
            {leadAuditor.length === 0 ? (
              <li className="text-gray-dark">Belum ada Lead Auditor</li>
            ) : (
              leadAuditor.map((person) => <li key={person}>{person}</li>)
            )}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-dark">Member Auditor</p>
          <ul className="list-disc space-y-1 pl-5 text-navy">
            {memberAuditor.length === 0 ? (
              <li className="text-gray-dark">Belum ada Member Auditor</li>
            ) : (
              memberAuditor.map((person) => <li key={person}>{person}</li>)
            )}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-dark">Reviewer</p>
          <ul className="list-disc space-y-1 pl-5 text-navy">
            {reviewerAuditor.length === 0 ? (
              <li className="text-gray-dark">Belum ada Reviewer</li>
            ) : (
              reviewerAuditor.map((person) => <li key={person}>{person}</li>)
            )}
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-6 text-navy border-gray-medium"
            onClick={onViewAnswers}
          >
            Lihat Jawaban
          </Button>
          <Button
            type="button"
            className="h-11 px-6 bg-navy text-white hover:bg-navy-hover"
            onClick={onFillAnswers}
          >
            Isi Jawaban
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" className="hidden" />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
