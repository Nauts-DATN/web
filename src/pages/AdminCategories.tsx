import { useState } from "react"
import { isAxiosError } from "axios"
import { Edit, MoreVertical, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/queries/category-hooks"
import type { Category } from "@/types/db/category"

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? error.message
  }
  return fallback
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function AdminCategories() {
  const [formOpen, setFormOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const { data, isLoading, isError } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const categories = data?.isSuccess ? (data.data?.categories ?? []) : []

  const resetForm = () => {
    setCategoryToEdit(null)
    setName("")
    setDescription("")
  }

  const openCreateDialog = () => {
    resetForm()
    setFormOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setCategoryToEdit(category)
    setName(category.name)
    setDescription(category.description ?? "")
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Vui lòng nhập tên category")
      return
    }

    try {
      if (categoryToEdit) {
        await updateCategory.mutateAsync({
          id: categoryToEdit.id,
          payload: {
            name: trimmedName,
            description: description.trim() || undefined,
          },
        })
        toast.success("Đã cập nhật category")
      } else {
        await createCategory.mutateAsync({
          name: trimmedName,
          description: description.trim() || undefined,
        })
        toast.success("Đã thêm category")
      }
      setFormOpen(false)
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể lưu category"))
    }
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      await deleteCategory.mutateAsync(categoryToDelete.id)
      toast.success("Đã xóa category")
      setCategoryToDelete(null)
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa category"))
    }
  }

  const isSaving = createCategory.isPending || updateCategory.isPending

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Quản lý loại tài liệu
          </h1>
          <p className="mt-1 text-muted-foreground">
            Xem, thêm, sửa và xóa loại tài liệu trong hệ thống.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="size-4" />
          Thêm loại tài liệu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách loại tài liệu</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="size-8 rounded-md" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Không thể tải danh sách loại tài liệu.
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              Chưa có loại tài liệu nào.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-16 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-lg">
                      <p className="truncate text-muted-foreground">
                        {category.description || "Không có mô tả"}
                      </p>
                    </TableCell>
                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Thao tác category"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => openEditDialog(category)}>
                            <Edit className="size-4" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={deleteCategory.isPending}
                            onSelect={() => setCategoryToDelete(category)}
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
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {categoryToEdit ? "Sửa loại tài liệu" : "Thêm loại tài liệu"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="category-name">Tên loại tài liệu</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên loại tài liệu"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-description">Mô tả</Label>
              <Textarea
                id="category-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn cho loại tài liệu (tùy chọn)"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa category?</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{categoryToDelete?.name}</p>
            <p>Category này sẽ bị xóa khỏi hệ thống. Bạn chắc chứ?</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCategoryToDelete(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteCategory.isPending}
              onClick={confirmDelete}
            >
              {deleteCategory.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
