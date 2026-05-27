import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import categoryService, {
  type CategoryListRes,
  type CategoryRes,
  type DeleteCategoryRes,
} from "@/services/category-service"
import type {
  CategoryBody,
  CategoryBodyPartial,
} from "@/types/db/category"

export const categoryKeys = {
  root: ["categories"] as const,
  list: () => [...categoryKeys.root, "list"] as const,
}

export const useCategories = () =>
  useQuery<CategoryListRes>({
    queryKey: categoryKeys.list(),
    queryFn: categoryService.list,
    staleTime: 5 * 60 * 1000,
  })

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation<CategoryRes, Error, CategoryBody>({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation<
    CategoryRes,
    Error,
    { id: string; payload: CategoryBodyPartial }
  >({
    mutationFn: ({ id, payload }) => categoryService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteCategoryRes, Error, string>({
    mutationFn: categoryService.deleteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
    },
  })
}
