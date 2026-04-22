import { useQuery } from "@tanstack/react-query"
import courseService from "@/services/course-service"
import type { ApiResponse } from "@/types/core/api"
import type { Course } from "@/types/db/course"

export const courseKeys = {
  root: ["courses"] as const,
  list: () => [...courseKeys.root, "list"] as const,
}

export const useCourses = () =>
  useQuery<ApiResponse<{ courses: Course[] }>>({
    queryKey: courseKeys.list(),
    queryFn: courseService.list,
    staleTime: 5 * 60 * 1000, // 5 phút
  })
