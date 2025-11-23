// NCR Status Constants (mirrors backend values)
export const NCR_STATUS = {
  ALL: "all",
  DRAFT: "draft",
  IN_PROGRESS: "in_progress",
  REVIEWED: "reviewed",
  APPROVED: "approved",
};

// Case Status Constants (reuse NCR statuses for clarity)
export const CASE_STATUS = {
  DRAFT: "draft",
  IN_PROGRESS: "in_progress",
  REVIEWED: "reviewed",
  APPROVED: "approved",
};

export const NCR_STATUS_LABELS = {
  [NCR_STATUS.DRAFT]: "Draft",
  [NCR_STATUS.IN_PROGRESS]: "In Progress",
  [NCR_STATUS.REVIEWED]: "Reviewed",
  [NCR_STATUS.APPROVED]: "Approved",
};

export const CASE_STATUS_LABELS = {
  [CASE_STATUS.DRAFT]: "Draft",
  [CASE_STATUS.IN_PROGRESS]: "In Progress",
  [CASE_STATUS.REVIEWED]: "Reviewed",
  [CASE_STATUS.APPROVED]: "Approved",
};

// Status Badge Styles
export const STATUS_BADGE_STYLES = {
  [CASE_STATUS.DRAFT]: "bg-gray-100 text-gray-800",
  [CASE_STATUS.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [CASE_STATUS.REVIEWED]: "bg-blue-100 text-blue-800",
  [CASE_STATUS.APPROVED]: "bg-green-100 text-green-800",
  default: "bg-gray-100 text-gray-800",
};

// Pagination Options
export const PAGINATE_OPTIONS = [10, 20, 50, 100];

// Default Values
export const DEFAULT_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;
