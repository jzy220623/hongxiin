import { useState, useEffect, useCallback } from 'react';
import {
  getHonorWallAdmin,
  createHonorMember,
  updateHonorMember,
  deleteHonorMember,
  batchDeleteHonorMembers,
  importHonorMembers,
  batchSortHonorMembers,
} from '../../api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import {
  Award,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  X,
  Upload,
  Save,
  Star,
  Cpu,
  Zap,
  GraduationCap,
  Users,
  GripVertical,
  Square,
  CheckSquare,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

// ==================== Types ====================

interface HonorMember {
  id: number;
  name: string;
  avatar: string;
  cohort: string;
  role: string;
  member_type: string;
  achievements: string;
  full_achievements: string[];
  projects: string[];
  message: string;
  destination: string;
  sort_order: number;
  created_at: string;
}

const PAGE_SIZE = 15;

// ==================== Component ====================

export default function AdminHonorWallPage() {
  const [members, setMembers] = useState<HonorMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<HonorMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form
  const [form, setForm] = useState({
    name: '', cohort: '', role: '', member_type: 'tech',
    achievements: '', message: '', destination: '', sort_order: 0,
  });
  const [fullAchievements, setFullAchievements] = useState('');
  const [projects, setProjects] = useState('');

  // Import
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; total: number } | null>(null);

  const [successMsg, setSuccessMsg] = useState('');
  const [sortMode, setSortMode] = useState(false);

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
    if (selectedIds.size === members.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map(m => m.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 位成员吗？此操作不可撤销。`)) return;
    setBatchDeleting(true);
    try {
      await batchDeleteHonorMembers([...selectedIds]);
      setSuccessMsg(`已删除 ${selectedIds.size} 位成员`);
      setSelectedIds(new Set());
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '批量删除失败';
      alert(msg);
    } finally {
      setBatchDeleting(false);
    }
  };

  // ==================== Fetch ====================

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getHonorWallAdmin({ page, pageSize: PAGE_SIZE, search });
      setMembers(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '加载失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ==================== CRUD ====================

  const openCreateModal = () => {
    setEditingMember(null);
    setForm({ name: '', cohort: '', role: '', member_type: 'tech', achievements: '', message: '', destination: '', sort_order: 0 });
    setFullAchievements('');
    setProjects('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (member: HonorMember) => {
    setEditingMember(member);
    setForm({
      name: member.name, cohort: member.cohort, role: member.role || '',
      member_type: member.member_type || 'tech', achievements: member.achievements || '',
      message: member.message || '', destination: member.destination || '',
      sort_order: member.sort_order || 0,
    });
    setFullAchievements(Array.isArray(member.full_achievements) ? member.full_achievements.join('\n') : '');
    setProjects(Array.isArray(member.projects) ? member.projects.join('\n') : '');
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('请输入姓名'); return; }
    if (!form.cohort.trim()) { setFormError('请输入届数'); return; }
    setSaving(true);
    setFormError('');
    try {
      const data = {
        ...form,
        full_achievements: fullAchievements.split('\n').filter(Boolean),
        projects: projects.split('\n').filter(Boolean),
      };
      if (editingMember) {
        await updateHonorMember(editingMember.id, data);
        setSuccessMsg('更新成功');
      } else {
        await createHonorMember(data);
        setSuccessMsg('添加成功');
      }
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '保存失败';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定删除该成员吗？')) return;
    try {
      await deleteHonorMember(id);
      setSuccessMsg('删除成功');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || '删除失败');
    }
  };

  // ==================== Import ====================

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setImporting(true);
    setImportResult(null);
    try {
      const res = await importHonorMembers(fd);
      setImportResult(res.data);
      setSuccessMsg('导入完成');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '导入失败';
      setError(msg);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // ==================== Sort ====================

  const handleSortSave = async () => {
    const items = members.map((m, i) => ({ id: m.id, sort_order: i }));
    try {
      await batchSortHonorMembers(items);
      setSortMode(false);
      setSuccessMsg('排序已保存');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || '排序失败');
    }
  };

  const moveMember = (idx: number, direction: 'up' | 'down') => {
    const newMembers = [...members];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newMembers.length) return;
    [newMembers[idx], newMembers[targetIdx]] = [newMembers[targetIdx], newMembers[idx]];
    setMembers(newMembers);
  };

  // ==================== Helpers ====================

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = { founder: '创始人', competition: '竞赛领军者', tech: '技术骨干' };
    return map[type] || type;
  };

  const getTypeBadge = (type: string) => {
    const base = 'px-2 py-0.5 text-xs rounded-full border';
    switch (type) {
      case 'founder': return <span className={`${base} bg-amber-500/10 text-amber-400 border-amber-500/20`}><Star className="w-3 h-3 inline mr-1" />创始人</span>;
      case 'competition': return <span className={`${base} bg-blue-500/10 text-blue-400 border-blue-500/20`}><Zap className="w-3 h-3 inline mr-1" />竞赛领军者</span>;
      case 'tech': return <span className={`${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}><Cpu className="w-3 h-3 inline mr-1" />技术骨干</span>;
      default: return <span className={`${base} bg-gray-500/10 text-gray-400 border-gray-500/20`}>{type}</span>;
    }
  };

  // ==================== Render ====================

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Success */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-green-400 hover:text-green-600">&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6" />
            荣誉墙管理
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">管理历届突出成员信息</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative cursor-pointer">
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="absolute inset-0 opacity-0 w-0 h-0" disabled={importing} />
            <Button variant="outline" size="sm" disabled={importing}>
              <Upload className="w-4 h-4" />
              {importing ? '导入中...' : '批量导入'}
            </Button>
          </label>
          {sortMode ? (
            <Button variant="primary" size="sm" onClick={handleSortSave}>
              <Save className="w-4 h-4" /> 保存排序
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setSortMode(true)}>
              <GripVertical className="w-4 h-4" /> 调序模式
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4" /> 添加成员
          </Button>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm flex items-center gap-2">
          <span>导入完成：成功 {importResult.imported} 条，跳过 {importResult.skipped} 条</span>
          <button onClick={() => setImportResult(null)} className="ml-auto text-blue-400 hover:text-blue-600">&times;</button>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="搜索姓名或届数..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder:text-gray-400"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      {/* Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm flex items-center justify-between">
          <span>已选择 <strong>{selectedIds.size}</strong> 位</span>
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
                    {selectedIds.size === members.length && members.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary-500" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                {sortMode && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-10">#</th>}
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">姓名</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">届数</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">类型</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">身份</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">核心成就</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">毕业去向</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">创建时间</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: sortMode ? 11 : 10 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={sortMode ? 11 : 10} className="px-5 py-16 text-center">
                    <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-400 text-sm">暂无荣誉墙数据</div>
                  </td>
                </tr>
              ) : (
                members.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-3 py-4">
                      <button onClick={() => toggleSelect(m.id)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        {selectedIds.has(m.id) ? (
                          <CheckSquare className="w-4 h-4 text-primary-500" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    {sortMode && (
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400 w-5">{idx + 1}</span>
                          <div className="flex flex-col gap-0.5">
                            <button onClick={() => moveMember(idx, 'up')} disabled={idx === 0} className="text-gray-400 hover:text-white disabled:opacity-30">
                              <ChevronLeft className="w-3 h-3 rotate-90" />
                            </button>
                            <button onClick={() => moveMember(idx, 'down')} disabled={idx === members.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30">
                              <ChevronRight className="w-3 h-3 rotate-90" />
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{m.name}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-gray-900 dark:text-white">
                        <GraduationCap className="w-3.5 h-3.5 text-primary-500" />
                        {m.cohort}届
                      </span>
                    </td>
                    <td className="px-5 py-4">{getTypeBadge(m.member_type)}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs max-w-[150px] truncate">{m.role || '-'}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs max-w-[200px] truncate">{m.achievements || '-'}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs max-w-[150px] truncate">{m.destination || '-'}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{formatDate(m.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditModal(m)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            <span className="text-xs text-gray-500 dark:text-gray-400">共 {total} 条，第 {page}/{totalPages} 页</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-2">{page}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingMember ? '编辑成员' : '添加成员'} size="lg">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{formError}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名 *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">届数 *</label>
              <input type="text" value={form.cohort} onChange={e => setForm({ ...form, cohort: e.target.value })} placeholder="如：2025" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">在校身份</label>
              <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="如：社长 / 创始人" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">成员类型</label>
              <select value={form.member_type} onChange={e => setForm({ ...form, member_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer">
                <option value="founder">创始人</option>
                <option value="competition">竞赛领军者</option>
                <option value="tech">技术骨干</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">毕业去向</label>
              <input type="text" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="如：保送清华读博" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">排序</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">核心成就（用 | 分隔，卡片展示用）</label>
            <textarea value={form.achievements} onChange={e => setForm({ ...form, achievements: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="如：全国大学生电子设计竞赛国家一等奖 | 主持RISC-V SoC芯片设计项目" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">完整获奖列表（每行一条）</label>
            <textarea value={fullAchievements} onChange={e => setFullAchievements(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="每行一条获奖记录" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">项目经历（每行一条）</label>
            <textarea value={projects} onChange={e => setProjects(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="每行一条项目经历" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">个人寄语</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="个人寄语，展示在详情弹窗中" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              <X className="w-4 h-4" /> 取消
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4" /> 保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}