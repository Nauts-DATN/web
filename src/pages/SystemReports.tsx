import { useState } from "react"
import { isAxiosError } from "axios"
import { AlertCircle, Bug, CheckCircle2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateSystemReport,
  useMySystemReports,
} from "@/hooks/queries/system-report-hooks"
import type { SystemReportStatus } from "@/types/db/system-report"

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? error.message
  }
  return fallback
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatusBadge({ status }: { status: SystemReportStatus }) {
  if (status === "completed") {
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckCircle2 className="size-3.5" />
        Đã xử lý
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      <AlertCircle className="size-3.5" />
      Đang xử lý
    </Badge>
  )
}

export function SystemReports() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const { data, isLoading, isError } = useMySystemReports()
  const createReport = useCreateSystemReport()

  const reports = data?.isSuccess ? (data.data?.reports ?? []) : []

  const resetForm = () => {
    setTitle("")
    setDescription("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle || !trimmedDescription) {
      toast.error("Vui lòng nhập đầy đủ lỗi và mô tả.")
      return
    }

    try {
      await createReport.mutateAsync({
        title: trimmedTitle,
        description: trimmedDescription,
      })
      toast.success("Đã gửi báo lỗi.")
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể gửi báo lỗi."))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Báo lỗi hệ thống
          </h1>
          <p className="mt-1 text-muted-foreground">
            Theo dõi các lỗi bạn đã gửi và trạng thái xử lý từ quản trị viên.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Báo lỗi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lỗi đã báo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Không thể tải danh sách lỗi đã báo.
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-lg border border-dashed py-14 text-center">
              <Bug className="mx-auto mb-3 size-9 text-muted-foreground/50" />
              <p className="font-medium text-muted-foreground">
                Bạn chưa báo lỗi nào.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg border bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-medium text-foreground">
                        {report.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {report.description}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Gửi lúc {formatDate(report.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Báo lỗi hệ thống</DialogTitle>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="report-title">Lỗi gặp phải</Label>
              <Input
                id="report-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Không tải được tài liệu"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="report-description">Mô tả chi tiết</Label>
              <Textarea
                id="report-description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả thao tác đã thực hiện, lỗi hiển thị và thời điểm xảy ra..."
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
              <Button type="submit" disabled={createReport.isPending}>
                {createReport.isPending ? "Đang gửi..." : "Gửi lỗi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
