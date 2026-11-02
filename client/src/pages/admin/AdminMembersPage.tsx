import { useState, useEffect, useCallback } from 'react';
import {
  getMembers,
  createCoreMember,
  updateCoreMember,
  deleteCoreMember,
  batchDeleteCoreMembers,
  getRegistrations,
  updateRegistration,
  batchUpdateRegistrationStatus,
  batchDeleteRegistrations,
  importMembers,
  exportMembers,
  getRegistrationFilters,
  getMemberAccount,
  createMemberAccount,
  getUsers,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  getClubMembers,
  updateClubMember,
  deleteClubMember,
  batchDeleteClubMembers,
  createClubMemberAccount,
  getClubMemberFilters,
} from '../../api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import {
  Users,
  UserCog,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
  Trash2,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  Filter,
  RotateCcw,
  UserPlus,
  Key,
  Shield,
  UserCheck,
  UserX,
  ClipboardList,
  Save,
  Eye,
  EyeOff,
  Square,
  CheckSquare,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

// ==================== Types ====================

interface CoreMember {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar: string;
  user_avatar?: string;
  user_name?: string;
  user_id?: number | null;
  bio: string;
  sort_order: number;
}

interface RegistrationItem {
  id: number;
  name: string;
  nickname: string;
  student_id: string;
  department: string;
  major: string;
  class_name: string;
  advisor: string;
  grade: string;
  status: string;
  phone: string;
  email: string;
  reason: string;
  interests: string;
  registration_type: string;
  event_title: string | null;
  created_at: string;
  user_id: number | null;
  account_username: string | null;
  account_user_id: number | null;
}

type TabType = 'registrations' | 'users' | 'club-members' | 'core';
type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

interface WebsiteUser {
  id: number;
  username: string;
  name: string;
  student_id: string;
  phone: string;
  email: string;
  department: string;
  grade: string;
  avatar: string;
  created_at: string;
}

interface ClubMemberItem {
  id: number;
  user_id: number | null;
  name: string;
  student_id: string;
  phone: string;
  email: string;
  department: string;
  grade: string;
  advisor: string;
  role: string;
  join_date: string;
  status: string;
  account_username: string | null;
  created_at: string;
}

const PAGE_SIZE = 10;

// ==================== Component ====================

