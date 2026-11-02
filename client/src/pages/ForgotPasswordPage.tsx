import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPassword, verifyAnswer, resetPassword } from '../api';
import { Cpu, Key, ArrowRight, CheckCircle, Shield, ArrowLeft } from 'lucide-react';

type Step = 'username' | 'question' | 'reset' | 'done';

const steps: { key: Step; label: string }[] = [
  { key: 'username', label: '验证身份' },
  { key: 'question', label: '回答问题' },
  { key: 'reset', label: '重置密码' },
];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('username');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGetQuestion = async () => {
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await forgotPassword({ username: username.trim() });
      setSecurityQuestion(res.data.security_question);
      setStep('question');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '操作失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async () => {
    if (!answer.trim()) {
      setError('请输入答案');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await verifyAnswer({ username: username.trim(), answer: answer.trim() });
      setResetToken(res.data.resetToken);
      setStep('reset');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '验证失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('新密码至少6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword({ resetToken, newPassword });
      setStep('done');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '重置失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toLogin = () => navigate('/login');

  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const inputClass = "w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-brand-muted outline-none transition-all";

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-brand-dark px-4">
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
            找回密码
          </motion.p>
        </div>

        {/* Steps indicator */}
        {step !== 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-0 mb-6"
          >
            {steps.map((s, i) => {
              const isActive = step === s.key;
              const isCompleted = currentStepIndex > i;
              return (
                <div key={s.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                          : isCompleted
                          ? 'bg-primary-500/20 text-primary-500'
                          : 'bg-white/5 text-brand-muted'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 whitespace-nowrap ${
                        isActive ? 'text-primary-500' : isCompleted ? 'text-brand-light' : 'text-brand-muted'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-10 h-0.5 mx-1 mb-5 rounded-full transition-colors duration-300 ${
                        isCompleted ? 'bg-primary-500/50' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

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

          <AnimatePresence mode="wait" custom={currentStepIndex}>
            {/* Step 1: Username */}
            {step === 'username' && (
              <motion.div
                key="username"
                custom={currentStepIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">用户名</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleGetQuestion()}
                    className={inputClass}
                    placeholder="请输入注册用户名"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGetQuestion}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white rounded-full px-6 py-3 font-medium hover:bg-primary-500 transition-colors disabled:opacity-50"
                >
                  {loading ? '验证中...' : '下一步'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Answer */}
            {step === 'question' && (
              <motion.div
                key="question"
                custom={currentStepIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="p-4 bg-brand-dark rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary-500" />
                    <span className="text-xs font-medium text-brand-muted">安全问题</span>
                  </div>
                  <p className="text-sm font-medium text-white">{securityQuestion}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">答案</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => { setAnswer(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyAnswer()}
                    className={inputClass}
                    placeholder="请输入您的答案"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep('username'); setError(''); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-full text-brand-light hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyAnswer}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white rounded-full px-6 py-3 font-medium hover:bg-primary-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? '验证中...' : '验证答案'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Reset password */}
            {step === 'reset' && (
              <motion.div
                key="reset"
                custom={currentStepIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">新密码</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                      className={inputClass + " pr-11"}
                      placeholder="至少6位"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-light transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">确认新密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    className={inputClass}
                    placeholder="再次输入新密码"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep('question'); setError(''); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-full text-brand-light hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white rounded-full px-6 py-3 font-medium hover:bg-primary-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? '重置中...' : '重置密码'}
                    <Key className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Done */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-400/10 mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">密码重置成功</h3>
                <p className="text-sm text-brand-light mb-6">
                  请使用新密码登录您的账号
                </p>
                <button
                  type="button"
                  onClick={toLogin}
                  className="w-full bg-primary-600 text-white rounded-full px-6 py-3 font-medium hover:bg-primary-500 transition-colors"
                >
                  返回登录
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Back to login */}
        {step !== 'done' && (
          <div className="mt-6 text-center text-sm text-brand-muted">
            <Link to="/login" className="text-primary-500 hover:text-primary-400 transition-colors">
              返回登录
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}