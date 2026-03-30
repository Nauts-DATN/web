import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(name, email, password);
      toast.success('Đăng ký thành công!');
    } catch (error) {
      toast.error('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Input
        label="Họ và tên"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nguyễn Văn A"
      />
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <Input
        label="Mật khẩu"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Đăng ký
      </Button>

      <div className="text-sm text-center">
        <span className="text-gray-500">Đã có tài khoản? </span>
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
}
