import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Upload, FileText, MoreVertical, Filter } from 'lucide-react';

const MOCK_DOCS = [
  { id: '1', title: 'Chương 1: Tổng quan về AI.pdf', subject: 'Trí tuệ nhân tạo', date: '2023-10-01', size: '2.4 MB' },
  { id: '2', title: 'Bài giảng ReactJS Cơ bản.docx', subject: 'Lập trình Web', date: '2023-10-05', size: '1.1 MB' },
  { id: '3', title: 'Tài liệu ôn tập Giải tích 1.pdf', subject: 'Toán cao cấp', date: '2023-10-10', size: '5.6 MB' },
];

export function Documents() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài liệu</h1>
          <p className="text-gray-500 mt-1">Tải lên và quản lý tài liệu học tập của bạn.</p>
        </div>
        <Button className="flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          Tải tài liệu lên
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Lọc
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DOCS.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">
                <Link to={`/documents/${doc.id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                  {doc.title}
                </Link>
                <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{doc.subject}</span>
                  <span>{doc.size}</span>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Đã tải lên: {doc.date}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
