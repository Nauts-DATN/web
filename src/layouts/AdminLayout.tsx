import { Link, Navigate, Outlet, useLocation } from "react-router-dom"
import {
  BookOpen,
  Bug,
  LayoutDashboard,
  LogOut,
  Moon,
  Shield,
  Sun,
  Users,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

const adminNavigation = [
  { name: "Trang chủ", href: "/admin", icon: LayoutDashboard },
  { name: "Người dùng", href: "/admin/users", icon: Users },
  { name: "Loại tài liệu", href: "/admin/categories", icon: BookOpen },
  { name: "Lỗi hệ thống", href: "/admin/system-reports", icon: Bug },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">EduAI Admin</p>
            <p className="truncate text-xs text-muted-foreground">
              Quản trị hệ thống
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {adminNavigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-2 border-t p-3">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            aria-label={
              isDark
                ? "Chuyển sang giao diện sáng"
                : "Chuyển sang giao diện tối"
            }
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            {isDark ? "Giao diện sáng" : "Giao diện tối"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => logout()}
          >
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <Link to="/admin/users" className="flex items-center gap-2 font-semibold">
          <Shield className="size-4 text-primary" />
          EduAI Admin
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={
            isDark
              ? "Chuyển sang giao diện sáng"
              : "Chuyển sang giao diện tối"
          }
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/dashboard" aria-label="Về ứng dụng">
            <BookOpen className="size-4" />
          </Link>
        </Button>
      </header>

      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
