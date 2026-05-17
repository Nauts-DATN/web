import { Outlet, Navigate, Link, useLocation } from "react-router-dom"
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  PenTool,
  CheckSquare,
  TrendingUp,
  User,
  LogOut,
  Globe
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tài liệu của tôi", href: "/documents", icon: FileText },
  { name: "Ghi chú", href: "/notes", icon: PenTool },
  { name: "Luyện tập", href: "/quiz", icon: CheckSquare },
  { name: "Tiến độ", href: "/progress", icon: TrendingUp },
]

export function MainLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link to="/dashboard">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <BookOpen className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">EduAI</span>
                      <span className="truncate text-xs text-muted-foreground">
                        Học tập thông minh
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="flex flex-col gap-4">
                  {navigation.map((item) => {
                    const isActive = location.pathname.startsWith(item.href)
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.name}
                        >
                          <Link to={item.href}>
                            <item.icon />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarContent >
            <SidebarGroup className="border-t border-sidebar-border">
              <SidebarGroupContent>
                <SidebarMenu className="flex flex-col gap-4">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Course">
                      <Link to="/community-documents">
                        <Globe />
                        <span>Tài liệu cộng đồng</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Course">
                      <Link to="/documents">
                        <FileText />
                        <span>Thư Viện</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Hồ sơ">
                  <Link to="/profile">
                    <User />
                    <span>Hồ sơ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant="default"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut />
                  <span>Đăng xuất</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <span className="font-medium">EduAI</span>
            </div>
          </header>
          <div className="flex flex-1 flex-col">
            <div className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
