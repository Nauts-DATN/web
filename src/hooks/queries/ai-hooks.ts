import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import aiService, {
  type GenerateQuizPayload,
  type SubmitQuizAttemptPayload,
} from "@/services/ai-service"
import type { SummaryRes } from "@/types/db/document"
import type {
  GenerateQuizRes,
  QuizListRes,
  SubmitQuizAttemptRes,
} from "@/types/db/quiz"

export const aiKeys = {
  summary: (docId: string) => ["ai", "summary", docId] as const,
  quizzesByDoc: (docId: string) => ["ai", "quizzes", docId] as const,
  quiz: (quizId: string) => ["ai", "quiz", quizId] as const,
  quizzes: () => ["ai", "quizzes"] as const,
}

/** Lấy tóm tắt đã lưu — không gọi AI. */
export const useCachedSummary = (documentId: string | undefined) =>
  useQuery<SummaryRes>({
    queryKey: aiKeys.summary(documentId ?? ""),
    queryFn: () => aiService.getCachedSummary(documentId!),
    enabled: !!documentId,
    retry: false,
  })

/** Gọi AI tóm tắt — lưu kết quả vào DB, tự invalidate summary cache. */
export const useSummarizeDocument = (documentId: string) => {
  const queryClient = useQueryClient()
  return useMutation<SummaryRes, Error>({
    mutationFn: () => aiService.summarize(documentId),
    onSuccess: (data) => {
      queryClient.setQueryData(aiKeys.summary(documentId), data)
      // Invalidate document detail để cập nhật doc.summary
      queryClient.invalidateQueries({ queryKey: ["documents", "detail", documentId] })
    },
  })
}

/** Danh sách quiz của document. */
export const useQuizzesByDocument = (documentId: string | undefined) =>
  useQuery<QuizListRes>({
    queryKey: aiKeys.quizzesByDoc(documentId ?? ""),
    queryFn: () => aiService.listQuizzesByDocument(documentId!),
    enabled: !!documentId,
  })

/** Danh sách tất cả quiz. */
export const useQuizzes = () =>
  useQuery<QuizListRes>({
    queryKey: aiKeys.quizzes(), 
    queryFn: () => aiService.listQuizzes(),
  })

/** Gọi AI tạo quiz — lưu kết quả vào DB, tự invalidate danh sách quiz. */
export const useGenerateQuiz = (documentId: string) => {
  const queryClient = useQueryClient()
  return useMutation<GenerateQuizRes, Error, GenerateQuizPayload>({
    mutationFn: (payload) => aiService.generateQuiz(documentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.quizzesByDoc(documentId) })
    },
  })
}

/** Xóa một quiz. */
export const useSubmitQuizAttempt = (quizId: string) => {
  const queryClient = useQueryClient()
  return useMutation<SubmitQuizAttemptRes, Error, SubmitQuizAttemptPayload>({
    mutationFn: (payload) => aiService.submitQuizAttempt(quizId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.quizzes() })
      queryClient.invalidateQueries({ queryKey: aiKeys.quiz(quizId) })
    },
  })
}

export const useDeleteQuiz = (documentId: string) => {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, string>({
    mutationFn: (quizId) => aiService.deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.quizzes() })
      if (documentId) {
        queryClient.invalidateQueries({ queryKey: aiKeys.quizzesByDoc(documentId) })
      }
    },
  })
}
