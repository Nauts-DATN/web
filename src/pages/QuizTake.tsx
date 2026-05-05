import { useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react"
import { toast } from "sonner"
import type { QuizQuestion } from "@/types/db/quiz"

type QuizState = {
  id: string
  title: string
  questionType?: "multiple_choice" | "essay"
  questions: QuizQuestion[]
}

const MOCK_QUIZ: QuizState = {
  id: "mock",
  title: "Kiểm tra kiến thức ReactJS",
  questionType: "multiple_choice",
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      text: "React là gì?",
      options: ["Một framework", "Một thư viện", "Một ngôn ngữ", "Một hệ điều hành"],
      answer: 1,
    },
    {
      id: "q2",
      type: "multiple_choice",
      text: "Hook nào dùng để quản lý state?",
      options: ["useEffect", "useContext", "useState", "useReducer"],
      answer: 2,
    },
  ],
}

export function QuizTake() {
  useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const quizData: QuizState = location.state?.quiz ?? MOCK_QUIZ

  const isEssay = quizData.questionType === "essay"

  const [currentQuestion, setCurrentQuestion] = useState(0)
  /** multiple_choice: số index đã chọn; essay: không dùng */
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({})
  /** essay: text người dùng gõ */
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({})
  /** essay: id câu đã reveal sample answer */
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set())
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const question = quizData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100

  const handleSelectMc = (optionIndex: number) => {
    if (isSubmitted) return
    setMcAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
  }

  const handleEssayChange = (text: string) => {
    setEssayAnswers((prev) => ({ ...prev, [question.id]: text }))
  }

  const handleReveal = (questionId: string) => {
    setRevealedAnswers((prev) => new Set([...prev, questionId]))
  }

  const handleSubmit = () => {
    if (isEssay) {
      setIsSubmitted(true)
      toast.success("Đã nộp bài! Xem gợi ý trả lời mẫu bên dưới.")
      return
    }

    let correct = 0
    quizData.questions.forEach((q) => {
      if (q.answer !== undefined && mcAnswers[q.id] === q.answer) correct++
    })
    setScore(Math.round((correct / quizData.questions.length) * 100))
    setIsSubmitted(true)
    toast.success("Đã nộp bài thành công!")
  }

  /* ── Kết quả ── */
  if (isSubmitted && !isEssay) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="py-12 text-center">
          <CardContent>
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
              {score}
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              Hoàn thành bài kiểm tra!
            </h2>
            <p className="mb-8 text-muted-foreground">
              Bạn đã trả lời đúng{" "}
              {Math.round((score / 100) * quizData.questions.length)}/
              {quizData.questions.length} câu hỏi.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate("/quiz")}>
                Quay lại danh sách
              </Button>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setMcAnswers({})
                  setCurrentQuestion(0)
                }}
              >
                Làm lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Review từng câu */}
        <div className="space-y-4">
          {quizData.questions.map((q, idx) => {
            const chosen = mcAnswers[q.id]
            const isCorrect = chosen === q.answer
            return (
              <Card key={q.id}>
                <CardContent className="pt-5">
                  <p className="mb-3 font-medium">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="space-y-2">
                    {q.options?.map((opt, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm",
                          i === q.answer &&
                            "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                          i === chosen &&
                            i !== q.answer &&
                            "border-destructive bg-destructive/10 text-destructive",
                        )}
                      >
                        {i === q.answer ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                        ) : i === chosen ? (
                          <XCircle className="size-4 shrink-0 text-destructive" />
                        ) : (
                          <span className="size-4" />
                        )}
                        {opt}
                      </div>
                    ))}
                  </div>
                  {!isCorrect && q.explanation && (
                    <Alert className="mt-3 border-amber-500/20 bg-amber-500/5">
                      <Lightbulb className="size-4 text-amber-500" />
                      <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
                        {q.explanation}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  /* ── Tự luận: chế độ review (đã nộp) ── */
  if (isSubmitted && isEssay) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold">Đã nộp bài!</h2>
          <p className="text-muted-foreground">
            Xem gợi ý trả lời mẫu bên dưới để tự đánh giá.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => navigate("/quiz")}
          >
            Quay lại danh sách
          </Button>
        </Card>

        {quizData.questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {idx + 1}. {q.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="mb-1 font-medium text-muted-foreground">Câu trả lời của bạn:</p>
                <p className="whitespace-pre-wrap">
                  {essayAnswers[q.id]?.trim() || (
                    <span className="italic text-muted-foreground">Bỏ trống</span>
                  )}
                </p>
              </div>
              {q.sampleAnswer && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                  <p className="mb-1 font-medium text-emerald-700 dark:text-emerald-400">
                    Gợi ý trả lời mẫu:
                  </p>
                  <p className="whitespace-pre-wrap text-emerald-800 dark:text-emerald-300">
                    {q.sampleAnswer}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  /* ── Đang làm bài ── */
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {quizData.title}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <span>
              Câu {currentQuestion + 1} / {quizData.questions.length}
            </span>
            <Badge variant="outline" className="text-xs">
              {isEssay ? "Tự luận" : "Trắc nghiệm"}
            </Badge>
          </div>
        </div>
      </div>

      <Progress value={progress} className="mb-8 h-2" />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion + 1}. {question.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Trắc nghiệm */}
          {!isEssay &&
            question.options?.map((option, index) => {
              const isSelected = mcAnswers[question.id] === index
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectMc(index)}
                  className={cn(
                    "w-full rounded-xl border-2 p-4 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                        isSelected
                          ? "border-primary"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {isSelected && (
                        <div className="size-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-base">{option}</span>
                  </div>
                </button>
              )
            })}

          {/* Tự luận */}
          {isEssay && (
            <div className="space-y-2">
              <Textarea
                placeholder="Nhập câu trả lời của bạn…"
                value={essayAnswers[question.id] ?? ""}
                onChange={(e) => handleEssayChange(e.target.value)}
                rows={6}
                className="resize-none"
              />
              {question.sampleAnswer && !revealedAnswers.has(question.id) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => handleReveal(question.id)}
                >
                  <Lightbulb className="size-4" />
                  Xem gợi ý
                </Button>
              )}
              {revealedAnswers.has(question.id) && question.sampleAnswer && (
                <Alert className="border-emerald-500/20 bg-emerald-500/5">
                  <Lightbulb className="size-4 text-emerald-500" />
                  <AlertDescription className="text-sm text-emerald-700 dark:text-emerald-400">
                    {question.sampleAnswer}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
        >
          Câu trước
        </Button>
        {currentQuestion === quizData.questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Nộp bài
          </Button>
        ) : (
          <Button onClick={() => setCurrentQuestion((prev) => prev + 1)}>
            Câu tiếp theo
          </Button>
        )}
      </div>
    </div>
  )
}
