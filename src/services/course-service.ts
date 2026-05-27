import API_ROUTES from "@/conf/constants/api-routes"
import type { ApiResponse } from "@/types/core/api"
import type { Course, CourseBody } from "@/types/db/course"
import api from "@/utils/api"

export type CourseListRes = ApiResponse<{ courses: Course[] }>
export type CourseRes = ApiResponse<{ course: Course }>
export type DeleteCourseRes = ApiResponse<{ message: string }>

const courseService = {
  list: async (): Promise<CourseListRes> => {
    const res = await api.get(API_ROUTES.COURSES.BASE)
    return res.data
  },

  create: async (payload: CourseBody): Promise<CourseRes> => {
    const res = await api.post(API_ROUTES.COURSES.BASE, payload)
    return res.data
  },

  deleteById: async (id: string): Promise<DeleteCourseRes> => {
    const res = await api.delete(API_ROUTES.COURSES.BY_ID(id))
    return res.data
  },
}

export default courseService
