import API_ROUTES from "@/conf/constants/api-routes"
import type { ApiResponse } from "@/types/core/api"
import type { User } from "@/types/db/user"
import api from "@/utils/api"

export type UpdateUserNameRes = ApiResponse<{ user: User }>
export type UpdateAvatarRes = ApiResponse<{
  user: User
  objectKey: string
  publicUrl: string
}>
export type UpdatePasswordRes = ApiResponse<{ message: string }>

const userService = {
  updateUserName: async (name: string): Promise<UpdateUserNameRes> => {
    const res = await api.patch(API_ROUTES.USERS.UPDATE_NAME, { name })
    return res.data
  },

  updateAvatar: async (avatar: File): Promise<UpdateAvatarRes> => {
    const form = new FormData()
    form.append("avatar", avatar)
    const res = await api.patch(API_ROUTES.USERS.UPDATE_AVATAR, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  updatePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<UpdatePasswordRes> => {
    const res = await api.patch(API_ROUTES.USERS.UPDATE_PASSWORD, {
      currentPassword,
      newPassword,
    })
    return res.data
  },
}

export default userService
