import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Funnel } from "lucide-react";

export function StatusDropdown({
  isMenuOpen,
  setIsMenuOpen,
  value,
  onChange,
  options = [],
  className = "",
  classNameButton = "",
  classNameDropdown = "",
  showFunnelIcon = true,
}) {
  const triggerRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value)
  return (
    <div className={className}>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div ref={triggerRef} className="w-full">
            <Button
              variant="outline"
              className={`flex h-12 w-full cursor-pointer items-center justify-between gap-2 bg-state px-4 text-sm font-medium text-navy ${classNameButton} ${
                isMenuOpen ? "border-navy shadow" : "bg-state text-navy"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                {showFunnelIcon && <Funnel className="size-4" />}
                <span className="truncate">
                  {selectedOption?.label && value !== "Semua Kategori"
                    ? `${selectedOption.value} - ${selectedOption.label}`
                    : value}
                </span>
              </span>
              <ChevronDown
                className={`size-4 ${
                  isMenuOpen ? "rotate-180" : ""
                } transition-transform duration-200 ease-in-out`}
              />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={`${classNameDropdown}`}
          side="bottom"
          align="start"
          style={{
            width: triggerRef.current?.offsetWidth || undefined,
          }}
        >
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="body text-navy bg-gray-light focus:bg-gray-dark2"
              >
                {option.label && option.value !== "Semua Kategori"
                  ? `${option.label}`
                  : option.value}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
