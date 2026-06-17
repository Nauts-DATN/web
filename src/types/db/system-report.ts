import type { ApiResponse } from "../core/api"

export type SystemReportStatus = "processing" | "completed"

export type SystemReportReporter = {
  id: string
  name?: string
  email?: string
}

export type SystemReport = {
  id: string
  title: string
  description: string
  status: SystemReportStatus
  reportedBy: string
  reporter?: SystemReportReporter
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateSystemReportPayload = {
  title: string
  description: string
}

export type SystemReportListRes = ApiResponse<{ reports: SystemReport[] }>
export type SystemReportRes = ApiResponse<{ report: SystemReport }>
