import type { ApiResponse } from "../core/api"

export type Note = {
  id: string
  title: string
  content: string
  documentId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type NoteBody = {
  title: string
  content?: string
  documentId: string
}

export type NoteBodyPartial = {
  title?: string
  content?: string
}

export type NoteRes = ApiResponse<{ note: Note }>
export type NoteListRes = ApiResponse<{ notes: Note[] }>
