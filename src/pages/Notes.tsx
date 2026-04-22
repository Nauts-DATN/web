import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Plus, Search, Tag, Trash2, Edit2 } from "lucide-react"

const MOCK_NOTES = [
  {
    id: "1",
    title: "Các thuật toán sắp xếp",
    content:
      "Quick sort O(n log n), Merge sort O(n log n), Bubble sort O(n^2)...",
    tags: ["Cấu trúc dữ liệu"],
    date: "2023-10-12",
  },
  {
    id: "2",
    title: "React Hooks cơ bản",
    content:
      "useState để quản lý state, useEffect để xử lý side effects, useContext để truyền data...",
    tags: ["React", "Frontend"],
    date: "2023-10-15",
  },
]

export function Notes() {
  const [search, setSearch] = useState("")

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
        <Button className="gap-2">
          <Plus className="size-4" />
          Tạo ghi chú mới
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_NOTES.map((note) => (
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
                  <Button variant="ghost" size="icon-xs" type="button">
                    <Edit2 className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" type="button">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                {note.content}
              </p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      <Tag className="size-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{note.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
