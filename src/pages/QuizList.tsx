import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckSquare, Clock, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { GoogleGenAI, Type } from "@google/genai"

const MOCK_QUIZZES = [
  {
    id: "1",
    title: "Kiểm tra kiến thức ReactJS",
    subject: "Lập trình Web",
    questions: 15,
    time: 20,
    score: null as number | null,
  },
  {
    id: "2",
    title: "Ôn tập Cấu trúc dữ liệu",
    subject: "Cấu trúc dữ liệu",
    questions: 20,
    time: 30,
    score: 85,
  },
  {
    id: "3",
    title: "Khái niệm cơ bản về AI",
    subject: "Trí tuệ nhân tạo",
    questions: 10,
    time: 15,
    score: null as number | null,
  },
]

export function QuizList() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateAIQuiz = async () => {
    if (!topic.trim()) {
      toast.error("Vui lòng nhập chủ đề!")
      return
    }

    setIsGenerating(true)
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) throw new Error("Missing Gemini API Key")

      const ai = new GoogleGenAI({ apiKey })
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo một bài trắc nghiệm gồm 5 câu hỏi về chủ đề: "${topic}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: "ID duy nhất cho câu hỏi, ví dụ: q1, q2",
                },
                text: { type: Type.STRING, description: "Nội dung câu hỏi" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Danh sách 4 lựa chọn đáp án",
                },
                answer: {
                  type: Type.INTEGER,
                  description:
                    "Vị trí của đáp án đúng trong mảng options (từ 0 đến 3)",
                },
              },
              required: ["id", "text", "options", "answer"],
            },
          },
        },
      })

      const questions = JSON.parse(response.text || "[]")
      if (!questions || questions.length === 0)
        throw new Error("No questions generated")

      toast.success("Tạo quiz thành công!")
      setIsModalOpen(false)
      setTopic("")
      navigate("/quiz/custom", {
        state: {
          quiz: {
            id: "custom",
            title: `Quiz: ${topic}`,
            questions: questions,
          },
        },
      })
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi tạo quiz bằng AI.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Bài luyện tập (Quiz)
          </h1>
          <p className="mt-1 text-muted-foreground">
            Kiểm tra kiến thức của bạn qua các bài trắc nghiệm.
          </p>
        </div>
        <Button
          className="gap-2 bg-violet-600 text-white hover:bg-violet-700"
          onClick={() => setIsModalOpen(true)}
        >
          <Sparkles className="size-4" />
          Tạo Quiz bằng AI
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-violet-600 dark:text-violet-400" />
              Tạo Quiz bằng AI
            </DialogTitle>
            <DialogDescription>
              Nhập chủ đề bạn muốn kiểm tra kiến thức, AI sẽ tự động tạo một
              bài trắc nghiệm gồm 5 câu hỏi cho bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="quiz-topic">Chủ đề</FieldLabel>
              <Input
                id="quiz-topic"
                placeholder="VD: Lịch sử Việt Nam, JavaScript cơ bản..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                autoFocus
              />
            </Field>
            <Button
              className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"
              onClick={handleGenerateAIQuiz}
              isLoading={isGenerating}
            >
              Tạo bài kiểm tra
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_QUIZZES.map((quiz) => (
          <Card key={quiz.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="rounded-xl bg-indigo-500/10 p-3">
                  <CheckSquare className="size-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                {quiz.score !== null ? (
                  <Badge variant="secondary" className="shrink-0">
                    Đã làm: {quiz.score}/100
                  </Badge>
                ) : null}
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                {quiz.title}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">{quiz.subject}</p>

              <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CheckSquare className="size-4" />
                  {quiz.questions} câu
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-4" />
                  {quiz.time} phút
                </span>
              </div>

              <Button
                className="w-full"
                variant={quiz.score !== null ? "outline" : "default"}
                asChild
              >
                <Link to={`/quiz/${quiz.id}`}>
                  {quiz.score !== null ? "Làm lại" : "Bắt đầu làm bài"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
