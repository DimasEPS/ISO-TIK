import { useEffect, useRef, useState } from "react"
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
  const triggerRef = useRef(null)
  const [menuWidth, setMenuWidth] = useState()

  useEffect(() => {
    const updateWidth = () => {
      if (!triggerRef.current) return
      setMenuWidth(triggerRef.current.offsetWidth)
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const selectedOption = options.find((option) => option.value === value)
  return (
    <div className={className}>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-state px-4 text-sm font-medium text-navy ${classNameButton} ${
              isMenuOpen ? "border-navy shadow" : "bg-state text-navy"
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              {showFunnelIcon && <Funnel className="size-4" />}
              <span className="truncat">
                {selectedOption?.label && value !== "Semua Kategori"
                  ? `${selectedOption.label}`
                  : value}
              </span>
            </span>
            <ChevronDown
              className={`size-4 ${
                isMenuOpen ? "rotate-180" : ""
              } transition-transform duration-200 ease-in-out`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={`${classNameDropdown}`}
          style={menuWidth ? { width: menuWidth } : undefined}
          side="bottom"
          align="start"
        >
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="body text-navy bg-gray-light focus:bg-gray-dark2 w-full"
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
