import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Mail, Camera } from 'lucide-react';
import { toast } from 'sonner';

export function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Cập nhật hồ sơ thành công!');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 mt-1">Quản lý thông tin tài khoản của bạn.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">JPG, GIF hoặc PNG. Tối đa 1MB.</p>
            </div>

            <form onSubmit={handleSave} className="flex-1 space-y-6 w-full">
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="Họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4 text-gray-400" />}
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4 text-gray-400" />}
                  disabled
                />
              </div>
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
          <form className="space-y-6 max-w-md">
            <Input label="Mật khẩu hiện tại" type="password" />
            <Input label="Mật khẩu mới" type="password" />
            <Input label="Xác nhận mật khẩu mới" type="password" />
            <Button variant="outline">Cập nhật mật khẩu</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
