import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LayoutDashboard, FileText, PenTool, CheckSquare, TrendingUp, User, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';

export function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tài liệu', href: '/documents', icon: FileText },
    { name: 'Ghi chú', href: '/notes', icon: PenTool },
    { name: 'Luyện tập', href: '/quiz', icon: CheckSquare },
    { name: 'Tiến độ', href: '/progress', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 fixed inset-y-0 z-10">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">EduAI</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className={cn('mr-3 h-5 w-5', isActive ? 'text-blue-700' : 'text-gray-400')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/profile"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            <User className="mr-3 h-5 w-5 text-gray-400" />
            Hồ sơ
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 mt-1 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
        <div className="flex items-center">
          <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">EduAI</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-gray-800 bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-16 left-0 bottom-0 w-64 bg-white flex flex-col" onClick={e => e.stopPropagation()}>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className={cn('mr-3 h-5 w-5', isActive ? 'text-blue-700' : 'text-gray-400')} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <User className="mr-3 h-5 w-5 text-gray-400" />
                Hồ sơ
              </Link>
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center px-3 py-2 mt-1 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
              >
                <LogOut className="mr-3 h-5 w-5 text-red-500" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
