import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

/**
 * Reusable card component for displaying lists with actions
 * @param {string} title - Card header title
 * @param {string} bgColor - Background color class (e.g., 'bg-blue-50', 'bg-yellow-50')
 * @param {string} borderColor - Border color class (e.g., 'border-blue-200')
 * @param {React.ReactNode} badge - Optional badge element to display below title
 * @param {Array} items - Array of items to display in the list
 * @param {Function} onDelete - Optional callback for delete action
 * @param {Array} actions - Array of action buttons to display in header
 * @param {boolean} showDelete - Whether to show delete button for each item
 */
export function ListCard({
  title,
  bgColor = "bg-blue-50",
  borderColor = "border-blue-200",
  badge,
  items = [],
  onDelete,
  actions = [],
  showDelete = true,
}) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-navy">
          {title}
        </h3>
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                className={`h-9 px-3 ${action.className || 'bg-blue-600 text-white hover:bg-blue-700'} gap-1.5 text-sm`}
              >
                {action.icon && <action.icon className="h-3.5 w-3.5" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Optional badge */}
      {badge && (
        <div className="mb-3">
          {badge}
        </div>
      )}

      {/* List items in white card */}
      <div className="bg-white border border-gray-300 rounded-lg p-3">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center gap-2"
            >
              <span className="text-gray-900 font-medium text-sm">{index + 1}.</span>
              <p className="flex-1 text-gray-900 text-sm">
                {typeof item === 'string' ? item : item.deskripsi || item.text}
              </p>
              {showDelete && onDelete && (
                <button
                  onClick={() => onDelete(item)}
                  className="text-red-500 hover:text-red-700 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
