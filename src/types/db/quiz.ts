import type { ApiResponse } from "../core/api"

export type QuizQuestion = {
  id: string
  type: "multiple_choice" | "essay"
  text: string
  /** Chỉ có với multiple_choice — 4 lựa chọn. */
  options?: string[]
  /** Chỉ có với multiple_choice — index đáp án đúng (0–3). */
  answer?: number
  /** Giải thích đáp án (tuỳ chọn). */
  explanation?: string
  /** Chỉ có với essay — gợi ý trả lời mẫu. */
  sampleAnswer?: string
}

export type Quiz = {
  id: string
  documentId: string
  /** Có khi lấy từ GET /quizzes (populate), có thể undefined ở các endpoint khác. */
  documentTitle?: string
  createdBy: string
  questionType: "multiple_choice" | "essay"
  questions: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

/** Trả về từ POST /documents/:id/quiz — có thêm documentTitle */
export type QuizResult = Quiz & { documentTitle: string }

export type QuizListRes = ApiResponse<{ quizzes: Quiz[] }>
export type QuizRes = ApiResponse<{ quiz: Quiz }>
export type GenerateQuizRes = ApiResponse<QuizResult>
