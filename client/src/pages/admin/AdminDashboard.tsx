import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getDashboard } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Newspaper,
  Calendar,
  ClipboardCheck,
  MessageSquare,
  Users,
  Plus,
  TrendingUp,
} from 'lucide-react';

interface DashboardData {
  totalNews: number;
  totalEvents: number;
  pendingRegistrations: number;
  totalMessages: number;
  totalMembers: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi<DashboardData>(getDashboard, true);

  const statCards = [
    {
      label: '新闻总数',
      value: data?.totalNews ?? 0,
      icon: Newspaper,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: '赛事总数',
      value: data?.totalEvents ?? 0,
      icon: Calendar,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: '待审核报名',
      value: data?.pendingRegistrations ?? 0,
      icon: ClipboardCheck,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: '注册用户',
      value: data?.totalUsers ?? 0,
      icon: Users,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
        <div className="p-8 text-center">
          <div className="text-red-500 mb-2">加载失败</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">仪表盘</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            欢迎使用智赛宏芯社管理后台
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/members')}
        >
          <ClipboardCheck className="w-4 h-4" />
          成员管理
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Card key={stat.label} className="p-5">
            {loading ? (
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          快捷操作
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm" onClick={() => navigate('/admin/news')}>
            <Plus className="w-4 h-4" />
            发布新闻
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin/events')}>
            <Plus className="w-4 h-4" />
            创建赛事
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">最近报名</h3>
            </div>
            <button
              onClick={() => navigate('/admin/members')}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              查看全部
            </button>
          </div>
          <div className="p-8 text-center text-gray-400 text-sm">
            请前往"报名审核"页面查看
          </div>
        </Card>

        {/* Recent Messages */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">快捷入口</h3>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <button onClick={() => navigate('/admin/news')} className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">新闻管理</span>
              <p className="text-xs text-gray-400 mt-0.5">发布和管理社团新闻动态</p>
            </button>
            <button onClick={() => navigate('/admin/events')} className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">赛事管理</span>
              <p className="text-xs text-gray-400 mt-0.5">创建和管理赛事活动</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}