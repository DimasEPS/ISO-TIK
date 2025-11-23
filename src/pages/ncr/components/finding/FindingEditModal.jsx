import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const FINDING_CATEGORIES = [
  "Kategori Temuan Audit - Minor",
  "Kategori Temuan Audit - Major",
  "Kategori Temuan Audit - Critical",
];

export function FindingEditModal({ isOpen, onClose, findingData, onSave }) {
  const [formData, setFormData] = useState({
    kategori: "",
  });

  useEffect(() => {
    if (findingData) {
      setFormData({
        kategori: findingData.kategori || "",
      });
    }
  }, [findingData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ ...findingData, ...formData });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy">
            Edit Kategori Temuan
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-dark">
            Ubah detail temuan ketidaksesuaian.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Kategori Temuan */}
            <div className="space-y-2">
              <Label htmlFor="kategori" className="text-sm font-medium text-gray-dark">
                Kategori Temuan
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12 px-4 border-gray-300 hover:border-navy"
                  >
                    <span className={formData.kategori ? "text-gray-900" : "text-gray-400"}>
                      {formData.kategori || "Pilih Kategori Temuan"}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-(--radix-dropdown-menu-trigger-width)">
                  {FINDING_CATEGORIES.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setFormData({ ...formData, kategori: category })}
                      className="cursor-pointer"
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-12 px-6 border-gray-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-12 px-6 bg-navy text-white hover:bg-navy/90"
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
