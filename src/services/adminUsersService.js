import { apiClient } from "@/lib/api-client"

const unwrapPagination = (response) => ({
  data: response?.data ?? [],
  meta: response?.meta ?? {},
  message: response?.message,
})

const unwrapData = (response) => ({
  data: response?.data ?? null,
  message: response?.message,
})

const listUsers = async (params = {}) => {
  const response = await apiClient("/admin/users", {
    params: {
      per_page: params.per_page ?? params.perPage ?? 15,
      page: params.page ?? 1,
      status: params.status === "all" ? undefined : params.status,
      search: params.search || undefined,
    },
  })

  return unwrapPagination(response)
}

/**
 * Service for User Management Admin endpoints
 * Base URL: /admin/users
 */
export const adminUsersService = {
  listUsers,
  // Alias to keep backward compatibility with hooks expecting listAdminUsers
  listAdminUsers: listUsers,

  /**
   * Get user detail by ID
   * @param {string} userId - User UUID
   */
  getUserDetail: async (userId) => {
    const response = await apiClient(`/admin/users/${userId}`)
    return unwrapData(response)
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.first_name - First name
   * @param {string} userData.last_name - Last name
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @param {string} userData.password_confirmation - Password confirmation
   * @param {string} userData.status - Status (active/inactive)
   * @param {string[]} userData.role_ids - Array of role UUIDs
   */
  createUser: async (userData) => {
    const response = await apiClient("/admin/users", {
      method: "POST",
      data: userData,
    })
    return unwrapData(response)
  },

  /**
   * Update existing user
   * @param {string} userId - User UUID
   * @param {Object} userData - User data (same as createUser)
   */
  updateUser: async (userId, userData) => {
    const response = await apiClient(`/admin/users/${userId}`, {
      method: "PUT",
      data: userData,
    })
    return unwrapData(response)
  },

  /**
   * Delete user (soft delete via inactive status)
   * Note: DELETE method not documented, use PUT with status: inactive
   */
  deleteUser: async (userId) => {
    const response = await apiClient(`/admin/users/${userId}`, {
      method: "PUT",
      data: { status: "inactive" },
    })
    return unwrapData(response)
  },

  /**
   * Get user statuses for dropdown
   * Returns: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]
   */
  getUserStatuses: async () => {
    const response = await apiClient("/admin/user-statuses")
    return unwrapData(response)
  },

  /**
   * Get user roles for dropdown
   * Returns: [{ id: 'uuid', name: 'Admin', description: '...' }]
   */
  getUserRoles: async () => {
    const response = await apiClient("/admin/user-roles")
    return unwrapData(response)
  },

  /**
   * Get user profile (admin viewing another user)
   * @param {string} userId - User UUID
   */
  getUserProfile: async (userId) => {
    const response = await apiClient(`/admin/users/${userId}/profile`)
    return unwrapData(response)
  },

  /**
   * Get user activity logs (admin viewing another user)
   * @param {string} userId - User UUID
   * @param {Object} params - Query parameters
   * @param {number} params.per_page - Items per page
   */
  getUserActivityLogs: async (userId, params = {}) => {
    const response = await apiClient(`/admin/users/${userId}/activity-logs`, {
      params: {
        per_page: params.per_page ?? 15,
      },
    })
    return unwrapPagination(response)
  },
}
