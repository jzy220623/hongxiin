import { create } from 'zustand';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string;
  student_id: string;
  phone: string;
  department: string;
  grade: string;
  avatar: string;
  security_question: string;
  created_at: string;
}

interface UserState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  updateUser: (user: UserInfo) => void;
}

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_token');
  }
  return null;
};

const getInitialUser = (): UserInfo | null => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('user_info');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const useUserStore = create<UserState>((set) => ({
  token: getInitialToken(),
  user: getInitialUser(),
  isAuthenticated: !!getInitialToken(),
  login: (token: string, user: UserInfo) => {
    localStorage.setItem('user_token', token);
    const { avatar, ...userWithoutAvatar } = user;
    localStorage.setItem('user_info', JSON.stringify(userWithoutAvatar));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    set({ token: null, user: null, isAuthenticated: false });
  },
  updateUser: (user: UserInfo) => {
    const { avatar, ...userWithoutAvatar } = user;
    localStorage.setItem('user_info', JSON.stringify(userWithoutAvatar));
    set({ user });
  },
}));