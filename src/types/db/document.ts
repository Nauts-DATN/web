import type { ApiResponse } from "../core/api"

export type Document = {
  id: string
  title: string
  description?: string
  uploadedBy: string
  category?: string
  course?: string
  fileName: string
  fileSize: number
  mimeType: string
  downloadUrl: string
  presignedUrl: string
  presignedExpiresIn: number
  createdAt: string
  updatedAt: string
}

export type DocumentListRes = ApiResponse<{ documents: Document[] }>
export type DocumentRes = ApiResponse<{ document: Document }>
