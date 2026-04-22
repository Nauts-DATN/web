import { useMemo, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Sparkles, FileText, Plus, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { GoogleGenAI, Type } from "@google/genai"
import { useDocument } from "@/hooks/queries/document-hooks"
import type { Document } from "@/types/db/document"
import { isAxiosError } from "axios"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Nội dung gửi cho Gemini: chỉ metadata (API không trả full-text file). */
function buildAiContext(doc: Document): string {
  const parts = [
    `Tiêu đề: ${doc.title}`,
    doc.description ? `Mô tả: ${doc.description}` : null,
    `Tên file: ${doc.fileName}`,
    `Loại: ${doc.mimeType}`,
  ].filter(Boolean)
  return parts.join("\n")
}

export function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: apiRes, isLoading, isError, error, refetch } = useDocument(id)

  const doc = apiRes?.isSuccess ? apiRes.data?.document : undefined

  const [summary, setSummary] = useState("")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)

  const aiContext = useMemo(() => (doc ? buildAiContext(doc) : ""), [doc])

  const handleSummarize = async () => {
    if (!doc) return
    setIsSummarizing(true)
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        throw new Error("Missing Gemini API Key")
      }

      const ai = new GoogleGenAI({ apiKey })
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Dựa trên thông tin tài liệu sau (metadata, không có toàn bộ nội dung file), hãy viết đoạn gợi ý ngắn bằng tiếng Việt về chủ đề có thể liên quan và cách học từ tài liệu này. Nếu thiếu mô tả, hãy nói rõ là chỉ có tiêu đề/tên file.\n\n${aiContext}`,
      })

      setSummary(response.text || "Không thể tạo tóm tắt.")
      toast.success("Đã tạo nội dung hỗ trợ!")
    } catch (e) {
      console.error(e)
      toast.error("Lỗi khi gọi AI.")
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleGenerateQuiz = async () => {
    if (!doc) return
    setIsGeneratingQuiz(true)
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) throw new Error("Missing Gemini API Key")

      const ai = new GoogleGenAI({ apiKey })
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Dựa trên thông tin tài liệu sau, tạo 5 câu hỏi trắc nghiệm kiểm tra hiểu biết chung về chủ đề (suy luận từ tiêu đề/mô tả/tên file). Mỗi câu 4 đáp án, 1 đúng.\n\n${aiContext}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: "ID duy nhất, ví dụ q1",
                },
                text: { type: Type.STRING, description: "Nội dung câu hỏi" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "4 lựa chọn",
                },
                answer: {
                  type: Type.INTEGER,
                  description: "Index đáp án đúng 0–3",
                },
              },
              required: ["id", "text", "options", "answer"],
            },
          },
        },
      })

      const questions = JSON.parse(response.text || "[]")
      if (!questions?.length) throw new Error("No questions generated")

      toast.success("Tạo quiz thành công!")
      navigate("/quiz/custom", {
        state: {
          quiz: {
            id: "custom",
            title: `Quiz: ${doc.title}`,
            questions,
          },
        },
      })
    } catch (e) {
      console.error(e)
      toast.error("Lỗi khi tạo quiz bằng AI.")
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  const openFile = () => {
    if (!doc) return
    window.open(doc.presignedUrl || doc.downloadUrl, "_blank", "noopener,noreferrer")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[480px] lg:col-span-2" />
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !apiRes?.isSuccess || !doc) {
    const msg = isAxiosError(error)
      ? (error.response?.data as { error?: string })?.error ??
        error.message
      : "Không tải được tài liệu."
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/documents" className="gap-2">
            <ArrowLeft className="size-4" />
            Quay lại
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span>{String(msg)}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const isPdf = doc.mimeType === "application/pdf"

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/documents" aria-label="Quay lại danh sách">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="min-w-0 flex-1 text-2xl font-semibold tracking-tight text-foreground">
          {doc.title}
        </h1>
        <Button variant="outline" size="sm" className="gap-2" onClick={openFile}>
          <ExternalLink className="size-4" />
          Mở file
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex min-h-[min(70vh,560px)] flex-col lg:col-span-2">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-primary" />
              Xem tài liệu
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {doc.title} {formatBytes(doc.fileSize)} ·{" "}
              {formatDate(doc.updatedAt)}
            </p>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 p-0">
            {isPdf ? (
              <iframe
                title={doc.title}
                src={doc.presignedUrl || doc.downloadUrl}
                className="h-[min(65vh,520px)] w-full rounded-b-xl border-0 bg-muted/30"
              />
            ) : (
              <div className="space-y-4 p-6">
                <p className="text-sm text-muted-foreground">
                  Định dạng{" "}
                  <span className="font-mono text-xs">{doc.mimeType}</span>{" "}
                  không xem trực tiếp trong trình duyệt. Dùng nút &quot;Mở
                  file&quot; để tải hoặc mở bằng ứng dụng ngoài.
                </p>
                {doc.description && (
                  <div className="prose prose-neutral dark:prose-invert max-w-none text-sm">
                    <p className="whitespace-pre-wrap">{doc.description}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="size-5 text-violet-600 dark:text-violet-400" />
                AI Trợ giảng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gợi ý học dựa trên tiêu đề, mô tả và tên file (hệ thống không trích xuất toàn văn PDF qua API).
              </p>
              <Button
                onClick={handleSummarize}
                className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"
                isLoading={isSummarizing}
              >
                <Sparkles className="size-4" />
                Gợi ý / tóm tắt bằng AI
              </Button>

              {summary ? (
                <Alert className="border-violet-500/20 bg-violet-500/5">
                  <AlertTitle>Kết quả</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap">
                    {summary}
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tạo bài tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tạo bài trắc nghiệm gợi ý từ metadata tài liệu (Gemini).
              </p>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleGenerateQuiz}
                isLoading={isGeneratingQuiz}
              >
                <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
                Tạo Quiz tự động
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Ghi chú</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Mở trang ghi chú kèm tham chiếu tài liệu này.
              </p>
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link
                  to="/notes"
                  state={{ fromDocumentId: doc.id, documentTitle: doc.title }}
                >
                  <Plus className="size-4" />
                  Tạo ghi chú
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
