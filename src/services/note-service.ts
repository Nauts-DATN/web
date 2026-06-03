import API_ROUTES from "@/conf/constants/api-routes"
import type { ApiResponse } from "@/types/core/api"
import type { NoteBody, NoteBodyPartial, NoteListRes, NoteRes } from "@/types/db/note"
import api from "@/utils/api"

const noteService = {
  list: async (): Promise<NoteListRes> => {
    const res = await api.get(API_ROUTES.NOTES.BASE)
    return res.data
  },

  listByDocument: async (documentId: string): Promise<NoteListRes> => {
    const res = await api.get(API_ROUTES.NOTES.BY_DOCUMENT(documentId))
    return res.data
  },

  create: async (payload: NoteBody): Promise<NoteRes> => {
    const res = await api.post(API_ROUTES.NOTES.BASE, payload)
    return res.data
  },

  update: async (id: string, payload: NoteBodyPartial): Promise<NoteRes> => {
    const res = await api.put(API_ROUTES.NOTES.BY_ID(id), payload)
    return res.data
  },

  deleteById: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await api.delete(API_ROUTES.NOTES.BY_ID(id))
    return res.data
  },
}

export default noteService
