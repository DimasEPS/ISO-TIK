import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function SearchBar({
  placeholder = "Cari dokumen berdasarkan nama",
  value,
  onChange,
  className = "",
  inputGroupClassName = "h-14",
  inputClassName = "bg-state text-navy placeholder:text-gray-dark",
  icon,
  inputProps = {},
}) {
  const { className: inputExtraClass = "", ...restInputProps } = inputProps;

  return (
    <InputGroup className={`${inputGroupClassName} ${className}`.trim()}>
      <InputGroupInput
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${inputClassName} ${inputExtraClass}`.trim()}
        {...restInputProps}
      />
      <InputGroupAddon>
        {icon ?? <SearchIcon className="text-navy" />}
      </InputGroupAddon>
    </InputGroup>
  );
}
