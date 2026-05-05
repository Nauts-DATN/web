import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Plus, Search, Tag, Trash2, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { isAxiosError } from "axios"
import type { Note } from "@/types/db/note"
import { useDocuments } from "@/hooks/queries/document-hooks"
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from "@/hooks/queries/note-hooks"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function Notes() {
  const location = useLocation()
  const fromDocumentId = (location.state as { fromDocumentId?: string } | null)?.fromDocumentId

  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [documentId, setDocumentId] = useState(fromDocumentId ?? "")

  const { data: notesRes, isLoading, isError, refetch } = useNotes()
  const { data: docsRes } = useDocuments()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const notes = notesRes?.isSuccess ? (notesRes.data?.notes ?? []) : []
  const documents = docsRes?.isSuccess ? (docsRes.data?.documents ?? []) : []

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) =>
      [n.title, n.content].some((x) => x.toLowerCase().includes(q)),
    )
  }, [notes, search])

  const resetForm = () => {
    setEditing(null)
    setTitle("")
    setContent("")
    setDocumentId(fromDocumentId ?? "")
  }

  const openCreate = () => {
    resetForm()
    setIsOpen(true)
  }

  const openEdit = (note: Note) => {
    setEditing(note)
    setTitle(note.title)
    setContent(note.content)
    setDocumentId(note.documentId)
    setIsOpen(true)
  }

  const onSubmit = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề")
      return
    }
    if (!documentId) {
      toast.error("Vui lòng chọn tài liệu")
      return
    }

    try {
      if (editing) {
        await updateNote.mutateAsync({
          id: editing.id,
          payload: { title: title.trim(), content },
        })
        toast.success("Cập nhật ghi chú thành công")
      } else {
        await createNote.mutateAsync({
          title: title.trim(),
          content,
          documentId,
        })
        toast.success("Tạo ghi chú thành công")
      }
      setIsOpen(false)
      resetForm()
    } catch (e) {
      const msg = isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error ?? e.message
        : "Thao tác thất bại"
      toast.error(msg)
    }
  }

  const onDelete = async (id: string) => {
    try {
      await deleteNote.mutateAsync(id)
      toast.success("Đã xóa ghi chú")
    } catch (e) {
      const msg = isAxiosError(e)
        ? (e.response?.data as { error?: string })?.error ?? e.message
        : "Xóa ghi chú thất bại"
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Ghi chú cá nhân
          </h1>
          <p className="mt-1 text-muted-foreground">
            Lưu trữ và quản lý các kiến thức quan trọng.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="size-4" />
          Thêm ghi chú
        </Button>
      </div>

      <div className="max-w-md">
        <InputGroup>
          <InputGroupAddon>
            <Search className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Tìm kiếm ghi chú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription className="flex items-center gap-3">
            Không tải được danh sách ghi chú.
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-5 w-24" />
              </CardContent>
            </Card>
          ))}

        {!isLoading && filteredNotes.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed py-16 text-center text-muted-foreground">
            Chưa có ghi chú nào
          </div>
        )}

        {filteredNotes.map((note) => (
          <Card
            key={note.id}
            className="flex flex-col transition-shadow hover:shadow-md"
          >
            <CardContent className="flex flex-1 flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 text-lg font-semibold text-foreground">
                  {note.title}
                </h3>
                <div className="flex shrink-0 gap-0.5">
                  <Button variant="ghost" size="icon-xs" type="button" onClick={() => openEdit(note)}>
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    type="button"
                    onClick={() => onDelete(note.id)}
                    disabled={deleteNote.isPending}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                {note.content}
              </p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Tag className="size-3" />
                    {documents.find((d) => d.id === note.documentId)?.title ?? "Tài liệu"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa ghi chú" : "Tạo ghi chú mới"}</DialogTitle>
            <DialogDescription>
              Ghi chú được gắn với một tài liệu cụ thể.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Field>
              <FieldLabel>Tiêu đề</FieldLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <Field>
              <FieldLabel>Tài liệu</FieldLabel>
              <Select
                value={documentId}
                onValueChange={setDocumentId}
                disabled={!!editing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tài liệu" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Nội dung</FieldLabel>
              <Textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={onSubmit}
                disabled={createNote.isPending || updateNote.isPending}
              >
                {editing ? "Lưu thay đổi" : "Tạo ghi chú"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
