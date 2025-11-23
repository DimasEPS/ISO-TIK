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
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

/**
 * Reusable modal for adding/editing response items (Analisis, Koreksi, Tindakan Koreksi)
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 * @param {Function} onSave - Save handler
 * @param {Object} itemData - Data for edit mode (optional)
 * @param {string} title - Modal title
 * @param {string} description - Modal description
 * @param {string} label - Field label
 * @param {string} placeholder - Field placeholder
 * @param {string} buttonText - Submit button text
 */
export function ResponseItemModal({
  isOpen,
  onClose,
  onSave,
  itemData = null,
  title,
  description,
  label,
  placeholder,
  buttonText = "Simpan",
}) {
  const [value, setValue] = useState(itemData?.deskripsi || "");
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ ...itemData, deskripsi: value });
    }
    // Reset form
    setValue("");
    setHasInteracted(false);
    onClose();
  };

  const handleCancel = () => {
    setValue(itemData?.deskripsi || "");
    setHasInteracted(false);
    onClose();
  };

  const handleFocus = () => {
    if (!hasInteracted && !itemData) {
      setValue("");
      setHasInteracted(true);
    }
  };

  // Update value when itemData changes (for edit mode)
  useEffect(() => {
    if (itemData) {
      setValue(itemData.deskripsi || "");
    }
  }, [itemData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-dark">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="deskripsi" className="text-sm font-medium text-gray-dark">
              {label}
            </Label>
            <Textarea
              id="deskripsi"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={handleFocus}
              className="mt-2 min-h-[100px] resize-none border-gray-300 focus-visible:border-black! focus-visible:border-2! focus-visible:ring-0!"
            />
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
              {buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
