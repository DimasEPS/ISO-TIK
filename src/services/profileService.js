import { apiClient } from "@/lib/api-client";

const unwrapData = (response) => response?.data ?? response;

export const profileService = {
  getProfile: async ({ token, timezone } = {}) => {
    const response = await apiClient("/profile", {
      token,
      timezone,
    });
    return unwrapData(response);
  },

  updateProfile: async ({ token, data, timezone } = {}) => {
    const response = await apiClient("/profile", {
      method: "PUT",
      token,
      data,
      timezone,
    });
    return unwrapData(response);
  },

  getActivityLogs: async ({ token, timezone, page, perPage } = {}) => {
    const response = await apiClient("/profile/activity-logs", {
      token,
      timezone,
      params: {
        page,
        per_page: perPage,
      },
    });

    return {
      data: response?.data ?? [],
      meta: response?.meta ?? {},
      message: response?.message,
    };
  },

  updateAccount: async ({ token, data, timezone } = {}) => {
    const response = await apiClient("/users/me/account", {
      method: "PUT",
      token,
      data,
      timezone,
    });
    return unwrapData(response);
  },

  updatePassword: async ({ token, data, timezone } = {}) => {
    const response = await apiClient("/users/me/password", {
      method: "PUT",
      token,
      data,
      timezone,
    });
    return unwrapData(response);
  },
};
