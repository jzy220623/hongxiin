import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userRegister } from '../api';
import { useUserStore } from '../store/userStore';
import { Cpu, Eye, EyeOff, UserPlus, Shield } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated } = useUserStore();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    student_id: '',
    phone: '',
    department: '',
    grade: '',
    security_question: '',
    security_answer: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear any stale user data when entering register page
  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, []);

  const update = (key: string, value: string) => {
    if (key === 'student_id') {
      const sid = value.trim();
      const derivedGrade = sid.length >= 2 && /^\d{2}/.test(sid)
        ? sid.substring(0, 2) + '级'
        : '';
      setForm({ ...form, student_id: value, grade: derivedGrade });
    } else {
      setForm({ ...form, [key]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('用户名和密码为必填项');
      return;
    }
    if (form.password.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await userRegister({
        username: form.username.trim(),
        password: form.password,
        name: form.name.trim(),
        email: form.email.trim(),
        student_id: form.student_id.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        grade: form.grade.trim(),
        security_question: form.security_question.trim(),
        security_answer: form.security_answer.trim(),
      });
      login(res.data.token, res.data.user);
      navigate('/profile');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '注册失败，请重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-brand-muted outline-none transition-all";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-brand-dark px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 mb-4"
          >
            <Cpu className="w-8 h-8 text-primary-500" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white"
          >
            智赛宏芯社
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-brand-light text-sm mt-1"
          >
            用户注册
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass-light rounded-3xl p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">用户名 *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  className={inputClass}
                  placeholder="登录用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">姓名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className={inputClass}
                  placeholder="真实姓名"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-light mb-2">邮箱</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">密码 *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className={inputClass + " pr-11"}
                    placeholder="至少6位"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-light transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">确认密码 *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  className={inputClass}
                  placeholder="再次输入密码"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">学号</label>
                <input
                  type="text"
                  value={form.student_id}
                  onChange={(e) => update('student_id', e.target.value)}
                  className={inputClass}
                  placeholder="学号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">年级</label>
                <input
                  type="text"
                  value={form.grade}
                  onChange={(e) => update('grade', e.target.value)}
                  className={inputClass}
                  placeholder="输入学号后自动推导"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">院系</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => update('department', e.target.value)}
                  className={inputClass}
                  placeholder="如：电子信息工程"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">手机号</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={inputClass}
                  placeholder="手机号码"
                />
              </div>
            </div>

            {/* Security Question */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-brand-muted mb-3 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                安全问题（用于找回密码，建议设置）
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">安全问题</label>
                  <input
                    type="text"
                    value={form.security_question}
                    onChange={(e) => update('security_question', e.target.value)}
                    className={inputClass}
                    placeholder="如：我的小学名称？"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">答案</label>
                  <input
                    type="text"
                    value={form.security_answer}
                    onChange={(e) => update('security_answer', e.target.value)}
                    className={inputClass}
                    placeholder="答案"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white rounded-full px-6 py-3 font-medium hover:bg-primary-500 transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-brand-muted">
            已有账号？
            <Link to="/login" className="text-primary-500 hover:text-primary-400 ml-1 transition-colors">
              立即登录
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}