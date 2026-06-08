import { useMemo, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import {
  BookOpen,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useDocuments } from "@/hooks/queries/document-hooks"
import {
  useCourses,
  useCreateCourse,
  useDeleteCourse,
} from "@/hooks/queries/course-hooks"

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

export function Library() {
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<{
    id: string
    name: string
  } | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const {
    data: coursesRes,
    isLoading: isLoadingCourses,
    isError: isCoursesError,
  } = useCourses()
  const {
    data: docsRes,
    isLoading: isLoadingDocuments,
    isError: isDocumentsError,
  } = useDocuments()
  const createCourse = useCreateCourse()
  const deleteCourse = useDeleteCourse()

  const courses = coursesRes?.isSuccess ? (coursesRes.data?.courses ?? []) : []
  const allDocuments = docsRes?.isSuccess ? (docsRes.data?.documents ?? []) : []
  const isLoading = isLoadingCourses || isLoadingDocuments
  const isError = isCoursesError || isDocumentsError

  const documentsByCourse = useMemo(() => {
    const map = new Map<string, typeof allDocuments>()
    for (const course of courses) map.set(course.id, [])
    for (const doc of allDocuments) {
      if (!doc.course) continue
      const docs = map.get(doc.course)
      if (docs) docs.push(doc)
    }
    for (const docs of map.values()) {
      docs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }
    return map
  }, [allDocuments, courses])

  const resetForm = () => {
    setName("")
    setDescription("")
  }

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Vui lòng nhập tên course")
      return
    }

    try {
      await createCourse.mutateAsync({
        name: trimmedName,
        description: description.trim() || undefined,
      })
      toast.success("Đã thêm course")
      setDialogOpen(false)
      resetForm()
    } catch (e) {
      const msg = isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error ?? e.message
        : "Không thể thêm course"
      toast.error(msg)
    }
  }

  const requestDeleteCourse = (course: { id: string; name: string }) => {
    const documentCount = documentsByCourse.get(course.id)?.length ?? 0
    if (documentCount > 0) {
      toast.error(
        `Không thể xóa vì đang có ${documentCount} tài liệu trong môn này.`,
      )
      return
    }
    setCourseToDelete(course)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return
    try {
      await deleteCourse.mutateAsync(courseToDelete.id)
      toast.success("Đã xóa course")
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    } catch (e) {
      const msg = isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error ?? e.message
        : "Không thể xóa course"
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Thư viện môn học
          </h1>
          <p className="mt-1 text-muted-foreground">
            Sắp xếp tài liệu học tập theo từng môn học/khóa học để truy cập nhanh hơn.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Thêm môn học
        </Button>
      </div>

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Không thể tải thư viện. Vui lòng thử lại.
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex items-center gap-4 p-5">
                <Skeleton className="size-11 rounded-md" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-52" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="size-8 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <BookOpen className="size-10 opacity-40" />
          <p className="text-sm">Chưa có môn học nào.</p>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
            Tạo môn học đầu tiên
          </Button>
        </div>
      )}

      {!isLoading && !isError && courses.length > 0 && (
        <Accordion type="multiple" className="gap-4">
          {courses.map((course) => {
            const documents = documentsByCourse.get(course.id) ?? []
            return (
              <Card
                key={course.id}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <AccordionItem value={course.id} className="border-b-0">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline">
                    <div className="flex min-w-0 flex-1 items-start gap-4 pr-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <FolderOpen className="size-5" />
                      </div>
                      <div className="min-w-0 space-y-1 text-left">
                        <h3 className="truncate text-base font-semibold text-foreground">
                          {course.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">
                            {documents.length} tài liệu
                          </Badge>
                          {course.description && (
                            <span className="truncate">
                              {course.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="mr-4 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={deleteCourse.isPending}
                      onClick={(e) => {
                        e.stopPropagation()
                        requestDeleteCourse(course)
                      }}
                      aria-label="Xóa course"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AccordionTrigger>

                  <AccordionContent className="px-5 pb-5">
                    <div className="space-y-3 border-t pt-4">
                      {documents.length === 0 ? (
                        <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                          Môn học này chưa có tài liệu.
                        </div>
                      ) : (
                        documents.map((doc) => (
                          <div
                            key={doc.id}
                            role="button"
                            tabIndex={0}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background p-3 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                navigate(`/documents/${doc.id}`)
                              }
                            }}
                          >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <FileText className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {doc.title}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {formatBytes(doc.fileSize)}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {doc.description ||
                                  `Đã tải lên: ${formatDate(doc.createdAt)}`}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            )
          })}
        </Accordion>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Thêm môn học</DialogTitle>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="course-name">Tên môn học</Label>
              <Input
                id="course-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tiêu đề cho môn học"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="course-description">Mô tả</Label>
              <Textarea
                id="course-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn cho môn học (tùy chọn)"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createCourse.isPending}>
                {createCourse.isPending ? "Đang thêm..." : "Thêm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setCourseToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa course?</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Bạn chắc chắn muốn xóa course{" "}
              <span className="font-medium text-foreground">
                {courseToDelete?.name}
              </span>
              ?
            </p>
            <p>Thao tác này không thể hoàn tác.</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteCourse.isPending}
              onClick={handleDeleteCourse}
            >
              {deleteCourse.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
