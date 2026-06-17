import API_ROUTES from "@/conf/constants/api-routes"
import api from "@/utils/api"
import type {
  CreateSystemReportPayload,
  SystemReportListRes,
  SystemReportRes,
} from "@/types/db/system-report"

const systemReportService = {
  create: async (
    payload: CreateSystemReportPayload,
  ): Promise<SystemReportRes> => {
    const res = await api.post(API_ROUTES.SYSTEM_REPORTS.BASE, payload)
    return res.data
  },

  listMine: async (): Promise<SystemReportListRes> => {
    const res = await api.get(API_ROUTES.SYSTEM_REPORTS.MINE)
    return res.data
  },

  listAll: async (): Promise<SystemReportListRes> => {
    const res = await api.get(API_ROUTES.SYSTEM_REPORTS.ADMIN)
    return res.data
  },

  getById: async (id: string): Promise<SystemReportRes> => {
    const res = await api.get(API_ROUTES.SYSTEM_REPORTS.BY_ID(id))
    return res.data
  },

  markCompleted: async (id: string): Promise<SystemReportRes> => {
    const res = await api.patch(API_ROUTES.SYSTEM_REPORTS.COMPLETE(id))
    return res.data
  },
}

export default systemReportService
