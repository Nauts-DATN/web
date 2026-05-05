import API_ROUTES from "@/conf/constants/api-routes"
import type { SummaryRes } from "@/types/db/document"
import type { GenerateQuizRes, QuizListRes, QuizRes } from "@/types/db/quiz"
import type { ApiResponse } from "@/types/core/api"
import api from "@/utils/api"

export type GenerateQuizPayload = {
  questionType: "multiple_choice" | "essay"
  count?: number
}

const aiService = {
  /** Lấy bản tóm tắt đã lưu — không gọi AI. */
  getCachedSummary: async (documentId: string): Promise<SummaryRes> => {
    const res = await api.get(API_ROUTES.AI.SUMMARY(documentId))
    return res.data
  },

  /** Gọi AI tóm tắt tài liệu và lưu kết quả vào DB. */
  summarize: async (documentId: string): Promise<SummaryRes> => {
    const res = await api.post(API_ROUTES.AI.SUMMARIZE(documentId))
    return res.data
  },

  /** Gọi AI tạo quiz từ tài liệu và lưu vào DB. */
  generateQuiz: async (
    documentId: string,
    payload: GenerateQuizPayload,
  ): Promise<GenerateQuizRes> => {
    const res = await api.post(API_ROUTES.AI.GENERATE_QUIZ(documentId), payload)
    return res.data
  },

  /** Danh sách quiz đã tạo cho document. */
  listQuizzesByDocument: async (documentId: string): Promise<QuizListRes> => {
    const res = await api.get(API_ROUTES.AI.QUIZZES_BY_DOC(documentId))
    return res.data
  },

  /** Danh sách quiz đã tạo. */
  listQuizzes: async (): Promise<QuizListRes> => {
    const res = await api.get(API_ROUTES.AI.QUIZZES)
    return res.data
  },

  /** Chi tiết một quiz. */
  getQuizById: async (quizId: string): Promise<QuizRes> => {
    const res = await api.get(API_ROUTES.AI.QUIZ_BY_ID(quizId))
    return res.data
  },

  /** Xóa một quiz. */
  deleteQuiz: async (quizId: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(API_ROUTES.AI.QUIZ_BY_ID(quizId))
    return res.data
  },
}

export default aiService
