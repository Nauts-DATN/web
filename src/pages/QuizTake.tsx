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
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"
import { toast } from "sonner"

const MOCK_QUIZ = {
  id: "1",
  title: "Kiểm tra kiến thức ReactJS",
  questions: [
    {
      id: "q1",
      text: "React là gì?",
      options: [
        "Một framework",
        "Một thư viện",
        "Một ngôn ngữ",
        "Một hệ điều hành",
      ],
      answer: 1,
    },
    {
      id: "q2",
      text: "Hook nào dùng để quản lý state?",
      options: ["useEffect", "useContext", "useState", "useReducer"],
      answer: 2,
    },
    {
      id: "q3",
      text: "Virtual DOM là gì?",
      options: [
        "Bản sao của DOM thật",
        "DOM thật",
        "Một loại database",
        "Một loại server",
      ],
      answer: 0,
    },
  ],
}

export function QuizTake() {
  useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const quizData = location.state?.quiz || MOCK_QUIZ

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return
    setAnswers((prev) => ({
      ...prev,
      [quizData.questions[currentQuestion].id]: optionIndex,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    let correct = 0
    quizData.questions.forEach((q: { id: string; answer: number }) => {
      if (answers[q.id] === q.answer) correct++
    })
    setScore(Math.round((correct / quizData.questions.length) * 100))
    setIsSubmitted(true)
    toast.success("Đã nộp bài thành công!")
  }

  if (isSubmitted) {
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
                  setAnswers({})
                  setCurrentQuestion(0)
                }}
              >
                Làm lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = quizData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {quizData.title}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Câu {currentQuestion + 1} / {quizData.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400">
          <Clock className="size-5" />
          14:59
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
          {question.options.map((option: string, index: number) => {
            const isSelected = answers[question.id] === index
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectOption(index)}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                      isSelected ? "border-primary" : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected ? (
                      <div className="size-3 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <span className="text-base">{option}</span>
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
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
          <Button onClick={handleNext}>Câu tiếp theo</Button>
        )}
      </div>
    </div>
  )
}
