import API_ROUTES from "@/conf/constants/api-routes"
import type { ApiResponse } from "@/types/core/api"
import type { Course, CourseBody } from "@/types/db/course"
import api from "@/utils/api"

const courseService = {
  list: async (): Promise<ApiResponse<{ courses: Course[] }>> => {
    const res = await api.get(API_ROUTES.COURSES.BASE)
    return res.data
  },

  create: async (payload: CourseBody): Promise<ApiResponse<{ course: Course }>> => {
    const res = await api.post(API_ROUTES.COURSES.BASE, payload)
    return res.data
  },

  deleteById: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await api.delete(API_ROUTES.COURSES.BY_ID(id))
    return res.data
  },
}

export default courseService
