import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BookOpenCheck,
  CheckSquare,
  FileText,
  StickyNote,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useDocuments } from "@/hooks/queries/document-hooks"
import { useNotes } from "@/hooks/queries/note-hooks"
import { useQuizzes } from "@/hooks/queries/ai-hooks"
import { useRoadmaps } from "@/hooks/queries/roadmap-hooks"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function Dashboard() {
  const { user } = useAuth()
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    isError: isDocumentsError,
  } = useDocuments()
  const {
    data: notesData,
    isLoading: isLoadingNotes,
    isError: isNotesError,
  } = useNotes()
  const {
    data: quizzesData,
    isLoading: isLoadingQuizzes,
    isError: isQuizzesError,
  } = useQuizzes()
  const {
    data: roadmapsData,
    isLoading: isLoadingRoadmaps,
    isError: isRoadmapsError,
  } = useRoadmaps()

  const documents = documentsData?.isSuccess
    ? (documentsData.data?.documents ?? [])
    : []
  const notes = notesData?.isSuccess ? (notesData.data?.notes ?? []) : []
  const quizzes = quizzesData?.isSuccess
    ? (quizzesData.data?.quizzes ?? [])
    : []
  const roadmaps = roadmapsData?.isSuccess
    ? (roadmapsData.data?.roadmaps ?? [])
    : []

  const completedRoadmaps = roadmaps.filter(
    (roadmap) => roadmap.status === "completed",
  ).length

  const recentDocuments = [...documents]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3)
  const recentRoadmaps = [...roadmaps]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4)

  const stats = [
    {
      title: "Tổng tài liệu",
      value: documents.length,
      icon: FileText,
      iconClass: "bg-primary/10 text-primary",
      isLoading: isLoadingDocuments,
      isError: isDocumentsError,
    },
    {
      title: "Quiz đã tạo",
      value: quizzes.length,
      icon: CheckSquare,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      isLoading: isLoadingQuizzes,
      isError: isQuizzesError,
    },
    {
      title: "Ghi chú",
      value: notes.length,
      icon: StickyNote,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
      isLoading: isLoadingNotes,
      isError: isNotesError,
    },
    {
      title: "Roadmap hoàn thành",
      value: `${completedRoadmaps}/${roadmaps.length}`,
      icon: BookOpenCheck,
      iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      isLoading: isLoadingRoadmaps,
      isError: isRoadmapsError,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Chào mừng trở lại, {user?.name || "bạn"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Dưới đây là tổng quan dữ liệu học tập của bạn từ hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
              >
                <stat.icon className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                {stat.isLoading ? (
                  <Skeleton className="mt-2 h-8 w-16" />
                ) : (
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    {stat.isError ? "--" : stat.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Tiến độ roadmap</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/roadmaps">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingRoadmaps ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : isRoadmapsError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
                Không thể tải tiến độ roadmap.
              </div>
            ) : recentRoadmaps.length === 0 ? (
              <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                Bạn chưa có roadmap nào.
              </div>
            ) : (
              recentRoadmaps.map((roadmap) => (
                <div key={roadmap.id}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <Link
                      to={`/roadmaps/${roadmap.id}`}
                      className="truncate font-medium text-foreground hover:underline"
                    >
                      {roadmap.title}
                    </Link>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {roadmap.progress}%
                    </span>
                  </div>
                  <Progress value={roadmap.progress} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Tài liệu tải lên gần đây</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/documents">Quản lý</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingDocuments ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-md" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isDocumentsError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
                Không thể tải tài liệu.
              </div>
            ) : recentDocuments.length === 0 ? (
              <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                Bạn chưa tải tài liệu nào.
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map((document) => (
                  <Link
                    key={document.id}
                    to={`/documents/${document.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {document.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(document.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
