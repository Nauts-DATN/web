import API_ROUTES from "@/conf/constants/api-routes"
import type { ApiResponse } from "@/types/core/api"
import type {
  Category,
  CategoryBody,
  CategoryBodyPartial,
} from "@/types/db/category"
import api from "@/utils/api"

export type CategoryListRes = ApiResponse<{ categories: Category[] }>
export type CategoryRes = ApiResponse<{ category: Category }>
export type DeleteCategoryRes = ApiResponse<{ message: string }>

const categoryService = {
  list: async (): Promise<CategoryListRes> => {
    const res = await api.get(API_ROUTES.CATEGORIES.BASE)
    return res.data
  },

  create: async (payload: CategoryBody): Promise<CategoryRes> => {
    const res = await api.post(API_ROUTES.CATEGORIES.BASE, payload)
    return res.data
  },

  update: async (
    id: string,
    payload: CategoryBodyPartial,
  ): Promise<CategoryRes> => {
    const res = await api.patch(API_ROUTES.CATEGORIES.BY_ID(id), payload)
    return res.data
  },

  deleteById: async (id: string): Promise<DeleteCategoryRes> => {
    const res = await api.delete(API_ROUTES.CATEGORIES.BY_ID(id))
    return res.data
  },
}

export default categoryService
