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
export type UserListRes = ApiResponse<User[]>
export type UserRes = ApiResponse<User>
export type AdminUserMutationRes = ApiResponse<{ user: User }>
export type DeleteUserRes = ApiResponse<{ message: string }>

const userService = {
  listUsers: async (search?: string): Promise<UserListRes> => {
    const res = await api.get(API_ROUTES.USERS.BASE, {
      params: { search: search?.trim() || undefined },
    })
    return res.data
  },

  getById: async (id: string): Promise<UserRes> => {
    const res = await api.get(API_ROUTES.USERS.BY_ID(id))
    return res.data
  },

  setBlocked: async (
    id: string,
    isBlocked: boolean,
  ): Promise<AdminUserMutationRes> => {
    const res = await api.patch(API_ROUTES.USERS.BLOCK(id), { isBlocked })
    return res.data
  },

  deleteById: async (id: string): Promise<DeleteUserRes> => {
    const res = await api.delete(API_ROUTES.USERS.BY_ID(id))
    return res.data
  },

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
