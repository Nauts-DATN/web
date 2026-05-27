import { useRef, useState } from "react"
import { isAxiosError } from "axios"
import {
  Camera,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  User,
  Users,
  UserX,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import API_ROUTES from "@/conf/constants/api-routes"
import { useAuth } from "@/context/AuthContext"
import {
  useUpdateUserAvatar,
  useUpdateUserName,
  useUpdateUserPassword,
  useUsers,
} from "@/hooks/queries/user-hooks"
import type { User as AppUser } from "@/types/db/user"

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? error.message
  }
  return fallback
}

function resolveAvatarSrc(user?: Partial<AppUser> | null) {
  if (!user?.avatar) return ""
  if (
    user.avatar.startsWith("http://") ||
    user.avatar.startsWith("https://") ||
    user.avatar.startsWith("blob:") ||
    user.avatar.startsWith("data:")
  ) {
    return user.avatar
  }
  return user.id ? API_ROUTES.USERS.AVATAR(user.id) : ""
}

function getInitials(name?: string) {
  return (name || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function AdminDashboard() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(user?.name || "")
  const [avatarUrl, setAvatarUrl] = useState(resolveAvatarSrc(user))
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { data, isLoading } = useUsers()
  const updateName = useUpdateUserName()
  const updateAvatar = useUpdateUserAvatar()
  const updatePassword = useUpdateUserPassword()

  const users = data?.isSuccess ? (data.data ?? []) : []
  const totalUsers = users.length
  const adminUsers = users.filter((item) => item.role === "admin").length
  const blockedUsers = users.filter((item) => item.isBlocked).length
  const verifiedUsers = users.filter((item) => item.emailVerified).length

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Vui lòng nhập tên admin")
      return
    }

    try {
      const res = await updateName.mutateAsync(trimmedName)
      if (res.isSuccess && res.data?.user) {
        updateUser(res.data.user)
        toast.success("Đã cập nhật thông tin admin")
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật thông tin"))
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh đại diện tối đa 5MB")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setAvatarUrl(previewUrl)
    try {
      const res = await updateAvatar.mutateAsync(file)
      if (res.isSuccess && res.data) {
        const nextAvatar = `${res.data.publicUrl}?t=${Date.now()}`
        setAvatarUrl(nextAvatar)
        updateUser({ ...res.data.user, avatar: nextAvatar })
        toast.success("Đã cập nhật avatar")
      }
    } catch (error) {
      setAvatarUrl(resolveAvatarSrc(user))
      toast.error(getErrorMessage(error, "Không thể cập nhật avatar"))
    } finally {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu mới không khớp")
      return
    }

    try {
      await updatePassword.mutateAsync({ currentPassword, newPassword })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Đã cập nhật mật khẩu")
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật mật khẩu"))
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tổng quan hệ thống và thông tin tài khoản quản trị.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tổng user</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-16" />
              ) : (
                <p className="mt-2 text-2xl font-semibold">{totalUsers}</p>
              )}
            </div>
            <Users className="size-9 text-primary" />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Admin</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-16" />
              ) : (
                <p className="mt-2 text-2xl font-semibold">{adminUsers}</p>
              )}
            </div>
            <ShieldCheck className="size-9 text-primary" />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Đã xác thực</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-16" />
              ) : (
                <p className="mt-2 text-2xl font-semibold">{verifiedUsers}</p>
              )}
            </div>
            <Mail className="size-9 text-primary" />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Bị khóa</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-16" />
              ) : (
                <p className="mt-2 text-2xl font-semibold">{blockedUsers}</p>
              )}
            </div>
            <UserX className="size-9 text-destructive" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 sm:flex-row">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="size-28 border-4 border-background shadow-md">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={user?.name || "Admin"} />
                    ) : null}
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="absolute bottom-0 right-0 size-9 rounded-full shadow"
                    disabled={updateAvatar.isPending}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Đổi avatar admin"
                  >
                    <Camera className="size-4" />
                  </Button>
                </div>
                <Badge variant="default" className="gap-1.5">
                  <Shield className="size-3.5" />
                  {user?.role || "admin"}
                </Badge>
              </div>

              <form onSubmit={handleSaveName} className="min-w-0 flex-1 space-y-5">
                <Field>
                  <FieldLabel htmlFor="admin-name">Tên admin</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <User className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="admin-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="admin-email">Email</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Mail className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="admin-email"
                      value={user?.email || ""}
                      disabled
                      readOnly
                    />
                  </InputGroup>
                </Field>

                <div className="flex justify-end">
                  <Button type="submit" isLoading={updateName.isPending}>
                    Lưu thông tin
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="admin-current-password">
                  Mật khẩu hiện tại
                </FieldLabel>
                <Input
                  id="admin-current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-new-password">Mật khẩu mới</FieldLabel>
                <Input
                  id="admin-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-confirm-password">
                  Xác nhận mật khẩu mới
                </FieldLabel>
                <Input
                  id="admin-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              <Button
                type="submit"
                variant="outline"
                className="gap-2"
                isLoading={updatePassword.isPending}
              >
                <Lock className="size-4" />
                Cập nhật mật khẩu
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
