import { useState, useEffect, useCallback } from 'react';
import { getMessages, replyMessage, deleteMessage, batchDeleteMessages } from '../../api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Trash2,
  Reply,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Square,
  CheckSquare,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface MessageItem {
  id: number;
  nickname: string;
  content: string;
  reply: string | null;
  created_at: string;
}

const PAGE_SIZE = 10;

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

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
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map(m => m.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 条留言吗？此操作不可撤销。`)) return;
    setBatchDeleting(true);
    try {
      await batchDeleteMessages([...selectedIds]);
      setSuccessMsg(`已删除 ${selectedIds.size} 条留言`);
      setSelectedIds(new Set());
      fetchMessages();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '批量删除失败';
      alert(msg);
    } finally {
      setBatchDeleting(false);
    }
  };

  // Reply modal
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<MessageItem | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySaving, setReplySaving] = useState(false);
  const [replyError, setReplyError] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = {
        page,
        pageSize: PAGE_SIZE,
      };
      if (search) params.search = search;

      const res = await getMessages(params);
      const data = res.data;
      if (data && data.list) {
        setMessages(data.list);
        setTotal(data.total || 0);
      } else {
        setMessages([]);
        setTotal(0);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '加载失败';
      setError(msg);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Open reply modal
  const openReply = (msg: MessageItem) => {
    setReplyTarget(msg);
    setReplyContent(msg.reply || '');
    setReplyError('');
    setReplyModalOpen(true);
  };

  // Submit reply
  const handleReply = async () => {
    if (!replyContent.trim()) {
      setReplyError('回复内容不能为空');
      return;
    }
    if (!replyTarget) return;

    setReplySaving(true);
    setReplyError('');
    try {
      await replyMessage(replyTarget.id, { reply: replyContent.trim() });
      setReplyModalOpen(false);
      setSuccessMsg('回复成功');
      fetchMessages();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '回复失败';
      setReplyError(msg);
    } finally {
      setReplySaving(false);
    }
  };

  // Delete message
  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这条留言吗？')) return;
    try {
      await deleteMessage(id);
      setSuccessMsg('留言已删除');
      fetchMessages();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '删除失败';
      alert(msg);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Success Message */}
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
            <MessageSquare className="w-6 h-6" />
            留言管理
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">管理用户留言，回复或删除不当内容</p>
        </div>
      </div>

      {/* Search & Refresh */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="搜索昵称或留言内容..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={fetchMessages}>
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
          <span>已选择 <strong>{selectedIds.size}</strong> 条</span>
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={handleBatchDelete} loading={batchDeleting}>
              <Trash2 className="w-3.5 h-3.5" />
              批量删除
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>取消选择</Button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length > 0 && !loading && (
          <div className="flex items-center gap-2">
            <button onClick={toggleSelectAll} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              {selectedIds.size === messages.length ? (
                <CheckSquare className="w-4 h-4 text-primary-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              全选
            </button>
          </div>
        )}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-24" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-32 ml-auto" />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
            </div>
          ))
        ) : messages.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            暂无留言数据
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Main message */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox */}
                    <button onClick={() => toggleSelect(msg.id)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0">
                      {selectedIds.has(msg.id) ? (
                        <CheckSquare className="w-4 h-4 text-primary-500" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-bold flex-shrink-0">
                      {msg.nickname.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {msg.nickname}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openReply(msg)}
                    >
                      <Reply className="w-4 h-4" />
                      {msg.reply ? '编辑回复' : '回复'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(msg.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reply section */}
              {msg.reply && (
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/10">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0">
                      管
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">管理员回复</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words">
                        {msg.reply}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
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

      {/* Reply Modal */}
      <Modal
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        title={replyTarget?.reply ? '编辑回复' : '回复留言'}
      >
        <div className="space-y-4">
          {replyError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {replyError}
            </div>
          )}

          {/* Original message preview */}
          {replyTarget && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">来自：</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{replyTarget.nickname}</span>
                <span className="text-xs text-gray-400">{formatDate(replyTarget.created_at)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
                {replyTarget.content}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              回复内容 *
            </label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              placeholder="输入回复内容..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setReplyModalOpen(false)}>
              <X className="w-4 h-4" />
              取消
            </Button>
            <Button variant="primary" onClick={handleReply} loading={replySaving}>
              <Send className="w-4 h-4" />
              发送回复
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}