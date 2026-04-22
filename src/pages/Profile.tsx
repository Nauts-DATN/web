import { useState } from "react"
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

export function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Cập nhật hồ sơ thành công!")
    }, 1000)
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
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback>
                    <User className="size-16 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  className="absolute right-0 bottom-0 size-9 rounded-full shadow"
                  aria-label="Đổi ảnh đại diện"
                >
                  <Camera className="size-4" />
                </Button>
              </div>
              <p className="max-w-[12rem] text-center text-xs text-muted-foreground">
                JPG, GIF hoặc PNG. Tối đa 1MB.
              </p>
            </div>

            <form onSubmit={handleSave} className="w-full flex-1 space-y-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </InputGroup>
              </Field>
              <div className="flex justify-end">
                <Button type="submit" isLoading={isSaving}>
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
          <form className="max-w-md space-y-5">
            <Field>
              <FieldLabel htmlFor="pwd-current">Mật khẩu hiện tại</FieldLabel>
              <Input id="pwd-current" type="password" autoComplete="current-password" />
            </Field>
            <Field>
              <FieldLabel htmlFor="pwd-new">Mật khẩu mới</FieldLabel>
              <Input id="pwd-new" type="password" autoComplete="new-password" />
            </Field>
            <Field>
              <FieldLabel htmlFor="pwd-confirm">Xác nhận mật khẩu mới</FieldLabel>
              <Input id="pwd-confirm" type="password" autoComplete="new-password" />
            </Field>
            <Button type="button" variant="outline">
              Cập nhật mật khẩu
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
