import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { isAxiosError } from "axios"
import {
  ArrowLeft,
  BookOpenCheck,
  ExternalLink,
  FileText,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useDocuments } from "@/hooks/queries/document-hooks"
import {
  useAddRoadmapTask,
  useCompleteRoadmapTask,
  useDeleteRoadmapTask,
  useRoadmap,
  useUpdateRoadmapTask,
} from "@/hooks/queries/roadmap-hooks"
import type { RoadmapTask } from "@/types/db/roadmap"

const NO_DOCUMENT = "__no_document__"

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? error.message
  }
  return fallback
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function RoadmapDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<RoadmapTask | null>(null)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskDocumentId, setTaskDocumentId] = useState(NO_DOCUMENT)

  const { data, isLoading, isError } = useRoadmap(id)
  const { data: documentsData } = useDocuments()
  const addTask = useAddRoadmapTask(id ?? "")
  const updateTask = useUpdateRoadmapTask(id ?? "")
  const completeTask = useCompleteRoadmapTask(id ?? "")
  const deleteTask = useDeleteRoadmapTask(id ?? "")

  const roadmap = data?.isSuccess ? data.data?.roadmap : undefined
  const documents = documentsData?.isSuccess
    ? (documentsData.data?.documents ?? [])
    : []

  const documentsById = useMemo(() => {
    return new Map(documents.map((document) => [document.id, document]))
  }, [documents])

  const completedCount = roadmap?.tasks.filter((task) => task.isCompleted).length ?? 0
  const totalTasks = roadmap?.tasks.length ?? 0

  const resetTaskForm = () => {
    setTaskTitle("")
    setTaskDescription("")
    setTaskDocumentId(NO_DOCUMENT)
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    const trimmedTitle = taskTitle.trim()
    if (!trimmedTitle) {
      toast.error("Vui lòng nhập tiêu đề task")
      return
    }

    try {
      await addTask.mutateAsync({
        title: trimmedTitle,
        description: taskDescription.trim() || undefined,
        documentId:
          taskDocumentId === NO_DOCUMENT ? undefined : taskDocumentId,
      })
      toast.success("Đã thêm task")
      setTaskDialogOpen(false)
      resetTaskForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể thêm task"))
    }
  }

  const handleToggleTask = async (task: RoadmapTask, isCompleted: boolean) => {
    try {
      await completeTask.mutateAsync({ taskId: task.id, isCompleted })
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật task"))
    }
  }

  const handleAttachDocument = async (task: RoadmapTask, value: string) => {
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        payload: {
          documentId: value === NO_DOCUMENT ? null : value,
        },
      })
      toast.success("Đã cập nhật tài liệu cho task")
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể gắn tài liệu"))
    }
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      await deleteTask.mutateAsync(taskToDelete.id)
      toast.success("Đã xóa task")
      setTaskToDelete(null)
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa task"))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} size="sm">
              <CardContent className="flex items-center gap-3">
                <Skeleton className="size-4 rounded" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError || !roadmap) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2 px-0" onClick={() => navigate("/roadmaps")}>
          <ArrowLeft className="size-4" />
          Quay lại
        </Button>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Không thể tải roadmap. Vui lòng thử lại.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit gap-2 px-0" onClick={() => navigate("/roadmaps")}>
          <ArrowLeft className="size-4" />
          Roadmap
        </Button>

        <Card>
          <CardContent className="space-y-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <BookOpenCheck className="size-5" />
                  </div>
                  <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-foreground">
                    {roadmap.title}
                  </h1>
                  <Badge variant={roadmap.status === "completed" ? "default" : "secondary"}>
                    {roadmap.status === "completed" ? "Hoàn thành" : "Đang học"}
                  </Badge>
                </div>
                {roadmap.description && (
                  <p className="text-sm text-muted-foreground">{roadmap.description}</p>
                )}
              </div>
              <Button className="shrink-0 gap-2" onClick={() => setTaskDialogOpen(true)}>
                <Plus className="size-4" />
                Thêm task
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">
                  {completedCount}/{totalTasks} task hoàn thành
                </span>
                <span className="text-muted-foreground">{roadmap.progress}%</span>
              </div>
              <Progress value={roadmap.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
          <span className="text-sm text-muted-foreground">
            Cập nhật: {formatDate(roadmap.updatedAt)}
          </span>
        </div>

        {roadmap.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
            <FileText className="size-10 opacity-40" />
            <p className="text-sm">Roadmap này chưa có task nào.</p>
            <Button variant="outline" size="sm" onClick={() => setTaskDialogOpen(true)}>
              Thêm task đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {roadmap.tasks.map((task) => {
              const linkedDocument = task.documentId
                ? documentsById.get(task.documentId)
                : undefined

              return (
                <Card key={task.id} size="sm">
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3
                            className={`truncate text-base font-semibold ${
                              task.isCompleted
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.isCompleted && (
                            <Badge variant="secondary">Hoàn thành</Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="flex h-8 w-fit items-center gap-2 rounded-lg border px-3">
                          <Label
                            htmlFor={`task-completed-${task.id}`}
                            className="cursor-pointer text-sm font-medium"
                          >
                            Hoàn thành
                          </Label>
                          <Checkbox
                            id={`task-completed-${task.id}`}
                            checked={task.isCompleted}
                            disabled={completeTask.isPending}
                            onCheckedChange={(checked) =>
                              handleToggleTask(task, checked === true)
                            }
                            aria-label="Hoàn thành"
                          />
                        </div>

                        <Select
                          value={task.documentId ?? NO_DOCUMENT}
                          disabled={updateTask.isPending}
                          onValueChange={(value) => handleAttachDocument(task, value)}
                        >
                          <SelectTrigger className="w-full md:w-72">
                            <SelectValue placeholder="Gắn tài liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NO_DOCUMENT}>Không gắn tài liệu</SelectItem>
                            {documents.map((document) => (
                              <SelectItem key={document.id} value={document.id}>
                                {document.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {linkedDocument ? (
                          <Button variant="outline" size="sm" className="w-fit gap-2" asChild>
                            <Link to={`/documents/${linkedDocument.id}`}>
                              <ExternalLink className="size-4" />
                              Mở tài liệu
                            </Link>
                          </Button>
                        ) : task.documentId ? (
                          <Badge variant="outline" className="w-fit">
                            Tài liệu không còn tồn tại
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="self-end text-muted-foreground sm:self-start"
                          aria-label="Thao tác task"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={deleteTask.isPending}
                          onSelect={() => setTaskToDelete(task)}
                        >
                          <Trash2 className="size-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                      
                    </DropdownMenu>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <Dialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open)
          if (!open) resetTaskForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddTask} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Thêm task</DialogTitle>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="task-title">Tiêu đề</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Tiêu đề task"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-description">Mô tả</Label>
              <Textarea
                id="task-description"
                rows={3}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Ghi chú ngắn cho task"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tài liệu liên kết</Label>
              <Select value={taskDocumentId} onValueChange={setTaskDocumentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tài liệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DOCUMENT}>Không gắn tài liệu</SelectItem>
                  {documents.map((document) => (
                    <SelectItem key={document.id} value={document.id}>
                      {document.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTaskDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={addTask.isPending}>
                {addTask.isPending ? "Đang thêm..." : "Thêm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!taskToDelete}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa task?</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{taskToDelete?.title}</p>
            <p>Task này sẽ bị xóa khỏi roadmap. Bạn chắc chứ?</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTaskToDelete(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteTask.isPending}
              onClick={confirmDeleteTask}
            >
              {deleteTask.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
