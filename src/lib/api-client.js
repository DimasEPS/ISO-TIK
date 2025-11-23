const DEFAULT_API_URL = "http://localhost:8082";
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL}/api/v1`;

const buildUrl = (path = "") => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const resolveTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

const isFormData = (value) =>
  typeof FormData !== "undefined" && value instanceof FormData;

const buildRequestUrl = (path, params) => {
  if (!params || typeof params !== "object") {
    return buildUrl(path);
  }

  const url = new URL(buildUrl(path));
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          url.searchParams.append(key, item);
        }
      });
      return;
    }

    url.searchParams.append(key, value);
  });

  return url.toString();
};

/**
 * Lightweight fetch wrapper for backend API calls.
 */
export const apiClient = async (path, options = {}) => {
  const {
    method = "GET",
    data,
    params,
    headers = {},
    token,
    includeTimezone = true,
    timezone,
    ...rest
  } = options;

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  const effectiveTimezone = timezone || resolveTimezone();
  if (includeTimezone && effectiveTimezone) {
    finalHeaders["X-Timezone"] = effectiveTimezone;
  } else if (timezone) {
    finalHeaders["X-Timezone"] = timezone;
  }

  const config = {
    method,
    headers: finalHeaders,
    ...rest,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data !== undefined && data !== null) {
    if (isFormData(data)) {
      config.body = data;
      // Browser will set appropriate Content-Type with boundary for FormData
    } else {
      config.body = JSON.stringify(data);
      config.headers["Content-Type"] = "application/json";
    }
  }

  const requestUrl = buildRequestUrl(path, params);
  const response = await fetch(requestUrl, config);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Permintaan gagal";
    const error = new Error(message);
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
};

export const getApiBaseUrl = () => API_BASE_URL;
