import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import documentService, {
  type DocumentListFilters,
  type UploadDocumentPayload,
} from "@/services/document-service"
import type { DocumentListRes, DocumentRes } from "@/types/db/document"

export const documentKeys = {
  root: ["documents"] as const,
  lists: () => [...documentKeys.root, "list"] as const,
  list: (filters?: DocumentListFilters) =>
    [...documentKeys.lists(), filters ?? {}] as const,
  detail: (id: string) => [...documentKeys.root, "detail", id] as const,
}

export const useDocuments = (filters?: DocumentListFilters) =>
  useQuery<DocumentListRes>({
    queryKey: documentKeys.list(filters),
    queryFn: () => documentService.list(filters),
  })

export const useDocument = (id: string | undefined) =>
  useQuery<DocumentRes>({
    queryKey: documentKeys.detail(id ?? ""),
    queryFn: () => documentService.getById(id!),
    enabled: !!id?.trim(),
  })

export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  return useMutation<DocumentRes, Error, UploadDocumentPayload>({
    mutationFn: documentService.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, string>({
    mutationFn: documentService.deleteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
    },
  })
}
