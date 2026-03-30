import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { FileText, CheckSquare, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { title: 'Tổng tài liệu', value: '12', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Quiz đã làm', value: '24', icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Điểm trung bình', value: '8.5', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Giờ học tuần này', value: '14h', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chào mừng trở lại, {user?.name}! 👋</h1>
        <p className="text-gray-500 mt-1">Dưới đây là tổng quan về tiến độ học tập của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ khóa học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Nhập môn Trí tuệ nhân tạo</span>
                <span className="text-gray-500">75%</span>
              </div>
              <ProgressBar value={75} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Cấu trúc dữ liệu & Giải thuật</span>
                <span className="text-gray-500">40%</span>
              </div>
              <ProgressBar value={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Lập trình Web Frontend</span>
                <span className="text-gray-500">90%</span>
              </div>
              <ProgressBar value={90} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gợi ý học tập từ AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-1">Ôn tập Cấu trúc dữ liệu</h4>
                <p className="text-sm text-blue-700">Bạn có điểm số khá thấp ở phần Cây nhị phân. Hãy xem lại tài liệu và làm thêm 2 bài quiz nhé.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-medium text-green-900 mb-1">Tiếp tục phát huy!</h4>
                <p className="text-sm text-green-700">Bạn đã duy trì chuỗi học tập 5 ngày liên tiếp. Hôm nay hãy đọc thêm 1 chương tài liệu mới.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
