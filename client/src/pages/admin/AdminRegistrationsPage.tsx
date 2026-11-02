import { useState, useEffect, useCallback } from 'react';
import { getRegistrations, updateRegistration } from '../../api';
import Button from '../../components/ui/Button';
import {
  Check,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface RegistrationItem {
  id: number;
  name: string;
  student_id: string;
  phone: string;
  email: string;
  department: string;
  grade: string;
  registration_type: string;
  status: string;
  reason: string;
  event_title?: string;
  created_at: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const PAGE_SIZE = 10;

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = {
        page,
        pageSize: PAGE_SIZE,
      };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await getRegistrations(params);
      const data = res.data;
      if (Array.isArray(data)) {
        setRegistrations(data);
        setTotal(data.length);
      } else if (data && data.list) {
        setRegistrations(data.list);
        setTotal(data.total || 0);
        if (typeof data.pendingCount === 'number') {
          setPendingCount(data.pendingCount);
        }
      } else {
        setRegistrations([]);
        setTotal(0);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '加载失败';
      setError(msg);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      await updateRegistration(id, { status });
      setSuccessMsg(status === 'approved' ? '已通过审核' : '已拒绝申请');
      fetchRegistrations();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '操作失败';
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            已通过
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            已拒绝
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            待审核
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'event' ? '赛事报名' : '入社申请';
  };

  const filterTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待审核' },
    { value: 'approved', label: '已通过' },
    { value: 'rejected', label: '已拒绝' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Success Message */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-green-400 hover:text-green-600">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">报名审核</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            待审核 {pendingCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Refresh */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="搜索姓名或学号..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={fetchRegistrations}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  ID
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  姓名
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  学号
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  电话
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  邮箱
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  院系
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  年级
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  类型
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  状态
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  时间
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-5 py-16 text-center">
                    <div className="text-gray-400 text-sm">暂无报名记录</div>
                  </td>
                </tr>
              ) : (
                registrations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      #{item.id}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {item.student_id || '-'}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {item.phone || '-'}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs max-w-[120px] truncate">
                      {item.email || '-'}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {item.department || '-'}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {item.grade || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {getTypeLabel(item.registration_type)}
                      </span>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(item.id, 'approved')}
                              disabled={updatingId === item.id}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(item.id, 'rejected')}
                              disabled={updatingId === item.id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedId(expandedId === item.id ? null : item.id)
                          }
                        >
                          {expandedId === item.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Expanded details */}
        {expandedId && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            {(() => {
              const item = registrations.find((r) => r.id === expandedId);
              if (!item) return null;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">姓名：</span>
                    <span className="text-gray-900 dark:text-white font-medium">{item.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">学号：</span>
                    <span className="text-gray-900 dark:text-white">{item.student_id || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">电话：</span>
                    <span className="text-gray-900 dark:text-white">{item.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">邮箱：</span>
                    <span className="text-gray-900 dark:text-white">{item.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">院系：</span>
                    <span className="text-gray-900 dark:text-white">{item.department || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">年级：</span>
                    <span className="text-gray-900 dark:text-white">{item.grade || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">报名类型：</span>
                    <span className="text-gray-900 dark:text-white">{getTypeLabel(item.registration_type)}</span>
                  </div>
                  {item.event_title && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">关联赛事：</span>
                      <span className="text-gray-900 dark:text-white">{item.event_title}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">状态：</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <span className="text-gray-500 dark:text-gray-400">申请理由：</span>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {item.reason || '无'}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              共 {total} 条，第 {page}/{totalPages} 页
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-2">{page}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}