import { useQuery } from "@tanstack/react-query"
import categoryService from "@/services/category-service"
import type { ApiResponse } from "@/types/core/api"
import type { Category } from "@/types/db/category"

export const categoryKeys = {
  root: ["categories"] as const,
  list: () => [...categoryKeys.root, "list"] as const,
}

export const useCategories = () =>
  useQuery<ApiResponse<{ categories: Category[] }>>({
    queryKey: categoryKeys.list(),
    queryFn: categoryService.list,
    staleTime: 5 * 60 * 1000, // 5 phút
  })
