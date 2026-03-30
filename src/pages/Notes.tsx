import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Search, Tag, Trash2, Edit2 } from 'lucide-react';

const MOCK_NOTES = [
  { id: '1', title: 'Các thuật toán sắp xếp', content: 'Quick sort O(n log n), Merge sort O(n log n), Bubble sort O(n^2)...', tags: ['Cấu trúc dữ liệu'], date: '2023-10-12' },
  { id: '2', title: 'React Hooks cơ bản', content: 'useState để quản lý state, useEffect để xử lý side effects, useContext để truyền data...', tags: ['React', 'Frontend'], date: '2023-10-15' },
];

export function Notes() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ghi chú cá nhân</h1>
          <p className="text-gray-500 mt-1">Lưu trữ và quản lý các kiến thức quan trọng.</p>
        </div>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Tạo ghi chú mới
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Tìm kiếm ghi chú..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_NOTES.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow flex flex-col">
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{note.title}</h3>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                {note.content}
              </p>
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {note.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">{note.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
