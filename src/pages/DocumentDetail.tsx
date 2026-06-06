import { useEffect, useRef, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Document as PdfDocument, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Plus,
  ExternalLink,
  RefreshCw,
  CheckSquare,
  PenLine,
  Trash2,
  Edit2,
} from "lucide-react"
import { toast } from "sonner"
import API_ROUTES from "@/conf/constants/api-routes"
import api from "@/utils/api"
import { useDocument } from "@/hooks/queries/document-hooks"
import {
  useSummarizeDocument,
  useQuizzesByDocument,
  useGenerateQuiz,
  useDeleteQuiz,
} from "@/hooks/queries/ai-hooks"
import {
  useNotesByDocument,
  useCreateNote,
  useUpdateNote,
  useDeleteNote as useDeleteNoteMutation,
} from "@/hooks/queries/note-hooks"
import type { Note } from "@/types/db/note"
import { isAxiosError } from "axios"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()


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

function PdfPreview({ fileUrl }: { fileUrl: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageWidth, setPageWidth] = useState(800)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updatePageWidth = () => {
      setPageWidth(Math.max(280, Math.min(container.clientWidth - 32, 800)))
    }

    updatePageWidth()

    const resizeObserver = new ResizeObserver(updatePageWidth)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    setNumPages(0)
    setCurrentPage(1)
    setLoadError("")
  }, [fileUrl])

  if (loadError) {
    return (
      <div className="rounded-b-xl border-t bg-muted/30 p-6 text-sm text-destructive">
        Không thể tải PDF. {loadError}
      </div>
    )
  }

  if (!fileUrl) {
    return (
      <div className="rounded-b-xl border-t bg-muted/30 p-6">
        <Skeleton className="h-[480px] w-full" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-[100vh] max-h-[900px] min-h-[520px] w-full overflow-y-auto overflow-x-hidden rounded-b-xl bg-muted/30 p-4"
    >
      {numPages > 0 && (
        <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center justify-center gap-3 rounded-lg border bg-background/95 p-2 shadow-sm backdrop-blur">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {currentPage} / {numPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= numPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(numPages, page + 1))
            }
          >
            Trang sau
          </Button>
        </div>
      )}
      <PdfDocument
        file={fileUrl}
        loading={<Skeleton className="h-[480px] w-full" />}
        error={
          <p className="p-6 text-sm text-destructive">
            Không thể hiển thị PDF.
          </p>
        }
        onLoadError={(error) => {
          setLoadError(error.message || "Khong the hien thi PDF.")
        }}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages)
          setCurrentPage(1)
        }}
      >
        <div className="flex justify-center">
          {numPages > 0 && (
            <Page
              key={`page-${currentPage}`}
              pageNumber={currentPage}
              width={pageWidth}
            />
          )}
        </div>
      </PdfDocument>
    </div>
  )
}
export function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: apiRes, isLoading, isError, error, refetch } = useDocument(id)
  const doc = apiRes?.isSuccess ? apiRes.data?.document : undefined

  const summarizeMutation = useSummarizeDocument(id ?? "")
  const { data: quizzesRes, isLoading: isLoadingQuizzes } = useQuizzesByDocument(id)
  const generateQuizMutation = useGenerateQuiz(id ?? "")
  const deleteQuizMutation = useDeleteQuiz(id ?? "")
  const { data: notesRes, isLoading: isLoadingNotes } = useNotesByDocument(id)
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNoteMutation()

  const [questionType, setQuestionType] = useState<"multiple_choice" | "essay">(
    "multiple_choice",
  )
  const [quizCount, setQuizCount] = useState(5)
  const [noteOpen, setNoteOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")

  const handleSummarize = async () => {
    try {
      await summarizeMutation.mutateAsync()
      toast.success("Tóm tắt tài liệu thành công!")
    } catch (e) {
      const msg = isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error ?? e.message
        : "Lỗi khi tóm tắt tài liệu."
      toast.error(msg)
    }
  }

  const handleGenerateQuiz = async () => {
    try {
      const res = await generateQuizMutation.mutateAsync({
        questionType,
        count: quizCount,
      })
      if (!res.isSuccess || !res.data) return
      const quiz = res.data
      toast.success("Tạo quiz thành công!")
      navigate(`/quiz/${quiz.id}`, {
        state: {
          quiz: {
            id: quiz.id,
            title: `Quiz: ${quiz.documentTitle}`,
            questionType: quiz.questionType,
            questions: quiz.questions,
          },
        },
      })
    } catch (e) {
      const msg = isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error ?? e.message
        : "Lỗi khi tạo quiz."
      toast.error(msg)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuizMutation.mutateAsync(quizId)
      toast.success("Đã xóa quiz.")
    } catch {
      toast.error("Xóa quiz thất bại.")
    }
  }

  const openCreateNote = () => {
    setEditingNote(null)
    setNoteTitle("")
    setNoteContent("")
    setNoteOpen(true)
  }

  const openEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setNoteOpen(true)
  }

  const handleSaveNote = async () => {
    if (!id) return
    if (!noteTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề ghi chú")
      return
    }

    try {
      if (editingNote) {
        await updateNoteMutation.mutateAsync({
          id: editingNote.id,
          payload: {
            title: noteTitle.trim(),
            content: noteContent,
          },
        })
        toast.success("Đã cập nhật ghi chú")
      } else {
        await createNoteMutation.mutateAsync({
          title: noteTitle.trim(),
          content: noteContent,
          documentId: id,
        })
        toast.success("Đã tạo ghi chú")
      }
      setNoteOpen(false)
    } catch (e) {
      const msg = isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error ?? e.message
        : "Lưu ghi chú thất bại."
      toast.error(msg)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId)
      toast.success("Đã xóa ghi chú")
    } catch (e) {
      const msg = isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error ?? e.message
        : "Xóa ghi chú thất bại."
      toast.error(msg)
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
      ? (error.response?.data as { error?: string })?.error ?? error.message
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
  const quizzes = quizzesRes?.isSuccess ? (quizzesRes.data?.quizzes ?? []) : []
  const notes = notesRes?.isSuccess ? (notesRes.data?.notes ?? []) : []

  return (
    <div className="space-y-8">
      {/* Header */}
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
        {/* PDF Viewer */}
        <Card className="flex min-h-[min(70vh,560px)] flex-col lg:col-span-2">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-primary" />
              Xem tài liệu
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {doc.title} · {formatBytes(doc.fileSize)} · {formatDate(doc.updatedAt)}
            </p>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 p-0">
            {isPdf ? (
              <PdfPreview fileUrl={doc.presignedUrl || doc.downloadUrl} />
            ) : (
              <div className="space-y-4 p-6">
                <p className="text-sm text-muted-foreground">
                  Định dạng{" "}
                  <span className="font-mono text-xs">{doc.mimeType}</span>{" "}
                  không xem trực tiếp trong trình duyệt. Dùng nút &quot;Mở
                  file&quot; để tải hoặc mở bằng ứng dụng ngoài.
                </p>
                {doc.description && (
                  <p className="whitespace-pre-wrap text-sm">{doc.description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* ── Tóm tắt AI ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="size-5 text-violet-600 dark:text-violet-400" />
                Tóm tắt AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doc.summary ? (
                <>
                  <Accordion
                    type="single"
                    collapsible
                    className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3"
                  >
                    <AccordionItem value="summary" className="border-0">
                      <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
                        Nội dung tóm tắt
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {doc.summary}
                    </p>
                    {doc.summarizedAt && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Cập nhật: {formatDate(doc.summarizedAt)}
                      </p>
                    )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={handleSummarize}
                    disabled={summarizeMutation.isPending}
                  >
                    <RefreshCw
                      className={`size-4 ${summarizeMutation.isPending ? "animate-spin" : ""}`}
                    />
                    {summarizeMutation.isPending ? "Đang tóm tắt…" : "Tóm tắt lại"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    AI đọc toàn bộ nội dung PDF và tạo bản tóm tắt có cấu trúc.
                  </p>
                  <Button
                    className="w-full gap-2"
                    onClick={handleSummarize}
                    disabled={summarizeMutation.isPending}
                  >
                    <Sparkles className="size-4" />
                    {summarizeMutation.isPending ? "Đang tóm tắt…" : "Tóm tắt bằng AI"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Tạo Quiz ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckSquare className="size-5 text-indigo-600 dark:text-indigo-400" />
                Tạo câu hỏi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel>Loại câu hỏi</FieldLabel>
                <Select
                  value={questionType}
                  onValueChange={(v) =>
                    setQuestionType(v as "multiple_choice" | "essay")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">
                      <span className="flex items-center gap-2">
                        <CheckSquare className="size-4" />
                        Trắc nghiệm
                      </span>
                    </SelectItem>
                    <SelectItem value="essay">
                      <span className="flex items-center gap-2">
                        <PenLine className="size-4" />
                        Tự luận
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Số câu hỏi (1–20)</FieldLabel>
                <Input
                  type="number"
                  min={5}
                  max={20}
                  value={quizCount}
                  onChange={(e) =>
                    setQuizCount(
                      Math.min(20, Math.max(1, Number(e.target.value))),
                    )
                  }
                />
              </Field>

              <Button
                className="w-full gap-2"
                onClick={handleGenerateQuiz}
                disabled={generateQuizMutation.isPending}
              >
                <Sparkles className="size-4" />
                {generateQuizMutation.isPending ? "Đang tạo…" : "Tạo Quiz bằng AI"}
              </Button>
            </CardContent>
          </Card>

          {/* ── Danh sách Quiz đã tạo ── */}
          {(isLoadingQuizzes || quizzes.length > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quiz đã tạo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoadingQuizzes ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                ) : (
                  quizzes.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() =>
                          navigate(`/quiz/${q.id}`, {
                            state: {
                              quiz: {
                                id: q.id,
                                title: `Quiz: ${doc.title}`,
                                questionType: q.questionType,
                                questions: q.questions,
                              },
                            },
                          })
                        }
                      >
                        <p className="truncate text-sm font-medium">
                          {q.questionType === "multiple_choice"
                            ? "Trắc nghiệm"
                            : "Tự luận"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {q.questions.length} câu ·{" "}
                          {formatDate(q.createdAt)}
                        </p>
                      </button>
                      <div className="flex shrink-0 items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {q.questionType === "multiple_choice" ? "TN" : "TL"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteQuiz(q.id)}
                          disabled={deleteQuizMutation.isPending}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Ghi chú ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ghi chú</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2" onClick={openCreateNote}>
                <Plus className="size-4" />
                Thêm ghi chú tại đây
              </Button>

              {isLoadingNotes ? (
                <div className="space-y-2">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có ghi chú nào cho tài liệu này.
                </p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border p-2.5"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-sm font-medium">{note.title}</p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={() => openEditNote(note)}
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deleteNoteMutation.isPending}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {note.content || "Không có nội dung"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Chỉnh sửa ghi chú" : "Tạo ghi chú mới"}
            </DialogTitle>
            <DialogDescription>
              Ghi chú này sẽ gắn trực tiếp với tài liệu hiện tại.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Field>
              <FieldLabel>Tiêu đề</FieldLabel>
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Nhập tiêu đề ghi chú..."
              />
            </Field>

            <Field>
              <FieldLabel>Nội dung</FieldLabel>
              <Textarea
                rows={8}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Nhập nội dung ghi chú..."
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setNoteOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleSaveNote}
                disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
              >
                {editingNote ? "Lưu thay đổi" : "Tạo ghi chú"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
