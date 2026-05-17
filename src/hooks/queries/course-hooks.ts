import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import courseService from "@/services/course-service"
import type { ApiResponse } from "@/types/core/api"
import type { Course, CourseBody } from "@/types/db/course"

export const courseKeys = {
  root: ["courses"] as const,
  list: () => [...courseKeys.root, "list"] as const,
}

export const useCourses = () =>
  useQuery<ApiResponse<{ courses: Course[] }>>({
    queryKey: courseKeys.list(),
    queryFn: courseService.list,
    staleTime: 5 * 60 * 1000,
  })

export const useCreateCourse = () => {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<{ course: Course }>, Error, CourseBody>({
    mutationFn: courseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.list() })
    },
  })
}

export const useDeleteCourse = () => {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<{ message: string }>, Error, string>({
    mutationFn: courseService.deleteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.list() })
    },
  })
}
