import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import documentService, { type UploadDocumentPayload } from "@/services/document-service"
import type { DocumentListRes, DocumentRes } from "@/types/db/document"

export const documentKeys = {
  root: ["documents"] as const,
  list: () => [...documentKeys.root, "list"] as const,
  detail: (id: string) => [...documentKeys.root, "detail", id] as const,
}

export const useDocuments = () =>
  useQuery<DocumentListRes>({
    queryKey: documentKeys.list(),
    queryFn: documentService.list,
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
      queryClient.invalidateQueries({ queryKey: documentKeys.list() })
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, string>({
    mutationFn: documentService.deleteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list() })
    },
  })
}
