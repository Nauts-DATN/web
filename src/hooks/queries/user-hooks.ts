
import { useMutation, useQueryClient } from "@tanstack/react-query"
import userService, {
  type UpdateAvatarRes,
  type UpdatePasswordRes,
  type UpdateUserNameRes,
} from "@/services/user-service"

export const userKeys = {
  root: ["users"] as const,
  me: () => [...userKeys.root, "me"] as const,
}

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
