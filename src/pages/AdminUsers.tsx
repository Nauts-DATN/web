import { useState } from "react"
import { isAxiosError } from "axios"
import {
  Eye,
  Lock,
  MoreVertical,
  Search,
  Trash2,
  Unlock,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import API_ROUTES from "@/conf/constants/api-routes"
import { useAuth } from "@/context/AuthContext"
import {
  useDeleteUser,
  useSetUserBlocked,
  useUser,
  useUsers,
} from "@/hooks/queries/user-hooks"
import type { User } from "@/types/db/user"

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? error.message
  }
  return fallback
}

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function resolveAvatarSrc(user: User) {
  if (!user.avatar) return ""
  if (
    user.avatar.startsWith("http://") ||
    user.avatar.startsWith("https://") ||
    user.avatar.startsWith("blob:") ||
    user.avatar.startsWith("data:")
  ) {
    return user.avatar
  }
  return API_ROUTES.USERS.AVATAR(user.id)
}

export function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState("")
  const [detailUserId, setDetailUserId] = useState<string | undefined>()
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const { data, isLoading, isError } = useUsers(true, search)
  const { data: detailData, isLoading: isLoadingDetail } = useUser(detailUserId)
  const setBlocked = useSetUserBlocked()
  const deleteUser = useDeleteUser()

  const users = data?.isSuccess ? (data.data ?? []) : []
  const selectedUser = detailData?.isSuccess ? detailData.data : null
  const adminCount = users.filter((item) => item.role === "admin").length
  const blockedCount = users.filter((item) => item.isBlocked).length
  const verifiedCount = users.filter((item) => item.emailVerified).length

  const handleSetBlocked = async (target: User, isBlocked: boolean) => {
    try {
      await setBlocked.mutateAsync({ id: target.id, isBlocked })
      toast.success(isBlocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản")
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật tài khoản"))
    }
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      await deleteUser.mutateAsync(userToDelete.id)
      toast.success("Đã xóa user")
      setUserToDelete(null)
      if (detailUserId === userToDelete.id) setDetailUserId(undefined)
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa user"))
    }
  }

  const canMutateUser = (target: User) =>
    target.role !== "admin" && target.id !== currentUser?.id

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-muted-foreground">
            Xem, tìm kiếm, khóa/mở khóa và xóa tài khoản người dùng.
          </p>
        </div>

        <InputGroup className="w-full lg:w-96">
          <InputGroupAddon>
            <Search className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
          />
        </InputGroup>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card size="sm">
          <CardContent>
            <p className="text-sm text-muted-foreground">Tổng người dùng</p>
            <p className="mt-2 text-2xl font-semibold">{users.length}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-sm text-muted-foreground">Admin</p>
            <p className="mt-2 text-2xl font-semibold">{adminCount}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-sm text-muted-foreground">Đang bị khóa</p>
            <p className="mt-2 text-2xl font-semibold">{blockedCount}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p className="text-sm text-muted-foreground">Đã xác thực email</p>
            <p className="mt-2 text-2xl font-semibold">{verifiedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Không thể tải danh sách người dùng.
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              Không tìm thấy người dùng phù hợp.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-16 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {resolveAvatarSrc(item) ? (
                            <AvatarImage
                              src={resolveAvatarSrc(item)}
                              alt={item.name}
                            />
                          ) : null}
                          <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.role === "admin" ? "default" : "secondary"}
                      >
                        {item.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={item.isBlocked ? "destructive" : "default"}>
                          {item.isBlocked ? "Đã khóa" : "Hoạt động"}
                        </Badge>
                        <Badge
                          variant={item.emailVerified ? "secondary" : "outline"}
                        >
                          {item.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Thao tác user"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setDetailUserId(item.id)}>
                            <Eye className="size-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!canMutateUser(item) || setBlocked.isPending}
                            onSelect={() => handleSetBlocked(item, !item.isBlocked)}
                          >
                            {item.isBlocked ? (
                              <Unlock className="size-4" />
                            ) : (
                              <Lock className="size-4" />
                            )}
                            {item.isBlocked ? "Mở khóa" : "Khóa tài khoản"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={!canMutateUser(item) || deleteUser.isPending}
                            onSelect={() => setUserToDelete(item)}
                          >
                            <Trash2 className="size-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!detailUserId}
        onOpenChange={(open) => {
          if (!open) setDetailUserId(undefined)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết user</DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="space-y-3">
              <Skeleton className="size-16 rounded-full" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  {resolveAvatarSrc(selectedUser) ? (
                    <AvatarImage
                      src={resolveAvatarSrc(selectedUser)}
                      alt={selectedUser.name}
                    />
                  ) : null}
                  <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-foreground">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="break-all font-medium">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vai trò</p>
                  <p className="font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tài khoản</p>
                  <p className="font-medium">
                    {selectedUser.isBlocked ? "Đã khóa" : "Hoạt động"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {selectedUser.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cập nhật</p>
                  <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              Không tìm thấy user.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa user?</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{userToDelete?.name}</p>
            <p>User này sẽ bị xóa khỏi hệ thống. Bạn chắc chứ?</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUserToDelete(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteUser.isPending}
              onClick={confirmDelete}
            >
              {deleteUser.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
