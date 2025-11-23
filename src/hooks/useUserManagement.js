import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminUsersService } from "@/services/adminUsersService"

/**
 * Query keys for user management
 */
export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (params) => [...userKeys.lists(), params],
  details: () => [...userKeys.all, "detail"],
  detail: (userId) => [...userKeys.details(), userId],
  statuses: () => [...userKeys.all, "statuses"],
  roles: () => [...userKeys.all, "roles"],
  profile: (userId) => [...userKeys.all, "profile", userId],
  activityLogs: (userId, params) => [...userKeys.all, "activity-logs", userId, params],
}

/**
 * Hook to fetch paginated list of users
 * @param {Object} params - Query parameters
 * @param {number} params.per_page - Items per page
 * @param {number} params.page - Page number
 * @param {string} params.status - Filter by status (active/inactive/all)
 * @param {string} params.search - Search query
 */
export function useUsers(params = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => adminUsersService.listUsers(params),
    keepPreviousData: true,
  })
}

/**
 * Hook to fetch single user detail
 * @param {string} userId - User UUID
 * @param {Object} options - Query options
 */
export function useUserDetail(userId, options = {}) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => adminUsersService.getUserDetail(userId),
    enabled: !!userId && (options.enabled ?? true),
  })
}

/**
 * Hook to fetch user statuses for dropdown
 */
export function useUserStatuses() {
  return useQuery({
    queryKey: userKeys.statuses(),
    queryFn: () => adminUsersService.getUserStatuses(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch user roles for dropdown
 */
export function useUserRoles() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => adminUsersService.getUserRoles(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch user profile (admin viewing another user)
 * @param {string} userId - User UUID
 */
export function useUserProfile(userId) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => adminUsersService.getUserProfile(userId),
    enabled: !!userId,
  })
}

/**
 * Hook to fetch user activity logs
 * @param {string} userId - User UUID
 * @param {Object} params - Query parameters
 */
export function useUserActivityLogs(userId, params = {}) {
  return useQuery({
    queryKey: userKeys.activityLogs(userId, params),
    queryFn: () => adminUsersService.getUserActivityLogs(userId, params),
    enabled: !!userId,
    keepPreviousData: true,
  })
}

/**
 * Hook to create new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData) => adminUsersService.createUser(userData),
    onSuccess: () => {
      // Invalidate user lists to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook to update existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, userData }) => adminUsersService.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      // Invalidate user lists and the specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) })
      queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) })
    },
  })
}

/**
 * Hook to delete user (soft delete via inactive status)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId) => adminUsersService.deleteUser(userId),
    onSuccess: () => {
      // Invalidate user lists to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
