import { useState, useEffect, useCallback, FormEvent } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent, batchDeleteEvents, uploadImage } from '../../api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image,
  Square,
  CheckSquare,
} from 'lucide-react';
import { formatDate, getEventStatusLabel, getEventStatusColor, getEventTypeLabel } from '../../utils/helpers';

interface EventItem {
  id: number;
  title: string;
  type: string;
  status: string;
  description: string;
  cover_image: string;
  start_date: string;
  end_date: string;
  location: string;
  schedule: string;
  registration_open: boolean;
  max_participants: number;
  created_at: string;
}

interface EventFormData {
  title: string;
  type: string;
  status: string;
  description: string;
  cover_image: string;
  start_date: string;
  end_date: string;
  location: string;
  schedule: string;
  registration_open: boolean;
  max_participants: number;
}

const emptyForm: EventFormData = {
  title: '',
  type: 'chip_design',
  status: 'upcoming',
  description: '',
  cover_image: '',
  start_date: '',
  end_date: '',
  location: '',
  schedule: '',
  registration_open: false,
  max_participants: 0,
};

const eventTypes = [
  { value: 'chip_design', label: '芯片设计' },
  { value: 'sci_tech', label: '科技创新' },
  { value: 'training', label: '技能培训' },
];

const eventStatuses = [
  { value: 'upcoming', label: '即将开始' },
  { value: 'open', label: '报名中' },
  { value: 'ongoing', label: '进行中' },
  { value: 'ended', label: '已结束' },
];

const PAGE_SIZE = 10;

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EventFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map(e => e.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 个活动吗？此操作不可撤销。`)) return;
    setBatchDeleting(true);
    try {
      await batchDeleteEvents([...selectedIds]);
      setSuccessMsg(`已删除 ${selectedIds.size} 个活动`);
      setSelectedIds(new Set());
      fetchEvents();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '批量删除失败';
      alert(msg);
    } finally {
      setBatchDeleting(false);
    }
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEvents({
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      const data = res.data;
      if (Array.isArray(data)) {
        setEvents(data);
        setTotal(data.length);
      } else if (data && data.list) {
        setEvents(data.list);
        setTotal(data.total || 0);
      } else {
        setEvents([]);
        setTotal(0);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '加载失败';
      setError(msg);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (item: EventItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      type: item.type || 'chip_design',
      status: item.status || 'upcoming',
      description: item.description || '',
      cover_image: item.cover_image || '',
      start_date: item.start_date
        ? new Date(item.start_date).toISOString().slice(0, 16)
        : '',
      end_date: item.end_date
        ? new Date(item.end_date).toISOString().slice(0, 16)
        : '',
      location: item.location || '',
      schedule: item.schedule || '',
      registration_open: item.registration_open || false,
      max_participants: item.max_participants || 0,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadImage(formData);
      setForm((p) => ({ ...p, cover_image: res.data.url }));
      setSuccessMsg('图片上传成功');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch {
      setFormError('图片上传失败');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('请输入赛事标题');
      return;
    }
    if (!form.start_date) {
      setFormError('请选择开始日期');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        type: form.type,
        status: form.status,
        description: form.description.trim(),
        cover_image: form.cover_image.trim(),
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        location: form.location.trim(),
        schedule: form.schedule.trim(),
        registration_open: form.registration_open,
        max_participants: form.max_participants,
      };

      if (editingId) {
        await updateEvent(editingId, payload);
        setSuccessMsg('赛事更新成功');
      } else {
        await createEvent(payload);
        setSuccessMsg('赛事创建成功');
      }

      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchEvents();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '保存失败';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteConfirm.id);
      setSuccessMsg('赛事已删除');
      setDeleteConfirm(null);
      fetchEvents();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '删除失败';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleRegistration = async (item: EventItem) => {
    try {
      await updateEvent(item.id, { registration_open: !item.registration_open });
      setSuccessMsg(
        item.registration_open ? '已关闭报名' : '已开启报名'
      );
      fetchEvents();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '操作失败';
      setError(msg);
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">赛事管理</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">管理社团赛事活动</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          创建赛事
        </Button>
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
            placeholder="搜索赛事标题..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={fetchEvents}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm flex items-center justify-between">
          <span>已选择 <strong>{selectedIds.size}</strong> 个</span>
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={handleBatchDelete} loading={batchDeleting}>
              <Trash2 className="w-3.5 h-3.5" />
              批量删除
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>取消选择</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-3 py-3 w-10">
                  <button onClick={toggleSelectAll} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                    {selectedIds.size === events.length && events.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary-500" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  ID
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  标题
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  类型
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  状态
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  日期
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                  报名状态
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="text-gray-400 text-sm">暂无赛事</div>
                    <button
                      onClick={openCreateModal}
                      className="mt-2 text-primary-600 dark:text-primary-400 text-sm hover:underline"
                    >
                      创建第一个赛事
                    </button>
                  </td>
                </tr>
              ) : (
                events.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-3 py-4">
                      <button onClick={() => toggleSelect(item.id)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        {selectedIds.has(item.id) ? (
                          <CheckSquare className="w-4 h-4 text-primary-500" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      #{item.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white max-w-[180px] truncate">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {getEventTypeLabel(item.type)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getEventStatusColor(item.status)}`}
                      >
                        {getEventStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(item.start_date)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleRegistration(item)}
                        className="inline-flex items-center gap-1 text-xs"
                      >
                        {item.registration_open ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400">已开启</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">已关闭</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(item)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editingId ? '编辑赛事' : '创建赛事'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="请输入赛事标题"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                类型
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              >
                {eventTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                状态
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              >
                {eventStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              描述
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
              placeholder="简要描述赛事内容"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              封面图片
            </label>
            {form.cover_image && (
              <div className="mb-2">
                <img src={form.cover_image} alt="封面预览" className="w-full max-h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Upload className="w-4 h-4" />
                {uploadingImage ? '上传中...' : '本地上传'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              <span className="text-xs text-gray-400">或</span>
            </div>
            <input
              type="text"
              value={form.cover_image}
              onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="图片URL（上传后自动填充或手动输入）"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                开始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                结束日期
              </label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              地点
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="例如：教学楼A101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              赛程安排
            </label>
            <textarea
              value={form.schedule}
              onChange={(e) => setForm((p) => ({ ...p, schedule: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
              placeholder="详细赛程安排..."
            />
          </div>

          <div className="flex items-center gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.registration_open}
                onChange={(e) =>
                  setForm((p) => ({ ...p, registration_open: e.target.checked }))
                }
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">开放报名</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                最大参与人数
              </label>
              <input
                type="number"
                value={form.max_participants || ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    max_participants: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                min="0"
                placeholder="不限"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button type="submit" variant="primary" loading={saving} disabled={saving}>
              保存
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => !deleting && setDeleteConfirm(null)}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            确定要删除赛事「{deleteConfirm?.title}」吗？此操作不可撤销。
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}