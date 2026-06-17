import { useState } from "react"
import { isAxiosError } from "axios"
import { AlertCircle, CheckCircle2, Eye } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAdminSystemReports,
  useCompleteSystemReport,
} from "@/hooks/queries/system-report-hooks"
import type {
  SystemReport,
  SystemReportStatus,
} from "@/types/db/system-report"

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? error.message
  }
  return fallback
}

function formatDate(value: string | null): string {
  if (!value) return "-"
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

export function AdminSystemReports() {
  const [selectedReport, setSelectedReport] = useState<SystemReport | null>(null)

  const { data, isLoading, isError } = useAdminSystemReports()
  const completeReport = useCompleteSystemReport()

  const reports = data?.isSuccess ? (data.data?.reports ?? []) : []
  const processingCount = reports.filter(
    (report) => report.status === "processing",
  ).length
  const completedCount = reports.filter(
    (report) => report.status === "completed",
  ).length

  const handleComplete = async (report: SystemReport) => {
    try {
      const res = await completeReport.mutateAsync(report.id)
      toast.success("Đã hoàn thành xử lý lỗi.")
      if (res.isSuccess && res.data?.report) {
        setSelectedReport(res.data.report)
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật trạng thái lỗi."))
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Báo lỗi hệ thống
        </h1>
        <p className="mt-1 text-muted-foreground">
          Xem tất cả lỗi người dùng đã báo cáo và cập nhật trạng thái xử lý.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardContent>
            <p className="text-sm text-muted-foreground">Tổng báo cáo</p>
            <p className="mt-2 text-2xl font-semibold">{reports.length}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-sm text-muted-foreground">Đang xử lý</p>
            <p className="mt-2 text-2xl font-semibold">{processingCount}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-sm text-muted-foreground">Hoàn thành</p>
            <p className="mt-2 text-2xl font-semibold">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lỗi đã báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Không thể tải danh sách báo lỗi.
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-lg border border-dashed py-14 text-center text-sm text-muted-foreground">
              Chưa có báo lỗi nào.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lỗi</TableHead>
                  <TableHead>Người báo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead className="w-24 text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {report.title}
                      </div>
                      <p className="max-w-md truncate text-sm text-muted-foreground">
                        {report.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {report.reporter?.name ?? "Người dùng"}
                        </p>
                        <p className="text-muted-foreground">
                          {report.reporter?.email ?? report.reportedBy}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="size-4" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => {
          if (!open) setSelectedReport(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết báo lỗi</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedReport.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gửi lúc {formatDate(selectedReport.createdAt)}
                  </p>
                </div>
                <StatusBadge status={selectedReport.status} />
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">Người báo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedReport.reporter?.name ?? "Người dùng"} ·{" "}
                  {selectedReport.reporter?.email ?? selectedReport.reportedBy}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Mô tả lỗi</p>
                <p className="mt-2 whitespace-pre-wrap rounded-lg border p-4 text-sm leading-6 text-muted-foreground">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.completedAt && (
                <p className="text-sm text-muted-foreground">
                  Hoàn thành lúc {formatDate(selectedReport.completedAt)}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedReport(null)}
            >
              Đóng
            </Button>
            {selectedReport?.status === "processing" && (
              <Button
                type="button"
                disabled={completeReport.isPending}
                onClick={() => handleComplete(selectedReport)}
              >
                {completeReport.isPending
                  ? "Đang cập nhật..."
                  : "Hoàn thành xử lý"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
