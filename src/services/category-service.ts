import API_ROUTES from "@/conf/constants/api-routes"
import type { ApiResponse } from "@/types/core/api"
import type { Category } from "@/types/db/category"
import api from "@/utils/api"

const categoryService = {
  list: async (): Promise<ApiResponse<{ categories: Category[] }>> => {
    const res = await api.get(API_ROUTES.CATEGORIES.BASE)
    return res.data
  },
}

export default categoryService
