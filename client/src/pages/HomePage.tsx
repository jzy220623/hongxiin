import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu, Trophy, Users, BookOpen, Calendar, ArrowRight, ChevronDown,
  Zap, Award, Microscope, GraduationCap, Globe, Code, Star,
} from 'lucide-react';
import { getEvents, getAchievements, getNews } from '../api';
import { formatDate } from '../utils/helpers';

const toAssetUrl = (value?: string) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return value.startsWith('/') ? value : `/${value}`;
};
const DEFAULT_COVER_IMAGE = '/images/logo2.png';
const resolveImageUrl = (value?: string) => toAssetUrl(value) || DEFAULT_COVER_IMAGE;

const fadeUpVariant = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.38, 0, 0, 1] },
  }),
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.2, duration: 0.8, ease: [0.38, 0, 0, 1] },
  }),
};

const reasons = [
  {
    icon: Zap,
    title: '硬核竞赛',
    subtitle: 'Marvellous Competition',
    desc: '覆盖集成电路设计、FPGA、嵌入式系统等多项国家级A类赛事，提供专业备赛指导与资源支持',
    stat: '10+',
    statLabel: '赛事覆盖',
  },
  {
    icon: Trophy,
    title: '卓越战绩',
    subtitle: 'Dominate Leader',
    desc: '累计斩获国家级奖项50+项，省级奖项100+项，连续三年获评校五星级社团',
    stat: '50+',
    statLabel: '国家级奖项',
  },
  {
    icon: Microscope,
    title: '前沿技术',
    subtitle: 'Advanced Technology',
    desc: '拥有完善的芯片设计EDA工具链、FPGA开发板及测试设备，与多家半导体企业建立合作',
    stat: '500+',
    statLabel: '社团成员',
  },
];

