import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function ConfirmationInput({ 
  label, 
  placeholder, 
  expectedValue, 
  onValidChange 
}) {
  const [value, setValue] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    // Notify parent if value matches expected value
    if (onValidChange) {
      onValidChange(newValue === expectedValue);
    }
  };

  const handleFocus = () => {
    if (!hasInteracted) {
      setValue("");
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm text-gray-dark">
          {label}
        </p>
      )}
      
      <div className="bg-gray-100 rounded-md px-3 py-2 mb-2">
        <p className="text-sm font-medium text-gray-900">
          {expectedValue}
        </p>
      </div>

      <Textarea
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full min-h-10 bg-gray-light border-gray-300 resize-none focus-visible:border-black! focus-visible:border-2! focus-visible:ring-0!"
      />
    </div>
  );
}
