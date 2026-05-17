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
import {
  ArrowLeft,
  FileText,
  ExternalLink,
} from "lucide-react"
import { useDocument } from "@/hooks/queries/document-hooks"

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

export function CommunityDocDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: apiRes, isLoading, isError, error, refetch } = useDocument(id)
  const doc = apiRes?.isSuccess ? apiRes.data?.document : undefined

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
          <Link to="/community-documents" className="gap-2">
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
    <div className="space-y-8 ">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/community-documents" aria-label="Quay lại danh sách">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
        {/* PDF Viewer */}
        <Card className="flex min-h-[min(70vh,560px)] flex-col lg:col-span-1">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="size-5 text-primary" />
                      Xem tài liệu
                    </CardTitle>
                    {/* <p className="text-sm text-muted-foreground">
                      {doc.title} · {formatBytes(doc.fileSize)} · {formatDate(doc.updatedAt)}
                    </p> */}
                  </CardHeader>
                  <CardContent className="min-h-0 flex-1 p-0">
                    {isPdf ? (
                      <iframe
                        title={doc.title}
                        src={doc.presignedUrl || doc.downloadUrl}
                        loading="lazy"
                        className="h-[700px] w-full rounded-b-xl border-0 bg-muted/30"
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
                          <p className="whitespace-pre-wrap text-sm">{doc.description}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
        </div>
    </div>
  )
}
