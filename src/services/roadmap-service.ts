import API_ROUTES from "@/conf/constants/api-routes"
import api from "@/utils/api"
import type { ApiResponse } from "@/types/core/api"
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

const roadmapService = {
  list: async (): Promise<RoadmapListRes> => {
    const res = await api.get(API_ROUTES.ROADMAPS.BASE)
    return res.data
  },

  create: async (payload: RoadmapBody): Promise<RoadmapRes> => {
    const res = await api.post(API_ROUTES.ROADMAPS.BASE, payload)
    return res.data
  },

  getById: async (id: string): Promise<RoadmapDetailRes> => {
    const res = await api.get(API_ROUTES.ROADMAPS.BY_ID(id))
    return res.data
  },

  update: async (
    id: string,
    payload: RoadmapBodyPartial,
  ): Promise<RoadmapRes> => {
    const res = await api.patch(API_ROUTES.ROADMAPS.BY_ID(id), payload)
    return res.data
  },

  deleteById: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await api.delete(API_ROUTES.ROADMAPS.BY_ID(id))
    return res.data
  },

  addTask: async (
    roadmapId: string,
    payload: RoadmapTaskBody,
  ): Promise<RoadmapTaskMutationRes> => {
    const res = await api.post(API_ROUTES.ROADMAPS.TASKS(roadmapId), payload)
    return res.data
  },

  updateTask: async (
    taskId: string,
    payload: RoadmapTaskBodyPartial,
  ): Promise<RoadmapTaskMutationRes> => {
    const res = await api.patch(API_ROUTES.ROADMAPS.TASK_BY_ID(taskId), payload)
    return res.data
  },

  deleteTask: async (
    taskId: string,
  ): Promise<ApiResponse<{ roadmap: unknown; message: string }>> => {
    const res = await api.delete(API_ROUTES.ROADMAPS.TASK_BY_ID(taskId))
    return res.data
  },

  completeTask: async (
    taskId: string,
    isCompleted: boolean,
  ): Promise<RoadmapTaskMutationRes> => {
    const res = await api.patch(API_ROUTES.ROADMAPS.TASK_COMPLETE(taskId), {
      isCompleted,
    })
    return res.data
  },

  attachDocument: async (
    taskId: string,
    documentId: string | null,
  ): Promise<RoadmapTaskMutationRes> => {
    const res = await api.patch(API_ROUTES.ROADMAPS.TASK_DOCUMENT(taskId), {
      documentId,
    })
    return res.data
  },
}

export default roadmapService
