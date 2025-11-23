import { apiClient } from "@/lib/api-client";

export const authService = {
  login: async ({ username, password }) => {
    const response = await apiClient("/auth/login", {
      method: "POST",
      data: { username, password },
    });

    return response?.data ?? response;
  },

  logout: async ({ token } = {}) => {
    if (!token) {
      throw new Error("Token is required to logout");
    }

    const response = await apiClient("/auth/logout", {
      method: "POST",
      token,
    });

    return response?.data ?? response;
  },
};
