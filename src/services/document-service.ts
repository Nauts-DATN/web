import API_ROUTES from "@/conf/constants/api-routes"
import type { DocumentListRes, DocumentRes, SetVisibilityRes } from "@/types/db/document"
import type { ApiResponse } from "@/types/core/api"
import api from "@/utils/api"

export type UploadDocumentPayload = {
  file: File
  title: string
  description?: string
  category?: string
  course?: string
  isPublic?: boolean
}

export type DocumentListFilters = {
  search?: string
  category?: string
  course?: string
}

function toParams(filters?: DocumentListFilters) {
  return {
    search: filters?.search?.trim() || undefined,
    category: filters?.category?.trim() || undefined,
    course: filters?.course?.trim() || undefined,
  }
}

const documentService = {
  list: async (filters?: DocumentListFilters): Promise<DocumentListRes> => {
    const res = await api.get(API_ROUTES.DOCUMENTS.BASE, {
      params: toParams(filters),
    })
    return res.data
  },

  listCommunity: async (filters?: DocumentListFilters): Promise<DocumentListRes> => {
    const res = await api.get(API_ROUTES.DOCUMENTS.COMMUNITY, {
      params: toParams(filters),
    })
    return res.data
  },

  upload: async (payload: UploadDocumentPayload): Promise<DocumentRes> => {
    const form = new FormData()
    form.append("file", payload.file)
    form.append("title", payload.title)
    if (payload.description) form.append("description", payload.description)
    if (payload.category) form.append("category", payload.category)
    if (payload.course) form.append("course", payload.course)
    if (payload.isPublic !== undefined) {
      form.append("isPublic", String(payload.isPublic))
    }

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

  setVisibility: async (id: string, isPublic: boolean): Promise<SetVisibilityRes> => {
    const res = await api.patch(API_ROUTES.DOCUMENTS.VISIBILITY(id), { isPublic })
    return res.data
  },
}

export default documentService
