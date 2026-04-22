import API_ROUTES from "@/conf/constants/api-routes"
import type { ApiResponse } from "@/types/core/api"
import type { Course } from "@/types/db/course"
import api from "@/utils/api"

const courseService = {
  list: async (): Promise<ApiResponse<{ courses: Course[] }>> => {
    const res = await api.get(API_ROUTES.COURSES.BASE)
    return res.data
  },
}

export default courseService
