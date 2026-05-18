import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"
import { BookOpenCheck, MoreVertical, Plus, Route } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateRoadmap,
  useDeleteRoadmap,
  useRoadmaps,
} from "@/hooks/queries/roadmap-hooks"
import type { Roadmap } from "@/types/db/roadmap"

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

function statusLabel(status: Roadmap["status"]) {
  return status === "completed" ? "Hoàn thành" : "Đang học"
}

export function Roadmaps() {
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [roadmapToDelete, setRoadmapToDelete] = useState<Roadmap | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const { data, isLoading, isError } = useRoadmaps()
  const createRoadmap = useCreateRoadmap()
  const deleteRoadmap = useDeleteRoadmap()

  const roadmaps = data?.isSuccess ? (data.data?.roadmaps ?? []) : []

  const resetForm = () => {
    setTitle("")
    setDescription("")
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error("Vui lòng nhập tiêu đề roadmap")
      return
    }

    try {
      await createRoadmap.mutateAsync({
        title: trimmedTitle,
        description: description.trim() || undefined,
      })
      toast.success("Đã tạo roadmap")
      setCreateOpen(false)
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tạo roadmap"))
    }
  }

  const confirmDelete = async () => {
    if (!roadmapToDelete) return

    try {
      await deleteRoadmap.mutateAsync(roadmapToDelete.id)
      toast.success("Đã xóa roadmap")
      setRoadmapToDelete(null)
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa roadmap"))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Roadmap
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tạo và theo dõi lộ trình học tập của bạn.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Tạo roadmap
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} size="sm">
              <CardContent className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-md" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Không thể tải danh sách roadmap. Vui lòng thử lại.
        </div>
      )}

      {!isLoading && !isError && roadmaps.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Route className="size-10 opacity-40" />
          <p className="text-sm">Chưa có roadmap nào.</p>
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            Tạo roadmap đầu tiên
          </Button>
        </div>
      )}

      {!isLoading && roadmaps.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {roadmaps.map((roadmap) => (
            <Card key={roadmap.id} size="sm" className="transition-shadow hover:shadow-md">
              <CardContent>
                <div
                  role="link"
                  tabIndex={0}
                  className="flex cursor-pointer items-start gap-4 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => navigate(`/roadmaps/${roadmap.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      navigate(`/roadmaps/${roadmap.id}`)
                    }
                  }}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <BookOpenCheck className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-foreground">
                          {roadmap.title}
                        </h2>
                        <Badge
                          variant={
                            roadmap.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {statusLabel(roadmap.status)}
                        </Badge>
                      </div>
                      {roadmap.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {roadmap.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>Tiến độ</span>
                        <span>{roadmap.progress}%</span>
                      </div>
                      <Progress value={roadmap.progress} />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Cập nhật: {formatDate(roadmap.updatedAt)}
                    </p>
                  </div>

                  <div
                    className="shrink-0"
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
                          aria-label="Thao tác roadmap"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={deleteRoadmap.isPending}
                          onSelect={() => setRoadmapToDelete(roadmap)}
                        >
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Tạo roadmap</DialogTitle>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="roadmap-title">Tiêu đề</Label>
              <Input
                id="roadmap-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Learn React in 14 days"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roadmap-description">Mô tả</Label>
              <Textarea
                id="roadmap-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mục tiêu hoặc ghi chú cho lộ trình"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createRoadmap.isPending}>
                {createRoadmap.isPending ? "Đang tạo..." : "Tạo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!roadmapToDelete}
        onOpenChange={(open) => {
          if (!open) setRoadmapToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa roadmap?</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{roadmapToDelete?.title}</p>
            <p>Xóa roadmap này sẽ xóa toàn bộ task bên trong. Bạn chắc chứ?</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRoadmapToDelete(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteRoadmap.isPending}
              onClick={confirmDelete}
            >
              {deleteRoadmap.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
