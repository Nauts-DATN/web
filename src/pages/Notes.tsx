import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Edit2,
  ExternalLink,
  FileText,
  Plus,
  Search,
  StickyNote,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { isAxiosError } from "axios"
import type { Note } from "@/types/db/note"
import type { Document as LearningDocument } from "@/types/db/document"
import { useDocuments } from "@/hooks/queries/document-hooks"
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from "@/hooks/queries/note-hooks"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

type DocumentNoteGroup = {
  documentId: string
  document?: LearningDocument
  notes: Note[]
  updatedAt: string
}

export function Notes() {
  const location = useLocation()
  const fromDocumentId = (location.state as { fromDocumentId?: string } | null)
    ?.fromDocumentId

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

  const groupedDocuments = useMemo<DocumentNoteGroup[]>(() => {
    const q = search.trim().toLowerCase()
    const documentsById = new Map(documents.map((doc) => [doc.id, doc]))
    const groups = new Map<string, DocumentNoteGroup>()

    for (const note of notes) {
      const document = documentsById.get(note.documentId)
      const haystack = [
        note.title,
        note.content,
        document?.title ?? "",
        document?.description ?? "",
      ]
        .join(" ")
        .toLowerCase()

      if (q && !haystack.includes(q)) continue

      const existing = groups.get(note.documentId)
      if (existing) {
        existing.notes.push(note)
        if (
          new Date(note.updatedAt).getTime() >
          new Date(existing.updatedAt).getTime()
        ) {
          existing.updatedAt = note.updatedAt
        }
      } else {
        groups.set(note.documentId, {
          documentId: note.documentId,
          document,
          notes: [note],
          updatedAt: note.updatedAt,
        })
      }
    }

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        notes: [...group.notes].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
  }, [documents, notes, search])

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
            Lưu trữ và quản lý các kiến thức quan trọng theo từng tài liệu.
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
            placeholder="Tìm kiếm tài liệu hoặc ghi chú..."
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

      <div className="space-y-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-28" />
              </CardContent>
            </Card>
          ))}

        {!isLoading && groupedDocuments.length === 0 && (
          <div className="rounded-xl border-2 border-dashed py-16 text-center text-muted-foreground">
            {search
              ? "Không tìm thấy tài liệu có ghi chú phù hợp."
              : "Chưa có tài liệu nào có ghi chú."}
          </div>
        )}

        {!isLoading && groupedDocuments.length > 0 && (
          <Accordion type="multiple" className="gap-4">
            {groupedDocuments.map((group) => {
              const docTitle = group.document?.title ?? "Tài liệu"

              return (
                <Card
                  key={group.documentId}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  <AccordionItem value={group.documentId} className="border-b-0">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline">
                      <div className="flex min-w-0 flex-1 items-start gap-4 pr-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <FileText className="size-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <h3 className="truncate text-base font-semibold text-foreground">
                            {docTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="gap-1">
                              <StickyNote className="size-3" />
                              {group.notes.length} ghi chú
                            </Badge>
                            <span>Cập nhật: {formatDate(group.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5">
                      <div className="space-y-3 border-t pt-4">
                        {group.document && (
                          <div className="flex justify-end ">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              asChild
                              
                            >
                              <Link to={`/documents/${group.documentId}`} style={{ textDecoration: "none" }}>
                                <ExternalLink className="size-4" />
                                Mở tài liệu
                              </Link>
                            </Button>
                          </div>
                        )}

                        {group.notes.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-lg border bg-background p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="line-clamp-1 font-semibold text-foreground">
                                  {note.title}
                                </h4>
                                
                              </div>
                              <div className="flex shrink-0 gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  type="button"
                                  onClick={() => openEdit(note)}
                                >
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
                            {note.content && (
                              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                {note.content}
                              </p>
                            )
                            }
                            <p className="mt-1 text-xs text-muted-foreground">
                                  {formatDate(note.updatedAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              )
            })}
          </Accordion>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Chỉnh sửa ghi chú" : "Tạo ghi chú mới"}
            </DialogTitle>
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
