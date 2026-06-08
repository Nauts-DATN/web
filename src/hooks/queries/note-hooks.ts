import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import noteService from "@/services/note-service"
import type { NoteBody, NoteBodyPartial, NoteListRes, NoteRes } from "@/types/db/note"

export const noteKeys = {
  root: ["notes"] as const,
  list: () => [...noteKeys.root, "list"] as const,
  byDocument: (documentId: string) => [...noteKeys.root, "document", documentId] as const,
}

export const useNotes = () =>
  useQuery<NoteListRes>({
    queryKey: noteKeys.list(),
    queryFn: noteService.list,
  })

export const useNotesByDocument = (documentId: string | undefined) =>
  useQuery<NoteListRes>({
    queryKey: noteKeys.byDocument(documentId ?? ""),
    queryFn: () => noteService.listByDocument(documentId!),
    enabled: !!documentId,
  })

export const useCreateNote = () => {
  const queryClient = useQueryClient()
  return useMutation<NoteRes, Error, NoteBody>({
    mutationFn: noteService.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list() })
      queryClient.invalidateQueries({
        queryKey: noteKeys.byDocument(variables.documentId),
      })
    },
  })
}

export const useUpdateNote = () => {
  const queryClient = useQueryClient()
  return useMutation<
    NoteRes,
    Error,
    { id: string; payload: NoteBodyPartial; documentId?: string }
  >({
    mutationFn: ({ id, payload }) => noteService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list() })
      if (variables.documentId) {
        queryClient.invalidateQueries({
          queryKey: noteKeys.byDocument(variables.documentId),
        })
      }
    },
  })
}

export const useDeleteNote = () => {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, { id: string; documentId?: string }>({
    mutationFn: ({ id }) => noteService.deleteById(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list() })
      if (variables.documentId) {
        queryClient.invalidateQueries({
          queryKey: noteKeys.byDocument(variables.documentId),
        })
      }
    },
  })
}
