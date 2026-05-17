import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Download, FileText, Globe } from "lucide-react"
import { useCommunityDocuments } from "@/hooks/queries/document-hooks"
import { useCategories } from "@/hooks/queries/category-hooks"
import { useCourses } from "@/hooks/queries/course-hooks"

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

export function CommunityDocuments() {
  const [search, setSearch] = useState("")
  const { data, isLoading, isError, refetch } = useCommunityDocuments(search)
  const documents = data?.data?.documents ?? []
  const { data: catData } = useCategories()
  const { data: courseData } = useCourses()

  const allCategories = catData?.data?.categories ?? []
  const allCourses = courseData?.data?.courses ?? []


  function getCategoryName(id?: string) {
    return allCategories.find((c) => c.id === id)?.name
  }

  function getCourseName(id?: string) {
    return allCourses.find((c) => c.id === id)?.name
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Tài liệu cộng đồng
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tìm kiếm, xem và tải các tài liệu được chia sẻ công khai.
        </p>
      </div>

      <InputGroup className="max-w-lg">
        <InputGroupAddon>
          <Search className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm theo tiêu đề tài liệu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Không thể tải tài liệu cộng đồng.
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !isError && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Globe className="size-10 opacity-40" />
          <p className="text-sm">
            {search ? "Không tìm thấy tài liệu phù hợp." : "Chưa có tài liệu public nào."}
          </p>
        </div>
      )}

      {!isLoading && !isError && documents.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <FileText className="size-6 text-primary" />
                  </div>
                  {/* <Badge variant="default">Public</Badge> */}
                </div>

                <div className="mt-4">
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
                    <Badge variant="outline">
                      {getCourseName(doc.course)}
                    </Badge>
                  )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(doc.fileSize)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to={`/community-documents/${doc.id}`}>Xem chi tiết</Link>
                  </Button>
                  <Button className="gap-2" asChild>
                    <a href={doc.presignedUrl} target="_blank" rel="noreferrer">
                      <Download className="size-4" />
                      Tải
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
