import { Link, Navigate } from "react-router-dom"
import { ArrowRight, BookOpenCheck, FileText, LogOut, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import {useNavigate} from "react-router-dom"
export function Home() {
  const { user, logout } = useAuth()
  const displayName = user?.name || "bạn"
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if(user.role === "admin") {
    return <Navigate to="/admin" replace />
  }
  return (
    <div className="min-h-[calc(100vh-7rem)]">
      <header className="border-b">
        <div className="flex h-16 items-center justify-end gap-4 px-5">
          <span className="text-base text-muted-foreground">Xin chào, {displayName}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-13rem)] items-center justify-center">
      <section className="w-full max-w-4xl text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border bg-background shadow-sm">
          <BookOpenCheck className="size-8 text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Sẵn sàng học tập?
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Quản lý tài liệu, ghi chú, bài luyện tập và roadmap học tập của bạn
            trong một không gian gọn gàng.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="gap-2 px-8">
            <Link to="/dashboard">
              Bắt đầu
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-5 text-left shadow-sm">
            <FileText className="mb-4 size-5 text-primary" />
            <h2 className="font-medium">Tài liệu</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Lưu trữ và xem lại tài liệu học tập theo môn học.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-5 text-left shadow-sm">
            <Sparkles className="mb-4 size-5 text-primary" />
            <h2 className="font-medium">AI hỗ trợ</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Tóm tắt tài liệu và tạo bài luyện tập nhanh hơn.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-5 text-left shadow-sm">
            <BookOpenCheck className="mb-4 size-5 text-primary" />
            <h2 className="font-medium">Roadmap</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Theo dõi tiến độ học tập theo từng lộ trình.
            </p>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}
