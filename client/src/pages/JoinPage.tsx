import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  GraduationCap,
  Cpu,
  Monitor,
  Trophy,
  Send,
  CheckCircle,
  AlertCircle,
  LogIn,
  User,
} from 'lucide-react';
import { submitJoin } from '../api';
import { useUserStore } from '../store/userStore';
import Button from '../components/ui/Button';

interface JoinFormData {
  name: string;
  nickname: string;
  student_id: string;
  phone: string;
  email: string;
  department: string;
  major: string;
  class_name: string;
  advisor: string;
  grade: string;
  self_intro: string;
  interests: string;
}

const initialForm: JoinFormData = {
  name: '',
  nickname: '',
  student_id: '',
  phone: '',
  email: '',
  department: '',
  major: '',
  class_name: '',
  advisor: '',
  grade: '',
  self_intro: '',
  interests: '',
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.38, 0, 0, 1] },
  }),
};

const benefits = [
  {
    icon: GraduationCap,
    title: '专业指导',
    desc: '由经验丰富的指导教师和学长学姐提供系统性的技术培训与学习引导，帮助你快速掌握芯片设计核心技能。',
  },
  {
    icon: Monitor,
    title: '设备资源',
    desc: '拥有完善的EDA工具链、FPGA开发板、测试仪器等专业设备，为项目实践和竞赛备赛提供坚实基础。',
  },
  {
    icon: Trophy,
    title: '竞赛机会',
    desc: '组织参加集成电路设计、FPGA创新、嵌入式系统等多项国家级A类赛事，提供全程备赛支持与团队协作平台。',
  },
];

const inputClasses =
  'w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-brand-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors text-sm';

const labelClasses = 'block text-sm font-medium text-brand-light mb-2';

export default function JoinPage() {
  const { isAuthenticated, user } = useUserStore();
  const [form, setForm] = useState<JoinFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill form from logged-in user profile
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        student_id: user.student_id || prev.student_id,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        department: user.department || prev.department,
        grade: user.grade || prev.grade,
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'student_id') {
      // Auto-derive grade from student_id (first 2 digits)
      const sid = value.trim();
      const derivedGrade = sid.length >= 2 && /^\d{2}/.test(sid)
        ? sid.substring(0, 2) + '级'
        : '';
      setForm((prev) => ({ ...prev, student_id: value, grade: derivedGrade }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const canSubmit = () => {
    return form.name && form.student_id && form.phone && form.email &&
      form.department && form.major && form.class_name && form.advisor &&
      form.self_intro && form.interests;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { ...form };
      // Link to user account if authenticated
      if (isAuthenticated && user) {
        payload.user_id = user.id;
      }
      await submitJoin(payload);
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Failed to submit join form:', err);
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '提交失败，请稍后重试';
      setError(msg);
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
            <UserPlus className="w-8 h-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-title text-white mb-4"
          >
            加入我们
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-brand-light max-w-2xl mx-auto"
          >
            成为智赛宏芯社的一员，开启芯片科技之旅
          </motion.p>
        </div>
      </section>

      {/* ===== Benefits Section ===== */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <div className="section-divider mb-6" />
            <h2 className="section-title text-white mb-3">为什么选择我们</h2>
            <p className="text-brand-muted max-w-xl mx-auto">
              加入智赛宏芯社，你将获得全方位的成长支持
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                className="glass-light rounded-3xl p-8 text-center card-hover group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Form Section ===== */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <div className="section-divider mb-6" />
            <h2 className="section-title text-white mb-3">报名表单</h2>
            <p className="text-brand-muted">填写以下信息，加入智赛宏芯社</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-light rounded-3xl p-8 md:p-10"
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">报名成功！</h3>
                <p className="text-brand-muted max-w-md mx-auto leading-relaxed">
                  感谢你的报名！我们会尽快审核并通知你后续安排，请留意短信和邮件通知。
                </p>
              </motion.div>
            ) : !isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-500/10 flex items-center justify-center mb-6">
                  <User className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">请先注册账号</h3>
                <p className="text-brand-muted max-w-md mx-auto mb-6">
                  报名加入社团需要先注册平台账号，注册后你的基本信息将自动填入报名表。
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    to="/register"
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-500 transition-colors"
                  >
                    立即注册
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-2.5 border border-white/10 text-white rounded-full font-medium hover:bg-white/5 transition-colors"
                  >
                    已有账号？登录
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Logged in indicator */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-sm">
                  <LogIn className="w-4 h-4 text-primary-500" />
                  <span className="text-brand-light">已登录：</span>
                  <span className="text-white font-medium">{user?.name || user?.username}</span>
                  <span className="text-brand-muted text-xs ml-auto">基本信息已自动填入</span>
                </div>

                {/* Row: 姓名 + 昵称 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClasses}>姓名 *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="请输入姓名"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>昵称</label>
                    <input
                      name="nickname"
                      value={form.nickname}
                      onChange={handleChange}
                      placeholder="请输入昵称"
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Row: 学号 */}
                <div>
                  <label className={labelClasses}>学号 *</label>
                  <input
                    name="student_id"
                    value={form.student_id}
                    onChange={handleChange}
                    required
                    placeholder="请输入学号"
                    className={inputClasses}
                  />
                </div>

                {/* Row: 手机号 + 邮箱 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClasses}>手机号 *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="请输入手机号"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>邮箱 *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="请输入邮箱"
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Row: 学院 + 专业 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClasses}>学院 *</label>
                    <input
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      placeholder="请输入学院"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>专业 *</label>
                    <input
                      name="major"
                      value={form.major}
                      onChange={handleChange}
                      required
                      placeholder="请输入专业"
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Row: 班级 + 导员 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClasses}>班级 *</label>
                    <input
                      name="class_name"
                      value={form.class_name}
                      onChange={handleChange}
                      required
                      placeholder="请输入班级"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>导员 *</label>
                    <input
                      name="advisor"
                      value={form.advisor}
                      onChange={handleChange}
                      required
                      placeholder="请输入辅导员姓名"
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Row: 年级（自动推导） */}
                <div>
                  <label className={labelClasses}>年级</label>
                  <input
                    name="grade"
                    value={form.grade}
                    readOnly
                    className={`${inputClasses} bg-white/5 text-brand-muted cursor-default`}
                    placeholder="输入学号后自动推导"
                  />
                </div>

                {/* 自我介绍 */}
                <div>
                  <label className={labelClasses}>自我介绍 *</label>
                  <textarea
                    name="self_intro"
                    value={form.self_intro}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="请简单介绍一下自己，让我们更好地了解你"
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                {/* 兴趣点 */}
                <div>
                  <label className={labelClasses}>兴趣点 *</label>
                  <textarea
                    name="interests"
                    value={form.interests}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="请描述你的兴趣爱好，如：嵌入式开发、FPGA、模拟IC设计等"
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  disabled={!canSubmit()}
                  className="w-full bg-primary-600 text-white rounded-full px-6 py-3 font-medium hover:bg-primary-500 transition-colors"
                >
                  <Send className="w-4 h-4" /> 提交报名
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}