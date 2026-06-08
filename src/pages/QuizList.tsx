import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckSquare, PenLine, FileText, Sparkles, AlertCircle } from "lucide-react"
import { useQuizzes } from "@/hooks/queries/ai-hooks"
import type { Quiz } from "@/types/db/quiz"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const navigate = useNavigate()

  const isMc = quiz.questionType === "multiple_choice"

  const handleStart = () => {
    navigate(`/quiz/${quiz.id}`, {
      state: {
        quiz: {
          id: quiz.id,
          title: quiz.documentTitle ? `Quiz: ${quiz.documentTitle}` : "Quiz",
          questionType: quiz.questionType,
          questions: quiz.questions,
        },
      },
    })
  }

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            {isMc ? (
              <CheckSquare className="size-6" />
            ) : (
              <PenLine className="size-6" />
            )}
          </div>
          <Badge variant={isMc ? "secondary" : "outline"} className="shrink-0">
            {isMc ? "Trắc nghiệm" : "Tự luận"}
          </Badge>
        </div>

        {quiz.documentTitle ? (
          <h3 className="mb-1 line-clamp-2 text-base font-semibold text-foreground">
            Tên tài liệu: {quiz.documentTitle}
          </h3>
        ) : (
          <h3 className="mb-1 text-base font-semibold text-muted-foreground italic">
            Tài liệu không rõ
          </h3>
        )}

        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckSquare className="size-3.5" />
            {quiz.questions.length} câu
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText className="size-3.5" />
            {formatDate(quiz.createdAt)}
          </span>
        </div>
        {quiz.latestAttempt && (
          <div className="mt-4 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-foreground">Đã làm</span>
              {quiz.latestAttempt.score !== null ? (
                <Badge variant="secondary">
                  {quiz.latestAttempt.score} điểm
                </Badge>
              ) : (
                <Badge variant="outline">Đã nộp</Badge>
              )}
            </div>
            {quiz.latestAttempt.correctCount !== null && (
              <p className="mt-1 text-muted-foreground">
                Đúng {quiz.latestAttempt.correctCount}/
                {quiz.latestAttempt.totalQuestions} câu
              </p>
            )}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <Button className="w-full" onClick={handleStart}>
            {quiz.latestAttempt ? "Làm lại" : "Bắt đầu làm bài"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function QuizCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="size-12 rounded-xl" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )
}

export function QuizList() {
  const { data: res, isLoading, isError, refetch } = useQuizzes()
  const quizzes = res?.isSuccess ? (res.data?.quizzes ?? []) : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Bài luyện tập (Quiz)
          </h1>
          <p className="mt-1 text-muted-foreground">
            Các bộ câu hỏi AI đã tạo từ tài liệu của bạn.
          </p>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription className="flex items-center gap-3">
            Không tải được danh sách quiz.
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <QuizCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && quizzes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20 text-center">
          <Sparkles className="mb-4 size-10 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            Chưa có quiz nào
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Mở một tài liệu và dùng AI để tạo bộ câu hỏi.
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && quizzes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  )
}
