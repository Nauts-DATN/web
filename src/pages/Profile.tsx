import { useRef, useState } from "react"
import { isAxiosError } from "axios"
import { useAuth } from "@/context/AuthContext"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Camera } from "lucide-react"
import { toast } from "sonner"
import {
  useUpdateUserAvatar,
  useUpdateUserName,
  useUpdateUserPassword,
} from "@/hooks/queries/user-hooks"

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? error.message
  }
  return fallback
}



export function Profile() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(user?.name || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [avatarUrl, setAvatarUrl] = useState(
      (user?.avatar),
  )
  console.log("User data in Profile:", user) // Debug log to check user data

  const updateNameMutation = useUpdateUserName()
  const updateAvatarMutation = useUpdateUserAvatar()
  const updatePasswordMutation = useUpdateUserPassword()

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Vui lòng nhập họ và tên")
      return
    }

    try {
      const res = await updateNameMutation.mutateAsync(trimmedName)
      if (res.isSuccess && res.data?.user) {
        updateUser(res.data.user)
        toast.success("Đã cập nhật họ và tên")
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật họ và tên"))
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    if (!file.type.endsWith("png") && !file.type.endsWith("jpeg") && !file.type.endsWith("gif")) {
      toast.error("Vui lòng chọn file ảnh")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh đại diện tối đa 5MB")
      return
    }

    try {
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)
      const res = await updateAvatarMutation.mutateAsync(file)
      if (res.isSuccess && res.data) {
        // const nextAvatar = `${res.data.publicUrl}?t=${Date.now()}`
        const nextAvatar = res.data.publicUrl
        setAvatarUrl(nextAvatar || "")
        updateUser({ ...res.data.user, avatar: nextAvatar })
        toast.success("Đã cập nhật ảnh đại diện")
      }
      URL.revokeObjectURL(previewUrl)
    } catch (error) {
      setAvatarUrl((user?.avatar))
      toast.error(getErrorMessage(error, "Không thể cập nhật ảnh đại diện"))
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
      await updatePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Đã cập nhật mật khẩu")
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật mật khẩu"))
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hồ sơ cá nhân
        </h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý thông tin tài khoản của bạn.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-8 sm:flex-row">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="size-32 border-4 border-background shadow-md">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={user?.name || "Avatar"} />
                  ) : null}
                  {/* <AvatarFallback>
                    <User className="size-16 text-muted-foreground" />
                  </AvatarFallback> */}
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
                  disabled={updateAvatarMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Đổi ảnh đại diện"
                >
                  <Camera className="size-4" />
                </Button>
              </div>
              <p className="max-w-[12rem] text-center text-xs text-muted-foreground">
                JPG, GIF hoặc PNG. Tối đa 5MB.
              </p>
            </div>

            <form onSubmit={handleSaveName} className="w-full flex-1 space-y-6">
              <Field>
                <FieldLabel htmlFor="profile-name">Họ và tên</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <User className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Mail className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="profile-email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    readOnly
                  />
                </InputGroup>
              </Field>
              <div className="flex justify-end">
                <Button type="submit" isLoading={updateNameMutation.isPending}>
                  Lưu thay đổi
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
          <form onSubmit={handleChangePassword} className="max-w-md space-y-5">
            <Field>
              <FieldLabel htmlFor="pwd-current">Mật khẩu hiện tại</FieldLabel>
              <Input
                id="pwd-current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="pwd-new">Mật khẩu mới</FieldLabel>
              <Input
                id="pwd-new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="pwd-confirm">Xác nhận mật khẩu mới</FieldLabel>
              <Input
                id="pwd-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
            <Button
              type="submit"
              variant="outline"
              isLoading={updatePasswordMutation.isPending}
            >
              Cập nhật mật khẩu
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
