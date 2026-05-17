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
  communities: () => [...documentKeys.root, "community"] as const,
  community: (filters?: DocumentListFilters) =>
    [...documentKeys.communities(), filters ?? {}] as const,
  detail: (id: string) => [...documentKeys.root, "detail", id] as const,
}

function normalizeFilters(
  filtersOrSearch?: DocumentListFilters | string,
): DocumentListFilters | undefined {
  return typeof filtersOrSearch === "string"
    ? { search: filtersOrSearch }
    : filtersOrSearch
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

export const useCommunityDocuments = (
  filtersOrSearch?: DocumentListFilters | string,
) => {
  const filters = normalizeFilters(filtersOrSearch)
  return useQuery<DocumentListRes>({
    queryKey: documentKeys.community(filters),
    queryFn: () => documentService.listCommunity(filters),
  })
}

export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  return useMutation<DocumentRes, Error, UploadDocumentPayload>({
    mutationFn: documentService.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: documentKeys.communities() })
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, string>({
    mutationFn: documentService.deleteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: documentKeys.communities() })
    },
  })
}

export const useSetDocumentVisibility = () => {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, { id: string; isPublic: boolean }>({
    mutationFn: ({ id, isPublic }) => documentService.setVisibility(id, isPublic),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: documentKeys.communities() })
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: documentKeys.root })
    },
  })
}
