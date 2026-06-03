import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import roadmapService from "@/services/roadmap-service"
import type {
  RoadmapBody,
  RoadmapBodyPartial,
  RoadmapDetailRes,
  RoadmapListRes,
  RoadmapRes,
  RoadmapTaskBody,
  RoadmapTaskBodyPartial,
  RoadmapTaskMutationRes,
} from "@/types/db/roadmap"

export const roadmapKeys = {
  root: ["roadmaps"] as const,
  list: () => [...roadmapKeys.root, "list"] as const,
  detail: (id: string) => [...roadmapKeys.root, "detail", id] as const,
}

export const useRoadmaps = () =>
  useQuery<RoadmapListRes>({
    queryKey: roadmapKeys.list(),
    queryFn: roadmapService.list,
  })

export const useRoadmap = (id: string | undefined) =>
  useQuery<RoadmapDetailRes>({
    queryKey: roadmapKeys.detail(id ?? ""),
    queryFn: () => roadmapService.getById(id!),
    enabled: !!id?.trim(),
  })

export const useCreateRoadmap = () => {
  const queryClient = useQueryClient()
  return useMutation<RoadmapRes, Error, RoadmapBody>({
    mutationFn: roadmapService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.list() })
    },
  })
}

export const useUpdateRoadmap = () => {
  const queryClient = useQueryClient()
  return useMutation<RoadmapRes, Error, { id: string; payload: RoadmapBodyPartial }>({
    mutationFn: ({ id, payload }) => roadmapService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.list() })
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(variables.id) })
    },
  })
}

export const useDeleteRoadmap = () => {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, string>({
    mutationFn: roadmapService.deleteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.list() })
    },
  })
}

export const useAddRoadmapTask = (roadmapId: string) => {
  const queryClient = useQueryClient()
  return useMutation<RoadmapTaskMutationRes, Error, RoadmapTaskBody>({
    mutationFn: (payload) => roadmapService.addTask(roadmapId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.list() })
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(roadmapId) })
    },
  })
}

export const useUpdateRoadmapTask = (roadmapId: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    RoadmapTaskMutationRes,
    Error,
    { taskId: string; payload: RoadmapTaskBodyPartial }
  >({
    mutationFn: ({ taskId, payload }) => roadmapService.updateTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.list() })
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(roadmapId) })
    },
  })
}

export const useDeleteRoadmapTask = (roadmapId: string) => {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, string>({
    mutationFn: roadmapService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.list() })
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(roadmapId) })
    },
  })
}

export const useCompleteRoadmapTask = (roadmapId: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    RoadmapTaskMutationRes,
    Error,
    { taskId: string; isCompleted: boolean }
  >({
    mutationFn: ({ taskId, isCompleted }) =>
      roadmapService.completeTask(taskId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.list() })
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(roadmapId) })
    },
  })
}
