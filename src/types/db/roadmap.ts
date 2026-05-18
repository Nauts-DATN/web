import type { ApiResponse } from "../core/api"

export type RoadmapStatus = "in_progress" | "completed"

export type Roadmap = {
  id: string
  userId: string
  title: string
  description: string
  progress: number
  status: RoadmapStatus
  createdAt: string
  updatedAt: string
}

export type RoadmapTask = {
  id: string
  roadmapId: string
  documentId: string | null
  title: string
  description: string
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type RoadmapDetail = Roadmap & {
  tasks: RoadmapTask[]
}

export type RoadmapBody = {
  title: string
  description?: string
}

export type RoadmapBodyPartial = {
  title?: string
  description?: string
  status?: RoadmapStatus
}

export type RoadmapTaskBody = {
  title: string
  description?: string
  documentId?: string
}

export type RoadmapTaskBodyPartial = {
  title?: string
  description?: string
  documentId?: string | null
  isCompleted?: boolean
}

export type RoadmapRes = ApiResponse<{ roadmap: Roadmap }>
export type RoadmapListRes = ApiResponse<{ roadmaps: Roadmap[] }>
export type RoadmapDetailRes = ApiResponse<{ roadmap: RoadmapDetail }>
export type RoadmapTaskMutationRes = ApiResponse<{
  task: RoadmapTask
  roadmap: Roadmap
}>
