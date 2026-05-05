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
  /** Bản tóm tắt AI đã lưu (null nếu chưa tóm tắt). */
  summary: string | null
  /** Thời điểm tóm tắt lần cuối (null nếu chưa tóm tắt). */
  summarizedAt: string | null
  createdAt: string
  updatedAt: string
}

export type SummaryResult = {
  summary: string
  documentId: string
  documentTitle: string
  summarizedAt: string
}

export type DocumentListRes = ApiResponse<{ documents: Document[] }>
export type DocumentRes = ApiResponse<{ document: Document }>
export type SummaryRes = ApiResponse<SummaryResult>
