import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

const footerLinks = [
  {
    title: '社团导航',
    links: [
      { label: '社团介绍', to: '/about' },
      { label: '核心成员', to: '/about#members' },
      { label: '社团荣誉', to: '/honor-wall' },
    ],
  },
  {
    title: '赛事资源',
    links: [
      { label: '赛事活动', to: '/events' },
      { label: '获奖成果', to: '/achievements' },
      { label: '新闻动态', to: '/news' },
    ],
  },
  {
    title: '加入我们',
    links: [
      { label: '入社申请', to: '/join' },
      { label: '留言互动', to: '/contact' },
      { label: '注册账号', to: '/register' },
      { label: '个人中心', to: '/profile' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-brand-darker border-t border-white/5">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <Cpu className="w-7 h-7 text-primary-500" />
              <span className="text-xl font-bold tracking-wider text-white">智赛宏芯社</span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed mb-6 max-w-sm">
              聚焦芯片设计与科创竞赛，培养新时代集成电路领域创新人才。
              以赛促学、以芯会友，打造高校最具影响力的科技社团。
            </p>
            <div className="space-y-3 text-sm text-brand-light">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                <span>XX大学集成电路学院 / 科技楼B座201室</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-500 shrink-0" />
                <span>010-XXXX-XXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-500 shrink-0" />
                <span>club@zhisaihongxin.com</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-primary-500 text-sm font-medium mb-5 tracking-wide">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-brand-muted hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300">
                        <ChevronRight className="w-3 h-3" />
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
            <span> 2024 智赛宏芯社. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <span>基于 React + Express 构建</span>
              <span>Designed with passion</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}