const stats = [
  { value: '500+', label: '社团成员', suffix: '', icon: Users },
  { value: '50+', label: '国家级奖项', suffix: '', icon: Award },
  { value: '10+', label: '赛事覆盖', suffix: '', icon: Calendar },
  { value: '100+', label: '技术项目', suffix: '', icon: Code },
];

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    getEvents({ pageSize: 3 }).then((res) => setEvents(res.data.events || res.data.list || [])).catch(() => {});
    getAchievements({ pageSize: 3 }).then((res) => setAchievements(res.data.achievements || res.data.list || [])).catch(() => {});
    getNews({ pageSize: 3 }).then((res) => setNews(res.data.news || res.data.list || [])).catch(() => {});
  }, []);

  return (
    <div className="bg-brand-dark">
      {/* ===== Hero Section ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(230,168,23,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-500 text-sm mb-8"
          >
            <Cpu className="w-4 h-4" />
            <span>高校最具影响力的芯片科技社团</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="num-large text-white mb-6"
          >
            <span className="text-gradient">智赛宏芯社</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-brand-light font-light max-w-3xl mx-auto mb-4 leading-relaxed"
          >
            聚焦芯片设计 · 赋能科创竞赛
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-brand-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            以赛促学、以芯会友，培养新时代集成电路领域创新人才。从芯片设计到系统应用，
            从理论探索到工程实践，智赛宏芯社为你提供全方位的成长平台。
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/join"
              className="px-8 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-500 transition-colors inline-flex items-center gap-2 group"
            >
              加入我们
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 border border-white/20 text-white/70 rounded-full hover:text-white hover:border-white/40 transition-colors"
            >
              了解更多
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
        >
          <ChevronDown className="w-6 h-6 animate-bounce-down" />
        </motion.div>
      </section>

      {/* ===== Stats Section ===== */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={statVariants}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 mb-4">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="num-large text-white mb-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
                  {stat.value}
                </div>
                <div className="text-brand-muted text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3 Reasons Section ===== */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="section-divider mb-6" />
            <h2 className="section-title text-white mb-4">
              3 个理由<br />选择智赛宏芯社
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto">
              我们不只是竞赛社团，更是你通往芯片世界的桥梁
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                className="glass-light rounded-3xl p-8 text-center group hover:border-primary-500/20 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 mb-6 group-hover:scale-110 transition-transform">
                  <reason.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{reason.title}</h3>
                <p className="text-primary-500 text-sm font-medium mb-4">{reason.subtitle}</p>
                <p className="text-brand-muted text-sm leading-relaxed mb-6">{reason.desc}</p>
                <div className="pt-4 border-t border-white/10">
                  <div className="num-large text-white" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)' }}>
                    {reason.stat}
                  </div>
                  <div className="text-brand-muted text-xs mt-1">{reason.statLabel}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Featured Events Section ===== */}
      {events.length > 0 && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="section-divider mb-6 ml-0" />
                <h2 className="section-title text-white">赛事活动</h2>
                <p className="text-brand-muted mt-2">探索前沿芯片竞赛，挑战技术极限</p>
              </motion.div>
              <Link
                to="/events"
                className="hidden sm:inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors text-sm group"
              >
                查看全部赛事
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUpVariant}
                >
                  <Link to={`/events/${event.id}`} className="block group">
                    <div className="relative overflow-hidden rounded-2xl bg-brand-card border border-white/5 card-hover">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={resolveImageUrl(event.cover_image || event.image_url)}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
                      </div>
                      <div className="p-6">
                        <div className="inline-block px-2 py-0.5 rounded bg-primary-500/10 text-primary-500 text-xs mb-3">
                          {event.event_date ? formatDate(event.event_date) : '即将举办'}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-500 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-brand-muted text-sm line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-primary-500 text-sm"
              >
                查看全部赛事 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== Featured Achievements Section ===== */}
      {achievements.length > 0 && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="section-divider mb-6 ml-0" />
                <h2 className="section-title text-white">获奖成果</h2>
                <p className="text-brand-muted mt-2">用实力说话，用荣誉证明</p>
              </motion.div>
              <Link
                to="/achievements"
                className="hidden sm:inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors text-sm group"
              >
                查看全部成果
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {achievements.map((item, i) => (
                <motion.div
                  key={item.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUpVariant}
                  className="glass-light rounded-2xl p-6 card-hover relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-bl-full -mr-4 -mt-4" />
                  <div className="relative">
                    <span className="num-badge mb-4">{String(i + 1).padStart(2, '0')}</span>
                    <div className="inline-block px-2 py-0.5 rounded bg-primary-500/10 text-primary-500 text-xs mb-3 ml-2">
                      {item.level || item.competition}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-brand-muted text-sm line-clamp-2">{item.description}</p>
                    <div className="mt-4 h-40 rounded-xl overflow-hidden">
                      <img
                        src={resolveImageUrl(item.image || item.image_url)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link to="/achievements" className="inline-flex items-center gap-2 text-primary-500 text-sm">
                查看全部成果 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== Latest News Section ===== */}
      {news.length > 0 && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="section-divider mb-6 ml-0" />
                <h2 className="section-title text-white">新闻动态</h2>
                <p className="text-brand-muted mt-2">关注社团最新动态与技术前沿</p>
              </motion.div>
              <Link
                to="/news"
                className="hidden sm:inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors text-sm group"
              >
                查看全部新闻
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item, i) => (
                <motion.div
                  key={item.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUpVariant}
                >
                  <Link to={`/news/${item.id}`} className="block group">
                    <div className="glass-light rounded-2xl overflow-hidden card-hover">
                      <div className="h-44 overflow-hidden">
                        <img
                          src={resolveImageUrl(item.cover_image || item.image_url)}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-brand-muted text-xs mb-3">{item.created_at ? formatDate(item.created_at) : ''}</div>
                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary-500 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-brand-muted text-sm line-clamp-2">{item.summary || item.content}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link to="/news" className="inline-flex items-center gap-2 text-primary-500 text-sm">
                查看全部新闻 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA Section ===== */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Cpu className="w-12 h-12 text-primary-500 mx-auto mb-6" />
            <h2 className="section-title text-white mb-4">
              准备好加入我们了吗？
            </h2>
            <p className="text-brand-light text-lg mb-8 max-w-xl mx-auto">
              无论你是芯片设计高手还是刚刚入门的新人，
              智赛宏芯社都欢迎你的加入。一起探索集成电路的无限可能。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/join"
                className="px-8 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-500 transition-colors inline-flex items-center gap-2 group"
              >
                立即报名
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3 border border-white/20 text-white/70 rounded-full hover:text-white hover:border-white/40 transition-colors"
              >
                联系我们
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}