import API_ROUTES from "@/conf/constants/api-routes"
import type { DocumentListRes, DocumentRes } from "@/types/db/document"
import type { ApiResponse } from "@/types/core/api"
import api from "@/utils/api"

export type UploadDocumentPayload = {
  file: File
  title: string
  description?: string
  category?: string
  course?: string
}

const documentService = {
  list: async (): Promise<DocumentListRes> => {
    const res = await api.get(API_ROUTES.DOCUMENTS.BASE)
    return res.data
  },

  upload: async (payload: UploadDocumentPayload): Promise<DocumentRes> => {
    const form = new FormData()
    form.append("file", payload.file)
    form.append("title", payload.title)
    if (payload.description) form.append("description", payload.description)
    if (payload.category) form.append("category", payload.category)
    if (payload.course) form.append("course", payload.course)

    const res = await api.post(API_ROUTES.DOCUMENTS.BASE, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },

  getById: async (id: string): Promise<DocumentRes> => {
    const res = await api.get(API_ROUTES.DOCUMENTS.BY_ID(id))
    return res.data
  },

  deleteById: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await api.delete(API_ROUTES.DOCUMENTS.BY_ID(id))
    return res.data
  },
}

export default documentService
