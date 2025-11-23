import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DetailModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  fields,
  primaryAction,
  secondaryAction,
  layout = "vertical" // "vertical" or "grid"
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy mb-2">
            {title}
          </DialogTitle>
          {subtitle && (
            <DialogDescription className="text-sm text-gray-dark">
              {subtitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className={layout === "grid" ? "grid grid-cols-2 gap-x-8 gap-y-6 py-4" : "space-y-6 py-4"}>
          {fields.map((field, index) => (
            <div key={index}>
              <p className="text-sm text-gray-dark mb-1">{field.label}</p>
              {field.type === "badge" ? (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${field.badgeClassName}`}>
                  {field.value}
                </span>
              ) : (
                <p className={`text-base ${field.className || "text-navy"} ${field.type === "description" ? "leading-relaxed" : ""}`}>
                  {field.value}
                </p>
              )}
            </div>
          ))}
        </div>

        {(primaryAction || secondaryAction) && (
          <DialogFooter className="gap-3 sm:gap-3">
            {secondaryAction && (
              <Button
                type="button"
                variant="outline"
                onClick={secondaryAction.onClick}
                className={secondaryAction.className || "h-12 px-6 border-gray-300"}
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                type="button"
                onClick={primaryAction.onClick}
                className={primaryAction.className || "h-12 px-6 bg-navy text-white hover:bg-navy-hover"}
              >
                {primaryAction.label}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
