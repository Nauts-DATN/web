import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import courseService, {
  type CourseListRes,
  type CourseRes,
  type DeleteCourseRes,
} from "@/services/course-service"
import type { CourseBody } from "@/types/db/course"

export const courseKeys = {
  root: ["courses"] as const,
  list: () => [...courseKeys.root, "list"] as const,
}

export const useCourses = () =>
  useQuery<CourseListRes>({
    queryKey: courseKeys.list(),
    queryFn: courseService.list,
    staleTime: 5 * 60 * 1000,
  })

export const useCreateCourse = () => {
  const queryClient = useQueryClient()
  return useMutation<CourseRes, Error, CourseBody>({
    mutationFn: courseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.list() })
    },
  })
}

export const useDeleteCourse = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteCourseRes, Error, string>({
    mutationFn: courseService.deleteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.list() })
    },
  })
}
