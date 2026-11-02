import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { getEventDetail, submitRegistration } from '../api';
import { formatDate, getEventStatusColor, getEventStatusLabel, getEventTypeLabel } from '../utils/helpers';
import Button from '../components/ui/Button';

const DEFAULT_COVER_IMAGE = '/images/logo2.png';

const toAssetUrl = (value?: string) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return value.startsWith('/') ? value : `/${value}`;
};

interface EventDetail {
  id: number;
  title: string;
  description: string;
  cover_image?: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  location: string;
  schedule?: string;
  registration_open: boolean;
  max_participants?: number;
  current_participants?: number;
}

interface RegistrationForm {
  name: string;
  student_id: string;
  phone: string;
  email: string;
  department: string;
  grade: string;
  reason: string;
}

const initialForm: RegistrationForm = {
  name: '',
  student_id: '',
  phone: '',
  email: '',
  department: '',
  grade: '',
  reason: '',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegistrationForm, string>>>({});

  const fetchEvent = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getEventDetail(Number(id));
      setEvent(res.data);
    } catch (err) {
      console.error('Failed to fetch event detail:', err);
      setError('加载赛事详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const fieldName = e.target.name as keyof RegistrationForm;
    setForm((prev) => ({ ...prev, [fieldName]: e.target.value }));
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof RegistrationForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = '请输入姓名';
    if (!form.student_id.trim()) nextErrors.student_id = '请输入学号';
    if (!form.phone.trim()) nextErrors.phone = '请输入手机号';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = '邮箱格式不正确';
    }
    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !id) return;

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setSubmitError('请先补全报名信息后再提交');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});
    try {
      await submitRegistration({ event_id: Number(id), ...form });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit registration:', err);
      setSubmitError('提交报名失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => navigate('/events');

  const statusColor = event ? getEventStatusColor(event.status) : '';
  const statusLabel = event ? getEventStatusLabel(event.status) : '';
  const typeLabel = event ? getEventTypeLabel(event.type) : '';
  const heroCover = toAssetUrl(event?.cover_image) || DEFAULT_COVER_IMAGE;

  let scheduleItems: { time: string; title: string; description: string }[] = [];
  if (event?.schedule) {
    try {
      scheduleItems = JSON.parse(event.schedule);
    } catch {
      scheduleItems = [];
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="h-64 md:h-80 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{error}</p>
          <Button variant="primary" onClick={fetchEvent}>
            <RefreshCw className="w-4 h-4" /> 重试
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">赛事不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-gray-900" />
        <img
          src={heroCover}
          alt={event?.title || ''}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-circuit opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回赛事列表
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-3 mb-4"
          >
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
              {statusLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
              {typeLabel}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white"
          >
            {event.title}
          </motion.h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Info Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">活动时间</p>
                    <p className="text-sm font-medium">{formatDate(event.start_date)} ~ {formatDate(event.end_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">活动地点</p>
                    <p className="text-sm font-medium">{event.location}</p>
                  </div>
                </div>
                {event.max_participants && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 sm:col-span-2">
                    <Clock className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">报名人数</p>
                      <p className="text-sm font-medium">
                        {event.current_participants || 0} / {event.max_participants} 人
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-bold mb-4">赛事介绍</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </div>
              </motion.div>

              {/* Schedule */}
              {scheduleItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-xl font-bold mb-4">赛程安排</h2>
                  <div className="space-y-3">
                    {scheduleItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="w-10 h-10 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{item.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar: Registration */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-24"
              >
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">赛事报名</h3>

                  {!event.registration_open ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">报名已关闭</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">当前暂不接受报名</p>
                    </div>
                  ) : submitted ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3"
                      >
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                      <p className="text-green-600 dark:text-green-400 font-semibold text-lg">报名成功！</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">请留意后续通知</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {submitError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                          {submitError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1">姓名 *</label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleFormChange}
                          required
                          placeholder="请输入姓名"
                          aria-invalid={!!fieldErrors.name}
                          className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            fieldErrors.name
                              ? 'border-red-400 dark:border-red-500'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        />
                        {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">学号 *</label>
                        <input
                          name="student_id"
                          value={form.student_id}
                          onChange={handleFormChange}
                          required
                          placeholder="请输入学号"
                          aria-invalid={!!fieldErrors.student_id}
                          className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            fieldErrors.student_id
                              ? 'border-red-400 dark:border-red-500'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        />
                        {fieldErrors.student_id && (
                          <p className="mt-1 text-xs text-red-500">{fieldErrors.student_id}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">手机号 *</label>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleFormChange}
                          required
                          placeholder="请输入手机号"
                          aria-invalid={!!fieldErrors.phone}
                          className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            fieldErrors.phone
                              ? 'border-red-400 dark:border-red-500'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        />
                        {fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">邮箱</label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleFormChange}
                          placeholder="选填，便于接收通知"
                          aria-invalid={!!fieldErrors.email}
                          className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            fieldErrors.email
                              ? 'border-red-400 dark:border-red-500'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        />
                        {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">院系</label>
                        <input
                          name="department"
                          value={form.department}
                          onChange={handleFormChange}
                          placeholder="请输入院系名称"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">年级</label>
                        <select
                          name="grade"
                          value={form.grade}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">请选择年级</option>
                          <option value="大一">大一</option>
                          <option value="大二">大二</option>
                          <option value="大三">大三</option>
                          <option value="大四">大四</option>
                          <option value="研一">研一</option>
                          <option value="研二">研二</option>
                          <option value="研三">研三</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">报名理由</label>
                        <textarea
                          name="reason"
                          value={form.reason}
                          onChange={handleFormChange}
                          rows={3}
                          placeholder="简单说明你想参加这次活动的原因"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>
                      <Button type="submit" variant="primary" className="w-full" loading={submitting}>
                        <Send className="w-4 h-4" /> 提交报名
                      </Button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}