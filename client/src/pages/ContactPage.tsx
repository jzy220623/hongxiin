import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Mail,
  Phone,
  MapPin,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { getMessages, createMessage } from '../api';
import { useUserStore } from '../store/userStore';
import Button from '../components/ui/Button';
import { formatDate } from '../utils/helpers';

interface MessageItem {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
  reply?: string;
  reply_at?: string;
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.38, 0, 0, 1] },
  }),
};

const inputClasses =
  'w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-brand-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors text-sm';

const labelClasses = 'block text-sm font-medium text-brand-light mb-2';

export default function ContactPage() {
  const { user, isAuthenticated } = useUserStore();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Auto-fill nickname from logged-in user
  useEffect(() => {
    if (isAuthenticated && user) {
      setNickname(user.name || user.username);
    }
  }, [isAuthenticated, user]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMessages({ page, pageSize });
      const data = res.data;
      setMessages(data?.list || data?.data || data || []);
      setTotalPages(
        data?.totalPages || data?.total_page || Math.ceil((data?.total || 0) / pageSize) || 1
      );
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('加载留言失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createMessage({ nickname: nickname.trim(), content: content.trim() });
      if (!isAuthenticated) {
        setNickname('');
      }
      setContent('');
      setPage(1);
      await fetchMessages();
    } catch (err) {
      console.error('Failed to create message:', err);
      setSubmitError('留言失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen">
      {/* ===== Hero Section ===== */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(230,168,23,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 mb-6"
          >
            <MessageSquare className="w-8 h-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-title text-white mb-4"
          >
            留言互动
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-brand-light max-w-2xl mx-auto"
          >
            留下你的想法，与社团成员交流
          </motion.p>
        </div>
      </section>

      {/* ===== Content Section ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-6">
                {/* Contact Info Card */}
                <div className="glass-light rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    联系方式
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-muted mb-0.5">电子邮箱</p>
                        <p className="text-sm font-medium text-white">zhisaihongxin@example.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-muted mb-0.5">联系电话</p>
                        <p className="text-sm font-medium text-white">025-12345678</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-muted mb-0.5">社团地址</p>
                        <p className="text-sm font-medium text-white">教学楼4N404</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Card */}
                <div className="glass-light rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">关注我们</h3>
                  <div className="space-y-2.5">
                    <a
                      href="#"
                      className="block text-sm text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      微信公众号：智赛宏芯社
                    </a>
                    <a
                      href="#"
                      className="block text-sm text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      QQ群：123456789
                    </a>
                    <a
                      href="#"
                      className="block text-sm text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      B站：智赛宏芯社官方
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Message Board */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Message Form */}
              <div className="glass-light rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary-500" />
                  发表留言
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {submitError}
                    </motion.div>
                  )}
                  <div>
                    <label className={labelClasses}>
                      <User className="w-3.5 h-3.5 inline mr-1.5" />
                      昵称 *
                      {isAuthenticated && (
                        <span className="text-xs text-primary-500 ml-1.5">(当前登录用户)</span>
                      )}
                    </label>
                    {isAuthenticated ? (
                      <input
                        value={nickname}
                        readOnly
                        className={`${inputClasses} bg-white/5 text-brand-muted cursor-default`}
                      />
                    ) : (
                      <input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                        maxLength={20}
                        placeholder="请输入你的昵称"
                        className={inputClasses}
                      />
                    )}
                  </div>
                  <div>
                    <label className={labelClasses}>
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                      留言内容 *
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows={4}
                      maxLength={500}
                      placeholder="请输入你想说的话..."
                      className={`${inputClasses} resize-none`}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={submitting}
                      disabled={!nickname.trim() || !content.trim()}
                    >
                      <Send className="w-4 h-4" /> 发布留言
                    </Button>
                  </div>
                </form>
              </div>

              {/* Message List */}
              <div className="glass-light rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    留言板
                    <span className="text-sm font-normal text-brand-muted">
                      ({messages.length} 条留言)
                    </span>
                  </h3>
                </div>

                {/* Messages */}
                {loading ? (
                  <div className="p-6 space-y-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-card flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-brand-card rounded w-1/4" />
                          <div className="h-4 bg-brand-card rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-brand-muted mx-auto mb-3" />
                    <p className="text-brand-muted mb-3">{error}</p>
                    <button
                      onClick={fetchMessages}
                      className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" /> 重新加载
                    </button>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={msg.id}
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUpVariant}
                        className="p-5"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {msg.nickname.slice(0, 1)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-semibold text-white">
                                {msg.nickname}
                              </span>
                              <span className="text-xs text-brand-muted">
                                {formatDate(msg.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-brand-light leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>

                            {/* Admin Reply */}
                            {msg.reply && (
                              <div className="mt-3 ml-2 pl-4 border-l-2 border-primary-500/30">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-primary-500">
                                    管理员回复
                                  </span>
                                  {msg.reply_at && (
                                    <span className="text-xs text-brand-muted">
                                      {formatDate(msg.reply_at)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                  {msg.reply}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-brand-muted mx-auto mb-3" />
                    <p className="text-brand-muted mb-1">暂无留言</p>
                    <p className="text-sm text-brand-muted/70">快来发表第一条留言吧</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 flex items-center justify-center gap-2 border-t border-white/5">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-card text-brand-light hover:bg-brand-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      上一页
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          page === p
                            ? 'bg-primary-600 text-white'
                            : 'bg-brand-card text-brand-light hover:bg-brand-border'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-card text-brand-light hover:bg-brand-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      下一页
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}