// NCR Status Constants
export const NCR_STATUS = {
  DRAFT: "Draft",
  IN_PROGRESS: "In Progress",
  REVIEWED: "Reviewed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Case Status Constants
export const CASE_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Status Badge Styles
export const STATUS_BADGE_STYLES = {
  [CASE_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [CASE_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [CASE_STATUS.REJECTED]: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

// Pagination Options
export const PAGINATE_OPTIONS = [10, 20, 50, 100];

// Default Values
export const DEFAULT_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;
