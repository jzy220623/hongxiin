import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { Cpu, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/about', label: '社团介绍' },
  { to: '/events', label: '赛事活动' },
  { to: '/achievements', label: '获奖成果' },
  { to: '/honor-wall', label: '荣誉墙' },
  { to: '/news', label: '新闻动态' },
  { to: '/join', label: '加入我们' },
  { to: '/contact', label: '留言互动' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useUserStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm tracking-wide transition-colors duration-300 ${
      isActive
        ? 'text-primary-500'
        : 'text-white/60 hover:text-white'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-6 py-4 text-lg font-light tracking-wider transition-colors ${
      isActive
        ? 'text-primary-500 bg-primary-500/5'
        : 'text-white/60 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-2' : 'py-3'
        }`}
      >
        <div
          className={`mx-auto transition-all duration-500 ${
            scrolled
              ? 'max-w-5xl px-4 py-2 rounded-full glass'
              : 'max-w-7xl px-6 lg:px-8 py-3'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <Cpu className="w-7 h-7 text-primary-500 transition-transform group-hover:rotate-12" />
              <span className="text-lg font-bold tracking-wider text-white">
                智赛宏芯社
              </span>
            </NavLink>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* User area */}
              {isAuthenticated && user ? (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 text-xs font-bold">
                      {user.name ? user.name.charAt(0) : user.username.charAt(0)}
                    </div>
                    <span className="max-w-[80px] truncate">{user.name || user.username}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-brand-darker border border-brand-border rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5"
                        >
                          <User className="w-4 h-4" />
                          个人中心
                        </Link>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm text-white/60 hover:text-white transition-colors tracking-wide"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-full hover:bg-primary-500 transition-colors tracking-wide"
                  >
                    注册
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
                aria-label="菜单"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-lg lg:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-1 pt-16">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={mobileLinkClass}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-8 flex flex-col items-center gap-3 w-full px-6">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 text-white/80 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 text-sm font-bold">
                      {user?.name ? user.name.charAt(0) : user?.username?.charAt(0)}
                    </div>
                    <span>{user?.name || user?.username}</span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-3 text-center text-sm text-white/70 border border-white/10 rounded-full hover:bg-white/5"
                  >
                    个人中心
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); navigate('/'); }}
                    className="w-full py-3 text-center text-sm text-red-400 border border-red-400/20 rounded-full hover:bg-red-400/5"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-3 text-center text-sm text-white/70 border border-white/10 rounded-full hover:bg-white/5"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-3 text-center text-sm font-medium bg-primary-600 text-white rounded-full hover:bg-primary-500"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}