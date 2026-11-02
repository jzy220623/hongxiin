import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Users,
  MessageSquare,
  Award,
  LogOut,
  Cpu,
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { to: '/admin/news', label: '新闻管理', icon: Newspaper },
  { to: '/admin/events', label: '赛事管理', icon: Calendar },
  { to: '/admin/members', label: '成员管理', icon: Users },
  { to: '/admin/messages', label: '留言管理', icon: MessageSquare },
  { to: '/admin/honor-wall', label: '荣誉墙', icon: Award },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
        : 'text-brand-muted hover:text-white hover:bg-white/5'
    }`;

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-brand-darker text-white flex flex-col z-40 border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5">
        <Cpu className="w-7 h-7 text-primary-500" />
        <div>
          <span className="text-base font-bold">智赛宏芯社</span>
          <p className="text-xs text-brand-muted">管理后台</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/admin'}>
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-brand-muted hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </div>
    </aside>
  );
}