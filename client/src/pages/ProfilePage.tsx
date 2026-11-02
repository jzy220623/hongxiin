import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { getUserProfile, updateUserProfile, changePassword, uploadAvatar, getRegistrationStatus } from '../api';
import AvatarCropper from '../components/common/AvatarCropper';
import {
  User,
  Save,
  Key,
  LogOut,
  Mail,
  Phone,
  School,
  GraduationCap,
  Hash,
  Calendar,
  Shield,
  Camera,
  X,
  Eye,
  EyeOff,
  Edit3,
  Check,
  Clock,
  Cpu,
  MessageSquare,
  Award,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

const inputClass =
  'w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-brand-muted outline-none transition-all';

const cardClass = 'glass-light rounded-2xl overflow-hidden';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Inline editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    grade: '',
    security_question: '',
    security_answer: '',
  });

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar crop
  const [cropperFile, setCropperFile] = useState<File | null>(null);

  // Registration status
  const [registrationStatus, setRegistrationStatus] = useState<{
    id: number;
    status: string;
    name: string;
    student_id: string;
    department: string;
    major: string;
    class_name: string;
    created_at: string;
  } | null | undefined>(undefined);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Always fetch from server to ensure avatar (not in localStorage) is loaded
    fetchProfile();
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      updateUser(res.data);
      setForm({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        department: res.data.department || '',
        grade: res.data.grade || '',
        security_question: res.data.security_question || '',
        security_answer: '',
      });
    } catch {
      logout();
      navigate('/login');
    }
  };

  const fetchRegistrationStatus = async () => {
    try {
      const res = await getRegistrationStatus();
      setRegistrationStatus(res.data.registration);
    } catch {
      setRegistrationStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrationStatus();
    }
  }, [isAuthenticated]);

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
    setError('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = async () => {
    if (!editingField) return;
    setLoading(true);
    setError('');
    try {
      const updateData = { [editingField]: editValue };
      // When editing security_question, explicitly exclude security_answer to avoid overwriting
      const res = await updateUserProfile(updateData);
      updateUser(res.data.user);
      setForm({ ...form, [editingField]: editValue });
      setEditingField(null);
      setSuccessMsg('更新成功');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '更新失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    // Show cropper, let user adjust before uploading
    setCropperFile(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropperFile(null);
    setAvatarUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.jpg');
    try {
      const res = await uploadAvatar(formData);
      updateUser(res.data.user);
      setSuccessMsg('头像上传成功');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '上传失败';
      setError(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordError('请填写完整');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码至少6位');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次密码不一致');
      return;
    }
    setPasswordLoading(true);
    setPasswordError('');
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setShowPasswordForm(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMsg('密码修改成功');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '修改失败';
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero Banner */}
      <div className="relative pt-8 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary-500/3 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <Cpu className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">个人中心</h1>
              <p className="text-brand-muted text-sm mt-0.5">管理你的账户信息与安全设置</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 -mt-8">
        {/* Success Toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-4"
            >
              <div className="p-3 bg-green-400/10 border border-green-400/20 rounded-lg text-green-400 text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {successMsg}
                </span>
                <button onClick={() => setSuccessMsg('')} className="hover:text-green-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-4"
            >
              <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ========== LEFT SIDEBAR ========== */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="space-y-4 sticky top-24">
              {/* Avatar Card */}
              <div className={cardClass}>
                <div className="relative h-20 bg-gradient-to-br from-primary-500/20 to-primary-500/5" />
                <div className="px-5 pb-5 -mt-10 text-center">
                  {/* Avatar */}
                  <label className="relative cursor-pointer group inline-block">
                    <div className="w-20 h-20 rounded-full ring-4 ring-brand-dark bg-primary-500/10 flex items-center justify-center text-primary-500 text-2xl font-bold overflow-hidden mx-auto">
                      {user.avatar ? (
                        <img
                          src={user.avatar || undefined}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (user.name || user.username).charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/60 flex items-center justify-center transition-all duration-300">
                      <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={avatarUploading}
                    />
                    {avatarUploading && (
                      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      </div>
                    )}
                  </label>

                  <h2 className="mt-3 text-lg font-bold text-white">
                    {user.name || user.username}
                  </h2>
                  <p className="text-brand-muted text-sm">@{user.username}</p>

                  {/* Stats */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-brand-muted">
                      <Calendar className="w-3.5 h-3.5 text-primary-500" />
                      <span>{formatDate(user.created_at)} 加入</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <div className="text-primary-500 text-sm font-bold">
                        <MessageSquare className="w-3.5 h-3.5 inline" />
                      </div>
                      <div className="text-brand-muted text-[10px] mt-0.5">留言互动</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <div className="text-primary-500 text-sm font-bold">
                        <Award className="w-3.5 h-3.5 inline" />
                      </div>
                      <div className="text-brand-muted text-[10px] mt-0.5">赛事参与</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <div className="text-primary-500 text-sm font-bold">
                        <Clock className="w-3.5 h-3.5 inline" />
                      </div>
                      <div className="text-brand-muted text-[10px] mt-0.5">活跃天数</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-400/10 text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </motion.div>

          {/* ========== RIGHT CONTENT ========== */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* ===== Registration Status Card ===== */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={cardClass}
            >
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary-500" />
                <h3 className="font-semibold text-white text-sm">报名审核进度</h3>
              </div>
              <div className="p-5">
                {loadingStatus ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full" />
                  </div>
                ) : !registrationStatus ? (
                  /* 未报名 */
                  <div className="text-center py-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-3">
                      <ClipboardList className="w-6 h-6 text-brand-muted" />
                    </div>
                    <p className="text-brand-muted text-sm mb-3">你还没有提交报名申请</p>
                    <Link
                      to="/join"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
                    >
                      前往报名
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  /* 已报名 - 显示审核进度 */
                  <div>
                    {/* Steps */}
                    <div className="flex items-center justify-between mb-6">
                      {/* Step 1: 已报名 */}
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-xs text-green-400 font-medium">已报名</span>
                        <span className="text-[10px] text-brand-muted mt-0.5">
                          {formatDate(registrationStatus.created_at)}
                        </span>
                      </div>

                      {/* Connector 1 */}
                      <div className={`h-0.5 flex-1 mx-2 rounded ${
                        registrationStatus.status === 'approved' || registrationStatus.status === 'rejected'
                          ? 'bg-green-500/30'
                          : 'bg-white/10'
                      }`} />

                      {/* Step 2: 审核中 */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                          registrationStatus.status === 'pending'
                            ? 'bg-amber-500/20 ring-2 ring-amber-500/50'
                            : registrationStatus.status === 'approved'
                              ? 'bg-green-500/20'
                              : 'bg-red-500/20'
                        }`}>
                          {registrationStatus.status === 'pending' ? (
                            <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                          ) : registrationStatus.status === 'approved' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <span className={`text-xs font-medium ${
                          registrationStatus.status === 'pending'
                            ? 'text-amber-400'
                            : 'text-green-400'
                        }`}>
                          {registrationStatus.status === 'pending' ? '审核中' : '已审核'}
                        </span>
                        <span className="text-[10px] text-brand-muted mt-0.5">
                          {registrationStatus.status === 'pending' ? '请耐心等待' : ''}
                        </span>
                      </div>

                      {/* Connector 2 */}
                      <div className={`h-0.5 flex-1 mx-2 rounded ${
                        registrationStatus.status === 'approved'
                          ? 'bg-green-500/30'
                          : registrationStatus.status === 'rejected'
                            ? 'bg-red-500/30'
                            : 'bg-white/10'
                      }`} />

                      {/* Step 3: 结果 */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                          registrationStatus.status === 'approved'
                            ? 'bg-green-500/20 ring-2 ring-green-500/50'
                            : registrationStatus.status === 'rejected'
                              ? 'bg-red-500/20 ring-2 ring-red-500/50'
                              : 'bg-white/5'
                        }`}>
                          {registrationStatus.status === 'approved' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : registrationStatus.status === 'rejected' ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-white/10" />
                          )}
                        </div>
                        <span className={`text-xs font-medium ${
                          registrationStatus.status === 'approved'
                            ? 'text-green-400'
                            : registrationStatus.status === 'rejected'
                              ? 'text-red-400'
                              : 'text-brand-muted'
                        }`}>
                          {registrationStatus.status === 'approved'
                            ? '已通过'
                            : registrationStatus.status === 'rejected'
                              ? '未通过'
                              : '待定'}
                        </span>
                        <span className="text-[10px] text-brand-muted mt-0.5">
                          {registrationStatus.status === 'pending' ? '等待审核结果' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl border ${
                      registrationStatus.status === 'pending'
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : registrationStatus.status === 'approved'
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-red-500/5 border-red-500/20'
                    }`}>
                      {registrationStatus.status === 'pending' && (
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-amber-400 font-medium text-sm">审核中</p>
                            <p className="text-brand-muted text-xs mt-1">
                              你的报名申请正在审核中，我们会尽快处理。请留意短信和邮件通知。
                            </p>
                          </div>
                        </div>
                      )}
                      {registrationStatus.status === 'approved' && (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-green-400 font-medium text-sm">审核通过</p>
                            <p className="text-brand-muted text-xs mt-1">
                              恭喜！你的报名申请已通过审核，欢迎加入智赛宏芯社！
                            </p>
                          </div>
                        </div>
                      )}
                      {registrationStatus.status === 'rejected' && (
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-red-400 font-medium text-sm">审核未通过</p>
                            <p className="text-brand-muted text-xs mt-1">
                              很遗憾，你的报名申请未通过审核。如有疑问请联系社团管理员。
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ===== Profile Info Card ===== */}
            <div className={cardClass}>
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-500" />
                <h3 className="font-semibold text-white text-sm">个人信息</h3>
              </div>

              <div className="p-5 space-y-1">
                {[
                  { key: 'name', icon: User, label: '姓名', value: form.name, placeholder: '真实姓名' },
                  { key: 'email', icon: Mail, label: '邮箱', value: form.email, placeholder: 'your@email.com' },
                  { key: 'phone', icon: Phone, label: '手机号', value: form.phone, placeholder: '手机号码' },
                  { key: 'department', icon: School, label: '院系', value: form.department, placeholder: '院系名称' },
                  { key: 'grade', icon: GraduationCap, label: '年级', value: form.grade, placeholder: '如：24级' },
                ].map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center group px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                  >
                    <field.icon className="w-4 h-4 text-brand-muted mr-3 shrink-0" />
                    <span className="text-xs text-brand-muted w-16 shrink-0">{field.label}</span>
                    <div className="flex-1 min-w-0">
                      {editingField === field.key ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 bg-brand-dark border border-primary-500/50 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-primary-500"
                            placeholder={field.placeholder}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveField();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button
                            onClick={saveField}
                            disabled={loading}
                            className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-white">
                          {field.value || <span className="text-brand-muted italic">未设置</span>}
                        </span>
                      )}
                    </div>
                    {editingField !== field.key && (
                      <button
                        onClick={() => startEdit(field.key, field.value)}
                        className="ml-2 p-1.5 rounded-lg text-brand-muted opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Student ID - read only */}
                <div className="flex items-center px-3 py-3 rounded-xl">
                  <Hash className="w-4 h-4 text-brand-muted mr-3 shrink-0" />
                  <span className="text-xs text-brand-muted w-16 shrink-0">学号</span>
                  <span className="text-sm text-white">
                    {user.student_id || <span className="text-brand-muted italic">未设置</span>}
                  </span>
                  <span className="ml-auto text-[10px] text-brand-muted bg-white/5 px-2 py-0.5 rounded">
                    只读
                  </span>
                </div>
              </div>
            </div>

            {/* ===== Security Question Card ===== */}
            <div className={cardClass}>
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-500" />
                <h3 className="font-semibold text-white text-sm">安全问题</h3>
                <span className="ml-auto text-[10px] text-brand-muted bg-white/5 px-2 py-0.5 rounded">
                  用于找回密码
                </span>
              </div>
              <div className="p-5 space-y-4">
                {/* Question */}
                <div className="flex items-center group px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <span className="text-xs text-brand-muted w-16 shrink-0">安全问题</span>
                  <div className="flex-1 min-w-0">
                    {editingField === 'security_question' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 bg-brand-dark border border-primary-500/50 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-primary-500"
                          placeholder="如：我的小学名称？"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveField();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <button
                          onClick={saveField}
                          disabled={loading}
                          className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-white">
                        {form.security_question || (
                          <span className="text-brand-muted italic">未设置</span>
                        )}
                      </span>
                    )}
                  </div>
                  {editingField !== 'security_question' && (
                    <button
                      onClick={() => startEdit('security_question', form.security_question)}
                      className="ml-2 p-1.5 rounded-lg text-brand-muted opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Answer */}
                <div className="flex items-center group px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <span className="text-xs text-brand-muted w-16 shrink-0">答案</span>
                  <div className="flex-1 min-w-0">
                    {editingField === 'security_answer' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 bg-brand-dark border border-primary-500/50 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-primary-500"
                          placeholder="输入答案"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveField();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <button
                          onClick={saveField}
                          disabled={loading}
                          className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-brand-muted">已加密存储，点击编辑可修改</span>
                    )}
                  </div>
                  {editingField !== 'security_answer' && (
                    <button
                      onClick={() => startEdit('security_answer', '')}
                      className="ml-2 p-1.5 rounded-lg text-brand-muted opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ===== Password Card ===== */}
            <div className={cardClass}>
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary-500" />
                  <h3 className="font-semibold text-white text-sm">修改密码</h3>
                </div>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary-500 hover:bg-primary-500/10 transition-colors"
                  >
                    修改密码
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showPasswordForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5">
                      {passwordError && (
                        <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-red-400 text-sm">
                          {passwordError}
                        </div>
                      )}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-brand-muted mb-2">旧密码</label>
                          <div className="relative">
                            <input
                              type={showOldPassword ? 'text' : 'password'}
                              value={passwordForm.oldPassword}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                              }
                              className={inputClass + ' pr-10'}
                              placeholder="输入当前密码"
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-light transition-colors"
                            >
                              {showOldPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-brand-muted mb-2">新密码</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                              }
                              className={inputClass + ' pr-10'}
                              placeholder="至少6位字符"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-light transition-colors"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-brand-muted mb-2">确认新密码</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                            }
                            className={inputClass}
                            placeholder="再次输入新密码"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordError('');
                              setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-brand-light hover:text-white hover:bg-white/5 transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleChangePassword}
                            disabled={passwordLoading}
                            className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors disabled:opacity-50"
                          >
                            {passwordLoading ? '修改中...' : '确认修改'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Avatar Cropper Modal */}
        <AnimatePresence>
          {cropperFile && (
            <AvatarCropper
              file={cropperFile}
              onConfirm={handleCropConfirm}
              onCancel={() => setCropperFile(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}