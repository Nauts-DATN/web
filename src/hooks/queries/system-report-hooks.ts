import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import systemReportService from "@/services/system-report-service"
import type {
  CreateSystemReportPayload,
  SystemReportListRes,
  SystemReportRes,
} from "@/types/db/system-report"

export const systemReportKeys = {
  root: ["system-reports"] as const,
  mine: () => [...systemReportKeys.root, "mine"] as const,
  admin: () => [...systemReportKeys.root, "admin"] as const,
  detail: (id: string) => [...systemReportKeys.root, "detail", id] as const,
}

export const useMySystemReports = () =>
  useQuery<SystemReportListRes>({
    queryKey: systemReportKeys.mine(),
    queryFn: systemReportService.listMine,
  })

export const useAdminSystemReports = () =>
  useQuery<SystemReportListRes>({
    queryKey: systemReportKeys.admin(),
    queryFn: systemReportService.listAll,
  })

export const useSystemReport = (id: string | undefined) =>
  useQuery<SystemReportRes>({
    queryKey: systemReportKeys.detail(id ?? ""),
    queryFn: () => systemReportService.getById(id!),
    enabled: !!id,
  })

export const useCreateSystemReport = () => {
  const queryClient = useQueryClient()
  return useMutation<SystemReportRes, Error, CreateSystemReportPayload>({
    mutationFn: systemReportService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemReportKeys.mine() })
    },
  })
}

export const useCompleteSystemReport = () => {
  const queryClient = useQueryClient()
  return useMutation<SystemReportRes, Error, string>({
    mutationFn: systemReportService.markCompleted,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: systemReportKeys.admin() })
      const id = data.data?.report.id
      if (id) {
        queryClient.invalidateQueries({
          queryKey: systemReportKeys.detail(id),
        })
      }
    },
  })
}