export default function AdminMembersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('registrations');

  // Registrations state
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [errorAll, setErrorAll] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingRegId, setEditingRegId] = useState<number | null>(null);
  const [regEditForm, setRegEditForm] = useState<Record<string, string>>({});
  const [savingReg, setSavingReg] = useState(false);

  // Filter options
  const [departments, setDepartments] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);

  // Website users state
  const [websiteUsers, setWebsiteUsers] = useState<WebsiteUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<WebsiteUser | null>(null);
  const [userEditForm, setUserEditForm] = useState({
    username: '', name: '', student_id: '', phone: '', email: '',
    department: '', grade: '', new_password: '',
  });
  const [savingUser, setSavingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Club members state
  const [clubMembers, setClubMembers] = useState<ClubMemberItem[]>([]);
  const [loadingClubMembers, setLoadingClubMembers] = useState(false);
  const [errorClubMembers, setErrorClubMembers] = useState('');
  const [clubMemberSearch, setClubMemberSearch] = useState('');
  const [clubMemberPage, setClubMemberPage] = useState(1);
  const [clubMemberTotal, setClubMemberTotal] = useState(0);
  const [clubMemberDeptFilter, setClubMemberDeptFilter] = useState('');
  const [clubMemberGradeFilter, setClubMemberGradeFilter] = useState('');
  const [clubMemberDepts, setClubMemberDepts] = useState<string[]>([]);
  const [clubMemberGrades, setClubMemberGrades] = useState<string[]>([]);
  const [expandedClubMemberId, setExpandedClubMemberId] = useState<number | null>(null);
  const [editingClubMemberId, setEditingClubMemberId] = useState<number | null>(null);
  const [clubMemberEditForm, setClubMemberEditForm] = useState<Record<string, string>>({});
  const [savingClubMember, setSavingClubMember] = useState(false);
  const [showClubMemberPwd, setShowClubMemberPwd] = useState(false);
  const [clubMemberCreatingAccount, setClubMemberCreatingAccount] = useState<number | null>(null);

  // Registration password reset
  const [resetPwdRegId, setResetPwdRegId] = useState<number | null>(null);
  const [resetPwdValue, setResetPwdValue] = useState('');
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [resettingPwd, setResettingPwd] = useState(false);

  // Core members state
  const [coreMembers, setCoreMembers] = useState<CoreMember[]>([]);
  const [loadingCore, setLoadingCore] = useState(true);
  const [errorCore, setErrorCore] = useState('');

  // Core member modal
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<CoreMember | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', department: '', avatar: '', bio: '', sort_order: 0, user_id: null as number | null });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [approvedMembers, setApprovedMembers] = useState<RegistrationItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');

  const [successMsg, setSuccessMsg] = useState('');

  // Batch selection — per tab
  const [selectedRegIds, setSelectedRegIds] = useState<Set<number>>(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [selectedClubIds, setSelectedClubIds] = useState<Set<number>>(new Set());
  const [selectedCoreIds, setSelectedCoreIds] = useState<Set<number>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [batchApproving, setBatchApproving] = useState(false);

  // Generic batch handlers
  const toggleSelect = (id: number, getter: Set<number>, setter: React.Dispatch<React.SetStateAction<Set<number>>>) => {
    setter(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const toggleSelectAll = (items: { id: number }[], getter: Set<number>, setter: React.Dispatch<React.SetStateAction<Set<number>>>) => {
    if (getter.size === items.length) setter(new Set());
    else setter(new Set(items.map(i => i.id)));
  };

  // Batch approve registrations
  const handleBatchApprove = async () => {
    if (selectedRegIds.size === 0) return;
    if (!window.confirm(`确定要批量通过 ${selectedRegIds.size} 条报名申请吗？`)) return;
    setBatchApproving(true);
    try {
      await batchUpdateRegistrationStatus([...selectedRegIds], 'approved');
      setSuccessMsg(`已通过 ${selectedRegIds.size} 条报名`);
      setSelectedRegIds(new Set());
      fetchRegistrations();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '操作失败';
      alert(msg);
    } finally { setBatchApproving(false); }
  };

  // Batch reject registrations
  const handleBatchReject = async () => {
    if (selectedRegIds.size === 0) return;
    if (!window.confirm(`确定要批量拒绝 ${selectedRegIds.size} 条报名申请吗？`)) return;
    setBatchApproving(true);
    try {
      await batchUpdateRegistrationStatus([...selectedRegIds], 'rejected');
      setSuccessMsg(`已拒绝 ${selectedRegIds.size} 条报名`);
      setSelectedRegIds(new Set());
      fetchRegistrations();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '操作失败';
      alert(msg);
    } finally { setBatchApproving(false); }
  };

  // Batch delete (generic)
  const handleBatchDelete = async (
    ids: Set<number>,
    clearFn: () => void,
    deleteFn: (ids: number[]) => Promise<unknown>,
    successMsg: string,
    refreshFn: () => void,
  ) => {
    if (ids.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${ids.size} 条记录吗？此操作不可撤销。`)) return;
    setBatchDeleting(true);
    try {
      await deleteFn([...ids]);
      setSuccessMsg(successMsg);
      clearFn();
      refreshFn();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '批量删除失败';
      alert(msg);
    } finally { setBatchDeleting(false); }
  };

  // Import/Export state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; total: number } | null>(null);
  const [exporting, setExporting] = useState(false);

  // ==================== Fetch All Members ====================

  const fetchRegistrations = useCallback(async () => {
    setLoadingAll(true);
    setErrorAll('');
    try {
      const params: Record<string, unknown> = {
        page,
        pageSize: PAGE_SIZE,
      };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter) params.department = departmentFilter;
      if (gradeFilter) params.grade = gradeFilter;
      if (typeFilter) params.registration_type = typeFilter;

      const res = await getRegistrations(params);
      const data = res.data;
      if (data && data.list) {
        setRegistrations(data.list);
        setTotal(data.total || 0);
      } else {
        setRegistrations([]);
        setTotal(0);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '加载失败';
      setErrorAll(msg);
      setRegistrations([]);
    } finally {
      setLoadingAll(false);
    }
  }, [search, statusFilter, departmentFilter, gradeFilter, typeFilter, page]);

  useEffect(() => {
    if (activeTab === 'registrations') fetchRegistrations();
  }, [activeTab, fetchRegistrations]);

  // Fetch filter options
  useEffect(() => {
    if (activeTab === 'registrations') {
      getRegistrationFilters()
        .then((res) => {
          setDepartments(res.data.departments || []);
          setGrades(res.data.grades || []);
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDepartmentFilter('');
    setGradeFilter('');
    setTypeFilter('');
    setPage(1);
  };

  // ==================== Fetch Website Users ====================

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers('');
    try {
      const res = await getUsers({ page: userPage, pageSize: PAGE_SIZE, search: userSearch });
      const data = res.data;
      setWebsiteUsers(data.list || []);
      setUserTotal(data.total || 0);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '加载失败';
      setErrorUsers(msg);
      setWebsiteUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch, userPage]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchUsers]);

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('确定要删除该用户吗？此操作不可撤销。')) return;
    try {
      await deleteUser(id);
      setSuccessMsg('用户已删除');
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '删除失败';
      alert(msg);
    }
  };

  const openUserEdit = (user: WebsiteUser) => {
    setEditingUser(user);
    setExpandedUserId(user.id);
    setUserEditForm({
      username: user.username || '',
      name: user.name || '',
      student_id: user.student_id || '',
      phone: user.phone || '',
      email: user.email || '',
      department: user.department || '',
      grade: user.grade || '',
      new_password: '',
    });
    setShowPassword(false);
  };

  const cancelUserEdit = () => {
    setEditingUser(null);
    setExpandedUserId(null);
    setUserEditForm({
      username: '', name: '', student_id: '', phone: '', email: '',
      department: '', grade: '', new_password: '',
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const data: Record<string, unknown> = {
        username: userEditForm.username,
        name: userEditForm.name,
        student_id: userEditForm.student_id,
        phone: userEditForm.phone,
        email: userEditForm.email,
        department: userEditForm.department,
        grade: userEditForm.grade,
      };
      if (userEditForm.new_password) {
        data.new_password = userEditForm.new_password;
      }
      await updateUser(editingUser.id, data);
      setSuccessMsg('用户信息已更新');
      setEditingUser(null);
      setExpandedUserId(null);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '保存失败';
      alert(msg);
    } finally {
      setSavingUser(false);
    }
  };

  // ==================== Fetch Club Members ====================

  const fetchClubMembersData = useCallback(async () => {
    setLoadingClubMembers(true);
    setErrorClubMembers('');
    try {
      const params: Record<string, unknown> = {
        page: clubMemberPage,
        pageSize: PAGE_SIZE,
        search: clubMemberSearch,
      };
      if (clubMemberDeptFilter) params.department = clubMemberDeptFilter;
      if (clubMemberGradeFilter) params.grade = clubMemberGradeFilter;
      const res = await getClubMembers(params);
      const data = res.data;
      setClubMembers(data.list || []);
      setClubMemberTotal(data.total || 0);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '加载失败';
      setErrorClubMembers(msg);
      setClubMembers([]);
    } finally {
      setLoadingClubMembers(false);
    }
  }, [clubMemberSearch, clubMemberPage, clubMemberDeptFilter, clubMemberGradeFilter]);

  useEffect(() => {
    if (activeTab === 'club-members') fetchClubMembersData();
  }, [activeTab, fetchClubMembersData]);

  useEffect(() => {
    if (activeTab === 'club-members') {
      getClubMemberFilters()
        .then((res) => {
          setClubMemberDepts(res.data.departments || []);
          setClubMemberGrades(res.data.grades || []);
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const handleUpdateClubMember = async (id: number, data: Record<string, unknown>) => {
    try {
      await updateClubMember(id, data);
      setSuccessMsg('成员信息已更新');
      fetchClubMembersData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '更新失败';
      alert(msg);
    }
  };

  const handleDeleteClubMember = async (id: number) => {
    if (!window.confirm('确定要移除该成员吗？')) return;
    try {
      await deleteClubMember(id);
      setSuccessMsg('成员已移除');
      fetchClubMembersData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '删除失败';
      alert(msg);
    }
  };

  const openClubMemberEdit = (m: ClubMemberItem) => {
    setEditingClubMemberId(m.id);
    setExpandedClubMemberId(m.id);
    setClubMemberEditForm({
      name: m.name || '',
      student_id: m.student_id || '',
      phone: m.phone || '',
      email: m.email || '',
      department: m.department || '',
      grade: m.grade || '',
      advisor: m.advisor || '',
      role: m.role || '',
      status: m.status || '',
      new_password: '',
    });
    setShowClubMemberPwd(false);
  };

  const cancelClubMemberEdit = () => {
    setEditingClubMemberId(null);
    setExpandedClubMemberId(null);
    setClubMemberEditForm({});
    setShowClubMemberPwd(false);
  };

  const handleSaveClubMember = async (m: ClubMemberItem) => {
    setSavingClubMember(true);
    try {
      // Update member info
      const memberData: Record<string, unknown> = {
        name: clubMemberEditForm.name,
        student_id: clubMemberEditForm.student_id,
        phone: clubMemberEditForm.phone,
        email: clubMemberEditForm.email,
        department: clubMemberEditForm.department,
        grade: clubMemberEditForm.grade,
        advisor: clubMemberEditForm.advisor,
        role: clubMemberEditForm.role,
        status: clubMemberEditForm.status,
      };
      await updateClubMember(m.id, memberData);

      // Reset password if linked account and new password provided
      if (m.user_id && clubMemberEditForm.new_password) {
        await updateUser(m.user_id, { new_password: clubMemberEditForm.new_password });
      }

      setSuccessMsg('成员信息已更新');
      setEditingClubMemberId(null);
      setExpandedClubMemberId(null);
      fetchClubMembersData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '保存失败';
      alert(msg);
    } finally {
      setSavingClubMember(false);
    }
  };

  const handleCreateClubMemberAccount = async (m: ClubMemberItem) => {
    setClubMemberCreatingAccount(m.id);
    try {
      const res = await createClubMemberAccount(m.id);
      setSuccessMsg(
        `账号创建成功！用户名：${res.data.account.username}，默认密码：${res.data.defaultPassword}`
      );
      fetchClubMembersData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '创建账号失败';
      alert(msg);
    } finally {
      setClubMemberCreatingAccount(null);
    }
  };

  // Registration password reset
  const handleResetRegPassword = async (userId: number) => {
    if (!resetPwdValue.trim()) {
      alert('请输入新密码');
      return;
    }
    setResettingPwd(true);
    try {
      await updateUser(userId, { new_password: resetPwdValue });
      setSuccessMsg('密码已重置');
      setResetPwdRegId(null);
      setResetPwdValue('');
      setShowResetPwd(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '重置失败';
      alert(msg);
    } finally {
      setResettingPwd(false);
    }
  };

  // ==================== Fetch Core Members ====================

  const fetchCoreMembers = useCallback(async () => {
    setLoadingCore(true);
    setErrorCore('');
    try {
      const res = await getMembers();
      setCoreMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '加载失败';
      setErrorCore(msg);
      setCoreMembers([]);
    } finally {
      setLoadingCore(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'core') fetchCoreMembers();
  }, [activeTab, fetchCoreMembers]);

  // ==================== Status Update ====================

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await updateRegistration(id, { status: newStatus });
      setSuccessMsg(`成员状态已更新为"${getStatusLabel(newStatus)}"`);
      fetchRegistrations();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '操作失败';
      alert(msg);
    }
  };

  // ==================== Registration Edit ====================

  const startEditReg = (item: RegistrationItem) => {
    setEditingRegId(item.id);
    setRegEditForm({
      name: item.name || '',
      nickname: item.nickname || '',
      student_id: item.student_id || '',
      phone: item.phone || '',
      email: item.email || '',
      department: item.department || '',
      major: item.major || '',
      class_name: item.class_name || '',
      advisor: item.advisor || '',
      grade: item.grade || '',
      reason: item.reason || '',
      interests: item.interests || '',
    });
  };

  const cancelEditReg = () => {
    setEditingRegId(null);
    setRegEditForm({});
  };

  const handleSaveReg = async (id: number) => {
    setSavingReg(true);
    try {
      await updateRegistration(id, regEditForm);
      setSuccessMsg('信息已更新');
      setEditingRegId(null);
      setRegEditForm({});
      fetchRegistrations();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '保存失败';
      alert(msg);
    } finally {
      setSavingReg(false);
    }
  };

  // ==================== Account Management ====================

  const handleCreateAccount = async (id: number) => {
    try {
      const res = await createMemberAccount(id);
      setSuccessMsg(
        `账号创建成功！用户名：${res.data.account.username}，默认密码：${res.data.defaultPassword}`
      );
      fetchRegistrations();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '创建账号失败';
      alert(msg);
    }
  };

  // ==================== Core Member CRUD ====================

  const openCreateModal = async () => {
    setEditingMember(null);
    setFormData({ name: '', role: '', department: '', avatar: '', bio: '', sort_order: 0, user_id: null });
    setSelectedMemberId('');
    setFormError('');
    // Fetch approved members for selection
    try {
      const res = await getRegistrations({ status: 'approved', registration_type: 'join', pageSize: 1000 });
      setApprovedMembers(res.data.list || []);
    } catch {
      setApprovedMembers([]);
    }
    setShowModal(true);
  };

  const openEditModal = (member: CoreMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role || '',
      department: member.department || '',
      avatar: member.avatar || '',
      bio: member.bio || '',
      sort_order: member.sort_order || 0,
      user_id: member.user_id || null,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError('请选择社团成员');
      return;
    }
    if (!editingMember && !selectedMemberId) {
      setFormError('请选择社团成员');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingMember) {
        await updateCoreMember(editingMember.id, formData);
        setSuccessMsg('核心成员更新成功');
      } else {
        await createCoreMember(formData);
        setSuccessMsg('核心成员添加成功');
      }
      setShowModal(false);
      fetchCoreMembers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '保存失败';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该核心成员吗？')) return;
    try {
      await deleteCoreMember(id);
      setSuccessMsg('核心成员已删除');
      fetchCoreMembers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        '删除失败';
      alert(msg);
    }
  };

  // ==================== Import/Export ====================

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setImporting(true);
    setImportResult(null);
(some characters truncated)...
PAGE_SIZE));

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      approved: '已通过',
      pending: '待审核',
      rejected: '已拒绝',
      checked_in: '已签到',
    };
    return map[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const base = 'px-2 py-0.5 text-xs rounded-full';
    switch (status) {
      case 'approved':
        return <span className={`${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}>已通过</span>;
      case 'pending':
        return <span className={`${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`}>待审核</span>;
      case 'rejected':
        return <span className={`${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`}>已拒绝</span>;
      case 'checked_in':
        return <span className={`${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`}>已签到</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`}>{status}</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'join' ? '入社申请' : type === 'event' ? '活动报名' : type;
  };

  const statusFilterTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'approved', label: '已通过' },
    { value: 'pending', label: '待审核' },
    { value: 'rejected', label: '已拒绝' },
  ];

  // ==================== Render ====================

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
            <Users className="w-6 h-6" />
            成员管理
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">管理社团全部成员与核心成员</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Import */}
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="absolute inset-0 opacity-0 w-0 h-0"
              disabled={importing}
            />
            <Button variant="outline" size="sm" disabled={importing}>
              <Upload className="w-4 h-4" />
              {importing ? '导入中...' : '导入Excel'}
            </Button>
          </label>
          {/* Export */}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4" />
            {exporting ? '导出中...' : '导出Excel'}
          </Button>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          <span>导入完成：成功 {importResult.imported} 条，跳过 {importResult.skipped} 条</span>
          <button onClick={() => setImportResult(null)} className="ml-auto text-blue-400 hover:text-blue-600">&times;</button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit flex-wrap">
        <button
          onClick={() => { setActiveTab('registrations'); setPage(1); setExpandedId(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-colors ${
            activeTab === 'registrations'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          报名管理
        </button>
        <button
          onClick={() => { setActiveTab('users'); setUserPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          网站用户
        </button>
        <button
          onClick={() => { setActiveTab('club-members'); setClubMemberPage(1); setExpandedClubMemberId(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-colors ${
            activeTab === 'club-members'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Users className="w-4 h-4" />
          社团成员
        </button>
        <button
          onClick={() => setActiveTab('core')}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-colors ${
            activeTab === 'core'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <UserCog className="w-4 h-4" />
          核心成员
        </button>
      </div>

      {/* ==================== REGISTRATIONS TAB ==================== */}
      {activeTab === 'registrations' && (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
            {statusFilterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="搜索姓名或学号..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer min-w-[120px]"
            >
              <option value="">全部院系</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Grade Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer min-w-[100px]"
            >
              <option value="">全部年级</option>
              {grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer min-w-[110px]"
            >
              <option value="">全部类型</option>
              <option value="join">入社申请</option>
              <option value="event">活动报名</option>
            </select>

            {/* Reset Filters */}
            {(search || statusFilter !== 'all' || departmentFilter || gradeFilter || typeFilter) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置
              </button>
            )}

            <Button variant="ghost" size="sm" onClick={fetchRegistrations}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Error */}
          {errorAll && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {errorAll}
            </div>
          )}

          {/* Batch Action Bar */}
          {selectedRegIds.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm flex items-center justify-between">
              <span>已选择 <strong>{selectedRegIds.size}</strong> 条</span>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={handleBatchApprove} loading={batchApproving}>
                  <UserCheck className="w-3.5 h-3.5" />
                  批量通过
                </Button>
                <Button variant="danger" size="sm" onClick={handleBatchReject} loading={batchApproving}>
                  <UserX className="w-3.5 h-3.5" />
                  批量拒绝
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleBatchDelete(selectedRegIds, () => setSelectedRegIds(new Set()), batchDeleteRegistrations, `已删除 ${selectedRegIds.size} 条记录`, fetchRegistrations)} loading={batchDeleting}>
                  <Trash2 className="w-3.5 h-3.5" />
                  批量删除
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRegIds(new Set())}>取消选择</Button>
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
                      <button onClick={() => toggleSelectAll(registrations, selectedRegIds, setSelectedRegIds)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        {selectedRegIds.size === registrations.length && registrations.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-primary-500" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">姓名</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">学号</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">院系</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">年级</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">类型</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">时间</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">状态</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {loadingAll ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 10 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : registrations.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-16 text-center">
                        <div className="text-gray-400 text-sm">暂无成员数据</div>
                      </td>
                    </tr>
                  ) : (
                    registrations.flatMap((item) => {
                      const isExpanded = expandedId === item.id;
                      return [
                        <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                          <td className="px-3 py-4">
                            <button onClick={() => toggleSelect(item.id, selectedRegIds, setSelectedRegIds)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                              {selectedRegIds.has(item.id) ? (
                                <CheckSquare className="w-4 h-4 text-primary-500" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">#{item.id}</td>
                          <td className="px-5 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.name}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{item.student_id || '-'}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs max-w-[100px] truncate">{item.department || '-'}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{item.grade || '-'}</td>
                          <td className="px-5 py-4 text-xs">{getTypeLabel(item.registration_type)}</td>
                          <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{formatDate(item.created_at)}</td>
                          <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>,
                        isExpanded && (
                          <tr key={`${item.id}-detail`} className="bg-gray-50 dark:bg-gray-800/30">
                            <td colSpan={10} className="px-5 py-4">
                              {editingRegId === item.id ? (
                                /* Edit Mode */
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">姓名</label>
                                      <input
                                        type="text"
                                        value={regEditForm.name}
                                        onChange={(e) => setRegEditForm({ ...regEditForm, name: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">昵称</label>
                                      <input
                                        type="text"
                                        value={regEditForm.nickname}
                                        onChange={(e) => setRegEditForm({ ...regEditForm, nickname: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                      />
                                    </div>
                                    <div>
(some characters truncated)...
900 dark:text-white">{item.major || '-'}</span></div>
                                    <div><span className="text-gray-500 dark:text-gray-400">班级：</span><span className="text-gray-900 dark:text-white">{item.class_name || '-'}</span></div>
                                    <div><span className="text-gray-500 dark:text-gray-400">导员：</span><span className="text-gray-900 dark:text-white">{item.advisor || '-'}</span></div>
                                    <div><span className="text-gray-500 dark:text-gray-400">年级：</span><span className="text-gray-900 dark:text-white">{item.grade || '-'}</span></div>
                                    <div><span className="text-gray-500 dark:text-gray-400">类型：</span><span className="text-gray-900 dark:text-white">{getTypeLabel(item.registration_type)}</span></div>
                                    <div><span className="text-gray-500 dark:text-gray-400">关联活动：</span><span className="text-gray-900 dark:text-white">{item.event_title || '-'}</span></div>
                                    <div><span className="text-gray-500 dark:text-gray-400">状态：</span>{getStatusBadge(item.status)}</div>
                                    <div><span className="text-gray-500 dark:text-gray-400">报名时间：</span><span className="text-gray-900 dark:text-white">{formatDate(item.created_at)}</span></div>
                                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                                      <span className="text-gray-500 dark:text-gray-400">自我介绍：</span>
                                      <span className="text-gray-900 dark:text-white">{item.reason || '-'}</span>
                                    </div>
                                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                                      <span className="text-gray-500 dark:text-gray-400">兴趣点：</span>
                                      <span className="text-gray-900 dark:text-white">{item.interests || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">账号：</span>
                                      {item.account_username ? (
                                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                          <Shield className="w-3 h-3" />
                                          {item.account_username}
                                        </span>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleCreateAccount(item.id)}
                                          className="text-xs"
                                        >
                                          <UserPlus className="w-3 h-3" /> 创建账号
                                        </Button>
                                      )}
                                    </div>
                                    {item.account_user_id && (
                                      <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                                        <span className="text-gray-500 dark:text-gray-400">密码管理：</span>
                                        {resetPwdRegId === item.id ? (
                                          <span className="inline-flex items-center gap-2">
                                            <input
                                              type={showResetPwd ? 'text' : 'password'}
                                              value={resetPwdValue}
                                              onChange={(e) => setResetPwdValue(e.target.value)}
                                              placeholder="输入新密码"
                                              className="w-40 px-3 py-1 text-sm border border-amber-300 dark:border-amber-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => setShowResetPwd(!showResetPwd)}
                                              className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                              {showResetPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                            <Button
                                              size="sm"
                                              variant="primary"
                                              onClick={() => handleResetRegPassword(item.account_user_id!)}
                                              loading={resettingPwd}
                                              className="text-xs"
                                            >
                                              确认重置
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => { setResetPwdRegId(null); setResetPwdValue(''); setShowResetPwd(false); }}
                                              className="text-xs"
                                            >
                                              取消
                                            </Button>
                                          </span>
                                        ) : (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setResetPwdRegId(item.id)}
                                            className="text-xs"
                                          >
                                            <Key className="w-3 h-3" /> 重置密码
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {/* Quick actions */}
                                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">快捷操作：</span>
                                    <Button size="sm" variant="outline" onClick={() => startEditReg(item)}>
                                      <Edit3 className="w-3.5 h-3.5" />
                                      编辑信息
                                    </Button>
                                    {item.status === 'pending' && (
                                      <>
                                        <Button size="sm" variant="primary" onClick={() => handleStatusUpdate(item.id, 'approved')}>通过</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(item.id, 'rejected')}>拒绝</Button>
                                      </>
                                    )}
                                    {item.status === 'approved' && (
                                      <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(item.id, 'checked_in')}>标记签到</Button>
                                    )}
                                    {item.status === 'rejected' && (
                                      <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(item.id, 'pending')}>重新审核</Button>
                                    )}
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        ),
                      ].filter(Boolean);
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">共 {total} 条，第 {page}/{totalPages} 页</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2">{page}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== WEBSITE USERS TAB ==================== */}
      {activeTab === 'users' && (
        <>
          {/* Search */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                placeholder="搜索用户名、姓名、学号..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={fetchUsers}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Error */}
          {errorUsers && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {errorUsers}
            </div>
          )}

          {/* Batch Action Bar */}
          {selectedUserIds.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm flex items-center justify-between">
              <span>已选择 <strong>{selectedUserIds.size}</strong> 个</span>
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={() => handleBatchDelete(selectedUserIds, () => setSelectedUserIds(new Set()), batchDeleteUsers, `已删除 ${selectedUserIds.size} 个用户`, fetchUsers)} loading={batchDeleting}>
                  <Trash2 className="w-3.5 h-3.5" />
                  批量删除
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUserIds(new Set())}>取消选择</Button>
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
                      <button onClick={() => toggleSelectAll(websiteUsers, selectedUserIds, setSelectedUserIds)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        {selectedUserIds.size === websiteUsers.length && websiteUsers.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-primary-500" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">用户名</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">姓名</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">学号</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">院系</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">年级</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">注册时间</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {loadingUsers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : websiteUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-16 text-center">
                        <div className="text-gray-400 text-sm">暂无注册用户</div>
                      </td>
                    </tr>
                  ) : (
                    websiteUsers.flatMap((u) => {
                      const isExpanded = expandedUserId === u.id;
                      const isEditing = editingUser?.id === u.id;
                      return [
                        <tr key={u.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                          <td className="px-3 py-4">
                            <button onClick={() => toggleSelect(u.id, selectedUserIds, setSelectedUserIds)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                              {selectedUserIds.has(u.id) ? (
                                <CheckSquare className="w-4 h-4 text-primary-500" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">#{u.id}</td>
                          <td className="px-5 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">@{u.username}</td>
                          <td className="px-5 py-4 text-gray-900 dark:text-white whitespace-nowrap">{u.name || '-'}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{u.student_id || '-'}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{u.department || '-'}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{u.grade || '-'}</td>
                          <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{formatDate(u.created_at)}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isEditing ? (
                                <button
                                  onClick={cancelUserEdit}
                                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openUserEdit(u)}
                                  className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>,
                        isExpanded && isEditing && (
                          <tr key={`${u.id}-edit`} className="bg-blue-50/50 dark:bg-blue-900/10">
                            <td colSpan={9} className="px-5 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">用户名（账号）</label>
                                  <input
                                    type="text"
                                    value={userEditForm.username}
                                    onChange={(e) => setUserEditForm({ ...userEditForm, username: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">姓名</label>
                                  <input
                                    type="text"
                                    value={userEditForm.name}
                                    onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
(some characters truncated)...
 onChange={(e) => { setClubMemberDeptFilter(e.target.value); setClubMemberPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer min-w-[120px]"
            >
              <option value="">全部院系</option>
              {clubMemberDepts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={clubMemberGradeFilter}
              onChange={(e) => { setClubMemberGradeFilter(e.target.value); setClubMemberPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer min-w-[100px]"
            >
              <option value="">全部年级</option>
              {clubMemberGrades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <Button variant="ghost" size="sm" onClick={fetchClubMembersData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {errorClubMembers && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {errorClubMembers}
            </div>
          )}

          {/* Batch Action Bar */}
          {selectedClubIds.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm flex items-center justify-between">
              <span>已选择 <strong>{selectedClubIds.size}</strong> 位</span>
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={() => handleBatchDelete(selectedClubIds, () => setSelectedClubIds(new Set()), batchDeleteClubMembers, `已删除 ${selectedClubIds.size} 位成员`, fetchClubMembersData)} loading={batchDeleting}>
                  <Trash2 className="w-3.5 h-3.5" />
                  批量删除
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedClubIds(new Set())}>取消选择</Button>
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
                      <button onClick={() => toggleSelectAll(clubMembers, selectedClubIds, setSelectedClubIds)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                        {selectedClubIds.size === clubMembers.length && clubMembers.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-primary-500" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">姓名</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">学号</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">院系</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">年级</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">导员</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">角色</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">账号</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">加入时间</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {loadingClubMembers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 11 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : clubMembers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-5 py-16 text-center">
                        <div className="text-gray-400 text-sm">暂无社团成员</div>
                        <p className="text-xs text-gray-500 mt-1">审核通过入社申请后，成员将自动出现在此处</p>
                      </td>
                    </tr>
                  ) : (
                    clubMembers.flatMap((m) => {
                      const isExpanded = expandedClubMemberId === m.id;
                      const isEditing = editingClubMemberId === m.id;
                      return [
                        <tr key={m.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                          <td className="px-3 py-4">
                            <button onClick={() => toggleSelect(m.id, selectedClubIds, setSelectedClubIds)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                              {selectedClubIds.has(m.id) ? (
                                <CheckSquare className="w-4 h-4 text-primary-500" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">#{m.id}</td>
                          <td className="px-5 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{m.name}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{m.student_id || '-'}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{m.department || '-'}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{m.grade || '-'}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{m.advisor || '-'}</td>
                          <td className="px-5 py-4 text-xs">{m.role || '成员'}</td>
                          <td className="px-5 py-4 text-xs">
                            {m.account_username ? (
                              <span className="text-green-600 dark:text-green-400">@{m.account_username}</span>
                            ) : (
                              <span className="text-gray-400">未绑定</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{formatDate(m.join_date)}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => isExpanded ? cancelClubMemberEdit() : openClubMemberEdit(m)}
                                className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500"
                                title={isEditing ? '取消编辑' : '编辑'}
                              >
                                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteClubMember(m.id)}
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>,
                        isExpanded && isEditing && (
                          <tr key={`${m.id}-edit`} className="bg-blue-50/50 dark:bg-blue-900/10">
                            <td colSpan={11} className="px-5 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">姓名</label>
                                  <input
                                    type="text"
                                    value={clubMemberEditForm.name}
                                    onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, name: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">学号</label>
                                  <input
                                    type="text"
                                    value={clubMemberEditForm.student_id}
                                    onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, student_id: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">手机</label>
                                  <input
                                    type="text"
                                    value={clubMemberEditForm.phone}
                                    onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, phone: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">邮箱</label>
                                  <input
                                    type="email"
                                    value={clubMemberEditForm.email}
                                    onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, email: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">院系</label>
                                  <input
                                    type="text"
                                    value={clubMemberEditForm.department}
                                    onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, department: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">年级</label>
                                  <input
                                    type="text"
                                    value={clubMemberEditForm.grade}
                                    onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, grade: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">导员</label>
                                  <input
                                    type="text"
                                    value={clubMemberEditForm.advisor}
                                    onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, advisor: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">角色</label>
                                  <input
                                    type="text"
                                    value={clubMemberEditForm.role}
                                    onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, role: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="如：成员、部长"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">状态</label>
                                  <select
                                    value={clubMemberEditForm.status}
                                    onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, status: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                  >
                                    <option value="active">活跃</option>
                                    <option value="inactive">非活跃</option>
                                    <option value="graduated">已毕业</option>
                                  </select>
                                </div>
                                {/* Account & Password Section */}
                                <div className="sm:col-span-2 lg:col-span-3 border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
                                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    <Key className="w-3 h-3 inline mr-1" />
                                    账号管理
                                  </label>
                                  {m.user_id ? (
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span className="text-sm text-green-600 dark:text-green-400">
                                        <Shield className="w-3 h-3 inline mr-1" />已绑定账号：@{m.account_username}
                                      </span>
                                      <div className="relative">
                                        <input
                                          type={showClubMemberPwd ? 'text' : 'password'}
                                          value={clubMemberEditForm.new_password}
                                          onChange={(e) => setClubMemberEditForm({ ...clubMemberEditForm, new_password: e.target.value })}
                                          placeholder="输入新密码以重置"
                                          className="w-48 px-3 py-1.5 pr-9 border border-amber-300 dark:border-amber-700 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setShowClubMemberPwd(!showClubMemberPwd)}
                                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                        >
                                          {showClubMemberPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCreateClubMemberAccount(m)}
                                      loading={clubMemberCreatingAccount === m.id}
                                      className="text-xs"
                                    >
                                      <UserPlus className="w-3 h-3" /> 创建账号
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {/* Action buttons */}
                              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <Button variant="primary" size="sm" onClick={() => handleSaveClubMember(m)} loading={savingClubMember}>
                                  <Save className="w-3.5 h-3.5" />
                                  保存修改
                                </Button>
                                <Button variant="outline" size="sm" onClick={cancelClubMemberEdit}>
                                  <X className="w-3.5 h-3.5" />
                                  取消
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ),
                      ].filter(Boolean);
                    })
                  )}
                </tbody>
              </table>
            </div>

            {clubMemberTotal > PAGE_SIZE && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  共 {clubMemberTotal} 条，第 {clubMemberPage}/{Math.max(1, Math.ceil(clubMemberTotal / PAGE_SIZE))} 页
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={clubMemberPage <= 1} onClick={() => setClubMemberPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2">{clubMemberPage}</span>
                  <Button variant="outline" size="sm" disabled={clubMemberPage >= Math.ceil(clubMemberTotal / PAGE_SIZE)} onClick={() => setClubMemberPage((p) => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== CORE MEMBERS TAB ==================== */}
      {activeTab === 'core' && (
        <>
          {/* Add Button */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">管理社团核心成员（展示在"关于我们"页面）</p>
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              添加核心成员
            </Button>
          </div>

          {/* Error */}
          {errorCore && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {errorCore}
            </div>
          )}

          {/* Batch Action Bar */}
          {selectedCoreIds.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm flex items-center justify-between">
              <span>已选择 <strong>{selectedCoreIds.size}</strong> 位</span>
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={() => handleBatchDelete(selectedCoreIds, () => setSelectedCoreIds(new Set()), batchDeleteCoreMembers, `已删除 ${selectedCoreIds.size} 位核心成员`, fetchCoreMembers)} loading={batchDeleting}>
                  <Trash2 className="w-3.5 h-3.5" />
                  批量删除
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCoreIds(new Set())}>取消选择</Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => toggleSelectAll(coreMembers, selectedCoreIds, setSelectedCoreIds)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              {selectedCoreIds.size === coreMembers.length && coreMembers.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-primary-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              全选
            </button>
          </div>

          {/* Core Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingCore ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-24" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-32" />
                    </div>
                  </div>
                </div>
              ))
            ) : coreMembers.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-400 text-sm">
                暂无核心成员，点击上方按钮添加
              </div>
            ) : (
              coreMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button onClick={() => toggleSelect(member.id, selectedCoreIds, setSelectedCoreIds)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0 mt-1">
                      {selectedCoreIds.has(member.id) ? (
                        <CheckSquare className="w-4 h-4 text-primary-500" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-lg font-bold flex-shrink-0 overflow-hidden">
                      {member.user_avatar || member.avatar ? (
                        <img src={member.user_avatar || member.avatar} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</h3>
                      <p className="text-sm text-primary-600 dark:text-primary-400">{member.role || '未设置角色'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{member.department || '未设置部门'}</p>
                      {member.bio && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">{member.bio}</p>
                      )}
                      <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">排序: {member.sort_order}</div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-500"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ==================== Core Member Modal ==================== */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingMember ? '编辑核心成员' : '添加核心成员'}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名 *</label>
            {editingMember ? (
              <input
                type="text"
                value={formData.name}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none"
              />
            ) : (
              <>
                <select
                  value={selectedMemberId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedMemberId(id);
                    const member = approvedMembers.find((m) => m.id === id);
                    if (member) {
                      setFormData({
                        ...formData,
                        name: member.name,
                        department: member.department || '',
                        user_id: member.user_id || null,
                      });
                    } else {
                      setFormData({ ...formData, name: '', department: '', user_id: null });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
                >
                  <option value="">请选择社团成员</option>
                  {approvedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.department || '未填写院系'} ({m.grade || '-'})
                    </option>
                  ))}
                </select>
                {approvedMembers.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">暂无可选的已通过成员</p>
                )}
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">角色/职位</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="如：社长、技术部部长"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">部门</label>
            <input
              type="text"
              value={formData.department}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none"
              placeholder="选择成员后自动填充"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">头像</label>
            <input
              type="text"
              value={formData.user_id ? '来自关联账号头像' : '未关联账号'}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">个人简介</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              placeholder="可选，简短的个人介绍"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">排序</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="数字越小越靠前"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              <X className="w-4 h-4" />
              取消
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
