import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { adminLogin } from '../../api';
import { LogIn, User, Lock, Cpu } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const usernameError = touched.username && !username.trim() ? '请输入用户名' : '';
  const passwordError = touched.password && !password.trim() ? '请输入密码' : '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setTouched({ username: true, password: true });
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin({ username: username.trim(), password });
      login(res.data.token);
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '登录失败，请检查用户名和密码';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.38, 0, 0, 1] }}
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-6">
              <Cpu className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">智赛宏芯社</h1>
            <p className="text-brand-muted mt-2 text-sm">管理后台</p>
          </div>

          {/* Login Card */}
          <div className="glass-light rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">管理员登录</h2>
                <p className="text-xs text-brand-muted">请输入您的账号信息</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-brand-light mb-1.5">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-brand-muted" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (e.target.value.trim()) setError('');
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, username: true }))}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark border focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm placeholder:text-brand-muted text-white ${
                      usernameError ? 'border-red-400/50' : 'border-white/10'
                    }`}
                    placeholder="请输入用户名"
                    autoComplete="username"
                  />
                </div>
                {usernameError && (
                  <p className="mt-1 text-xs text-red-400">{usernameError}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-brand-light mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-brand-muted" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value.trim()) setError('');
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark border focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm placeholder:text-brand-muted text-white ${
                      passwordError ? 'border-red-400/50' : 'border-white/10'
                    }`}
                    placeholder="请输入密码"
                    autoComplete="current-password"
                  />
                </div>
                {passwordError && (
                  <p className="mt-1 text-xs text-red-400">{passwordError}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading}
                className="w-full mt-2 rounded-full"
              >
                登录
              </Button>
            </form>
          </div>

          <p className="text-center text-brand-muted text-xs mt-6">
            &copy; {new Date().getFullYear()} 智赛宏芯社 · 版权所有
          </p>
        </motion.div>
      </div>
    </div>
  );
}