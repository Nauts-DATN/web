import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Upload,
  FileText,
  MoreVertical,
  Filter,
  CloudUpload,
  X,
} from "lucide-react"
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
} from "@/hooks/queries/document-hooks"
import { useCategories } from "@/hooks/queries/category-hooks"
import { useCourses } from "@/hooks/queries/course-hooks"
import type { Document as LearningDocument } from "@/types/db/document"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx"]

function isAllowedDocumentFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return ALLOWED_DOCUMENT_EXTENSIONS.some((ext) => name.endsWith(ext))
}

// ─── Upload Dialog ────────────────────────────────────────────────────────────

type UploadDialogProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState("")

  const { data: catData } = useCategories()
  const { data: courseData } = useCourses()
  const uploadMutation = useUploadDocument()

  const categories = catData?.data?.categories ?? []
  const courses = courseData?.data?.courses ?? []

  function reset() {
    setFile(null)
    setTitle("")
    setDescription("")
    setCategoryId("")
    setCourseId("")
    setDragOver(false)
    setFileError("")
  }

  function handleClose() {
    reset()
    onOpenChange(false)
  }

  function handleFile(f: File) {
    if (!isAllowedDocumentFile(f)) {
      setFile(null)
      setFileError("Chỉ hỗ trợ file PDF, DOC hoặc DOCX.")
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    setFileError("")
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) return
    if (!isAllowedDocumentFile(file)) {
      setFileError("Chỉ hỗ trợ file PDF, DOC hoặc DOCX.")
      return
    }

    await uploadMutation.mutateAsync({
      file,
      title: title.trim(),
      description: description.trim() || undefined,
      category: categoryId || undefined,
      course: courseId || undefined,
    })

    handleClose()
  }

  const canSubmit = !!file && !!title.trim() && !uploadMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tải tài liệu lên</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File drop zone */}
          <div
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            {file ? (
              <>
                <FileText className="size-8 text-primary" />
                <div className="w-full">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full p-1 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    setFileError("")
                    if (fileRef.current) fileRef.current.value = ""
                  }}
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              </>
            ) : (
              <>
                <CloudUpload className="size-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Kéo thả hoặc bấm để chọn file</p>
                  <p className="text-xs text-muted-foreground">Tối đa 50 MB</p>
                </div>
              </>
            )}
          </div>
          {fileError && (
            <p className="text-sm text-destructive">{fileError}</p>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-title">
              Tiêu đề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="doc-title"
              placeholder="Nhập tiêu đề tài liệu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-desc">Mô tả</Label>
            <Textarea
              id="doc-desc"
              placeholder="Mô tả ngắn về tài liệu (tuỳ chọn)"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category + Course */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Loại tài liệu</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại tài liệu" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Môn học</Label>
              {courses.length > 0 ? (
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              ) : (
                <div className="flex min-h-10 items-center justify-between gap-2 rounded-md border border-dashed px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    Chưa có môn học nào
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleClose()
                      navigate("/library")
                    }}
                  >
                    Thêm môn học
                  </Button>
                </div>
              )}
            </div>
          </div>

          {uploadMutation.isError && (
            <p className="text-sm text-destructive">
              Tải lên thất bại. Vui lòng thử lại.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Huỷ
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {uploadMutation.isPending ? "Đang tải lên…" : "Tải lên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Documents Page ───────────────────────────────────────────────────────────

export function Documents() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] =
    useState<LearningDocument | null>(null)

  const { data, isLoading, isError } = useDocuments()
  const deleteMutation = useDeleteDocument()
  const { data: catData } = useCategories()
  const { data: courseData } = useCourses()

  const allCategories = catData?.data?.categories ?? []
  const allCourses = courseData?.data?.courses ?? []

  const documents = (data?.data?.documents ?? []).filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()),
  )

  function getCategoryName(id?: string) {
    return allCategories.find((c) => c.id === id)?.name
  }

  function getCourseName(id?: string) {
    return allCourses.find((c) => c.id === id)?.name
  }

  function confirmDeleteDocument() {
    if (!documentToDelete) return
    deleteMutation.mutate(documentToDelete.id, {
      onSuccess: () => setDocumentToDelete(null),
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Quản lý tài liệu
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tải lên và quản lý tài liệu học tập của bạn.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setUploadOpen(true)}>
          <Upload className="size-4" />
          Tải tài liệu lên
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <InputGroup className="flex-1">
          <InputGroupAddon>
            <Search className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Tìm kiếm tài liệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-3">
                <Skeleton className="size-9 rounded-md" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="size-8 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Không thể tải danh sách tài liệu. Vui lòng thử lại.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <FileText className="size-10 opacity-40" />
          <p className="text-sm">
            {search ? "Không tìm thấy tài liệu phù hợp." : "Chưa có tài liệu nào."}
          </p>
          {!search && (
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
              Tải tài liệu đầu tiên
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && documents.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {documents.map((doc) => (
            <Card key={doc.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-3">
                {/* Chỉ vùng nội dung mới mở chi tiết — tránh click Xóa / menu kích hoạt navigate */}
                <div
                  role="link"
                  tabIndex={0}
                  className="flex cursor-pointer items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      navigate(`/documents/${doc.id}`)
                    }
                  }}
                >
                  <div className="contents">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="size-4 text-primary" />
                    </div>
                    <div
                      className="order-last shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground"
                            aria-label="Thao tác tài liệu"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onSelect={() => setDocumentToDelete(doc)}
                          >
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="mt-4 min-w-0 flex-1">
                    <p className="line-clamp-2 text-base font-semibold text-foreground">
                      {doc.title}
                    </p>
                    {doc.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {getCategoryName(doc.category) && (
                        <Badge variant="secondary">
                          {getCategoryName(doc.category)}
                        </Badge>
                      )}
                      {getCourseName(doc.course) && (
                        <Badge variant="outline">{getCourseName(doc.course)}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(doc.fileSize)}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Đã tải lên: {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <Dialog
        open={!!documentToDelete}
        onOpenChange={(open) => {
          if (!open) setDocumentToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa tài liệu?</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {documentToDelete?.title}
            </p>
            <p>
              Xóa tài liệu này đồng nghĩa với tất cả ghi chú và bài tập liên quan
              tài liệu này cũng bị xóa, bạn chắc chứ?
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDocumentToDelete(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={confirmDeleteDocument}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
