
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import userService, {
  type AdminUserMutationRes,
  type DeleteUserRes,
  type UpdateAvatarRes,
  type UpdatePasswordRes,
  type UpdateUserNameRes,
  type UserListRes,
  type UserRes,
} from "@/services/user-service"

export const userKeys = {
  root: ["users"] as const,
  list: (search?: string) => [...userKeys.root, "list", search ?? ""] as const,
  detail: (id: string) => [...userKeys.root, "detail", id] as const,
  me: () => [...userKeys.root, "me"] as const,
}

export const useUsers = (enabled = true, search?: string) =>
  useQuery<UserListRes>({
    queryKey: userKeys.list(search),
    queryFn: () => userService.listUsers(search),
    enabled,
  })

export const useUser = (id: string | undefined) =>
  useQuery<UserRes>({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => userService.getById(id!),
    enabled: !!id,
  })

export const useUpdateUserName = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateUserNameRes, Error, string>({
    mutationFn: userService.updateUserName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() })
    },
  })
}

export const useUpdateUserAvatar = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateAvatarRes, Error, File>({
    mutationFn: userService.updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() })
    },
  })
}

export const useUpdateUserPassword = () =>
  useMutation<
    UpdatePasswordRes,
    Error,
    { currentPassword: string; newPassword: string }
  >({
    mutationFn: ({ currentPassword, newPassword }) =>
      userService.updatePassword(currentPassword, newPassword),
  })

export const useSetUserBlocked = () => {
  const queryClient = useQueryClient()
  return useMutation<
    AdminUserMutationRes,
    Error,
    { id: string; isBlocked: boolean }
  >({
    mutationFn: ({ id, isBlocked }) => userService.setBlocked(id, isBlocked),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.root })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteUserRes, Error, string>({
    mutationFn: userService.deleteById,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.root })
      queryClient.removeQueries({ queryKey: userKeys.detail(id) })
    },
  })
}
